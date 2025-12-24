import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, requestPasswordReset, resetPasswordWithToken } from '../services/authService';

interface LoginProps {
  onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  // Check for reset token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const resetMatch = hash.match(/^#reset\/(.+)$/);
    if (resetMatch) {
      setResetToken(resetMatch[1]);
      setMode('reset');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await registerUser({ username, password, email });
    setLoading(false);

    if (result.success) {
      // Auto-login after registration
      const loginResult = await loginUser({ username, password });
      if (loginResult.success && loginResult.userId) {
        onLogin(loginResult.userId);
      }
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser({ username, password });
    setLoading(false);

    if (result.success && result.userId) {
      onLogin(result.userId);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success && result.resetLink) {
      setResetLink(result.resetLink);
      setError('');
    } else {
      setError(result.error || 'Failed to generate reset link');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await resetPasswordWithToken(resetToken, newPassword);
    setLoading(false);

    if (result.success) {
      setError('');
      alert('Password reset successful! Please login with your new password.');
      setMode('login');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Failed to reset password');
    }
  };

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
    alert('Reset link copied to clipboard! Save this link to reset your password.');
  };

  return (
    <div className="min-h-screen bg-pure-foundation dark:bg-executive-depth flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-executive-depth rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-creative-depth/30 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-authority-navy dark:bg-brand-accent rounded-xl flex items-center justify-center text-white font-black text-xl sm:text-2xl mx-auto">
              IC
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-authority-navy dark:text-pure-foundation tracking-tight">
              InnerCompass
            </h1>
            <p className="text-sm sm:text-base text-authority-navy/60 dark:text-pure-foundation/60">
              {mode === 'login' && 'Sign in to continue'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
              {mode === 'reset' && 'Set new password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {resetLink && mode === 'forgot' && (
            <div className="bg-brand-accent/20 dark:bg-brand-accent/30 border border-brand-accent/50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-bold text-authority-navy dark:text-pure-foundation">
                Reset Link Generated
              </p>
              <p className="text-xs text-authority-navy/70 dark:text-pure-foundation/70">
                Copy this link to reset your password. It will expire in 24 hours.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resetLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-executive-depth rounded-lg text-xs border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation"
                />
                <button
                  onClick={copyResetLink}
                  className="px-4 py-2 bg-brand-accent text-authority-navy rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-brand-accent text-authority-navy rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="flex flex-col sm:flex-row justify-between gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs sm:text-sm text-brand-accent hover:underline"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs sm:text-sm text-authority-navy/60 dark:text-pure-foundation/60 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Choose a username (min 3 characters)"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Choose a password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Confirm your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-brand-accent text-authority-navy rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs sm:text-sm text-brand-accent hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Enter your email address"
                />
              </div>
              <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60">
                A reset link will be generated. Copy and save it to reset your password.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-brand-accent text-authority-navy rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Generating Link...' : 'Generate Reset Link'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setEmail('');
                    setResetLink('');
                  }}
                  className="text-xs sm:text-sm text-brand-accent hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-authority-navy dark:text-pure-foundation uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-pure-foundation dark:bg-executive-depth/50 border border-slate-200 dark:border-creative-depth/30 text-authority-navy dark:text-pure-foundation focus:ring-2 focus:ring-brand-accent/50 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-brand-accent text-authority-navy rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

