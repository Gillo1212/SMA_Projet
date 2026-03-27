import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://readdy.ai/api/search-image?query=modern%20professional%20vending%20machines%20in%20a%20contemporary%20corporate%20office%20environment%20with%20sleek%20design%2C%20bright%20natural%20lighting%2C%20business%20people%20in%20background%2C%20clean%20minimalist%20aesthetic%2C%20high-end%20commercial%20space%20with%20coffee%20and%20snack%20dispensers&width=1920&height=1080&seq=hero-sma-001&orientation=landscape"
          alt="Distributeurs automatiques SMA"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 sm:mb-8" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          Solutions de Distributeurs<br className="hidden sm:block" />
          Automatiques Professionnels<br className="hidden sm:block" />
          Pour Votre Entreprise
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
          Expertise B2B et B2C avec intégration complète des paiements mobiles Wave &amp; Orange Money. 
          Découvrez nos solutions innovantes pour votre entreprise.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link to="/machines" className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-[#1AAA3F] text-white text-base font-semibold rounded-lg hover:bg-[#158f35] transition-all hover:scale-105 whitespace-nowrap">
            Découvrir nos Machines
          </Link>
          <Link to="/produits" className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-transparent border-2 border-white text-white text-base font-semibold rounded-lg hover:bg-white hover:text-[#00272B] transition-all whitespace-nowrap">
            Catalogue Produits
          </Link>
        </div>

        <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="ri-arrow-down-line text-white text-2xl sm:text-3xl"></i>
        </div>
      </div>
    </section>
  );
}