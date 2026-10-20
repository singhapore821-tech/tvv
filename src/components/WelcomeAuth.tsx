import React, { useState } from 'react';
import { User, Gender } from '../types';
import { api } from '../services/api';
import { Flame, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WelcomeAuthProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export const WelcomeAuth: React.FC<WelcomeAuthProps> = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please provide your registered email or username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword
      });
      onAuthSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        gender
      });
      onAuthSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    try {
      const res = await api.resetPassword(resetEmail.trim());
      setResetMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Could not send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#ff2a5f]/15 to-[#ec4899]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center z-10 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff2a5f] to-[#e11d48] flex items-center justify-center shadow-xl shadow-[#ff2a5f]/25 mb-4 ring-1 ring-white/20">
          <Flame className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
          VIBE <span className="text-[#ff2a5f]">TV</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Live random video chat with real people. Pure connections, instant video & audio.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="name@email.com or username"
                  required
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#ec4899] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] text-white font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-[#ff2a5f]/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to VIBE TV'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Hayes"
                required
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                required
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff2a5f] transition-colors"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'male', label: 'Male' },
                  { key: 'female', label: 'Female' },
                  { key: 'other', label: 'Other' }
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGender(g.key as Gender)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      gender === g.key
                        ? 'border-[#ff2a5f] bg-[#ff2a5f]/15 text-white shadow-sm'
                        : 'border-white/10 bg-[#181820] text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] text-white font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-[#ff2a5f]/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Security / Community Guideline Note */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Real authenticated accounts only. Zero tolerance for harassment.</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#14141a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 font-display">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered email address to receive secure password recovery instructions.
            </p>
            {resetMessage ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl mb-4">
                {resetMessage}
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Registered email address"
                  required
                  className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff2a5f]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(false); setResetMessage(''); }}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white/5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#ff2a5f] text-white hover:bg-[#e11d48]"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
            {resetMessage && (
              <button
                onClick={() => { setShowForgotModal(false); setResetMessage(''); }}
                className="w-full mt-3 py-2 text-xs font-semibold rounded-lg bg-white/10 text-white"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
