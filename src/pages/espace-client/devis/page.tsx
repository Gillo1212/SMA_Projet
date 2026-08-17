import { useState } from 'react';
import { useQuotes } from '../../../hooks/useQuotes';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';

const statusColors: Record<string, string> = {
  'Nouveau': 'bg-amber-50 text-amber-700 border-amber-200',
  'En cours': 'bg-sky-50 text-sky-700 border-sky-200',
  'Devis envoyé': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Accepté': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Refusé': 'bg-red-50 text-red-700 border-red-200',
  'Expiré': 'bg-gray-100 text-gray-600 border-gray-200',
};

const progressMap: Record<string, number> = {
  'Nouveau': 20,
  'En cours': 45,
  'Devis envoyé': 70,
  'Accepté': 100,
  'Refusé': 100,
  'Expiré': 100,
};

interface Toast {
  type: 'success' | 'error';
  message: string;
  sub: string;
}

export default function ClientDevisPage() {
  const { quotes, isLoading, error, refetch, updateStatus } = useQuotes();
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  function showToast(t: Toast) {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleDecision(quoteId: string, decision: 'Accepté' | 'Refusé') {
    setLoading(quoteId + decision);
    try {
      await updateStatus(quoteId, decision);
      showToast(
        decision === 'Accepté'
          ? { type: 'success', message: 'Devis accepté !', sub: 'Notre équipe vous contactera très prochainement.' }
          : { type: 'error', message: 'Devis refusé', sub: 'Vous pouvez soumettre une nouvelle demande.' }
      );
    } catch (e) {
      // Le hook resynchronise déjà la liste en cas d'échec
      showToast({
        type: 'error',
        message: 'Erreur',
        sub: e instanceof Error ? e.message : 'Une erreur est survenue, veuillez réessayer.',
      });
    } finally {
      setLoading(null);
    }
  }

  if (isLoading) return <LoadingState label="Chargement de vos devis…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#00272B]/50">{quotes.length} demande(s) de devis</p>
        <a
          href="/machines/devis"
          className="flex items-center gap-2 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer transition-all whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Nouvelle demande
        </a>
      </div>

      {quotes.length === 0 && (
        <EmptyState
          icon="ri-file-list-3-line"
          title="Aucune demande de devis"
          description="Demandez un devis depuis le catalogue pour un projet sur mesure."
        />
      )}

      {quotes.map(quote => (
        <div key={quote.id} className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              <i className="ri-settings-2-line text-2xl text-[#00272B]/20"></i>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-[#00272B]">{quote.machine}</p>
                  <p className="text-xs text-[#00272B]/40">
                    {quote.reference} · {quote.date} · {quote.quantite} unité(s)
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ml-3 ${statusColors[quote.statut]}`}>
                  {quote.statut}
                </span>
              </div>

              <p className="text-sm text-[#00272B]/60 mb-4 leading-relaxed">{quote.message}</p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-[#00272B]/40">Progression du traitement</p>
                  <p className="text-xs font-semibold text-[#1AAA3F]">{progressMap[quote.statut]}%</p>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${quote.statut === 'Refusé' ? 'bg-red-400' : 'bg-[#1AAA3F]'}`}
                    style={{ width: `${progressMap[quote.statut]}%` }}
                  ></div>
                </div>
              </div>

              {/* Admin response */}
              {quote.notes && (
                <div className="p-3 bg-[#f0f9f4] rounded-xl border border-[#1AAA3F]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="ri-message-2-line text-[#1AAA3F] text-xs"></i>
                    <p className="text-xs font-semibold text-[#1AAA3F]">Réponse SMALIM</p>
                  </div>
                  <p className="text-sm text-[#00272B]/70 leading-relaxed">{quote.notes}</p>
                </div>
              )}

              {/* Montant proposé + Actions */}
              {quote.montantPropose && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs text-emerald-700/70">Montant proposé</p>
                    <p className="text-base font-bold text-emerald-700">{quote.montantPropose.toLocaleString('fr-FR')} FCFA</p>
                  </div>

                  {quote.statut === 'Devis envoyé' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(quote.id, 'Accepté')}
                        disabled={loading === quote.id + 'Accepté'}
                        className="px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center gap-2 transition-all"
                      >
                        {loading === quote.id + 'Accepté' ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-check-line"></i>
                        )}
                        Accepter
                      </button>
                      <button
                        onClick={() => handleDecision(quote.id, 'Refusé')}
                        disabled={loading === quote.id + 'Refusé'}
                        className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center gap-2 transition-all"
                      >
                        {loading === quote.id + 'Refusé' ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-close-line"></i>
                        )}
                        Refuser
                      </button>
                    </div>
                  )}

                  {quote.statut === 'Accepté' && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <i className="ri-checkbox-circle-fill text-base"></i>
                      Vous avez accepté ce devis
                    </div>
                  )}

                  {quote.statut === 'Refusé' && (
                    <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                      <i className="ri-close-circle-line text-base"></i>
                      Vous avez refusé ce devis
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
          toast.type === 'success' ? 'bg-[#00272B]' : 'bg-red-900'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            toast.type === 'success' ? 'bg-[#1AAA3F]/20' : 'bg-red-500/20'
          }`}>
            <i className={`${toast.type === 'success' ? 'ri-checkbox-circle-line text-[#1AAA3F]' : 'ri-error-warning-line text-red-300'}`}></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{toast.message}</p>
            <p className="text-xs text-white/60">{toast.sub}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-white/40 hover:text-white cursor-pointer w-5 h-5 flex items-center justify-center">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}
    </div>
  );
}
