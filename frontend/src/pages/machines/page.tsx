import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';
import PageHero from '../../components/feature/PageHero';
import { useMachines } from '../../hooks/useMachines';

export default function MachinesPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [search, setSearch] = useState('');

  const { machines, isLoading, error } = useMachines();

  // Les identifiants correspondent à Machine['type'] (voir machines.service)
  const machineTypes = [
    { id: 'all', name: t('machines.typeAll') },
    { id: 'cafe', name: t('machines.typeCafe') },
    { id: 'snacks', name: t('machines.typeSnacks') },
  ];
  const paymentMethods = [
    { id: 'all', name: t('machines.paymentAll') },
    { id: 'wave', name: 'Wave' },
    { id: 'orange', name: 'Orange Money' },
    { id: 'carte', name: t('machines.paymentCard') },
    { id: 'especes', name: t('machines.paymentCash') },
  ];

  const filteredMachines = machines.filter(machine => {
    const typeMatch = selectedType === 'all' || machine.type === selectedType;
    const paymentMatch = selectedPayment === 'all' || machine.paymentMethods.includes(selectedPayment);
    const searchMatch = !search || machine.name.toLowerCase().includes(search.toLowerCase());
    return typeMatch && paymentMatch && searchMatch;
  });

  const resetFilters = () => { setSelectedType('all'); setSelectedPayment('all'); setSearch(''); };

  const fieldClass = 'w-full h-11 bg-white border border-[#00272B]/15 rounded-md px-3 text-sm text-[#00272B] focus:outline-none focus:border-[#0D8C2E] transition-colors';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageHero
        eyebrow={t('machines.heroEyebrow')}
        title={t('machines.heroTitle')}
        titleAccent={t('machines.heroAccent')}
        subtitle={t('machines.heroSubtitle')}
      />

      {/* Filtres */}
      <div className="sticky top-20 z-40 bg-white border-b border-[#00272B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <label className="lg:col-span-4 block">
              <span className="eyebrow block text-[#00272B]/50 mb-1.5">{t('machines.search')}</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('machines.searchPlaceholder')}
                className={fieldClass}
              />
            </label>
            <label className="lg:col-span-3 block">
              <span className="eyebrow block text-[#00272B]/50 mb-1.5">{t('machines.machineType')}</span>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                {machineTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </label>
            <label className="lg:col-span-3 block">
              <span className="eyebrow block text-[#00272B]/50 mb-1.5">{t('machines.paymentMode')}</span>
              <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                {paymentMethods.map(method => <option key={method.id} value={method.id}>{method.name}</option>)}
              </select>
            </label>
            <Link
              to="/machines/comparateur"
              className="lg:col-span-2 h-11 px-5 border border-[#00272B] text-[#00272B] text-sm font-semibold rounded-md hover:bg-[#00272B] hover:text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <i className="ri-scales-line"></i>
              {t('machines.compare')}
            </Link>
          </div>
        </div>
      </div>

      {/* Grille */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#0D8C2E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-20">
            <h3 className="text-2xl text-[#00272B] mb-3">{t('machines.loadError')}</h3>
            <p className="text-[#00272B]/60">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <p className="text-sm text-[#00272B]/60 mb-8">{t('machines.count', { count: filteredMachines.length })}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.map(machine => (
                <Link
                  key={machine.id}
                  to={`/machines/${machine.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-[#00272B]/10 overflow-hidden hover:border-[#00272B]/25 hover:shadow-[0_20px_40px_-24px_rgba(0,39,43,0.35)] transition-all"
                >
                  <div className="relative h-80 bg-white flex items-center justify-center p-6">
                    {machine.image ? (
                      <img
                        src={machine.image}
                        alt={machine.name}
                        className="max-h-full w-auto object-contain group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <i className="ri-store-line text-6xl text-[#00272B]/15"></i>
                    )}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-[#F6F3EC] text-[#00272B] text-xs font-semibold rounded-full">
                      {machine.stock}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-6 border-t border-[#00272B]/8">
                    <p className="eyebrow text-[#0D8C2E] mb-3">{machine.category}</p>
                    <h3 className="text-2xl text-[#00272B] mb-3">{machine.name}</h3>
                    <p className="text-sm text-[#00272B]/60 leading-relaxed mb-5 line-clamp-2">{machine.shortDescription}</p>

                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      {machine.paymentMethods.includes('wave') && (
                        <span className="px-2.5 py-1 border border-[#00272B]/10 rounded-full text-xs text-[#00272B]/70">Wave</span>
                      )}
                      {machine.paymentMethods.includes('orange') && (
                        <span className="px-2.5 py-1 border border-[#00272B]/10 rounded-full text-xs text-[#00272B]/70">Orange Money</span>
                      )}
                      {machine.paymentMethods.includes('carte') && (
                        <span className="px-2.5 py-1 border border-[#00272B]/10 rounded-full text-xs text-[#00272B]/70">{t('machines.paymentCard')}</span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#00272B]/8">
                      <div>
                        <p className="text-xs text-[#00272B]/50">{machine.price > 0 ? t('common.from') : t('common.price')}</p>
                        <p className="font-semibold text-[#00272B]">
                          {machine.price > 0 ? machine.priceDisplay : t('common.onQuote')}
                        </p>
                      </div>
                      <span className="w-10 h-10 rounded-full border border-[#00272B]/15 flex items-center justify-center text-[#00272B] group-hover:bg-[#00272B] group-hover:text-white transition-colors">
                        <i className="ri-arrow-right-up-line"></i>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredMachines.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl text-[#00272B] mb-3">{t('machines.empty')}</h3>
                <p className="text-[#00272B]/60 mb-8">{t('machines.emptyHint')}</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-[#00272B] text-white text-sm font-semibold rounded-md hover:bg-[#0D8C2E] transition-colors"
                >
                  {t('machines.reset')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CTABanner
        badge={t('machines.ctaBadge')}
        title={t('machines.ctaTitle')}
        subtitle={t('machines.ctaSubtitle')}
        buttons={[
          { label: t('nav.quote'), href: '/machines/devis', icon: 'ri-file-list-3-line', variant: 'white' },
          { label: t('nav.contact'), href: '/contact', icon: 'ri-chat-1-line', variant: 'primary' },
        ]}
      />

      <Footer />
    </div>
  );
}
