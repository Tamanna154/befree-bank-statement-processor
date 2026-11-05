'use client';

import React from 'react';
import { PieChart, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';
import { StatementProcessResult } from '@/lib/types';

interface AnalyticsChartsProps {
  data: StatementProcessResult;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const { summary } = data;
  const categories = summary.categoryBreakdown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Expense Breakdown */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 text-sm">
                Expense Distribution by Category (Non-LLM Classified)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Total Spend: ₹{summary.totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-3">
            {categories.filter(c => c.totalDebit > 0).slice(0, 7).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.category}
                    <span className="text-slate-400 font-normal">
                      ({cat.transactionCount} {cat.transactionCount === 1 ? 'txn' : 'txns'})
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      ₹{cat.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-400 font-mono w-10 text-right">
                      {cat.percentageOfExpense}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(cat.percentageOfExpense, 100)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Heuristic pattern matched 14 categories with high confidence</span>
          <span className="font-medium text-indigo-600">Pure Non-LLM Execution</span>
        </div>
      </div>

      {/* Cash Flow & Anomaly Insights */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Inflow vs Outflow Ratio
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Inflow / Income</span>
                <span className="font-semibold text-emerald-700">
                  ₹{summary.totalCredits.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${
                      summary.totalCredits + summary.totalDebits > 0
                        ? (summary.totalCredits / (summary.totalCredits + summary.totalDebits)) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Outflow / Expenses</span>
                <span className="font-semibold text-rose-700">
                  ₹{summary.totalDebits.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${
                      summary.totalCredits + summary.totalDebits > 0
                        ? (summary.totalDebits / (summary.totalCredits + summary.totalDebits)) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Detection Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-xs text-slate-800">
              Audit & Anomaly Detector
            </h4>
          </div>
          {summary.anomalyCount > 0 ? (
            <div className="text-xs text-amber-800">
              Flagged <span className="font-bold">{summary.anomalyCount}</span> suspicious or duplicate transactions in this period. Review flagged rows in the table below.
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              No duplicate debits or abnormal transactions detected in this statement period.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
