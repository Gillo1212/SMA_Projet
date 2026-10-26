import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders, useOrder } from '../../../hooks/useOrders';
import { LoadingState, ErrorState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
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

function StatusPill({ statut }: { statut: OrderStatus }) {
  const status = useStatusLabels();
  const s = STATUS_STYLES[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {status.order(statut)}
    </span>
  );
}

export default function ClientCommandesPage() {
  const { t } = useTranslation();
  const { orders, isLoading, error, refetch } = useOrders({ limit: 100 });
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => orders.filter(MATCHES[filter]), [orders, filter]);

  if (isLoading) return <LoadingState label={t('clientPortal.orders.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const paid = orders
    .filter(o => o.paiementStatut === 'Payée' && !CLOSED.includes(o.statut))
    .reduce((s, o) => s + o.montant, 0);

  const summary = [
    { key: 'inProgress' as Filter, label: t('clientPortal.orders.summary.inProgress'), hint: t('clientPortal.orders.summary.inProgressHint'), value: String(orders.filter(MATCHES.inProgress).length), icon: 'ri-truck-line', tone: 'text-sky-600 bg-sky-50' },
    { key: 'delivered' as Filter, label: t('clientPortal.orders.summary.delivered'), hint: t('clientPortal.orders.summary.deliveredHint'), value: String(orders.filter(MATCHES.delivered).length), icon: 'ri-home-smile-line', tone: 'text-emerald-600 bg-emerald-50' },
    { key: 'all' as Filter, label: t('clientPortal.orders.summary.spent'), hint: t('clientPortal.orders.summary.spentHint'), value: fcfa(paid), icon: 'ri-wallet-3-line', tone: 'text-[#1AAA3F] bg-[#1AAA3F]/10' },
  ];

  const filters: Filter[] = ['all', 'inProgress', 'delivered', 'closed'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map(card => (
          <button
            key={card.label} type="button" onClick={() => setFilter(card.key)}
            className="text-left bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-[#1AAA3F]/40 transition-colors cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.tone}`}>
              <i className={`${card.icon} text-lg`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-[#00272B] truncate">{card.value}</p>
              <p className="text-xs text-[#00272B]/55">{card.label} <span className="text-[#00272B]/35">· {card.hint}</span></p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">{t('clientPortal.orders.history')}</h3>
            <p className="text-xs text-[#00272B]/40">{t('clientPortal.orders.count', { count: orders.length })}</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto" role="tablist">
            {filters.map(f => (
              <button
                key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
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
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center">
              <i className="ri-shopping-bag-line text-2xl text-[#00272B]/25"></i>
            </div>
            <p className="text-sm font-semibold text-[#00272B] mt-3">{orders.length === 0 ? t('clientPortal.orders.empty') : t('clientPortal.orders.emptyFilter')}</p>
            {orders.length === 0 && (
              <>
                <p className="text-xs text-[#00272B]/45 mt-1">{t('clientPortal.orders.emptyHint')}</p>
                <Link to="/produits" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35]">
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
                  type="button" onClick={() => setSelectedId(order.id)}
                  className="w-full text-left px-5 py-4 grid grid-cols-2 sm:grid-cols-[1.2fr_2fr_1fr_auto_auto] items-center gap-x-4 gap-y-2 hover:bg-gray-50/70 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#00272B]">{order.reference}</p>
                    <p className="text-xs text-[#00272B]/40">{order.date}</p>
                  </div>
                  <p className="text-xs text-[#00272B]/60 truncate order-last col-span-2 sm:order-none sm:col-span-1">{order.produits || '-'}</p>
                  <p className="text-sm font-bold text-[#00272B] whitespace-nowrap text-right sm:text-left">{fcfa(order.montant)}</p>
                  <div className="hidden sm:block"><StatusPill statut={order.statut} /></div>
                  <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#1AAA3F] whitespace-nowrap">
                    {t('clientPortal.orders.details')}<i className="ri-arrow-right-s-line"></i>
                  </span>
                  <div className="sm:hidden col-span-2"><StatusPill statut={order.statut} /></div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedId && (
        <ClientOrderModal
          key={selectedId}
          orderId={selectedId}
          fallback={orders.find(o => o.id === selectedId) ?? null}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function ClientOrderModal({ orderId, fallback, onClose }: { orderId: string; fallback: Order | null; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const status = useStatusLabels();
  // Le détail porte les lignes, les montants et l'historique, absents de la liste
  const { order: detail, isLoading } = useOrder(orderId);
  const order = detail ?? fallback;
  if (!order) return null;

  const closed = CLOSED.includes(order.statut);
  const stepIndex = FLOW.indexOf(order.statut);
  const items = order.items ?? [];
  const subtotal = order.sousTotal ?? items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const payment = order.paiementStatut ? PAYMENT_STATUS[order.paiementStatut] : null;
  const dateTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      closeLabel={t('clientPortal.common.close')}
      title={t('clientPortal.orders.title', { reference: order.reference })}
      subtitle={t('clientPortal.orders.placedOn', { date: order.date })}
      headerExtra={<StatusPill statut={order.statut} />}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link to="/espace-client/support" className="text-sm text-[#00272B]/60 hover:text-[#1AAA3F]">
            <i className="ri-customer-service-2-line mr-1"></i>{t('clientPortal.orders.needHelp')} <span className="font-semibold">{t('clientPortal.orders.contactSupport')}</span>
          </Link>
          <Link to="/espace-client/factures"
            className="inline-flex items-center justify-center gap-2 px-4 h-10 border border-[#1AAA3F] text-[#1AAA3F] text-sm font-semibold rounded-lg hover:bg-[#1AAA3F]/5">
            <i className="ri-bill-line"></i>{t('clientPortal.orders.seeInvoices')}
          </Link>
        </div>
      }
    >
      {/* Suivi */}
      <section className="mb-6" aria-label={t('clientPortal.orders.progress')}>
        {closed ? (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_STYLES[order.statut].pill}`}>
            <i className={`${STATUS_STYLES[order.statut].icon} text-xl`}></i>
            <p className="text-sm font-semibold">{t(order.statut === 'Annulée' ? 'clientPortal.orders.cancelled' : 'clientPortal.orders.refunded')}</p>
          </div>
        ) : (
          <ol className="grid grid-cols-5 gap-1 sm:gap-2">
            {FLOW.map((s, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              return (
                <li key={s} className="flex flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
                  <div className="flex items-center w-full">
                    <div className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : i <= stepIndex ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                      done ? 'bg-[#1AAA3F] border-[#1AAA3F] text-white'
                        : current ? 'bg-white border-[#1AAA3F] text-[#1AAA3F]'
                        : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      <i className={done ? 'ri-check-line' : STATUS_STYLES[s].icon}></i>
                    </div>
                    <div className={`flex-1 h-0.5 ${i === FLOW.length - 1 ? 'invisible' : i < stepIndex ? 'bg-[#1AAA3F]' : 'bg-gray-200'}`}></div>
                  </div>
                  <span className={`mt-2 text-[10px] sm:text-[11px] font-semibold leading-tight ${current ? 'text-[#1AAA3F]' : done ? 'text-[#00272B]/70' : 'text-[#00272B]/35'}`}>{status.order(s)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3">
          <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">{t('clientPortal.orders.items')}</h3>
          {isLoading && !detail ? (
            <p className="text-sm text-[#00272B]/40"><i className="ri-loader-4-line animate-spin mr-2"></i>{t('clientPortal.orders.loadingDetail')}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#00272B]/40">{order.produits || t('clientPortal.orders.detailUnavailable')}</p>
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
              <ul className="space-y-3">
                {order.historique.slice(0, 6).map((h, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_STYLES[h.statut]?.dot ?? 'bg-gray-300'}`}></span>
                    <p className="text-sm text-[#00272B]">
                      <span className="font-semibold">{status.order(h.statut)}</span>
                      <span className="text-xs text-[#00272B]/40"> · {dateTime(h.date)}</span>
                    </p>
                  </li>
                ))}
              </ul>
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
  );
}
