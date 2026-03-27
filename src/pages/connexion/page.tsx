import { useEffect, FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

export default function ConnexionPage() {
  const navigate = useNavigate();
  const { login, loginError, clearLoginError, isAuthenticated, isLoading } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirige si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearLoginError();
    setSubmitting(true);
    const ok = await login({ email, password });
    setSubmitting(false);
    if (ok) navigate('/admin');
  };

  return (
    <div className="min-h-screen flex font-['Inter']">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00272B] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute top-40 left-32 w-48 h-48 rounded-full border border-white"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-20 right-32 w-64 h-64 rounded-full border border-white"></div>
        </div>
        <div className="absolute top-1/3 right-0 w-1 h-64 bg-[#1AAA3F]"></div>
        <div className="absolute bottom-1/3 left-0 w-1 h-48 bg-[#1AAA3F]"></div>

        <div className="relative z-10">
          <Link to="/">
            <img
              src="https://static.readdy.ai/image/1aadd1df13f4328f806374f408610489/60a62dc5b844546eccd3f93680ad2ab4.png"
              alt="SMALIM"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1AAA3F]/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#1AAA3F] rounded-full animate-pulse"></div>
            <span className="text-[#1AAA3F] text-sm font-medium">Espace Administration</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gérez votre activité<br />
            <span className="text-[#1AAA3F]">en toute simplicité</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Pilotez vos machines, suivez vos commandes et gérez vos clients depuis un seul tableau de bord.
          </p>
          <div className="space-y-4">
            {[
              { icon: 'ri-dashboard-line', text: 'Tableau de bord en temps réel' },
              { icon: 'ri-file-list-3-line', text: 'Suivi des commandes et devis' },
              { icon: 'ri-customer-service-2-line', text: 'Gestion des clients' },
              { icon: 'ri-bar-chart-line', text: 'Analyses et rapports détaillés' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1AAA3F]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-[#1AAA3F]`}></i>
                </div>
                <span className="text-white/70 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 bg-[#1AAA3F]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-shield-check-line text-[#1AAA3F]"></i>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Accès sécurisé</p>
              <p className="text-white/50 text-xs">Connexion chiffrée SSL – Données protégées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/"><img src="https://static.readdy.ai/image/1aadd1df13f4328f806374f408610489/60a62dc5b844546eccd3f93680ad2ab4.png" alt="SMALIM" className="h-10 w-auto" /></Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#00272B] mb-2">Connexion</h1>
            <p className="text-[#00272B]/60 text-sm">Bienvenue ! Connectez-vous à votre espace admin.</p>
          </div>

          {loginError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-error-warning-line text-red-500"></i>
              </div>
              <p className="text-red-600 text-sm">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="admin@smalim.com"
                  className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl text-sm text-[#00272B] placeholder-gray-400 focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#00272B] mb-2">Mot de passe</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-[#00272B]/40"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 border border-gray-200 rounded-xl text-sm text-[#00272B] placeholder-gray-400 focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B]/70 cursor-pointer"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#1AAA3F] cursor-pointer" />
                <span className="text-sm text-[#00272B]/60">Se souvenir de moi</span>
              </label>
              <Link to="/mot-de-passe-oublie" className="text-sm text-[#1AAA3F] hover:underline font-medium">Mot de passe oublié ?</Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {submitting ? (
                <><i className="ri-loader-4-line animate-spin"></i><span>Connexion en cours...</span></>
              ) : (
                <><i className="ri-login-circle-line"></i><span>Se connecter</span></>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-[#00272B]/50 uppercase tracking-wide mb-2">Identifiants de démonstration</p>
            <div className="space-y-1">
              <p className="text-xs text-[#00272B]/60">Email: <span className="font-mono font-medium text-[#00272B]">admin@smalim.com</span></p>
              <p className="text-xs text-[#00272B]/60">Mot de passe: <span className="font-mono font-medium text-[#00272B]">smalim2024</span></p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-[#00272B]/40 hover:text-[#1AAA3F] transition-colors">
              <i className="ri-arrow-left-line mr-1"></i>Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
