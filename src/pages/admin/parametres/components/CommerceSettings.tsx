import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { ApiError } from '../../../../services/apiClient';
import { shopService } from '../../../../services/shop.service';
import { computeTotals, DELIVERY_MODES } from '../../../../utils/orderTotals';
import type { DeliveryMode, ShopConfig } from '../../../../types/models';

interface Props {
  settings: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}

const MODES: Record<DeliveryMode, { label: string; hint: string; icon: string }> = {
  pickup:   { label: 'Retrait en magasin', hint: 'Le client récupère sa commande sur place', icon: 'ri-store-2-line' },
  standard: { label: 'Livraison standard', hint: '2 à 3 jours ouvrables', icon: 'ri-truck-line' },
  express:  { label: 'Livraison express', hint: 'Sous 24 h', icon: 'ri-flashlight-line' },
};

/** Montant du panier utilisé par l'aperçu */
const PREVIEW_SUBTOTAL = 30000;

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] disabled:bg-gray-50 disabled:text-[#00272B]/50';

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

export default function CommerceSettings({ settings, onSave }: Props) {
  const { user } = useAuthContext();
  // Le backend refuse la modification aux commerciaux : on l'indique d'emblée
  const readOnly = user?.role === 'commercial';

  const [form, setForm] = useState(() => ({
    tva_rate: settings.tva_rate ?? '18',
    delivery_pickup_enabled: settings.delivery_pickup_enabled ?? '1',
    delivery_pickup_fee: settings.delivery_pickup_fee ?? '0',
    delivery_standard_enabled: settings.delivery_standard_enabled ?? '1',
    delivery_standard_fee: settings.delivery_standard_fee ?? '2500',
    delivery_express_enabled: settings.delivery_express_enabled ?? '1',
    delivery_express_fee: settings.delivery_express_fee ?? '5000',
    free_shipping_threshold: settings.free_shipping_threshold ?? '0',
  }));
  const [freeShippingOn, setFreeShippingOn] = useState(Number(form.free_shipping_threshold) > 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => ({ ...prev, [key]: '' }));
  };

  // Config telle qu'elle s'appliquerait après enregistrement
  const draft: ShopConfig = {
    taxRate: Number(form.tva_rate) || 0,
    currency: 'XOF',
    delivery: Object.fromEntries(DELIVERY_MODES.map(m => [m, {
      enabled: form[`delivery_${m}_enabled`] === '1',
      fee: Number(form[`delivery_${m}_fee`]) || 0,
    }])) as ShopConfig['delivery'],
    freeShippingThreshold: freeShippingOn ? Number(form.free_shipping_threshold) || 0 : 0,
  };
  const noModeEnabled = DELIVERY_MODES.every(m => !draft.delivery[m].enabled);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noModeEnabled) {
      setError('Au moins un mode de livraison doit rester actif.');
      return;
    }
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSave({ ...form, free_shipping_threshold: freeShippingOn ? form.free_shipping_threshold : '0' });
      // Le panier et le checkout relisent la config au prochain chargement
      shopService.invalidateConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      if (err instanceof ApiError && Array.isArray(err.errors)) {
        const details = err.errors as unknown as { field: string; message: string }[];
        setFieldErrors(Object.fromEntries(details.map(d => [d.field, d.message])));
      }
    } finally {
      setSaving(false);
    }
  };

  const FieldError = ({ name }: { name: string }) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-red-600">{fieldErrors[name]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {readOnly && (
        <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
          <i className="ri-information-line text-sky-600 mt-0.5"></i>
          <p className="text-xs text-sky-700">
            Consultation seule : seuls les administrateurs peuvent modifier la TVA et les tarifs de livraison.
          </p>
        </div>
      )}

      {/* TVA */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <i className="ri-percent-line text-amber-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">TVA</h3>
            <p className="text-xs text-[#00272B]/40">Appliquée au montant des articles, remise déduite, hors livraison</p>
          </div>
        </div>
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Taux de TVA (%)</label>
          <input
            type="number" min="0" max="100" step="0.01" required disabled={readOnly}
            value={form.tva_rate} onChange={e => set('tva_rate', e.target.value)}
            className={inputClass}
          />
          <FieldError name="tva_rate" />
          <p className="mt-2 text-xs text-[#00272B]/40">
            Le taux est enregistré sur chaque commande : le modifier ne change pas les commandes passées.
          </p>
        </div>
      </div>

      {/* Modes de livraison */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
            <i className="ri-truck-line text-[#1AAA3F] text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Modes de livraison</h3>
            <p className="text-xs text-[#00272B]/40">Seuls les modes actifs sont proposés au checkout</p>
          </div>
        </div>
        <div className="space-y-3">
          {DELIVERY_MODES.map(mode => {
            const enabledKey = `delivery_${mode}_enabled` as const;
            const feeKey = `delivery_${mode}_fee` as const;
            const enabled = form[enabledKey] === '1';
            return (
              <div key={mode} className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border ${enabled ? 'border-gray-200' : 'border-gray-100 bg-gray-50/60'}`}>
                <button
                  type="button" role="switch" aria-checked={enabled} disabled={readOnly}
                  aria-label={`${MODES[mode].label} : ${enabled ? 'actif' : 'inactif'}`}
                  onClick={() => set(enabledKey, enabled ? '0' : '1')}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer disabled:cursor-not-allowed ${enabled ? 'bg-[#1AAA3F]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : ''}`}></span>
                </button>
                <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                  <i className={`${MODES[mode].icon} text-lg ${enabled ? 'text-[#1AAA3F]' : 'text-[#00272B]/30'}`}></i>
                  <div>
                    <p className={`text-sm font-semibold ${enabled ? 'text-[#00272B]' : 'text-[#00272B]/40'}`}>{MODES[mode].label}</p>
                    <p className="text-xs text-[#00272B]/40">{MODES[mode].hint}</p>
                  </div>
                </div>
                <div className="w-40">
                  <label className="sr-only" htmlFor={feeKey}>Tarif {MODES[mode].label}</label>
                  <div className="relative">
                    <input
                      id={feeKey} type="number" min="0" step="1" required disabled={readOnly || !enabled}
                      value={form[feeKey]} onChange={e => set(feeKey, e.target.value)}
                      className={`${inputClass} pr-14`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#00272B]/40">FCFA</span>
                  </div>
                  <FieldError name={feeKey} />
                </div>
              </div>
            );
          })}
        </div>
        {noModeEnabled && (
          <p className="mt-3 text-xs text-red-600">Au moins un mode de livraison doit rester actif.</p>
        )}
        <FieldError name="delivery_standard_enabled" />
      </div>

      {/* Livraison offerte */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
              <i className="ri-gift-line text-sky-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#00272B]">Livraison standard offerte</h3>
              <p className="text-xs text-[#00272B]/40">À partir d&apos;un montant de commande (remise déduite, hors TVA)</p>
            </div>
          </div>
          <button
            type="button" role="switch" aria-checked={freeShippingOn} disabled={readOnly}
            aria-label={`Livraison offerte : ${freeShippingOn ? 'active' : 'inactive'}`}
            onClick={() => {
              setFreeShippingOn(v => !v);
              if (!freeShippingOn && Number(form.free_shipping_threshold) <= 0) set('free_shipping_threshold', '50000');
            }}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer disabled:cursor-not-allowed ${freeShippingOn ? 'bg-[#1AAA3F]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${freeShippingOn ? 'translate-x-5' : ''}`}></span>
          </button>
        </div>
        {freeShippingOn ? (
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Seuil</label>
            <div className="relative">
              <input
                type="number" min="1" step="1" required disabled={readOnly}
                value={form.free_shipping_threshold} onChange={e => set('free_shipping_threshold', e.target.value)}
                className={`${inputClass} pr-14`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#00272B]/40">FCFA</span>
            </div>
            <FieldError name="free_shipping_threshold" />
            {!draft.delivery.standard.enabled && (
              <p className="mt-2 text-xs text-amber-700">La livraison standard est désactivée : ce seuil est sans effet.</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#00272B]/50">Désactivé : la livraison standard est toujours facturée à son tarif.</p>
        )}
      </div>

      {/* Aperçu */}
      <div className="bg-[#F6F3EC] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-[#00272B] mb-1">Aperçu</h3>
        <p className="text-xs text-[#00272B]/50 mb-4">
          Commande de {fcfa(PREVIEW_SUBTOTAL)} d&apos;articles, sans code promo, avec les réglages ci-dessus.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {DELIVERY_MODES.filter(m => draft.delivery[m].enabled).map(mode => {
            const tot = computeTotals(draft, PREVIEW_SUBTOTAL, null, mode);
            return (
              <div key={mode} className="bg-white rounded-xl p-4 text-xs text-[#00272B]/70 space-y-1">
                <p className="text-sm font-semibold text-[#00272B] mb-2">{MODES[mode].label}</p>
                <p className="flex justify-between"><span>Livraison</span><span>{tot.shipping ? fcfa(tot.shipping) : 'Offerte'}</span></p>
                <p className="flex justify-between"><span>TVA ({draft.taxRate} %)</span><span>{fcfa(tot.tax)}</span></p>
                <p className="flex justify-between pt-1 border-t border-gray-100 font-bold text-[#00272B]"><span>Total</span><span>{fcfa(tot.total)}</span></p>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
          <i className="ri-error-warning-line text-red-500 mt-0.5"></i>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="submit" disabled={saving || noModeEnabled}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
            {saving ? 'Enregistrement…' : saved ? 'Enregistré !' : 'Enregistrer'}
          </button>
        </div>
      )}
    </form>
  );
}
