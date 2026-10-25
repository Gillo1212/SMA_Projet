import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function ReinitialiserMotDePassePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#1AAA3F]/70', 'bg-[#1AAA3F]'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (strength < 2) {
      setError('Votre mot de passe est trop faible.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Le lien est invalide ou a expiré. Demandez-en un nouveau.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9f4] to-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-[#EEFFF2] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-checkbox-circle-line text-[#1AAA3F] text-5xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#00272B] mb-3">Mot de passe mis à jour !</h1>
          <p className="text-[#00272B]/60 text-sm mb-8">Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/connexion')}
              className="w-full py-3.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              <i className="ri-login-circle-line"></i>
              <span>Se connecter (Admin)</span>
            </button>
            <button
              onClick={() => navigate('/espace-client/connexion')}
              className="w-full py-3.5 border-2 border-[#00272B]/20 text-[#00272B] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              Connexion espace client
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00272B] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border-2 border-white"></div>
        </div>
        <div className="absolute bottom-1/3 left-0 w-1 h-48 bg-[#1AAA3F]"></div>

        <div className="relative z-10">
          <Link to="/"><img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-14 w-auto" /></Link>
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-[#1AAA3F]/15 rounded-2xl flex items-center justify-center mb-8">
            <i className="ri-key-2-line text-[#1AAA3F] text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Créez un nouveau<br /><span className="text-[#1AAA3F]">mot de passe sécurisé</span>
          </h2>
          <div className="space-y-3 mt-8">
            {['Au moins 8 caractères', 'Une majuscule', 'Un chiffre', 'Un caractère spécial'].map((tip, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#1AAA3F]/15 rounded-full flex items-center justify-center">
                  <i className="ri-checkbox-blank-circle-line text-[#1AAA3F] text-xs"></i>
                </div>
                <span className="text-white/60 text-sm">{tip}</span>
              </div>
            ))}
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

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#00272B] mb-2">Nouveau mot de passe</h1>
            <p className="text-[#00272B]/50 text-sm">Choisissez un mot de passe fort pour sécuriser votre compte.</p>
          </div>

          {!token && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <p className="text-sm text-amber-700"><i className="ri-error-warning-line mr-2"></i>Lien de réinitialisation invalide ou expiré. Veuillez refaire la demande.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-5">
              <i className="ri-error-warning-line text-red-500 flex-shrink-0"></i>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#00272B] mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-[#00272B]/40"></i>
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B]/70 cursor-pointer">
                  <i className={showPwd ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(level => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all ${strength >= level ? strengthColors[strength] : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-amber-500' : 'text-[#1AAA3F]'}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#00272B] mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-2-line text-[#00272B]/40"></i>
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full h-12 pl-11 pr-12 border rounded-xl text-sm focus:outline-none transition-all ${
                    confirm.length > 0
                      ? password === confirm
                        ? 'border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10'
                        : 'border-red-300 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B]/70 cursor-pointer">
                  <i className={showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
                {confirm.length > 0 && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className={`text-sm ${password === confirm ? 'ri-checkbox-circle-line text-[#1AAA3F]' : 'ri-close-circle-line text-red-400'}`}></i>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <><i className="ri-loader-4-line animate-spin"></i><span>Mise à jour...</span></>
              ) : (
                <><i className="ri-shield-keyhole-line"></i><span>Réinitialiser mon mot de passe</span></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/connexion" className="text-sm text-[#00272B]/40 hover:text-[#1AAA3F] transition-colors">
              <i className="ri-arrow-left-line mr-1"></i>Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
