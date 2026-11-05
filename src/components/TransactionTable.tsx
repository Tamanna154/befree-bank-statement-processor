'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  Sparkles,
  Edit2
} from 'lucide-react';
import { Transaction, TransactionCategory } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/classifiers/hybrid-classifier';

interface TransactionTableProps {
  transactions: Transaction[];
  onCategoryChange: (txnId: string, newCategory: TransactionCategory) => void;
}

const ALL_CATEGORIES: TransactionCategory[] = [
  'Salary & Income',
  'Food & Dining',
  'Groceries & Supermarket',
  'Shopping & E-Commerce',
  'Utilities & Bills',
  'Travel & Transportation',
  'Health & Medical',
  'Entertainment & Subscriptions',
  'Investments & Financial Services',
  'Peer-to-Peer & Transfers',
  'Cash & ATM',
  'Bank Charges & Interest',
  'Rent & Maintenance',
  'Education & Learning',
  'Miscellaneous',
];

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onCategoryChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'DEBIT' && t.debit !== null && t.debit > 0) ||
      (typeFilter === 'CREDIT' && t.credit !== null && t.credit > 0);

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span>Extracted & Classified Transactions</span>
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-mono">
                {filtered.length} of {transactions.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Each row classified via Non-LLM (Heuristics + TF-IDF Naive Bayes). Click category to override.
            </p>
          </div>

          {/* Type quick filter buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('DEBIT')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'DEBIT' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Debits Only
            </button>
            <button
              onClick={() => setTypeFilter('CREDIT')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'CREDIT' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Credits Only
            </button>
          </div>
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search narration, merchant, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="ALL">All Categories ({ALL_CATEGORIES.length})</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 min-w-[220px]">Narration / Merchant</th>
              <th className="py-3 px-3">Mode</th>
              <th className="py-3 px-4 min-w-[180px]">Assigned Category</th>
              <th className="py-3 px-3">Engine & Confidence</th>
              <th className="py-3 px-4 text-right">Debit (₹)</th>
              <th className="py-3 px-4 text-right">Credit (₹)</th>
              <th className="py-3 px-4 text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No transactions match your search filter.
                </td>
              </tr>
            ) : (
              filtered.map((txn) => {
                const isEditing = editingTxnId === txn.id;
                const catColor = CATEGORY_COLORS[txn.category] || '#94a3b8';

                return (
                  <tr
                    key={txn.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      txn.isAnomaly ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {txn.date}
                    </td>

                    {/* Narration */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>
                        <span>{txn.cleanDescription || txn.description}</span>
                        {txn.isAnomaly && (
                          <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {txn.anomalyReason}
                          </span>
                        )}
                        {txn.referenceNumber && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {txn.referenceNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                        {txn.mode}
                      </span>
                    </td>

                    {/* Category (Interactive Override) */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            defaultValue={txn.category}
                            autoFocus
                            onChange={(e) => {
                              onCategoryChange(txn.id, e.target.value as TransactionCategory);
                              setEditingTxnId(null);
                            }}
                            onBlur={() => setEditingTxnId(null)}
                            className="text-xs p-1 rounded-lg border border-blue-400 bg-white shadow-xs focus:outline-none"
                          >
                            {ALL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingTxnId(txn.id)}
                          title="Click to manually reclassify"
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-left transition-all hover:ring-1 hover:ring-slate-300"
                          style={{
                            backgroundColor: `${catColor}15`,
                            color: catColor,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          <span className="font-semibold text-xs">{txn.category}</span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 text-slate-500 ml-1" />
                        </button>
                      )}
                    </td>

                    {/* Engine & Confidence */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5" title={txn.ruleExplanation}>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            txn.classificationMethod === 'HEURISTIC'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : txn.classificationMethod === 'TRADITIONAL_ML'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {txn.classificationMethod === 'HEURISTIC'
                            ? 'Rule Match'
                            : txn.classificationMethod === 'TRADITIONAL_ML'
                            ? 'TF-IDF ML'
                            : 'User Override'}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-slate-600">
                          {txn.confidenceScore}%
                        </span>
                      </div>
                    </td>

                    {/* Debit */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600 whitespace-nowrap">
                      {txn.debit !== null ? `₹${txn.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>

                    {/* Credit */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                      {txn.credit !== null ? `₹${txn.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 text-right font-mono text-slate-800 whitespace-nowrap">
                      ₹{txn.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
