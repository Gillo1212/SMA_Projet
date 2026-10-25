import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useMachines } from '../../../hooks/useMachines';
import { LoadingState, ErrorState } from '../../../components/feature/AsyncState';
import type { Machine } from '../../../types/models';

const MAX_COMPARED = 5;

export default function ComparateurPage() {
  const { t } = useTranslation();
  const { machines, isLoading, error, refetch } = useMachines();
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const addMachine = (machineId: string) => {
    if (selectedMachines.length < MAX_COMPARED && !selectedMachines.includes(machineId)) {
      setSelectedMachines([...selectedMachines, machineId]);
    }
  };

  const removeMachine = (machineId: string) => {
    setSelectedMachines(selectedMachines.filter(id => id !== machineId));
  };

  const comparedMachines = machines.filter(m => selectedMachines.includes(m.id));
  const availableMachines = machines.filter(m => !selectedMachines.includes(m.id));

  const comparisonCriteria = [
    { key: 'price', label: t('compare.price'), format: (m: Machine) => m.priceDisplay },
    { key: 'type', label: t('compare.type'), format: (m: Machine) => m.category },
    { key: 'capacity', label: t('compare.totalCapacity'), format: (m: Machine) => {
      const cap = m.capacity;
      if ('cups' in cap) return t('compare.cups', { count: Number(cap.cups) });
      if ('totalProducts' in cap) return cap.totalProducts;
      if ('total' in cap) return cap.total;
      return t('compare.notAvailable');
    }},
    { key: 'dimensions', label: t('compare.dimensions'), format: (m: Machine) => m.specifications.dimensions },
    { key: 'power', label: t('compare.power'), format: (m: Machine) => m.specifications.power },
    { key: 'drinksPerMinute', label: t('compare.throughput'), format: (m: Machine) => m.specifications.drinksPerMinute || t('compare.notAvailable') },
    { key: 'weight', label: t('compare.weight'), format: (m: Machine) => m.specifications.weight },
    { key: 'payment', label: t('compare.payments'), format: (m: Machine) => (
      <div className="flex flex-wrap gap-2 justify-center">
        {m.paymentMethods.includes('wave') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">Wave</span>}
        {m.paymentMethods.includes('orange') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">Orange</span>}
        {m.paymentMethods.includes('carte') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">{t('compare.cardShort')}</span>}
        {m.paymentMethods.includes('especes') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">{t('machineDetail.payment.especes')}</span>}
      </div>
    )},
    { key: 'maintenance', label: t('compare.maintenanceIncluded'), format: (m: Machine) => (
      m.maintenanceIncluded ? 
      <i className="ri-check-line text-2xl text-[#1AAA3F]"></i> : 
      <i className="ri-close-line text-2xl text-red-500"></i>
    )},
    { key: 'delivery', label: t('compare.deliveryTime'), format: (m: Machine) => m.deliveryTime },
    { key: 'stock', label: t('compare.availability'), format: (m: Machine) => m.stock }
  ];

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-[#F6F3EC]">
        <Navbar />
        <div className="pt-32 pb-20">
          {isLoading
            ? <LoadingState label={t('compare.loading')} />
            : <ErrorState message={error!} onRetry={refetch} />}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC]">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="mb-12">
            <Link to="/machines" className="inline-flex items-center gap-2 text-sm text-[#00272B]/60 hover:text-[#1AAA3F] transition-colors mb-6">
              <i className="ri-arrow-left-line"></i>
              {t('machineDetail.backToCatalogue')}
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-[#00272B] mb-4">
              {t('compare.title')}
            </h1>
            <p className="text-lg text-[#00272B]/70">
              {t('compare.subtitle')}
            </p>
          </div>

          {/* Add Machine Button */}
          {selectedMachines.length < MAX_COMPARED && (
            <div className="mb-8">
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="px-6 py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line text-xl"></i>
                {t('compare.addMachine', { count: selectedMachines.length, max: MAX_COMPARED })}
              </button>
            </div>
          )}

          {/* Machine Selector */}
          {showSelector && (
            <div className="mb-8 bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#00272B]">{t('compare.selectMachine')}</h3>
                <button 
                  onClick={() => setShowSelector(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#00272B]/40 hover:text-[#00272B] transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {availableMachines.map(machine => (
                  <button
                    key={machine.id}
                    onClick={() => {
                      addMachine(machine.id);
                      setShowSelector(false);
                    }}
                    className="flex items-center gap-4 p-4 bg-[#F6F3EC] rounded-lg hover:bg-[#1AAA3F]/10 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={machine.image}
                        alt={machine.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#00272B] truncate">{machine.name}</h4>
                      <p className="text-xs text-[#00272B]/60">{machine.priceDisplay}</p>
                    </div>
                    <i className="ri-add-circle-line text-2xl text-[#1AAA3F]"></i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {comparedMachines.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="w-20 h-20 bg-[#F6F3EC] rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-scales-line text-4xl text-[#1AAA3F]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[#00272B] mb-3">{t('compare.emptyTitle')}</h3>
              <p className="text-[#00272B]/60 mb-8">{t('compare.emptyHint')}</p>
              <button
                onClick={() => setShowSelector(true)}
                className="px-8 py-4 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('compare.selectMachines')}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="p-6 text-left text-sm font-semibold text-[#00272B] bg-[#F6F3EC] sticky left-0 z-10">
                        {t('compare.criteria')}
                      </th>
                      {comparedMachines.map(machine => (
                        <th key={machine.id} className="p-6 min-w-[280px]">
                          <div className="text-center">
                            <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden mb-4">
                              <img 
                                src={machine.image}
                                alt={machine.name}
                                className="w-full h-full object-cover object-center"
                              />
                              <button
                                onClick={() => removeMachine(machine.id)}
                                aria-label={t('compare.remove')}
                                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <i className="ri-close-line text-red-500"></i>
                              </button>
                            </div>
                            <h3 className="text-base font-bold text-[#00272B] mb-2">{machine.name}</h3>
                            <Link 
                              to={`/machines/${machine.slug}`}
                              className="text-xs text-[#1AAA3F] hover:underline"
                            >
                              {t('compare.seeDetails')}
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonCriteria.map((criterion, index) => (
                      <tr key={criterion.key} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F6F3EC]/30'}>
                        <td className="p-6 text-sm font-semibold text-[#00272B] sticky left-0 z-10 bg-inherit">
                          {criterion.label}
                        </td>
                        {comparedMachines.map(machine => (
                          <td key={machine.id} className="p-6 text-sm text-[#00272B] text-center">
                            {typeof criterion.format(machine) === 'string' ? 
                              criterion.format(machine) : 
                              criterion.format(machine)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200">
                      <td className="p-6 sticky left-0 z-10 bg-white"></td>
                      {comparedMachines.map(machine => (
                        <td key={machine.id} className="p-6">
                          <Link
                            to={`/machines/devis?machine=${machine.slug}`}
                            className="block w-full px-6 py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors text-center cursor-pointer whitespace-nowrap"
                          >
                            {t('compare.requestQuote')}
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}