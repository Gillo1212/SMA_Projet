import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders, useOrder } from '../../../hooks/useOrders';
import { LoadingState, ErrorState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Toasts, { useToasts } from '../../../components/admin/Toasts';
import { useStatusLabels } from '../../../i18n/useStatusLabels';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../../../types/models';

// Parcours normal d'une commande ; annulation et remboursement en sortent
const FLOW: OrderStatus[] = ['En attente', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée'];
const IN_PROGRESS: OrderStatus[] = ['En attente', 'Confirmée', 'En préparation', 'Expédiée'];
const CLOSED: OrderStatus[] = ['Annulée', 'Remboursée'];

const STATUS_STYLES: Record<OrderStatus, { pill: string; dot: string; icon: string }> = {
  'En attente':     { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: 'ri-time-line' },
  'Confirmée':      { pill: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: 'ri-check-double-line' },
  'En préparation': { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500', icon: 'ri-box-3-line' },
  'Expédiée':       { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: 'ri-truck-line' },
  'Livrée':         { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: 'ri-home-smile-line' },
  'Annulée':        { pill: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: 'ri-close-circle-line' },
  'Remboursée':     { pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', icon: 'ri-refund-2-line' },
};

const PAYMENT_KEYS: Record<PaymentMethod, string> = {
  'Wave': 'wave', 'Orange Money': 'orangeMoney', 'Virement bancaire': 'transfer',
  'Carte bancaire': 'card', 'Espèces': 'cash', 'Non renseigné': 'unknown',
};
const PAYMENT_STATUS: Record<PaymentStatus, { key: string; style: string }> = {
  'En attente': { key: 'pending', style: 'bg-amber-50 text-amber-700' },
  'Payée': { key: 'paid', style: 'bg-emerald-50 text-emerald-700' },
  'Échouée': { key: 'failed', style: 'bg-red-50 text-red-700' },
  'Remboursée': { key: 'refunded', style: 'bg-gray-100 text-gray-600' },
};
const DELIVERY_ICONS = { pickup: 'ri-store-2-line', standard: 'ri-truck-line', express: 'ri-flashlight-line' };

type Filter = 'all' | 'inProgress' | 'delivered' | 'closed';
const MATCHES: Record<Filter, (o: Order) => boolean> = {
  all: () => true,
  inProgress: o => IN_PROGRESS.includes(o.statut),
  delivered: o => o.statut === 'Livrée',
  closed: o => CLOSED.includes(o.statut),
};

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

/** Libellé d'un statut ; en retrait magasin, « Expédiée » se lit « Prête au retrait » */
function useOrderStatusLabel() {
  const { t } = useTranslation();
  const status = useStatusLabels();
  return (statut: OrderStatus, mode?: Order['modeLivraison']) => {
    if (mode === 'pickup' && statut === 'Expédiée') return t('clientPortal.orders.readyForPickup');
    if (mode === 'pickup' && statut === 'Livrée') return t('clientPortal.orders.pickedUp');
    return status.order(statut);
  };
}

function StatusPill({ statut, mode }: { statut: OrderStatus; mode?: Order['modeLivraison'] }) {
  const label = useOrderStatusLabel();
  const s = STATUS_STYLES[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {label(statut, mode)}
    </span>
  );
}

export default function ClientCommandesPage() {
  const { t } = useTranslation();
  const { orders, isLoading, error, refetch, confirmDelivery } = useOrders({ limit: 100 });
  const { toasts, notify, dismiss } = useToasts();
  const [filter, setFilter] = useState<Filter>('all');
  // ?commande=<id> ouvre directement la fenêtre (liens du tableau de bord, notifications)
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('commande');
  const select = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('commande', id); else next.delete('commande');
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => orders.filter(MATCHES[filter]), [orders, filter]);

  if (isLoading) return <LoadingState label={t('clientPortal.orders.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const toReceive = orders.filter(o => o.statut === 'Expédiée');
  const paid = orders
    .filter(o => o.paiementStatut === 'Payée' && !CLOSED.includes(o.statut))
    .reduce((s, o) => s + o.montant, 0);

  const summary = [
    { key: 'inProgress' as Filter, label: t('clientPortal.orders.summary.inProgress'), hint: t('clientPortal.orders.summary.inProgressHint'), value: String(orders.filter(MATCHES.inProgress).length), icon: 'ri-truck-line', tone: 'text-sky-600 bg-sky-50' },
    { key: 'delivered' as Filter, label: t('clientPortal.orders.summary.delivered'), hint: t('clientPortal.orders.summary.deliveredHint'), value: String(orders.filter(MATCHES.delivered).length), icon: 'ri-home-smile-line', tone: 'text-emerald-600 bg-emerald-50' },
    { key: 'all' as Filter, label: t('clientPortal.orders.summary.spent'), hint: t('clientPortal.orders.summary.spentHint'), value: fcfa(paid), icon: 'ri-wallet-3-line', tone: 'text-[#1AAA3F] bg-[#1AAA3F]/10' },
  ];
  const filters: Filter[] = ['all', 'inProgress', 'delivered', 'closed'];

  const selected = orders.find(o => o.id === selectedId) ?? null;

  const handleConfirm = async (order: Order) => {
    try {
      await confirmDelivery(order.id);
      notify('success', t('clientPortal.orders.receiptConfirmed'), t('clientPortal.orders.receiptConfirmedSub'));
      return true;
    } catch (e) {
      notify('error', t('clientPortal.orders.receiptError'), e instanceof Error ? e.message : undefined);
      return false;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {toReceive.length > 0 && (
        <button
          type="button" onClick={() => select(toReceive[0].id)}
          className="w-full text-left flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition-colors cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
            <i className="ri-truck-line text-xl text-indigo-600"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-indigo-900">{t('clientPortal.dashboard.todoReceipt', { count: toReceive.length })}</p>
            <p className="text-xs text-indigo-800/70">{t('clientPortal.dashboard.todoReceiptHint')}</p>
          </div>
          <i className="ri-arrow-right-s-line text-xl text-indigo-500"></i>
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {summary.map((card, i) => (
          <button
            key={card.label} type="button" onClick={() => setFilter(card.key)}
            className={`text-left bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-[#1AAA3F]/40 hover:shadow-sm transition-all cursor-pointer ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}
          >
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.tone}`}>
              <i className={`${card.icon} text-lg`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-[#00272B] truncate">{card.value}</p>
              <p className="text-xs text-[#00272B]/55 truncate">{card.label}<span className="hidden sm:inline text-[#00272B]/35"> · {card.hint}</span></p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#00272B]">{t('clientPortal.orders.history')}</h2>
            <p className="text-xs text-[#00272B]/40">{t('clientPortal.orders.count', { count: orders.length })}</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5 [scrollbar-width:none]" role="tablist">
            {filters.map(f => (
              <button
                key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  filter === f ? 'bg-[#00272B] text-white' : 'bg-gray-50 text-[#00272B]/60 hover:bg-gray-100'
                }`}
              >
                {t(`clientPortal.orders.filters.${f}`)}
                <span className={`px-1.5 rounded ${filter === f ? 'bg-white/20' : 'bg-white text-[#00272B]/50'}`}>{orders.filter(MATCHES[f]).length}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center">
              <i className="ri-shopping-bag-3-line text-2xl text-[#00272B]/25"></i>
            </div>
            <p className="text-sm font-semibold text-[#00272B] mt-3">{orders.length === 0 ? t('clientPortal.orders.empty') : t('clientPortal.orders.emptyFilter')}</p>
            {orders.length === 0 && (
              <>
                <p className="text-xs text-[#00272B]/45 mt-1">{t('clientPortal.orders.emptyHint')}</p>
                <Link to="/produits" className="inline-flex items-center gap-1.5 mt-4 px-4 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35]">
                  <i className="ri-store-2-line"></i>{t('clientPortal.orders.shopNow')}
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map(order => (
              <li key={order.id}>
                <button
                  type="button" onClick={() => select(order.id)}
                  className="w-full text-left px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50/70 active:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 ${STATUS_STYLES[order.statut].pill}`}>
                    <i className={STATUS_STYLES[order.statut].icon}></i>
                  </div>
                  <div className="flex-1 min-w-0 grid sm:grid-cols-[1fr_auto] gap-x-4 gap-y-1 items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#00272B] flex items-center gap-2">
                        {order.reference}
                        {order.statut === 'Expédiée' && (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-600 text-white">{t('clientPortal.orders.toReceive')}</span>
                        )}
                      </p>
                      <p className="text-xs text-[#00272B]/45 truncate">{order.date} · {order.produits || '-'}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <StatusPill statut={order.statut} mode={order.modeLivraison} />
                      <span className="text-sm font-bold text-[#00272B] whitespace-nowrap sm:w-32 sm:text-right">{fcfa(order.montant)}</span>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-lg text-[#00272B]/25 flex-shrink-0"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <ClientOrderModal
          key={selected.id}
          listOrder={selected}
          onClose={() => select(null)}
          onConfirm={() => handleConfirm(selected)}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} dismissLabel={t('clientPortal.common.dismiss')} />
    </div>
  );
}

interface ClientOrderModalProps {
  /** Élément de la liste : porte le statut à jour (mise à jour optimiste) */
  listOrder: Order;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

function ClientOrderModal({ listOrder, onClose, onConfirm }: ClientOrderModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const label = useOrderStatusLabel();
  // Le détail porte les lignes, les montants et l'historique, absents de la liste
  const { order: detail, isLoading, reload } = useOrder(listOrder.id);
  const order: Order = detail ? { ...detail, statut: listOrder.statut } : listOrder;
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const closed = CLOSED.includes(order.statut);
  const stepIndex = FLOW.indexOf(order.statut);
  const items = order.items ?? [];
  const subtotal = order.sousTotal ?? items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const payment = order.paiementStatut ? PAYMENT_STATUS[order.paiementStatut] : null;
  const pickup = order.modeLivraison === 'pickup';
  const dateTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const delivered = order.historique?.find(h => h.statut === 'Livrée');

  const confirm = async () => {
    setBusy(true);
    const ok = await onConfirm();
    setBusy(false);
    if (ok) { setConfirming(false); reload(); }
  };

  const reportProblem = () => {
    const q = new URLSearchParams({ nouveau: 'livraison', commande: order.reference });
    navigate(`/espace-client/support?${q}`);
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="xl"
        closeLabel={t('clientPortal.common.close')}
        title={t('clientPortal.orders.title', { reference: order.reference })}
        subtitle={t('clientPortal.orders.placedOn', { date: order.date })}
        headerExtra={<span className="hidden sm:inline-flex"><StatusPill statut={order.statut} mode={order.modeLivraison} /></span>}
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link to="/espace-client/support" className="text-sm text-center sm:text-left text-[#00272B]/60 hover:text-[#1AAA3F]">
              <i className="ri-customer-service-2-line mr-1"></i>{t('clientPortal.orders.needHelp')} <span className="font-semibold">{t('clientPortal.orders.contactSupport')}</span>
            </Link>
            <Link to="/espace-client/factures"
              className="inline-flex items-center justify-center gap-2 px-4 h-10 border border-[#1AAA3F] text-[#1AAA3F] text-sm font-semibold rounded-lg hover:bg-[#1AAA3F]/5">
              <i className="ri-bill-line"></i>{t('clientPortal.orders.seeInvoices')}
            </Link>
          </div>
        }
      >
        <div className="sm:hidden mb-4"><StatusPill statut={order.statut} mode={order.modeLivraison} /></div>

        {/* Suivi */}
        <section className="mb-5" aria-label={t('clientPortal.orders.progress')}>
          {closed ? (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_STYLES[order.statut].pill}`}>
              <i className={`${STATUS_STYLES[order.statut].icon} text-xl`}></i>
              <p className="text-sm font-semibold">{t(order.statut === 'Annulée' ? 'clientPortal.orders.cancelled' : 'clientPortal.orders.refunded')}</p>
            </div>
          ) : (
            <ol className="grid grid-cols-5 gap-1 sm:gap-2">
              {FLOW.map((s, i) => {
                const done = i < stepIndex || (i === stepIndex && s === 'Livrée');
                const current = i === stepIndex && s !== 'Livrée';
                return (
                  <li key={s} className="flex flex-col items-center text-center" aria-current={i === stepIndex ? 'step' : undefined}>
                    <div className="flex items-center w-full">
                      <div className={`flex-1 h-0.5 transition-colors duration-500 ${i === 0 ? 'invisible' : i <= stepIndex ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors duration-500 ${
                        done ? 'bg-[#1AAA3F] border-[#1AAA3F] text-white'
                          : current ? 'bg-white border-[#1AAA3F] text-[#1AAA3F] ring-4 ring-[#1AAA3F]/10'
                          : 'bg-white border-gray-200 text-gray-300'
                      }`}>
                        <i className={done ? 'ri-check-line' : STATUS_STYLES[s].icon}></i>
                      </div>
                      <div className={`flex-1 h-0.5 transition-colors duration-500 ${i === FLOW.length - 1 ? 'invisible' : i < stepIndex ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                    </div>
                    <span className={`mt-2 text-[10px] sm:text-[11px] font-semibold leading-tight ${i === stepIndex ? 'text-[#1AAA3F]' : done ? 'text-[#00272B]/70' : 'text-[#00272B]/35'}`}>
                      {label(s, order.modeLivraison)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Réception : la dernière étape revient au client */}
        {order.statut === 'Expédiée' && (
          <section className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <i className={`${pickup ? 'ri-store-2-line' : 'ri-truck-line'} text-lg text-indigo-600`}></i>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-indigo-950">{t(pickup ? 'clientPortal.orders.receiptTitlePickup' : 'clientPortal.orders.receiptTitle')}</p>
                <p className="text-xs text-indigo-900/70 mt-0.5 leading-relaxed">{t('clientPortal.orders.receiptHint')}</p>
              </div>
            </div>
            <div className="mt-4 grid sm:flex sm:justify-end gap-2">
              <button type="button" onClick={reportProblem}
                className="h-10 px-4 rounded-lg border border-indigo-200 bg-white text-sm font-semibold text-indigo-700 hover:bg-indigo-50 cursor-pointer">
                <i className="ri-error-warning-line mr-1.5"></i>{t('clientPortal.orders.reportProblem')}
              </button>
              <button type="button" onClick={() => setConfirming(true)}
                className="h-10 px-5 rounded-lg bg-[#1AAA3F] text-white text-sm font-semibold hover:bg-[#158f35] cursor-pointer shadow-sm shadow-[#1AAA3F]/30">
                <i className="ri-checkbox-circle-line mr-1.5"></i>{t('clientPortal.orders.confirmReceipt')}
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">{t('clientPortal.orders.items')}</h3>
            {isLoading && !detail ? (
              <div className="space-y-2" aria-busy="true">
                {[0, 1].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse"></div>)}
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-[#00272B]/40">{order.produits || t('clientPortal.orders.detailUnavailable')}</p>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <ul className="divide-y divide-gray-50">
                  {items.map((item, i) => (
                    <li key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#00272B]">{item.name}</p>
                        <p className="text-xs text-[#00272B]/40">{item.quantity} × {fcfa(item.unitPrice)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#00272B] whitespace-nowrap">{fcfa(item.quantity * item.unitPrice)}</p>
                    </li>
                  ))}
                </ul>
                <dl className="bg-gray-50/70 px-4 py-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-[#00272B]/60">{t('clientPortal.orders.subtotal')}</dt><dd className="text-[#00272B]">{fcfa(subtotal)}</dd></div>
                  {!!order.remise && (
                    <div className="flex justify-between"><dt className="text-[#00272B]/60">{t('clientPortal.orders.discount')}{order.codePromo ? ` (${order.codePromo})` : ''}</dt><dd className="text-[#1AAA3F]">-{fcfa(order.remise)}</dd></div>
                  )}
                  {order.fraisLivraison !== undefined && (
                    <div className="flex justify-between"><dt className="text-[#00272B]/60">{t('clientPortal.orders.delivery')}</dt><dd className="text-[#00272B]">{order.fraisLivraison ? fcfa(order.fraisLivraison) : t('clientPortal.orders.freeDelivery')}</dd></div>
                  )}
                  {order.tva !== undefined && (
                    <div className="flex justify-between">
                      <dt className="text-[#00272B]/60">{order.tauxTVA !== undefined ? t('clientPortal.orders.vatRate', { rate: order.tauxTVA }) : t('clientPortal.orders.vat')}</dt>
                      <dd className="text-[#00272B]">{fcfa(order.tva)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-gray-200 font-bold"><dt className="text-[#00272B]">{t('clientPortal.common.total')}</dt><dd className="text-[#1AAA3F]">{fcfa(order.montant)}</dd></div>
                </dl>
              </div>
            )}

            {/* Historique : statuts et dates seulement (les notes sont internes) */}
            {!!order.historique?.length && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">{t('clientPortal.orders.timeline')}</h3>
                <ol className="relative border-l border-gray-100 ml-1 space-y-3">
                  {order.historique.slice(0, 6).map((h, i) => (
                    <li key={i} className="pl-4 relative">
                      <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${STATUS_STYLES[h.statut]?.dot ?? 'bg-gray-300'}`}></span>
                      <p className="text-sm text-[#00272B]">
                        <span className="font-semibold">{label(h.statut, order.modeLivraison)}</span>
                        <span className="text-xs text-[#00272B]/40"> · {dateTime(h.date)}</span>
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>

          <aside className="lg:col-span-2 space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">{t('clientPortal.orders.deliveryTitle')}</p>
              {order.modeLivraison && (
                <p className="text-sm font-semibold text-[#00272B] flex items-center gap-1.5">
                  <i className={DELIVERY_ICONS[order.modeLivraison]}></i>{t(`clientPortal.orders.modes.${order.modeLivraison}`)}
                </p>
              )}
              <p className="text-xs text-[#00272B]/60 mt-1">{order.adresseLivraison || t('clientPortal.orders.noAddress')}</p>
              {order.statut === 'Livrée' && delivered && (
                <p className="mt-2 text-xs font-medium text-emerald-700 flex items-center gap-1">
                  <i className="ri-checkbox-circle-fill"></i>{t('clientPortal.orders.receivedOn', { date: dateTime(delivered.date) })}
                </p>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">{t('clientPortal.orders.paymentTitle')}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#00272B]">{t(`clientPortal.orders.paymentMethods.${PAYMENT_KEYS[order.paiement] ?? 'unknown'}`)}</p>
                {payment && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${payment.style}`}>{t(`clientPortal.orders.paymentStatus.${payment.key}`)}</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirming}
        title={t('clientPortal.orders.confirmReceiptTitle')}
        message={t('clientPortal.orders.confirmReceiptText', { reference: order.reference })}
        confirmLabel={t('clientPortal.orders.confirmReceipt')}
        cancelLabel={t('clientPortal.common.cancel')}
        closeLabel={t('clientPortal.common.close')}
        busy={busy}
        onCancel={() => setConfirming(false)}
        onConfirm={confirm}
      />
    </>
  );
}
