import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';
import { machines } from '../../../mocks/machines';

export default function MachineDetailPage() {
  const { slug } = useParams();
  const machine = machines.find(m => m.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!machine) {
    return (
      <div className="min-h-screen bg-[#EEFFF2] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#00272B] mb-4">Machine non trouvée</h2>
          <Link to="/machines" className="text-[#1AAA3F] hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const similarMachines = machines.filter(m => m.type === machine.type && m.id !== machine.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#EEFFF2]">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#00272B]/60 mb-8">
            <Link to="/" className="hover:text-[#1AAA3F] transition-colors">Accueil</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/machines" className="hover:text-[#1AAA3F] transition-colors">Machines</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-[#00272B]">{machine.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative h-[600px] bg-white rounded-2xl overflow-hidden mb-4">
                <img 
                  src={machine.gallery[selectedImage]}
                  alt={machine.name}
                  className="w-full h-full object-cover object-center"
                />
                {machine.badge && (
                  <div className="absolute top-6 right-6 px-5 py-2 bg-[#1AAA3F] text-white text-sm font-bold rounded-full">
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
                    className={`relative h-24 bg-white rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === index 
                        ? 'ring-4 ring-[#1AAA3F] scale-105' 
                        : 'hover:scale-105'
                    }`}
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
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-white rounded-full text-xs font-semibold text-[#1AAA3F] uppercase tracking-wide">
                  {machine.category}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-[#00272B] mb-6">
                {machine.name}
              </h1>

              <p className="text-lg text-[#00272B]/70 mb-8 leading-relaxed">
                {machine.description}
              </p>

              {/* Price */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <div className="text-sm text-[#00272B]/60 mb-2">Prix à partir de</div>
                <div className="text-4xl font-bold text-[#00272B] mb-4">{machine.priceDisplay}</div>
                <div className="flex items-center gap-3 text-sm text-[#00272B]/60">
                  <div className="flex items-center gap-2">
                    <i className="ri-truck-line text-[#1AAA3F]"></i>
                    <span>Livraison: {machine.deliveryTime}</span>
                  </div>
                  <div className="w-1 h-1 bg-[#00272B]/20 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <i className="ri-shield-check-line text-[#1AAA3F]"></i>
                    <span>{machine.stock}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-semibold text-[#00272B] mb-4">Modes de paiement acceptés</h3>
                <div className="flex flex-wrap gap-3">
                  {machine.paymentMethods.includes('wave') && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#EEFFF2] rounded-lg">
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
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#EEFFF2] rounded-lg">
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
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#EEFFF2] rounded-lg">
                      <i className="ri-bank-card-line text-[#1AAA3F]"></i>
                      <span className="text-sm font-medium text-[#00272B]">Carte Bancaire</span>
                    </div>
                  )}
                  {machine.paymentMethods.includes('especes') && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#EEFFF2] rounded-lg">
                      <i className="ri-money-dollar-circle-line text-[#1AAA3F]"></i>
                      <span className="text-sm font-medium text-[#00272B]">Espèces</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-4">
                <Link 
                  to={`/machines/devis?machine=${machine.slug}`}
                  className="w-full h-14 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#158f35] transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-file-list-line text-lg"></i>
                  Demander un devis gratuit
                </Link>
                <Link 
                  to="/machines/comparateur"
                  className="w-full h-14 bg-white text-[#00272B] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-scales-line text-lg"></i>
                  Ajouter au comparateur
                </Link>
              </div>

              {/* Ideal For */}
              {machine.idealFor && (
                <div className="mt-8 p-6 bg-white rounded-2xl">
                  <h3 className="text-sm font-semibold text-[#00272B] mb-4">Idéal pour</h3>
                  <div className="flex flex-wrap gap-2">
                    {machine.idealFor.map((use, index) => (
                      <span key={index} className="px-3 py-2 bg-[#EEFFF2] text-xs font-medium text-[#00272B] rounded-lg">
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
            <h2 className="text-3xl font-bold text-[#00272B] mb-8">Spécifications Techniques</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Capacity */}
              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEFFF2] rounded-lg flex items-center justify-center">
                    <i className="ri-stack-line text-[#1AAA3F] text-xl"></i>
                  </div>
                  Capacité
                </h3>
                <div className="space-y-4">
                  {Object.entries(machine.capacity).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-[#00272B]/60 capitalize">
                        {key === 'cups' ? 'Gobelets' : 
                         key === 'waterTank' ? 'Réservoir eau' :
                         key === 'beanContainer' ? 'Conteneur café' :
                         key === 'wasteContainer' ? 'Bac à déchets' :
                         key === 'cans' ? 'Canettes' :
                         key === 'bottles' ? 'Bouteilles' :
                         key === 'total' ? 'Total' :
                         key === 'spirals' ? 'Spirales' :
                         key === 'totalProducts' ? 'Total produits' :
                         key === 'compartments' ? 'Compartiments' :
                         key === 'maxProductHeight' ? 'Hauteur max produit' :
                         key === 'shelves' ? 'Niveaux' :
                         key === 'coffee' ? 'Café' :
                         key === 'snacks' ? 'Snacks' :
                         key === 'drinks' ? 'Boissons' :
                         key}
                      </span>
                      <span className="text-sm font-semibold text-[#00272B]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[#00272B] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEFFF2] rounded-lg flex items-center justify-center">
                    <i className="ri-settings-3-line text-[#1AAA3F] text-xl"></i>
                  </div>
                  Caractéristiques
                </h3>
                <div className="space-y-4">
                  {Object.entries(machine.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-[#00272B]/60 capitalize">
                        {key === 'dimensions' ? 'Dimensions' :
                         key === 'weight' ? 'Poids' :
                         key === 'power' ? 'Puissance' :
                         key === 'waterConnection' ? 'Eau' :
                         key === 'drinksPerMinute' ? 'Débit' :
                         key === 'selections' ? 'Sélections' :
                         key === 'temperature' ? 'Température' :
                         key === 'glass' ? 'Vitrage' :
                         key === 'lighting' ? 'Éclairage' :
                         key === 'cooling' ? 'Refroidissement' :
                         key === 'efficiency' ? 'Efficacité' :
                         key === 'heating' ? 'Chauffe' :
                         key === 'zones' ? 'Zones' :
                         key}
                      </span>
                      <span className="text-sm font-semibold text-[#00272B] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#00272B] mb-8">Fonctionnalités & Avantages</h2>
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

          {/* Similar Machines */}
          {similarMachines.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-[#00272B] mb-8">Machines Similaires</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {similarMachines.map(similar => (
                  <Link 
                    key={similar.id}
                    to={`/machines/${similar.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-50">
                      <img 
                        src={similar.image}
                        alt={similar.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-[#00272B] mb-2 group-hover:text-[#1AAA3F] transition-colors">
                        {similar.name}
                      </h3>
                      <p className="text-sm text-[#00272B]/60 mb-4 line-clamp-2">
                        {similar.shortDescription}
                      </p>
                      <div className="text-xl font-bold text-[#00272B]">{similar.priceDisplay}</div>
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