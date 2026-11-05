import {
  Transaction,
  TransactionCategory,
  TransactionMode,
  FinancialSummary,
  CategorySummary,
  ClassificationMethod,
} from '../types';
import { heuristicClassifier } from './heuristics';
import { traditionalMLClassifier } from './traditional-ml';

export function detectTransactionMode(text: string): TransactionMode {
  const upper = text.toUpperCase();
  if (/\bUPI\b/.test(upper)) return 'UPI';
  if (/\bNEFT\b/.test(upper)) return 'NEFT';
  if (/\bIMPS\b/.test(upper)) return 'IMPS';
  if (/\bRTGS\b/.test(upper)) return 'RTGS';
  if (/\bPOS\b|\bCARD\b|\bSWIPE\b/.test(upper)) return 'POS';
  if (/\bATM\b|\bNFS\*ATM\b|\bCASH WDL\b/.test(upper)) return 'ATM';
  if (/\bCHQ\b|\bCHEQUE\b|\bCLEARING\b/.test(upper)) return 'CHEQUE';
  if (/\bACH\b|\bNACH\b|\bECS\b/.test(upper)) return 'ACH/NACH';
  if (/\bINT\b|\bINTEREST\b/.test(upper)) return 'INTEREST';
  if (/\bCHG\b|\bCHARGES\b|\bFEE\b|\bTAX\b|\bGST\b/.test(upper)) return 'CHARGES';
  if (/\bSALARY\b|\bSAL CR\b|\bPAYROLL\b/.test(upper)) return 'SALARY';
  if (/\bTRF\b|\bTRANSFER\b/.test(upper)) return 'TRANSFER';
  return 'OTHER';
}

export function classifyTransaction(
  id: string,
  date: string,
  rawDescription: string,
  debit: number | null,
  credit: number | null,
  balance: number,
  modeHint?: TransactionMode,
  referenceNumber?: string
): Transaction {
  const mode = modeHint || detectTransactionMode(rawDescription);
  const cleanDescription = rawDescription
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Run Traditional ML first to obtain feature probability distribution
  const mlResult = traditionalMLClassifier.predict(cleanDescription);

  // 2. Run Heuristic Rule-Based Approach
  const heuristicMatch = heuristicClassifier.classify(
    cleanDescription,
    debit,
    credit,
    mode
  );

  let category: TransactionCategory;
  let classificationMethod: ClassificationMethod;
  let confidenceScore: number;
  let ruleExplanation: string | undefined;

  if (heuristicMatch && heuristicMatch.confidence >= 0.85) {
    category = heuristicMatch.category;
    classificationMethod = 'HEURISTIC';
    confidenceScore = Math.round(heuristicMatch.confidence * 100);
    ruleExplanation = `[${heuristicMatch.ruleName}] ${heuristicMatch.explanation}`;
  } else {
    category = mlResult.category;
    classificationMethod = 'TRADITIONAL_ML';
    confidenceScore = Math.round(mlResult.confidence * 100);
    ruleExplanation = `Classified by Naive Bayes TF-IDF Classifier (Tokens: ${mlResult.tokens.slice(0, 4).join(', ')})`;
  }

  return {
    id,
    date,
    description: rawDescription,
    cleanDescription,
    debit: debit ? Math.round(debit * 100) / 100 : null,
    credit: credit ? Math.round(credit * 100) / 100 : null,
    balance: Math.round(balance * 100) / 100,
    mode,
    referenceNumber,
    category,
    classificationMethod,
    confidenceScore,
    ruleExplanation,
    topMlPredictions: mlResult.probabilities.slice(0, 4),
    isAnomaly: false,
  };
}

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  'Salary & Income': '#10b981', // green
  'Food & Dining': '#f97316', // orange
  'Groceries & Supermarket': '#84cc16', // lime
  'Shopping & E-Commerce': '#06b6d4', // cyan
  'Utilities & Bills': '#eab308', // amber
  'Travel & Transportation': '#6366f1', // indigo
  'Health & Medical': '#ec4899', // pink
  'Entertainment & Subscriptions': '#8b5cf6', // purple
  'Investments & Financial Services': '#3b82f6', // blue
  'Peer-to-Peer & Transfers': '#14b8a6', // teal
  'Cash & ATM': '#64748b', // slate
  'Bank Charges & Interest': '#ef4444', // red
  'Rent & Maintenance': '#d97706', // yellow-orange
  'Education & Learning': '#a855f7', // violet
  'Miscellaneous': '#94a3b8', // gray
};

export function computeFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalDebits = 0;
  let totalCredits = 0;
  const categoryDebits = new Map<TransactionCategory, { debit: number; credit: number; count: number }>();

  // Track duplicates for anomaly detection
  const seenDebits = new Map<string, number>();

  for (const txn of transactions) {
    if (txn.debit && txn.debit > 0) {
      totalDebits += txn.debit;
      const key = `${txn.date}_${txn.debit}`;
      seenDebits.set(key, (seenDebits.get(key) || 0) + 1);
    }
    if (txn.credit && txn.credit > 0) {
      totalCredits += txn.credit;
    }

    const current = categoryDebits.get(txn.category) || { debit: 0, credit: 0, count: 0 };
    current.debit += txn.debit || 0;
    current.credit += txn.credit || 0;
    current.count += 1;
    categoryDebits.set(txn.category, current);
  }

  const averageDebit = transactions.filter(t => t.debit && t.debit > 0).length > 0
    ? totalDebits / transactions.filter(t => t.debit && t.debit > 0).length
    : 0;

  // Mark anomalies
  let anomalyCount = 0;
  for (const txn of transactions) {
    if (txn.debit && txn.debit > 0) {
      const key = `${txn.date}_${txn.debit}`;
      if ((seenDebits.get(key) || 0) > 1) {
        txn.isAnomaly = true;
        txn.anomalyReason = `Duplicate debit amount (₹${txn.debit}) on same date.`;
        anomalyCount++;
      } else if (txn.debit > 50000 || (averageDebit > 0 && txn.debit > averageDebit * 4)) {
        txn.isAnomaly = true;
        txn.anomalyReason = `High-value outlier (₹${txn.debit.toLocaleString('en-IN')}) exceeding regular baseline.`;
        anomalyCount++;
      }
    }
  }

  // Build category summaries
  const categoryBreakdown: CategorySummary[] = [];
  let topExpenseCategory: TransactionCategory = 'Miscellaneous';
  let maxExpense = -1;

  categoryDebits.forEach((data, cat) => {
    const percentage = totalDebits > 0 ? (data.debit / totalDebits) * 100 : 0;
    categoryBreakdown.push({
      category: cat,
      totalDebit: Math.round(data.debit * 100) / 100,
      totalCredit: Math.round(data.credit * 100) / 100,
      transactionCount: data.count,
      percentageOfExpense: Math.round(percentage * 10) / 10,
      color: CATEGORY_COLORS[cat] || '#94a3b8',
    });

    if (data.debit > maxExpense) {
      maxExpense = data.debit;
      topExpenseCategory = cat;
    }
  });

  categoryBreakdown.sort((a, b) => b.totalDebit - a.totalDebit);

  return {
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    netCashFlow: Math.round((totalCredits - totalDebits) * 100) / 100,
    totalTransactions: transactions.length,
    averageDebit: Math.round(averageDebit * 100) / 100,
    topExpenseCategory,
    categoryBreakdown,
    anomalyCount,
  };
}
