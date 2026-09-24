import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-teal-gradient flex items-center justify-center">
              <Wrench className="w-[18px] h-[18px] text-white" />
            </span>
            <span className="font-display text-xl font-extrabold text-slate-900">
              Care<span className="text-brand-600">Connect</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500 max-w-sm">
            AI-powered home services marketplace with smart provider matching, conflict-free scheduling,
            proof-of-work tracking and five-role operations tooling.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/estimate" className="hover:text-brand-700">Cost Estimator</Link></li>
            <li><Link to="/showcase" className="hover:text-brand-700">Project Showcase</Link></li>
            <li><Link to="/services" className="hover:text-brand-700">Service Categories</Link></li>
            <li><Link to="/providers" className="hover:text-brand-700">Find Pros</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3">Built with</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            MongoDB · Express · React · Node.js · Tailwind CSS · Chart.js · JWT · Docker
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} CareConnect. Hackathon showcase project.
      </div>
    </footer>
  );
}
