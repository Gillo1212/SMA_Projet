import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShopConfig } from '../../hooks/useShopConfig';
import { whatsappHref } from '../../utils/contact';

/**
 * Boutons flottants des pages publiques : WhatsApp (si un numéro est saisi
 * dans Paramètres → Entreprise) et retour en haut après un long défilement.
 * Discrets, en bas à droite, au-dessus du contenu mais jamais devant un champ.
 */
export default function FloatingActions() {
  const { t } = useTranslation();
  const { config } = useShopConfig();
  const whatsapp = config.company.whatsapp;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('floating.backToTop')}
        title={t('floating.backToTop')}
        tabIndex={showTop ? 0 : -1}
        className={`press w-11 h-11 rounded-full bg-white text-[#00272B] border border-[#00272B]/10 shadow-[0_10px_30px_-12px_rgba(0,39,43,0.45)] flex items-center justify-center hover:bg-[#00272B] hover:text-white transition-all duration-300 cursor-pointer ${
          showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3'
        }`}
      >
        <i className="ri-arrow-up-line text-lg"></i>
      </button>

      {whatsapp && (
        <a
          href={whatsappHref(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('floating.whatsapp')}
          className="group press relative pointer-events-auto flex items-center gap-2 h-14 pl-4 pr-4 sm:pr-5 rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_-12px_rgba(37,211,102,0.75)] hover:bg-[#1ebe5b]"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-ping-slow" aria-hidden="true"></span>
          <i className="ri-whatsapp-line text-2xl relative"></i>
          <span className="relative hidden sm:inline text-sm font-semibold whitespace-nowrap">{t('floating.whatsappShort')}</span>
        </a>
      )}
    </div>
  );
}
