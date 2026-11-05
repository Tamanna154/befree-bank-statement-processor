'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { UploadSection } from '@/components/UploadSection';
import { StatementOverview } from '@/components/StatementOverview';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { TransactionTable } from '@/components/TransactionTable';
import { ClassificationPlayground } from '@/components/ClassificationPlayground';
import { ArchitectureModal } from '@/components/ArchitectureModal';
import { SAMPLE_STATEMENTS } from '@/lib/samples/sample-statements';
import { StatementProcessResult, TransactionCategory } from '@/lib/types';
import { computeFinancialSummary } from '@/lib/classifiers/hybrid-classifier';

export default function Home() {
  const [statementData, setStatementData] = useState<StatementProcessResult>(
    SAMPLE_STATEMENTS[0].data
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playgroundOpen, setPlaygroundOpen] = useState<boolean>(false);
  const [architectureOpen, setArchitectureOpen] = useState<boolean>(false);

  // Handle category manual override
  const handleCategoryChange = (txnId: string, newCategory: TransactionCategory) => {
    setStatementData((prev) => {
      const updatedTxns = prev.transactions.map((t) => {
        if (t.id === txnId) {
          return {
            ...t,
            category: newCategory,
            classificationMethod: 'MANUAL_OVERRIDE' as const,
            confidenceScore: 100,
            ruleExplanation: `User manually assigned category: ${newCategory}`,
          };
        }
        return t;
      });

      const updatedSummary = computeFinancialSummary(updatedTxns);

      return {
        ...prev,
        transactions: updatedTxns,
        summary: updatedSummary,
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onOpenPlayground={() => setPlaygroundOpen(true)}
        onOpenInfo={() => setArchitectureOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <span>Assessment Prototype</span>
            <span>•</span>
            <span>Non-LLM Classification System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bank Statement Processing & Classification System
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Enterprise prototype built according to Befree Assessment requirements. Automatically distinguishes
            digital text vs scanned PDFs, extracts financial metadata & transaction tables, and classifies narrations
            using deterministic heuristic rules and traditional Machine Learning (TF-IDF + Naive Bayes).
          </p>
        </div>

        {/* Upload & Sample Selector */}
        <UploadSection
          onProcessSuccess={setStatementData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* Statement Overview & KPIs */}
        <StatementOverview data={statementData} />

        {/* Category Analytics & Cash Flow */}
        <AnalyticsCharts data={statementData} />

        {/* Interactive Transaction Table */}
        <TransactionTable
          transactions={statementData.transactions}
          onCategoryChange={handleCategoryChange}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Befree AI & Automation Assessment — Tamanna Oza</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Tamanna154"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              GitHub: @Tamanna154
            </a>
            <span>•</span>
            <span className="text-slate-400">Deployed on Vercel</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClassificationPlayground
        isOpen={playgroundOpen}
        onClose={() => setPlaygroundOpen(false)}
      />

      <ArchitectureModal
        isOpen={architectureOpen}
        onClose={() => setArchitectureOpen(false)}
      />
    </div>
  );
}
