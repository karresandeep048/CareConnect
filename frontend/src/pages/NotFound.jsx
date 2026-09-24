import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="glass-panel p-10 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-teal-500/30">
          <Wrench className="w-8 h-8" />
        </div>

        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-900 mb-2">This page went out on a service call</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8">
          We couldn't find the page you were looking for. It may have been moved, or the link might be broken.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
