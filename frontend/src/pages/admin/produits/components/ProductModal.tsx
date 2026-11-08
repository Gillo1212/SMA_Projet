import { useEffect, useState } from 'react';
import type { Category, Product } from '../../../../types/models';
import { productsService } from '../../../../services/products.service';
import Modal from '../../../../components/admin/Modal';
import { ImageGalleryField } from '../../../../components/admin/ImageUpload';

interface Props {
  mode: 'add' | 'edit';
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Partial<Product> & { categoryId?: string }) => Promise<void>;
}

interface FormState {
  name: string;
  categoryId: string;
  brand: string;
  sku: string;
  price: number;
  stock: number;
  format: string;
  description: string;
  images: string[];
  isAvailable: boolean;
  isPopular: boolean;
}

const defaultForm: FormState = {
  name: '',
  categoryId: '',
  brand: '',
  sku: '',
  price: 0,
  stock: 0,
  format: 'unité',
  description: '',
  images: [],
  isAvailable: true,
  isPopular: false,
};

const inputClass = (error?: string) =>
  `w-full h-9 px-3 border rounded-lg text-sm focus:outline-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#1AAA3F]'}`;

const labelClass = 'block text-xs font-semibold text-[#00272B]/60 mb-1.5';

export default function ProductModal({ mode, product, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    productsService.getCategories()
      .then(list => { if (!cancelled) setCategories(list); })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (mode === 'edit' && product) {
      setForm({
        name: product.name,
        categoryId: product.categoryId ?? '',
        brand: product.brand,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        format: product.format || 'unité',
        description: product.description,
        images: [...new Set(product.images.filter(Boolean))],
        isAvailable: product.isAvailable,
        isPopular: Boolean(product.isPopular),
      });
    } else {
      setForm({ ...defaultForm });
    }
    setErrors({});
  }, [mode, product]);

  useEffect(() => {
    if (mode === 'add' && categories.length && !form.categoryId) {
      setForm(f => ({ ...f, categoryId: categories[0].id }));
    }
  }, [mode, categories, form.categoryId]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.categoryId) e.categoryId = 'Catégorie requise';
    if (!(form.price >= 0)) e.price = 'Prix invalide';
    if (!(form.stock >= 0) || !Number.isInteger(form.stock)) e.stock = 'Stock invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      // On repart du produit existant pour garder les champs hors formulaire
      // (ingrédients, allergènes, compatibilité…).
      await onSave({
        ...(product ?? {}),
        name: form.name.trim(),
        categoryId: form.categoryId,
        brand: form.brand.trim(),
        sku: form.sku.trim(),
        price: form.price,
        stock: form.stock,
        format: form.format.trim() || 'unité',
        description: form.description.trim(),
        images: form.images,
        isAvailable: form.isAvailable,
        isPopular: form.isPopular,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      size="lg"
      title={mode === 'add' ? 'Ajouter un consommable' : 'Modifier le consommable'}
      subtitle={mode === 'edit' ? product?.name : undefined}
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
          label="Photos du produit"
          value={form.images}
          onChange={images => setForm(f => ({ ...f, images }))}
        />

        <div>
          <label htmlFor="product-name" className={labelClass}>Nom <span className="text-red-500">*</span></label>
          <input id="product-name" type="text" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ex : Café en grains Colombie 907 g" className={inputClass(errors.name)} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-category" className={labelClass}>Catégorie <span className="text-red-500">*</span></label>
            <select id="product-category" value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className={`${inputClass(errors.categoryId)} bg-white cursor-pointer`}>
              {!form.categoryId && <option value="">{categories.length ? 'Choisir…' : 'Chargement…'}</option>}
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
          </div>
          <div>
            <label htmlFor="product-brand" className={labelClass}>Marque</label>
            <input id="product-brand" type="text" value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              placeholder="ex : Craft Roasters" className={inputClass()} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="product-sku" className={labelClass}>Référence (SKU)</label>
            <input id="product-sku" type="text" value={form.sku}
              onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
              className={inputClass()} />
          </div>
          <div>
            <label htmlFor="product-price" className={labelClass}>Prix unitaire (FCFA)</label>
            <input id="product-price" type="number" min={0} value={form.price || ''}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              className={inputClass(errors.price)} />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="product-stock" className={labelClass}>Stock</label>
            <input id="product-stock" type="number" min={0} step={1} value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
              className={inputClass(errors.stock)} />
            {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="product-format" className={labelClass}>Unité de vente</label>
          <input id="product-format" type="text" value={form.format}
            onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
            placeholder="ex : sachet de 907 g" className={inputClass()} />
        </div>

        <div>
          <label htmlFor="product-description" className={labelClass}>Description</label>
          <textarea id="product-description" rows={4} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] resize-y" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <label className="flex items-center gap-2 text-sm text-[#00272B]/70 cursor-pointer">
            <input type="checkbox" checked={form.isAvailable}
              onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))}
              className="w-4 h-4 accent-[#1AAA3F]" />
            Visible au catalogue
          </label>
          <label className="flex items-center gap-2 text-sm text-[#00272B]/70 cursor-pointer">
            <input type="checkbox" checked={form.isPopular}
              onChange={e => setForm(f => ({ ...f, isPopular: e.target.checked }))}
              className="w-4 h-4 accent-[#1AAA3F]" />
            Mettre en avant (« Populaire »)
          </label>
        </div>
      </div>
    </Modal>
  );
}
