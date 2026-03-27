import { useState } from 'react';
import { apiClient } from '../../../../services/apiClient';

export default function SecuritySettings() {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.new_password);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#1AAA3F]', 'bg-[#1AAA3F]'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    if (form.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await apiClient.patch('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Changement de mot de passe */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <i className="ri-lock-password-line text-red-500 text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Changer le mot de passe</h3>
            <p className="text-xs text-[#00272B]/40">Votre mot de passe de connexion au backoffice</p>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg mb-5 text-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            <i className={message.type === 'success' ? 'ri-check-circle-line' : 'ri-error-warning-line'}></i>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'} name="current_password" value={form.current_password}
                onChange={handleChange} required
                className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                placeholder="••••••••"
              />
              <button
                type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] cursor-pointer"
              >
                <i className={showCurrent ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'} name="new_password" value={form.new_password}
                onChange={handleChange} required minLength={8}
                className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                placeholder="Min. 8 caractères"
              />
              <button
                type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] cursor-pointer"
              >
                <i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
            {form.new_password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${['', 'text-red-500', 'text-amber-500', 'text-[#1AAA3F]', 'text-[#1AAA3F]'][strength]}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Confirmer le nouveau mot de passe</label>
            <input
              type="password" name="confirm_password" value={form.confirm_password}
              onChange={handleChange} required
              className={`w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:border-[#1AAA3F] text-[#00272B] ${
                form.confirm_password && form.confirm_password !== form.new_password
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            {form.confirm_password && form.confirm_password !== form.new_password && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-lock-line"></i>}
              {saving ? 'Modification…' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>

      {/* Bonnes pratiques */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-[#00272B] mb-4">Recommandations de sécurité</h3>
        <div className="space-y-3">
          {[
            { icon: 'ri-check-circle-fill', color: 'text-[#1AAA3F]', text: 'Utilisez au moins 12 caractères avec majuscules, chiffres et symboles' },
            { icon: 'ri-check-circle-fill', color: 'text-[#1AAA3F]', text: 'Ne réutilisez pas un ancien mot de passe' },
            { icon: 'ri-check-circle-fill', color: 'text-[#1AAA3F]', text: 'Changez votre mot de passe tous les 3 mois' },
            { icon: 'ri-check-circle-fill', color: 'text-[#1AAA3F]', text: 'Ne partagez jamais vos identifiants avec d\'autres personnes' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                <i className={`${tip.icon} ${tip.color} text-sm`}></i>
              </div>
              <p className="text-xs text-[#00272B]/60 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
