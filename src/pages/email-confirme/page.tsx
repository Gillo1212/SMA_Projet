import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { authService } from '../../services/auth.service';

export default function EmailConfirmePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    authService
      .verifyEmail(token)
      .then(() => { if (!cancelled) setStatus('success'); })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      navigate('/espace-client/connexion');
      return;
    }
    const t = setTimeout(() => setCountdown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9f4] to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-10">
          <Link to="/">
            <img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-12 w-auto mx-auto" />
          </Link>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-loader-4-line text-[#1AAA3F] text-4xl animate-spin"></i>
            </div>
            <h1 className="text-xl font-bold text-[#00272B] mb-2">{t('emailConfirmed.verifying')}</h1>
            <p className="text-[#00272B]/50 text-sm">{t('emailConfirmed.verifyingHint')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#1AAA3F]/10 rounded-full animate-ping opacity-20"></div>
              <div className="w-28 h-28 bg-[#EEFFF2] rounded-full flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-[#1AAA3F] text-5xl"></i>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('emailConfirmed.title')}</h1>
            <p className="text-[#00272B]/60 text-sm mb-6">
              {t('emailConfirmed.hint')}
            </p>

            <div className="p-4 bg-[#EEFFF2] border border-[#1AAA3F]/20 rounded-xl mb-6">
              <p className="text-sm text-[#1AAA3F] font-medium">
                <i className="ri-time-line mr-1"></i>
                <Trans i18nKey="emailConfirmed.redirect" values={{ count: countdown }} components={{ b: <strong /> }} />
              </p>
            </div>

            <Link to="/espace-client/connexion"
              className="w-full py-3.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
              <i className="ri-login-circle-line"></i>
              {t('emailConfirmed.accessNow')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-close-circle-line text-red-500 text-4xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('emailConfirmed.invalidTitle')}</h1>
            <p className="text-[#00272B]/60 text-sm mb-6">
              {t('emailConfirmed.invalidHint')}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/inscription"
                className="w-full py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
                <i className="ri-user-add-line"></i>
                {t('emailConfirmed.newAccount')}
              </Link>
              <Link to="/espace-client/connexion"
                className="w-full py-3 border-2 border-gray-200 text-[#00272B] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap">
                {t('auth.signIn')}
              </Link>
            </div>
          </>
        )}

        <div className="mt-6">
          <Link to="/" className="text-xs text-[#00272B]/30 hover:text-[#1AAA3F] transition-colors">
            <i className="ri-arrow-left-line mr-1"></i>{t('auth.backToSite')}
          </Link>
        </div>
      </div>
    </div>
  );
}
