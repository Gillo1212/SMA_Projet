import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentsService } from '../../../services/payments.service';

/**
 * Écran de simulation de paiement — développement uniquement.
 *
 * Il remplace la page du prestataire quand aucun compte marchand n'est
 * configuré côté backend : on choisit l'issue, puis on est redirigé vers la
 * page de retour comme le ferait Wave ou Orange Money.
 *
 * Le backend refuse la route `/payments/simulate` en production, donc cette
 * page ne peut rien valider hors développement.
 */
export default function PaiementSimulationPage() {
  const [searchParams] = useSearchParams();

  const reference = searchParams.get('reference') ?? '';
  const amount = searchParams.get('amount') ?? '0';
  const currency = searchParams.get('currency') ?? 'XOF';
  const successUrl = searchParams.get('success_url') ?? '/';
  const errorUrl = searchParams.get('error_url') ?? '/';

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (status: 'succeeded' | 'failed' | 'cancelled') => {
    setBusy(status);
    setError(null);
    try {
      await paymentsService.simulate(reference, status);
      window.location.href = status === 'succeeded' ? successUrl : errorUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La simulation a échoué.');
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8">

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <i className="ri-tools-line text-amber-600 text-sm"></i>
          <p className="text-xs font-semibold text-amber-700">
            Simulateur de paiement (développement)
          </p>
        </div>

        <h1 className="text-xl font-bold text-[#00272B] mb-1">Paiement à valider</h1>
        <p className="text-sm text-[#00272B]/50 mb-6">
          Aucun prestataire n’est configuré : choisissez l’issue du paiement.
        </p>

        <div className="p-4 bg-gray-50 rounded-xl mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-[#00272B]/40">Montant</span>
            <span className="text-sm font-bold text-[#00272B]">
              {Number(amount).toLocaleString('fr-FR')} {currency}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-[#00272B]/40 flex-shrink-0">Référence</span>
            <span className="text-xs font-mono text-[#00272B]/70 break-all text-right">
              {reference || '-'}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => decide('succeeded')}
            disabled={!reference || busy !== null}
            className="w-full py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className={`mr-2 ${busy === 'succeeded' ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}`}></i>
            Valider le paiement
          </button>

          <button
            onClick={() => decide('failed')}
            disabled={!reference || busy !== null}
            className="w-full py-3 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-60 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className={`mr-2 ${busy === 'failed' ? 'ri-loader-4-line animate-spin' : 'ri-close-line'}`}></i>
            Simuler un échec
          </button>

          <button
            onClick={() => decide('cancelled')}
            disabled={!reference || busy !== null}
            className="w-full py-2 text-sm text-[#00272B]/40 hover:text-[#00272B]/70 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            Annuler le paiement
          </button>
        </div>

      </div>
    </div>
  );
}
