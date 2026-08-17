import { Link } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useOrders } from '../../hooks/useOrders';
import {
  useClientDashboard,
  useClientInvoices,
  useClientTickets,
} from '../../hooks/useClientPortal';
import { LoadingState, ErrorState } from '../../components/feature/AsyncState';

const statusOrder: Record<string, string> = {
  'En attente': 'bg-amber-50 text-amber-700',
  'Confirmée': 'bg-sky-50 text-sky-700',
  'En préparation': 'bg-sky-50 text-sky-700',
  'Expédiée': 'bg-indigo-50 text-indigo-700',
  'Livrée': 'bg-emerald-50 text-emerald-700',
  'Annulée': 'bg-red-50 text-red-700',
  'Remboursée': 'bg-gray-100 text-gray-600',
};
const statusMachine: Record<string, string> = {
  'Opérationnelle': 'bg-emerald-50 text-emerald-700',
  'Maintenance': 'bg-amber-50 text-amber-700',
  'Hors service': 'bg-red-50 text-red-700',
};

export default function ClientDashboardPage() {
  const { client } = useClientAuth();
  const { stats, machines, isLoading, error, refetch } = useClientDashboard();
  // Le backend restreint /orders au client connecté : pas de filtre à passer
  const { orders } = useOrders();
  const { invoices } = useClientInvoices();
  const { tickets } = useClientTickets();

  if (isLoading) return <LoadingState label="Chargement de votre espace…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const recentOrders = orders.slice(0, 3);
  const openTickets = tickets.filter(t => t.statut === 'Ouvert' || t.statut === 'En cours');
  const unpaidInvoices = invoices.filter(i => i.statut === 'En attente' || i.statut === 'En retard');

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#00272B] to-[#003d42] rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-4 right-20 w-20 h-20 rounded-full border border-white"></div>
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-sm">Bonjour,</p>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            {client?.prenom} {client?.nom}
          </h2>
          <p className="text-white/50 text-sm mt-1">{client?.entreprise} · {client?.ville}</p>
        </div>
        <div className="relative z-10 text-right">
          <p className="text-white/50 text-xs">Client depuis</p>
          <p className="text-white font-semibold text-sm mt-0.5">
            {new Date(client?.dateInscription ?? '').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Commandes totales', value: stats.totalCommandes, icon: 'ri-shopping-bag-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10', sub: `${orders.filter(o => o.statut === 'En attente').length} en attente` },
          { label: 'Machines installées', value: machines.length, icon: 'ri-settings-2-line', color: 'text-sky-600', bg: 'bg-sky-50', sub: `${stats.machinesActives} opérationnelle(s)` },
          { label: 'Total dépensé', value: `${(stats.totalDepense / 1000000).toFixed(2)}M FCFA`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'commandes livrées' },
          { label: 'Tickets ouverts', value: stats.ticketsOuverts, icon: 'ri-customer-service-2-line', color: 'text-amber-600', bg: 'bg-amber-50', sub: `${stats.facturesEnAttente} facture(s) à régler` },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center`}>
                <i className={`${k.icon} ${k.color} text-lg`}></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#00272B]">{k.value}</p>
            <p className="text-xs text-[#00272B]/50 mt-0.5">{k.label}</p>
            <p className="text-xs text-[#00272B]/35 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-5 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-[#00272B]">Dernières commandes</h3>
            <Link to="/espace-client/commandes" className="text-xs text-[#1AAA3F] hover:underline font-medium">Tout voir</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#00272B]/35 py-6 text-center">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-[#00272B]">{order.reference}</p>
                    <p className="text-xs text-[#00272B]/40 truncate">{order.produits || '—'}</p>
                    <p className="text-xs text-[#00272B]/30">{order.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#00272B]">{order.montant.toLocaleString('fr-FR')} F</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusOrder[order.statut] ?? 'bg-gray-100 text-gray-600'}`}>{order.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Machines status */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-[#00272B]">Mes machines</h3>
            <Link to="/espace-client/machines" className="text-xs text-[#1AAA3F] hover:underline font-medium">Détails</Link>
          </div>
          {machines.length === 0 ? (
            <p className="text-sm text-[#00272B]/35 py-6 text-center">Aucune machine installée.</p>
          ) : (
          <div className="space-y-3">
            {machines.map(m => (
              <div key={m.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${m.statut === 'Opérationnelle' ? 'bg-emerald-500' : m.statut === 'Maintenance' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#00272B] truncate">{m.nom}</p>
                  <p className="text-xs text-[#00272B]/40 truncate">{m.site}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusMachine[m.statut]}`}>{m.statut}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(openTickets.length > 0 || unpaidInvoices.length > 0) && (
        <div className="grid xl:grid-cols-2 gap-4">
          {unpaidInvoices.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-file-warning-line text-amber-600 text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">{unpaidInvoices.length} facture(s) en attente</p>
                <p className="text-xs text-amber-700/70 mt-0.5">Montant dû : {unpaidInvoices.reduce((s, i) => s + i.montant, 0).toLocaleString('fr-FR')} FCFA</p>
                <Link to="/espace-client/factures" className="text-xs text-amber-700 font-semibold underline mt-1 inline-block">Voir les factures</Link>
              </div>
            </div>
          )}
          {openTickets.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-customer-service-2-line text-sky-600 text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-sky-800">{openTickets.length} ticket(s) de support en cours</p>
                <p className="text-xs text-sky-700/70 mt-0.5 truncate">{openTickets[0].sujet}</p>
                <Link to="/espace-client/support" className="text-xs text-sky-700 font-semibold underline mt-1 inline-block">Voir le support</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
