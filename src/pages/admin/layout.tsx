import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationsDropdown from '../../components/feature/NotificationsDropdown';
import { useAdminNotifications } from '../../hooks/useNotifications';

const pageTitles: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/commandes': 'Commandes',
  '/admin/devis': 'Devis',
  '/admin/machines': 'Machines',
  '/admin/produits': 'Produits',
  '/admin/clients': 'Clients',
  '/admin/blog': 'Blog',
  '/admin/parametres': 'Paramètres',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, logout } = useAuthContext();
  const { notifications, markAsRead, markAllAsRead } = useAdminNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5]">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line text-3xl text-[#1AAA3F] animate-spin"></i>
          <p className="text-sm text-[#00272B]/50">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/connexion');
    return null;
  }

  const pageTitle = pageTitles[location.pathname] ?? 'Administration';

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7F5] font-['Inter']">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - always visible on desktop, overlay on mobile */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-[#00272B]/60 hover:bg-gray-50 cursor-pointer lg:hidden"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#00272B]">{pageTitle}</h1>
              <p className="text-xs text-[#00272B]/40 mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsDropdown
              notifications={notifications}
              onMarkRead={markAsRead}
              onMarkAllRead={markAllAsRead}
            />
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-[#1AAA3F]"></i>
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs font-semibold text-[#00272B]">{user.name}</p>
                  <p className="text-xs text-[#00272B]/40 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-[#00272B]/50 hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer transition-colors"
              title="Se déconnecter"
            >
              <i className="ri-logout-box-r-line text-sm"></i>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
