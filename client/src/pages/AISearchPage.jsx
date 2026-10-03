import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { aiAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

export const AISearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const samplePrompts = [
    'I need a hammer drill for this weekend to fix shelves in Brooklyn',
    'Looking for a 6-person camping tent for 2 days near Queens',
    'Greenworks lawn mower for tomorrow morning free borrow',
    'Epson video projector or movie screen for family party in Manhattan',
    'Karcher electric pressure washer to clean patio'
  ];

  const handleSearch = async (promptText) => {
    const textToSearch = promptText || query;
    if (!textToSearch.trim()) return;

    setError('');
    setIsAnalyzing(true);
    setHasSearched(true);
    setInterpretation(null);

    try {
      const res = await aiAPI.search(textToSearch);
      if (res.data?.success) {
        setInterpretation(res.data.data.interpretation);
        setResults(res.data.data.results || []);
      }
    } catch (err) {
      setError(err.message || 'AI search failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="app-page ai-search-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Natural Language Requirement Understanding (FR4 & FR5)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Natural Language Item Matcher
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Describe what you need in everyday words. Borrowly's NLP engine interprets your project needs,
          dates, and location, and searches verified community listings without inventing data.
        </p>
      </div>

      {/* Interactive Prompt Box */}
      <div className="ai-prompt-card p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your temporary need in natural language... e.g., 'I need a cordless hammer drill for this weekend to hang heavy shelves in Brooklyn'"
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Mentions of duration (e.g. "weekend", "2 days"), location, and item type are automatically detected.</span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !query.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isAnalyzing ? 'Analyzing Requirement...' : 'Analyze & Match Items'}</span>
            </button>
          </div>
        </form>

        {/* Clickable Quick Prompts */}
        <div className="pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Try clicking a sample requirement:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  handleSearch(prompt);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-emerald-300 transition-colors text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <Loader text="AI NLP Engine is analyzing requirement syntax and querying real MongoDB items..." />
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Intent Extraction</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Category Mapping</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real Availability Check</span>
          </div>
        </div>
      )}

      {/* AI Extraction Breakdown Card (Section 5.1) */}
      {!isAnalyzing && interpretation && (
        <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                AI Interpretation Breakdown
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {Math.round(interpretation.confidence * 100)}% Confidence Match
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-400" /> Detected Category:
              </span>
              <span className="text-white font-bold mt-0.5 block">
                {interpretation.matchedCategory || 'Any Community Category'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" /> Inferred Duration:
              </span>
              <span className="text-white font-bold mt-0.5 block">
                {interpretation.durationDays} day(s)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Target Date Window:
              </span>
              <span className="text-white font-bold mt-0.5 block">
                {interpretation.startDate} → {interpretation.endDate}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" /> Target Location:
              </span>
              <span className="text-white font-bold mt-0.5 block">
                {interpretation.matchedLocation || 'Metro Area'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">Single Source of Truth:</span>
            <span>All matching results below reflect actual verified items in the system database.</span>
          </div>
        </div>
      )}

      {/* Matched Items Output */}
      {!isAnalyzing && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Ranked Item Matches ({results.length})
            </h2>
            <span className="text-xs text-slate-400">Sorted by AI Match Score</span>
          </div>

          {results.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-300 font-semibold">No active items match this specific requirement.</p>
              <p className="text-xs text-slate-500">
                Try asking with different keywords or check out the full catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((item) => (
                <ItemCard key={item.id} item={item} showAiScore={true} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearchPage;
