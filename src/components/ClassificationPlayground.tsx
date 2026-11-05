'use client';

import React, { useState } from 'react';
import { X, BrainCircuit, Sparkles, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/classifiers/hybrid-classifier';

interface ClassificationPlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassificationPlayground: React.FC<ClassificationPlaygroundProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('UPI/4281903/SWIGGY BANGALORE IN/ORDER');
  const [debit, setDebit] = useState<string>('420.00');
  const [credit, setCredit] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTestClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          debit: debit ? parseFloat(debit) : null,
          credit: credit ? parseFloat(credit) : null,
        }),
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      alert('Classification test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const presetExamples = [
    { text: 'SALARY CREDIT INFOSYS LIMITED TECH PARK', debit: '', credit: '125000' },
    { text: 'ATM WDL CASH WITHDRAWAL NFS*HDFC BANK', debit: '5000', credit: '' },
    { text: 'ACH DEBIT SIP MUTUAL FUND NIPPON INDIA', debit: '10000', credit: '' },
    { text: 'BESCOM BANGALORE ELECTRICITY BILL BBPS', debit: '1850', credit: '' },
    { text: 'ZOMATO RESTAURANT ORDER GURGAON', debit: '620', credit: '' },
    { text: 'CONSOLIDATED SMS ALERTS CHARGES Q3', debit: '29.50', credit: '' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Non-LLM Classification Playground
              </h2>
              <p className="text-xs text-slate-500">
                Rule-Based Heuristics + Traditional ML (TF-IDF & Naive Bayes)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Try Pre-loaded Banking Narrations:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(ex.text);
                  setDebit(ex.debit);
                  setCredit(ex.credit);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200/60"
              >
                {ex.text.split(' ').slice(0, 3).join(' ')}...
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTestClassify} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Narration / Description
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. UPI/391038/BLINKIT GROCERY/IND"
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Debit Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                value={debit}
                onChange={(e) => {
                  setDebit(e.target.value);
                  if (e.target.value) setCredit('');
                }}
                placeholder="e.g. 500"
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credit Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                value={credit}
                onChange={(e) => {
                  setCredit(e.target.value);
                  if (e.target.value) setDebit('');
                }}
                placeholder="e.g. 10000"
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Evaluating Model...' : 'Run Non-LLM Classifier'}</span>
          </button>
        </form>

        {/* Results Panel */}
        {result && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Chosen Category
                </span>
                <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[result.category as keyof typeof CATEGORY_COLORS] }}
                  />
                  {result.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Confidence
                </span>
                <span className="text-base font-mono font-bold text-indigo-600">
                  {result.confidence}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Heuristic Rule Box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Rule-Based Heuristic Match</span>
                </div>
                {result.heuristicMatch ? (
                  <div className="space-y-1">
                    <p className="font-medium text-blue-700">
                      Rule: {result.heuristicMatch.ruleName}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {result.heuristicMatch.explanation}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    No exact deterministic rule fired. Delegated to Traditional ML classifier.
                  </p>
                )}
              </div>

              {/* Traditional ML Model Box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span>Traditional ML (Naive Bayes)</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-purple-700">
                    Predicted: {result.traditionalML.category} ({result.traditionalML.confidence}%)
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Tokens: {result.traditionalML.tokens?.slice(0, 3).join(', ') || 'n/a'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
