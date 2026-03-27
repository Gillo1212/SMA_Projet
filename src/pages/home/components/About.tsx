export default function About() {
  return (
    <section className="py-16 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-12 items-center">
          <div className="md:col-span-3">
            <div className="inline-block px-5 py-2 bg-[#FFF4F0] text-[#1AAA3F] text-sm font-semibold rounded-full mb-6">
              À PROPOS DE SMA
            </div>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
              Leader des Solutions<br />
              de Distribution Automatique
            </h2>
            
            <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed mb-6">
              SMA (Sénégalaise de Machines Automatiques) est votre partenaire de confiance pour 
              l'installation et la gestion de distributeurs automatiques au Sénégal. Nous offrons 
              des solutions complètes adaptées aux besoins des entreprises et des particuliers.
            </p>
            
            <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed">
              Notre expertise couvre l'ensemble de la chaîne de valeur : de la sélection des machines 
              les plus performantes à la fourniture de produits de qualité, en passant par l'intégration 
              des moyens de paiement mobiles les plus populaires au Sénégal.
            </p>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#1AAA3F] mb-2">500+</div>
                <div className="text-xs sm:text-sm text-[#4A4A4A]">Machines Installées</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#1AAA3F] mb-2">200+</div>
                <div className="text-xs sm:text-sm text-[#4A4A4A]">Clients Professionnels</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#1AAA3F] mb-2">15+</div>
                <div className="text-xs sm:text-sm text-[#4A4A4A]">Années d'Expérience</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="https://readdy.ai/api/search-image?query=professional%20african%20business%20team%20working%20together%20in%20modern%20office%2C%20diverse%20group%20of%20employees%20collaborating%2C%20bright%20contemporary%20workspace%2C%20teamwork%20and%20innovation%2C%20corporate%20environment%20in%20Senegal&width=800&height=1000&seq=about-sma-002&orientation=portrait"
                alt="Équipe SMA"
                className="w-full h-64 sm:h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}