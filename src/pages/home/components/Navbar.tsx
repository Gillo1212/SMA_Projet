import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../../contexts/CartContext';
import LanguageSwitcher from '../../../components/feature/LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { getTotalItems } = useCart();
  const cartItemsCount = getTotalItems();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const showSolid = isScrolled || !isHome;

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/machines', label: t('nav.machines') },
    { to: '/produits', label: t('nav.products') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/a-propos', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      showSolid ? 'bg-white border-b border-gray-100' : 'bg-[#00272B]/70 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/3d74ca1f-a6cc-43e7-855a-99e3c8431740_WhatsApp-Image-2026-03-27-at-15.12.28.jpeg?v=53fcf85bfc568db6576ce1dc1e8a0b9f" alt="SMALIM" className="h-12 w-auto object-contain" />
          </Link>

          {/* Nav links desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                location.pathname === link.to
                  ? showSolid ? 'text-[#0D8C2E] bg-[#0D8C2E]/8' : 'text-[#0D8C2E]'
                  : showSolid ? 'text-[#00272B] hover:text-[#0D8C2E] hover:bg-gray-50' : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}>{link.label}</Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher variant={showSolid ? 'dark' : 'light'} className="hidden sm:block" />

            {/* Account dropdown */}
            <div className="hidden md:block relative" ref={menuRef}>
              <button
                onClick={() => setShowAccountMenu(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all whitespace-nowrap ${
                  showSolid
                    ? 'text-[#00272B] border-gray-200 hover:border-[#0D8C2E] hover:text-[#0D8C2E] bg-white'
                    : 'text-white border-white/30 hover:border-white hover:bg-white/10'
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-user-line text-sm"></i>
                </span>
                {t('nav.myAccount')}
                <i className={`ri-arrow-down-s-line text-xs transition-transform ${showAccountMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">{t('nav.loginAs')}</p>
                  </div>
                  <Link
                    to="/espace-client/connexion"
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-[#0D8C2E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-user-line text-[#0D8C2E] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#00272B]">{t('nav.clientArea')}</p>
                      <p className="text-xs text-[#00272B]/40">{t('nav.clientAreaHint')}</p>
                    </div>
                  </Link>
                  <Link
                    to="/connexion"
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-[#00272B]/8 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-shield-user-line text-[#00272B]/60 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#00272B]">{t('nav.administration')}</p>
                      <p className="text-xs text-[#00272B]/40">{t('nav.administrationHint')}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/panier" className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              showSolid ? 'text-[#00272B] hover:bg-gray-50 border border-gray-200' : 'text-white hover:bg-white/10 border border-white/20'
            }`}>
              <i className="ri-shopping-cart-line text-lg"></i>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0D8C2E] text-white text-xs font-bold rounded-full flex items-center justify-center">{cartItemsCount}</span>
              )}
            </Link>

            {/* CTA */}
            <Link to="/produits" className="hidden md:block px-5 py-2 bg-[#0D8C2E] text-white text-sm font-semibold rounded-lg hover:bg-[#0a7025] transition-colors whitespace-nowrap">
              {t('nav.shop')}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${showSolid ? 'text-[#00272B] hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}
            >
              <i className={`text-xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-md mx-2 transition-colors ${location.pathname === link.to ? 'text-[#0D8C2E] bg-[#0D8C2E]/8' : 'text-[#00272B] hover:text-[#0D8C2E] hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
            <div className="px-2 pt-2 flex flex-col gap-2">
              <Link to="/espace-client/connexion" onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#0D8C2E] border border-[#0D8C2E]/30 rounded-lg hover:bg-[#0D8C2E]/5">
                <i className="ri-user-line"></i>{t('nav.clientArea')}
              </Link>
              <Link to="/connexion" onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#00272B] border border-gray-200 rounded-lg hover:border-[#0D8C2E] hover:text-[#0D8C2E]">
                <i className="ri-shield-user-line"></i>{t('nav.administration')}
              </Link>
              <Link to="/produits" onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-2.5 bg-[#0D8C2E] text-white text-sm font-semibold rounded-lg hover:bg-[#0a7025]">
                {t('nav.shop')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
