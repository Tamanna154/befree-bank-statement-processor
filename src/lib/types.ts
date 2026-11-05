export type TransactionCategory =
  | 'Salary & Income'
  | 'Food & Dining'
  | 'Groceries & Supermarket'
  | 'Shopping & E-Commerce'
  | 'Utilities & Bills'
  | 'Travel & Transportation'
  | 'Health & Medical'
  | 'Entertainment & Subscriptions'
  | 'Investments & Financial Services'
  | 'Peer-to-Peer & Transfers'
  | 'Cash & ATM'
  | 'Bank Charges & Interest'
  | 'Rent & Maintenance'
  | 'Education & Learning'
  | 'Miscellaneous';

export type TransactionMode =
  | 'UPI'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'POS'
  | 'ATM'
  | 'CHEQUE'
  | 'INTEREST'
  | 'CHARGES'
  | 'SALARY'
  | 'ACH/NACH'
  | 'TRANSFER'
  | 'OTHER';

export type ClassificationMethod = 'HEURISTIC' | 'TRADITIONAL_ML' | 'HYBRID' | 'MANUAL_OVERRIDE';

export interface ClassificationResult {
  category: TransactionCategory;
  confidence: number; // 0 to 1
  method: ClassificationMethod;
  ruleExplanation?: string;
  topMlPredictions?: Array<{ category: TransactionCategory; probability: number }>;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  cleanDescription: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  mode: TransactionMode;
  referenceNumber?: string;
  category: TransactionCategory;
  classificationMethod: ClassificationMethod;
  confidenceScore: number; // percentage 0 - 100
  ruleExplanation?: string;
  topMlPredictions?: Array<{ category: TransactionCategory; probability: number }>;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface AccountDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
  accountType: string;
  statementPeriod: {
    from: string;
    to: string;
  };
  openingBalance: number;
  closingBalance: number;
  currency: string;
}

export interface PDFTypeDetectionResult {
  type: 'TEXT_BASED' | 'IMAGE_BASED_SCANNED';
  confidence: number;
  extractedTextLength: number;
  pageCount: number;
  hasRasterImages: boolean;
  ocrRequired: boolean;
  details: string;
}

export interface CategorySummary {
  category: TransactionCategory;
  totalDebit: number;
  totalCredit: number;
  transactionCount: number;
  percentageOfExpense: number;
  color: string;
}

export interface FinancialSummary {
  totalDebits: number;
  totalCredits: number;
  netCashFlow: number;
  totalTransactions: number;
  averageDebit: number;
  topExpenseCategory: TransactionCategory;
  categoryBreakdown: CategorySummary[];
  anomalyCount: number;
}

export interface StatementProcessResult {
  fileName: string;
  fileSize: number;
  processedAt: string;
  pdfDetection: PDFTypeDetectionResult;
  accountDetails: AccountDetails;
  transactions: Transaction[];
  summary: FinancialSummary;
}
