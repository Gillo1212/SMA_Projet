import { useState } from 'react';
import { useMachines } from '../../../hooks/useMachines';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import MachineModal from './components/MachineModal';
import DeleteModal from './components/DeleteModal';
import type { Machine } from '../../../types/models';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function AdminMachinesPage() {
  const {
    machines: machineList,
    isLoading,
    error,
    refetch,
    create,
    update,
    remove,
  } = useMachines();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const machineTypes = [
    { id: 'all', name: 'Tous' },
    { id: 'cafe', name: 'Café' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'boissons', name: 'Boissons' },
    { id: 'combine', name: 'Combinés' },
  ];

  const stockColors: Record<string, string> = {
    'En stock': 'bg-emerald-50 text-emerald-700',
    'Stock limité': 'bg-amber-50 text-amber-700',
    'Rupture de stock': 'bg-red-50 text-red-700',
  };

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleAdd() {
    setSelectedMachine(null);
    setModalMode('add');
  }

  function handleEdit(machine: Machine) {
    setSelectedMachine(machine);
    setModalMode('edit');
  }

  function handleDeleteClick(machine: Machine) {
    setMachineToDelete(machine);
    setShowDeleteModal(true);
  }

  async function handleSave(machine: Machine) {
    try {
      if (modalMode === 'add') {
        await create(machine);
        showToast(`Machine "${machine.name}" ajoutée avec succès`);
      } else {
        await update(machine.id, machine);
        showToast(`Machine "${machine.name}" mise à jour`);
      }
      setModalMode(null);
      setSelectedMachine(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Enregistrement impossible', 'error');
    }
  }

  async function handleDeleteConfirm() {
    if (!machineToDelete) return;
    try {
      await remove(machineToDelete.id);
      showToast(`Machine "${machineToDelete.name}" supprimée`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Suppression impossible', 'error');
    } finally {
      setShowDeleteModal(false);
      setMachineToDelete(null);
    }
  }

  if (isLoading) return <LoadingState label="Chargement des machines…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = machineList.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q);
    const matchType = filterType === 'all' || m.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total machines', value: machineList.length, icon: 'ri-settings-2-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: 'En stock', value: machineList.filter(m => m.stock === 'En stock').length, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Stock limité', value: machineList.filter(m => m.stock === 'Stock limité').length, icon: 'ri-error-warning-line', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Valeur catalogue', value: `${(machineList.reduce((s, m) => s + m.price, 0) / 1000000).toFixed(0)}M FCFA`, icon: 'ri-money-dollar-circle-line', color: 'text-sky-600', bg: 'bg-sky-50' },
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#00272B]/30 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-56 h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <div className="flex gap-2">
              {machineTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                    filterType === type.id ? 'bg-[#1AAA3F] text-white' : 'text-[#00272B]/50 hover:bg-gray-100'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Ajouter
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
              <i className="ri-search-line text-[#00272B]/30 text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#00272B]/40">Aucune machine trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-gray-50/60">
                <tr>
                  {['Machine', 'Catégorie', 'Prix', 'Paiements', 'Stock', 'Livraison', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(machine => (
                  <tr key={machine.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={machine.image} alt={machine.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#00272B]">{machine.name}</p>
                          <p className="text-xs text-[#00272B]/40">{machine.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-[#00272B]/60 rounded-full">
                        {machine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#00272B]">{machine.priceDisplay}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {machine.paymentMethods.map((pm: string) => (
                          <span key={pm} className="text-xs px-1.5 py-0.5 bg-gray-100 text-[#00272B]/50 rounded">
                            {pm === 'wave' ? 'W' : pm === 'orange' ? 'OM' : pm === 'carte' ? 'CB' : '€'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stockColors[machine.stock] ?? 'bg-gray-50 text-gray-600'}`}>
                        {machine.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#00272B]/60">{machine.deliveryTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(machine)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40 hover:text-[#00272B]"
                          title="Modifier"
                        >
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(machine)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer text-[#00272B]/40 hover:text-red-500"
                          title="Supprimer"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalMode && (
        <MachineModal
          mode={modalMode}
          machine={selectedMachine}
          onClose={() => { setModalMode(null); setSelectedMachine(null); }}
          onSave={handleSave}
        />
      )}

      {showDeleteModal && machineToDelete && (
        <DeleteModal
          itemName={machineToDelete.name}
          itemType="cette machine"
          onClose={() => { setShowDeleteModal(false); setMachineToDelete(null); }}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl ${toast.type === 'success' ? 'bg-[#00272B]' : 'bg-red-900'}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-[#1AAA3F]/20' : 'bg-red-500/20'}`}>
            <i className={`text-sm ${toast.type === 'success' ? 'ri-checkbox-circle-line text-[#1AAA3F]' : 'ri-error-warning-line text-red-300'}`}></i>
          </div>
          <p className="text-sm font-medium text-white">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-1 text-white/40 hover:text-white cursor-pointer w-5 h-5 flex items-center justify-center">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
}
