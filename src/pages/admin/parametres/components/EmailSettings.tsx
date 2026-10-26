import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { settingsService, type SmtpTestResult } from '../../../../services/settings.service';

interface Props {
  settings: Record<string, string>;
  onSave: (data: Record<string, string>) => Promise<void>;
}

/** '' = configuration du fichier .env du serveur */
type Provider = '' | 'smtp' | 'sendgrid';

const PROVIDERS: { value: Provider; label: string; hint: string; icon: string }[] = [
  { value: '', label: 'Fichier .env', hint: 'Configuration du serveur (EMAIL_PROVIDER)', icon: 'ri-server-line' },
  { value: 'smtp', label: 'SMTP', hint: 'Gmail, Outlook, OVH…', icon: 'ri-mail-settings-line' },
  { value: 'sendgrid', label: 'SendGrid', hint: 'Recommandé en production', icon: 'ri-send-plane-line' },
];

const presets = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: '0' },
  { label: 'Outlook', host: 'smtp.office365.com', port: '587', secure: '0' },
  { label: 'OVH', host: 'ssl0.ovh.net', port: '465', secure: '1' },
];

const ENV_PROVIDER_LABELS: Record<string, string> = { smtp: 'SMTP', gmail: 'Gmail', sendgrid: 'SendGrid' };

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] disabled:bg-gray-50';
const labelClass = 'block text-xs font-semibold text-[#00272B]/60 mb-1.5';

