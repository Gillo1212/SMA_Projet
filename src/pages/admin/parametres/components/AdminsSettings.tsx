import { useState } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { AdminUser, CreateAdminData } from '../../../../services/settings.service';

interface Props {
  admins: AdminUser[];
  onCreateAdmin: (data: CreateAdminData) => Promise<void>;
  onUpdateAdmin: (id: number, data: { role?: string }) => Promise<void>;
  onToggleAdmin: (id: number) => Promise<void>;
  /** Renvoie true si le compte a été désactivé plutôt que supprimé */
  onDeleteAdmin: (id: number) => Promise<boolean>;
}

const ROLES: { value: AdminUser['role']; label: string; hint: string }[] = [
  { value: 'super_admin', label: 'Super Admin', hint: 'Tous les droits, dont la gestion des comptes' },
  { value: 'admin', label: 'Administrateur', hint: 'Catalogue, commandes, paramètres boutique' },
  { value: 'commercial', label: 'Commercial', hint: 'Commandes et devis ; paramètres en lecture seule' },
];

const roleColors: Record<string, string> = {
  super_admin: 'bg-[#1AAA3F]/10 text-[#1AAA3F]',
  admin: 'bg-sky-50 text-sky-700',
  commercial: 'bg-amber-50 text-amber-700',
};

const emptyForm: CreateAdminData = { email: '', password: '', first_name: '', last_name: '', role: 'admin' };

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]';

/** Mêmes règles que adminRegisterRules côté backend */
function passwordProblem(pwd: string): string | null {
  if (pwd.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (!/[A-Z]/.test(pwd)) return 'Le mot de passe doit contenir au moins une majuscule.';
  if (!/[0-9]/.test(pwd)) return 'Le mot de passe doit contenir au moins un chiffre.';
  return null;
}

export default function AdminsSettings({ admins, onCreateAdmin, onUpdateAdmin, onToggleAdmin, onDeleteAdmin }: Props) {
  const { user } = useAuthContext();
  const canManage = user?.role === 'super_admin';
  const isSelf = (admin: AdminUser) => String(admin.id) === String(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateAdminData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const flash = (type: 'ok' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = passwordProblem(form.password);
    if (problem) { setFormError(problem); return; }
    setSaving(true);
    setFormError(null);
    try {
      await onCreateAdmin(form);
      flash('ok', `Compte ${form.email} créé.`);
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  /** Exécute une action sur une ligne, en affichant l'erreur du serveur le cas échéant */
  const run = async (id: number, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Action impossible');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await run(target.id, async () => {
      const deactivated = await onDeleteAdmin(target.id);
      flash('ok', deactivated
        ? `${target.first_name} ${target.last_name} a rédigé des articles : son compte est désactivé et conservé.`
        : `${target.first_name} ${target.last_name} a été supprimé.`);
    });
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'Jamais';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${notice.type === 'ok' ? 'bg-[#EEFFF2] border-[#1AAA3F]/20' : 'bg-red-50 border-red-100'}`}>
          <i className={notice.type === 'ok' ? 'ri-check-line text-[#1AAA3F] mt-0.5' : 'ri-error-warning-line text-red-500 mt-0.5'}></i>
          <p className={`text-sm ${notice.type === 'ok' ? 'text-[#00272B]/80' : 'text-red-600'}`}>{notice.text}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
              <i className="ri-shield-user-line text-[#1AAA3F] text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#00272B]">Comptes du back-office</h3>
              <p className="text-xs text-[#00272B]/40">
                {canManage ? 'Créez les comptes de l’équipe et attribuez leur rôle' : 'Seul un super administrateur peut gérer les comptes'}
              </p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => { setShowModal(true); setFormError(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-add-line"></i>
              Nouvel administrateur
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Administrateur', 'Rôle', 'Dernière connexion', 'Statut', ''].map(h => (
                  <th key={h || 'actions'} className="text-left py-3 px-3 text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map(admin => {
                const self = isSelf(admin);
                const locked = !canManage || self;
                return (
                  <tr key={admin.id} className={admin.is_active ? '' : 'opacity-60'}>
                    <td className="py-3.5 px-3">
                      <p className="text-sm font-semibold text-[#00272B]">
                        {admin.first_name} {admin.last_name}
                        {self && <span className="ml-2 text-xs font-medium text-[#00272B]/40">(vous)</span>}
                      </p>
                      <p className="text-xs text-[#00272B]/45">{admin.email}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      {locked ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[admin.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLES.find(r => r.value === admin.role)?.label ?? admin.role}
                        </span>
                      ) : (
                        <select
                          aria-label={`Rôle de ${admin.first_name} ${admin.last_name}`}
                          value={admin.role} disabled={busyId === admin.id}
                          onChange={e => run(admin.id, () => onUpdateAdmin(admin.id, { role: e.target.value }))}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 bg-white text-[#00272B] cursor-pointer"
                        >
                          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#00272B]/50">{formatDate(admin.last_login)}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${admin.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {admin.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {!locked && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => run(admin.id, () => onToggleAdmin(admin.id))}
                            disabled={busyId === admin.id}
                            title={admin.is_active ? 'Désactiver' : 'Réactiver'}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#00272B]/50 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                          >
                            <i className={busyId === admin.id ? 'ri-loader-4-line animate-spin' : admin.is_active ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(admin)} disabled={busyId === admin.id}
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
      </div>

      {/* Rôles */}
      <div className="bg-[#F6F3EC] rounded-2xl p-6">
        <h4 className="text-sm font-bold text-[#00272B] mb-3">Les rôles</h4>
        <ul className="space-y-2">
          {ROLES.map(r => (
            <li key={r.value} className="flex items-start gap-3 text-xs">
              <span className={`font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${roleColors[r.value]}`}>{r.label}</span>
              <span className="text-[#00272B]/60 pt-0.5">{r.hint}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" role="dialog" aria-modal="true" aria-labelledby="new-admin-title">
            <div className="flex items-center justify-between mb-5">
              <h3 id="new-admin-title" className="text-base font-bold text-[#00272B]">Nouvel administrateur</h3>
              <button onClick={() => setShowModal(false)} aria-label="Fermer" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#00272B]/40 hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Prénom</label>
                  <input name="first_name" required value={form.first_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nom</label>
                  <input name="last_name" required value={form.last_name} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Email</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Mot de passe provisoire</label>
                <input type="text" name="password" required value={form.password} onChange={handleChange} className={`${inputClass} font-mono`} autoComplete="new-password" />
                <p className="mt-1 text-xs text-[#00272B]/40">8 caractères minimum, avec une majuscule et un chiffre. À transmettre à la personne, qui le changera dans l’onglet Sécurité.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Rôle</label>
                <select name="role" value={form.role} onChange={handleChange} className={`${inputClass} bg-white cursor-pointer`}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.hint}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-10 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                  {saving && <i className="ri-loader-4-line animate-spin"></i>}
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center" role="dialog" aria-modal="true">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-[#00272B] mb-2">Supprimer ce compte ?</h3>
            <p className="text-sm text-[#00272B]/60 mb-6">
              <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong> ne pourra plus se connecter.
              S’il a rédigé des articles, son compte sera désactivé plutôt que supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 h-10 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 cursor-pointer">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
