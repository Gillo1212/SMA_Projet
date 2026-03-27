import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function EmailConfirmePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verify = async () => {
      // TODO: call GET /api/auth/verify-email?token=...
      await new Promise(r => setTimeout(r, 1500));
      if (token) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      navigate('/espace-client/connexion');
      return;
    }
    const t = setTimeout(() => setCountdown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9f4] to-white font-['Inter'] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-10">
          <Link to="/">
            <img src="https://static.readdy.ai/image/1aadd1df13f4328f806374f408610489/60a62dc5b844546eccd3f93680ad2ab4.png" alt="SMALIM" className="h-12 w-auto mx-auto" />
          </Link>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-loader-4-line text-[#1AAA3F] text-4xl animate-spin"></i>
            </div>
            <h1 className="text-xl font-bold text-[#00272B] mb-2">Vérification en cours...</h1>
            <p className="text-[#00272B]/50 text-sm">Nous vérifions votre adresse email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-[#1AAA3F]/10 rounded-full animate-ping opacity-20"></div>
              <div className="w-28 h-28 bg-[#EEFFF2] rounded-full flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-[#1AAA3F] text-5xl"></i>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#00272B] mb-3">Email confirmé !</h1>
            <p className="text-[#00272B]/60 text-sm mb-6">
              Votre compte SMALIM a été activé avec succès. Vous pouvez maintenant accéder à votre espace client.
            </p>

            <div className="p-4 bg-[#EEFFF2] border border-[#1AAA3F]/20 rounded-xl mb-6">
              <p className="text-sm text-[#1AAA3F] font-medium">
                <i className="ri-time-line mr-1"></i>
                Redirection automatique dans <strong>{countdown}s</strong>
              </p>
            </div>

            <Link to="/espace-client/connexion"
              className="w-full py-3.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
              <i className="ri-login-circle-line"></i>
              Accéder à mon espace client maintenant
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-close-circle-line text-red-500 text-4xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#00272B] mb-3">Lien invalide</h1>
            <p className="text-[#00272B]/60 text-sm mb-6">
              Ce lien de confirmation est invalide ou a expiré. Veuillez vous reconnecter pour renvoyer un email de confirmation.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/inscription"
                className="w-full py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
                <i className="ri-user-add-line"></i>
                Créer un nouveau compte
              </Link>
              <Link to="/espace-client/connexion"
                className="w-full py-3 border-2 border-gray-200 text-[#00272B] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap">
                Se connecter
              </Link>
            </div>
          </>
        )}

        <div className="mt-6">
          <Link to="/" className="text-xs text-[#00272B]/30 hover:text-[#1AAA3F] transition-colors">
            <i className="ri-arrow-left-line mr-1"></i>Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
