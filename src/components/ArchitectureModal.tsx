'use client';

import React from 'react';
import { X, CheckCircle, ShieldCheck, Layers, FileCode, Zap, Binary, AlertCircle } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Befree Assessment Architecture Specification
              </h2>
              <p className="text-xs text-slate-500">
                Full compliance with Non-LLM Bank Statement Processing Requirements
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

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Key assessment requirements checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle className="w-4 h-4" />
                <span>100% Non-LLM Classification</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Zero dependence on LLM APIs (OpenAI, Anthropic, Gemini, etc.). Relies purely on Rule-Based Heuristic Pattern Matching & Traditional ML (TF-IDF + Naive Bayes).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span>Auto-Detects Text vs Scanned PDFs</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Analyzes text stream density per page. Routes digital stream to high-speed table parser; routes raster scans to OCR pipeline.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-purple-800">
                <CheckCircle className="w-4 h-4" />
                <span>Multi-Bank Format Handling</span>
              </div>
              <p className="text-[11px] text-purple-800">
                Robust regex parsers accommodate varying date representations, multi-line narrations, and both 5-column and 7-column bank layouts (HDFC, SBI, ICICI, etc.).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <CheckCircle className="w-4 h-4" />
                <span>Multi-Sheet Excel & CSV Export</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Generates professional .xlsx workbooks with Transactions, Category Summary, and Account Metadata sheets via SheetJS.
              </p>
            </div>
          </div>

          {/* Classification details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Two-Stage Non-LLM Classification Pipeline
            </h4>
            <div className="space-y-2">
              <div>
                <strong className="text-slate-800">1. Heuristic Rule-Based Approach:</strong>
                <p className="text-slate-600 mt-0.5">
                  Evaluates 20+ fine-grained financial regular expressions, merchant lookup dictionaries (Swiggy, Amazon, Blinkit, Zerodha, BESCOM, etc.), accounting flow directions (Salary credit, ATM debit, Interest credit), and transaction channel markers (UPI, NEFT, IMPS, POS).
                </p>
              </div>
              <div>
                <strong className="text-slate-800">2. Traditional Machine Learning Model (TF-IDF + Naive Bayes):</strong>
                <p className="text-slate-600 mt-0.5">
                  Computes unigram + bigram tokenization, sublinear TF scaling, and smooth inverse document frequency (IDF). Evaluates category priors and conditional feature log-likelihoods with Laplace smoothing ($\alpha = 1.0$), outputting normalized class probabilities and confidence scores.
                </p>
              </div>
            </div>
          </div>

          <div className="text-right pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close Specifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
