import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  useClientDashboard,
  useClientInvoices,
  useClientTickets,
} from '../../hooks/useClientPortal';
import { LoadingState, ErrorState } from '../../components/feature/AsyncState';
import { useTranslation } from 'react-i18next';
import { useStatusLabels } from '../../i18n/useStatusLabels';
import { onAdminDataChanged } from '../../services/adminEvents';

const statusOrder: Record<string, string> = {
  'En attente': 'bg-amber-50 text-amber-700',
  'Confirmée': 'bg-sky-50 text-sky-700',
  'En préparation': 'bg-violet-50 text-violet-700',
  'Expédiée': 'bg-indigo-50 text-indigo-700',
  'Livrée': 'bg-emerald-50 text-emerald-700',
  'Annulée': 'bg-red-50 text-red-700',
  'Remboursée': 'bg-gray-100 text-gray-600',
};
const statusMachine: Record<string, string> = {
  'Opérationnelle': 'bg-emerald-500',
  'Maintenance': 'bg-amber-500',
  'Hors service': 'bg-red-500',
};

/** dateInscription arrive au format jj/mm/aaaa, que `new Date()` ne lit pas */
function parseFrenchDate(value?: string): Date | null {
  const m = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = value ? new Date(value) : null;
  return d && !isNaN(d.getTime()) ? d : null;
}

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

interface TodoItem {
  key: string;
  to: string;
  icon: string;
  tone: string;
  title: string;
  hint: string;
}

