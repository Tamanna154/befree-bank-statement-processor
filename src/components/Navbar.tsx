'use client';

import React from 'react';
import { Landmark, FileSpreadsheet, Sparkles, BrainCircuit, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenPlayground: () => void;
  onOpenInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPlayground, onOpenInfo }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">befree</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Assessment System
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Bank Statement Processing & Non-LLM Classification Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPlayground}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>ML & Rule Playground</span>
          </button>

          <button
            onClick={onOpenInfo}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Architecture Specs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
