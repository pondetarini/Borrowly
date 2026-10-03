import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, ShieldCheck, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="site-footer border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Repeat className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Borrow<span className="text-emerald-400">ly</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A neighbor-to-neighbor way to find the things you need and share the things you have.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-emerald-400 transition-colors">All Categories</Link></li>
              <li><Link to="/ai-search" className="hover:text-emerald-400 transition-colors flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-400" /> AI Natural Search</Link></li>
              <li><Link to="/explore?type=borrow" className="hover:text-emerald-400 transition-colors">Free Community Borrows</Link></li>
              <li><Link to="/explore?category=Power+Tools" className="hover:text-emerald-400 transition-colors">Power Tools & Hardware</Link></li>
              <li><Link to="/explore?category=Camping+%26+Outdoors" className="hover:text-emerald-400 transition-colors">Camping & Outdoors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform Trust</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Item Availability</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Strict Atomic Conflict Checks</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Community Reviews & Ratings</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AI-Assisted Risk Flagging (FR12)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Demo Credentials</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <div><span className="text-slate-500">Admin:</span> <code className="text-rose-300">admin@borrowly.com</code></div>
              <div><span className="text-slate-500">Owner:</span> <code className="text-teal-300">owner@borrowly.com</code></div>
              <div><span className="text-slate-500">Borrower:</span> <code className="text-emerald-300">borrower@borrowly.com</code></div>
              <div><span className="text-slate-500">Password:</span> <code className="text-amber-300">password123</code></div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Borrowly Platform. Built for Sustainable Circular Economies.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Powered by MERN Stack & Generative NLP Matcher
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
