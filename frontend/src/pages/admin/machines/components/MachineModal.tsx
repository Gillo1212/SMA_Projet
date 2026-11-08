import { useState, useEffect } from 'react';
import type { Category, Machine } from '../../../../types/models';
import { machinesService } from '../../../../services/machines.service';
import Modal from '../../../../components/admin/Modal';
import { ImageGalleryField } from '../../../../components/admin/ImageUpload';

interface Props {
  mode: 'add' | 'edit';
  machine?: Machine | null;
  onClose: () => void;
  onSave: (machine: Machine) => Promise<void> | void;
}

const paymentOptions = [
  { id: 'wave', label: 'Wave' },
  { id: 'orange', label: 'Orange Money' },
  { id: 'carte', label: 'Carte Bancaire' },
  { id: 'especes', label: 'Espèces' },
];

interface FormState {
  name: string;
  categoryId: string;
  brand: string;
  modelRef: string;
  price: number;
  stockQuantity: number;
  deliveryTime: string;
  description: string;
  paymentMethods: string[];
  images: string[];
  featured: boolean;
}

const defaultForm: FormState = {
  name: '',
  categoryId: '',
  brand: '',
  modelRef: '',
  price: 0,
  stockQuantity: 0,
  deliveryTime: '5-7 jours ouvrés',
  description: '',
  paymentMethods: ['wave', 'orange', 'carte', 'especes'],
  images: [],
  featured: false,
};

/** Photos de la machine : l'image principale en tête, sans doublon */
function machineImages(machine: Machine): string[] {
  const list = [machine.image, ...machine.gallery].filter(Boolean);
  return [...new Set(list)];
}

const inputClass = (error?: string) =>
  `w-full h-9 px-3 border rounded-lg text-sm focus:outline-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`;

