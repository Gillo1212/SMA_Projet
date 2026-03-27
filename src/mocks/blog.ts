export const blogCategories = [
  { id: 'all', name: 'Tous les articles' },
  { id: 'actualites', name: 'Actualités' },
  { id: 'conseils', name: 'Conseils' },
  { id: 'innovations', name: 'Innovations' },
  { id: 'temoignages', name: 'Témoignages' }
];

export const blogArticles = [
  {
    id: 'wave-orange-money-integration',
    slug: 'integration-wave-orange-money-distributeurs',
    title: 'SMA Intègre Wave et Orange Money dans Tous ses Distributeurs',
    excerpt: 'Une révolution dans l\'accessibilité : nos machines acceptent désormais les paiements mobiles les plus populaires au Sénégal.',
    content: `<p>Nous sommes fiers d'annoncer que l'ensemble de notre parc de distributeurs automatiques est désormais équipé pour accepter les paiements via Wave et Orange Money. Cette intégration représente une avancée majeure dans notre mission de rendre nos services accessibles à tous les Sénégalais.</p>

<h2>Pourquoi cette intégration ?</h2>
<p>Au Sénégal, plus de 70% des transactions se font via mobile money. En intégrant Wave et Orange Money, nous permettons à nos clients de payer comme ils en ont l'habitude, sans avoir besoin d'espèces ou de carte bancaire.</p>

<h2>Comment ça marche ?</h2>
<p>Le processus est simple et rapide : sélectionnez votre produit, choisissez votre mode de paiement (Wave ou Orange Money), scannez le QR code ou suivez les instructions à l'écran, et récupérez votre produit. Le tout en moins de 30 secondes !</p>

<h2>Sécurité et fiabilité</h2>
<p>Toutes les transactions sont sécurisées et cryptées. En cas de problème, notre système de remboursement automatique garantit que vous ne perdez jamais votre argent.</p>`,
    category: 'innovations',
    date: '2024-03-15',
    author: 'Amadou Diop',
    authorRole: 'Directeur Général',
    readTime: '5 min',
    image: 'https://readdy.ai/api/search-image?query=modern%20african%20person%20using%20mobile%20payment%20on%20vending%20machine%2C%20smartphone%20scanning%20QR%20code%2C%20Wave%20Orange%20Money%20interface%2C%20contemporary%20Senegal%20urban%20setting%2C%20digital%20payment%20technology&width=800&height=500&seq=blog-payment-001&orientation=landscape'
  },
  {
    id: 'choisir-distributeur-entreprise',
    slug: 'comment-choisir-distributeur-automatique-entreprise',
    title: 'Comment Choisir le Bon Distributeur pour Votre Entreprise ?',
    excerpt: 'Guide complet pour sélectionner la machine adaptée à vos besoins : capacité, produits, espace et budget.',
    content: `<p>Choisir un distributeur automatique pour votre entreprise est un investissement important. Voici nos conseils pour faire le bon choix.</p>

<h2>1. Évaluez vos besoins</h2>
<p>Combien d'employés utilisent la machine ? Quels types de produits souhaitez-vous proposer ? Café uniquement, ou également snacks et boissons fraîches ? Ces questions détermineront la capacité et le type de machine nécessaire.</p>

<h2>2. L'espace disponible</h2>
<p>Mesurez l'espace où vous souhaitez installer la machine. Nos distributeurs compacts conviennent aux petits espaces, tandis que nos modèles combinés nécessitent plus de place mais offrent une plus grande variété.</p>

<h2>3. Le budget</h2>
<p>Nous proposons des solutions d'achat, de location et de mise à disposition gratuite selon le volume. Notre équipe commerciale vous aidera à trouver la formule la plus avantageuse.</p>

<h2>4. Les options de paiement</h2>
<p>Toutes nos machines acceptent Wave, Orange Money, espèces et cartes bancaires. Assurez-vous que les modes de paiement correspondent aux habitudes de vos employés.</p>`,
    category: 'conseils',
    date: '2024-03-10',
    author: 'Aïssatou Ba',
    authorRole: 'Responsable Commerciale',
    readTime: '7 min',
    image: 'https://readdy.ai/api/search-image?query=variety%20of%20modern%20vending%20machines%20in%20bright%20corporate%20office%20space%2C%20different%20sizes%20and%20models%2C%20professional%20business%20environment%2C%20clean%20contemporary%20design%2C%20Senegal%20workplace&width=800&height=500&seq=blog-choose-001&orientation=landscape'
  },
  {
    id: 'maintenance-distributeurs',
    slug: 'importance-maintenance-preventive-distributeurs',
    title: 'L\'Importance de la Maintenance Préventive',
    excerpt: 'Découvrez comment notre programme de maintenance garantit le bon fonctionnement de vos machines 24h/24.',
    content: `<p>La maintenance préventive est la clé pour assurer la disponibilité et la longévité de vos distributeurs automatiques. Chez SMA, nous avons développé un programme complet qui garantit un taux de disponibilité supérieur à 98%.</p>

<h2>Notre programme de maintenance</h2>
<p>Chaque machine bénéficie d'une visite mensuelle programmée. Nos techniciens vérifient tous les composants, nettoient l'intérieur et l'extérieur, testent les systèmes de paiement et s'assurent que tout fonctionne parfaitement.</p>

<h2>Intervention rapide en cas de panne</h2>
<p>Malgré la maintenance préventive, une panne peut toujours survenir. Notre engagement : intervention sous 24h partout à Dakar et dans les principales villes du Sénégal.</p>

<h2>Suivi en temps réel</h2>
<p>Nos machines connectées nous alertent automatiquement en cas de problème. Souvent, nous intervenons avant même que vous ne remarquiez le dysfonctionnement.</p>`,
    category: 'conseils',
    date: '2024-03-05',
    author: 'Moussa Ndiaye',
    authorRole: 'Responsable Technique',
    readTime: '6 min',
    image: 'https://readdy.ai/api/search-image?query=professional%20african%20technician%20maintaining%20vending%20machine%2C%20wearing%20uniform%2C%20using%20diagnostic%20tools%2C%20clean%20technical%20work%2C%20modern%20equipment%20maintenance%2C%20Senegal%20service%20quality&width=800&height=500&seq=blog-maintenance-001&orientation=landscape'
  },
  {
    id: 'temoignage-sonatel',
    slug: 'temoignage-client-sonatel-orange',
    title: 'Témoignage Client : Sonatel Orange Sénégal',
    excerpt: 'Comment SMA a équipé les 12 sites de Sonatel avec 25 distributeurs pour 2000 employés.',
    content: `<p>"Nous cherchions une solution pour offrir à nos 2000 employés répartis sur 12 sites un accès facile à des boissons et snacks de qualité. SMA nous a proposé une solution complète et parfaitement adaptée."</p>

<h2>Le défi</h2>
<p>Sonatel souhaitait améliorer le bien-être de ses employés en leur offrant un accès permanent à des produits de qualité, sans avoir à gérer les stocks ou la logistique.</p>

<h2>La solution SMA</h2>
<p>Nous avons installé 25 distributeurs répartis stratégiquement sur les 12 sites. Chaque machine propose café, boissons fraîches et snacks, avec paiement Wave, Orange Money et carte bancaire.</p>

<h2>Les résultats</h2>
<p>Après 6 mois, le taux de satisfaction des employés a augmenté de 35%. Les machines enregistrent plus de 500 transactions par jour, avec un taux de disponibilité de 99,2%.</p>

<p><strong>Mamadou Diallo, DRH Sonatel :</strong> "Le service SMA est impeccable. Les machines sont toujours approvisionnées, propres et fonctionnelles. Nos employés sont ravis !"</p>`,
    category: 'temoignages',
    date: '2024-02-28',
    author: 'Fatou Sall',
    authorRole: 'Directrice des Opérations',
    readTime: '5 min',
    image: 'https://readdy.ai/api/search-image?query=happy%20african%20office%20workers%20using%20modern%20vending%20machine%20in%20bright%20corporate%20break%20room%2C%20diverse%20team%2C%20professional%20workplace%2C%20satisfied%20employees%2C%20Senegal%20business%20environment&width=800&height=500&seq=blog-testimonial-001&orientation=landscape'
  },
  {
    id: 'nouveaux-produits-bio',
    slug: 'nouveaux-produits-bio-locaux-catalogue',
    title: 'Nouveaux Produits Bio et Locaux dans Notre Catalogue',
    excerpt: 'SMA enrichit son offre avec des produits biologiques et des marques sénégalaises pour soutenir l\'économie locale.',
    content: `<p>Dans notre engagement pour une alimentation plus saine et le soutien à l'économie locale, nous sommes fiers d'annoncer l'arrivée de nouveaux produits bio et de marques sénégalaises dans nos distributeurs.</p>

<h2>Les nouveaux produits</h2>
<p>Jus de fruits bio Kirène, barres énergétiques aux céréales locales, fruits secs du terroir sénégalais, café bio torréfié à Dakar... Notre catalogue s'enrichit de plus de 15 nouvelles références.</p>

<h2>Pourquoi le bio et le local ?</h2>
<p>Ces produits répondent à une demande croissante de nos clients pour une alimentation plus saine. Ils permettent également de soutenir les producteurs et transformateurs sénégalais.</p>

<h2>Disponibilité</h2>
<p>Ces nouveaux produits sont déjà disponibles dans 50% de nos machines et seront déployés sur l'ensemble du parc d'ici fin avril 2024.</p>`,
    category: 'actualites',
    date: '2024-02-20',
    author: 'Amadou Diop',
    authorRole: 'Directeur Général',
    readTime: '4 min',
    image: 'https://readdy.ai/api/search-image?query=organic%20healthy%20snacks%20and%20beverages%20display%2C%20fresh%20local%20Senegalese%20products%2C%20natural%20bio%20food%20packaging%2C%20colorful%20healthy%20options%2C%20sustainable%20local%20brands&width=800&height=500&seq=blog-bio-001&orientation=landscape'
  },
  {
    id: 'expansion-regions',
    slug: 'sma-expansion-regions-senegal',
    title: 'SMA S\'Étend dans les Régions du Sénégal',
    excerpt: 'Ouverture de nouveaux points de service à Saint-Louis, Thiès et Ziguinchor pour mieux vous servir.',
    content: `<p>Après notre succès à Dakar, nous sommes heureux d'annoncer notre expansion dans trois nouvelles régions du Sénégal : Saint-Louis, Thiès et Ziguinchor.</p>

<h2>Pourquoi cette expansion ?</h2>
<p>De nombreuses entreprises en région nous ont sollicités pour bénéficier de nos services. Cette expansion nous permet de répondre à cette demande et de rendre nos solutions accessibles à tout le Sénégal.</p>

<h2>Les nouveaux services</h2>
<p>Chaque région dispose désormais d'une équipe locale pour l'installation, la maintenance et le réapprovisionnement. Les délais d'intervention sont identiques à ceux de Dakar : 24h maximum.</p>

<h2>Opportunités d'emploi</h2>
<p>Cette expansion crée 15 nouveaux emplois locaux : techniciens, commerciaux et agents de réapprovisionnement. Les candidatures sont ouvertes sur notre site.</p>`,
    category: 'actualites',
    date: '2024-02-15',
    author: 'Fatou Sall',
    authorRole: 'Directrice des Opérations',
    readTime: '5 min',
    image: 'https://readdy.ai/api/search-image?query=map%20of%20Senegal%20with%20location%20markers%2C%20business%20expansion%20concept%2C%20regional%20development%2C%20modern%20logistics%20network%2C%20professional%20business%20growth%20illustration&width=800&height=500&seq=blog-expansion-001&orientation=landscape'
  }
];