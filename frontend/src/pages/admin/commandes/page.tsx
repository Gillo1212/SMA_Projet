import { useMemo, useState } from 'react';
import { useOrders, useOrder } from '../../../hooks/useOrders';
import { useAdminCounters } from '../../../hooks/useAdminCounters';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Toasts, { useToasts } from '../../../components/admin/Toasts';
import type { Order, OrderStatus, PaymentStatus } from '../../../types/models';

// ── Référentiels d'affichage ───────────────────────────────────────────────

/** Parcours normal d'une commande ; annulation et remboursement en sortent */
const FLOW: OrderStatus[] = ['En attente', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée'];
const ALL_STATUTS: OrderStatus[] = [...FLOW, 'Annulée', 'Remboursée'];

/** Valeurs backend, pour lire les compteurs du serveur */
const STATUS_KEYS: Record<OrderStatus, string> = {
  'En attente': 'pending', 'Confirmée': 'confirmed', 'En préparation': 'processing',
  'Expédiée': 'shipped', 'Livrée': 'delivered', 'Annulée': 'cancelled', 'Remboursée': 'refunded',
};

/** Statuts qui déclenchent un email au client (voir orders.controller.updateStatus) */
const EMAILED: OrderStatus[] = ['Confirmée', 'Expédiée', 'Livrée', 'Annulée'];

const STATUS_STYLES: Record<OrderStatus, { pill: string; dot: string; icon: string }> = {
  'En attente':     { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: 'ri-time-line' },
  'Confirmée':      { pill: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: 'ri-check-double-line' },
  'En préparation': { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500', icon: 'ri-box-3-line' },
  'Expédiée':       { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: 'ri-truck-line' },
  'Livrée':         { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: 'ri-home-smile-line' },
  'Annulée':        { pill: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: 'ri-close-circle-line' },
  'Remboursée':     { pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', icon: 'ri-refund-2-line' },
};

/** Libellé du bouton « étape suivante » */
const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  'En attente': 'Confirmer la commande',
  'Confirmée': 'Passer en préparation',
  'En préparation': 'Marquer expédiée',
  'Expédiée': 'Marquer livrée',
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  'Payée': 'bg-emerald-50 text-emerald-700',
  'En attente': 'bg-amber-50 text-amber-700',
  'Échouée': 'bg-red-50 text-red-700',
  'Remboursée': 'bg-gray-100 text-gray-600',
};

const DELIVERY: Record<NonNullable<Order['modeLivraison']>, { label: string; icon: string }> = {
  pickup: { label: 'Retrait en magasin', icon: 'ri-store-2-line' },
  standard: { label: 'Livraison standard', icon: 'ri-truck-line' },
  express: { label: 'Livraison express', icon: 'ri-flashlight-line' },
};

type Filter = 'Tous' | 'À traiter' | OrderStatus;
const TO_HANDLE: OrderStatus[] = ['En attente', 'Confirmée', 'En préparation'];

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function StatusPill({ statut }: { statut: OrderStatus }) {
  const s = STATUS_STYLES[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {statut}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminCommandesPage() {
  // Sans limite explicite le backend s'arrête à 20 commandes
  const { orders, isLoading, error, updateStatus, refetch } = useOrders({ limit: 200 });
  const { counters } = useAdminCounters();
  const { toasts, notify, dismiss } = useToasts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Compteurs : ceux du serveur (toutes les commandes), à défaut la liste chargée
  const countOf = (statut: OrderStatus) =>
    counters?.ordersByStatus[STATUS_KEYS[statut]] ?? orders.filter(o => o.statut === statut).length;
  const total = counters ? Object.values(counters.ordersByStatus).reduce((a, b) => a + b, 0) : orders.length;
  const toHandle = TO_HANDLE.reduce((n, s) => n + countOf(s), 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      const matchSearch = !q || [o.client, o.reference, o.email].some(v => v.toLowerCase().includes(q));
      const matchFilter =
        filter === 'Tous' ? true : filter === 'À traiter' ? TO_HANDLE.includes(o.statut) : o.statut === filter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  if (isLoading) return <LoadingState label="Chargement des commandes…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const summary: { label: string; hint: string; value: number; statut: OrderStatus | 'À traiter'; icon: string; tone: string }[] = [
    { label: 'À confirmer', hint: 'en attente', value: countOf('En attente'), statut: 'En attente', icon: 'ri-time-line', tone: 'text-amber-600 bg-amber-50' },
    { label: 'En cours', hint: 'confirmées ou en préparation', value: countOf('Confirmée') + countOf('En préparation'), statut: 'À traiter', icon: 'ri-box-3-line', tone: 'text-violet-600 bg-violet-50' },
    { label: 'Expédiées', hint: 'en route', value: countOf('Expédiée'), statut: 'Expédiée', icon: 'ri-truck-line', tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'Livrées', hint: 'terminées', value: countOf('Livrée'), statut: 'Livrée', icon: 'ri-home-smile-line', tone: 'text-emerald-600 bg-emerald-50' },
  ];

  const tabs: { key: Filter; count: number }[] = [
    { key: 'Tous', count: total },
    { key: 'À traiter', count: toHandle },
    ...ALL_STATUTS.map(s => ({ key: s as Filter, count: countOf(s) })),
  ];

  return (
    <div className="space-y-6">
      {/* Synthèse */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summary.map(card => (
          <button
            key={card.label} type="button" onClick={() => setFilter(card.statut)}
            className={`text-left bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:border-[#1AAA3F]/40 hover:shadow-sm ${
              filter === card.statut ? 'border-[#1AAA3F]' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.tone}`}>
                <i className={`${card.icon} text-lg`}></i>
              </div>
              <i className="ri-arrow-right-up-line text-[#00272B]/20"></i>
            </div>
            <p className="text-2xl font-bold text-[#00272B]">{card.value}</p>
            <p className="text-sm font-medium text-[#00272B]/70">{card.label}</p>
            <p className="text-xs text-[#00272B]/40">{card.hint}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        {/* Barre d'outils */}
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#00272B]">Commandes</h2>
              <p className="text-xs text-[#00272B]/40">{filtered.length} affichée(s) sur {total}</p>
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <div className="relative flex-1 sm:w-72">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#00272B]/30 text-sm"></i>
                <input
                  type="search" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Client, référence, email…" aria-label="Rechercher une commande"
                  className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
                />
              </div>
              <button onClick={refetch} title="Actualiser" aria-label="Actualiser"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-[#00272B]/50">
                <i className="ri-refresh-line"></i>
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filtrer par statut">
            {tabs.map(t => (
              <button
                key={t.key} type="button" role="tab" aria-selected={filter === t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  filter === t.key ? 'bg-[#00272B] text-white' : 'bg-gray-50 text-[#00272B]/60 hover:bg-gray-100'
                }`}
              >
                {t.key}
                <span className={`px-1.5 rounded ${filter === t.key ? 'bg-white/20' : 'bg-white text-[#00272B]/50'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-shopping-bag-line"
            title={orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
            description={orders.length === 0
              ? 'Les commandes passées par vos clients apparaîtront ici.'
              : 'Aucune commande ne correspond à ce filtre.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-gray-50/60">
                <tr>
                  {['Commande', 'Client', 'Montant', 'Paiement', 'Livraison', 'Statut', ''].map(h => (
                    <th key={h || 'action'} className="px-5 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(o => (
                  <tr key={o.id} onClick={() => setSelectedId(o.id)} className="hover:bg-[#F6F3EC]/60 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-[#00272B]">{o.reference}</p>
                      <p className="text-xs text-[#00272B]/40">{o.date}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <p className="text-sm font-medium text-[#00272B] truncate">{o.client}</p>
                      <p className="text-xs text-[#00272B]/40 truncate">{o.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-[#00272B] whitespace-nowrap">{fcfa(o.montant)}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-[#00272B]/70 whitespace-nowrap">{o.paiement}</p>
                      {o.paiementStatut && (
                        <span className={`inline-block mt-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${PAYMENT_STYLES[o.paiementStatut]}`}>
                          {o.paiementStatut}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {o.modeLivraison ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#00272B]/60 whitespace-nowrap">
                          <i className={DELIVERY[o.modeLivraison].icon}></i>{DELIVERY[o.modeLivraison].label}
                        </span>
                      ) : <span className="text-xs text-[#00272B]/30">-</span>}
                    </td>
                    <td className="px-5 py-3.5"><StatusPill statut={o.statut} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button" onClick={e => { e.stopPropagation(); setSelectedId(o.id); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#00272B]/70 hover:border-[#1AAA3F] hover:text-[#1AAA3F] cursor-pointer whitespace-nowrap"
                      >
                        Gérer <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderModal
        orderId={selectedId}
        listItem={orders.find(o => o.id === selectedId) ?? null}
        onClose={() => setSelectedId(null)}
        onChangeStatus={async (id, statut, note) => {
          try {
            await updateStatus(id, statut, note);
            notify('success', `Statut enregistré : ${statut}`,
              EMAILED.includes(statut) ? 'Le client est prévenu par email.' : undefined);
            return true;
          } catch (e) {
            notify('error', 'Mise à jour impossible', e instanceof Error ? e.message : undefined);
            return false;
          }
        }}
      />
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ── Fenêtre de détail ──────────────────────────────────────────────────────

interface OrderModalProps {
  orderId: string | null;
  /** Ligne de liste : son statut est à jour immédiatement après un changement */
  listItem: Order | null;
  onClose: () => void;
  onChangeStatus: (id: string, statut: OrderStatus, note?: string) => Promise<boolean>;
}

function OrderModal({ orderId, listItem, onClose, onChangeStatus }: OrderModalProps) {
  const { order: detail, isLoading, reload } = useOrder(orderId);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<null | { statut: OrderStatus; title: string; message: string; label: string; tone: 'danger' | 'primary' }>(null);
  const [note, setNote] = useState('');
  const [manual, setManual] = useState<OrderStatus | ''>('');

  const order = detail ? { ...detail, statut: listItem?.statut ?? detail.statut } : listItem;
  if (!orderId || !order) return null;

  const stepIndex = FLOW.indexOf(order.statut);
  const next = stepIndex >= 0 && stepIndex < FLOW.length - 1 ? FLOW[stepIndex + 1] : null;
  const closed = order.statut === 'Annulée' || order.statut === 'Remboursée';

  const apply = async (statut: OrderStatus, motif?: string) => {
    setBusy(true);
    const ok = await onChangeStatus(order.id, statut, motif);
    setBusy(false);
    if (ok) {
      setConfirm(null);
      setNote('');
      setManual('');
      reload();
    }
  };

  const askCancel = () => setConfirm({
    statut: 'Annulée',
    title: `Annuler ${order.reference} ?`,
    message: order.paiementStatut === 'Payée'
      ? 'La commande est payée : pensez à rembourser le client, puis marquez-la « Remboursée ». Le client reçoit un email d’annulation.'
      : 'Le client reçoit un email d’annulation. La commande sort des commandes à traiter.',
    label: 'Annuler la commande',
    tone: 'danger',
  });

  const askRefund = () => setConfirm({
    statut: 'Remboursée',
    title: `Marquer ${order.reference} comme remboursée ?`,
    message: 'À faire une fois le remboursement effectué auprès du prestataire de paiement (Wave, Orange Money…).',
    label: 'Marquer remboursée',
    tone: 'danger',
  });

  const items = order.items ?? [];
  const subtotal = order.sousTotal ?? items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="xl"
        title={`Commande ${order.reference}`}
        subtitle={`Passée le ${order.date} · ${order.client}`}
        headerExtra={<StatusPill statut={order.statut} />}
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {!closed && order.statut !== 'Livrée' && (
                <button type="button" onClick={askCancel} disabled={busy}
                  className="px-3 h-9 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50">
                  <i className="ri-close-circle-line mr-1"></i>Annuler la commande
                </button>
              )}
              {order.statut === 'Annulée' && order.paiementStatut === 'Payée' && (
                <button type="button" onClick={askRefund} disabled={busy}
                  className="px-3 h-9 rounded-lg text-sm font-medium text-[#00272B]/70 hover:bg-gray-100 cursor-pointer disabled:opacity-50">
                  <i className="ri-refund-2-line mr-1"></i>Marquer remboursée
                </button>
              )}
            </div>
            {next && !closed && (
              <div className="flex items-center gap-3">
                {EMAILED.includes(next) && (
                  <span className="hidden md:inline text-xs text-[#00272B]/40"><i className="ri-mail-line mr-1"></i>Email au client</span>
                )}
                <button type="button" onClick={() => apply(next)} disabled={busy} data-autofocus
                  className="px-5 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] cursor-pointer disabled:opacity-60 flex items-center gap-2">
                  {busy ? <i className="ri-loader-4-line animate-spin"></i> : <i className={STATUS_STYLES[next].icon}></i>}
                  {order.statut === 'En préparation' && order.modeLivraison === 'pickup' ? 'Marquer prête au retrait' : NEXT_ACTION[order.statut]}
                </button>
              </div>
            )}
          </div>
        }
      >
        {/* Suivi */}
        <section className="mb-6">
          {closed ? (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_STYLES[order.statut].pill}`}>
              <i className={`${STATUS_STYLES[order.statut].icon} text-xl`}></i>
              <p className="text-sm font-semibold">Commande {order.statut.toLowerCase()}</p>
            </div>
          ) : (
            <ol className="grid grid-cols-5 gap-2" aria-label="Avancement de la commande">
              {FLOW.map((s, i) => {
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <li key={s} className="flex flex-col items-center text-center">
                    <div className="flex items-center w-full">
                      <div className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : i <= stepIndex ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        done ? 'bg-[#1AAA3F] border-[#1AAA3F] text-white'
                          : current ? 'bg-white border-[#1AAA3F] text-[#1AAA3F]'
                          : 'bg-white border-gray-200 text-gray-300'
                      }`}>
                        <i className={done ? 'ri-check-line' : STATUS_STYLES[s].icon}></i>
                      </div>
                      <div className={`flex-1 h-0.5 ${i === FLOW.length - 1 ? 'invisible' : i < stepIndex ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                    </div>
                    <span className={`mt-2 text-[11px] font-semibold ${current ? 'text-[#1AAA3F]' : done ? 'text-[#00272B]/70' : 'text-[#00272B]/35'}`}>{s}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Articles et montants */}
          <section className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">Articles</h3>
            {isLoading && !detail ? (
              <p className="text-sm text-[#00272B]/40"><i className="ri-loader-4-line animate-spin mr-2"></i>Chargement du détail…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-[#00272B]/40">Détail indisponible.</p>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#00272B]">{item.name}</p>
                          <p className="text-xs text-[#00272B]/40">{item.quantity} × {fcfa(item.unitPrice)}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#00272B] whitespace-nowrap">{fcfa(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <dl className="bg-gray-50/70 px-4 py-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-[#00272B]/60">Sous-total</dt><dd className="text-[#00272B]">{fcfa(subtotal)}</dd></div>
                  {!!order.remise && (
                    <div className="flex justify-between"><dt className="text-[#00272B]/60">Remise{order.codePromo ? ` (${order.codePromo})` : ''}</dt><dd className="text-[#1AAA3F]">-{fcfa(order.remise)}</dd></div>
                  )}
                  {order.fraisLivraison !== undefined && (
                    <div className="flex justify-between"><dt className="text-[#00272B]/60">Livraison</dt><dd className="text-[#00272B]">{order.fraisLivraison ? fcfa(order.fraisLivraison) : 'Offerte'}</dd></div>
                  )}
                  {order.tva !== undefined && (
                    <div className="flex justify-between"><dt className="text-[#00272B]/60">TVA{order.tauxTVA !== undefined ? ` (${order.tauxTVA} %)` : ''}</dt><dd className="text-[#00272B]">{fcfa(order.tva)}</dd></div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-gray-200 font-bold"><dt className="text-[#00272B]">Total</dt><dd className="text-[#00272B]">{fcfa(order.montant)}</dd></div>
                </dl>
              </div>
            )}

            {/* Historique */}
            {!!order.historique?.length && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">Historique</h3>
                <ul className="space-y-3">
                  {order.historique.slice(0, 8).map((h, i) => (
                    <li key={i} className="flex gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_STYLES[h.statut].dot}`}></span>
                      <div>
                        <p className="text-sm text-[#00272B]"><span className="font-semibold">{h.statut}</span>
                          <span className="text-xs text-[#00272B]/40"> · {dateTime(h.date)}</span></p>
                        {h.note && <p className="text-xs text-[#00272B]/60 mt-0.5">« {h.note} »</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Client, livraison, paiement */}
          <aside className="lg:col-span-2 space-y-3">
            <div className="p-4 bg-[#F6F3EC] rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Client</p>
              <p className="text-sm font-semibold text-[#00272B]">{order.client}</p>
              {order.email && <a href={`mailto:${order.email}`} className="block text-xs text-[#1AAA3F] hover:underline break-all">{order.email}</a>}
              {order.phone && <a href={`tel:${order.phone}`} className="block text-xs text-[#00272B]/60 hover:text-[#1AAA3F]">{order.phone}</a>}
            </div>
            <div className="p-4 bg-[#F6F3EC] rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Livraison</p>
              {order.modeLivraison && (
                <p className="text-sm font-semibold text-[#00272B] flex items-center gap-1.5">
                  <i className={DELIVERY[order.modeLivraison].icon}></i>{DELIVERY[order.modeLivraison].label}
                </p>
              )}
              <p className="text-xs text-[#00272B]/60 mt-1">{order.adresseLivraison || 'Adresse non renseignée'}</p>
            </div>
            <div className="p-4 bg-[#F6F3EC] rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Paiement</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#00272B]">{order.paiement}</p>
                {order.paiementStatut && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${PAYMENT_STYLES[order.paiementStatut]}`}>{order.paiementStatut}</span>
                )}
              </div>
            </div>

            {/* Changement manuel (corriger une erreur, revenir en arrière) */}
            <details className="p-4 border border-gray-100 rounded-xl">
              <summary className="text-xs font-semibold text-[#00272B]/60 cursor-pointer select-none">Autre statut…</summary>
              <div className="mt-3 flex gap-2">
                <select
                  value={manual} onChange={e => setManual(e.target.value as OrderStatus)} aria-label="Choisir un statut"
                  className="flex-1 h-9 px-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
                >
                  <option value="">Choisir…</option>
                  {ALL_STATUTS.filter(s => s !== order.statut).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  type="button" disabled={!manual || busy}
                  onClick={() => {
                    if (!manual) return;
                    if (manual === 'Annulée') askCancel();
                    else if (manual === 'Remboursée') askRefund();
                    else apply(manual);
                  }}
                  className="px-3 h-9 rounded-lg bg-[#00272B] text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Appliquer
                </button>
              </div>
              {manual && EMAILED.includes(manual) && (
                <p className="mt-2 text-[11px] text-[#00272B]/45"><i className="ri-mail-line mr-1"></i>Le client recevra un email.</p>
              )}
            </details>
          </aside>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.label ?? ''}
        tone={confirm?.tone}
        busy={busy}
        onCancel={() => { setConfirm(null); setNote(''); }}
        onConfirm={() => confirm && apply(confirm.statut, note.trim() || undefined)}
      >
        <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="status-note">Motif (facultatif, gardé dans l’historique)</label>
        <textarea
          id="status-note" rows={3} value={note} onChange={e => setNote(e.target.value)} maxLength={500}
          placeholder="Ex. rupture de stock, demande du client…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] resize-none"
        />
      </ConfirmDialog>
    </>
  );
}
