import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
          poster="https://readdy.ai/api/search-image?query=modern%20smart%20vending%20machine%20installed%20in%20a%20vibrant%20African%20urban%20environment%20in%20Senegal%20Dakar%2C%20local%20agroalimentary%20food%20products%20cereals%20fruits%20and%20healthy%20snacks%20displayed%20inside%20the%20machine%2C%20warm%20golden%20sunlight%20streaming%20through%2C%20colorful%20African%20city%20background%20with%20green%20vegetation%2C%20people%20interacting%20with%20the%20machine%2C%20technology%20meets%20local%20agriculture%20and%20food%20distribution%2C%20photorealistic%20high%20quality%20scene%20with%20rich%20green%20and%20warm%20earth%20tones&width=1920&height=1080&seq=hero-sma-africa-002&orientation=landscape"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/50"></div>
      </div>
      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 sm:mb-8" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          Mettre la Technologie<br className="hidden sm:block" />
          au Service d'une Alimentation<br className="hidden sm:block" />
          Saine et Accessible
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
          Découvrez comment nos distributeurs automatiques intelligents révolutionnent l'accès à une alimentation saine
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link to="/machines" className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-[#0D8C2E] text-white text-base font-semibold rounded-lg hover:bg-[#0a7025] transition-all hover:scale-105 whitespace-nowrap">
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
