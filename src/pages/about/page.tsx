import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';
import PageHero from '../../components/feature/PageHero';

const ACTIVITIES = [
  {
    title: 'Distribution automatique et vente connectée',
    text: 'Automates de boissons chaudes et froides, snacks et produits santé sous la marque SenMartALIM. Intégration IoT, paiement digital (Wave, Orange Money, PayPal), gestion centralisée via plateforme cloud et traçabilité des ventes en temps réel.',
    tags: ['Café et boissons', 'Snacks santé', 'IoT et cloud', 'Paiement digital'],
  },
  {
    title: 'Transformation agroalimentaire',
    text: 'Approvisionnement auprès de coopératives agricoles et producteurs locaux. Valorisation des produits africains : café, cacao, céréales, fruits tropicaux. Poudres premium, boissons santé, snacks à base de fruits séchés, noix et céréales locales.',
    tags: ['Café et cacao', 'Céréales locales', 'Fruits séchés', 'Circuits courts'],
  },
  {
    title: 'Technologies et données',
    text: "Infrastructure Microsoft Azure pour piloter l'ensemble du numérique : API de paiement, suivi des transactions, Data Lake Azure Synapse, tableaux de bord Power BI. Des décisions fondées sur les données pour optimiser la performance commerciale et logistique.",
    tags: ['Microsoft Azure', 'Power BI', 'Data Lake', 'API de paiement'],
  },
  {
    title: 'Partenariats et déploiements',
    text: 'Déploiement dans des sites à fort trafic : hôpitaux (CHUP de Pikine), écoles, universités, espaces publics et entreprises privées. Deux modèles : vente directe ou mise à disposition avec partage des revenus.',
    tags: ['Hôpitaux', 'Universités', 'Entreprises', 'Espaces publics'],
  },
];

const INNOVATIONS = [
  { axe: 'Digitalisation de la distribution', desc: 'Automates connectés, paiements dématérialisés', impact: 'Accessibilité 24/7' },
  { axe: 'Valorisation des produits locaux', desc: 'Filière café, cacao, céréales africaines', impact: 'Revenus agricoles accrus' },
  { axe: 'Traçabilité et données', desc: 'Suivi des ventes, qualité, maintenance prédictive', impact: 'Transparence et efficacité' },
  { axe: 'Durabilité', desc: 'Réduction du gaspillage, packaging écoresponsable', impact: 'Empreinte carbone réduite' },
];

