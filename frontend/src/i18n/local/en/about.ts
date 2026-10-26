/**
 * English translations — "About us" page and 404 page.
 * Every key added here must also exist in `../fr/about.ts`.
 * Lists (tags, commitments) are read with `returnObjects: true`.
 */
export default {
  aboutPage: {
    eyebrow: 'About us',
    title: 'Agribusiness, automated retail and',
    titleAccent: 'digital technology',
    subtitle: 'SenMartALIM is modernising the food value chain in Africa and Canada, from farm production to smart retail.',

    missionEyebrow: 'Our mission',
    missionQuote: '“Putting technology to work for healthy, accessible and traceable food.”',
    missionText1: 'SMA is building an integrated ecosystem that runs from farm production to smart retail, with a strong focus on quality, traceability and social impact.',
    missionText2: 'We believe the future of the food industry lies in local innovation: building a bridge between African farmers and urban consumers through local processing, optimised logistics and modern distribution channels.',
    missionImageAlt: 'SEN Coffee vending machine installed in a workspace',

    activitiesEyebrow: 'What we do',
    activitiesTitle: 'The entire food',
    activitiesTitleAccent: 'value chain',
    activities: {
      distribution: {
        title: 'Automated retail and connected sales',
        text: 'Hot and cold drink machines, snacks and health products under the SenMartALIM brand. IoT integration, digital payment (Wave, Orange Money, PayPal), centralised cloud management and real-time sales traceability.',
        tags: ['Coffee and drinks', 'Healthy snacks', 'IoT and cloud', 'Digital payment'],
      },
      agrifood: {
        title: 'Food processing',
        text: 'Sourcing from farming cooperatives and local producers. Adding value to African products: coffee, cocoa, cereals, tropical fruit. Premium powders, health drinks, snacks made from dried fruit, nuts and local cereals.',
        tags: ['Coffee and cocoa', 'Local cereals', 'Dried fruit', 'Short supply chains'],
      },
      tech: {
        title: 'Technology and data',
        text: 'Microsoft Azure infrastructure to run our entire digital operation: payment APIs, transaction tracking, Azure Synapse Data Lake, Power BI dashboards. Data-driven decisions to optimise sales and logistics performance.',
        tags: ['Microsoft Azure', 'Power BI', 'Data Lake', 'Payment APIs'],
      },
      partnerships: {
        title: 'Partnerships and deployments',
        text: 'Deployed in high-traffic locations: hospitals (CHUP Pikine), schools, universities, public spaces and private companies. Two models: direct sale, or placement with revenue sharing.',
        tags: ['Hospitals', 'Universities', 'Companies', 'Public spaces'],
      },
    },

    missionShort: 'Putting technology to work for healthy, accessible and traceable food, creating local added value while supporting a circular economy.',
    visionEyebrow: 'Our vision',
    visionText: 'Expanding our network of connected vending machines in Canada and West Africa, and developing the SMA Connect mobile app for ordering, payment and loyalty.',
    commitmentsEyebrow: 'Our commitments',
    commitments: [
      'Quality and traceability of raw materials',
      'Support for local producers',
      'Continuous innovation in retail',
      'Social and environmental responsibility',
    ],

    innovationEyebrow: 'Innovation and impact',
    innovationTitle: 'Our innovation priorities for',
    innovationTitleAccent: 'lasting impact',
    impactLabel: 'Impact: {{impact}}',
    innovations: {
      digital: { axis: 'Digital retail', desc: 'Connected machines, cashless payments', impact: '24/7 availability' },
      local: { axis: 'Promoting local products', desc: 'African coffee, cocoa and cereal supply chains', impact: 'Higher farm incomes' },
      traceability: { axis: 'Traceability and data', desc: 'Sales tracking, quality, predictive maintenance', impact: 'Transparency and efficiency' },
      sustainability: { axis: 'Sustainability', desc: 'Less waste, eco-friendly packaging', impact: 'Lower carbon footprint' },
    },

    roadmapEyebrow: 'Outlook',
    roadmapTitle: 'Our roadmap',
    roadmapTitleAccent: 'for the years ahead',
    roadmap: {
      international: { title: 'International expansion', desc: 'Growing our network of connected vending machines in Canada and West Africa.' },
      app: { title: 'SMA Connect app', desc: 'A mobile app for ordering, payment and customer loyalty.' },
      supplyChain: { title: 'Integrated agri supply chain', desc: 'Farming and logistics partnerships for an end-to-end supply chain.' },
      ownBrand: { title: 'Own brand', desc: 'Launching a range of healthy drinks and snacks made from local produce.' },
    },

    ctaBadge: "Let's talk about your project",
    ctaTitle: 'Ready to equip your spaces?',
    ctaSubtitle: 'Contact our experts for a tailored assessment and a free quote within 24 hours.',
    ctaQuote: 'Request a quote',
    ctaCall: 'Call us',
  },

  notFound: {
    title: 'Page not found',
    hint: "The page you're looking for doesn't exist or has been moved.",
    home: 'Back to home',
    catalog: 'Browse machines',
  },
};
