export default function Features() {
  return (
    <section className="py-16 sm:py-24 bg-[#F8F6F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Carte 1 - Expertise Technique */}
          <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D2D2D] rounded-full flex items-center justify-center mb-5 sm:mb-6">
              <i className="ri-tools-line text-white text-xl sm:text-2xl"></i>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4 sm:mb-6">
              Expertise Technique
            </h3>
            <p className="text-[#B0B0B0] text-sm sm:text-base leading-relaxed">
              Installation professionnelle, maintenance préventive et support technique 
              disponible 24/7 pour garantir le fonctionnement optimal de vos équipements.
            </p>
          </div>

          {/* Carte 2 - Solutions B2B/B2C */}
          <div className="relative rounded-3xl overflow-hidden h-64 sm:h-full min-h-[300px] sm:min-h-[400px]">
            <img 
              src="https://readdy.ai/api/search-image?query=modern%20vending%20machine%20dispensing%20coffee%20in%20action%2C%20close-up%20view%20of%20automated%20beverage%20service%2C%20professional%20commercial%20equipment%2C%20sleek%20technology%20in%20use%2C%20contemporary%20design&width=600&height=800&seq=features-sma-003&orientation=portrait"
              alt="Solutions professionnelles"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute top-6 left-6">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3">
                <i className="ri-building-line text-white text-base sm:text-xl"></i>
                <span className="text-white font-medium text-xs sm:text-sm">Solutions Professionnelles</span>
              </div>
            </div>
            <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8">
              <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                Adaptées à Tous<br />Vos Besoins B2B &amp; B2C
              </h3>
            </div>
          </div>

          {/* Carte 3 - Paiements Mobiles */}
          <div className="bg-white rounded-3xl p-8 sm:p-12">
            <h3 className="text-2xl sm:text-4xl font-bold text-black mb-4 sm:mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Paiements Mobiles Intégrés
            </h3>
            <p className="text-[#666666] text-sm mb-6 sm:mb-8 leading-relaxed">
              Acceptez les paiements Wave et Orange Money directement sur vos distributeurs. 
              Simplicité et sécurité pour vos clients.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25A9E0] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">WAVE</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">OM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}