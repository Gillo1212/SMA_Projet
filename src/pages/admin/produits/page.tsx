import { useState } from 'react';
import { products } from '../../../mocks/products';

const CATEGORIES = ['Tous', 'Café & Poudres', 'Snacks', 'Boissons'];

export default function AdminProduitsPage() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Tous');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Tous' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total produits', value: products.length, icon: 'ri-archive-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: 'Café & Poudres', value: products.filter(p => p.category === 'Café & Poudres').length, icon: 'ri-cup-line', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Snacks', value: products.filter(p => p.category === 'Snacks').length, icon: 'ri-store-line', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Boissons', value: products.filter(p => p.category === 'Boissons').length, icon: 'ri-goblet-line', color: 'text-sky-600', bg: 'bg-sky-50' },
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
                placeholder="Rechercher produit, SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-56 h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                    filterCat === cat ? 'bg-[#1AAA3F] text-white' : 'text-[#00272B]/50 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button className="px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] cursor-pointer flex items-center gap-2 whitespace-nowrap">
            <i className="ri-add-line"></i>
            Ajouter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50/60">
              <tr>
                {['Produit', 'SKU', 'Catégorie', 'Marque', 'Prix unit.', 'Stock', 'Statut', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#00272B]">{prod.name}</p>
                        {prod.isNew && <span className="text-xs text-[#1AAA3F] font-medium">Nouveau</span>}
                        {prod.isPopular && <span className="text-xs text-amber-600 font-medium">Populaire</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[#00272B]/60">{prod.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 bg-gray-100 text-[#00272B]/60 rounded-full">{prod.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#00272B]/70">{prod.brand}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#00272B]">{prod.price.toLocaleString('fr-FR')} F</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-semibold ${prod.stock < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{prod.stock}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prod.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {prod.isAvailable ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40 hover:text-[#00272B]">
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer text-[#00272B]/40 hover:text-red-500">
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
