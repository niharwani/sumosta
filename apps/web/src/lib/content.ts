import type { Product, Category, Review } from 'shared';

export interface ComboBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  image: string;
  products: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BatchCertificate {
  batchNo: string;
  testingDate: string;
  expiryDate: string;
  nablLab: string;
  certificateNo: string;
  parameters: {
    name: string;
    result: string;
    fssaiLimit: string;
    status: 'Pass' | 'Fail';
  }[];
}

export interface BrandContent {
  hook: {
    headline: string;
    subHeadline: string;
    body: string;
    promise: string;
  };
  visionMission: {
    vision: string;
    mission: string;
    objective: string;
  };
  philosophy: {
    title: string;
    subtitle: string;
    description: string;
    beliefs: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  story: {
    title: string;
    subtitle: string;
    paragraphs: string[];
  };
  whyChooseUs: {
    title: string;
    subtitle: string;
    pillars: {
      title: string;
      short: string;
      details: string;
      icon: string;
    }[];
  };
  evidenceHub: {
    headline: string;
    body: string;
    standard: string;
    features: {
      title: string;
      desc: string;
      icon: string;
    }[];
  };
  connect: {
    headline: string;
    address: string;
    pob: string;
    whatsapp: string;
    hours: string;
    email: string;
  };
}

export const BRAND_CONTENT: BrandContent = {
  hook: {
    headline: "Indulgence ≠ Guilt",
    subHeadline: "SUMOSTA: Indulgence that cares.",
    body: "For too long, we’ve been told that to take care of our bodies, we must give up joy, convenience, and flavor. We call bluffs on that. At SUMOSTA, we build on a simple belief: the best kind of indulgence is the one that looks out for you. Whether it’s a working professional, a homemaker, or a family, SUMOSTA enables a “no-compromise” lifestyle — where choosing better becomes instinctive. Whether it is a morning ritual of vibrant wellness, a mid-day pause during a high-stress boardroom hustle, or a soothing wind-down before bed, we transform small, consistent daily choices into powerful acts of self-care. We also believe sweetness should do more than delight. That's why we're reintroducing raw, unprocessed, single-origin honeys from India's pristine forests — not as something you reach for only when you're unwell, but as a delicious daily indulgence that cares.",
    promise: "Zero refined sugars. Zero filler chemicals. 100% pure, nutrient-dense joy. Because looking after yourself should be the highlight of your day, not a chore."
  },
  visionMission: {
    vision: "To inspire a world where 'Indulgence that cares' becomes a way of everyday living.",
    mission: "To create thoughtfully crafted products that transform everyday moments into simple rituals, where indulgence and wellness naturally come together.",
    objective: "SUMOSTA aims to become a household name synonymous with trust, taste, and conscious living — transforming how India consumes sweetness, nourishment, and indulgence."
  },
  philosophy: {
    title: "Inspired by the Sumo. Guided by Timeless Values.",
    subtitle: "Most people see a Sumo. We see a mindset.",
    description: "Behind every Sumo lies a timeless mindset built on balance, discipline, patience, resilience, and inner strength. Their power doesn't come from extremes—it comes from consistency. Every movement has purpose. Every routine builds resilience. Every ritual shapes lasting strength. That mindset inspires SUMOSTA. We believe wellbeing isn't created through restriction or perfection. It grows through simple choices made consistently, products crafted thoughtfully, and everyday moments that nourish both body and mind.",
    beliefs: [
      {
        title: "Wellness should be enjoyable",
        description: "It should never feel like a compromise or a strict chore.",
        icon: "🌿"
      },
      {
        title: "Small daily rituals create lasting wellbeing",
        description: "Consistency over intensity is what shapes lasting strength.",
        icon: "⏳"
      },
      {
        title: "Nature, in its most authentic form, knows best",
        description: "No heavy machinery or blending vats, just nature untouched.",
        icon: "🍃"
      },
      {
        title: "Balance is more powerful than extremes",
        description: "True health lies in harmony, avoiding joyless dietary restrictions.",
        icon: "⚖️"
      },
      {
        title: "Every indulgence is an act of care",
        description: "Sweetness can satisfy senses while actively delivering wellness.",
        icon: "❤️"
      }
    ]
  },
  story: {
    title: "Born from the Hustle. Perfected by Nature.",
    subtitle: "Like most modern stories, ours started with a frantic schedule and a simple craving.",
    paragraphs: [
      "As Founders, navigating the high-speed, high-stress demands of modern life, we found ourselves trapped in a daily paradox. At 3:00 PM, in the middle of a packed workday, our bodies would scream for comfort—a spoonful of something sweet, a moment of indulgence to pause and reset. But every \"healthy\" option on the shelf tasted like cardboard, and every delicious option was packed with hidden refined sugars, palm oils, and chemical preservatives.",
      "We asked ourselves: When did taking care of our bodies become so joyless? And when did treating ourselves become so guilt-ridden? These questions became the beginning of SUMOSTA.",
      "Instead of chasing trends or creating another \"better-for-you\" product, we went back to something far more timeless: nature. We traveled to remote, untamed landscapes & pristine forests and sought out raw, authentic, single-source honeys - untouched by heavy machinery or blending vats.",
      "Along the way, we found inspiration in an unexpected place - the timeless mindset of the Sumo. Not the stereotype of size, but the mastery behind it. A philosophy rooted in balance, patience, consistency, and inner-strength. It reminded us that lasting wellbeing isn't built through extremes. It's built through simple rituals practiced every day.",
      "SUMOSTA was born out of that obsession. From raw, authentic, single-origin honey to thoughtfully crafted wellness products, every SUMOSTA creation is designed to transform an ordinary moment into something that feels both joyful and nourishing. We did the hard work of sourcing and perfecting the ingredients so you can focus entirely on the joy of the indulgence that cares."
    ]
  },
  whyChooseUs: {
    title: "The Sweet Spot between Radical Purity and Pure Joy.",
    subtitle: "Most brands ask you to choose: prioritize your health and endure cardboard flavors, or give in to indulgence and accept the guilt. We built SUMOSTA because we refuse to accept that compromise.",
    pillars: [
      {
        title: "Indulgence Meets Care",
        short: "The Zero-Compromise Formula.",
        details: "We don't believe in trading joy for wellness. Our products are crafted to satisfy your deepest sensory cravings while actively delivering functional health benefits. It is premium self-care that tastes like a treat.",
        icon: "✨"
      },
      {
        title: "Radical Transparency",
        short: "Proof Over Promises.",
        details: "We don't expect you to just take our word for it. Every single batch of our honey comes with an open book policy. Right on our website, you can view the actual NABL Lab Test Reports and official COAs (Certificates of Analysis). From moisture levels to purity scores, we lay it all bare because true care requires absolute honesty.",
        icon: "🔬"
      },
      {
        title: "Certified NPOP APEDA Organic",
        short: "Beyond Just \"Natural\".",
        details: "Our Wild forest honey curated honey isn't just \"natural\" (a buzzword anyone can use). They are strictly certified under the National Programme for Organic Production (NPOP) by APEDA. This guarantees that from the untamed micro-regions where our bees forage to the jar on your dining table, no chemical pesticides, synthetic fertilizers, or toxins ever touch our products.",
        icon: "🛡️"
      },
      {
        title: "Nutrient-Dense Fueling",
        short: "The Sumo Mindset.",
        details: "We are completely rewriting the old diet playbook. SUMOSTA is built on the Sumo philosophy of intentional, powerful nourishment. We don’t obsess over empty \"zero-calorie\" restrictions; we focus on what we can give your body—raw enzymes, clean antioxidants, and healthy fats that help you conquer high-stress daily challenges without ever using refined sugars, palm oils, or cheap fillers.",
        icon: "💪"
      }
    ]
  },
  evidenceHub: {
    headline: "In a world of marketing claims, we choose scientific proof.",
    body: "The honey industry is filled with secrets—industrial heat-processing that kills live enzymes, mass-blending, and hidden sugar syrups. We chose a different path. We don't just tell you our honey is pure, raw, and organic. We prove it. Every SKU we launch is backed by verifiable data that you can access anytime.",
    standard: "The SUMOSTA Standard: If we can’t prove its purity in a lab, it doesn’t make it to your kitchen.",
    features: [
      {
        title: "Batch-Wise COAs",
        desc: "Verify the exact chemical profile and purity markers of your specific batch.",
        icon: "📜"
      },
      {
        title: "Government-Accredited Lab Reports",
        desc: "View independent laboratory breakdowns confirming zero adulteration.",
        icon: "🏢"
      },
      {
        title: "Gold-Standard Certification",
        desc: "Direct traceability verified under India's strict NPOP APEDA organic frameworks.",
        icon: "🥇"
      }
    ]
  },
  connect: {
    headline: "From raw, un-processed forest honeys, ultra-premium rare stingless bee honey to corporate gifting or B2B tie-ups – our team is here to help",
    address: "Yatris NutriFoods Pvt Ltd\nRegistered Address:\n603, Om Residency, Murar Road, Mulund West, Mumbai, Maharashtra, India, 400080",
    pob: "Additional POB:\nOffice no.6, Lalji Ramji Building, Bhat Bazar, Chinch Bunder, Mandvi, Mumbai – 400009.",
    whatsapp: "+91 9137881791",
    hours: "From 10 am to 7 pm",
    email: "hello@sumosta.com"
  }
};

export const STATIC_CATEGORIES: Record<string, Category> = {
  'raw-honey': {
    id: 'cat_raw_honey',
    name: 'Raw Forest Honey',
    slug: 'raw-honey',
    description: 'Pure, raw, unpasteurized forest honeys sourced from protected reserves across India.',
    imageUrl: null,
    sortOrder: 1
  },
  'superfoods': {
    id: 'cat_superfoods',
    name: 'Proprietary Superfoods',
    slug: 'superfoods',
    description: 'Nutrient-rich, functional superfood honey infusions curated for daily wellness.',
    imageUrl: null,
    sortOrder: 2
  },
  'spreads': {
    id: 'cat_spreads',
    name: 'Nuts & Seeds Spreads',
    slug: 'spreads',
    description: 'Creamy, high-protein nuts & seeds spreads naturally sweetened with honey & jaggery.',
    imageUrl: null,
    sortOrder: 3
  },
  'honey-nuts': {
    id: 'cat_honey_nuts',
    name: 'Honey Soaked Nuts',
    slug: 'honey-nuts',
    description: 'Premium organic nuts slow-soaked in raw single-origin forest honey.',
    imageUrl: null,
    sortOrder: 4
  }
};

export const MOCK_CERTIFICATES: Record<string, BatchCertificate> = {
  'wild-forest': {
    batchNo: 'SMS-WF-009',
    testingDate: '2026-05-14',
    expiryDate: '2028-05-13',
    nablLab: 'NABL Accredited Food Diagnostics Labs, Mumbai',
    certificateNo: 'TC-998811',
    parameters: [
      { name: 'Moisture Content', result: '17.4%', fssaiLimit: 'Max 20%', status: 'Pass' },
      { name: 'HMF (Freshness Marker)', result: '11.8 mg/kg', fssaiLimit: 'Max 80 mg/kg', status: 'Pass' },
      { name: 'Fructose/Glucose Ratio', result: '1.24', fssaiLimit: 'Min 1.0', status: 'Pass' },
      { name: 'Sucrose Content', result: '1.4%', fssaiLimit: 'Max 5.0%', status: 'Pass' },
      { name: 'Pollen Count', result: '48,000 grains/g', fssaiLimit: 'Min 25,000 grains/g', status: 'Pass' },
      { name: 'C3/C4 Sugar Syrups', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' },
      { name: 'Pesticides & Antibiotics', result: 'Not Detected (LOD < 0.01)', fssaiLimit: 'Absent', status: 'Pass' }
    ]
  },
  'stingless': {
    batchNo: 'SMS-STB-002',
    testingDate: '2026-06-02',
    expiryDate: '2029-06-01',
    nablLab: 'NABL Center for Bio-Chemical Testing, Kohima',
    certificateNo: 'TC-998902',
    parameters: [
      { name: 'Moisture Content', result: '24.2%', fssaiLimit: 'Max 30% (Stingless Special)', status: 'Pass' },
      { name: 'HMF (Freshness Marker)', result: '8.4 mg/kg', fssaiLimit: 'Max 80 mg/kg', status: 'Pass' },
      { name: 'Fructose/Glucose Ratio', result: '1.38', fssaiLimit: 'Min 1.0', status: 'Pass' },
      { name: 'Acidity (High Medicinal)', result: '38 meq/kg', fssaiLimit: 'Max 80 meq/kg', status: 'Pass' },
      { name: 'Diastase Activity', result: '18.9 Gothe Unit', fssaiLimit: 'Min 3 Gothe Unit', status: 'Pass' },
      { name: 'C3/C4 Sugar Syrups', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' },
      { name: 'Pesticides & Antibiotics', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' }
    ]
  },
  'tribal': {
    batchNo: 'SMS-TRF-015',
    testingDate: '2026-04-20',
    expiryDate: '2028-04-19',
    nablLab: 'NABL Regional Analytical Lab, Bhubaneswar',
    certificateNo: 'TC-998744',
    parameters: [
      { name: 'Moisture Content', result: '18.1%', fssaiLimit: 'Max 20%', status: 'Pass' },
      { name: 'HMF (Freshness Marker)', result: '14.2 mg/kg', fssaiLimit: 'Max 80 mg/kg', status: 'Pass' },
      { name: 'Fructose/Glucose Ratio', result: '1.18', fssaiLimit: 'Min 1.0', status: 'Pass' },
      { name: 'Sucrose Content', result: '1.9%', fssaiLimit: 'Max 5.0%', status: 'Pass' },
      { name: 'C3/C4 Sugar Syrups', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' },
      { name: 'Pesticides & Antibiotics', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' }
    ]
  },
  'honeydew': {
    batchNo: 'SMS-HDW-004',
    testingDate: '2026-05-28',
    expiryDate: '2028-05-27',
    nablLab: 'NABL Quality Lab, Ranchi',
    certificateNo: 'TC-998890',
    parameters: [
      { name: 'Moisture Content', result: '16.8%', fssaiLimit: 'Max 20%', status: 'Pass' },
      { name: 'HMF (Freshness Marker)', result: '16.5 mg/kg', fssaiLimit: 'Max 80 mg/kg', status: 'Pass' },
      { name: 'Electrical Conductivity', result: '0.95 mS/cm', fssaiLimit: 'Min 0.8 mS/cm (Dew Standard)', status: 'Pass' },
      { name: 'Sucrose Content', result: '2.1%', fssaiLimit: 'Max 10% (Dew Special)', status: 'Pass' },
      { name: 'C3/C4 Sugar Syrups', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' },
      { name: 'Pesticides & Antibiotics', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' }
    ]
  },
  'raktbeej': {
    batchNo: 'SMS-RKB-001',
    testingDate: '2026-06-10',
    expiryDate: '2028-06-09',
    nablLab: 'NABL Analytical Diagnostics, Raipur',
    certificateNo: 'TC-999012',
    parameters: [
      { name: 'Moisture Content', result: '17.9%', fssaiLimit: 'Max 20%', status: 'Pass' },
      { name: 'HMF (Freshness Marker)', result: '9.5 mg/kg', fssaiLimit: 'Max 80 mg/kg', status: 'Pass' },
      { name: 'Fructose/Glucose Ratio', result: '1.28', fssaiLimit: 'Min 1.0', status: 'Pass' },
      { name: 'Sucrose Content', result: '0.8%', fssaiLimit: 'Max 5.0%', status: 'Pass' },
      { name: 'Antioxidant Profile (ORAC)', result: 'High (Phenolic rich)', fssaiLimit: 'Trace', status: 'Pass' },
      { name: 'C3/C4 Sugar Syrups', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' },
      { name: 'Pesticides & Antibiotics', result: 'Not Detected', fssaiLimit: 'Absent', status: 'Pass' }
    ]
  }
};

export const STATIC_PRODUCTS: (Product & {
  comingSoon?: boolean;
  sourcingStory?: string;
  nutritionalBenefits?: string[];
  batchCertificate?: BatchCertificate;
  sourcingHighlights?: {
    forestName: string;
    location: string;
    harvestedBy: string;
    beeSpecies: string;
  };
  faqs?: {
    question: string;
    answer: string;
  }[];
})[] = [
  {
    id: 'prod_wf_honey_500',
    name: 'Organic Wild Forest Honey',
    slug: 'organic-certified-wild-forest-honey',
    sku: 'SM-WF-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: '100% NPOP APEDA Certified Organic wild forest honey. Rich in antioxidants, collected by local gatherers.',
    description: 'Sourced from the deep, protected reserves of central India, this honey is NPOP APEDA certified organic. Bees forage on clean, pesticide-free wildflowers, resulting in a dark, medicinal honey containing rich concentrations of trace minerals, active enzymes, and natural pollens. It is cold-filtered to retain its healing properties, delivering a robust woody sweetness with notes of wildflowers.',
    sourcingStory: 'Foraged from remote deciduous forests, the honeycombs are sustainably harvested by native tribal communities. We pay a fair wage, protecting the forest ecosystem and helping local families thrive.',
    nutritionalBenefits: [
      'NPOP APEDA Organic certified, ensuring zero pesticides or synthetic chemicals.',
      'Extremely high in polyphenols and antioxidants to bolster immune health.',
      'Acts as a natural remedy for throat irritation, coughs, and seasonal allergies.',
      'Rich in active enzymes that aid digestive wellness.'
    ],
    price: 499,
    compareAtPrice: 599,
    costPrice: 220,
    stock: 120,
    lowStockThreshold: 10,
    weight: 500,
    tags: ['raw', 'organic', 'wild-forest', 'apeda', 'npop'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Organic Wild Forest Honey | SUMOSTA',
    metaDescription: 'Buy 100% pure NPOP APEDA certified organic wild forest honey. Sourced sustainably, rich in medicinal benefits.',
    images: [
      { id: 'img_wf_1', url: '/images/products/wild-forest-1.png', altText: 'Organic Certified Wild Forest Honey Jar', sortOrder: 1, isPrimary: true },
      { id: 'img_wf_2', url: '/images/products/wild-forest-2.png', altText: 'Forest Sourcing Honey', sortOrder: 2, isPrimary: false }
    ],
    variants: [
      { id: 'var_wf_250g', name: '250g Glass Jar', sku: 'SM-WF-250', priceAdjust: -200, stock: 50 },
      { id: 'var_wf_500g', name: '500g Glass Jar', sku: 'SM-WF-500', priceAdjust: 0, stock: 100 }
    ],
    averageRating: 4.8,
    reviewCount: 43,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    batchCertificate: MOCK_CERTIFICATES['wild-forest'],
    sourcingHighlights: {
      forestName: 'Central India Deciduous Forests',
      location: 'Madhya Pradesh & Chhattisgarh, India',
      harvestedBy: 'Local Tribal Gatherers',
      beeSpecies: 'Apis dorsata (Giant Rock Bees)'
    },
    faqs: [
      {
        question: 'What makes SUMOSTA\'s Organic Wild Forest Honey organic?',
        answer: 'It is harvested from deep, protected forest tracts where wild bees forage exclusively on naturally occurring wildflower flora. It is certified organic under the NPOP APEDA framework, ensuring zero pesticide, chemical, or antibiotic residue.'
      },
      {
        question: 'What is the taste profile of this honey?',
        answer: 'It features a rich, robust woody sweetness with complex floral notes and a smooth, thick texture.'
      }
    ]
  },
  {
    id: 'prod_stingless_250',
    name: 'Stingless Bee Honey',
    slug: 'stingless-bee-honey',
    sku: 'SM-STB-250',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Ultra-rare, high-medicinal stingless bee honey. Tangy, dark amber, harvested from the hills of Nagaland.',
    description: 'Known locally as Melipona honey, this is the holy grail of medicinal honeys. Stingless bees (Dammer bees) are tiny, feeding on smaller medicinal flowers that larger bees cannot reach. The honey has a distinct, sour-tangy flavor due to natural fermentation inside the bee propolis cells. It has 10x the antioxidant density of standard honey and is highly prized for eye, skin, and respiratory healing.',
    sourcingStory: 'Harvested in the pristine, chemical-free mountain forests of Nagaland by indigenous Angami tribe families. Since stingless bees produce less than 500g of honey per hive annually, this batch is extremely limited.',
    nutritionalBenefits: [
      'High propolis content gives it superior antibacterial and anti-inflammatory power.',
      'Distinct tangy-sour profile full of beneficial organic acids and enzymes.',
      'Prized in traditional medicine for wound healing and respiratory relief.',
      'Contains rare complex sugars with low glycemic index.'
    ],
    price: 1299,
    compareAtPrice: 1499,
    costPrice: 600,
    stock: 25,
    lowStockThreshold: 5,
    weight: 250,
    tags: ['rare', 'stingless-bee', 'nagaland', 'medicinal', 'tangy'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Stingless Bee Honey from Nagaland | SUMOSTA',
    metaDescription: 'Discover the medicinal power of rare Stingless Bee Honey sourced from Nagaland. Highly antimicrobial, rich and tangy.',
    images: [
      { id: 'img_st_1', url: '/images/products/stingless-1.png', altText: 'Stingless Bee Honey Jar', sortOrder: 1, isPrimary: true },
      { id: 'img_st_2', url: '/images/products/stingless-2.png', altText: 'Small Stingless Bee Hives', sortOrder: 2, isPrimary: false }
    ],
    variants: [
      { id: 'var_st_250g', name: '250g Glass Jar', sku: 'SM-STB-250', priceAdjust: 0, stock: 15 },
      { id: 'var_st_500g', name: '500g Glass Jar', sku: 'SM-STB-500', priceAdjust: 1100, stock: 10 }
    ],
    averageRating: 4.9,
    reviewCount: 18,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    batchCertificate: MOCK_CERTIFICATES['stingless'],
    sourcingHighlights: {
      forestName: 'Pristine Mountain Forest Blocks',
      location: 'Nagaland, India',
      harvestedBy: 'Indigenous Angami Tribe',
      beeSpecies: 'Meliponini (Stingless Dammer Bees)'
    },
    faqs: [
      {
        question: 'Why is Stingless Bee Honey sour-tangy?',
        answer: 'Stingless bees store their honey in pots made of propolis (bee glue) rather than wax. This leads to a slow natural fermentation that gives the honey a unique tartness and increases its organic acid profile.'
      },
      {
        question: 'Why is this honey so expensive compared to others?',
        answer: 'Stingless bees are tiny and produce very little honey. A single hive produces less than 500g of honey annually, and harvesting it from deep forest hollows is highly labor-intensive, making it a rare medicinal superfood.'
      }
    ]
  },
  {
    id: 'prod_tribal_500',
    name: 'Tribal Forest Honey',
    slug: 'tribal-forest-honey',
    sku: 'SM-TF-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Wild multi-floral honey sourced from the protected Kandhamal reserve. Sweet, earthy, and 100% natural.',
    description: 'Sourced from the deep biosphere of Kandhamal in Odisha, this tribal honey is collected from the wild hives of Apis dorsata (giant rock bees). The bees feed on native sal, mahua, and neem trees, imparting a thick, deep-golden body and an earthy, dark-caramel taste. Completely raw, unfiltered, and packed with bioactive compounds.',
    sourcingStory: 'Gathered by the Kondh tribe of Odisha using traditional, smoke-free collection methods that do not harm the wild colony. This honey provides an essential livelihood to forest dwellers.',
    nutritionalBenefits: [
      '100% wild multi-floral blend reflecting the rich herbal flora of Kandhamal.',
      'Deep, earthy caramel taste rich in minerals like potassium, magnesium, and iron.',
      'Raw, unheated processing protects delicate pollen and digestive enzymes.',
      'Sustainably sourced, supporting forest tribal communities.'
    ],
    price: 549,
    compareAtPrice: 649,
    costPrice: 240,
    stock: 80,
    lowStockThreshold: 10,
    weight: 500,
    tags: ['raw', 'tribal', 'kandhamal', 'multi-floral', 'earthy'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Tribal Forest Honey (Kandhamal Odisha) | SUMOSTA',
    metaDescription: 'Authentic wild forest honey from Kandhamal forests, Odisha. Hand-harvested by local tribes, raw and pure.',
    images: [
      { id: 'img_tb_1', url: '/images/products/tribal-1.png', altText: 'Tribal Forest Honey Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [
      { id: 'var_tb_250g', name: '250g Glass Jar', sku: 'SM-TF-250', priceAdjust: -220, stock: 40 },
      { id: 'var_tb_500g', name: '500g Glass Jar', sku: 'SM-TF-500', priceAdjust: 0, stock: 40 }
    ],
    averageRating: 4.7,
    reviewCount: 31,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    batchCertificate: MOCK_CERTIFICATES['tribal'],
    sourcingHighlights: {
      forestName: 'Kandhamal Forest Reserves',
      location: 'Odisha, India',
      harvestedBy: 'Kondha Tribe',
      beeSpecies: 'Apis dorsata (Giant Rock Bees)'
    },
    faqs: [
      {
        question: 'Which flora do the bees forage on for Tribal Forest Honey?',
        answer: 'The giant rock bees forage on diverse wild flora inside the Kandhamal biosphere, including mahua, neem, sal, and wild berries, giving it a unique mineral-rich multi-floral profile.'
      },
      {
        question: 'How is this honey harvested sustainably?',
        answer: 'It is hand-gathered by the Kondha tribe using traditional, smoke-free climbing methods that extract the honey without destroying the wild hives or harming the bee populations.'
      }
    ]
  },
  {
    id: 'prod_honeydew_500',
    name: 'HoneyDew Honey',
    slug: 'honeydew-honey',
    sku: 'SM-HD-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Rare, dark, mineral-rich HoneyDew honey from the massive Sal forests of Saranda. Deep woody flavor.',
    description: 'Unlike blossom honey, HoneyDew honey is made by bees collecting sap secretions rather than flower nectar. Sourced from the dense Sal reserve of Saranda, Jharkhand, this honey is extremely dark, almost black. It is less acidic, crystallization-resistant, and possesses a robust woody flavor, rich with malty undertones. It features a superior profile of minerals, antioxidants, and oligosaccharides.',
    sourcingStory: 'Harvested from the wild depths of the Saranda Forest—the largest Sal forest in Asia. Traditional climbers scale forest canopies at night, collecting this slow-drip forest gold.',
    nutritionalBenefits: [
      'Rich in prebiotics (oligosaccharides) that actively nourish beneficial gut microflora.',
      'Contains higher levels of iron, magnesium, and copper than standard honeys.',
      'Higher electrical conductivity and mineral salts, highly supportive of physical recovery.',
      'Highly resistant to crystallization, maintaining a smooth liquid state naturally.'
    ],
    price: 599,
    compareAtPrice: 699,
    costPrice: 260,
    stock: 45,
    lowStockThreshold: 5,
    weight: 500,
    tags: ['raw', 'honeydew', 'saranda', 'woody', 'mineral-rich'],
    isFeatured: false,
    isActive: true,
    metaTitle: 'Saranda Forest HoneyDew Honey | SUMOSTA',
    metaDescription: 'Indulge in rare, dark HoneyDew Honey from the Sal forests of Saranda, Jharkhand. Extremely rich in minerals and prebiotics.',
    images: [
      { id: 'img_hd_1', url: '/images/products/honeydew-1.png', altText: 'Saranda HoneyDew Honey Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [
      { id: 'var_hd_250g', name: '250g Glass Jar', sku: 'SM-HD-250', priceAdjust: -250, stock: 25 },
      { id: 'var_hd_500g', name: '500g Glass Jar', sku: 'SM-HD-500', priceAdjust: 0, stock: 20 }
    ],
    averageRating: 4.6,
    reviewCount: 22,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    batchCertificate: MOCK_CERTIFICATES['honeydew'],
    sourcingHighlights: {
      forestName: 'Saranda Forest Reserve (Asia\'s Largest Sal Forest)',
      location: 'Jharkhand, India',
      harvestedBy: 'Native Ho & Munda Tribes',
      beeSpecies: 'Apis dorsata (Giant Rock Bees)'
    },
    faqs: [
      {
        question: 'What is HoneyDew Honey and how is it different from blossom honey?',
        answer: 'Unlike blossom honey made from flower nectar, HoneyDew honey is produced when bees collect mineral-rich sap secretions from ancient trees, particularly Sal and Oak trees, in deep forest canopies.'
      },
      {
        question: 'Why does HoneyDew Honey resist crystallization?',
        answer: 'It has a naturally high concentration of complex sugars (oligosaccharides) and low glucose-to-fructose ratio, which keeps it in a smooth, dark liquid state for much longer.'
      }
    ]
  },
  {
    id: 'prod_raktbeej_500',
    name: 'Raktbeej Honey',
    slug: 'raktbeej-honey',
    sku: 'SM-RB-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Blood-red, therapeutic wild honey from the mysterious Abujhmarh reserves. High iron & antioxidants.',
    description: 'Harvested in the isolated, highly biodiverse forests of Abujhmarh in Chhatisgarh, Raktbeej honey has a dark, reddish-amber hue. Bees forage on iron-rich herbal flora and red silk cotton flowers. This honey is prized for its high bio-available iron content, making it an excellent natural blood tonic. Warm, spicy finish with a thick, velvety texture.',
    sourcingStory: 'Abujhmarh is a highly protected forest block. The honey is collected in small quantities by indigenous tribes who preserve the forest as sacred ground. Fully traceable and completely rare.',
    nutritionalBenefits: [
      'Distinct red-amber color signifying high iron content and organic anthocyanins.',
      'Acts as a natural hematinic, supporting red blood cell generation.',
      'High anti-inflammatory capacity due to native forest herbal pollens.',
      'Spicy, warming digestive aid.'
    ],
    price: 699,
    compareAtPrice: 799,
    costPrice: 320,
    stock: 35,
    lowStockThreshold: 5,
    weight: 500,
    tags: ['raw', 'raktbeej', 'abujhmarh', 'red-honey', 'therapeutic'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Raktbeej Wild Red Honey | SUMOSTA',
    metaDescription: 'Taste the therapeutic Raktbeej Honey from Abujhmarh Forest. Rich in iron, deep red-amber color, harvested wild.',
    images: [
      { id: 'img_rk_1', url: '/images/products/raktbeej-1.png', altText: 'Raktbeej Red Honey Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [
      { id: 'var_rb_250g', name: '250g Glass Jar', sku: 'SM-RB-250', priceAdjust: -300, stock: 25 },
      { id: 'var_rb_500g', name: '500g Glass Jar', sku: 'SM-RB-500', priceAdjust: 0, stock: 10 }
    ],
    averageRating: 4.9,
    reviewCount: 14,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    batchCertificate: MOCK_CERTIFICATES['raktbeej'],
    sourcingHighlights: {
      forestName: 'Abujhmarh Forest Blocks (Protected Reserve)',
      location: 'Chhattisgarh, India',
      harvestedBy: 'Indigenous Madia & Muria Gonds',
      beeSpecies: 'Apis dorsata (Giant Rock Bees) foraging on red silk cotton flowers and iron-rich herbal flora'
    },
    faqs: [
      {
        question: 'What gives Raktbeej Honey its unique dark red-amber hue?',
        answer: 'The giant wild bees in the Abujhmarh reserve forage on iron-rich forest flora and the bright blossoms of the Red Silk Cotton (Semal) tree, imparting its signature deep red-amber color.'
      },
      {
        question: 'What are the primary health benefits of Raktbeej Honey?',
        answer: 'Due to the iron-dense nectar and natural anthocyanins, it acts as a powerful natural blood tonic, helping support red blood cell generation, oxygen transport, and overall physical vitality.'
      },
      {
        question: 'Where is Raktbeej Honey sourced from?',
        answer: 'It is harvested in highly limited quantities from the isolated and ecologically protected Abujhmarh forest blocks in Chhattisgarh by indigenous Gond gatherers.'
      }
    ]
  },
  {
    id: 'prod_trial_box_60g',
    name: '5 Elements Trial Box',
    slug: '5-elements-trial-box',
    sku: 'SM-TB-5x60',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Experience the ultimate collection of all 5 SUMOSTA forest honeys in mini 60g glass jars.',
    description: 'Experience the ultimate collection of all 5 SUMOSTA forest honeys in mini 60g glass jars. Features Organic Wild Forest, Stingless Bee, Tribal Forest, HoneyDew, and Raktbeej honeys in a beautiful custom secondary box packaging. The perfect way to find your favorite blend before committing to larger sizes.',
    sourcingStory: 'Contains a curated selection of all 5 single-origin raw honeys, sourced directly from untouched Indian wilderness blocks in partnership with native tribes.',
    nutritionalBenefits: [
      'Perfect sampler containing all 5 distinct forest honey varieties.',
      'Small 60g jars, ideal for finding your preferred taste profile.',
      'Packaged in a premium custom box, excellent for gifting.'
    ],
    price: 699,
    compareAtPrice: 899,
    costPrice: 300,
    stock: 50,
    lowStockThreshold: 5,
    weight: 300,
    tags: ['raw', 'trial-box', 'gifting', 'sample-pack', '5-elements'],
    isFeatured: true,
    isActive: true,
    metaTitle: '5 Elements Trial Box (60g Jars) | SUMOSTA',
    metaDescription: 'Try all 5 premium wild forest honeys from SUMOSTA. Includes Organic Wild Forest, Stingless Bee, Tribal Forest, HoneyDew, and Raktbeej in 60g sample sizes.',
    images: [
      { id: 'img_tb_box_1', url: '/images/products/combo-trialbox.png', altText: '5 Elements Trial Box', sortOrder: 1, isPrimary: true }
    ],
    variants: [],
    averageRating: 4.8,
    reviewCount: 5,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    sourcingHighlights: {
      forestName: 'Sourced from 5 Indigenous Forests',
      location: 'Pan-India Tribal Reserves',
      harvestedBy: 'Multi-Tribal Gatherers',
      beeSpecies: 'Apis dorsata & Meliponini'
    },
    faqs: [
      {
        question: 'What is included in the 5 Elements Trial Box?',
        answer: 'The box contains 5 glass jars (60g each), representing our complete range: Organic Wild Forest Honey, Stingless Bee Honey, Tribal Forest Honey, HoneyDew Honey, and Raktbeej Honey.'
      },
      {
        question: 'Is this trial box suitable for gifting?',
        answer: 'Yes, it is beautifully packaged in a custom secondary carton, making it an excellent premium gift for wellness enthusiasts.'
      }
    ]
  },

  // FUTURE PRODUCTS (Coming Soon)
  {
    id: 'prod_moringa_velvet',
    name: 'Moringa Green Velvet (Superfood)',
    slug: 'moringa-green-velvet',
    sku: 'SM-FC-MOR',
    categoryId: 'cat_superfoods',
    category: STATIC_CATEGORIES['superfoods'],
    shortDescription: 'Active raw honey whipped with bio-active organic Moringa oleifera green leaf extract. Coming soon.',
    description: 'Moringa Green Velvet is an upcoming premium superfood infusion. We slowly whip raw forest honey with organic, cold-dried Moringa leaf extract, creating a creamy green velvet honey. Packed with plant proteins, calcium, vitamins, and antioxidants, it provides a green energy boost without any grassy bitterness.',
    sourcingStory: 'Moringa leaves are sourced from organic farms in southern India and blended at room temperature to preserve raw honey enzymes and Moringa vitamins.',
    nutritionalBenefits: [
      'Rich in vitamins A, C, E, and calcium for bone health.',
      'Offers a natural plant-based energy boost.',
      'High in chlorophyll and amino acids.'
    ],
    price: 499,
    compareAtPrice: null,
    costPrice: null,
    stock: 0,
    lowStockThreshold: 0,
    weight: 250,
    tags: ['superfood', 'moringa', 'green-honey', 'infusion'],
    isFeatured: false,
    isActive: false,
    comingSoon: true,
    metaTitle: 'Moringa Green Velvet Honey Infusion | SUMOSTA',
    metaDescription: 'Coming Soon: Moringa Green Velvet. A premium wellness blend of raw forest honey and organic Moringa superfood.',
    images: [
      { id: 'img_mor_1', url: '/images/products/moringa-placeholder.svg', altText: 'Moringa Green Velvet Mock Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [],
    averageRating: 0,
    reviewCount: 0,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'prod_golden_latte',
    name: 'Royal Golden Latte (Superfood)',
    slug: 'royal-golden-latte',
    sku: 'SM-FC-LAT',
    categoryId: 'cat_superfoods',
    category: STATIC_CATEGORIES['superfoods'],
    shortDescription: 'Whipped raw honey infused with high-curcumin Lakadong Turmeric, ginger, and black pepper. Coming soon.',
    description: 'An upcoming wellness superstar inspired by ancient Ayurvedic Golden Milk. We blend whipped raw honey with Lakadong Turmeric (renowned for its 7%+ curcumin content), dry ginger, and a dash of black pepper. The black pepper activates the absorption of curcumin, delivering an antioxidant powerhouse that supports immunity, joints, and digestion.',
    sourcingStory: 'Lakadong Turmeric is sourced directly from cooperative farmers in Meghalaya, celebrated for growing the most potent turmeric in the world.',
    nutritionalBenefits: [
      'Highly anti-inflammatory blend supporting joint flexibility and immune health.',
      'Lakadong turmeric contains high active curcumin concentrations.',
      'Black pepper inclusion increases curcumin absorption by up to 2000%.'
    ],
    price: 549,
    compareAtPrice: null,
    costPrice: null,
    stock: 0,
    lowStockThreshold: 0,
    weight: 250,
    tags: ['superfood', 'turmeric', 'golden-milk', 'ayurvedic'],
    isFeatured: false,
    isActive: false,
    comingSoon: true,
    metaTitle: 'Royal Golden Latte Turmeric Honey | SUMOSTA',
    metaDescription: 'Coming Soon: Royal Golden Latte. An Ayurvedic-inspired blend of raw forest honey, Lakadong turmeric, and warming spices.',
    images: [
      { id: 'img_lat_1', url: '/images/products/golden-latte-placeholder.svg', altText: 'Royal Golden Latte Mock Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [],
    averageRating: 0,
    reviewCount: 0,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'prod_nuts_spread',
    name: 'Multi-Nuts & Seeds Spread',
    slug: 'multi-nuts-seeds-spread',
    sku: 'SM-SP-NUTS',
    categoryId: 'cat_spreads',
    category: STATIC_CATEGORIES['spreads'],
    shortDescription: 'Clean, high-protein nut butter sweetened with raw forest honey and organic jaggery. Coming soon.',
    description: 'A revolutionary, clean nut butter spread. It contains zero palm oil, zero stabilizers, and zero refined sugars. Naturally sweetened with raw forest honey and organic jaggery, it combines slow-roasted almonds, hazelnuts, cashews, peanuts, and seeds (chia, flax, and pumpkin seeds) into a velvety, crunchy spread rich in plant proteins and healthy fats.',
    sourcingStory: 'All nuts and seeds are carefully roasted in small batches to preserve their natural oils and blended slowly with wild honey to achieve a perfect spreadable texture.',
    nutritionalBenefits: [
      'Zero palm oil, hydrogenated fats, or preservatives.',
      '100% naturally sweetened with raw honey and organic jaggery.',
      'Loaded with proteins, dietary fibers, and omega-3 fatty acids from seeds.'
    ],
    price: 449,
    compareAtPrice: null,
    costPrice: null,
    stock: 0,
    lowStockThreshold: 0,
    weight: 350,
    tags: ['spread', 'nut-butter', 'no-palm-oil', 'seeds'],
    isFeatured: false,
    isActive: false,
    comingSoon: true,
    metaTitle: 'Multi-Nuts & Seeds Honey Spread | SUMOSTA',
    metaDescription: 'Coming Soon: Clean Multi-Nuts & Seeds Spread. Naturally sweetened with raw forest honey and organic jaggery. No palm oil.',
    images: [
      { id: 'img_spr_1', url: '/images/products/nuts-spread-placeholder.svg', altText: 'Multi-Nuts & Seeds Spread Mock Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [],
    averageRating: 0,
    reviewCount: 0,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'prod_honey_soaked_nuts',
    name: 'Honey-soaked Premium Nuts',
    slug: 'honey-soaked-premium-nuts',
    sku: 'SM-SN-PREM',
    categoryId: 'cat_honey_nuts',
    category: STATIC_CATEGORIES['honey-nuts'],
    shortDescription: 'Premium almonds, walnuts, and cashews slow-soaked in raw single-origin wild forest honey. Coming soon.',
    description: 'A luxurious jar of whole premium nuts (Californian almonds, Kashmiri walnuts, and whole cashews) slow-soaked for 30 days in raw single-origin wild forest honey. As the nuts soak, they absorb the enzymes and sweetness of the honey, while releasing their roasted oils into the honey, making it rich and complex. Perfect for breakfasts, snacking, or gifting.',
    sourcingStory: 'Premium grade almonds, walnuts, and cashews are sourced from local farms in Kashmir and California, lightly dry-roasted, and hand-packed in jars before being filled with wild honey.',
    nutritionalBenefits: [
      'Energy-boosting, vitamin-rich daily ritual snack.',
      'Excellent source of antioxidants, minerals, and healthy fats.',
      'Perfect healthy alternative to processed sweets.'
    ],
    price: 599,
    compareAtPrice: null,
    costPrice: null,
    stock: 0,
    lowStockThreshold: 0,
    weight: 350,
    tags: ['honey-soaked', 'nuts', 'gifting', 'healthy-snack'],
    isFeatured: false,
    isActive: false,
    comingSoon: true,
    metaTitle: 'Honey-soaked Premium Nuts | SUMOSTA',
    metaDescription: 'Coming Soon: Honey-soaked Premium Nuts. Organic walnuts, almonds, and cashews slow-soaked in raw forest honey.',
    images: [
      { id: 'img_skn_1', url: '/images/products/soaked-nuts-placeholder.svg', altText: 'Honey Soaked Nuts Mock Jar', sortOrder: 1, isPrimary: true }
    ],
    variants: [],
    averageRating: 0,
    reviewCount: 0,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  }
];

export const STATIC_COMBOS: (ComboBundle & {
  variants?: { id: string; name: string; sku: string; priceAdjust: number; stock: number; }[];
})[] = [
  {
    id: 'bundle_forest_essentials',
    name: 'Wild Forest Essentials Combo',
    slug: 'wild-forest-essentials-combo',
    description: 'Taste the rich diversity of India’s wildest forest ecosystems. Includes Organic Wild Forest Honey (500g), Tribal Forest Honey (500g), and HoneyDew Honey (500g).',
    price: 1399,
    compareAtPrice: 1647,
    image: '/images/products/combo-essentials.png',
    products: ['prod_wf_honey_500', 'prod_tribal_500', 'prod_honeydew_500'],
    variants: [
      { id: 'var_fe_250g', name: '250g Combo Set', sku: 'SM-CB-FE-250', priceAdjust: -650, stock: 30 },
      { id: 'var_fe_500g', name: '500g Combo Set', sku: 'SM-CB-FE-500', priceAdjust: 0, stock: 20 }
    ]
  },
  {
    id: 'bundle_medicinal_duo',
    name: 'The Ultimate Healing Duo',
    slug: 'ultimate-healing-duo',
    description: 'A highly therapeutic combination of our rare Stingless Bee Honey (250g) and Raktbeej Honey (500g). Designed for immunity, breathing support, and blood tonics.',
    price: 1799,
    compareAtPrice: 1998,
    image: '/images/products/combo-medicinal.png',
    products: ['prod_stingless_250', 'prod_raktbeej_500'],
    variants: [
      { id: 'var_md_250g', name: '250g Combo Set', sku: 'SM-CB-MD-250', priceAdjust: -600, stock: 15 },
      { id: 'var_md_500g', name: '500g Combo Set', sku: 'SM-CB-MD-500', priceAdjust: 0, stock: 10 }
    ]
  },
  {
    id: 'bundle_grand_connoisseur',
    name: 'The SUMOSTA Connoisseur Set',
    slug: 'sumosta-connoisseur-set',
    description: 'The complete SUMOSTA forest collection in a premium crafted wooden gift box. Includes one jar each of Wild Forest (500g), Stingless Bee (250g), Tribal Forest (500g), HoneyDew (500g), and Raktbeej (500g).',
    price: 2999,
    compareAtPrice: 3545,
    image: '/images/products/combo-connoisseur.png',
    products: ['prod_wf_honey_500', 'prod_stingless_250', 'prod_tribal_500', 'prod_honeydew_500', 'prod_raktbeej_500'],
    variants: [
      { id: 'var_gc_250g', name: '250g Combo Set', sku: 'SM-CB-GC-250', priceAdjust: -1000, stock: 10 },
      { id: 'var_gc_500g', name: '500g Combo Set', sku: 'SM-CB-GC-500', priceAdjust: 0, stock: 10 }
    ]
  }
];

export const STATIC_FAQS: FAQItem[] = [
  {
    question: "What makes SUMOSTA different from other commercial Brands?",
    answer: "SUMOSTA offers raw forest honey sourced from India’s wild forests, where indigenous honeybees gather nectar from diverse native flora. Unlike most commercial branded honey, which is often heavily filtered, blended, or heat-processed for uniformity, our honey is minimally filtered and carefully preserved in its natural form. This keeps its authentic aroma, regional character, rich taste, and natural goodness intact."
  },
  {
    question: "Where do your products come from?",
    answer: "Our forest honey is born & sourced from India’s most pristine and biodiverse wild landscapes, including the Saranda, Abujhmarh, Kandhamal, Western Ghats and the forests of Nagaland & Assam. They are sustainably harvested with care by skilled indigenous tribes and local communities using traditional methods, honoring an ancient bond with nature. What you receive is a rare, luxury-grade treasure: 100% natural, pure, and completely unprocessed, without a single chemical or preservative. An authentic piece of heritage, curated for your home."
  },
  {
    question: "Is raw honey better than processed honey?",
    answer: "Raw honey is generally preferred by many natural food lovers because it retains more of its original enzymes, pollen, aroma, and natural compounds. Processed honey is often heated and filtered, which may reduce some of these naturally occurring properties."
  },
  {
    question: "How can you test honey purity at home?",
    answer: "Home tests like the water test, flame test, or thumb test are popular, but they are not scientifically reliable. The most accurate way to verify honey purity is through certified laboratory analysis, which checks for adulteration, moisture, sugar profile, and overall quality."
  },
  {
    question: "Why does honey keep changing in taste, color & texture?",
    answer: "The taste of raw forest honey depends on the type of trees and flowers the bees gather nectar from. Every plant species produces nectar with unique natural characteristics, which gives each honey variety its own distinct flavor, aroma, color, and texture."
  },
  {
    question: "What is shelf life of a honey?",
    answer: "Honey never really goes off as it contains a high amount of glucose and fructose. We print best before dates on all our packaging and recommend that the honey is consumed before this date. The best before or expiry date on a honey package is a legal requirement. In India, consumer law requires honey to have a best before date having said this if honey is stored in airtight food grade container it can last indefinitely. That is why the honey found in the pyramids was still edible."
  },
  {
    question: "Can forest honey ferment?",
    answer: "Yes, forest honey can ferment if its moisture content is high or if it is stored improperly. Raw forest honey contains natural yeasts, so if harvested early or exposed to humidity, it may develop bubbles, a sour smell, or slight fizz. Properly matured and well-stored forest honey usually remains stable naturally."
  },
  {
    question: "How can I de-crystalize Honey safely?",
    answer: "To decrystallize honey, place the jar in warm water and let it slowly return to liquid form. Avoid direct flame, boiling, or microwaving, as excessive heat can damage natural enzymes and nutrients in raw honey."
  }
];

export const MOCK_REVIEWS: Record<string, Review[]> = {
  'prod_wf_honey_500': [
    { id: 'rev_1', productId: 'prod_wf_honey_500', userId: 'usr_1', userName: 'Ananya S.', rating: 5, title: 'Outstanding Quality!', body: 'You can immediately tell this is raw and unheated. It has a beautiful complex wildflower aroma. Definitely buying again!', isVerified: true, isApproved: true, createdAt: '2026-06-15T09:22:16Z' },
    { id: 'rev_2', productId: 'prod_wf_honey_500', userId: 'usr_2', userName: 'Rohan M.', rating: 5, title: 'True Organic Honey', body: 'The fact that they share actual NABL reports is what won me over. The moisture is low, taste is woody and rich.', isVerified: true, isApproved: true, createdAt: '2026-06-20T09:22:16Z' }
  ],
  'prod_stingless_250': [
    { id: 'rev_3', productId: 'prod_stingless_250', userId: 'usr_3', userName: 'Dr. Priya V.', rating: 5, title: 'Amazing Medicinal Benefits', body: 'This honey is quite runny and has a sour-sweet taste like fermented berries. Highly effective for coughs and immunity. Excellent quality!', isVerified: true, isApproved: true, createdAt: '2026-06-18T09:22:16Z' }
  ]
};