const ROADMAP = [
  { icon: 'ri-global-line', title: 'Expansion internationale', desc: "Extension du parc de distributeurs connectés au Canada et en Afrique de l'Ouest." },
  { icon: 'ri-smartphone-line', title: 'Application SMA Connect', desc: 'Application mobile pour la commande, le paiement et la fidélité client.' },
  { icon: 'ri-truck-line', title: 'Chaîne agro intégrée', desc: 'Partenariats agricoles et logistiques pour une chaîne d’approvisionnement complète.' },
  { icon: 'ri-store-line', title: 'Marque propre', desc: "Lancement d'une gamme de boissons et snacks sains issus de produits locaux." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageHero
        eyebrow="Qui sommes-nous"
        title="Agrobusiness, distribution automatisée et"
        titleAccent="technologies numériques"
        subtitle="SenMartALIM modernise la chaîne de valeur alimentaire en Afrique et au Canada, de la production agricole à la distribution intelligente."
      />

      {/* Mission */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="eyebrow text-[#0D8C2E] mb-5">Notre mission</p>
              <p className="font-serif italic text-3xl sm:text-4xl text-[#00272B] leading-tight mb-8">
                « Mettre la technologie au service d'une alimentation saine, accessible et traçable. »
              </p>
              <p className="text-base sm:text-lg text-[#00272B]/70 leading-relaxed mb-5">
                SMA développe un écosystème intégré allant de la production agricole à la distribution
                intelligente, avec une forte orientation vers la qualité, la traçabilité et l'impact social.
              </p>
              <p className="text-base sm:text-lg text-[#00272B]/70 leading-relaxed">
                Nous croyons que l'avenir de l'agroalimentaire passe par l'innovation locale : créer un pont
                entre les producteurs agricoles africains et les consommateurs urbains, grâce à la transformation
                locale, à une logistique optimisée et à des circuits de distribution modernes.
              </p>
            </div>
            <div className="lg:col-span-6">
              <img
                src="/images/machines/sen-coffee-distributeur-cafe-grains/2.webp"
                alt="Distributeur SEN Coffee installé dans un espace de travail"
                className="w-full h-[460px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activités */}
      <section className="py-20 sm:py-28 bg-[#F6F3EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="eyebrow text-[#0D8C2E] mb-5">Nos activités</p>
            <h2 className="text-4xl sm:text-5xl text-[#00272B]">
              Toute la chaîne de valeur <em className="italic text-[#0D8C2E]">alimentaire</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {ACTIVITIES.map((activity, i) => (
              <article key={activity.title} className="bg-white rounded-2xl p-8 sm:p-10">
                <p className="font-serif text-2xl text-[#1AAA3F] mb-6">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="text-2xl text-[#00272B] mb-4">{activity.title}</h3>
                <p className="text-[15px] text-[#00272B]/70 leading-relaxed mb-6">{activity.text}</p>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 border border-[#00272B]/10 text-[#00272B]/70 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, vision, engagements */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid md:grid-cols-3 gap-10 md:gap-12">
          <div>
            <p className="eyebrow text-[#0D8C2E] mb-4">Notre mission</p>
            <p className="text-[15px] text-[#00272B]/70 leading-relaxed">
              Mettre la technologie au service d'une alimentation saine, accessible et traçable,
              en créant de la valeur ajoutée sur le territoire tout en soutenant une économie circulaire.
            </p>
          </div>
          <div>
            <p className="eyebrow text-[#0D8C2E] mb-4">Notre vision</p>
            <p className="text-[15px] text-[#00272B]/70 leading-relaxed">
              Étendre le parc de distributeurs connectés au Canada et en Afrique de l'Ouest, et développer
              l'application mobile SMA Connect pour la commande, le paiement et la fidélité.
            </p>
          </div>
          <div>
            <p className="eyebrow text-[#0D8C2E] mb-4">Nos engagements</p>
            <ul className="text-[15px] text-[#00272B]/70 space-y-2.5">
              {['Qualité et traçabilité des matières premières', 'Soutien aux producteurs locaux', 'Innovation continue en distribution', 'Responsabilité sociale et environnementale'].map(item => (
                <li key={item} className="flex items-start gap-2.5"><i className="ri-check-line text-[#0D8C2E] mt-0.5"></i>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Innovation et impact */}
      <section className="py-20 sm:py-28 bg-[#00272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="eyebrow text-[#4FD07A] mb-5">Innovation et impact</p>
            <h2 className="text-4xl sm:text-5xl text-white">
              Nos axes d'innovation pour un <em className="italic text-[#4FD07A]">impact durable</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {INNOVATIONS.map(item => (
              <div key={item.axe} className="bg-[#00272B] p-8">
                <h3 className="text-xl text-white mb-2">{item.axe}</h3>
                <p className="text-sm text-white/60 mb-5">{item.desc}</p>
                <p className="eyebrow text-[#4FD07A]">Impact : {item.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perspectives */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="eyebrow text-[#0D8C2E] mb-5">Perspectives</p>
            <h2 className="text-4xl sm:text-5xl text-[#00272B]">
              Notre feuille de route <em className="italic text-[#0D8C2E]">pour les prochaines années</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP.map(item => (
              <div key={item.title} className="border border-[#00272B]/10 rounded-2xl p-7">
                <i className={`${item.icon} text-2xl text-[#0D8C2E]`}></i>
                <h3 className="text-xl text-[#00272B] mt-6 mb-3">{item.title}</h3>
                <p className="text-sm text-[#00272B]/65 leading-relaxed">{item.desc}</p>
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
          { label: 'Demander un devis', href: '/machines/devis', icon: 'ri-file-list-3-line', variant: 'white' },
          { label: 'Nous appeler', href: 'tel:+221331234567', icon: 'ri-phone-line', variant: 'primary' },
        ]}
      />

      <Footer />
    </div>
  );
}
