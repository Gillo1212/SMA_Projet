import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { newsletterService } from '../../../services/newsletter.service';

/**
 * Désinscription de la newsletter : page ouverte depuis le lien de l'email de
 * bienvenue (`/newsletter/desinscription?token=…`). Un seul clic suffit.
 */
export default function NewsletterDesinscriptionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<'working' | 'done' | 'error'>(token ? 'working' : 'error');
  const [email, setEmail] = useState('');
  const started = useRef(false);

  useEffect(() => {
    // Une seule requête, même si React rejoue l'effet en développement
    if (!token || started.current) return;
    started.current = true;
    newsletterService.unsubscribe(token)
      .then(address => { setEmail(address); setState('done'); })
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24 sm:py-32">
        <div className="max-w-md w-full text-center" aria-live="polite">
          {state === 'working' && (
            <>
              <i className="ri-loader-4-line text-4xl text-[#1AAA3F] animate-spin"></i>
              <p className="mt-4 text-[#00272B]/60">{t('newsletterUnsubscribe.working')}</p>
            </>
          )}

          {state === 'done' && (
            <>
              <div className="w-20 h-20 bg-[#1AAA3F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-mail-close-line text-[#1AAA3F] text-4xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('newsletterUnsubscribe.doneTitle')}</h1>
              <p className="text-[#00272B]/70 mb-3 break-words">
                {email ? t('newsletterUnsubscribe.doneText', { email }) : t('newsletterUnsubscribe.doneTextNoEmail')}
              </p>
              <p className="text-sm text-[#00272B]/50 mb-8">{t('newsletterUnsubscribe.resubscribeHint')}</p>
              <Link to="/" className="inline-flex items-center justify-center h-12 px-6 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35]">
                {t('newsletterUnsubscribe.backHome')}
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-link-unlink text-red-500 text-4xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('newsletterUnsubscribe.errorTitle')}</h1>
              <p className="text-[#00272B]/70 mb-8">
                {token ? t('newsletterUnsubscribe.errorText') : t('newsletterUnsubscribe.missingToken')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/contact" className="inline-flex items-center justify-center h-12 px-6 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35]">
                  {t('newsletterUnsubscribe.contact')}
                </Link>
                <Link to="/" className="inline-flex items-center justify-center h-12 px-6 border border-[#00272B]/15 text-[#00272B] text-sm font-semibold rounded-xl hover:bg-gray-50">
                  {t('newsletterUnsubscribe.backHome')}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
