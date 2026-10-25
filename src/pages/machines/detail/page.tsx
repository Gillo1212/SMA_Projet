import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { useMachine, useMachines } from '../../../hooks/useMachines';
import { LoadingState } from '../../../components/feature/AsyncState';

export default function MachineDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { machine, isLoading } = useMachine(slug ?? '');
  // Sert à proposer des modèles du même type en bas de page
  const { machines } = useMachines();
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20">
          <LoadingState label={t('common.loading')} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#00272B] mb-4">{t('machineDetail.notFound')}</h2>
          <Link to="/machines" className="text-[#1AAA3F] hover:underline">
            {t('machineDetail.backToCatalogue')}
          </Link>
        </div>
      </div>
    );
  }

  const similarMachines = machines.filter(m => m.type === machine.type && m.id !== machine.id).slice(0, 3);
  const capacityEntries = Object.entries(machine.capacity);
  const specEntries = Object.entries(machine.specifications);
  const hasPrice = machine.price > 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#00272B]/60 mb-8">
            <Link to="/" className="hover:text-[#1AAA3F] transition-colors">{t('nav.home')}</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/machines" className="hover:text-[#1AAA3F] transition-colors">{t('nav.machines')}</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-[#00272B]">{machine.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative h-[520px] sm:h-[600px] bg-white border border-[#00272B]/10 rounded-2xl overflow-hidden mb-4 p-6">
                <img 
                  src={machine.gallery[selectedImage]}
                  alt={machine.name}
                  className="w-full h-full object-contain object-center"
                />
                {machine.badge && (
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#00272B] text-white text-xs font-semibold rounded-full">
                    {machine.badge}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                {machine.gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 bg-white rounded-lg overflow-hidden cursor-pointer transition-all border ${selectedImage === index ? 'border-[#00272B] ring-1 ring-[#00272B]' : 'border-[#00272B]/10 hover:border-[#00272B]/40'}`}
                  >
                    <img 
                      src={img}
                      alt={`${machine.name} ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="eyebrow text-[#0D8C2E] mb-4">{machine.category}</p>

              <h1 className="text-4xl lg:text-5xl font-bold text-[#00272B] mb-6">
                {machine.name}
              </h1>

              <p className="text-lg text-[#00272B]/70 mb-8 leading-relaxed">
                {machine.description}
              </p>

              {/* Price */}
              <div className="border border-[#00272B]/10 rounded-2xl p-6 mb-6">
                <div className="text-sm text-[#00272B]/60 mb-2">{hasPrice ? t('machineDetail.priceFrom') : t('common.price')}</div>
                <div className="font-serif text-4xl text-[#00272B] mb-4">{hasPrice ? machine.priceDisplay : t('common.onQuote')}</div>
                <div className="flex items-center gap-3 text-sm text-[#00272B]/60">
                  <div className="flex items-center gap-2">
                    <i className="ri-truck-line text-[#0D8C2E]"></i>
                    <span>{t('home.machines.delivery')}: {machine.deliveryTime}</span>
                  </div>
                  <div className="w-1 h-1 bg-[#00272B]/20 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <i className="ri-shield-check-line text-[#0D8C2E]"></i>
                    <span>{machine.stock}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border border-[#00272B]/10 rounded-2xl p-6 mb-8">
                <p className="eyebrow text-[#00272B]/50 mb-4">{t('machineDetail.paymentModes')}</p>
                <div className="flex flex-wrap gap-3">
                  {machine.paymentMethods.includes('wave') && (
                    <div className="flex items-center gap-2 px-4 py-2 border border-[#00272B]/10 rounded-md">
                      <div className="h-7 w-14 flex items-center justify-center">
                        <img
                          src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/768bed2b-5283-47bc-b9e6-f4dae5cf304f_Wave.png?v=c76ba778473ee3601f42a6ffe67df37c"
                          alt="Wave"
                          className="h-7 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {machine.paymentMethods.includes('orange') && (
                    <div className="flex items-center gap-2 px-4 py-2 border border-[#00272B]/10 rounded-md">
                      <div className="h-7 w-14 flex items-center justify-center">
                        <img
                          src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/7601a307-e87f-40c7-84ba-40ace6edbf5e_Orange-money.png?v=e2d6d95468557e3a937a2d097b94b09e"
                          alt="Orange Money"
                          className="h-7 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {machine.paymentMethods.includes('carte') && (
                    <div className="flex items-center gap-2 px-4 py-2 border border-[#00272B]/10 rounded-md">
                      <i className="ri-bank-card-line text-[#1AAA3F]"></i>
                      <span className="text-sm font-medium text-[#00272B]">{t('machineDetail.payment.carte')}</span>
                    </div>
                  )}
                  {machine.paymentMethods.includes('especes') && (
                    <div className="flex items-center gap-2 px-4 py-2 border border-[#00272B]/10 rounded-md">
                      <i className="ri-money-dollar-circle-line text-[#1AAA3F]"></i>
                      <span className="text-sm font-medium text-[#00272B]">{t('machineDetail.payment.especes')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-4">
                <Link 
                  to={`/machines/devis?machine=${machine.slug}`}
                  className="w-full h-14 bg-[#00272B] text-white text-sm font-semibold rounded-md hover:bg-[#0D8C2E] transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-file-list-line text-lg"></i>
                  Demander un devis gratuit
                </Link>
                <Link 
                  to="/machines/comparateur"
                  className="w-full h-14 border border-[#00272B]/20 text-[#00272B] text-sm font-semibold rounded-md hover:border-[#00272B] transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-scales-line text-lg"></i>
                  Ajouter au comparateur
                </Link>
              </div>

              {/* Ideal For */}
              {machine.idealFor.length > 0 && (
                <div className="mt-8 p-6 border border-[#00272B]/10 rounded-2xl">
                  <p className="eyebrow text-[#00272B]/50 mb-4">{t('machineDetail.idealFor')}</p>
                  <div className="flex flex-wrap gap-2">
                    {machine.idealFor.map((use, index) => (
                      <span key={index} className="px-3 py-1.5 border border-[#00272B]/10 text-xs text-[#00272B]/80 rounded-full">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#00272B] mb-8">{t('machineDetail.specsTitle')}</h2>
            
            <div className={`grid gap-8 ${capacityEntries.length > 0 ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
              {/* Capacity */}
              {capacityEntries.length > 0 && (
              <div className="border border-[#00272B]/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#00272B]/10 rounded-md flex items-center justify-center">
                    <i className="ri-stack-line text-[#1AAA3F] text-xl"></i>
                  </div>
                  {t('machineDetail.capacityTitle')}
                </h3>
                <div className="space-y-4">
                  {capacityEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-[#00272B]/60 capitalize">
                        {t(`machineDetail.capacity.${key}`, key)}
                      </span>
                      <span className="text-sm font-semibold text-[#00272B]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Specifications */}
              <div className="border border-[#00272B]/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#00272B]/10 rounded-md flex items-center justify-center">
                    <i className="ri-settings-3-line text-[#1AAA3F] text-xl"></i>
                  </div>
                  {t('machineDetail.characteristicsTitle')}
                </h3>
                <div className="space-y-4">
                  {specEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start gap-6 pb-4 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-[#00272B]/60 shrink-0">
                        {t(`machineDetail.specs.${key}`, key)}
                      </span>
                      <span className="text-sm font-semibold text-[#00272B] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          {machine.features.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#00272B] mb-8">{t('machineDetail.featuresTitle')}</h2>
            <div className="bg-white rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {machine.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-[#1AAA3F] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                    <span className="text-sm text-[#00272B]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Similar Machines */}
          {similarMachines.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-[#00272B] mb-8">{t('machineDetail.similar')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {similarMachines.map(similar => (
                  <Link 
                    key={similar.id}
                    to={`/machines/${similar.slug}`}
                    className="group bg-white border border-[#00272B]/10 rounded-2xl overflow-hidden hover:border-[#00272B]/25 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-64 overflow-hidden bg-white">
                      <img 
                        src={similar.image}
                        alt={similar.name}
                        className="w-full h-full object-contain object-center p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-[#00272B] mb-2 group-hover:text-[#1AAA3F] transition-colors">
                        {similar.name}
                      </h3>
                      <p className="text-sm text-[#00272B]/60 mb-4 line-clamp-2">
                        {similar.shortDescription}
                      </p>
                      <div className="font-semibold text-[#00272B]">{similar.price > 0 ? similar.priceDisplay : t('common.onQuote')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}