export default function EmailSettings({ settings, onSave }: Props) {
  const { user } = useAuthContext();
  const readOnly = user?.role === 'commercial';

  // Fournisseur enregistré ; un hôte saisi avant l'ajout de ce choix vaut « SMTP »
  const savedProvider: Provider = (settings.email_provider as Provider) || (settings.smtp_host ? 'smtp' : '');
  const [provider, setProvider] = useState<Provider>(savedProvider);
  const [form, setForm] = useState({
    smtp_host: settings.smtp_host ?? '',
    smtp_port: settings.smtp_port || '587',
    smtp_secure: settings.smtp_secure ?? '0',
    smtp_user: settings.smtp_user ?? '',
    smtp_pass: '', // jamais renvoyé par le serveur : vide = conserver
    sendgrid_api_key: '', // idem
    smtp_from: settings.smtp_from ?? '',
    smtp_from_name: settings.smtp_from_name ?? '',
  });
  const passSet = settings.smtp_pass_set === '1';
  const keySet = settings.sendgrid_api_key_set === '1';

  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testTo, setTestTo] = useState(user?.email ?? '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<SmtpTestResult | null>(null);

  const set = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const dirty = provider !== savedProvider;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setTestResult(null);
    // On n'envoie que ce qui concerne le fournisseur choisi : changer de
    // fournisseur ne doit pas effacer les réglages de l'autre.
    const data: Record<string, string> = { email_provider: provider };
    if (provider === 'smtp') {
      Object.assign(data, {
        smtp_host: form.smtp_host, smtp_port: form.smtp_port, smtp_secure: form.smtp_secure,
        smtp_user: form.smtp_user, smtp_pass: form.smtp_pass,
        smtp_from: form.smtp_from, smtp_from_name: form.smtp_from_name,
      });
    } else if (provider === 'sendgrid') {
      Object.assign(data, {
        sendgrid_api_key: form.sendgrid_api_key.trim(),
        smtp_from: form.smtp_from, smtp_from_name: form.smtp_from_name,
      });
    }
    try {
      await onSave(data);
      setForm(prev => ({ ...prev, smtp_pass: '', sendgrid_api_key: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestResult(await settingsService.testSmtp(testTo || undefined));
    setTesting(false);
  };

  const fromFields = (
    <>
      <div>
        <label className={labelClass} htmlFor="smtp_from">Email expéditeur</label>
        <input id="smtp_from" type="email" value={form.smtp_from} onChange={e => set('smtp_from', e.target.value)}
          disabled={readOnly} required={provider === 'sendgrid'} className={inputClass} placeholder="noreply@smalim.sn" />
        {provider === 'sendgrid' && (
          <p className="mt-1 text-xs text-[#00272B]/40">Doit être vérifiée dans SendGrid (Settings → Sender Authentication).</p>
        )}
      </div>
      <div>
        <label className={labelClass} htmlFor="smtp_from_name">Nom de l&apos;expéditeur</label>
        <input id="smtp_from_name" type="text" value={form.smtp_from_name} onChange={e => set('smtp_from_name', e.target.value)}
          disabled={readOnly} className={inputClass} placeholder="SMALIM" />
      </div>
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Choix du fournisseur */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
            <i className="ri-mail-send-line text-[#1AAA3F] text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Service d&apos;envoi</h3>
            <p className="text-xs text-[#00272B]/40">Utilisé pour tous les emails : confirmations, mots de passe, notifications</p>
          </div>
        </div>
        <div role="radiogroup" aria-label="Service d'envoi" className="grid sm:grid-cols-3 gap-3">
          {PROVIDERS.map(p => {
            const active = provider === p.value;
            return (
              <button
                key={p.value || 'env'} type="button" role="radio" aria-checked={active} disabled={readOnly}
                onClick={() => setProvider(p.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-not-allowed ${
                  active ? 'border-[#1AAA3F] bg-[#F6F3EC]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <i className={`${p.icon} ${active ? 'text-[#1AAA3F]' : 'text-[#00272B]/40'}`}></i>
                  <span className="text-sm font-semibold text-[#00272B]">{p.label}</span>
                  {p.value === savedProvider && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#1AAA3F]">actif</span>
                  )}
                </div>
                <p className="text-xs text-[#00272B]/50">{p.hint}</p>
              </button>
            );
          })}
        </div>
        {dirty && !readOnly && (
          <p className="mt-3 text-xs text-amber-700">Enregistrez pour appliquer ce changement de service.</p>
        )}
      </div>

      {/* .env */}
      {provider === '' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#00272B] mb-3">Configuration du serveur</h3>
          <dl className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs text-[#00272B]/40">EMAIL_PROVIDER</dt>
              <dd className="font-semibold text-[#00272B]">{ENV_PROVIDER_LABELS[settings.email_env_provider] ?? settings.email_env_provider ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#00272B]/40">Serveur</dt>
              <dd className="font-mono text-xs text-[#00272B] break-all">{settings.email_env_host || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#00272B]/40">EMAIL_FROM</dt>
              <dd className="text-[#00272B] break-all">{settings.email_env_from || '(identifiant SMTP)'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[#00272B]/50 leading-relaxed">
            Pour passer à SendGrid en production : <code>EMAIL_PROVIDER=sendgrid</code>, <code>SENDGRID_API_KEY</code> et un
            <code className="ml-1">EMAIL_FROM</code> vérifié dans SendGrid, puis redémarrer le backend. Les secrets du fichier
            ne sont jamais affichés ici.
          </p>
        </div>
      )}

      {/* SMTP */}
      {provider === 'smtp' && (
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
                <label className={labelClass} htmlFor="smtp_host">Serveur SMTP</label>
                <input id="smtp_host" type="text" value={form.smtp_host} onChange={e => set('smtp_host', e.target.value)}
                  disabled={readOnly} required className={inputClass} placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className={labelClass} htmlFor="smtp_port">Port et chiffrement</label>
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
              <label className={labelClass} htmlFor="smtp_user">Identifiant SMTP</label>
              <input id="smtp_user" type="text" value={form.smtp_user} onChange={e => set('smtp_user', e.target.value)}
                disabled={readOnly} className={inputClass} placeholder="compte@gmail.com" autoComplete="off" />
            </div>
            <div>
              <label className={labelClass} htmlFor="smtp_pass">Mot de passe SMTP</label>
              <div className="relative">
                <input
                  id="smtp_pass" type={showSecret ? 'text' : 'password'} value={form.smtp_pass}
                  onChange={e => set('smtp_pass', e.target.value)} disabled={readOnly} autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                  placeholder={passSet ? '•••••••• (enregistré — laisser vide pour le garder)' : 'Gmail : mot de passe d’application'}
                />
                <button type="button" onClick={() => setShowSecret(v => !v)} aria-label={showSecret ? 'Masquer' : 'Afficher'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] cursor-pointer">
                  <i className={showSecret ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
              <p className="mt-1 text-xs text-[#00272B]/40">Stocké chiffré, jamais réaffiché. Gmail : Compte Google → Sécurité → Mots de passe des applications.</p>
            </div>
            {fromFields}
          </div>
        </div>
      )}

      {/* SendGrid */}
      {provider === 'sendgrid' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="sendgrid_api_key">Clé API SendGrid</label>
              <div className="relative">
                <input
                  id="sendgrid_api_key" type={showSecret ? 'text' : 'password'} value={form.sendgrid_api_key}
                  onChange={e => set('sendgrid_api_key', e.target.value)} disabled={readOnly} autoComplete="off"
                  required={!keySet} className={`${inputClass} pr-10 font-mono`}
                  placeholder={keySet ? '•••••••• (enregistrée — laisser vide pour la garder)' : 'SG.xxxxxxxx.yyyyyyyy'}
                />
                <button type="button" onClick={() => setShowSecret(v => !v)} aria-label={showSecret ? 'Masquer' : 'Afficher'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] cursor-pointer">
                  <i className={showSecret ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
              <p className="mt-1 text-xs text-[#00272B]/40">
                SendGrid → Settings → API Keys, avec la permission « Mail Send ». Envoi via le relais SMTP de SendGrid. Stockée chiffrée.
              </p>
            </div>
            {fromFields}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

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

      {/* Test */}
      {!readOnly && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#00272B] mb-1">Tester l&apos;envoi</h3>
          <p className="text-xs text-[#00272B]/40 mb-4">
            Teste le service <strong>actif</strong> (enregistré) : connexion puis envoi d&apos;un email.
          </p>
          <div className="flex flex-wrap gap-3">
            <input type="email" value={testTo} onChange={e => setTestTo(e.target.value)} aria-label="Adresse de test"
              className={`${inputClass} max-w-xs`} placeholder="votre@email.com" />
            <button
              type="button" onClick={handleTest} disabled={testing || !testTo || dirty}
              title={dirty ? 'Enregistrez d’abord le changement de service' : undefined}
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
