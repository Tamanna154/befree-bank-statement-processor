'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { SAMPLE_STATEMENTS, SampleStatementInfo } from '@/lib/samples/sample-statements';
import { StatementProcessResult } from '@/lib/types';

interface UploadSectionProps {
  onProcessSuccess: (result: StatementProcessResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onProcessSuccess,
  isLoading,
  setIsLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState<string>('hdfc-text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-statement', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        onProcessSuccess(json.data);
      } else {
        alert(json.error || 'Failed to parse statement.');
      }
    } catch (err: any) {
      alert('Error parsing uploaded file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (sample: SampleStatementInfo) => {
    setActiveSampleId(sample.id);
    setIsLoading(true);
    setTimeout(() => {
      onProcessSuccess(sample.data);
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Sample 1-Click Selectors */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              1-Click Instant Evaluation Samples (No upload needed)
            </h2>
            <p className="text-xs text-slate-500">
              Test auto-detection for text-based statements vs scanned image OCR statements.
            </p>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
            Ready to test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_STATEMENTS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            const isScanned = sample.type === 'IMAGE_BASED_SCANNED';

            return (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                disabled={isLoading}
                className={`p-4 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isScanned
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {sample.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{sample.bank}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{sample.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {sample.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500">
                    {sample.data.transactions.length} Transactions
                  </span>
                  <span className={isSelected ? 'text-blue-600 font-semibold' : 'text-slate-700'}>
                    {isSelected ? 'Currently Loaded ✓' : 'Click to Load →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50/60 scale-[1.005]'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/60 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            {isLoading ? (
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Upload your Bank Statement PDF or Scanned Receipt
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports <strong className="text-slate-700">Digital Text PDFs</strong> and{' '}
              <strong className="text-slate-700">Scanned / Image PDFs</strong> (HDFC, SBI, ICICI, Axis, Kotak, Chase, etc.)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Auto-detects Text vs Scanned PDF instantly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
