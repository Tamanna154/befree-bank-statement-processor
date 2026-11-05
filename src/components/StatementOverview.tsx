'use client';

import React from 'react';
import {
  Building2,
  User,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Cpu,
  ScanText,
  FileCheck
} from 'lucide-react';
import { StatementProcessResult } from '@/lib/types';
import { exportStatementToExcel } from '@/lib/exporters/excel-exporter';
import { exportStatementToCSV } from '@/lib/exporters/csv-exporter';

interface StatementOverviewProps {
  data: StatementProcessResult;
}

export const StatementOverview: React.FC<StatementOverviewProps> = ({ data }) => {
  const isImageBased = data.pdfDetection.type === 'IMAGE_BASED_SCANNED';

  const handleExportExcel = () => {
    exportStatementToExcel(data, `${data.accountDetails.bankName.replace(/\s+/g, '_')}_Statement_${Date.now()}.xlsx`);
  };

  const handleExportCSV = () => {
    exportStatementToCSV(data, `${data.accountDetails.bankName.replace(/\s+/g, '_')}_Statement_${Date.now()}.csv`);
  };

  const handleExportJSON = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.href = jsonStr;
    link.download = `${data.accountDetails.bankName.replace(/\s+/g, '_')}_Statement_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Auto-Detection Indicator Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
          isImageBased
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isImageBased ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isImageBased ? <ScanText className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                Auto-Detected Format: {isImageBased ? 'Scanned / Image-based PDF' : 'Digital / Text-based PDF'}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-white border border-current/20">
                {Math.round(data.pdfDetection.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
              {data.pdfDetection.details}
            </p>
          </div>
        </div>

        {/* Export Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Account Metadata Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Extracted Account Metadata
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {data.accountDetails.bankName}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Account Holder</span>
            <span className="font-semibold text-slate-800 text-sm block">
              {data.accountDetails.accountHolderName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Account Number</span>
            <span className="font-semibold font-mono text-slate-800 text-sm block">
              {data.accountDetails.accountNumber}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">IFSC / Branch</span>
            <span className="font-semibold text-slate-800 block">
              {data.accountDetails.ifscCode}
            </span>
            <span className="text-slate-500 text-[11px] block truncate">
              {data.accountDetails.branch}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Statement Period</span>
            <span className="font-semibold text-slate-800 block">
              {data.accountDetails.statementPeriod.from} to {data.accountDetails.statementPeriod.to}
            </span>
            <span className="text-slate-500 text-[11px] block">
              {data.accountDetails.accountType}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inflow */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Inflow (Credits)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600">
            ₹{data.summary.totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            From {data.transactions.filter(t => t.credit && t.credit > 0).length} deposit transactions
          </span>
        </div>

        {/* Total Outflow */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Outflow (Debits)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600">
            ₹{data.summary.totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Top: {data.summary.topExpenseCategory}
          </span>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Net Cash Flow</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-bold ${
              data.summary.netCashFlow >= 0 ? 'text-blue-700' : 'text-amber-600'
            }`}
          >
            {data.summary.netCashFlow >= 0 ? '+' : ''}₹{data.summary.netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            End Balance: ₹{data.accountDetails.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Classification Engine Stats */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Non-LLM Engine Status</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-indigo-900">
            {data.summary.totalTransactions} Classified
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
            <span>Rules: {data.transactions.filter(t => t.classificationMethod === 'HEURISTIC').length}</span>
            <span>•</span>
            <span>ML: {data.transactions.filter(t => t.classificationMethod === 'TRADITIONAL_ML').length}</span>
            {data.summary.anomalyCount > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-semibold">{data.summary.anomalyCount} Flagged</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
