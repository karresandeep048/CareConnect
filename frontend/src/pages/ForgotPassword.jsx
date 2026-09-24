import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Mail, Lock, KeyRound, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email request, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !/^[a-zA-Z0-9._%+\-]+@gmail\.com$/i.test(email.trim())) {
      setError('Please enter a valid @gmail.com address.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      setLoading(false);
      if (res.data.success) {
        setMessage(res.data.message);
        if (res.data.otp) {
          setReceivedOtp(res.data.otp);
        }
        setStep(2);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send reset code. Please check your email.');
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      setLoading(false);
      if (res.data.success) {
        setStep(3);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password. Please check your verification code.');
    }
  };

  return (
    <div className="bg-hero min-h-screen py-12 flex items-center justify-center px-4">
      <div className="card max-w-md w-full rounded-3xl p-8 shadow-xl border border-slate-200">
        
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-teal-500/30">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Reset Password' : 'Password Reset Complete'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 && 'Enter your registered @gmail.com address to receive a verification code.'}
            {step === 2 && `Enter the 6-digit verification code sent to ${email}`}
            {step === 3 && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success / Message Banner */}
        {message && step === 2 && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{message}</span>
            </div>
            {receivedOtp && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">Verification Code: <strong className="font-mono text-xs text-emerald-800 tracking-wider">{receivedOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(receivedOtp)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded"
                >
                  Auto-fill
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Enter Email ── */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="input !pl-10 w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending Code…
                </>
              ) : (
                <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP + New Password ── */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* OTP Code Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                6-Digit Verification Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="input !pl-10 w-full font-mono text-sm tracking-widest"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                New Password <span className="text-rose-500">*</span>
                <span className="text-[10px] text-slate-400 ml-1">(min. 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input !pl-10 !pr-11 w-full text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input !pl-10 !pr-11 w-full text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Resetting Password…
                </>
              ) : (
                <>Reset Password <ShieldCheck className="w-4 h-4" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setMessage(''); }}
              className="w-full text-center text-xs text-slate-500 hover:text-teal-700 font-medium flex items-center justify-center gap-1 mt-2"
            >
              <RefreshCw className="w-3 h-3" /> Resend verification code
            </button>
          </form>
        )}

        {/* ── STEP 3: Success Screen ── */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Your password has been reset successfully!
            </p>
            <p className="text-xs text-slate-500">
              You can now sign in using your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Link */}
        {step !== 3 && (
          <p className="text-xs text-slate-500 text-center mt-6 pt-4 border-t border-slate-100">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:underline">
              Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
