import { useState } from 'react';

interface Props {
  settings: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}

export default function EntrepriseSettings({ settings, onSave }: Props) {
  const [form, setForm] = useState({
    app_name: settings.app_name || 'SMALIM',
    app_email: settings.app_email || '',
    app_phone: settings.app_phone || '',
    app_address: settings.app_address || '',
    app_city: settings.app_city || '',
    app_country: settings.app_country || 'Sénégal',
    app_website: settings.app_website || '',
    app_description: settings.app_description || '',
    tva_rate: settings.tva_rate || '18',
    currency: settings.currency || 'XOF',
    timezone: settings.timezone || 'Africa/Dakar',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identité */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
            <i className="ri-building-line text-[#1AAA3F] text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Identité de l&apos;entreprise</h3>
            <p className="text-xs text-[#00272B]/40">Informations affichées sur le site et les documents</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nom de l&apos;entreprise</label>
            <input
              type="text" name="app_name" value={form.app_name} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="SMALIM"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Email de contact</label>
            <input
              type="email" name="app_email" value={form.app_email} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="contact@smalim.sn"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Téléphone</label>
            <input
              type="text" name="app_phone" value={form.app_phone} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="+221 77 000 00 00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Site web</label>
            <input
              type="url" name="app_website" value={form.app_website} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="https://smalim.sn"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Adresse</label>
            <input
              type="text" name="app_address" value={form.app_address} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="Rue 10, Cité Keur Gorgui"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Ville</label>
              <input
                type="text" name="app_city" value={form.app_city} onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                placeholder="Dakar"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Pays</label>
              <input
                type="text" name="app_country" value={form.app_country} onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                placeholder="Sénégal"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Description courte</label>
            <textarea
              name="app_description" value={form.app_description} onChange={handleChange} rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] resize-none"
              placeholder="Description visible sur le site..."
            />
          </div>
        </div>
      </div>

      {/* Paramètres fiscaux */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <i className="ri-percent-line text-amber-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Paramètres fiscaux</h3>
            <p className="text-xs text-[#00272B]/40">TVA, devise et fuseau horaire</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Taux TVA (%)</label>
            <input
              type="number" name="tva_rate" value={form.tva_rate} onChange={handleChange} min="0" max="100"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Devise</label>
            <select
              name="currency" value={form.currency} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] cursor-pointer bg-white"
            >
              <option value="XOF">XOF — Franc CFA (BCEAO)</option>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dollar américain</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Fuseau horaire</label>
            <select
              name="timezone" value={form.timezone} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] cursor-pointer bg-white"
            >
              <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
              <option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</option>
              <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
              <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
            </select>
          </div>
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
