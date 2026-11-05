import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BeFree - Bank Statement Processing & Classification System',
  description: 'AI & Automation Bank Statement Processing & Non-LLM Classification System. Auto-detects text vs scanned PDFs, extracts tables, and classifies transactions using Heuristic Rules & Traditional Machine Learning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
