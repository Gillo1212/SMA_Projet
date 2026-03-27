import { useState } from 'react';
import { mockClient } from '../../../mocks/clientPortal';

export default function ClientProfilPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...mockClient });
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePwdSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPwdForm(false);
    setPwd({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <i className="ri-checkbox-circle-line text-emerald-500"></i>
          <p className="text-sm font-medium text-emerald-700">Profil mis à jour avec succès.</p>
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
            {editing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Prénom', key: 'prenom', type: 'text' },
              { label: 'Nom', key: 'nom', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Téléphone', key: 'telephone', type: 'tel' },
              { label: 'Entreprise', key: 'entreprise', type: 'text' },
              { label: 'Poste', key: 'poste', type: 'text' },
              { label: 'Ville', key: 'ville', type: 'text' },
              { label: 'Adresse', key: 'adresse', type: 'text' },
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

          {editing && (
            <div className="flex justify-end mt-5">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer transition-all whitespace-nowrap">
                <i className="ri-save-line"></i>
                Enregistrer
              </button>
            </div>
          )}
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-[#00272B]/30">
            Client depuis le {new Date(form.dateInscription).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · ID : {form.id}
          </p>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-bold text-[#00272B]">Mot de passe</h3>
            <p className="text-xs text-[#00272B]/40 mt-0.5">Modifiez votre mot de passe de connexion</p>
          </div>
          <button onClick={() => setShowPwdForm(v => !v)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-xl hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            <i className="ri-lock-line"></i>
            {showPwdForm ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {showPwdForm && (
          <form onSubmit={handlePwdSave} className="mt-5 space-y-4">
            {[
              { label: 'Mot de passe actuel', key: 'current', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
              { label: 'Nouveau mot de passe', key: 'next', show: showNext, toggle: () => setShowNext(v => !v) },
              { label: 'Confirmer le nouveau', key: 'confirm', show: showNext, toggle: () => setShowNext(v => !v) },
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
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer transition-all whitespace-nowrap">
                <i className="ri-lock-unlock-line"></i>
                Mettre à jour
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
