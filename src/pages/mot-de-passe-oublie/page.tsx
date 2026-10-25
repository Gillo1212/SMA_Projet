import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email, 'client');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'envoyer le lien. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00272B] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border-2 border-white"></div>
        </div>
        <div className="absolute top-1/3 right-0 w-1 h-64 bg-[#1AAA3F]"></div>

        <div className="relative z-10">
          <Link to="/">
            <img
              src="/images/brand/logo-corporate.png"
              alt="SMALIM"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-[#1AAA3F]/15 rounded-2xl flex items-center justify-center mb-8">
            <i className="ri-lock-password-line text-[#1AAA3F] text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Récupérez l&apos;accès<br />
            <span className="text-[#1AAA3F]">à votre compte</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Entrez votre adresse email et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
          </p>
          <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 bg-[#1AAA3F]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-shield-check-line text-[#1AAA3F]"></i>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Lien sécurisé valable 1h</p>
              <p className="text-white/40 text-xs">Le lien expire après 60 minutes pour votre sécurité</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/20 text-xs">© 2026 SMALIM</div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/"><img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-10 w-auto" /></Link>
          </div>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#00272B] mb-2">Mot de passe oublié</h1>
                <p className="text-[#00272B]/50 text-sm">Saisissez votre email pour recevoir les instructions de réinitialisation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                    <i className="ri-error-warning-line text-red-500 mt-0.5"></i>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-2">Adresse email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-mail-line text-[#00272B]/40"></i>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="votre@email.com"
                      className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl text-sm text-[#00272B] placeholder-gray-400 focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  {loading ? (
                    <><i className="ri-loader-4-line animate-spin"></i><span>Envoi en cours...</span></>
                  ) : (
                    <><i className="ri-send-plane-line"></i><span>Envoyer le lien de réinitialisation</span></>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3">
                <Link to="/connexion" className="text-sm text-[#1AAA3F] hover:underline font-medium">
                  <i className="ri-arrow-left-line mr-1"></i>Retour à la connexion admin
                </Link>
                <Link to="/espace-client/connexion" className="text-sm text-[#00272B]/40 hover:text-[#1AAA3F] transition-colors">
                  Accès espace client
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#EEFFF2] rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-mail-check-line text-[#1AAA3F] text-4xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#00272B] mb-3">Email envoyé !</h1>
              <p className="text-[#00272B]/60 text-sm leading-relaxed mb-2">
                Un lien de réinitialisation a été envoyé à
              </p>
              <p className="text-[#00272B] font-semibold text-sm mb-6">{email}</p>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6 text-left">
                <p className="text-xs font-semibold text-amber-700 mb-1">Points à vérifier</p>
                <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                  <li>Vérifiez vos dossiers spam / courrier indésirable</li>
                  <li>Le lien est valable pendant 1 heure</li>
                  <li>L&apos;email peut prendre quelques minutes à arriver</li>
                </ul>
              </div>
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-sm text-[#1AAA3F] hover:underline cursor-pointer"
              >
                Utiliser une autre adresse email
              </button>
              <div className="mt-4">
                <Link to="/connexion" className="text-sm text-[#00272B]/40 hover:text-[#1AAA3F] transition-colors">
                  <i className="ri-arrow-left-line mr-1"></i>Retour à la connexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
