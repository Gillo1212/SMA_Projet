import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import PageHero from '../../components/feature/PageHero';
import { useProducts } from '../../hooks/useProducts';
import { LoadingState, ErrorState } from '../../components/feature/AsyncState';

type SortOption = 'price-asc' | 'price-desc' | 'popularity' | 'newest';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { products, isLoading, error, refetch } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedTastes, setSelectedTastes] = useState<string[]>([]);
  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique values for filters
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = Array.from(new Set(products.map(p => p.brand)));
  const formats = Array.from(new Set(products.map(p => p.format)));
  const tastes = Array.from(new Set(products.filter(p => p.taste).map(p => p.taste!)));
  const machines = Array.from(new Set(products.flatMap(p => p.compatibility)));

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Format filter
      if (selectedFormats.length > 0 && !selectedFormats.includes(product.format)) {
        return false;
      }

      // Taste filter
      if (selectedTastes.length > 0 && (!product.taste || !selectedTastes.includes(product.taste))) {
        return false;
      }

      // Compatibility filter
      if (selectedCompatibility.length > 0 && 
          !selectedCompatibility.some(machine => product.compatibility.includes(machine))) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && !product.isAvailable) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popularity':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedBrands, selectedFormats, selectedTastes,
      selectedCompatibility, onlyAvailable, sortBy]);

  const toggleFilter = (value: string, currentFilters: string[], setFilters: (filters: string[]) => void) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter(f => f !== value));
    } else {
      setFilters([...currentFilters, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedFormats([]);
    setSelectedTastes([]);
    setSelectedCompatibility([]);
    setOnlyAvailable(false);
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    selectedFormats.length +
    selectedTastes.length +
    selectedCompatibility.length +
    (onlyAvailable ? 1 : 0);

  // Navbar et Footer restent affichés : seule la zone catalogue change d'état
  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20">
          {isLoading
            ? <LoadingState label={t('common.loading')} />
            : <ErrorState message={error!} onRetry={refetch} />}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageHero
        eyebrow={t('products.eyebrow')}
        title={t('products.title')}
        titleAccent={t('products.titleAccent')}
        subtitle={t('products.subtitle')}
      >
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-md bg-white text-[#00272B] placeholder-[#00272B]/40 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4FD07A]"
          />
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#00272B]/40"></i>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Effacer"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#00272B]/5 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl text-[#00272B]/50"></i>
            </button>
          )}
        </div>
      </PageHero>

      {/* Main Content */}
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Mobile filter button */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <p className="text-sm text-gray-600">
              {t('products.count', { count: filteredProducts.length })}
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F6F3EC] border border-[#1AAA3F]/30 rounded-lg text-sm font-semibold text-[#00272B] cursor-pointer"
            >
              <i className="ri-filter-line text-[#1AAA3F]"></i>
              {t('products.filters')}
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-[#1AAA3F] text-white text-xs rounded-full flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Mobile Filter Drawer Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
              <div className="absolute left-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#00272B]">{t('products.filters')}</h3>
                  <button onClick={() => setShowFilters(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                    <i className="ri-close-line text-xl text-gray-600"></i>
                  </button>
                </div>
                <div className="p-4">
                  <div className="bg-[#F6F3EC] rounded-2xl p-6">
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAllFilters} className="text-sm text-[#1AAA3F] hover:underline cursor-pointer mb-4 block">
                        {t('products.clearAll')}
                      </button>
                    )}
                    <div className="space-y-8">
                      {/* Category Filter */}
                      <div>
                        <h4 className="text-sm font-semibold text-[#00272B] mb-4">{t('products.categories')}</h4>
                        <div className="space-y-2">
                          {categories.map(cat => (
                            <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                              <input type="radio" name="category-mobile" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 focus:ring-[#1AAA3F] cursor-pointer" />
                              <span className="text-sm text-gray-700">{cat === 'all' ? 'Toutes les catégories' : cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#00272B] mb-4">{t('products.brands')}</h4>
                        <div className="space-y-2">
                          {brands.map(brand => (
                            <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                              <span className="text-sm text-gray-700">{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                          <span className="text-sm font-semibold text-[#00272B]">{t('products.inStockOnly')}</span>
                        </label>
                      </div>
                    </div>
                    <button onClick={() => setShowFilters(false)} className="w-full mt-6 py-3 bg-[#1AAA3F] text-white font-semibold rounded-lg cursor-pointer">
                      {t('products.showResults')} ({filteredProducts.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-8 lg:gap-12">
            {/* Filters Sidebar - Desktop only */}
            <aside className="w-80 flex-shrink-0 sticky top-32 self-start hidden lg:block">
              <div className="bg-[#F6F3EC] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#00272B]">{t('products.filters')}</h3>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearAllFilters} className="text-sm text-[#1AAA3F] hover:underline cursor-pointer whitespace-nowrap">
                      {t('products.clearAll')}
                    </button>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#00272B] mb-4">{t('products.categories')}</h4>
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 focus:ring-[#1AAA3F] cursor-pointer" />
                          <span className="text-sm text-gray-700 group-hover:text-[#1AAA3F] transition-colors">{cat === 'all' ? 'Toutes les catégories' : cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#00272B] mb-4">{t('products.brands')}</h4>
                    <div className="space-y-2">
                      {brands.map(brand => (
                        <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                          <span className="text-sm text-gray-700 group-hover:text-[#1AAA3F] transition-colors">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Format Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#00272B] mb-4">{t('products.format')}</h4>
                    <div className="space-y-2">
                      {formats.slice(0, 5).map(format => (
                        <label key={format} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={selectedFormats.includes(format)} onChange={() => toggleFilter(format, selectedFormats, setSelectedFormats)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                          <span className="text-sm text-gray-700 group-hover:text-[#1AAA3F] transition-colors">{format}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Taste Filter */}
                  {tastes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#00272B] mb-4">Goût</h4>
                      <div className="space-y-2">
                        {tastes.map(taste => (
                          <label key={taste} className="flex items-center space-x-3 cursor-pointer group">
                            <input type="checkbox" checked={selectedTastes.includes(taste)} onChange={() => toggleFilter(taste, selectedTastes, setSelectedTastes)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                            <span className="text-sm text-gray-700 group-hover:text-[#1AAA3F] transition-colors">{taste}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compatibility Filter */}
                  {machines.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#00272B] mb-4">{t('products.compatibility')}</h4>
                    <div className="space-y-2">
                      {machines.map(machine => (
                        <label key={machine} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={selectedCompatibility.includes(machine)} onChange={() => toggleFilter(machine, selectedCompatibility, setSelectedCompatibility)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                          <span className="text-sm text-gray-700 group-hover:text-[#1AAA3F] transition-colors">{machine}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Availability Filter */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="w-5 h-5 text-[#1AAA3F] border-gray-300 rounded focus:ring-[#1AAA3F] cursor-pointer" />
                      <span className="text-sm font-semibold text-[#00272B] group-hover:text-[#1AAA3F] transition-colors">{t('products.inStockOnly')}</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <p className="text-sm sm:text-base text-gray-600 hidden lg:block">
                  {t('products.countFound', { count: filteredProducts.length })}
                </p>

                <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-start">
                  <span className="text-sm text-gray-600">{t('products.sortBy')}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-11 px-4 pr-10 rounded-lg border border-gray-200 focus:border-[#1AAA3F] focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="popularity">{t('products.sortPopularity')}</option>
                    <option value="newest">{t('products.sortNewest')}</option>
                    <option value="price-asc">{t('products.sortPriceAsc')}</option>
                    <option value="price-desc">{t('products.sortPriceDesc')}</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {filteredProducts.map(product => (
                    <Link
                      key={product.id}
                      to={`/produits/${product.id}`}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#1AAA3F] hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-square bg-white overflow-hidden">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain object-center p-6 group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><i className="ri-image-line text-6xl text-gray-300"></i></div>
                        )}
                        {product.isNew && <div className="absolute top-4 left-4 px-3 py-1 bg-[#F6F3EC] text-[#00272B] text-xs font-semibold rounded-full">{t('products.badgeNew')}</div>}
                        {product.isPopular && <div className="absolute top-4 right-4 px-3 py-1 bg-[#00272B] text-white text-xs font-semibold rounded-full">{t('products.badgePopular')}</div>}
                        {!product.isAvailable && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-500">{t('products.outOfStock')}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-6">
                        <p className="text-xs text-[#1AAA3F] font-semibold mb-2">{product.brand}</p>
                        <h3 className="text-sm sm:text-base font-bold text-[#00272B] mb-2 group-hover:text-[#1AAA3F] transition-colors">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">{product.format}</p>

                        <div className="flex items-center justify-between">
                          <p className="text-lg sm:text-2xl font-bold text-[#00272B]">
                            {product.price.toLocaleString('fr-FR')} <span className="text-xs sm:text-base">FCFA</span>
                          </p>
                          <div className="w-10 h-10 border border-[#00272B]/15 rounded-full flex items-center justify-center group-hover:bg-[#00272B] transition-colors">
                            <i className="ri-arrow-right-up-line text-[#00272B] group-hover:text-white transition-colors"></i>
                          </div>
                        </div>

                        {product.volumeDiscounts.length > 0 && (
                          <p className="text-xs text-[#1AAA3F] mt-3">
                            -{product.volumeDiscounts[0].discount}% dès {product.volumeDiscounts[0].quantity} unités
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <i className="ri-search-line text-6xl text-gray-300 mb-6"></i>
                  <h3 className="text-2xl font-bold text-[#00272B] mb-3">{t('products.empty')}</h3>
                  <p className="text-gray-600 mb-8">{t('products.emptyHint')}</p>
                  <button onClick={clearAllFilters} className="px-8 py-3 bg-[#1AAA3F] text-white font-semibold rounded-lg hover:bg-[#158f35] transition-colors cursor-pointer whitespace-nowrap">
                    {t('products.resetFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}