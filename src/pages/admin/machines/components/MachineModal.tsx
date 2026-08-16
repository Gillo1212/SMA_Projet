import { useState, useEffect } from 'react';
import type { Machine } from '../../../../types/models';

interface Props {
  mode: 'add' | 'edit';
  machine?: Machine | null;
  onClose: () => void;
  onSave: (machine: Machine) => void;
}

const machineTypes = [
  { id: 'cafe', label: 'Distributeur de Café', category: 'Distributeur de Café' },
  { id: 'snacks', label: 'Distributeur de Snacks', category: 'Distributeur de Snacks' },
  { id: 'boissons', label: 'Distributeur de Boissons', category: 'Distributeur de Boissons' },
  { id: 'combine', label: 'Distributeur Combiné', category: 'Distributeur Combiné' },
];

const stockOptions = ['En stock', 'Stock limité', 'Rupture de stock'];
const paymentOptions = [
  { id: 'wave', label: 'Wave' },
  { id: 'orange', label: 'Orange Money' },
  { id: 'carte', label: 'Carte Bancaire' },
  { id: 'especes', label: 'Espèces' },
];

const defaultForm = {
  name: '',
  type: 'cafe',
  category: 'Distributeur de Café',
  price: 0,
  priceDisplay: '',
  stock: 'En stock',
  deliveryTime: '5-7 jours ouvrés',
  shortDescription: '',
  paymentMethods: ['wave', 'orange', 'carte', 'especes'],
  image: 'https://readdy.ai/api/search-image?query=modern%20professional%20vending%20machine%20sleek%20design%20white%20background&width=600&height=800&seq=machine-new-001&orientation=portrait',
};

export default function MachineModal({ mode, machine, onClose, onSave }: Props) {
  const [form, setForm] = useState({ ...defaultForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && machine) {
      setForm({
        name: machine.name,
        type: machine.type,
        category: machine.category,
        price: machine.price,
        priceDisplay: machine.priceDisplay,
        stock: machine.stock,
        deliveryTime: machine.deliveryTime,
        shortDescription: machine.shortDescription || '',
        paymentMethods: machine.paymentMethods,
        image: machine.image,
      });
    } else {
      setForm({ ...defaultForm });
    }
  }, [mode, machine]);

  function togglePayment(id: string) {
    setForm(f => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(id)
        ? f.paymentMethods.filter(p => p !== id)
        : [...f.paymentMethods, id],
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.price || form.price <= 0) e.price = 'Prix requis';
    if (!form.shortDescription.trim()) e.shortDescription = 'Description requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const typeObj = machineTypes.find(t => t.id === form.type);

    // On repart de la machine existante pour ne pas perdre les champs que ce
    // formulaire n'édite pas (specifications, gallery, features…).
    const base: Partial<Machine> = machine ?? {};
    const saved = {
      ...base,
      id: machine?.id ?? '',
      slug: machine?.slug ?? '',
      name: form.name,
      type: form.type as Machine['type'],
      category: typeObj?.category ?? form.category,
      price: form.price,
      priceDisplay: `${form.price.toLocaleString('fr-FR')} FCFA`,
      stock: form.stock as Machine['stock'],
      deliveryTime: form.deliveryTime,
      shortDescription: form.shortDescription,
      paymentMethods: form.paymentMethods,
      image: form.image || defaultForm.image,
    } as Machine;

    onSave(saved);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1AAA3F]/10 rounded-xl flex items-center justify-center">
              <i className="ri-settings-2-line text-[#1AAA3F] text-base"></i>
            </div>
            <h2 className="text-base font-bold text-[#00272B]">
              {mode === 'add' ? 'Ajouter une machine' : 'Modifier la machine'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40 hover:text-[#00272B]">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Image preview */}
          <div className="flex gap-4 items-start">
            <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
              <img src={form.image} alt="preview" className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">URL Image</label>
              <input
                type="text"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nom de la machine <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ex: TCN Machine à Café Commerciale"
              className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Catégorie</label>
              <select
                value={form.type}
                onChange={e => {
                  const typeObj = machineTypes.find(t => t.id === e.target.value);
                  setForm(f => ({ ...f, type: e.target.value, category: typeObj?.category ?? '' }));
                }}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] bg-white cursor-pointer"
              >
                {machineTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Disponibilité</label>
              <select
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] bg-white cursor-pointer"
              >
                {stockOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prix */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Prix (FCFA) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.price || ''}
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                placeholder="ex: 2850000"
                className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            {/* Délai livraison */}
            <div>
              <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Délai de livraison</label>
              <input
                type="text"
                value={form.deliveryTime}
                onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))}
                placeholder="ex: 5-7 jours ouvrés"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
          </div>

          {/* Description courte */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Description courte <span className="text-red-500">*</span></label>
            <textarea
              value={form.shortDescription}
              onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
              rows={2}
              placeholder="Description en une ligne pour les listes..."
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none ${errors.shortDescription ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
            />
            {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>}
          </div>

          {/* Paiements */}
          <div>
            <label className="block text-xs font-semibold text-[#00272B]/60 mb-2">Modes de paiement acceptés</label>
            <div className="flex gap-2 flex-wrap">
              {paymentOptions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePayment(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-all whitespace-nowrap ${
                    form.paymentMethods.includes(p.id)
                      ? 'bg-[#1AAA3F] text-white border-[#1AAA3F]'
                      : 'border-gray-200 text-[#00272B]/50 hover:border-gray-300'
                  }`}
                >
                  {form.paymentMethods.includes(p.id) && <i className="ri-check-line mr-1"></i>}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#00272B]/60 hover:text-[#00272B] cursor-pointer whitespace-nowrap">Annuler</button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-save-line"></i>
            {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
