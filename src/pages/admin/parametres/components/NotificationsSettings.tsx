import { useState } from 'react';

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
    description: 'Recevoir une notification par email à chaque nouvelle commande passée',
  },
  {
    key: 'notif_new_quote',
    icon: 'ri-file-list-3-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Nouveau devis',
    description: 'Être alerté dès qu\'un client soumet une demande de devis',
  },
  {
    key: 'notif_new_client',
    icon: 'ri-user-add-line',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    label: 'Nouvelle inscription client',
    description: 'Notification lors de chaque nouvelle inscription sur l\'espace client',
  },
  {
    key: 'notif_low_stock',
    icon: 'ri-archive-line',
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Stock bas',
    description: 'Alerte lorsque le stock d\'un produit ou d\'une machine tombe sous le seuil minimum',
  },
];

export default function NotificationsSettings({ settings, onSave }: Props) {
  const [form, setForm] = useState<Record<string, string>>({
    notif_new_order: settings.notif_new_order || '1',
    notif_new_quote: settings.notif_new_quote || '1',
    notif_new_client: settings.notif_new_client || '0',
    notif_low_stock: settings.notif_low_stock || '1',
    notif_admin_email: settings.notif_admin_email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleNotif = (key: string) => {
    setForm(prev => ({ ...prev, [key]: prev[key] === '1' ? '0' : '1' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          type="email" name="notif_admin_email" value={form.notif_admin_email}
          onChange={e => setForm(prev => ({ ...prev, notif_admin_email: e.target.value }))}
          className="w-full max-w-sm px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
          placeholder="admin@smalim.com"
        />
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
            <i className="ri-notification-line text-sky-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Types de notifications</h3>
            <p className="text-xs text-[#00272B]/40">Choisissez les événements qui déclenchent une alerte</p>
          </div>
        </div>
        <div className="space-y-4">
          {notifItems.map(item => (
            <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
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
                type="button" onClick={() => toggleNotif(item.key)}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer ${
                  form[item.key] === '1' ? 'bg-[#1AAA3F]' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                  form[item.key] === '1' ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
        >
          {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
          {saving ? 'Enregistrement…' : saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
