import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useMachines } from '../../../hooks/useMachines';
import { LoadingState, ErrorState } from '../../../components/feature/AsyncState';
import type { Machine } from '../../../types/models';

const MAX_COMPARED = 5;

/**
 * Ordre d'affichage des caractéristiques techniques connues ; les autres clés
 * suivent dans leur ordre d'apparition. Les clés françaises sont celles du
 * catalogue réel, les anglaises celles des données de démonstration.
 */
const SPEC_ORDER = [
  'type', 'dimensions', 'poids', 'weight', 'alimentation', 'power', 'consumption',
  'boissons', 'beverages', 'selection', 'selections', 'drinksPerMinute',
  'conteneurs', 'containers', 'reservoir_eau', 'chaudiere', 'alimentation_eau', 'waterConnection',
  'affichage', 'display', 'equipement', 'vitrine', 'ingredients', 'options', 'emballage',
];

interface Criterion {
  key: string;
  label: string;
  format: (m: Machine) => ReactNode;
}

/** Valeur absente : tiret discret, libellé lisible par les lecteurs d'écran */
function Missing({ label }: { label: string }) {
  return (
    <span className="text-[#00272B]/30" title={label}>
      —<span className="sr-only">{label}</span>
    </span>
  );
}

/** Clés renseignées dans au moins une machine, dans l'ordre de `order` puis d'apparition */
function unionKeys(records: Record<string, unknown>[], order: string[] = []): string[] {
  const seen: string[] = [];
  for (const r of records) {
    for (const [k, v] of Object.entries(r)) {
      if (v !== '' && v !== null && v !== undefined && !seen.includes(k)) seen.push(k);
    }
  }
  const rank = (k: string) => {
    const i = order.indexOf(k);
    return i === -1 ? order.length + seen.indexOf(k) : i;
  };
  return [...seen].sort((a, b) => rank(a) - rank(b));
}

