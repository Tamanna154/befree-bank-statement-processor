import { StatementProcessResult } from '../types';

export function exportStatementToCSV(data: StatementProcessResult, fileName?: string): void {
  const headers = [
    'Sl No',
    'Date',
    'Description',
    'Mode',
    'Category',
    'Classification Engine',
    'Confidence Score (%)',
    'Debit (INR)',
    'Credit (INR)',
    'Balance (INR)',
    'Reference No',
    'Rule Explanation'
  ];

  const escapeCSV = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[] = [];
  rows.push(headers.join(','));

  data.transactions.forEach((t, i) => {
    const row = [
      escapeCSV(i + 1),
      escapeCSV(t.date),
      escapeCSV(t.cleanDescription || t.description),
      escapeCSV(t.mode),
      escapeCSV(t.category),
      escapeCSV(t.classificationMethod === 'HEURISTIC' ? 'Rule-Based Heuristic' : 'Traditional ML'),
      escapeCSV(`${t.confidenceScore}%`),
      escapeCSV(t.debit !== null ? t.debit : ''),
      escapeCSV(t.credit !== null ? t.credit : ''),
      escapeCSV(t.balance),
      escapeCSV(t.referenceNumber || ''),
      escapeCSV(t.ruleExplanation || '')
    ];
    rows.push(row.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(rows.join('\r\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', fileName || `Bank_Statement_Classified_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
