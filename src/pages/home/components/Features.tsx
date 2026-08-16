export default function Features() {
  return (
    <section className="py-16 sm:py-24 bg-[#F8F6F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Carte 1 - Agrobusiness & Produits Locaux */}
          <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D2D2D] rounded-full flex items-center justify-center mb-5 sm:mb-6">
              <i className="ri-plant-line text-white text-xl sm:text-2xl"></i>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4 sm:mb-6">
              Produits Agroalimentaires Locaux
            </h3>
            <p className="text-[#B0B0B0] text-sm sm:text-base leading-relaxed">
              Approvisionnement auprès de coopératives agricoles locales : café, cacao, céréales,
              fruits tropicaux. Valorisation des produits africains avec qualité, origine et traçabilité garanties.
            </p>
          </div>

          {/* Carte 2 - Distribution Connectée */}
          <div className="relative rounded-3xl overflow-hidden h-64 sm:h-full min-h-[300px] sm:min-h-[400px]">
            <img
              src="https://readdy.ai/api/search-image?query=modern%20vending%20machine%20dispensing%20coffee%20in%20action%2C%20close-up%20view%20of%20automated%20beverage%20service%2C%20professional%20commercial%20equipment%2C%20sleek%20technology%20in%20use%2C%20contemporary%20design&width=600&height=800&seq=features-sma-003&orientation=portrait"
              alt="Distribution connectée SMA"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute top-6 left-6">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3">
                <i className="ri-wifi-line text-white text-base sm:text-xl"></i>
                <span className="text-white font-medium text-xs sm:text-sm">Automates IoT Connectés</span>
              </div>
            </div>
            <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8">
              <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                Distribution Intelligente<br />Hôpitaux, Écoles &amp; Entreprises
              </h3>
            </div>
          </div>

          {/* Carte 3 - Paiements Mobiles */}
          <div className="bg-white rounded-3xl p-8 sm:p-12">
            <h3 className="text-2xl sm:text-4xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Paiements Mobiles Intégrés
            </h3>
            <p className="text-[#666666] text-sm mb-6 sm:mb-8 leading-relaxed">
              Wave, Orange Money directement sur vos distributeurs.
              Expérience d'achat moderne, rapide et sans contact.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white">
                <img
                  src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/768bed2b-5283-47bc-b9e6-f4dae5cf304f_Wave.png?v=c76ba778473ee3601f42a6ffe67df37c"
                  alt="Wave"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white">
                <img
                  src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/7601a307-e87f-40c7-84ba-40ace6edbf5e_Orange-money.png?v=e2d6d95468557e3a937a2d097b94b09e"
                  alt="Orange Money"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