/** "reservoir_eau" → "Reservoir eau", "drinksPerMinute" → "Drinks per minute" */
function humanize(key: string): string {
  const words = key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function ComparateurPage() {
  const { t } = useTranslation();
  const { machines, isLoading, error, refetch } = useMachines();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSelector, setShowSelector] = useState(false);

  // La sélection vit dans l'URL (?machines=slug1,slug2) : le bouton « Ajouter
  // au comparateur » de la fiche machine pré-remplit la page, et le lien se partage.
  // Un slug inconnu (machine retirée, lien modifié) est ignoré et ne compte pas dans la limite
  const selectedSlugs = [...new Set((searchParams.get('machines') ?? '').split(','))]
    .filter(slug => machines.some(m => m.slug === slug))
    .slice(0, MAX_COMPARED);

  const setSelection = (slugs: string[]) => {
    const next = new URLSearchParams(searchParams);
    if (slugs.length) next.set('machines', slugs.join(','));
    else next.delete('machines');
    setSearchParams(next, { replace: true });
  };

  const addMachine = (slug: string) => {
    if (selectedSlugs.length < MAX_COMPARED && !selectedSlugs.includes(slug)) {
      setSelection([...selectedSlugs, slug]);
    }
  };

  const removeMachine = (slug: string) => {
    setSelection(selectedSlugs.filter(s => s !== slug));
  };

  // Dans l'ordre de sélection
  const comparedMachines = selectedSlugs
    .map(slug => machines.find(m => m.slug === slug))
    .filter((m): m is Machine => Boolean(m));
  const availableMachines = machines.filter(m => !selectedSlugs.includes(m.slug));

  const notProvided = t('compare.notProvided');
  const text = (value: unknown): ReactNode =>
    value === undefined || value === null || value === '' ? <Missing label={notProvided} /> : String(value);

  const generalCriteria: Criterion[] = [
    { key: 'price', label: t('compare.price'), format: m => m.priceDisplay },
    { key: 'category', label: t('compare.category'), format: m => text(m.category) },
    { key: 'brand', label: t('compare.brand'), format: m => text(m.brand) },
    { key: 'model', label: t('compare.model'), format: m => text(m.modelRef) },
    { key: 'payment', label: t('compare.payments'), format: m => (
      <div className="flex flex-wrap gap-2 justify-center">
        {m.paymentMethods.includes('wave') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">Wave</span>}
        {m.paymentMethods.includes('orange') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">Orange</span>}
        {m.paymentMethods.includes('carte') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">{t('compare.cardShort')}</span>}
        {m.paymentMethods.includes('especes') && <span className="px-2 py-1 bg-[#F6F3EC] rounded text-xs">{t('machineDetail.payment.especes')}</span>}
      </div>
    )},
    { key: 'delivery', label: t('compare.deliveryTime'), format: m => text(m.deliveryTime) },
    { key: 'stock', label: t('compare.availability'), format: m => m.stock },
  ];

  // Lignes techniques construites à partir des données réellement présentes
  const specKeys = unionKeys(comparedMachines.map(m => m.specifications), SPEC_ORDER);
  const capacityKeys = unionKeys(comparedMachines.map(m => m.capacity));
  const technicalCriteria: Criterion[] = [
    ...specKeys.map(key => ({
      key: `spec-${key}`,
      label: t(`machineDetail.specs.${key}`, humanize(key)),
      format: (m: Machine) => text(m.specifications[key]),
    })),
    ...capacityKeys.map(key => ({
      key: `capacity-${key}`,
      label: t(`machineDetail.capacity.${key}`, humanize(key)),
      format: (m: Machine) => text(m.capacity[key]),
    })),
    // Seulement si la donnée existe pour au moins une machine
    ...(comparedMachines.some(m => m.maintenanceIncluded !== undefined)
      ? [{
          key: 'maintenance',
          label: t('compare.maintenanceIncluded'),
          format: (m: Machine) => m.maintenanceIncluded === undefined
            ? <Missing label={notProvided} />
            : m.maintenanceIncluded
              ? <i className="ri-check-line text-2xl text-[#1AAA3F]" aria-label="✓"></i>
              : <i className="ri-close-line text-2xl text-red-500" aria-label="✗"></i>,
        }]
      : []),
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
          {selectedSlugs.length < MAX_COMPARED && (
            <div className="mb-8">
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="px-6 py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line text-xl"></i>
                {t('compare.addMachine', { count: selectedSlugs.length, max: MAX_COMPARED })}
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
                      addMachine(machine.slug);
                      setShowSelector(false);
                    }}
                    className="flex items-center gap-4 p-4 bg-[#F6F3EC] rounded-lg hover:bg-[#1AAA3F]/10 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={machine.image}
                        alt={machine.name}
                        className="w-full h-full object-contain"
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
                      <th className="p-4 sm:p-6 text-left text-sm font-semibold text-[#00272B] bg-white sticky left-0 z-10">
                        {t('compare.criteria')}
                      </th>
                      {comparedMachines.map(machine => (
                        <th key={machine.id} className="p-4 sm:p-6 min-w-[200px] sm:min-w-[280px]">
                          <div className="text-center">
                            <div className="relative w-full h-36 sm:h-48 bg-gray-50 rounded-lg overflow-hidden mb-4">
                              <img 
                                src={machine.image}
                                alt={machine.name}
                                className="w-full h-full object-contain p-2"
                              />
                              <button
                                onClick={() => removeMachine(machine.slug)}
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
                    {generalCriteria.map((criterion, index) => (
                      <CriterionRow key={criterion.key} criterion={criterion} machines={comparedMachines} striped={index % 2 === 1} />
                    ))}
                    <tr className="bg-[#00272B]">
                      <th
                        scope="rowgroup"
                        colSpan={comparedMachines.length + 1}
                        className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white"
                      >
                        {/* Reste visible quand le tableau défile à l'horizontale (mobile) */}
                        <span className="sticky left-4 sm:left-6">{t('compare.techSection')}</span>
                      </th>
                    </tr>
                    {technicalCriteria.length === 0 ? (
                      <tr>
                        <td colSpan={comparedMachines.length + 1} className="p-6 text-sm text-[#00272B]/60 text-center">
                          {t('compare.noSpecs')}
                        </td>
                      </tr>
                    ) : technicalCriteria.map((criterion, index) => (
                      <CriterionRow key={criterion.key} criterion={criterion} machines={comparedMachines} striped={index % 2 === 1} />
                    ))}
                    <tr className="border-t-2 border-gray-200">
                      <td className="p-4 sm:p-6 sticky left-0 z-10 bg-white"></td>
                      {comparedMachines.map(machine => (
                        <td key={machine.id} className="p-4 sm:p-6">
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

function CriterionRow({ criterion, machines, striped }: { criterion: Criterion; machines: Machine[]; striped: boolean }) {
  // Fond opaque sur la colonne collante : le texte ne transparaît pas au défilement horizontal
  const bg = striped ? 'bg-[#FBFAF6]' : 'bg-white';
  return (
    <tr className={bg}>
      <th scope="row" className={`p-4 sm:p-6 text-left text-sm font-semibold text-[#00272B] sticky left-0 z-10 ${bg}`}>
        {criterion.label}
      </th>
      {machines.map(machine => (
        <td key={machine.id} className="p-4 sm:p-6 text-sm text-[#00272B] text-center">
          {criterion.format(machine)}
        </td>
      ))}
    </tr>
  );
}
