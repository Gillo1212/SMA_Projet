import { useState } from 'react';

interface Props {
  settings: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}

export default function EmailSettings({ settings, onSave }: Props) {
  const [form, setForm] = useState({
    smtp_host: settings.smtp_host || 'smtp.gmail.com',
    smtp_port: settings.smtp_port || '587',
    smtp_user: settings.smtp_user || '',
    smtp_pass: '',
    smtp_from: settings.smtp_from || '',
    smtp_from_name: settings.smtp_from_name || 'SMALIM',
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleTest = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('ok');
      setTimeout(() => setTestStatus('idle'), 4000);
    }, 2000);
  };

  const presets = [
    { label: 'Gmail', host: 'smtp.gmail.com', port: '587' },
    { label: 'Outlook', host: 'smtp.office365.com', port: '587' },
    { label: 'OVH', host: 'ssl0.ovh.net', port: '587' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <div className="w-5 h-5 flex items-center justify-center mt-0.5">
          <i className="ri-information-line text-amber-600"></i>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          Ces paramètres sont utilisés pour l&apos;envoi des emails de confirmation, de devis et de notifications. Pour Gmail, utilisez un <strong>mot de passe d&apos;application</strong> (pas votre mot de passe habituel).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        {/* Presets rapides */}
        <div>
          <p className="text-xs font-semibold text-[#00272B]/60 mb-3">Configuration rapide</p>
          <div className="flex gap-2">
            {presets.map(p => (
              <button
                key={p.label} type="button"
                onClick={() => setForm(prev => ({ ...prev, smtp_host: p.host, smtp_port: p.port }))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-[#1AAA3F] hover:text-[#1AAA3F] text-[#00272B]/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Serveur SMTP</label>
              <input
                type="text" name="smtp_host" value={form.smtp_host} onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Port</label>
              <select
                name="smtp_port" value={form.smtp_port} onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] cursor-pointer bg-white"
              >
                <option value="587">587 (TLS)</option>
                <option value="465">465 (SSL)</option>
                <option value="25">25 (SMTP)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Identifiant SMTP</label>
            <input
              type="email" name="smtp_user" value={form.smtp_user} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="user@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Mot de passe SMTP</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} name="smtp_pass" value={form.smtp_pass} onChange={handleChange}
                className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                placeholder="Laisser vide pour ne pas modifier"
              />
              <button
                type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] cursor-pointer"
              >
                <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Email expéditeur</label>
            <input
              type="email" name="smtp_from" value={form.smtp_from} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="noreply@smalim.sn"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nom de l&apos;expéditeur</label>
            <input
              type="text" name="smtp_from_name" value={form.smtp_from_name} onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
              placeholder="SMALIM"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button" onClick={handleTest} disabled={testStatus === 'testing'}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-[#00272B]/60 hover:bg-gray-50 transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
        >
          {testStatus === 'testing' && <i className="ri-loader-4-line animate-spin text-[#1AAA3F]"></i>}
          {testStatus === 'ok' && <i className="ri-check-line text-emerald-500"></i>}
          {testStatus === 'error' && <i className="ri-close-line text-red-500"></i>}
          {testStatus === 'idle' && <i className="ri-mail-send-line"></i>}
          {testStatus === 'testing' ? 'Test en cours…' : testStatus === 'ok' ? 'Connexion OK !' : testStatus === 'error' ? 'Échec connexion' : 'Tester la connexion'}
        </button>

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
