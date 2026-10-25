import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function ConfirmationEmailPage() {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email;
  const email = stateEmail ?? 'votre adresse email';

  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'ko'; message: string } | null>(null);

  const handleResend = async () => {
    // Sans adresse en state (accès direct à l'URL), on ne peut rien renvoyer.
    if (!stateEmail) {
      setFeedback({
        type: 'ko',
        message: 'Adresse inconnue. Reconnectez-vous pour recevoir un nouveau lien.',
      });
      return;
    }

    setResending(true);
    setFeedback(null);
    try {
      const message = await authService.resendVerification(stateEmail);
      setFeedback({ type: 'ok', message });
    } catch (err) {
      setFeedback({
        type: 'ko',
        message: err instanceof Error ? err.message : 'Envoi impossible. Réessayez dans un instant.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9f4] to-white px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-10">
          <Link to="/">
            <img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-12 w-auto mx-auto" />
          </Link>
        </div>

        {/* Icon animé */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 bg-[#1AAA3F]/10 rounded-full animate-ping opacity-30"></div>
          <div className="relative w-28 h-28 bg-[#EEFFF2] rounded-full flex items-center justify-center">
            <i className="ri-mail-send-line text-[#1AAA3F] text-5xl"></i>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#00272B] mb-3">Vérifiez votre boîte mail</h1>
        <p className="text-[#00272B]/60 text-sm mb-1">Un email de confirmation a été envoyé à</p>
        <p className="text-[#00272B] font-semibold text-base mb-6 break-all">{email}</p>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl text-left mb-6" style={{boxShadow: '0 4px 16px rgba(0,39,43,0.06)'}}>
          <p className="text-sm font-semibold text-[#00272B] mb-3 flex items-center gap-2">
            <i className="ri-information-line text-[#1AAA3F]"></i>
            Étapes suivantes
          </p>
          <ol className="space-y-2.5">
            {[
              'Ouvrez l\'email de SMALIM dans votre boîte de réception',
              'Cliquez sur le bouton "Confirmer mon compte"',
              'Vous serez redirigé vers votre espace client',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#1AAA3F]/10 rounded-full text-[#1AAA3F] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-[#00272B]/70">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6 text-left">
          <p className="text-xs text-amber-700 flex items-start gap-2">
            <i className="ri-spam-2-line mt-0.5 flex-shrink-0"></i>
            <span>Vous ne trouvez pas l&apos;email ? Vérifiez votre dossier <strong>spam</strong> ou <strong>courrier indésirable</strong>. L&apos;email peut prendre quelques minutes.</span>
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl border text-sm text-left ${
              feedback.type === 'ok'
                ? 'bg-[#EEFFF2] border-[#1AAA3F]/20 text-[#1AAA3F]'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            <i className={`mr-2 ${feedback.type === 'ok' ? 'ri-mail-check-line' : 'ri-error-warning-line'}`}></i>
            {feedback.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-3 border-2 border-[#1AAA3F]/30 text-[#1AAA3F] text-sm font-semibold rounded-xl hover:bg-[#EEFFF2] disabled:opacity-60 transition-all cursor-pointer whitespace-nowrap"
          >
            <i className={`mr-2 ${resending ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'}`}></i>
            {resending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
          </button>
          <Link to="/espace-client/connexion"
            className="w-full py-3 bg-[#00272B] text-white text-sm font-semibold rounded-xl hover:bg-[#003a40] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
            <i className="ri-login-circle-line"></i>
            Aller à la connexion
          </Link>
        </div>

        <div className="mt-6">
          <Link to="/" className="text-xs text-[#00272B]/30 hover:text-[#1AAA3F] transition-colors">
            <i className="ri-arrow-left-line mr-1"></i>Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
