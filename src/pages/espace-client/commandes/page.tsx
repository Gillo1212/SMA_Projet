import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders, useOrder } from '../../../hooks/useOrders';
import { LoadingState, ErrorState } from '../../../components/feature/AsyncState';
import { useTranslation } from 'react-i18next';
import { useStatusLabels } from '../../../i18n/useStatusLabels';

const statusColors: Record<string, string> = {
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'Confirmée': 'bg-sky-50 text-sky-700 border-sky-200',
  'En préparation': 'bg-sky-50 text-sky-700 border-sky-200',
  'Expédiée': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Livrée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Annulée': 'bg-red-50 text-red-700 border-red-200',
  'Remboursée': 'bg-gray-100 text-gray-600 border-gray-200',
};

// Étapes du tunnel affichées dans le suivi (hors annulation / remboursement)
const steps = ['En attente', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée'];
const ALL = 'all';

export default function ClientCommandesPage() {
  const { t } = useTranslation();
  const status = useStatusLabels();
  const { orders, isLoading, error, refetch } = useOrders();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState(ALL);

  // Le détail porte les lignes de commande, absentes de la liste
  const { order: detail, isLoading: detailLoading } = useOrder(selectedId);

  if (isLoading) return <LoadingState label={t('clientPortal.orders.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filters = [ALL, ...steps, 'Annulée'];
  const filtered = filter === ALL ? orders : orders.filter(o => o.statut === filter);

  const selected = detail ?? orders.find(o => o.id === selectedId) ?? null;
  const stepIndex = selected ? steps.indexOf(selected.statut) : -1;

  return (
    <div className="flex gap-6">
      {/* List */}
      <div className={`flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 flex flex-col ${selected ? 'xl:max-w-xl' : ''}`}>
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#00272B] mb-3">{t('clientPortal.orders.history')}</h3>
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${filter === f ? 'bg-[#1AAA3F] text-white' : 'bg-gray-100 text-[#00272B]/60 hover:bg-gray-200'}`}
              >
                {f === ALL ? t('clientPortal.common.all') : status.order(f)}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(order => (
            <div
              key={order.id}
              onClick={() => setSelectedId(selectedId === order.id ? null : order.id)}
              className={`p-5 cursor-pointer hover:bg-gray-50/60 transition-colors ${selectedId === order.id ? 'bg-[#1AAA3F]/5' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-[#00272B]">{order.reference}</p>
                  <p className="text-xs text-[#00272B]/40">{order.date} · {order.paiement}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ml-2 ${statusColors[order.statut]}`}>{status.order(order.statut)}</span>
              </div>
              <p className="text-xs text-[#00272B]/60 truncate">{order.produits || '-'}</p>
              <p className="text-sm font-bold text-[#00272B] mt-1">{order.montant.toLocaleString('fr-FR')} FCFA</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <i className="ri-shopping-bag-line text-3xl text-[#00272B]/20"></i>
              <p className="text-sm text-[#00272B]/40 mt-2">{t('clientPortal.orders.empty')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail + tracking */}
      {selected && (
        <div className="w-96 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00272B]">{t('clientPortal.orders.tracking')}</h3>
            <button onClick={() => setSelectedId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40">
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-[#00272B]/40 mb-0.5">{t('clientPortal.orders.order')}</p>
            <p className="text-sm font-bold text-[#00272B]">{selected.reference}</p>
            <p className="text-xs text-[#00272B]/50">{selected.date}</p>
          </div>

          {/* Progress tracker */}
          {selected.statut !== 'Annulée' && (
            <div>
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-4">{t('clientPortal.orders.progress')}</p>
              <div className="space-y-0">
                {steps.map((s, i) => {
                  const done = i < stepIndex;
                  const current = i === stepIndex;
                  const future = i > stepIndex;
                  return (
                    <div key={s} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          done ? 'bg-[#1AAA3F] border-[#1AAA3F]' :
                          current ? 'bg-white border-[#1AAA3F]' :
                          'bg-white border-gray-200'
                        }`}>
                          {done
                            ? <i className="ri-check-line text-white text-xs"></i>
                            : current
                            ? <div className="w-2.5 h-2.5 bg-[#1AAA3F] rounded-full animate-pulse"></div>
                            : <div className="w-2 h-2 bg-gray-200 rounded-full"></div>}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-[#1AAA3F]' : 'bg-gray-100'}`}></div>
                        )}
                      </div>
                      <div className="pt-1 pb-8 last:pb-0">
                        <p className={`text-sm font-semibold ${current ? 'text-[#1AAA3F]' : future ? 'text-[#00272B]/30' : 'text-[#00272B]'}`}>{status.order(s)}</p>
                        {current && <p className="text-xs text-[#1AAA3F]/70 mt-0.5">{t('clientPortal.orders.currentStep')}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">{t('clientPortal.orders.items')}</p>
            {detailLoading ? (
              <p className="text-xs text-[#00272B]/40">{t('clientPortal.orders.loadingDetail')}</p>
            ) : selected.items?.length ? (
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-xs font-medium text-[#00272B] truncate">{item.name}</p>
                      <p className="text-xs text-[#00272B]/40">x{item.quantity} · {item.unitPrice.toLocaleString('fr-FR')} {t('clientPortal.orders.perUnit')}</p>
                    </div>
                    <p className="text-xs font-bold text-[#00272B]">{(item.quantity * item.unitPrice).toLocaleString('fr-FR')} F</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#00272B]/40">{selected.produits || t('clientPortal.orders.detailUnavailable')}</p>
            )}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-bold text-[#00272B]">{t('clientPortal.common.total')}</p>
              <p className="text-sm font-bold text-[#1AAA3F]">{selected.montant.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>

          {selected.adresseLivraison && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40 mb-0.5">{t('clientPortal.orders.deliveryTo')}</p>
              <p className="text-sm font-medium text-[#00272B]">{selected.adresseLivraison}</p>
            </div>
          )}

          <Link
            to="/espace-client/factures"
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#1AAA3F] text-[#1AAA3F] text-sm font-semibold rounded-xl hover:bg-[#1AAA3F]/5 cursor-pointer transition-all whitespace-nowrap"
          >
            <i className="ri-bill-line"></i>
            {t('clientPortal.orders.seeInvoices')}
          </Link>
        </div>
      )}
    </div>
  );
}
