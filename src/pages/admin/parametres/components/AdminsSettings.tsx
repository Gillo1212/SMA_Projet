import { useState } from 'react';
import { AdminUser, CreateAdminData } from '../../../../services/settings.service';

interface Props {
  admins: AdminUser[];
  onCreateAdmin: (data: CreateAdminData) => Promise<void>;
  onToggleAdmin: (id: number) => Promise<void>;
  onDeleteAdmin: (id: number) => Promise<void>;
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  commercial: 'Commercial',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-[#1AAA3F]/10 text-[#1AAA3F]',
  admin: 'bg-sky-50 text-sky-700',
  commercial: 'bg-amber-50 text-amber-700',
};

const emptyForm: CreateAdminData = { email: '', password: '', first_name: '', last_name: '', role: 'admin' };

export default function AdminsSettings({ admins, onCreateAdmin, onToggleAdmin, onDeleteAdmin }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateAdminData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onCreateAdmin(form);
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    try {
      await onToggleAdmin(id);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDeleteAdmin(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'Jamais';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
              <i className="ri-shield-user-line text-[#1AAA3F] text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#00272B]">Équipe administratrice</h3>
              <p className="text-xs text-[#00272B]/40">{admins.length} compte{admins.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-user-add-line"></i>
            Ajouter un admin
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">Administrateur</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">Rôle</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">Dernière connexion</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide">Statut</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#1AAA3F]">
                          {admin.first_name[0]}{admin.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#00272B]">{admin.first_name} {admin.last_name}</p>
                        <p className="text-xs text-[#00272B]/45">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[admin.role] || 'bg-gray-100 text-gray-600'}`}>
                      {roleLabels[admin.role] || admin.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs text-[#00272B]/60">{formatDate(admin.last_login)}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => handleToggle(admin.id)}
                      disabled={toggling === admin.id}
                      className={`relative w-10 h-5 rounded-full transition-all cursor-pointer disabled:opacity-60 ${
                        admin.is_active ? 'bg-[#1AAA3F]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        admin.is_active ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(admin)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#00272B]/30 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Créer Admin */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#00272B]">Nouvel administrateur</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#00272B]/40 hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-xs mb-4 border border-red-100">
                <i className="ri-error-warning-line"></i>{error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Prénom</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nom</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Mot de passe</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]"
                  placeholder="Min. 8 caractères" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Rôle</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B] cursor-pointer bg-white">
                  <option value="admin">Administrateur</option>
                  <option value="commercial">Commercial</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-[#00272B]/60 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer">
                  {saving ? <i className="ri-loader-4-line animate-spin"></i> : null}
                  {saving ? 'Création…' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-[#00272B] text-center mb-2">Supprimer l&apos;administrateur ?</h3>
            <p className="text-sm text-[#00272B]/50 text-center mb-6">
              <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong> sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-[#00272B]/60 hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 cursor-pointer whitespace-nowrap">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
