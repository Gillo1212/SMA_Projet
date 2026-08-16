import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';
import { machineTypes, paymentMethods, capacityFilters } from '../../mocks/machines';
import { useMachines } from '../../hooks/useMachines';

export default function MachinesPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [search, setSearch] = useState('');

  const { machines, isLoading, error } = useMachines();

  const filteredMachines = machines.filter(machine => {
    const typeMatch = selectedType === 'all' || machine.type === selectedType;
    const paymentMatch = selectedPayment === 'all' || machine.paymentMethods.includes(selectedPayment);
    const searchMatch = !search || machine.name.toLowerCase().includes(search.toLowerCase());
    let capacityMatch = true;
    if (selectedCapacity === 'small') {
      capacityMatch = machine.id.includes('compact') || machine.id.includes('eco');
    } else if (selectedCapacity === 'medium') {
      capacityMatch = machine.id.includes('200') || machine.id.includes('250');
    } else if (selectedCapacity === 'large') {
      capacityMatch = machine.id.includes('300') || machine.id.includes('500');
    }
    return typeMatch && paymentMatch && capacityMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#EEFFF2]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[280px] sm:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=modern%20professional%20vending%20machines%20showroom%2C%20variety%20of%20sleek%20contemporary%20automatic%20distributors%2C%20bright%20clean%20business%20environment%2C%20professional%20display%2C%20Senegal%20corporate%20setting&width=1920&height=800&seq=machines-hero-001&orientation=landscape"
            alt="Nos Machines"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 flex flex-col justify-center items-center text-center">
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-6">
            Nos Distributeurs Automatiques
          </h1>
          <p className="text-sm sm:text-xl text-white/90 max-w-2xl">
            Solutions professionnelles pour tous vos besoins : café, snacks, boissons. Paiement Wave &amp; Orange Money.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-20 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-semibold text-[#00272B] mb-1 sm:mb-2">Recherche</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nom, modèle..."
                className="w-full h-10 sm:h-12 bg-[#EEFFF2] border border-gray-200 rounded-lg px-3 sm:px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-semibold text-[#00272B] mb-1 sm:mb-2">Type de machine</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-10 sm:h-12 bg-[#EEFFF2] border border-gray-200 rounded-lg px-3 sm:px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors cursor-pointer"
              >
                {machineTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-semibold text-[#00272B] mb-1 sm:mb-2">Mode de paiement</label>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="w-full h-10 sm:h-12 bg-[#EEFFF2] border border-gray-200 rounded-lg px-3 sm:px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors cursor-pointer"
              >
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>

            {/* Capacity Filter */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-semibold text-[#00272B] mb-1 sm:mb-2">Capacité</label>
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="w-full h-10 sm:h-12 bg-[#EEFFF2] border border-gray-200 rounded-lg px-3 sm:px-4 text-sm text-[#00272B] focus:outline-none focus:border-[#1AAA3F] transition-colors cursor-pointer"
              >
                {capacityFilters.map(capacity => (
                  <option key={capacity.id} value={capacity.id}>{capacity.name}</option>
                ))}
              </select>
            </div>

            {/* Compare Button */}
            <div className="flex items-end">
              <Link
                to="/machines/comparateur"
                className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 bg-[#00272B] text-white text-sm font-semibold rounded-lg hover:bg-[#00272B]/90 transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-scales-line text-lg mr-2"></i>
                Comparateur
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-16">

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#1AAA3F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-error-warning-line text-4xl text-red-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-[#00272B] mb-3">Erreur de chargement</h3>
            <p className="text-[#00272B]/60 mb-2">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <p className="text-sm text-[#00272B]/60">
                {filteredMachines.length} machine{filteredMachines.length > 1 ? 's' : ''} trouvée{filteredMachines.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {filteredMachines.map(machine => (
                <Link
                  key={machine.id}
                  to={`/machines/${machine.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden bg-gray-50">
                    {machine.image ? (
                      <img
                        src={machine.image}
                        alt={machine.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <i className="ri-store-line text-6xl text-gray-300"></i>
                      </div>
                    )}
                    {machine.badge && (
                      <div className="absolute top-4 right-4 px-4 py-2 bg-[#1AAA3F] text-white text-xs font-bold rounded-full">
                        {machine.badge}
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm text-[#00272B] text-xs font-semibold rounded-full">
                      {machine.stock}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-[#1AAA3F] uppercase tracking-wide">
                        {machine.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#00272B] mb-3 group-hover:text-[#1AAA3F] transition-colors">
                      {machine.name}
                    </h3>

                    <p className="text-sm text-[#00272B]/60 mb-4 line-clamp-2">
                      {machine.shortDescription}
                    </p>

                    {/* Payment Methods */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {machine.paymentMethods.includes('wave') && (
                        <div className="px-3 py-1 bg-[#EEFFF2] rounded-full text-xs font-medium text-[#00272B]">Wave</div>
                      )}
                      {machine.paymentMethods.includes('orange') && (
                        <div className="px-3 py-1 bg-[#EEFFF2] rounded-full text-xs font-medium text-[#00272B]">Orange Money</div>
                      )}
                      {machine.paymentMethods.includes('carte') && (
                        <div className="px-3 py-1 bg-[#EEFFF2] rounded-full text-xs font-medium text-[#00272B]">CB</div>
                      )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-[#00272B]/40 mb-1">À partir de</div>
                        <div className="text-2xl font-bold text-[#00272B]">{machine.priceDisplay}</div>
                      </div>
                      <div className="w-12 h-12 bg-[#1AAA3F] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="ri-arrow-right-line text-xl"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredMachines.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-search-line text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-[#00272B] mb-3">Aucune machine trouvée</h3>
                <p className="text-[#00272B]/60 mb-8">Essayez de modifier vos critères de recherche</p>
                <button
                  onClick={() => { setSelectedType('all'); setSelectedPayment('all'); setSelectedCapacity('all'); setSearch(''); }}
                  className="px-6 py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CTABanner
        badge="Conseil gratuit"
        title="Besoin d'aide pour choisir ?"
        subtitle="Notre équipe d'experts est là pour vous conseiller et vous aider à trouver la machine idéale pour vos besoins."
        buttons={[
          { label: 'Demander un devis', href: '/machines/devis', icon: 'ri-file-list-line', variant: 'white' },
          { label: 'Nous contacter', href: '/contact', icon: 'ri-chat-1-line', variant: 'primary' },
        ]}
      />

      <Footer />
    </div>
  );
}
