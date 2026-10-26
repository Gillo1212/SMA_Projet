import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuotes } from '../../../hooks/useQuotes';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Toasts, { useToasts } from '../../../components/admin/Toasts';
import { useStatusLabels } from '../../../i18n/useStatusLabels';
import type { Quote, QuoteStatus } from '../../../types/models';

const STATUS_STYLES: Record<QuoteStatus, { pill: string; dot: string }> = {
  'Nouveau':      { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'En cours':     { pill: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  'Devis envoyé': { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Accepté':      { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Refusé':       { pill: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Expiré':       { pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

/**
 * Statut affiché : une proposition dont la validité est passée n'attend plus
 * de réponse (le backend la refuse), même si l'équipe ne l'a pas encore clôturée.
 */
function displayStatus(q: Quote): QuoteStatus {
  if (q.statut === 'Devis envoyé' && q.validite && new Date(q.validite) < new Date()) return 'Expiré';
  return q.statut;
}

type Filter = 'all' | 'toAnswer' | 'inProgress' | 'closed';
const MATCHES: Record<Filter, (s: QuoteStatus) => boolean> = {
  all: () => true,
  toAnswer: s => s === 'Devis envoyé',
  inProgress: s => s === 'Nouveau' || s === 'En cours',
  closed: s => s === 'Accepté' || s === 'Refusé' || s === 'Expiré',
};

/** Étape atteinte (0 à 3) dans : reçue → étude → proposition → réponse */
function stepOf(q: Quote, s: QuoteStatus): number {
  if (s === 'Nouveau') return 0;
  if (s === 'En cours') return 1;
  if (s === 'Devis envoyé') return 2;
  return q.montantPropose ? 3 : 1;
}

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

function StatusPill({ statut }: { statut: QuoteStatus }) {
  const status = useStatusLabels();
  const s = STATUS_STYLES[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {status.quote(statut)}
    </span>
  );
}

export default function ClientDevisPage() {
  const { t } = useTranslation();
  const { quotes, isLoading, error, refetch, updateStatus } = useQuotes({ limit: 100 });
  const { toasts, notify, dismiss } = useToasts();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withStatus = useMemo(() => quotes.map(q => ({ quote: q, statut: displayStatus(q) })), [quotes]);
  const filtered = withStatus.filter(({ statut }) => MATCHES[filter](statut));
  const toAnswer = withStatus.filter(({ statut }) => MATCHES.toAnswer(statut));

  if (isLoading) return <LoadingState label={t('clientPortal.quotes.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const decide = async (quote: Quote, decision: 'Accepté' | 'Refusé') => {
    try {
      await updateStatus(quote.id, decision);
      if (decision === 'Accepté') notify('success', t('clientPortal.quotes.acceptedToast'), t('clientPortal.quotes.acceptedToastSub'));
      else notify('info', t('clientPortal.quotes.declinedToast'), t('clientPortal.quotes.declinedToastSub'));
      return true;
    } catch (e) {
      notify('error', t('clientPortal.quotes.errorToast'), e instanceof Error ? e.message : t('clientPortal.quotes.errorToastSub'));
      return false;
    }
  };

  const selected = withStatus.find(({ quote }) => quote.id === selectedId) ?? null;
  const filters: Filter[] = ['all', 'toAnswer', 'inProgress', 'closed'];

  return (
    <div className="space-y-5">
      {toAnswer.length > 0 && (
        <button
          type="button" onClick={() => setSelectedId(toAnswer[0].quote.id)}
          className="w-full text-left flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:border-indigo-300 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
            <i className="ri-mail-open-line text-xl text-indigo-600"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-indigo-900">{t('clientPortal.quotes.awaitingBanner', { count: toAnswer.length })}</p>
            <p className="text-xs text-indigo-800/70">{t('clientPortal.quotes.awaitingBannerHint')}</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-4 h-9 rounded-lg bg-indigo-600 text-white text-sm font-semibold">
            {t('clientPortal.quotes.answer')}<i className="ri-arrow-right-s-line"></i>
          </span>
        </button>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto" role="tablist">
          {filters.map(f => (
            <button
              key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filter === f ? 'bg-[#00272B] text-white' : 'bg-white border border-gray-100 text-[#00272B]/60 hover:bg-gray-50'
              }`}
            >
              {t(`clientPortal.quotes.filters.${f}`)}
              <span className={`px-1.5 rounded ${filter === f ? 'bg-white/20' : 'bg-gray-50 text-[#00272B]/50'}`}>
                {withStatus.filter(({ statut }) => MATCHES[f](statut)).length}
              </span>
            </button>
          ))}
        </div>
        <Link
          to="/machines/devis"
          className="flex items-center gap-2 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] whitespace-nowrap"
        >
          <i className="ri-add-line"></i>{t('clientPortal.quotes.newRequest')}
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="ri-file-list-3-line"
          title={quotes.length === 0 ? t('clientPortal.quotes.emptyTitle') : t('clientPortal.quotes.emptyFilter')}
          description={quotes.length === 0 ? t('clientPortal.quotes.emptyHint') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(({ quote, statut }) => {
            const step = stepOf(quote, statut);
            const answerable = statut === 'Devis envoyé';
            return (
              <button
                key={quote.id} type="button" onClick={() => setSelectedId(quote.id)}
                className={`text-left bg-white rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-sm transition-all cursor-pointer ${
                  answerable ? 'border-indigo-200 hover:border-indigo-300' : 'border-gray-100 hover:border-[#1AAA3F]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#00272B] truncate">{quote.machine || '-'}</p>
                    <p className="text-xs text-[#00272B]/40">{quote.reference} · {quote.date} · {t('clientPortal.quotes.units', { count: quote.quantite })}</p>
                  </div>
                  <StatusPill statut={statut} />
                </div>

                {/* Avancement en 4 étapes */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {[0, 1, 2, 3].map(i => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full ${
                      i > step ? 'bg-gray-100'
                        : statut === 'Refusé' && i === 3 ? 'bg-red-400'
                        : statut === 'Expiré' && i === 3 ? 'bg-gray-300'
                        : 'bg-[#1AAA3F]'
                    }`}></span>
                  ))}
                </div>

                <div className="flex items-end justify-between gap-3 mt-auto">
                  {quote.montantPropose ? (
                    <div>
                      <p className="text-xs text-[#00272B]/40">{t('clientPortal.quotes.proposedAmount')}</p>
                      <p className="text-base font-bold text-[#00272B]">{fcfa(quote.montantPropose)}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#00272B]/45 line-clamp-2">{quote.message}</p>
                  )}
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
                    answerable ? 'px-3 h-8 rounded-lg bg-indigo-600 text-white' : 'text-[#1AAA3F]'
                  }`}>
                    {answerable ? t('clientPortal.quotes.answer') : t('clientPortal.quotes.details')}
                    <i className="ri-arrow-right-s-line"></i>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <ClientQuoteModal
          key={selected.quote.id}
          quote={selected.quote}
          statut={selected.statut}
          onClose={() => setSelectedId(null)}
          onDecide={decision => decide(selected.quote, decision)}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} dismissLabel={t('clientPortal.common.dismiss')} />
    </div>
  );
}

interface ClientQuoteModalProps {
  quote: Quote;
  statut: QuoteStatus;
  onClose: () => void;
  onDecide: (decision: 'Accepté' | 'Refusé') => Promise<boolean>;
}

function ClientQuoteModal({ quote, statut, onClose, onDecide }: ClientQuoteModalProps) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<null | 'Accepté' | 'Refusé'>(null);
  const [busy, setBusy] = useState(false);

  const step = stepOf(quote, statut);
  const answerable = statut === 'Devis envoyé';
  const validity = quote.validite ? new Date(quote.validite).toLocaleDateString(i18n.language) : null;

  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    const ok = await onDecide(confirm);
    setBusy(false);
    if (ok) setConfirm(null);
  };

  const steps = [
    t('clientPortal.quotes.steps.received'),
    t('clientPortal.quotes.steps.processing'),
    t('clientPortal.quotes.steps.sent'),
    t('clientPortal.quotes.steps.answer'),
  ];

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="lg"
        closeLabel={t('clientPortal.common.close')}
        title={quote.machine || quote.reference}
        subtitle={`${quote.reference} · ${t('clientPortal.quotes.requestedOn', { date: quote.date })}`}
        headerExtra={<StatusPill statut={statut} />}
        footer={answerable ? (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setConfirm('Refusé')}
              className="px-4 h-10 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50">
              <i className="ri-close-line mr-1"></i>{t('clientPortal.quotes.decline')}
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirm('Accepté')}
              className="px-5 h-10 rounded-lg bg-[#1AAA3F] text-white text-sm font-semibold hover:bg-[#158f35] cursor-pointer disabled:opacity-60">
              <i className="ri-check-line mr-1"></i>{t('clientPortal.quotes.accept')}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-3">
            <Link to="/espace-client/support" className="text-sm text-[#00272B]/60 hover:text-[#1AAA3F]">
              <i className="ri-customer-service-2-line mr-1"></i>{t('clientPortal.quotes.contactUs')}
            </Link>
          </div>
        )}
      >
        {/* Étapes */}
        <ol className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((label, i) => {
            const reached = i <= step;
            const negative = i === 3 && (statut === 'Refusé' || statut === 'Expiré');
            return (
              <li key={label} className="flex flex-col gap-1.5">
                <span className={`h-1.5 rounded-full ${!reached ? 'bg-gray-100' : negative ? (statut === 'Refusé' ? 'bg-red-400' : 'bg-gray-300') : 'bg-[#1AAA3F]'}`}></span>
                <span className={`text-[11px] font-semibold leading-tight ${reached ? 'text-[#00272B]/70' : 'text-[#00272B]/30'}`}>{label}</span>
              </li>
            );
          })}
        </ol>

        {/* Proposition */}
        <section className={`rounded-xl p-5 mb-5 border ${answerable ? 'bg-indigo-50/60 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}>
          <h3 className="text-xs font-semibold text-[#00272B]/45 uppercase tracking-wide mb-2">{t('clientPortal.quotes.proposal')}</h3>
          {quote.montantPropose ? (
            <>
              <p className="text-xs text-[#00272B]/50">{t('clientPortal.quotes.proposedAmount')}</p>
              <p className="text-2xl font-bold text-[#00272B]">{fcfa(quote.montantPropose)}</p>
              {validity && (
                <p className={`text-xs mt-1 ${statut === 'Expiré' ? 'text-red-600' : 'text-[#00272B]/50'}`}>
                  {statut === 'Expiré' ? t('clientPortal.quotes.expiredOn', { date: validity }) : answerable ? t('clientPortal.quotes.validUntil', { date: validity }) : null}
                </p>
              )}
              {quote.notes && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-[#1AAA3F]/20">
                  <p className="text-xs font-semibold text-[#1AAA3F] mb-1"><i className="ri-message-2-line mr-1"></i>{t('clientPortal.common.smalimReply')}</p>
                  <p className="text-sm text-[#00272B]/75 leading-relaxed whitespace-pre-line">{quote.notes}</p>
                </div>
              )}
              {statut === 'Accepté' && (
                <p className="mt-4 text-sm text-emerald-700 font-medium flex items-start gap-2">
                  <i className="ri-checkbox-circle-fill mt-0.5"></i>
                  <span>{t('clientPortal.quotes.youAccepted')}. {t('clientPortal.quotes.acceptedNext')}</span>
                </p>
              )}
              {statut === 'Refusé' && (
                <p className="mt-4 text-sm text-red-600 font-medium flex items-center gap-2"><i className="ri-close-circle-line"></i>{t('clientPortal.quotes.youDeclined')}</p>
              )}
              {statut === 'Expiré' && <p className="mt-3 text-sm text-[#00272B]/60">{t('clientPortal.quotes.expiredHint')}</p>}
            </>
          ) : (
            <p className="text-sm text-[#00272B]/60 flex items-start gap-2">
              <i className="ri-time-line mt-0.5 text-[#1AAA3F]"></i>{t('clientPortal.quotes.waitingProposal')}
            </p>
          )}
        </section>

        {/* Demande */}
        <section>
          <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">{t('clientPortal.quotes.yourRequest')}</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-3 sm:col-span-1 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40">{t('clientPortal.quotes.machine')}</p>
              <p className="text-sm font-semibold text-[#00272B]">{quote.machine || '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40">{t('clientPortal.quotes.quantity')}</p>
              <p className="text-sm font-semibold text-[#00272B]">{quote.quantite}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-[#00272B]/40">{t('clientPortal.quotes.budget')}</p>
              <p className="text-sm font-semibold text-[#00272B]">{quote.budget ? fcfa(quote.budget) : '-'}</p>
            </div>
          </div>
          <p className="text-xs text-[#00272B]/40 mb-1">{t('clientPortal.quotes.message')}</p>
          <p className="text-sm text-[#00272B]/70 leading-relaxed whitespace-pre-line p-3 border border-gray-100 rounded-xl max-h-40 overflow-y-auto">
            {quote.message || t('clientPortal.quotes.noMessage')}
          </p>
        </section>
      </Modal>

      <ConfirmDialog
        open={confirm === 'Accepté'}
        title={t('clientPortal.quotes.confirmAcceptTitle')}
        message={t('clientPortal.quotes.confirmAccept', { amount: (quote.montantPropose ?? 0).toLocaleString('fr-FR') })}
        confirmLabel={t('clientPortal.quotes.accept')}
        cancelLabel={t('clientPortal.common.cancel')}
        closeLabel={t('clientPortal.common.close')}
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={run}
      />
      <ConfirmDialog
        open={confirm === 'Refusé'}
        title={t('clientPortal.quotes.confirmDeclineTitle')}
        message={t('clientPortal.quotes.confirmDecline')}
        confirmLabel={t('clientPortal.quotes.decline')}
        cancelLabel={t('clientPortal.common.cancel')}
        closeLabel={t('clientPortal.common.close')}
        tone="danger"
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={run}
      />
    </>
  );
}
