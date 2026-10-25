import { useState, useEffect } from 'react';
import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { clientPortalService } from '../../../services/clientPortal.service';
import { apiClient } from '../../../services/apiClient';
import { ENDPOINTS } from '../../../config/api';
import { LoadingState } from '../../../components/feature/AsyncState';
import type { ClientProfile } from '../../../types/models';
import { useTranslation } from 'react-i18next';

const EMPTY_PROFILE: ClientProfile = {
  id: '', nom: '', prenom: '', email: '', telephone: '',
  entreprise: '', poste: '', ville: '', adresse: '', dateInscription: '',
};

export default function ClientProfilPage() {
  const { t } = useTranslation();
  const { client, isLoading } = useClientAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ClientProfile>(EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaved, setPwdSaved] = useState(false);

  // Le formulaire suit le client du contexte, chargé de façon asynchrone
  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setSaving(true);
    setFormError(null);
    try {
      await clientPortalService.updateProfile(client.id, form);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('clientPortal.profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handlePwdSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);

    if (pwd.next !== pwd.confirm) {
      setPwdError(t('auth.errors.mismatch'));
      return;
    }
    // Mêmes règles que changePasswordRules côté backend
    if (pwd.next.length < 8) {
      setPwdError(t('auth.errors.tooShort'));
      return;
    }
    if (!/[A-Z]/.test(pwd.next)) {
      setPwdError(t('auth.errors.needsUppercase'));
      return;
    }
    if (!/[0-9]/.test(pwd.next)) {
      setPwdError(t('auth.errors.needsDigit'));
      return;
    }

    setPwdSaving(true);
    try {
      await apiClient.patch(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: pwd.current,
        new_password: pwd.next,
      });
      setShowPwdForm(false);
      setPwd({ current: '', next: '', confirm: '' });
      setPwdSaved(true);
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : t('clientPortal.profile.passwordError'));
    } finally {
      setPwdSaving(false);
    }
  };

  if (isLoading) return <LoadingState label={t('clientPortal.profile.loading')} />;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <i className="ri-checkbox-circle-line text-emerald-500"></i>
          <p className="text-sm font-medium text-emerald-700">{t('clientPortal.profile.saved')}</p>
        </div>
      )}
      {pwdSaved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <i className="ri-lock-unlock-line text-emerald-500"></i>
          <p className="text-sm font-medium text-emerald-700">{t('clientPortal.profile.passwordSaved')}</p>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1AAA3F]/10 rounded-2xl flex items-center justify-center">
              <i className="ri-user-line text-[#1AAA3F] text-2xl"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#00272B]">{form.prenom} {form.nom}</h3>
              <p className="text-sm text-[#00272B]/50">{form.poste} · {form.entreprise}</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-xl hover:bg-gray-50 cursor-pointer transition-all whitespace-nowrap"
          >
            <i className={editing ? 'ri-close-line' : 'ri-edit-line'}></i>
            {editing ? t('clientPortal.common.cancel') : t('clientPortal.common.edit')}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t('clientPortal.profile.firstName'), key: 'prenom', type: 'text' },
              { label: t('clientPortal.profile.lastName'), key: 'nom', type: 'text' },
              { label: t('clientPortal.profile.email'), key: 'email', type: 'email' },
              { label: t('clientPortal.profile.phone'), key: 'telephone', type: 'tel' },
              { label: t('clientPortal.profile.company'), key: 'entreprise', type: 'text' },
              { label: t('clientPortal.profile.position'), key: 'poste', type: 'text' },
              { label: t('clientPortal.profile.city'), key: 'ville', type: 'text' },
              { label: t('clientPortal.profile.address'), key: 'adresse', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-[#00272B]/50 uppercase tracking-wide mb-1.5">{field.label}</label>
                {editing ? (
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10"
                  />
                ) : (
                  <p className="text-sm text-[#00272B] py-2.5 px-3 bg-gray-50 rounded-xl">
                    {form[field.key as keyof typeof form] as string}
                  </p>
                )}
              </div>
            ))}
          </div>

          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}

          {editing && (
            <div className="flex justify-end mt-5">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 cursor-pointer transition-all whitespace-nowrap"
              >
                <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'}></i>
                {saving ? t('clientPortal.profile.saving') : t('clientPortal.profile.save')}
              </button>
            </div>
          )}
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-[#00272B]/30">
            {form.dateInscription ? t('clientPortal.profile.clientSince', { date: form.dateInscription }) : ''}{t('clientPortal.profile.id', { id: form.id })}
          </p>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">{t('clientPortal.profile.passwordTitle')}</h3>
            <p className="text-xs text-[#00272B]/40 mt-0.5">{t('clientPortal.profile.passwordHint')}</p>
          </div>
          <button onClick={() => setShowPwdForm(v => !v)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-xl hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            <i className="ri-lock-line"></i>
            {showPwdForm ? t('clientPortal.common.cancel') : t('clientPortal.common.edit')}
          </button>
        </div>

        {showPwdForm && (
          <form onSubmit={handlePwdSave} className="mt-5 space-y-4">
            {[
              { label: t('clientPortal.profile.currentPassword'), key: 'current', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
              { label: t('clientPortal.profile.newPassword'), key: 'next', show: showNext, toggle: () => setShowNext(v => !v) },
              { label: t('clientPortal.profile.confirmPassword'), key: 'confirm', show: showNext, toggle: () => setShowNext(v => !v) },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-[#00272B] mb-1.5">{f.label}</label>
                <div className="relative">
                  <input
                    type={f.show ? 'text' : 'password'}
                    value={pwd[f.key as keyof typeof pwd]}
                    onChange={e => setPwd(p => ({ ...p, [f.key]: e.target.value }))}
                    required
                    placeholder="••••••••"
                    className="w-full h-10 pl-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F]"
                  />
                  <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00272B]/30 hover:text-[#00272B]/60 cursor-pointer w-4 h-4 flex items-center justify-center">
                    <i className={f.show ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                  </button>
                </div>
              </div>
            ))}
            {pwdError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{pwdError}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pwdSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 cursor-pointer transition-all whitespace-nowrap"
              >
                <i className={pwdSaving ? 'ri-loader-4-line animate-spin' : 'ri-lock-unlock-line'}></i>
                {pwdSaving ? t('clientPortal.profile.updating') : t('clientPortal.profile.update')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
