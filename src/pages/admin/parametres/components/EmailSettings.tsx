import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { settingsService, type SmtpTestResult } from '../../../../services/settings.service';

interface Props {
  settings: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}

const presets = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: '0' },
  { label: 'Outlook', host: 'smtp.office365.com', port: '587', secure: '0' },
  { label: 'OVH', host: 'ssl0.ovh.net', port: '465', secure: '1' },
];

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] disabled:bg-gray-50';

const EMPTY_SMTP = {
  smtp_host: '', smtp_port: '', smtp_secure: '0', smtp_user: '', smtp_pass: '', smtp_from: '', smtp_from_name: '',
};

export default function EmailSettings({ settings, onSave }: Props) {
  const { user } = useAuthContext();
  const readOnly = user?.role === 'commercial';

  const [form, setForm] = useState({
    smtp_host: settings.smtp_host ?? '',
    smtp_port: settings.smtp_port || '587',
    smtp_secure: settings.smtp_secure ?? '0',
    smtp_user: settings.smtp_user ?? '',
    smtp_pass: '', // jamais renvoyé par le serveur : vide = conserver
    smtp_from: settings.smtp_from ?? '',
    smtp_from_name: settings.smtp_from_name ?? '',
  });
  const passSet = settings.smtp_pass_set === '1';
  const usingDatabase = Boolean(settings.smtp_host);

  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testTo, setTestTo] = useState(user?.email ?? '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<SmtpTestResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = async (data: Record<string, string>) => {
    setSaving(true);
    setError(null);
    setTestResult(null);
    try {
      await onSave(data);
      setForm(prev => ({ ...prev, smtp_pass: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save(form);
  };

  /** Efface l'hôte : le serveur revient alors entièrement à la configuration du .env */
  const handleUseEnv = () => {
    if (!window.confirm('Revenir à la configuration SMTP du fichier .env du serveur ?')) return;
    setForm({ ...EMPTY_SMTP, smtp_port: '587' });
    save({ ...EMPTY_SMTP });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestResult(await settingsService.testSmtp(testTo || undefined));
    setTesting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Configuration active */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${usingDatabase ? 'bg-[#EEFFF2] border-[#1AAA3F]/20' : 'bg-amber-50 border-amber-100'}`}>
        <i className={`ri-information-line mt-0.5 ${usingDatabase ? 'text-[#1AAA3F]' : 'text-amber-600'}`}></i>
        <div className="text-xs leading-relaxed text-[#00272B]/70">
          {usingDatabase ? (
            <p><strong>Configuration active : celle de ce formulaire.</strong> Elle remplace celle du fichier <code>.env</code> du serveur.</p>
          ) : (
            <p>
              <strong>Configuration active : fichier <code>.env</code> du serveur.</strong> Renseignez un serveur SMTP ci-dessous
              pour la remplacer sans redémarrer le backend.
            </p>
          )}
          <p className="mt-1">
            Pour Gmail, utilisez un <strong>mot de passe d&apos;application</strong> (Compte Google → Sécurité → Validation en deux
            étapes → Mots de passe des applications), pas le mot de passe du compte.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        {!readOnly && (
          <div>
            <p className="text-xs font-semibold text-[#00272B]/60 mb-3">Configuration rapide</p>
            <div className="flex gap-2 flex-wrap">
              {presets.map(p => (
                <button
                  key={p.label} type="button"
                  onClick={() => setForm(prev => ({ ...prev, smtp_host: p.host, smtp_port: p.port, smtp_secure: p.secure }))}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-[#1AAA3F] hover:text-[#1AAA3F] text-[#00272B]/60 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="smtp_host">Serveur SMTP</label>
              <input id="smtp_host" type="text" name="smtp_host" value={form.smtp_host} onChange={handleChange} disabled={readOnly}
                className={inputClass} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="smtp_port">Port et chiffrement</label>
              <select
                id="smtp_port" value={`${form.smtp_port}|${form.smtp_secure}`} disabled={readOnly}
                onChange={e => {
                  const [port, secure] = e.target.value.split('|');
                  setForm(prev => ({ ...prev, smtp_port: port, smtp_secure: secure }));
                }}
                className={`${inputClass} cursor-pointer bg-white`}
              >
                <option value="587|0">587 (STARTTLS)</option>
                <option value="465|1">465 (SSL)</option>
                <option value="25|0">25 (sans chiffrement)</option>
                {!['587|0', '465|1', '25|0'].includes(`${form.smtp_port}|${form.smtp_secure}`) && (
                  <option value={`${form.smtp_port}|${form.smtp_secure}`}>{form.smtp_port} (personnalisé)</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="smtp_user">Identifiant SMTP</label>
            <input id="smtp_user" type="text" name="smtp_user" value={form.smtp_user} onChange={handleChange} disabled={readOnly}
              className={inputClass} placeholder="compte@gmail.com" autoComplete="off" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="smtp_pass">Mot de passe SMTP</label>
            <div className="relative">
              <input
                id="smtp_pass" type={showPass ? 'text' : 'password'} name="smtp_pass" value={form.smtp_pass} onChange={handleChange}
                disabled={readOnly} autoComplete="new-password"
                className={`${inputClass} pr-10`}
                placeholder={passSet ? '•••••••• (enregistré — laisser vide pour le garder)' : 'Mot de passe ou mot de passe d’application'}
              />
              <button
                type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Masquer' : 'Afficher'}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] cursor-pointer"
              >
                <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
            <p className="mt-1 text-xs text-[#00272B]/40">Stocké chiffré sur le serveur, jamais réaffiché.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="smtp_from">Email expéditeur</label>
            <input id="smtp_from" type="email" name="smtp_from" value={form.smtp_from} onChange={handleChange} disabled={readOnly}
              className={inputClass} placeholder="noreply@smalim.sn" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5" htmlFor="smtp_from_name">Nom de l&apos;expéditeur</label>
            <input id="smtp_from_name" type="text" name="smtp_from_name" value={form.smtp_from_name} onChange={handleChange} disabled={readOnly}
              className={inputClass} placeholder="SMALIM" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {usingDatabase ? (
            <button type="button" onClick={handleUseEnv} disabled={saving}
              className="text-xs text-[#00272B]/50 hover:text-red-600 underline cursor-pointer">
              Revenir à la configuration du .env
            </button>
          ) : <span />}
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
          >
            {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
            {saving ? 'Enregistrement…' : saved ? 'Enregistré !' : 'Enregistrer'}
          </button>
        </div>
      )}

      {/* Test */}
      {!readOnly && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#00272B] mb-1">Tester l&apos;envoi</h3>
          <p className="text-xs text-[#00272B]/40 mb-4">
            Teste la configuration <strong>enregistrée</strong> : connexion au serveur puis envoi d&apos;un email. Enregistrez vos
            modifications avant de tester.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              type="email" value={testTo} onChange={e => setTestTo(e.target.value)} aria-label="Adresse de test"
              className={`${inputClass} max-w-xs`} placeholder="votre@email.com"
            />
            <button
              type="button" onClick={handleTest} disabled={testing || !testTo}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-[#00272B]/70 hover:bg-gray-50 transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              <i className={testing ? 'ri-loader-4-line animate-spin text-[#1AAA3F]' : 'ri-mail-send-line'}></i>
              {testing ? 'Test en cours…' : 'Envoyer un email de test'}
            </button>
          </div>
          {testResult && (
            <div className={`mt-4 p-3 rounded-lg border text-sm ${testResult.success ? 'bg-[#EEFFF2] border-[#1AAA3F]/20 text-[#00272B]/80' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <p className="font-semibold">
                <i className={`mr-1.5 ${testResult.success ? 'ri-check-line text-[#1AAA3F]' : 'ri-close-circle-line'}`}></i>
                {testResult.success ? 'Email envoyé' : 'Échec du test'}
              </p>
              <p className="mt-1 text-xs break-words whitespace-pre-wrap">{testResult.message}</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
