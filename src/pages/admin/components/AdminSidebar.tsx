import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: 'ri-dashboard-line' },
  { to: '/admin/commandes', label: 'Commandes', icon: 'ri-shopping-bag-line', badge: 5 },
  { to: '/admin/devis', label: 'Devis', icon: 'ri-file-list-3-line', badge: 12 },
  { to: '/admin/machines', label: 'Machines', icon: 'ri-settings-2-line' },
  { to: '/admin/produits', label: 'Produits', icon: 'ri-archive-line' },
  { to: '/admin/clients', label: 'Clients', icon: 'ri-group-line' },
  { to: '/admin/blog', label: 'Blog', icon: 'ri-article-line' },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const userRaw = localStorage.getItem('smalim_admin_user');
  const user = userRaw ? JSON.parse(userRaw) : { name: 'Admin', role: 'Administrateur' };

  const handleLogout = () => {
    localStorage.removeItem('smalim_admin_auth');
    localStorage.removeItem('smalim_admin_user');
    navigate('/connexion');
  };

  const isActive = (to: string) => {
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 h-screen bg-[#00272B] flex flex-col flex-shrink-0">
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <Link to="/" className="block mb-1" onClick={handleNavClick}>
            <img
              src="/images/brand/logo-site.png"
              alt="SMALIM"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <span className="text-[#0D8C2E] text-xs font-semibold uppercase tracking-widest">Backoffice</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 cursor-pointer lg:hidden">
            <i className="ri-close-line text-xl"></i>
          </button>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-white/25 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Navigation</p>
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              isActive(item.to) ? 'bg-[#0D8C2E] text-white' : 'text-white/55 hover:text-white hover:bg-white/8'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${item.icon} text-base`}></i>
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isActive(item.to) ? 'bg-white/20 text-white' : 'bg-[#0D8C2E]/20 text-[#0D8C2E]'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="text-white/25 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Système</p>
          <Link
            to="/admin/parametres"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              isActive('/admin/parametres') ? 'bg-[#0D8C2E] text-white' : 'text-white/55 hover:text-white hover:bg-white/8'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-settings-line text-base"></i>
            </div>
            <span className="text-sm font-medium">Paramètres</span>
          </Link>
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/55 hover:text-white hover:bg-white/8 transition-all">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-external-link-line text-base"></i>
            </div>
            <span className="text-sm font-medium">Voir le site</span>
          </Link>
        </div>
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5">
          <div className="w-9 h-9 bg-[#0D8C2E]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-user-line text-[#0D8C2E] text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <p className="text-white/40 text-xs truncate">{user.role}</p>
          </div>
          <button onClick={handleLogout} title="Se déconnecter" className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0">
            <i className="ri-logout-box-r-line text-base"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
