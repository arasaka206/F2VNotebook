import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../components/layout/ThemeToggle';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      const errorCode = err.code || '';
      let errorMessage = t('auth.loginError');

      if (errorCode === 'auth/user-not-found') {
        errorMessage = t('auth.userNotFound');
      } else if (errorCode === 'auth/wrong-password') {
        errorMessage = t('auth.wrongPassword');
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = t('auth.invalidEmail');
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = t('auth.tooManyAttempts');
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-bg to-farm-card flex items-center justify-center px-4">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('auth.welcomeBack')}</h1>
          <p className="text-farm-text/60">{t('auth.loginDescription')}</p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-farm-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-farm-border focus:border-farm-accent focus:outline-none focus:ring-2 focus:ring-farm-accent/30 text-white placeholder-white/40 transition"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-farm-accent to-green-500 text-farm-bg font-semibold hover:from-green-400 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-farm-border"></div>
            <span className="px-3 text-farm-text/50 text-sm">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-farm-border"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-farm-text/60">
            {t('auth.noAccount')}
            {' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-farm-accent hover:text-green-400 font-semibold transition"
            >
              {t('auth.signUp')}
            </button>
          </p>
        </div>

        {/* Back to Landing */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-farm-text/60 hover:text-farm-text transition"
          >
            ← {t('auth.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
