import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { paymentsService, type PaymentStatusResult } from '../../../services/payments.service';

/**
 * Retour depuis le prestataire de paiement.
 *
 * Le prestataire renvoie le client ici, mais la confirmation fait foi côté
 * serveur via le webhook — qui peut arriver avec quelques secondes de retard.
 * On interroge donc le statut par intervalles jusqu'à ce qu'il soit tranché.
 */

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15; // ~30 secondes

type View = 'pending' | 'succeeded' | 'failed' | 'timeout' | 'error';

export default function PaiementRetourPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const declaredFailure = searchParams.get('echec') === '1';

  const [view, setView] = useState<View>('pending');
  const [status, setStatus] = useState<PaymentStatusResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  const finalize = useCallback((result: PaymentStatusResult) => {
    setStatus(result);
    if (result.status === 'succeeded') setView('succeeded');
    else if (result.status === 'processing' || result.status === 'pending') setView('pending');
    else {
      setView('failed');
      setMessage(result.failureReason ?? null);
    }
  }, []);

  useEffect(() => {
    if (!reference) {
      setView('error');
      setMessage(t('paymentReturn.missingReference'));
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await paymentsService.getStatus(reference);
        if (cancelled) return;

        // Un statut définitif arrête l'interrogation
        if (result.status !== 'pending' && result.status !== 'processing') {
          finalize(result);
          return;
        }

        setStatus(result);
        attemptsRef.current += 1;

        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setView('timeout');
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setView('error');
        setMessage(err instanceof Error ? err.message : t('paymentReturn.statusUnavailable'));
      }
    };

    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [reference, finalize]);

  const orderLabel = status?.orderNumber ? `${t('checkout.orderLabel')} ${status.orderNumber}` : null;

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <Navbar />

      <div className="pt-32 pb-24">
        <div className="max-w-lg mx-auto px-6 text-center">

          {view === 'pending' && (
            <>
              <div className="w-20 h-20 bg-[#EEFFF2] rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-loader-4-line text-[#1AAA3F] text-4xl animate-spin"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('paymentReturn.checking')}</h1>
              <p className="text-[#00272B]/60 text-sm leading-relaxed">
                {t('paymentReturn.checkingHint')}
              </p>
              {orderLabel && <p className="text-sm text-[#00272B]/40 mt-4">{orderLabel}</p>}
            </>
          )}

          {view === 'succeeded' && (
            <>
              <div className="w-20 h-20 bg-[#EEFFF2] rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-checkbox-circle-line text-[#1AAA3F] text-5xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('paymentReturn.successTitle')}</h1>
              <p className="text-[#00272B]/60 text-sm leading-relaxed mb-2">
                {t('paymentReturn.successHint')}
              </p>
              {status && (
                <p className="text-[#00272B] font-semibold mb-6">
                  {status.orderNumber} · {status.amount.toLocaleString('fr-FR')} {status.currency}
                </p>
              )}
              <div className="flex flex-col gap-3">
                <Link
                  to="/espace-client/commandes"
                  className="w-full py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all whitespace-nowrap"
                >
                  {t('paymentReturn.trackOrder')}
                </Link>
                <Link to="/produits" className="text-sm text-[#00272B]/50 hover:text-[#1AAA3F] transition-colors">
                  {t('paymentReturn.continueShopping')}
                </Link>
              </div>
            </>
          )}

          {view === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-close-circle-line text-red-500 text-5xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('paymentReturn.failedTitle')}</h1>
              <p className="text-[#00272B]/60 text-sm leading-relaxed mb-6">
                {message ?? (declaredFailure
                  ? t('paymentReturn.failedInterrupted')
                  : t('paymentReturn.failedUnconfirmed'))}
                {' '}{t('paymentReturn.failedKept')}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/espace-client/commandes"
                  className="w-full py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all whitespace-nowrap"
                >
                  {t('paymentReturn.seeOrders')}
                </Link>
                <Link to="/panier" className="text-sm text-[#00272B]/50 hover:text-[#1AAA3F] transition-colors">
                  {t('paymentReturn.backToCart')}
                </Link>
              </div>
            </>
          )}

          {view === 'timeout' && (
            <>
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-time-line text-amber-500 text-5xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('paymentReturn.timeoutTitle')}</h1>
              <p className="text-[#00272B]/60 text-sm leading-relaxed mb-6">
                {t('paymentReturn.timeoutHint')}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/espace-client/commandes"
                  className="w-full py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all whitespace-nowrap"
                >
                  {t('paymentReturn.trackOrder')}
                </Link>
              </div>
            </>
          )}

          {view === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-error-warning-line text-red-500 text-5xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">{t('paymentReturn.errorTitle')}</h1>
              <p className="text-[#00272B]/60 text-sm leading-relaxed mb-6">{message}</p>
              <Link
                to="/espace-client/commandes"
                className="inline-block px-6 py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all whitespace-nowrap"
              >
                {t('paymentReturn.seeOrders')}
              </Link>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
