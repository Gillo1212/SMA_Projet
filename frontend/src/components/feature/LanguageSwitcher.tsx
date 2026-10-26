import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';

interface Props {
  /** Adapte les couleurs au fond : la navbar est transparente en haut de page */
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * Sélecteur de langue.
 * Le choix est persisté par i18next-browser-languagedetector (localStorage),
 * il survit donc au rechargement.
 */
export default function LanguageSwitcher({ variant = 'dark', className = '' }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // i18n.language peut valoir « fr-FR » : on ne garde que la base
  const current =
    SUPPORTED_LANGUAGES.find(l => i18n.language?.startsWith(l.code)) ?? SUPPORTED_LANGUAGES[0];

  const change = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const trigger =
    variant === 'light'
      ? 'text-white/80 hover:text-white'
      : 'text-[#00272B]/60 hover:text-[#00272B]';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Langue"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${trigger}`}
      >
        <i className="ri-global-line"></i>
        <span>{current.short}</span>
        <i className={`ri-arrow-down-s-line text-xs transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-gray-100 py-1 z-50">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap ${
                lang.code === current.code
                  ? 'text-[#1AAA3F] font-semibold bg-[#EEFFF2]'
                  : 'text-[#00272B]/70 hover:bg-gray-50'
              }`}
            >
              <span>{lang.label}</span>
              {lang.code === current.code && <i className="ri-check-line"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
