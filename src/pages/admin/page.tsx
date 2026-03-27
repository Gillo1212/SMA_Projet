import { Link } from 'react-router-dom';
import { adminStats, revenueData, adminCommandes, adminDevis } from '../../mocks/admin';

const statusColors: Record<string, string> = {
  'En attente': 'bg-amber-50 text-amber-700',
  'Confirmée': 'bg-sky-50 text-sky-700',
  'En livraison': 'bg-indigo-50 text-indigo-700',
  'Livrée': 'bg-emerald-50 text-emerald-700',
  'Annulée': 'bg-red-50 text-red-700',
  'Nouveau': 'bg-amber-50 text-amber-700',
  'En cours': 'bg-sky-50 text-sky-700',
  'Devis envoyé': 'bg-indigo-50 text-indigo-700',
  'Accepté': 'bg-emerald-50 text-emerald-700',
  'Refusé': 'bg-red-50 text-red-700',
};

const maxRevenue = Math.max(...revenueData.map(d => d.value));

export default function AdminDashboardPage() {
  const recentCommandes = adminCommandes.slice(0, 5);
  const recentDevis = adminDevis.filter(d => d.statut === 'Nouveau' || d.statut === 'En cours').slice(0, 4);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: 'Commandes ce mois',
            value: adminStats.commandesMoisActuel,
            evolution: `+${adminStats.commandesEvolution}%`,
            positive: true,
            icon: 'ri-shopping-bag-line',
            color: 'text-[#1AAA3F]',
            bg: 'bg-[#1AAA3F]/10',
            sub: `${adminStats.totalCommandes} au total`,
          },
          {
            label: 'Revenus du mois',
            value: `${(adminStats.revenusMoisActuel / 1000000).toFixed(1)}M FCFA`,
            evolution: `+${adminStats.revenusEvolution}%`,
            positive: true,
            icon: 'ri-money-dollar-circle-line',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            sub: 'vs mois précédent',
          },
          {
            label: 'Devis en attente',
            value: adminStats.devisEnAttente,
            evolution: '4 nouveaux',
            positive: true,
            icon: 'ri-file-list-3-line',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            sub: 'à traiter',
          },
          {
            label: 'Clients actifs',
            value: adminStats.clientsTotal,
            evolution: `+${adminStats.clientsNouveaux} ce mois`,
            positive: true,
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
        </div>

        {/* Machines Stats */}
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
                <span className="text-3xl font-bold text-[#00272B]">48</span>
                <span className="text-xs text-[#00272B]/40">actives</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Café', count: 18, color: 'bg-[#1AAA3F]' },
              { label: 'Snacks', count: 14, color: 'bg-emerald-300' },
              { label: 'Boissons', count: 10, color: 'bg-amber-400' },
              { label: 'Combinés', count: 6, color: 'bg-sky-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 ${item.color} rounded-full`}></div>
                  <span className="text-sm text-[#00272B]/70">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-[#00272B]">{item.count}</span>
              </div>
            ))}
          </div>
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
          <div className="space-y-3">
            {recentCommandes.map(cmd => (
              <div key={cmd.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-semibold text-[#00272B] truncate">{cmd.client}</p>
                  <p className="text-xs text-[#00272B]/40">{cmd.id} · {cmd.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#00272B]">{cmd.montant.toLocaleString('fr-FR')} F</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[cmd.statut]}`}>
                    {cmd.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Devis */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[#00272B]">Devis à Traiter</h3>
            <Link to="/admin/devis" className="text-sm text-[#1AAA3F] hover:underline font-medium">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {recentDevis.map(devis => (
              <div key={devis.id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-semibold text-[#00272B] truncate">{devis.entreprise}</p>
                  <p className="text-xs text-[#00272B]/40 truncate">{devis.machine}</p>
                  <p className="text-xs text-[#00272B]/40">{devis.date}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[devis.statut]}`}>
                  {devis.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