export default function MachineModal({ mode, machine, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    machinesService.getCategories()
      .then(list => { if (!cancelled) setCategories(list); })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (mode === 'edit' && machine) {
      setForm({
        name: machine.name,
        categoryId: machine.categoryId ?? '',
        brand: machine.brand ?? '',
        modelRef: machine.modelRef ?? '',
        price: machine.price,
        stockQuantity: machine.stockQuantity ?? 0,
        deliveryTime: machine.deliveryTime,
        description: machine.description || machine.shortDescription || '',
        paymentMethods: machine.paymentMethods,
        images: machineImages(machine),
        featured: Boolean(machine.badge),
      });
    } else {
      setForm({ ...defaultForm });
    }
    setErrors({});
  }, [mode, machine]);

  // Nouvelle machine : première catégorie proposée par défaut
  useEffect(() => {
    if (mode === 'add' && categories.length && !form.categoryId) {
      setForm(f => ({ ...f, categoryId: categories[0].id }));
    }
  }, [mode, categories, form.categoryId]);

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
    if (!form.categoryId) e.categoryId = 'Catégorie requise';
    if (form.price < 0 || !Number.isFinite(form.price)) e.price = 'Prix invalide';
    if (form.stockQuantity < 0 || !Number.isInteger(form.stockQuantity)) e.stockQuantity = 'Stock invalide';
    if (!form.description.trim()) e.description = 'Description requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const category = categories.find(c => c.id === form.categoryId);

    // On repart de la machine existante pour ne pas perdre les champs que ce
    // formulaire n'édite pas (specifications, features…).
    const base: Partial<Machine> = machine ?? {};
    const saved = {
      ...base,
      id: machine?.id ?? '',
      slug: machine?.slug ?? '',
      name: form.name.trim(),
      categoryId: form.categoryId,
      category: category?.name ?? base.category ?? '',
      brand: form.brand.trim(),
      modelRef: form.modelRef.trim(),
      price: form.price,
      priceDisplay: `${form.price.toLocaleString('fr-FR')} FCFA`,
      stockQuantity: form.stockQuantity,
      deliveryTime: form.deliveryTime,
      description: form.description.trim(),
      paymentMethods: form.paymentMethods,
      image: form.images[0] ?? '',
      gallery: form.images,
      badge: form.featured ? 'Populaire' : undefined,
    } as Machine;

    setSaving(true);
    try {
      await onSave(saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      size="lg"
      title={mode === 'add' ? 'Ajouter une machine' : 'Modifier la machine'}
      subtitle={mode === 'edit' ? machine?.name : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 h-10 text-sm font-medium text-[#00272B]/60 hover:text-[#00272B] cursor-pointer whitespace-nowrap disabled:opacity-50">
            Annuler
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-5 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer flex items-center gap-2 whitespace-nowrap disabled:opacity-60">
            <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'}></i>
            {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <ImageGalleryField
          label="Photos de la machine"
          value={form.images}
          onChange={images => setForm(f => ({ ...f, images }))}
        />

        {/* Nom */}
        <div>
          <label htmlFor="machine-name" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Nom de la machine <span className="text-red-500">*</span></label>
          <input
            id="machine-name"
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ex : Lecon Good Taste 50S"
            className={inputClass(errors.name)}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="machine-category" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Catégorie <span className="text-red-500">*</span></label>
            <select
              id="machine-category"
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className={`${inputClass(errors.categoryId)} bg-white cursor-pointer`}
            >
              {!form.categoryId && <option value="">{categories.length ? 'Choisir…' : 'Chargement…'}</option>}
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
          </div>
          <div>
            <label htmlFor="machine-stock" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Stock (unités)</label>
            <input
              id="machine-stock"
              type="number"
              min={0}
              step={1}
              value={form.stockQuantity}
              onChange={e => setForm(f => ({ ...f, stockQuantity: Number(e.target.value) }))}
              className={inputClass(errors.stockQuantity)}
            />
            {errors.stockQuantity
              ? <p className="text-xs text-red-500 mt-1">{errors.stockQuantity}</p>
              : <p className="text-xs text-[#00272B]/40 mt-1">0 : rupture · 1 à 3 : stock limité</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="machine-brand" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Marque</label>
            <input id="machine-brand" type="text" value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              placeholder="ex : Lecon" className={inputClass()} />
          </div>
          <div>
            <label htmlFor="machine-model" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Référence du modèle</label>
            <input id="machine-model" type="text" value={form.modelRef}
              onChange={e => setForm(f => ({ ...f, modelRef: e.target.value }))}
              placeholder="ex : 50S" className={inputClass()} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="machine-price" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Prix (FCFA)</label>
            <input
              id="machine-price"
              type="number"
              min={0}
              value={form.price || ''}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              placeholder="ex : 2850000"
              className={inputClass(errors.price)}
            />
            {errors.price
              ? <p className="text-xs text-red-500 mt-1">{errors.price}</p>
              : <p className="text-xs text-[#00272B]/40 mt-1">Vide ou 0 : affiché « Sur devis »</p>}
          </div>
          <div>
            <label htmlFor="machine-delivery" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Délai de livraison</label>
            <input
              id="machine-delivery"
              type="text"
              value={form.deliveryTime}
              onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))}
              placeholder="ex : 5-7 jours ouvrés"
              className={inputClass()}
            />
          </div>
        </div>

        <div>
          <label htmlFor="machine-description" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Description <span className="text-red-500">*</span></label>
          <textarea
            id="machine-description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="La première phrase sert de résumé dans les listes."
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-y ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div>
          <p className="block text-xs font-semibold text-[#00272B]/60 mb-2">Modes de paiement acceptés</p>
          <div className="flex gap-2 flex-wrap">
            {paymentOptions.map(p => (
              <button
                key={p.id}
                type="button"
                aria-pressed={form.paymentMethods.includes(p.id)}
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

        <label className="flex items-center gap-2 text-sm text-[#00272B]/70 cursor-pointer">
          <input type="checkbox" checked={form.featured}
            onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
            className="w-4 h-4 accent-[#1AAA3F]" />
          Mettre en avant (badge « Populaire »)
        </label>
      </div>
    </Modal>
  );
}
