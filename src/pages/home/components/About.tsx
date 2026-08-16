export default function About() {
  return (
    <section className="py-16 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-12 items-center">
          <div className="md:col-span-3">
            <div className="inline-block px-5 py-2 bg-[#EEFFF2] text-[#0D8C2E] text-sm font-semibold rounded-full mb-6">
              QUI SOMMES-NOUS
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
              Agrobusiness, Distribution<br />Automatisée &amp; Technologies
            </h2>
            <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed mb-6">
              SenMartALIM (SMA) est une entreprise innovante opérant à l'intersection de l'agrobusiness,
              de la distribution automatisée et des technologies numériques. Née d'une vision de moderniser
              la chaîne de valeur alimentaire en Afrique et au Canada.
            </p>
            <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed mb-6">
              Notre mission : <strong className="text-[#00272B]">« Mettre la technologie au service d'une alimentation saine, accessible et traçable. »</strong>
            </p>
            <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed">
              SMA développe un écosystème intégré allant de la production agricole à la distribution
              intelligente, avec une forte orientation vers la qualité, la traçabilité et l'impact social.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0D8C2E] mb-2">IoT</div>
                <div className="text-xs sm:text-sm text-[#4A4A4A]">Automates Connectés</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0D8C2E] mb-2">Azure</div>
                <div className="text-xs sm:text-sm text-[#4A4A4A]">Infrastructure Cloud</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0D8C2E] mb-2">24/7</div>
                <div className="text-xs sm:text-sm text-[#4A4A4A]">Accessibilité</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20african%20business%20team%20working%20together%20in%20modern%20office%2C%20diverse%20group%20of%20employees%20collaborating%2C%20bright%20contemporary%20workspace%2C%20teamwork%20and%20innovation%2C%20corporate%20environment%20in%20Senegal&width=800&height=1000&seq=about-sma-002&orientation=portrait"
                alt="Équipe SenMartALIM"
                className="w-full h-64 sm:h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
