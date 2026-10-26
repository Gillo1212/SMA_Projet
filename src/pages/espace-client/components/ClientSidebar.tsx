import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { useClientCounters } from '../../../hooks/useClientCounters';

const navItems = [
  { path: '/espace-client', icon: 'ri-dashboard-line', label: 'dashboard', exact: true },
  { path: '/espace-client/commandes', icon: 'ri-shopping-bag-line', label: 'orders' },
  { path: '/espace-client/devis', icon: 'ri-file-list-3-line', label: 'quotes' },
  { path: '/espace-client/machines', icon: 'ri-settings-2-line', label: 'machines' },
  { path: '/espace-client/factures', icon: 'ri-receipt-line', label: 'invoices' },
  { path: '/espace-client/support', icon: 'ri-customer-service-2-line', label: 'support' },
  { path: '/espace-client/profil', icon: 'ri-user-settings-line', label: 'profile' },
];

interface ClientSidebarProps {
  onClose?: () => void;
}

export default function ClientSidebar({ onClose }: ClientSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const { counters } = useClientCounters();

  // Pastilles : ce qui demande l'attention du client (masquées à zéro)
  const badges: Record<string, { value: number; title: string; tone: string } | undefined> = counters ? {
    '/espace-client/commandes': { value: counters.ordersInProgress, title: t('clientPortal.nav.ordersBadge', { count: counters.ordersInProgress }), tone: 'bg-white/15 text-white' },
    '/espace-client/devis': { value: counters.quotesAwaitingAnswer, title: t('clientPortal.nav.quotesBadge', { count: counters.quotesAwaitingAnswer }), tone: 'bg-indigo-500 text-white' },
    '/espace-client/factures': { value: counters.invoicesToPay, title: t('clientPortal.nav.invoicesBadge', { count: counters.invoicesToPay }), tone: 'bg-amber-500 text-white' },
  } : {};

  const handleLogout = () => {
    logout();
    navigate('/espace-client/connexion');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-[#00272B] flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={handleNavClick}>
          <img
            src="/images/brand/logo-site.png"
            alt="SMALIM"
            className="h-8 w-auto object-contain"
          />
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label={t('clientPortal.nav.closeMenu')} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 cursor-pointer lg:hidden">
            <i className="ri-close-line text-xl"></i>
          </button>
        )}
      </div>
      <div className="px-6 py-3 border-b border-white/8">
        <div className="px-2.5 py-1.5 bg-[#0D8C2E]/20 rounded-lg inline-flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#0D8C2E] rounded-full"></div>
          <span className="text-[#0D8C2E] text-xs font-medium">{t('clientPortal.nav.badge')}</span>
        </div>
      </div>
      {client && (
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0D8C2E]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-user-line text-[#0D8C2E]"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{client.prenom} {client.nom}</p>
              <p className="text-xs text-white/40 truncate">{client.entreprise}</p>
            </div>
          </div>
        </div>
      )}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive ? 'bg-[#0D8C2E] text-white' : 'text-white/55 hover:text-white hover:bg-white/8'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-base`}></i>
              </div>
              <span className="flex-1">{t(`clientPortal.nav.${item.label}`)}</span>
              {!!badges[item.path]?.value && (
                <span
                  title={badges[item.path]!.title}
                  aria-label={badges[item.path]!.title}
                  className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${badges[item.path]!.tone}`}
                >
                  {badges[item.path]!.value}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 space-y-1">
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
          <div className="w-5 h-5 flex items-center justify-center"><i className="ri-home-line text-base"></i></div>
          <span>{t('clientPortal.nav.backToSite')}</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer whitespace-nowrap">
          <div className="w-5 h-5 flex items-center justify-center"><i className="ri-logout-box-r-line text-base"></i></div>
          <span>{t('clientPortal.nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
