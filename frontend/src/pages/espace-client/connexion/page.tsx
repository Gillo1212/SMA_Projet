import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClientAuth } from '../../../contexts/ClientAuthContext';

export default function ClientConnexionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Retour après connexion (ex. le checkout) : chemin interne uniquement,
  // pour ne jamais rediriger vers un site tiers
  const redirectParam = searchParams.get('redirect') ?? '';
  const redirectTo = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
    ? redirectParam
    : '/espace-client';
  const { login, loginError, clearError, isAuthenticated, isLoading } = useClientAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(redirectTo);
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate(redirectTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9f4] to-[#e8f5ee] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src="/images/brand/logo-corporate.png"
              alt="SMALIM"
              className="h-12 w-auto mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-[#00272B]">{t('auth.clientSpace')}</h1>
          <p className="text-sm text-[#00272B]/50 mt-1">{t('clientLogin.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          {loginError && (
            <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-5">
              <i className="ri-error-warning-line text-red-500 flex-shrink-0"></i>
              <p className="text-red-600 text-sm">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('auth.emailShort')}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-mail-line text-[#00272B]/35 text-sm"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm text-[#00272B] placeholder-gray-400 focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-lock-line text-[#00272B]/35 text-sm"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-xl text-sm text-[#00272B] placeholder-gray-400 focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[#00272B]/35 hover:text-[#00272B]/60 cursor-pointer">
                  <i className={showPassword ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/mot-de-passe-oublie" className="text-xs text-[#1AAA3F] hover:underline">{t('auth.forgotPassword')}</Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {submitting
                ? <><i className="ri-loader-4-line animate-spin"></i><span>{t('auth.signingIn')}</span></>
                : <><i className="ri-login-circle-line"></i><span>{t('auth.signIn')}</span></>}
            </button>
          </form>

          {/* Compte du jeu de démonstration (npm run seed) — masqué en production */}
          {import.meta.env.DEV && (
            <div className="mt-5 p-3.5 bg-[#f0f9f4] rounded-xl border border-[#1AAA3F]/20">
              <p className="text-xs font-semibold text-[#1AAA3F]/70 uppercase tracking-wide mb-1.5">{t('auth.demoAccount')}</p>
              <p className="text-xs text-[#00272B]/60">{t('auth.demoEmail')} <span className="font-mono font-medium text-[#00272B]">amadou@sonatel.sn</span></p>
              <p className="text-xs text-[#00272B]/60 mt-0.5">{t('auth.demoPassword')} <span className="font-mono font-medium text-[#00272B]">client2024</span></p>
            </div>
          )}
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-[#00272B]/40">
            {t('clientLogin.notClient')}{' '}
            <Link to="/inscription" className="text-[#1AAA3F] hover:underline font-medium">{t('auth.createAccount')}</Link>
          </p>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-[#00272B]/35 hover:text-[#1AAA3F] transition-colors mt-2">
            <i className="ri-arrow-left-line"></i> {t('auth.backToSite')}
          </Link>
        </div>
      </div>
    </div>
  );
}
