import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Authentication | Aurem Luxury',
  description: 'Sign in or register for your Aurem account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#060d11] antialiased">
      {/* Top Header Navigation */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#060d11] transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100/80"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Store</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#076E46] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#055C3A] transition">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#060d11]">
            AUREM
          </span>
        </Link>

        <div className="w-20 hidden sm:block" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Subtle Security & Platform Footer */}
      <footer className="w-full border-t border-slate-200/60 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Aurem Security Protocol v2.0 • 256-Bit TLS</span>
        </div>
        <p>© {new Date().getFullYear()} Aurem Luxury. All rights reserved.</p>
      </footer>
    </div>
  );
}
