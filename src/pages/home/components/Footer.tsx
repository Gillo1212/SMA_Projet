import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0A0A] mx-4 sm:mx-10 rounded-t-[32px] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          <div className="sm:col-span-2 lg:col-span-3">
            <img
              src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/3d74ca1f-a6cc-43e7-855a-99e3c8431740_WhatsApp-Image-2026-03-27-at-15.12.28.jpeg?v=53fcf85bfc568db6576ce1dc1e8a0b9f"
              alt="SMALIM Corporate"
              className="h-14 sm:h-20 w-auto mb-5 object-contain"
            />
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-10">{t('footer.stayInformed')}</h3>
          </div>
          <div className="lg:col-span-2">
            <h4 className="text-base font-semibold text-white mb-4 sm:mb-6">{t('footer.navigation')}</h4>
            <div className="space-y-3 sm:space-y-4">
              <Link to="/" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">{t('nav.home')}</Link>
              <Link to="/machines" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">{t('nav.machines')}</Link>
              <Link to="/produits" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">{t('nav.products')}</Link>
              <Link to="/a-propos" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">{t('nav.about')}</Link>
              <Link to="/blog" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">{t('nav.blog')}</Link>
              <Link to="/contact" className="block text-sm text-[#A0A0A0] hover:text-white transition-colors">{t('nav.contact')}</Link>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h4 className="text-base font-semibold text-white mb-4 sm:mb-6">{t('footer.followUs')}</h4>
            <div className="space-y-3 sm:space-y-4">
              <a href="https://www.instagram.com/senmartalim?igsh=MXFlMHBjbGNvNmI2cQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-[#A0A0A0] hover:text-white transition-colors">
                <i className="ri-instagram-line text-xl mr-3"></i>Instagram
              </a>
              <a href="https://www.facebook.com/share/r/1Le3FVV8Rg/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-[#A0A0A0] hover:text-white transition-colors">
                <i className="ri-facebook-circle-line text-xl mr-3"></i>Facebook
              </a>
              <a href="https://vt.tiktok.com/ZSH1U1N13/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-[#A0A0A0] hover:text-white transition-colors">
                <i className="ri-tiktok-line text-xl mr-3"></i>TikTok
              </a>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-white mb-2">{t('footer.newsletterHint')}</p>
            <p className="text-sm text-[#A0A0A0] mb-5">et offres exclusives par email</p>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="w-full h-14 bg-[#1A1A1A] border border-[#333333] rounded-xl px-5 pr-16 text-white placeholder-[#666666] text-sm focus:outline-none focus:border-[#0D8C2E] transition-colors"
                required
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <i className="ri-arrow-right-line text-[#0D8C2E] text-xl"></i>
              </button>
            </form>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 sm:left-16 text-[60px] sm:text-[140px] font-black text-[#1A1A1A] leading-none pointer-events-none select-none hidden sm:block">
          SMALIM
        </div>
        <div className="relative z-10 text-center pt-6 border-t border-[#1A1A1A]">
          <p className="text-xs text-[#666666]">© 2024 SMALIM Corporate. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
