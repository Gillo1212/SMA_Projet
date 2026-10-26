import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const SOCIALS = [
  { label: 'Instagram', icon: 'ri-instagram-line', href: 'https://www.instagram.com/senmartalim?igsh=MXFlMHBjbGNvNmI2cQ%3D%3D&utm_source=qr' },
  { label: 'Facebook', icon: 'ri-facebook-circle-line', href: 'https://www.facebook.com/share/r/1Le3FVV8Rg/?mibextid=wwXIfr' },
  { label: 'TikTok', icon: 'ri-tiktok-line', href: 'https://vt.tiktok.com/ZSH1U1N13/' },
];

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const linkClass = 'block text-sm text-white/60 hover:text-white transition-colors';

  return (
    <footer className="bg-[#00272B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          {/* Marque */}
          <div className="sm:col-span-2 lg:col-span-4">
            <img src="/images/brand/logo-horizontal-light.png" alt="SMALIM Corporate" className="h-10 w-auto mb-6" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-6">{t('footer.tagline')}</p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <p className="eyebrow text-white/40 mb-5">{t('footer.navigation')}</p>
            <div className="space-y-3">
              <Link to="/machines" className={linkClass}>{t('nav.machines')}</Link>
              <Link to="/produits" className={linkClass}>{t('nav.products')}</Link>
              <Link to="/blog" className={linkClass}>{t('nav.blog')}</Link>
              <Link to="/a-propos" className={linkClass}>{t('nav.about')}</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <p className="eyebrow text-white/40 mb-5">{t('footer.contactTitle')}</p>
            <div className="space-y-3">
              <Link to="/contact" className={linkClass}>{t('nav.contact')}</Link>
              <Link to="/machines/devis" className={linkClass}>{t('nav.quote')}</Link>
              <Link to="/espace-client/connexion" className={linkClass}>{t('nav.clientArea')}</Link>
              <p className="text-sm text-white/60">Dakar, Sénégal</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="eyebrow text-white/40 mb-5">{t('footer.stayInformed')}</p>
            <p className="text-sm text-white/60 mb-5">{t('footer.newsletterHint')}</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 min-w-0 h-12 bg-white/5 border border-white/15 rounded-md px-4 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#4FD07A] transition-colors"
                required
              />
              <button
                type="submit"
                className="h-12 px-5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-md hover:bg-[#0D8C2E] transition-colors whitespace-nowrap"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        <p className="pt-8 text-xs text-white/40">
          © {new Date().getFullYear()} SMALIM Corporate. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