export default function ClientDashboardPage() {
  const { t, i18n } = useTranslation();
  const status = useStatusLabels();
  const { client } = useClientAuth();
  const { stats, machines, isLoading, error, refetch } = useClientDashboard();
  // Le backend restreint /orders au client connecté : pas de filtre à passer
  const { orders, refetch: refetchOrders } = useOrders({ limit: 50 });
  const { invoices } = useClientInvoices();
  const { tickets } = useClientTickets();
  // Une action (réponse à un devis, réception confirmée) change les chiffres : on les relit
  useEffect(() => onAdminDataChanged(() => { refetch(); refetchOrders(); }), [refetch, refetchOrders]);

  if (isLoading) return <LoadingState label={t('clientPortal.dashboard.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const recentOrders = orders.slice(0, 4);
  const toReceive = orders.filter(o => o.statut === 'Expédiée');
  const unpaidInvoices = invoices.filter(i => i.statut === 'En attente' || i.statut === 'En retard');
  const waitingTickets = tickets.filter(tk => tk.statut === 'En attente client');
  const openTickets = tickets.filter(tk => tk.statut === 'Ouvert' || tk.statut === 'En cours');

  const todos: TodoItem[] = [
    stats.devisARepondre > 0 && {
      key: 'quotes', to: '/espace-client/devis', icon: 'ri-mail-open-line', tone: 'bg-indigo-50 text-indigo-600',
      title: t('clientPortal.dashboard.quotesToAnswer', { count: stats.devisARepondre }), hint: t('clientPortal.dashboard.quotesToAnswerHint'),
    },
    toReceive.length > 0 && {
      key: 'receipt', to: `/espace-client/commandes?commande=${toReceive[0].id}`, icon: 'ri-truck-line', tone: 'bg-sky-50 text-sky-600',
      title: t('clientPortal.dashboard.todoReceipt', { count: toReceive.length }), hint: t('clientPortal.dashboard.todoReceiptHint'),
    },
    unpaidInvoices.length > 0 && {
      key: 'invoices', to: '/espace-client/factures', icon: 'ri-bill-line', tone: 'bg-amber-50 text-amber-600',
      title: t('clientPortal.dashboard.pendingInvoices', { count: unpaidInvoices.length }),
      hint: t('clientPortal.dashboard.amountDue', { amount: unpaidInvoices.reduce((s, i) => s + i.montant, 0).toLocaleString('fr-FR') }),
    },
    waitingTickets.length > 0 && {
      key: 'tickets', to: '/espace-client/support', icon: 'ri-chat-3-line', tone: 'bg-rose-50 text-rose-600',
      title: t('clientPortal.dashboard.todoTicket', { count: waitingTickets.length }), hint: t('clientPortal.dashboard.todoTicketHint'),
    },
  ].filter(Boolean) as TodoItem[];

  const kpis = [
    { label: t('clientPortal.dashboard.totalOrders'), value: String(stats.totalCommandes), sub: t('clientPortal.dashboard.inProgressOrders', { count: stats.commandesEnCours }), icon: 'ri-shopping-bag-3-line', tone: 'text-[#1AAA3F] bg-[#1AAA3F]/10', to: '/espace-client/commandes' },
    { label: t('clientPortal.dashboard.totalSpent'), value: fcfa(stats.totalDepense), sub: t('clientPortal.dashboard.paidOrders'), icon: 'ri-wallet-3-line', tone: 'text-emerald-600 bg-emerald-50', to: '/espace-client/factures' },
    { label: t('clientPortal.dashboard.installedMachines'), value: String(stats.machinesTotal), sub: t('clientPortal.dashboard.operationalMachines', { count: stats.machinesActives }), icon: 'ri-settings-5-line', tone: 'text-sky-600 bg-sky-50', to: '/espace-client/machines' },
    { label: t('clientPortal.dashboard.openTickets'), value: String(stats.ticketsOuverts), sub: t('clientPortal.dashboard.invoicesToPay', { count: stats.facturesEnAttente }), icon: 'ri-customer-service-2-line', tone: 'text-amber-600 bg-amber-50', to: '/espace-client/support' },
  ];

  const quickActions = [
    { to: '/produits', icon: 'ri-store-2-line', label: t('clientPortal.dashboard.quickShop') },
    { to: '/machines/devis', icon: 'ri-file-add-line', label: t('clientPortal.dashboard.quickQuote') },
    { to: '/espace-client/support?nouveau=1', icon: 'ri-customer-service-2-line', label: t('clientPortal.dashboard.quickSupport') },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Accueil */}
      <section className="relative overflow-hidden rounded-3xl bg-[#00272B] text-white p-5 sm:p-7">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#1AAA3F]/25 blur-3xl" aria-hidden="true"></div>
        <div className="absolute right-10 -bottom-24 w-56 h-56 rounded-full bg-sky-400/10 blur-3xl" aria-hidden="true"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-white/55 text-sm">{t('clientPortal.dashboard.hello')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-0.5">{client?.prenom} {client?.nom}</h2>
            <p className="text-white/50 text-sm mt-1">
              {[client?.entreprise, client?.ville].filter(Boolean).join(' · ')}
              {parseFrenchDate(client?.dateInscription) && (
                <span className="text-white/35"> · {t('clientPortal.dashboard.clientSince')} {parseFrenchDate(client?.dateInscription)!.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-3 sm:flex gap-2">
            {quickActions.map((a, i) => (
              <Link key={a.to} to={a.to}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all ${
                  i === 0 ? 'bg-[#1AAA3F] hover:bg-[#158f35] text-white' : 'bg-white/10 hover:bg-white/15 text-white'
                }`}>
                <i className={`${a.icon} text-lg sm:text-base`}></i>
                <span className="leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Indicateurs */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(k => (
          <Link key={k.label} to={k.to} className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-[#1AAA3F]/30 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.tone}`}>
                <i className={`${k.icon} text-lg`}></i>
              </div>
              <i className="ri-arrow-right-up-line text-[#00272B]/20 group-hover:text-[#1AAA3F] transition-colors"></i>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-[#00272B] truncate">{k.value}</p>
            <p className="text-xs text-[#00272B]/55 mt-0.5 truncate">{k.label}</p>
            <p className="text-[11px] text-[#00272B]/35 mt-0.5 truncate">{k.sub}</p>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6">
        {/* À faire */}
        <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[#00272B] mb-4 flex items-center gap-2">
            {t('clientPortal.dashboard.todoTitle')}
            {todos.length > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#1AAA3F] text-white text-[11px] font-bold flex items-center justify-center">{todos.length}</span>}
          </h3>
          {todos.length === 0 ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
                <i className="ri-check-double-line text-2xl text-emerald-500"></i>
              </div>
              <p className="text-sm font-semibold text-[#00272B] mt-3">{t('clientPortal.dashboard.todoEmptyTitle')}</p>
              <p className="text-xs text-[#00272B]/45 mt-1">{t('clientPortal.dashboard.todoEmptyHint')}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {todos.map(todo => (
                <li key={todo.key}>
                  <Link to={todo.to} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#1AAA3F]/30 hover:bg-gray-50/60 transition-all">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${todo.tone}`}>
                      <i className={`${todo.icon} text-lg`}></i>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#00272B]">{todo.title}</span>
                      <span className="block text-xs text-[#00272B]/45 truncate">{todo.hint}</span>
                    </span>
                    <i className="ri-arrow-right-s-line text-lg text-[#00272B]/25"></i>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Dernières commandes */}
        <section className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#00272B]">{t('clientPortal.dashboard.recentOrders')}</h3>
            <Link to="/espace-client/commandes" className="text-xs text-[#1AAA3F] hover:underline font-semibold">{t('clientPortal.dashboard.seeAll')}</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#00272B]/35 py-8 text-center">{t('clientPortal.dashboard.noOrders')}</p>
          ) : (
            <ul className="divide-y divide-gray-50 -mx-2">
              {recentOrders.map(order => (
                <li key={order.id}>
                  <Link to={`/espace-client/commandes?commande=${order.id}`} className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-gray-50/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#00272B]">{order.reference}</p>
                      <p className="text-xs text-[#00272B]/40 truncate">{order.date} · {order.produits || '-'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#00272B]">{fcfa(order.montant)}</p>
                      <span className={`inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusOrder[order.statut] ?? 'bg-gray-100 text-gray-600'}`}>{status.order(order.statut)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6">
        {/* Machines */}
        <section className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#00272B]">{t('clientPortal.dashboard.myMachines')}</h3>
            <Link to="/espace-client/machines" className="text-xs text-[#1AAA3F] hover:underline font-semibold">{t('clientPortal.dashboard.details')}</Link>
          </div>
          {machines.length === 0 ? (
            <p className="text-sm text-[#00272B]/35 py-8 text-center">{t('clientPortal.dashboard.noMachines')}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {machines.slice(0, 4).map(m => (
                <li key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-11 h-11 rounded-lg bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <i className="ri-settings-5-line text-[#00272B]/25"></i>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#00272B] truncate">{m.nom}</p>
                    <p className="text-xs text-[#00272B]/45 truncate flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusMachine[m.statut] ?? 'bg-gray-300'}`}></span>
                      {status.machine(m.statut)} · {m.site}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Support */}
        <section className="xl:col-span-2 bg-gradient-to-br from-[#EEFFF2] to-white rounded-2xl border border-[#1AAA3F]/15 p-5 sm:p-6 flex flex-col">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <i className="ri-customer-service-2-line text-xl text-[#1AAA3F]"></i>
          </div>
          <h3 className="text-sm font-bold text-[#00272B] mt-3">{t('clientPortal.dashboard.activeTickets', { count: openTickets.length })}</h3>
          <p className="text-xs text-[#00272B]/50 mt-1 flex-1">{openTickets[0]?.sujet ?? t('clientPortal.support.emptyHint')}</p>
          <Link to="/espace-client/support" className="mt-4 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-white border border-[#1AAA3F]/30 text-sm font-semibold text-[#1AAA3F] hover:bg-[#1AAA3F] hover:text-white transition-colors">
            {t('clientPortal.dashboard.seeSupport')}<i className="ri-arrow-right-line"></i>
          </Link>
        </section>
      </div>
    </div>
  );
}
