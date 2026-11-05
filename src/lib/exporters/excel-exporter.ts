import * as XLSX from 'xlsx';
import { StatementProcessResult } from '../types';

export function exportStatementToExcel(data: StatementProcessResult, fileName?: string): void {
  const wb = XLSX.utils.book_new();

  // 1. Transactions Sheet
  const transactionRows = data.transactions.map((t, index) => ({
    'Sl No': index + 1,
    'Date': t.date,
    'Description': t.cleanDescription || t.description,
    'Transaction Mode': t.mode,
    'Assigned Category': t.category,
    'Classification Engine': t.classificationMethod === 'HEURISTIC' ? 'Rule-Based Heuristic' : 'Traditional ML (Naive Bayes)',
    'Confidence Score (%)': `${t.confidenceScore}%`,
    'Debit (INR)': t.debit !== null ? t.debit : '',
    'Credit (INR)': t.credit !== null ? t.credit : '',
    'Balance (INR)': t.balance,
    'Reference / UTR': t.referenceNumber || '',
    'Rule / Logic Explanation': t.ruleExplanation || '',
    'Flagged Anomaly': t.isAnomaly ? `YES: ${t.anomalyReason}` : 'NO',
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
  // Auto column widths
  wsTransactions['!cols'] = [
    { wch: 8 },  // Sl No
    { wch: 14 }, // Date
    { wch: 42 }, // Description
    { wch: 16 }, // Mode
    { wch: 28 }, // Category
    { wch: 26 }, // Engine
    { wch: 20 }, // Confidence
    { wch: 16 }, // Debit
    { wch: 16 }, // Credit
    { wch: 18 }, // Balance
    { wch: 20 }, // Reference
    { wch: 45 }, // Rule Explanation
    { wch: 25 }, // Anomaly
  ];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  // 2. Category Breakdown Sheet
  const categoryRows = data.summary.categoryBreakdown.map((c) => ({
    'Expense Category': c.category,
    'Total Debit (INR)': c.totalDebit,
    'Total Credit (INR)': c.totalCredit,
    'Transaction Count': c.transactionCount,
    'Expense Share (%)': `${c.percentageOfExpense}%`,
  }));

  const wsCategory = XLSX.utils.json_to_sheet(categoryRows);
  wsCategory['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Summary');

  // 3. Account Details Sheet
  const accountRows = [
    { Property: 'Bank Name', Value: data.accountDetails.bankName },
    { Property: 'Account Holder Name', Value: data.accountDetails.accountHolderName },
    { Property: 'Account Number', Value: data.accountDetails.accountNumber },
    { Property: 'IFSC Code', Value: data.accountDetails.ifscCode },
    { Property: 'Branch', Value: data.accountDetails.branch },
    { Property: 'Account Type', Value: data.accountDetails.accountType },
    { Property: 'Statement From', Value: data.accountDetails.statementPeriod.from },
    { Property: 'Statement To', Value: data.accountDetails.statementPeriod.to },
    { Property: 'Opening Balance (INR)', Value: data.accountDetails.openingBalance },
    { Property: 'Closing Balance (INR)', Value: data.accountDetails.closingBalance },
    { Property: 'Total Inflow / Credits (INR)', Value: data.summary.totalCredits },
    { Property: 'Total Outflow / Debits (INR)', Value: data.summary.totalDebits },
    { Property: 'Net Cash Flow (INR)', Value: data.summary.netCashFlow },
    { Property: 'Total Transactions', Value: data.summary.totalTransactions },
    { Property: 'PDF Detection Type', Value: data.pdfDetection.type },
    { Property: 'Detection Confidence', Value: `${Math.round(data.pdfDetection.confidence * 100)}%` },
    { Property: 'Pipeline Notes', Value: data.pdfDetection.details },
  ];

  const wsAccount = XLSX.utils.json_to_sheet(accountRows);
  wsAccount['!cols'] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsAccount, 'Account Overview');

  // Download
  const outputName = fileName || `Bank_Statement_Classified_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, outputName);
}
