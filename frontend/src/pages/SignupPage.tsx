import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';

interface SignupPageProps {
  onNavigate: (page: string) => void;
  onSignupSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, onSignupSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSignupSuccess();
    } catch (err: any) {
      const errorCode = err.code || '';
      let errorMessage = t('auth.signupError') || 'Failed to create account';

      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = t('auth.emailAlreadyInUse') || 'This email is already registered';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = t('auth.invalidEmail') || 'Invalid email address';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = t('auth.weakPassword') || 'Password is too weak. Use 6+ characters';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-bg to-farm-card flex items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('auth.createAccount') || 'Create Account'}</h1>
          <p className="text-farm-text/60">{t('auth.signupDescription') || 'Join Farm2Vets and manage your farm smarter'}</p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-farm-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                {t('auth.email') || 'Email'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-farm-border focus:border-farm-accent focus:outline-none focus:ring-2 focus:ring-farm-accent/30 text-white placeholder-white/40 transition"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                {t('auth.password') || 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder') || '••••••••'}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-farm-border focus:border-farm-accent focus:outline-none focus:ring-2 focus:ring-farm-accent/30 text-white placeholder-white/40 transition"
                required
              />
              <p className="text-xs text-farm-text/50 mt-1">{t('auth.passwordHint') || 'At least 6 characters'}</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                {t('auth.confirmPassword') || 'Confirm Password'}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder') || '••••••••'}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-farm-border focus:border-farm-accent focus:outline-none focus:ring-2 focus:ring-farm-accent/30 text-white placeholder-white/40 transition"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-farm-accent to-green-500 text-farm-bg font-semibold hover:from-green-400 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t('auth.creatingAccount') || 'Creating account...') : (t('auth.signUp') || 'Sign up')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-farm-border"></div>
            <span className="px-3 text-farm-text/50 text-sm">{t('auth.or') || 'or'}</span>
            <div className="flex-1 h-px bg-farm-border"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-farm-text/60">
            {t('auth.alreadyHaveAccount') || 'Already have an account?'}
            {' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-farm-accent hover:text-green-400 font-semibold transition"
            >
              {t('auth.login') || 'Login'}
            </button>
          </p>
        </div>

        {/* Back to Landing */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-farm-text/60 hover:text-farm-text transition"
          >
            ← {t('auth.backToHome') || 'Back to home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
