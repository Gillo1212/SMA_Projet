import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';

export default function AboutPage() {
  const innovations = [
    { axe: 'Digitalisation de la distribution', desc: 'Automates connectés, paiements dématérialisés', impact: 'Accessibilité 24/7' },
    { axe: 'Valorisation des produits locaux', desc: 'Filière café, cacao, céréales africaines', impact: 'Revenus agricoles accrus' },
    { axe: 'Traçabilité & Data', desc: 'Suivi des ventes, qualité, maintenance prédictive', impact: 'Transparence et efficacité' },
    { axe: 'Durabilité', desc: 'Réduction du gaspillage, packaging écoresponsable', impact: 'Empreinte carbone réduite' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 bg-gradient-to-br from-[#EEFFF2] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-5 py-2 bg-[#EEFFF2] text-[#0D8C2E] text-sm font-semibold rounded-full mb-5 sm:mb-6">
              QUI SOMMES-NOUS
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#00272B] mb-4 sm:mb-6 leading-tight">
              Agrobusiness, Distribution Automatisée<br />& Technologies Numériques
            </h1>
            <p className="text-base sm:text-xl text-[#4A4A4A] leading-relaxed">
              SenMartALIM modernise la chaîne de valeur alimentaire en Afrique et au Canada,
              de la production agricole à la distribution intelligente.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#00272B] mb-5 sm:mb-6">Notre Mission</h2>
              <p className="text-xl sm:text-2xl font-semibold text-[#0D8C2E] italic mb-6 leading-relaxed">
                « Mettre la technologie au service d'une alimentation saine, accessible et traçable. »
              </p>
              <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed mb-5">
                SMA développe un écosystème intégré allant de la production agricole à la distribution
                intelligente, avec une forte orientation vers la qualité, la traçabilité et l'impact social.
              </p>
              <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed">
                Nous croyons que l'avenir de l'agroalimentaire passe par l'innovation locale - créer un pont
                entre les producteurs agricoles africains et les consommateurs urbains à travers la transformation
                locale, la logistique optimisée et les circuits de distribution modernes.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20vending%20machines%20in%20bright%20contemporary%20african%20office%20building%20lobby%2C%20professional%20installation%2C%20clean%20minimalist%20design%2C%20natural%20lighting%2C%20Senegal%20business%20environment%2C%20high%20quality%20commercial%20space&width=800&height=900&seq=about-history-001&orientation=portrait"
                alt="SenMartALIM distribution"
                className="w-full h-64 sm:h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nos Activités */}
      <section className="py-12 sm:py-20 bg-[#F8F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#00272B] mb-4">Nos Activités</h2>
            <p className="text-sm sm:text-lg text-[#4A4A4A] max-w-3xl mx-auto">
              Un écosystème intégré couvrant l'ensemble de la chaîne de valeur alimentaire
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 bg-[#0D8C2E] rounded-xl flex items-center justify-center mb-5">
                <i className="ri-robot-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3">Distribution Automatique & Vente Connectée</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed mb-4">
                Automates de boissons chaudes et froides, snacks et produits santé sous la marque SenMartALIM.
                Intégration IoT, paiement digital (Wave, Orange Money, PayPal), gestion centralisée via plateforme cloud
                et traçabilité des ventes en temps réel.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Café & Boissons', 'Snacks Santé', 'IoT & Cloud', 'Paiement Digital'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#EEFFF2] text-[#0D8C2E] text-xs font-semibold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 bg-[#00272B] rounded-xl flex items-center justify-center mb-5">
                <i className="ri-plant-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3">Transformation Agroalimentaire</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed mb-4">
                Approvisionnement auprès de coopératives agricoles et producteurs locaux. Valorisation des produits
                africains : café, cacao, céréales, fruits tropicaux. Poudres premium, boissons santé, snacks à base
                de fruits séchés, noix et céréales locales.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Café & Cacao', 'Céréales Locales', 'Fruits Séchés', 'Circuits Courts'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#EEFFF2] text-[#0D8C2E] text-xs font-semibold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 bg-[#0D8C2E] rounded-xl flex items-center justify-center mb-5">
                <i className="ri-cloud-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3">Technologies & Données</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed mb-4">
                Infrastructure Microsoft Azure pour piloter l'ensemble du numérique : API de paiement,
                suivi des transactions, Data Lake Azure Synapse, tableaux de bord Power BI.
                Décisions data-driven pour optimiser la performance commerciale et logistique.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Microsoft Azure', 'Power BI', 'Data Lake', 'API Paiement'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#EEFFF2] text-[#0D8C2E] text-xs font-semibold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 bg-[#00272B] rounded-xl flex items-center justify-center mb-5">
                <i className="ri-shake-hands-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3">Partenariats & Déploiements</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed mb-4">
                Déploiement dans des sites à fort trafic : hôpitaux (CHUP de Pikine), écoles, universités,
                espaces publics et entreprises privées. Deux modèles : vente directe ou mise à disposition
                avec partage des revenus.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Hôpitaux', 'Universités', 'Entreprises', 'Espaces Publics'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#EEFFF2] text-[#0D8C2E] text-xs font-semibold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Valeurs */}
      <section className="py-12 sm:py-20 bg-[#EEFFF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-12">
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0D8C2E] rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <i className="ri-flag-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3 sm:mb-4">Notre Mission</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                Mettre la technologie au service d'une alimentation saine, accessible et traçable,
                en créant de la valeur ajoutée sur le territoire tout en soutenant une économie circulaire.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#00272B] rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <i className="ri-eye-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3 sm:mb-4">Notre Vision</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                Extension du parc de distributeurs connectés au Canada et en Afrique de l'Ouest.
                Développement de l'application mobile SMA Connect pour la commande, le paiement et la fidélité.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10 sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0D8C2E] rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <i className="ri-heart-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3 sm:mb-4">Nos Engagements</h3>
              <ul className="text-sm sm:text-base text-[#4A4A4A] space-y-2">
                <li className="flex items-start gap-2"><i className="ri-checkbox-circle-fill text-[#0D8C2E] mt-0.5"></i>Qualité & traçabilité des matières premières</li>
                <li className="flex items-start gap-2"><i className="ri-checkbox-circle-fill text-[#0D8C2E] mt-0.5"></i>Soutien aux producteurs locaux</li>
                <li className="flex items-start gap-2"><i className="ri-checkbox-circle-fill text-[#0D8C2E] mt-0.5"></i>Innovation continue en distribution</li>
                <li className="flex items-start gap-2"><i className="ri-checkbox-circle-fill text-[#0D8C2E] mt-0.5"></i>Responsabilité sociale et environnementale</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation & Impact */}
      <section className="py-12 sm:py-20 bg-[#00272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Innovation & Impact</h2>
            <p className="text-sm sm:text-lg text-gray-300">Nos axes d'innovation pour un impact durable</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {innovations.map((item, i) => (
              <div key={i} className="bg-white/8 rounded-2xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-base sm:text-xl font-bold text-white mb-2">{item.axe}</h3>
                <p className="text-sm text-gray-300 mb-3">{item.desc}</p>
                <span className="inline-block px-3 py-1 bg-[#0D8C2E]/30 text-[#0D8C2E] text-xs font-semibold rounded-full border border-[#0D8C2E]/40">
                  Impact : {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perspectives */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#00272B] mb-4">Perspectives de Développement</h2>
            <p className="text-sm sm:text-lg text-[#4A4A4A] max-w-3xl mx-auto">Notre feuille de route pour les prochaines années</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: 'ri-global-line', title: 'Expansion Internationale', desc: 'Extension du parc de distributeurs connectés au Canada et en Afrique de l\'Ouest.' },
              { icon: 'ri-smartphone-line', title: 'Application SMA Connect', desc: 'App mobile pour la commande, le paiement et la fidélité client.' },
              { icon: 'ri-truck-line', title: 'Chaîne Agro Intégrée', desc: 'Partenariats agricoles et logistiques pour une supply chain complète.' },
              { icon: 'ri-store-line', title: 'Marque Propre', desc: 'Lancement d\'une gamme de boissons et snacks sains issus de produits locaux.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#F8F6F3] rounded-2xl p-6 sm:p-8">
                <div className="w-12 h-12 bg-[#0D8C2E] rounded-xl flex items-center justify-center mb-4">
                  <i className={`${item.icon} text-xl text-white`}></i>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#00272B] mb-2">{item.title}</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        badge="Parlons de votre projet"
        title="Prêt à équiper vos espaces ?"
        subtitle="Contactez nos experts pour une étude personnalisée et un devis gratuit sous 24h."
        buttons={[
          { label: 'Demander un devis', href: '/machines/devis', icon: 'ri-file-list-line', variant: 'white' },
          { label: 'Nous appeler', href: 'tel:+221331234567', icon: 'ri-phone-line', variant: 'primary' },
        ]}
      />

      <Footer />
    </div>
  );
}
