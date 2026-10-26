import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isActivePath, useNavBadges } from './clientNav';

const TABS = [
  { path: '/espace-client', icon: 'ri-home-5', label: 'home', exact: true },
  { path: '/espace-client/commandes', icon: 'ri-shopping-bag-3', label: 'ordersShort' },
  { path: '/espace-client/devis', icon: 'ri-file-list-3', label: 'quotesShort' },
  { path: '/espace-client/factures', icon: 'ri-bill', label: 'invoicesShort' },
];

/** Onglets du bas sur mobile ; « Plus » ouvre le tiroir avec le menu complet */
export default function ClientBottomNav({ onMore, moreOpen }: { onMore: () => void; moreOpen: boolean }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const badges = useNavBadges();
  const inTabs = TABS.some(tab => isActivePath(pathname, tab));

  const itemClass = (active: boolean) =>
    `relative flex-1 flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-semibold transition-colors ${
      active ? 'text-[#1AAA3F]' : 'text-[#00272B]/45 active:text-[#00272B]'
    }`;

  return (
    <nav
      aria-label={t('clientPortal.nav.mainNav')}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = isActivePath(pathname, tab);
          const badge = badges[tab.path];
          return (
            <Link key={tab.path} to={tab.path} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#1AAA3F]"></span>}
              <span className="relative">
                <i className={`${tab.icon}-${active ? 'fill' : 'line'} text-[22px] leading-none`}></i>
                {badge && (
                  <span aria-label={badge.title}
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white ${badge.tone}`}>
                    {badge.value}
                  </span>
                )}
              </span>
              {t(`clientPortal.nav.${tab.label}`)}
            </Link>
          );
        })}
        <button type="button" onClick={onMore} aria-expanded={moreOpen} className={itemClass(moreOpen || !inTabs)}>
          <i className="ri-menu-3-line text-[22px] leading-none"></i>
          {t('clientPortal.nav.more')}
        </button>
      </div>
    </nav>
  );
}
