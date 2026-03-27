import { useState } from 'react';
import { adminDevis, DevisStatus, AdminDevis } from '../../../mocks/admin';

const ALL_STATUTS: DevisStatus[] = ['Nouveau', 'En cours', 'Devis envoyé', 'Accepté', 'Refusé'];

const statusColors: Record<DevisStatus, string> = {
  'Nouveau': 'bg-amber-50 text-amber-700 border-amber-200',
  'En cours': 'bg-sky-50 text-sky-700 border-sky-200',
  'Devis envoyé': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Accepté': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Refusé': 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminDevisPage() {
  const [devisList, setDevisList] = useState<AdminDevis[]>(adminDevis);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');
  const [selected, setSelected] = useState<AdminDevis | null>(null);
  const [montantInput, setMontantInput] = useState('');

  const filtered = devisList.filter(d => {
    const matchSearch = d.entreprise.toLowerCase().includes(search.toLowerCase()) || d.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'Tous' || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const updateStatut = (id: string, statut: DevisStatus) => {
    setDevisList(prev => prev.map(d => d.id === id ? { ...d, statut } : d));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, statut } : prev);
  };

  const saveMontant = () => {
    if (!selected || !montantInput) return;
    const val = parseInt(montantInput.replace(/\s/g, ''), 10);
    if (isNaN(val)) return;
    setDevisList(prev => prev.map(d => d.id === selected.id ? { ...d, montantPropose: val } : d));
    setSelected(prev => prev ? { ...prev, montantPropose: val } : prev);
    setMontantInput('');
  };

  const stats = {
    total: devisList.length,
    nouveau: devisList.filter(d => d.statut === 'Nouveau').length,
    accepte: devisList.filter(d => d.statut === 'Accepté').length,
    totalValeur: devisList.filter(d => d.montantPropose).reduce((s, d) => s + (d.montantPropose ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total devis', value: stats.total, icon: 'ri-file-list-3-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: 'Nouveaux', value: stats.nouveau, icon: 'ri-notification-badge-line', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Acceptés', value: stats.accepte, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Valeur pipeline', value: `${(stats.totalValeur / 1000000).toFixed(1)}M FCFA`, icon: 'ri-money-dollar-circle-line', color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-[#00272B]">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col min-w-0">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#00272B]/30 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] cursor-pointer text-[#00272B]"
            >
              <option value="Tous">Tous</option>
              {ALL_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map(devis => (
              <div
                key={devis.id}
                onClick={() => { setSelected(devis); setMontantInput(''); }}
                className={`p-5 cursor-pointer hover:bg-gray-50/60 transition-colors ${selected?.id === devis.id ? 'bg-[#1AAA3F]/5' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-[#00272B]">{devis.entreprise}</p>
                    <p className="text-xs text-[#00272B]/50">{devis.contact} · {devis.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ml-2 ${statusColors[devis.statut]}`}>
                    {devis.statut}
                  </span>
                </div>
                <p className="text-xs text-[#00272B]/60 mb-2">{devis.machine} · {devis.employes} employés</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#00272B]/35">{devis.id} · {devis.date}</span>
                  {devis.montantPropose && (
                    <span className="text-xs font-bold text-[#1AAA3F]">{devis.montantPropose.toLocaleString('fr-FR')} FCFA</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-[#00272B]">Détail du devis</h3>
              <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40">
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-0.5">Entreprise</p>
                <p className="text-sm font-bold text-[#00272B]">{selected.entreprise}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-0.5">Contact</p>
                <p className="text-sm font-semibold text-[#00272B]">{selected.contact}</p>
                <a href={`mailto:${selected.email}`} className="text-xs text-[#1AAA3F] hover:underline">{selected.email}</a>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-0.5">Machine demandée</p>
                <p className="text-sm font-medium text-[#00272B]">{selected.machine}</p>
                <p className="text-xs text-[#00272B]/40">{selected.employes} employés</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Message</p>
                <p className="text-sm text-[#00272B]/70 leading-relaxed">{selected.message}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#00272B]/40 mb-1">Montant proposé</p>
                {selected.montantPropose ? (
                  <p className="text-base font-bold text-[#1AAA3F]">{selected.montantPropose.toLocaleString('fr-FR')} FCFA</p>
                ) : (
                  <p className="text-sm text-[#00272B]/40">Non défini</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={montantInput}
                  onChange={e => setMontantInput(e.target.value)}
                  placeholder="Ex: 5200000"
                  className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
                />
                <button
                  onClick={saveMontant}
                  className="px-3 h-9 bg-[#1AAA3F] text-white text-xs font-semibold rounded-lg hover:bg-[#158f35] cursor-pointer whitespace-nowrap"
                >
                  Sauver
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Statut</p>
              <div className="grid grid-cols-1 gap-1.5">
                {ALL_STATUTS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatut(selected.id, s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left border ${
                      selected.statut === s
                        ? statusColors[s] + ' border-current'
                        : 'text-[#00272B]/50 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {selected.statut === s && <i className="ri-check-line mr-1.5"></i>}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
