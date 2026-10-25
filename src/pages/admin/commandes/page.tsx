import { useState } from 'react';
import { useOrders, useOrder } from '../../../hooks/useOrders';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import type { Order, OrderStatus } from '../../../types/models';

const ALL_STATUTS: OrderStatus[] = [
  'En attente',
  'Confirmée',
  'En préparation',
  'Expédiée',
  'Livrée',
  'Annulée',
  'Remboursée',
];

const statusColors: Record<OrderStatus, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'Confirmée': 'bg-sky-50 text-sky-700 border-sky-200',
  'En préparation': 'bg-sky-50 text-sky-700 border-sky-200',
  'Expédiée': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Livrée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Annulée': 'bg-red-50 text-red-700 border-red-200',
  'Remboursée': 'bg-gray-50 text-gray-600 border-gray-200',
};

const paiementColors: Record<string, string> = {
  'Wave': 'text-sky-600',
  'Orange Money': 'text-orange-600',
  'Virement bancaire': 'text-indigo-600',
  'Carte bancaire': 'text-violet-600',
  'Espèces': 'text-emerald-600',
  'Non renseigné': 'text-[#00272B]/40',
};

const DELIVERY_LABELS: Record<NonNullable<Order['modeLivraison']>, string> = {
  pickup: 'Retrait en magasin',
  standard: 'Livraison standard',
  express: 'Livraison express',
};

export default function AdminCommandesPage() {
  const { orders, isLoading, error, updateStatus, refetch } = useOrders();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // La liste ne porte pas les lignes de commande : on charge le détail à part.
  const { order: detail, isLoading: detailLoading } = useOrder(selectedId);

  if (isLoading) return <LoadingState label="Chargement des commandes…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = orders.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      c.client.toLowerCase().includes(q) ||
      c.reference.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchStatut = filterStatut === 'Tous' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // La ligne de liste suffit tant que le détail n'est pas arrivé
  const selected = detail ?? orders.find(o => o.id === selectedId) ?? null;

  const handleUpdateStatut = async (id: string, statut: OrderStatus) => {
    setSaving(true);
    setActionError(null);
    try {
      await updateStatus(id, statut);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Mise à jour impossible');
    } finally {
      setSaving(false);
    }
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
            <button
              onClick={refetch}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40"
              title="Actualiser"
            >
              <i className="ri-refresh-line"></i>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#00272B]/30 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher un client, une référence..."
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

        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-shopping-bag-line"
            title={orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
            description={
              orders.length === 0
                ? 'Les commandes passées par vos clients apparaîtront ici.'
                : 'Aucune commande ne correspond à votre recherche.'
            }
          />
        ) : (
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
                  <tr key={cmd.id} className={`hover:bg-gray-50/60 transition-colors ${selectedId === cmd.id ? 'bg-[#1AAA3F]/5' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#00272B]">{cmd.reference}</p>
                      <p className="text-xs text-[#00272B]/40">{cmd.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#00272B]">{cmd.client}</p>
                      <p className="text-xs text-[#00272B]/40">{cmd.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#00272B]/70 max-w-40 truncate">{cmd.produits || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${paiementColors[cmd.paiement] ?? 'text-[#00272B]/60'}`}>{cmd.paiement}</span>
                      {cmd.paiementStatut && (
                        <p className="text-xs text-[#00272B]/40">{cmd.paiementStatut}</p>
                      )}
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
                        onClick={() => setSelectedId(selectedId === cmd.id ? null : cmd.id)}
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
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#00272B]">Détail commande</h3>
            <button onClick={() => setSelectedId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40">
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-1">Référence</p>
              <p className="text-sm font-bold text-[#00272B]">{selected.reference}</p>
              <p className="text-xs text-[#00272B]/50">{selected.date}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-1">Client</p>
              <p className="text-sm font-semibold text-[#00272B]">{selected.client}</p>
              <p className="text-xs text-[#00272B]/50">{selected.email}</p>
              {selected.phone && <p className="text-xs text-[#00272B]/50">{selected.phone}</p>}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-2">Articles</p>
              {detailLoading ? (
                <p className="text-xs text-[#00272B]/40">Chargement…</p>
              ) : selected.items?.length ? (
                <ul className="space-y-1.5">
                  {selected.items.map((it, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span className="text-xs text-[#00272B]/70 flex-1">
                        {it.name} <span className="text-[#00272B]/40">× {it.quantity}</span>
                      </span>
                      <span className="text-xs font-semibold text-[#00272B] whitespace-nowrap">
                        {(it.unitPrice * it.quantity).toLocaleString('fr-FR')} F
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#00272B]/70">{selected.produits || 'Aucun détail disponible'}</p>
              )}
            </div>

            {(selected.adresseLivraison || selected.modeLivraison) && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Livraison</p>
                {selected.modeLivraison && (
                  <p className="text-sm font-semibold text-[#00272B] mb-1">
                    {DELIVERY_LABELS[selected.modeLivraison]}
                    {selected.fraisLivraison !== undefined && (
                      <span className="font-normal text-[#00272B]/50">
                        {' · '}{selected.fraisLivraison > 0 ? `${selected.fraisLivraison.toLocaleString('fr-FR')} F` : 'offerte'}
                      </span>
                    )}
                  </p>
                )}
                {selected.adresseLivraison && <p className="text-sm text-[#00272B]/70">{selected.adresseLivraison}</p>}
              </div>
            )}

            {selected.codePromo && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Code promo</p>
                <p className="text-sm text-[#00272B]">
                  <span className="font-mono font-semibold">{selected.codePromo}</span>
                  {!!selected.remise && <span className="text-[#00272B]/50"> · -{selected.remise.toLocaleString('fr-FR')} F</span>}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Montant</p>
                <p className="text-sm font-bold text-[#00272B]">{selected.montant.toLocaleString('fr-FR')} F</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Paiement</p>
                <p className={`text-sm font-semibold ${paiementColors[selected.paiement] ?? 'text-[#00272B]/60'}`}>{selected.paiement}</p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-600">{actionError}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Changer le statut</p>
              <div className="grid grid-cols-1 gap-2">
                {ALL_STATUTS.map(s => (
                  <button
                    key={s}
                    disabled={saving}
                    onClick={() => handleUpdateStatut(selected.id, s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left border disabled:opacity-50 ${
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
