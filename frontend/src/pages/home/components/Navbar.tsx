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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/machines', label: t('nav.machines') },
    { to: '/produits', label: t('nav.products') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/a-propos', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
      isScrolled ? 'shadow-[0_1px_0_rgba(0,39,43,0.08),0_8px_24px_-12px_rgba(0,39,43,0.15)]' : 'border-b border-[#00272B]/8'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="SMALIM, accueil">
            <img src="/images/brand/logo-horizontal.png" alt="SMALIM Corporate" className="h-9 sm:h-10 w-auto" />
          </Link>

          {/* Nav links desktop */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`eyebrow py-2 border-b transition-colors whitespace-nowrap ${
                  isActive(link.to)
                    ? 'text-[#00272B] border-[#00272B]'
                    : 'text-[#00272B]/70 border-transparent hover:text-[#00272B]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="dark" className="hidden sm:block" />

            {/* Account dropdown */}
            <div className="hidden lg:block relative" ref={menuRef}>
              <button
                onClick={() => setShowAccountMenu(v => !v)}
                aria-label={t('nav.myAccount')}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#00272B] hover:bg-[#00272B]/5 transition-colors"
              >
                <i className="ri-user-line text-lg"></i>
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-[#00272B]/10 shadow-xl py-2 z-50">
                  <p className="eyebrow px-4 py-2 text-[#00272B]/50">{t('nav.loginAs')}</p>
                  <Link
                    to="/espace-client/connexion"
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F3EC] transition-colors"
                  >
                    <i className="ri-user-line text-[#0D8C2E]"></i>
                    <div>
                      <p className="text-sm font-semibold text-[#00272B]">{t('nav.clientArea')}</p>
                      <p className="text-xs text-[#00272B]/50">{t('nav.clientAreaHint')}</p>
                    </div>
                  </Link>
                  <Link
                    to="/connexion"
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F3EC] transition-colors"
                  >
                    <i className="ri-shield-user-line text-[#00272B]/60"></i>
                    <div>
                      <p className="text-sm font-semibold text-[#00272B]">{t('nav.administration')}</p>
                      <p className="text-xs text-[#00272B]/50">{t('nav.administrationHint')}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/panier"
              aria-label={t('cart.title')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#00272B] hover:bg-[#00272B]/5 transition-colors"
            >
              <i className="ri-shopping-bag-3-line text-lg"></i>
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-[#0D8C2E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* CTA */}
            <Link
              to="/machines/devis"
              className="hidden lg:inline-flex items-center ml-2 px-5 py-2.5 bg-[#00272B] text-white text-sm font-semibold rounded-md hover:bg-[#0D8C2E] transition-colors whitespace-nowrap"
            >
              {t('nav.quote')}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-[#00272B] hover:bg-[#00272B]/5 transition-colors"
            >
              <i className={`text-xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#00272B]/8 py-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`eyebrow block px-2 py-3 ${isActive(link.to) ? 'text-[#0D8C2E]' : 'text-[#00272B]'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-[#00272B]/8 grid grid-cols-2 gap-2">
              <Link
                to="/espace-client/connexion"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#00272B] border border-[#00272B]/15 rounded-md"
              >
                <i className="ri-user-line"></i>{t('nav.clientArea')}
              </Link>
              <Link
                to="/connexion"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#00272B] border border-[#00272B]/15 rounded-md"
              >
                <i className="ri-shield-user-line"></i>{t('nav.administration')}
              </Link>
              <Link
                to="/machines/devis"
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2 text-center py-3 bg-[#00272B] text-white text-sm font-semibold rounded-md"
              >
                {t('nav.quote')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
