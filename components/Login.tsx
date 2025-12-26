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
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

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
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl shadow-2xl border border-border-soft dark:border-dark-border/30 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <img 
              src="/ac-minds-logo.png" 
              alt="AC MINDS" 
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain mx-auto"
            />
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
              Grounded
            </h1>
            <p className="text-sm sm:text-base text-text-primary/60 dark:text-white/60">
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
            <div className="bg-yellow-warm/20 dark:bg-yellow-warm/30 border border-yellow-warm/50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-bold text-text-primary dark:text-white">
                Reset Link Generated
              </p>
              <p className="text-xs text-text-primary/70 dark:text-white/70">
                Copy this link to reset your password. It will expire in 24 hours.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resetLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-dark-bg-primary rounded-lg text-xs border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white"
                />
                <button
                  onClick={copyResetLink}
                  className="px-4 py-2 bg-yellow-warm text-text-primary rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-yellow-warm text-text-primary rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="flex flex-col sm:flex-row justify-between gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs sm:text-sm text-yellow-warm hover:underline"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs sm:text-sm text-text-primary/60 dark:text-white/60 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                  placeholder="Choose a username (min 3 characters)"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                    placeholder="Choose a password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-yellow-warm text-text-primary rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs sm:text-sm text-yellow-warm hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                  placeholder="Enter your email address"
                />
              </div>
              <p className="text-xs text-text-primary/60 dark:text-white/60">
                A reset link will be generated. Copy and save it to reset your password.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-yellow-warm text-text-primary rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
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
                  className="text-xs sm:text-sm text-yellow-warm hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-text-primary dark:text-white uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-bg-primary dark:bg-dark-bg-primary/50 border border-border-soft dark:border-dark-border/30 text-text-primary dark:text-white focus:ring-2 focus:ring-yellow-warm/50 outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
                    aria-label={showResetConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showResetConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 bg-yellow-warm text-text-primary rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
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

