import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, Star, Clock } from 'lucide-react';

export const ROLE_HOME = {
  customer: '/customer-dashboard',
  provider: '/provider-dashboard',
  admin: '/admin-dashboard',
  ops_manager: '/ops-dashboard',
  support_agent: '/support-dashboard',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = (role) =>
    navigate(location.state?.from?.pathname || ROLE_HOME[role] || '/', { replace: true });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      const stored = JSON.parse(localStorage.getItem('careconnect_user') || 'null');
      goHome(stored?.role);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="bg-hero min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12 grid gap-8 lg:grid-cols-2 items-center">

        {/* ── Login Card ── */}
        <div className="card rounded-3xl p-8 shadow-xl">
          {/* Logo / Title */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to manage your bookings and requests.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Email address</span>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="input !pl-10 w-full"
                  autoComplete="email"
                />
              </div>
            </label>

            {/* Password with eye toggle */}
            <div className="block">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600">Password</span>
                <Link to="/forgot-password" className="text-xs font-medium text-teal-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input !pl-10 !pr-11 w-full"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-5">
            New to CareConnect?{' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* ── Right Panel — Platform Highlights ── */}
        <div className="space-y-4 lg:pl-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Trusted Home Services,{' '}
              <span className="text-teal-600">on demand</span>
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Connect with verified professionals for all your home repair, maintenance, and improvement needs.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50', label: 'Verified Professionals', desc: 'Every service provider is background-checked and credentialed.' },
              { icon: Star,        color: 'text-amber-600  bg-amber-50',   label: 'Transparent Pricing',   desc: 'Get quotes upfront — no hidden fees, ever.'               },
              { icon: Clock,       color: 'text-blue-600   bg-blue-50',    label: 'Fast Dispatch',          desc: 'Same-day availability across all service categories.'    },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center pt-2">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
