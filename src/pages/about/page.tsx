import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 bg-gradient-to-br from-[#EEFFF2] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-5 py-2 bg-[#FFF4F0] text-[#1AAA3F] text-sm font-semibold rounded-full mb-5 sm:mb-6">
              QUI SOMMES-NOUS
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#00272B] mb-4 sm:mb-6 leading-tight">
              Votre Partenaire de Confiance en Distribution Automatique
            </h1>
            <p className="text-base sm:text-xl text-[#4A4A4A] leading-relaxed">
              Depuis plus de 15 ans, SMA révolutionne l'accès aux produits de qualité au Sénégal 
              grâce à des solutions de distribution automatique innovantes et adaptées.
            </p>
          </div>
        </div>
      </section>

      {/* Histoire Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#00272B] mb-5 sm:mb-6">Notre Histoire</h2>
              <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed mb-5 sm:mb-6">
                Fondée en 2009, la Sénégalaise de Machines Automatiques (SMA) est née d'une vision simple : 
                rendre les produits de qualité accessibles partout, à tout moment.
              </p>
              <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed mb-5 sm:mb-6">
                Notre croissance s'appuie sur trois piliers : l'innovation technologique, la qualité de service 
                et l'adaptation aux besoins locaux.
              </p>
              <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed">
                Aujourd'hui, SMA est le leader incontesté de la distribution automatique au Sénégal, avec plus 
                de 500 machines installées et une équipe de 45 professionnels dévoués.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="https://readdy.ai/api/search-image?query=modern%20vending%20machines%20in%20bright%20contemporary%20african%20office%20building%20lobby%2C%20professional%20installation%2C%20clean%20minimalist%20design%2C%20natural%20lighting%2C%20Senegal%20business%20environment%2C%20high%20quality%20commercial%20space&width=800&height=900&seq=about-history-001&orientation=portrait"
                alt="Histoire SMA"
                className="w-full h-64 sm:h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Valeurs */}
      <section className="py-12 sm:py-20 bg-[#EEFFF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-12">
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#1AAA3F] rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <i className="ri-flag-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3 sm:mb-4">Notre Mission</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                Faciliter l'accès aux produits de qualité pour tous les Sénégalais, grâce à des solutions 
                de distribution automatique innovantes et adaptées aux modes de paiement locaux.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#25A9F2] rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <i className="ri-eye-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3 sm:mb-4">Notre Vision</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                Devenir le partenaire de référence en Afrique de l'Ouest pour les solutions de distribution 
                automatique, en combinant technologie de pointe et engagement pour le développement local.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-10 sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#00272B] rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <i className="ri-heart-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#00272B] mb-3 sm:mb-4">Nos Valeurs</h3>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                Excellence, Innovation, Intégrité, Proximité client et Engagement communautaire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres Clés */}
      <section className="py-12 sm:py-20 bg-[#00272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">SMA en Chiffres</h2>
            <p className="text-sm sm:text-lg text-gray-300">Des résultats qui témoignent de notre expertise</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1AAA3F] mb-2 sm:mb-3">500+</div>
              <div className="text-xs sm:text-base text-gray-300">Machines Installées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1AAA3F] mb-2 sm:mb-3">200+</div>
              <div className="text-xs sm:text-base text-gray-300">Clients Professionnels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1AAA3F] mb-2 sm:mb-3">15+</div>
              <div className="text-xs sm:text-base text-gray-300">Années d'Expérience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1AAA3F] mb-2 sm:mb-3">45</div>
              <div className="text-xs sm:text-base text-gray-300">Collaborateurs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#00272B] mb-4">Notre Équipe</h2>
            <p className="text-sm sm:text-lg text-[#4A4A4A] max-w-3xl mx-auto">
              Des professionnels passionnés et expérimentés au service de votre satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center group cursor-pointer">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
                <img src="https://readdy.ai/api/search-image?query=professional%20african%20business%20executive%20man%20in%20elegant%20suit%2C%20confident%20smile%2C%20modern%20office%20background%2C%20corporate%20portrait%20photography%2C%20leadership%20presence%2C%20Senegalese%20professional&width=400&height=500&seq=team-ceo-001&orientation=portrait" alt="Amadou Diop" className="w-full h-40 sm:h-full object-cover object-top" />
              </div>
              <h3 className="text-sm sm:text-xl font-bold text-[#00272B] mb-1">Amadou Diop</h3>
              <p className="text-xs sm:text-sm text-[#1AAA3F] font-semibold mb-1">Directeur Général</p>
              <p className="text-xs text-[#4A4A4A] hidden sm:block">15 ans d'expérience</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
                <img src="https://readdy.ai/api/search-image?query=professional%20african%20business%20woman%20in%20elegant%20blazer%2C%20warm%20smile%2C%20modern%20office%20setting%2C%20corporate%20portrait%20photography%2C%20confident%20executive%20presence%2C%20Senegalese%20professional&width=400&height=500&seq=team-ops-001&orientation=portrait" alt="Fatou Sall" className="w-full h-40 sm:h-full object-cover object-top" />
              </div>
              <h3 className="text-sm sm:text-xl font-bold text-[#00272B] mb-1">Fatou Sall</h3>
              <p className="text-xs sm:text-sm text-[#1AAA3F] font-semibold mb-1">Dir. Opérations</p>
              <p className="text-xs text-[#4A4A4A] hidden sm:block">Logistique & supply chain</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
                <img src="https://readdy.ai/api/search-image?query=professional%20african%20technology%20engineer%20man%20with%20glasses%2C%20friendly%20expression%2C%20modern%20tech%20office%20background%2C%20corporate%20portrait%20photography%2C%20innovation%20specialist%2C%20Senegalese%20professional&width=400&height=500&seq=team-tech-001&orientation=portrait" alt="Moussa Ndiaye" className="w-full h-40 sm:h-full object-cover object-top" />
              </div>
              <h3 className="text-sm sm:text-xl font-bold text-[#00272B] mb-1">Moussa Ndiaye</h3>
              <p className="text-xs sm:text-sm text-[#1AAA3F] font-semibold mb-1">Resp. Technique</p>
              <p className="text-xs text-[#4A4A4A] hidden sm:block">Ingénieur automatisé</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
                <img src="https://readdy.ai/api/search-image?query=professional%20african%20business%20woman%20in%20modern%20attire%2C%20bright%20smile%2C%20contemporary%20office%20environment%2C%20corporate%20portrait%20photography%2C%20customer%20service%20excellence%2C%20Senegalese%20professional&width=400&height=500&seq=team-sales-001&orientation=portrait" alt="Aïssatou Ba" className="w-full h-40 sm:h-full object-cover object-top" />
              </div>
              <h3 className="text-sm sm:text-xl font-bold text-[#00272B] mb-1">Aïssatou Ba</h3>
              <p className="text-xs sm:text-sm text-[#1AAA3F] font-semibold mb-1">Resp. Commerciale</p>
              <p className="text-xs text-[#4A4A4A] hidden sm:block">Relation client B2B</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagements Qualité */}
      <section className="py-12 sm:py-20 bg-[#EEFFF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#00272B] mb-4">Nos Engagements Qualité</h2>
            <p className="text-sm sm:text-lg text-[#4A4A4A] max-w-3xl mx-auto">Des garanties concrètes pour votre tranquillité d'esprit</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: 'ri-shield-check-line', color: 'bg-[#1AAA3F]', title: 'Garantie 2 Ans', desc: 'Toutes nos machines sont garanties 2 ans pièces et main d\'œuvre avec intervention sous 24h.' },
              { icon: 'ri-tools-line', color: 'bg-[#25A9F2]', title: 'Maintenance Préventive', desc: 'Visites mensuelles programmées pour assurer le bon fonctionnement et la propreté des machines.' },
              { icon: 'ri-refresh-line', color: 'bg-[#1AAA3F]', title: 'Réapprovisionnement', desc: 'Suivi des stocks en temps réel et réapprovisionnement automatique selon vos besoins.' },
              { icon: 'ri-customer-service-2-line', color: 'bg-[#25A9F2]', title: 'Support 7j/7', desc: 'Hotline disponible tous les jours pour répondre à vos questions et résoudre vos problèmes.' },
              { icon: 'ri-leaf-line', color: 'bg-[#1AAA3F]', title: 'Engagement Écologique', desc: 'Machines basse consommation et programme de recyclage des emballages et gobelets.' },
              { icon: 'ri-award-line', color: 'bg-[#25A9F2]', title: 'Produits Certifiés', desc: 'Sélection rigoureuse de produits de marques reconnues avec certifications qualité.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 sm:p-8">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.color} rounded-lg flex items-center justify-center mb-4 sm:mb-5`}>
                  <i className={`${item.icon} text-xl sm:text-2xl text-white`}></i>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-[#00272B] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">{item.desc}</p>
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