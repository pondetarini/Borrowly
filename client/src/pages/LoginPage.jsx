import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sparkles, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'owner') navigate('/owner/requests');
      else navigate(from);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="app-page auth-page min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back to Borrowly
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Sign in to access your borrowed items, incoming requests, and listings.
          </p>
        </div>

        {/* Demo Fast-Login Cards */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Instant Demo Login:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDemoAccount('borrower@borrowly.com')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700/60 text-left transition-all text-xs"
            >
              <span className="block font-bold text-white">Borrower</span>
              <span className="block text-[10px] text-slate-400 truncate">Sarah Jenkins</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('owner@borrowly.com')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-teal-500/20 hover:border-teal-500/40 border border-slate-700/60 text-left transition-all text-xs"
            >
              <span className="block font-bold text-white">Owner</span>
              <span className="block text-[10px] text-slate-400 truncate">Marcus Rivera</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('admin@borrowly.com')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 border border-slate-700/60 text-left transition-all text-xs"
            >
              <span className="block font-bold text-white">Admin</span>
              <span className="block text-[10px] text-slate-400 truncate">Elena Vance</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. borrower@borrowly.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
