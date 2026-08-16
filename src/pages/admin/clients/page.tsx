import { useState } from 'react';
import { useClients } from '../../../hooks/useClients';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';

export default function AdminClientsPage() {
  const { clients, isLoading, error, refetch } = useClients();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'Tous' | 'Actif' | 'Inactif'>('Tous');

  if (isLoading) return <LoadingState label="Chargement des clients…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.nom.toLowerCase().includes(q) ||
      c.entreprise.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchStatut = filterStatut === 'Tous' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const totalRevenu = clients.reduce((s, c) => s + c.totalDepenses, 0);
  const totalCommandes = clients.reduce((s, c) => s + c.totalCommandes, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total clients', value: clients.length, icon: 'ri-group-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: 'Clients actifs', value: clients.filter(c => c.statut === 'Actif').length, icon: 'ri-user-follow-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Commandes totales', value: totalCommandes, icon: 'ri-shopping-bag-line', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Revenu clients', value: `${(totalRevenu / 1000000).toFixed(1)}M FCFA`, icon: 'ri-money-dollar-circle-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-[#00272B]">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#00272B]/30 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-56 h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <div className="flex gap-2">
              {(['Tous', 'Actif', 'Inactif'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatut(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                    filterStatut === s ? 'bg-[#1AAA3F] text-white' : 'text-[#00272B]/50 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#00272B]/40">{filtered.length} client(s)</p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-group-line"
            title={clients.length === 0 ? 'Aucun client' : 'Aucun résultat'}
            description={
              clients.length === 0
                ? 'Les comptes clients créés apparaîtront ici.'
                : 'Aucun client ne correspond à votre recherche.'
            }
          />
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50/60">
              <tr>
                {['Client', 'Entreprise', 'Contact', 'Ville', 'Commandes', 'Dépenses', 'Statut', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#1AAA3F]">
                          {client.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#00272B]">{client.nom}</p>
                        <p className="text-xs text-[#00272B]/40">{client.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#00272B]/70">{client.entreprise}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-[#00272B]/60">{client.email}</p>
                    <p className="text-xs text-[#00272B]/40">{client.telephone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#00272B]/70">{client.ville}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#00272B]">{client.totalCommandes}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#1AAA3F]">{client.totalDepenses.toLocaleString('fr-FR')} F</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      client.statut === 'Actif'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {client.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-[#1AAA3F] hover:underline cursor-pointer font-medium whitespace-nowrap">
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
