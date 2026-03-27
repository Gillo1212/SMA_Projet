import { useState } from 'react';
import { adminCommandes, CommandeStatus, AdminCommande } from '../../../mocks/admin';

const ALL_STATUTS: CommandeStatus[] = ['En attente', 'Confirmée', 'En livraison', 'Livrée', 'Annulée'];

const statusColors: Record<CommandeStatus, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'Confirmée': 'bg-sky-50 text-sky-700 border-sky-200',
  'En livraison': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Livrée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Annulée': 'bg-red-50 text-red-700 border-red-200',
};

const paiementColors: Record<string, string> = {
  'Wave': 'text-sky-600',
  'Orange Money': 'text-orange-600',
};

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<AdminCommande[]>(adminCommandes);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');
  const [selected, setSelected] = useState<AdminCommande | null>(null);

  const filtered = commandes.filter(c => {
    const matchSearch = c.client.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'Tous' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const updateStatut = (id: string, statut: CommandeStatus) => {
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, statut } : prev);
  };

  return (
    <div className="flex gap-6">
      {/* Main Table */}
      <div className={`flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 flex flex-col ${selected ? 'xl:flex-none xl:w-auto' : ''}`}>
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#00272B]">Toutes les commandes</h2>
              <p className="text-xs text-[#00272B]/40">{filtered.length} commande(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#00272B]/30 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher un client, ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] cursor-pointer text-[#00272B]"
            >
              <option value="Tous">Tous les statuts</option>
              {ALL_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50/60">
              <tr>
                {['Commande', 'Client', 'Produits', 'Paiement', 'Montant', 'Statut', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(cmd => (
                <tr key={cmd.id} className={`hover:bg-gray-50/60 transition-colors ${selected?.id === cmd.id ? 'bg-[#1AAA3F]/5' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#00272B]">{cmd.id}</p>
                    <p className="text-xs text-[#00272B]/40">{cmd.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#00272B]">{cmd.client}</p>
                    <p className="text-xs text-[#00272B]/40">{cmd.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#00272B]/70 max-w-40 truncate">{cmd.produits}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${paiementColors[cmd.paiement]}`}>{cmd.paiement}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#00272B]">{cmd.montant.toLocaleString('fr-FR')} F</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[cmd.statut]}`}>
                      {cmd.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelected(selected?.id === cmd.id ? null : cmd)}
                      className="text-[#1AAA3F] text-sm hover:underline cursor-pointer whitespace-nowrap font-medium"
                    >
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#00272B]">Détail commande</h3>
            <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40">
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-1">Identifiant</p>
              <p className="text-sm font-bold text-[#00272B]">{selected.id}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-1">Client</p>
              <p className="text-sm font-semibold text-[#00272B]">{selected.client}</p>
              <p className="text-xs text-[#00272B]/50">{selected.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-1">Produits</p>
              <p className="text-sm text-[#00272B]/70">{selected.produits}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Montant</p>
                <p className="text-sm font-bold text-[#00272B]">{selected.montant.toLocaleString('fr-FR')} F</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Paiement</p>
                <p className={`text-sm font-semibold ${paiementColors[selected.paiement]}`}>{selected.paiement}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Changer le statut</p>
              <div className="grid grid-cols-1 gap-2">
                {ALL_STATUTS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatut(selected.id, s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left border ${
                      selected.statut === s
                        ? statusColors[s] + ' border-current'
                        : 'text-[#00272B]/50 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {selected.statut === s && <i className="ri-check-line mr-1.5"></i>}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
