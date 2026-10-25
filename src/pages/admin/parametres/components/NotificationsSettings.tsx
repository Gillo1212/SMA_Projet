import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';

interface Props {
  settings: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}

const notifItems = [
  {
    key: 'notif_new_order',
    icon: 'ri-shopping-bag-line',
    color: 'text-[#1AAA3F]',
    bg: 'bg-[#1AAA3F]/10',
    label: 'Nouvelle commande',
    description: 'Un email à chaque commande passée sur le site, dès sa création',
  },
  {
    key: 'notif_new_quote',
    icon: 'ri-file-list-3-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Nouvelle demande de devis',
    description: "Dès qu'un prospect ou un client envoie une demande de devis",
  },
  {
    key: 'notif_new_client',
    icon: 'ri-user-add-line',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    label: 'Nouveau compte client',
    description: "À chaque inscription sur l'espace client",
  },
  {
    key: 'notif_low_stock',
    icon: 'ri-archive-line',
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Stock faible',
    description: "Après une commande, si le stock d'un article atteint le seuil ci-dessous",
  },
];

export default function NotificationsSettings({ settings, onSave }: Props) {
  const { user } = useAuthContext();
  const readOnly = user?.role === 'commercial';

  const [form, setForm] = useState<Record<string, string>>({
    notif_new_order: settings.notif_new_order ?? '1',
    notif_new_quote: settings.notif_new_quote ?? '1',
    notif_new_client: settings.notif_new_client ?? '0',
    notif_low_stock: settings.notif_low_stock ?? '1',
    notif_low_stock_threshold: settings.notif_low_stock_threshold ?? '5',
    notif_admin_email: settings.notif_admin_email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anyEnabled = notifItems.some(i => form[i.key] === '1');

  const toggleNotif = (key: string) => {
    setForm(prev => ({ ...prev, [key]: prev[key] === '1' ? '0' : '1' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
        <i className="ri-information-line text-sky-600 mt-0.5"></i>
        <p className="text-xs text-sky-700 leading-relaxed">
          Les emails partent avec la configuration de l&apos;onglet <strong>Email &amp; SMTP</strong> : utilisez son
          bouton « Tester » pour vérifier qu&apos;elle fonctionne.
          {readOnly && ' Consultation seule pour les commerciaux.'}
        </p>
      </div>

      {/* Email cible */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
            <i className="ri-mail-line text-[#1AAA3F] text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Email de réception</h3>
            <p className="text-xs text-[#00272B]/40">Les notifications seront envoyées à cette adresse</p>
          </div>
        </div>
        <input
          type="email" name="notif_admin_email" value={form.notif_admin_email} disabled={readOnly}
          required={anyEnabled}
          onChange={e => setForm(prev => ({ ...prev, notif_admin_email: e.target.value }))}
          className="w-full max-w-sm px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] disabled:bg-gray-50"
          placeholder="equipe@smalim.sn"
        />
        {anyEnabled && !form.notif_admin_email && (
          <p className="mt-2 text-xs text-amber-700">Sans adresse, aucune notification ne part.</p>
        )}
      </div>

      {/* Types */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
            <i className="ri-notification-line text-sky-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Types de notifications</h3>
            <p className="text-xs text-[#00272B]/40">Choisissez les événements qui déclenchent un email</p>
          </div>
        </div>
        <div className="space-y-4">
          {notifItems.map(item => {
            const on = form[item.key] === '1';
            return (
              <div key={item.key} className="py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`${item.icon} ${item.color} text-lg`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#00272B]">{item.label}</p>
                      <p className="text-xs text-[#00272B]/45 mt-0.5 leading-relaxed max-w-sm">{item.description}</p>
                    </div>
                  </div>
                  <button
                    type="button" role="switch" aria-checked={on} aria-label={item.label} disabled={readOnly}
                    onClick={() => toggleNotif(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed ${
                      on ? 'bg-[#1AAA3F]' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${on ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {item.key === 'notif_low_stock' && on && (
                  <div className="mt-3 ml-14 flex items-center gap-3">
                    <label htmlFor="low-stock-threshold" className="text-xs font-semibold text-[#00272B]/60">Seuil</label>
                    <input
                      id="low-stock-threshold" type="number" min="0" step="1" required disabled={readOnly}
                      value={form.notif_low_stock_threshold}
                      onChange={e => setForm(prev => ({ ...prev, notif_low_stock_threshold: e.target.value }))}
                      className="w-24 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] disabled:bg-gray-50"
                    />
                    <span className="text-xs text-[#00272B]/45">unité(s) ou moins</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 text-right">{error}</p>}
      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="submit" disabled={saving}
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
