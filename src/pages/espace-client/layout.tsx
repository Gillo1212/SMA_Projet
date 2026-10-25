import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ClientSidebar from './components/ClientSidebar';
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
  const { isAuthenticated, isLoading } = useClientAuth();
  const { notifications, markAsRead, markAllAsRead } = useClientNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/espace-client/connexion');
  }, [isAuthenticated, isLoading, navigate]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f9f6]">
        <i className="ri-loader-4-line text-3xl text-[#1AAA3F] animate-spin"></i>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const pageTitle = t(`clientPortal.titles.${pageTitles[location.pathname] ?? 'default'}`);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7F5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <ClientSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label={t('clientPortal.nav.openMenu')}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-[#00272B]/60 hover:bg-gray-50 cursor-pointer lg:hidden flex-shrink-0"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#00272B]">{pageTitle}</h2>
              <p className="text-xs text-[#00272B]/40 mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationsDropdown
              notifications={notifications}
              onMarkRead={markAsRead}
              onMarkAllRead={markAllAsRead}
            />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
