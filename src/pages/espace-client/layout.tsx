import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ClientSidebar from './components/ClientSidebar';
import ClientBottomNav from './components/ClientBottomNav';
import { initials } from './components/clientNav';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import NotificationsDropdown from '../../components/feature/NotificationsDropdown';
import { useClientNotifications } from '../../hooks/useNotifications';
import LanguageSwitcher from '../../components/feature/LanguageSwitcher';

/** Clé de titre (clientPortal.titles.*) par route */
const pageTitles: Record<string, string> = {
  '/espace-client': 'dashboard',
  '/espace-client/commandes': 'orders',
  '/espace-client/devis': 'quotes',
  '/espace-client/machines': 'machines',
  '/espace-client/factures': 'invoices',
  '/espace-client/support': 'support',
  '/espace-client/profil': 'profile',
};

export default function ClientLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { client, isAuthenticated, isLoading } = useClientAuth();
  const { notifications, markAsRead, markAllAsRead } = useClientNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/espace-client/connexion');
  }, [isAuthenticated, isLoading, navigate]);

  // Le tiroir se referme à chaque changement de page
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Tiroir ouvert : Échap le ferme, la page ne défile plus derrière
  useEffect(() => {
    if (!drawerOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); };
  }, [drawerOpen]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F4F6F4]">
        <i className="ri-loader-4-line text-3xl text-[#1AAA3F] animate-spin"></i>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const pageTitle = t(`clientPortal.titles.${pageTitles[location.pathname] ?? 'default'}`);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#F4F6F4]">
      {/* Barre latérale (bureau) */}
      <div className="hidden lg:flex">
        <ClientSidebar />
      </div>

      {/* Tiroir (mobile, tablette) */}
      <div className={`lg:hidden fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`} inert={!drawerOpen}>
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-[#00272B]/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        ></div>
        <div className={`absolute inset-y-0 left-0 shadow-2xl transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <ClientSidebar onClose={() => setDrawerOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-16 flex-shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={t('clientPortal.nav.openMenu')}
              className="hidden sm:flex lg:hidden w-10 h-10 items-center justify-center rounded-xl border border-gray-200 text-[#00272B]/60 hover:bg-gray-50 cursor-pointer flex-shrink-0"
            >
              <i className="ri-menu-2-line text-xl"></i>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[#00272B] truncate">{pageTitle}</h1>
              <p className="text-xs text-[#00272B]/40 hidden sm:block first-letter:uppercase">
                {new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <NotificationsDropdown
              notifications={notifications}
              onMarkRead={markAsRead}
              onMarkAllRead={markAllAsRead}
            />
            {client && (
              <Link to="/espace-client/profil" title={`${client.prenom} ${client.nom}`}
                className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#1AAA3F] to-[#0D8C2E] text-white text-sm font-bold items-center justify-center hover:opacity-90 transition-opacity">
                {initials(client.prenom, client.nom)}
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
          {/* La clé relance l'animation d'entrée à chaque page */}
          <div key={location.pathname} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 lg:pb-10 motion-safe:animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <ClientBottomNav onMore={() => setDrawerOpen(true)} moreOpen={drawerOpen} />
    </div>
  );
}
