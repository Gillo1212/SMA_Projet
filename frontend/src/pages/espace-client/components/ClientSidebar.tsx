import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { NAV_GROUPS, initials, isActivePath, useNavBadges } from './clientNav';

interface ClientSidebarProps {
  /** Fourni dans le tiroir mobile : ferme le tiroir */
  onClose?: () => void;
}

export default function ClientSidebar({ onClose }: ClientSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const badges = useNavBadges();

  const handleLogout = () => {
    logout();
    navigate('/espace-client/connexion');
  };

  return (
    <aside className="w-[272px] h-full flex-shrink-0 bg-[#00272B] flex flex-col text-white">
      {/* Marque */}
      <div className="px-5 h-16 flex items-center justify-between flex-shrink-0">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
          <img src="/images/brand/logo-site.png" alt="SMALIM" className="h-8 w-auto object-contain" />
        </Link>
        {onClose ? (
          <button onClick={onClose} aria-label={t('clientPortal.nav.closeMenu')}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4FD07A] bg-[#1AAA3F]/15 px-2 py-1 rounded-md">
            {t('clientPortal.nav.badge')}
          </span>
        )}
      </div>

      {/* Client connecté */}
      {client && (
        <Link to="/espace-client/profil" onClick={onClose}
          className="mx-3 mb-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center gap-3 transition-colors">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1AAA3F] to-[#0D8C2E] flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initials(client.prenom, client.nom)}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold truncate">{client.prenom} {client.nom}</span>
            <span className="block text-xs text-white/45 truncate">{client.entreprise}</span>
          </span>
        </Link>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5" aria-label={t('clientPortal.nav.mainNav')}>
        {NAV_GROUPS.map(group => (
          <div key={group.key}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{t(`clientPortal.nav.${group.key}`)}</p>
            <ul className="space-y-0.5">
              {group.items.map(item => {
                const active = isActivePath(location.pathname, item);
                const badge = badges[item.path];
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active ? 'bg-[#1AAA3F] text-white shadow-lg shadow-[#1AAA3F]/20' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <i className={`${item.icon}-${active ? 'fill' : 'line'} text-[17px] w-5 text-center transition-transform duration-200 group-hover:scale-110`}></i>
                      <span className="flex-1 truncate">{t(`clientPortal.nav.${item.label}`)}</span>
                      {badge && (
                        <span title={badge.title} aria-label={badge.title}
                          className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${active ? 'bg-white text-[#1AAA3F]' : badge.tone}`}>
                          {badge.value}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Appel à l'action + sortie */}
      <div className="p-3 space-y-2 flex-shrink-0">
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#1AAA3F] to-[#0D8C2E]">
          <i className="ri-lightbulb-flash-line absolute -right-2 -bottom-3 text-7xl text-white/10" aria-hidden="true"></i>
          <p className="text-sm font-bold">{t('clientPortal.nav.ctaTitle')}</p>
          <p className="text-xs text-white/75 mt-0.5 mb-3 pr-6">{t('clientPortal.nav.ctaText')}</p>
          <Link to="/machines/devis" onClick={onClose}
            className="relative inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white text-[#0D8C2E] text-xs font-bold hover:bg-[#EEFFF2] transition-colors">
            {t('clientPortal.nav.ctaButton')}<i className="ri-arrow-right-line"></i>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/" onClick={onClose}
            className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
            <i className="ri-arrow-left-line"></i>{t('clientPortal.nav.backToSite')}
          </Link>
          <button onClick={handleLogout} title={t('clientPortal.nav.logout')} aria-label={t('clientPortal.nav.logout')}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-red-300/70 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
            <i className="ri-logout-box-r-line text-lg"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
