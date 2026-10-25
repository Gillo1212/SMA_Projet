import { Link } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { LoadingState, ErrorState, EmptyState } from '../../components/feature/AsyncState';

const statusColors: Record<string, string> = {
  'En attente': 'bg-amber-50 text-amber-700',
  'Confirmée': 'bg-sky-50 text-sky-700',
  'En préparation': 'bg-sky-50 text-sky-700',
  'En livraison': 'bg-indigo-50 text-indigo-700',
  'Livrée': 'bg-emerald-50 text-emerald-700',
  'Annulée': 'bg-red-50 text-red-700',
  'Remboursée': 'bg-gray-100 text-gray-600',
  'Nouveau': 'bg-amber-50 text-amber-700',
  'En cours': 'bg-sky-50 text-sky-700',
  'Devis envoyé': 'bg-indigo-50 text-indigo-700',
  'Accepté': 'bg-emerald-50 text-emerald-700',
  'Refusé': 'bg-red-50 text-red-700',
  'Expiré': 'bg-gray-100 text-gray-600',
};

/** Pastille de couleur par statut de commande, pour la répartition */
const statusDots: Record<string, string> = {
  'En attente': 'bg-amber-400',
  'Confirmée': 'bg-sky-400',
  'En préparation': 'bg-sky-300',
  'En livraison': 'bg-indigo-400',
  'Livrée': 'bg-[#1AAA3F]',
  'Annulée': 'bg-red-400',
  'Remboursée': 'bg-gray-400',
};

/** Formate une évolution en % — masquée si le backend ne peut pas la calculer */
function formatEvolution(value?: number): { label: string; positive: boolean } {
  if (value === undefined) return { label: '-', positive: true };
  return { label: `${value >= 0 ? '+' : ''}${value}%`, positive: value >= 0 };
}

export default function AdminDashboardPage() {
  const {
    stats,
    revenue,
    statusBreakdown,
    recentOrders,
    pendingQuotes,
    isLoading,
    error,
    refetch,
  } = useDashboard();

  if (isLoading) return <LoadingState label="Chargement du tableau de bord…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const revenueData = revenue ?? [];
  const breakdown = statusBreakdown ?? [];
  const recentCommandes = recentOrders ?? [];
  const recentDevis = pendingQuotes ?? [];

  // Évite une division par zéro quand aucune donnée de revenu n'est disponible
  const maxRevenue = Math.max(...revenueData.map(d => d.value), 1);

  const commandesEvo = formatEvolution(stats?.commandesEvolution);
  const revenusEvo = formatEvolution(stats?.revenusEvolution);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: 'Commandes ce mois',
            value: stats?.commandesMoisActuel ?? 0,
            evolution: commandesEvo.label,
            positive: commandesEvo.positive,
            icon: 'ri-shopping-bag-line',
            color: 'text-[#1AAA3F]',
            bg: 'bg-[#1AAA3F]/10',
            sub: `${stats?.totalCommandes ?? 0} au total`,
          },
          {
            label: 'Revenus du mois',
            value: `${((stats?.revenusMoisActuel ?? 0) / 1000000).toFixed(1)}M FCFA`,
            evolution: revenusEvo.label,
            positive: revenusEvo.positive,
            icon: 'ri-money-dollar-circle-line',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            sub: 'vs mois précédent',
          },
          {
            label: 'Devis en attente',
            value: stats?.devisEnAttente ?? 0,
            evolution: `${recentDevis.length} nouveaux`,
            positive: true,
            icon: 'ri-file-list-3-line',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            sub: 'à traiter',
          },
          {
            label: 'Clients actifs',
            value: stats?.clientsTotal ?? 0,
            evolution: `${stats?.ticketsOuverts ?? 0} tickets`,
            positive: (stats?.ticketsOuverts ?? 0) === 0,
            icon: 'ri-group-line',
            color: 'text-sky-600',
            bg: 'bg-sky-50',
            sub: 'inscrits',
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center`}>
                <i className={`${card.icon} ${card.color} text-xl`}></i>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {card.evolution}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#00272B] mb-1">{card.value}</p>
            <p className="text-sm text-[#00272B]/50">{card.label}</p>
            <p className="text-xs text-[#00272B]/35 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#00272B]">Évolution des Revenus</h3>
              <p className="text-sm text-[#00272B]/40 mt-0.5">6 derniers mois</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1AAA3F]/8 rounded-lg">
              <div className="w-2 h-2 bg-[#1AAA3F] rounded-full"></div>
              <span className="text-xs font-medium text-[#1AAA3F]">Revenus FCFA</span>
            </div>
          </div>

          {revenueData.length === 0 ? (
            <EmptyState
              icon="ri-line-chart-line"
              title="Aucune donnée de revenu"
              description="Les revenus apparaîtront dès la première commande payée."
              compact
            />
          ) : (
          <div className="flex items-end gap-3 h-40">
            {revenueData.map((d, i) => {
              const pct = (d.value / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-[#00272B]/50">{(d.value / 1000000).toFixed(1)}M</span>
                  <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#1AAA3F] rounded-t-lg transition-all"
                      style={{ height: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-[#00272B]/60">{d.month}</span>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Machines actives + répartition des commandes par statut */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-base font-bold text-[#00272B] mb-2">Machines Actives</h3>
          <p className="text-sm text-[#00272B]/40 mb-6">Parc installé</p>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0F0F0" strokeWidth="3"></circle>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1AAA3F" strokeWidth="3" strokeDasharray="75 25" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#00272B]">{stats?.machinesActives ?? 0}</span>
                <span className="text-xs text-[#00272B]/40">actives</span>
              </div>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">
            Commandes par statut
          </p>
          {breakdown.length === 0 ? (
            <p className="text-sm text-[#00272B]/35">Aucune commande enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {breakdown.map(item => (
                <div key={item.statut} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusDots[item.statut] ?? 'bg-gray-300'}`}></div>
                    <span className="text-sm text-[#00272B]/70">{item.statut}</span>
                  </div>
                  <span className="text-sm font-bold text-[#00272B]">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[#00272B]">Dernières Commandes</h3>
            <Link to="/admin/commandes" className="text-sm text-[#1AAA3F] hover:underline font-medium">
              Voir tout
            </Link>
          </div>
          {recentCommandes.length === 0 ? (
            <EmptyState icon="ri-shopping-bag-line" title="Aucune commande" compact />
          ) : (
            <div className="space-y-3">
              {recentCommandes.map(cmd => (
                <div key={cmd.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-[#00272B] truncate">{cmd.client}</p>
                    <p className="text-xs text-[#00272B]/40">{cmd.reference} · {cmd.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#00272B]">{cmd.montant.toLocaleString('fr-FR')} F</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[cmd.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                      {cmd.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Devis */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[#00272B]">Devis à Traiter</h3>
            <Link to="/admin/devis" className="text-sm text-[#1AAA3F] hover:underline font-medium">
              Voir tout
            </Link>
          </div>
          {recentDevis.length === 0 ? (
            <EmptyState icon="ri-file-list-3-line" title="Aucun devis à traiter" compact />
          ) : (
            <div className="space-y-3">
              {recentDevis.map(devis => (
                <div key={devis.id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-[#00272B] truncate">{devis.entreprise}</p>
                    <p className="text-xs text-[#00272B]/40 truncate">{devis.machine}</p>
                    <p className="text-xs text-[#00272B]/40">{devis.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[devis.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                    {devis.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
