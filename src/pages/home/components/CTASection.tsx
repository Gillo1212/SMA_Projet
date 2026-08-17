import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="relative py-36 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=variety%20of%20premium%20products%20in%20vending%20machine%2C%20coffee%20packages%20snacks%20and%20beverages%20displayed%20beautifully%2C%20colorful%20product%20assortment%2C%20professional%20commercial%20photography%2C%20warm%20inviting%20lighting%2C%20organized%20shelves&width=1920&height=1080&seq=cta-sma-008&orientation=landscape"
          alt="Produits SMA"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D8C2E]/85 via-[#0D8C2E]/65 to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 text-center">
        <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-wide" style={{ letterSpacing: '2px' }}>
          {t('home.cta.line1')}<br />{t('home.cta.line2')}<br />{t('home.cta.line3')}
        </h2>
        <p className="text-xl md:text-2xl text-white font-light mb-14 max-w-3xl mx-auto leading-relaxed">
          Café, snacks, boissons et bien plus encore. Livraison rapide partout au Sénégal.<br />
          Paiement sécurisé avec Wave et Orange Money.
        </p>
        <Link to="/produits" className="inline-flex items-center bg-black text-white font-semibold text-base rounded-full overflow-hidden hover:scale-105 transition-transform whitespace-nowrap">
          <div className="w-16 h-16 bg-[#0D8C2E] flex items-center justify-center">
            <i className="ri-shopping-cart-line text-white text-2xl"></i>
          </div>
          <span className="px-8">{t('home.cta.button')}</span>
          <i className="ri-arrow-right-up-line text-2xl mr-6"></i>
        </Link>
      </div>
    </section>
  );
}
