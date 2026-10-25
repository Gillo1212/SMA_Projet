import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { settingsService, type PromoCodeInput } from '../../../../services/settings.service';
import type { PromoCode } from '../../../../types/models';

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as PromoCode['type'],
  value: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
};

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]';

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

function isExpired(promo: PromoCode) {
  return promo.expiresAt !== null && new Date(promo.expiresAt).getTime() < Date.now();
}

function isExhausted(promo: PromoCode) {
  return promo.maxUses !== null && promo.usesCount >= promo.maxUses;
}

export default function PromoCodesSettings() {
  const { user } = useAuthContext();
  const readOnly = user?.role === 'commercial';

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    settingsService
      .getPromoCodes()
      .then(setPromos)
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Chargement impossible'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    const input: PromoCodeInput = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      // Fin de journée : un code « valable jusqu'au 31 » l'est toute la journée du 31
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      isActive: true,
    };
    try {
      const created = await settingsService.createPromoCode(input);
      setPromos(prev => [created, ...prev]);
      setForm(EMPTY_FORM);
      flash(`Code ${created.code} créé.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (promo: PromoCode) => {
    setBusyId(promo.id);
    try {
      const updated = await settingsService.updatePromoCode(promo.id, { isActive: !promo.isActive });
      setPromos(prev => prev.map(p => (p.id === promo.id ? updated : p)));
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Modification impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    if (!window.confirm(`Supprimer le code ${promo.code} ?`)) return;
    setBusyId(promo.id);
    try {
      const { deactivated } = await settingsService.deletePromoCode(promo.id);
      if (deactivated) {
        setPromos(prev => prev.map(p => (p.id === promo.id ? { ...p, isActive: false } : p)));
        flash(`${promo.code} a déjà servi : il est désactivé et conservé pour l'historique des commandes.`);
      } else {
        setPromos(prev => prev.filter(p => p.id !== promo.id));
        flash(`Code ${promo.code} supprimé.`);
      }
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Suppression impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const status = (promo: PromoCode) => {
    if (!promo.isActive) return { label: 'Inactif', cls: 'bg-gray-100 text-gray-500' };
    if (isExpired(promo)) return { label: 'Expiré', cls: 'bg-red-50 text-red-600' };
    if (isExhausted(promo)) return { label: 'Épuisé', cls: 'bg-amber-50 text-amber-700' };
    return { label: 'Actif', cls: 'bg-emerald-50 text-emerald-700' };
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-start gap-3 p-4 bg-[#EEFFF2] rounded-xl border border-[#1AAA3F]/20">
          <i className="ri-information-line text-[#1AAA3F] mt-0.5"></i>
          <p className="text-sm text-[#00272B]/80">{notice}</p>
        </div>
      )}

      {/* Création */}
      {!readOnly && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
              <i className="ri-coupon-3-line text-[#1AAA3F] text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#00272B]">Nouveau code promo</h3>
              <p className="text-xs text-[#00272B]/40">La remise porte sur le montant des articles, avant TVA et livraison</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Code</label>
              <input
                required value={form.code} placeholder="BIENVENUE10" pattern="[A-Za-z0-9_\-]{3,50}"
                title="3 à 50 caractères : lettres, chiffres, - ou _"
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Type de remise</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as PromoCode['type'] }))}
                className={`${inputClass} bg-white cursor-pointer`}
              >
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">
                Valeur {form.type === 'percentage' ? '(%)' : '(FCFA)'}
              </label>
              <input
                type="number" required min="1" max={form.type === 'percentage' ? 100 : undefined} step="1"
                value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Commande minimum (FCFA)</label>
              <input
                type="number" min="0" step="1" placeholder="Aucune"
                value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Utilisations maximum</label>
              <input
                type="number" min="1" step="1" placeholder="Illimitées"
                value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Valable jusqu&apos;au</label>
              <input
                type="date" min={new Date().toISOString().split('T')[0]}
                value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className={`${inputClass} cursor-pointer`}
              />
            </div>
          </div>
          {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end mt-5">
            <button
              type="submit" disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              <i className={creating ? 'ri-loader-4-line animate-spin' : 'ri-add-line'}></i>
              Créer le code
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#00272B]">Codes existants</h3>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-[#00272B]/40"><i className="ri-loader-4-line animate-spin mr-2"></i>Chargement…</p>
        ) : loadError ? (
          <div className="p-6 text-sm text-red-600">
            {loadError} <button onClick={load} className="underline ml-2 cursor-pointer">Réessayer</button>
          </div>
        ) : promos.length === 0 ? (
          <p className="p-6 text-sm text-[#00272B]/40">Aucun code promo pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50/60">
                <tr>
                  {['Code', 'Remise', 'Minimum', 'Utilisations', 'Expiration', 'Statut', ''].map(h => (
                    <th key={h || 'actions'} className="px-5 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promos.map(promo => {
                  const st = status(promo);
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-sm font-mono font-semibold text-[#00272B]">{promo.code}</td>
                      <td className="px-5 py-3.5 text-sm text-[#00272B]">
                        {promo.type === 'percentage' ? `${promo.value} %` : fcfa(promo.value)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#00272B]/60">{promo.minOrderAmount ? fcfa(promo.minOrderAmount) : '-'}</td>
                      <td className="px-5 py-3.5 text-sm text-[#00272B]/60">
                        {promo.usesCount}{promo.maxUses !== null ? ` / ${promo.maxUses}` : ''}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#00272B]/60">
                        {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {!readOnly && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggle(promo)} disabled={busyId === promo.id}
                              title={promo.isActive ? 'Désactiver' : 'Activer'}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#00272B]/50 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                            >
                              <i className={promo.isActive ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                            </button>
                            <button
                              onClick={() => handleDelete(promo)} disabled={busyId === promo.id}
                              title="Supprimer"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer disabled:opacity-50"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
