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
  benefitsLabel?: string;
  benefitsBody?: string | string[];
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
    description: 'NABL lab tested, NPOP APEDA Organic certified, 100% raw forest honeys sourced from pristine Indian reserves',
    imageUrl: null,
    sortOrder: 1
  },
  'gift-boxes': {
    id: 'cat_gift_boxes',
    name: 'Gift Boxes & Combos',
    slug: 'gift-boxes',
    description: 'Curated collections and premium gift boxes of our finest wild forest honeys.',
    imageUrl: null,
    sortOrder: 2
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
  ingredients?: string;
  howToUse?: string[];
  trustBadges?: string[];
})[] = [
  {
    id: 'prod_wf_honey_500',
    name: 'Organic Wild Forest Honey',
    slug: 'organic-certified-wild-forest-honey',
    sku: 'SM-WF-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'NPOP APEDA Certified, NABL Lab tested, 100% raw, Un-processed Honey',
    description: 'This NPOP-APEDA Organic Certified raw forest honey is unprocessed, unheated, and minimally filtered to preserve its natural pollen, active enzymes, antioxidants, amino acids, and essential nutrients. Apis dorsata bees collect nectar from flowering trees such as Sal, Haldu, Ashid, Jamun, and Khair, along with hundreds of species of wildflowers, medicinal herbs, shrubs, vines, and other native forest plants. Rich in natural goodness, it offers a deep woody aroma, thick texture, dark amber color, and bold authentic taste that reflects the richness of Indian forest flora.',
    sourcingStory: 'Foraged from remote deciduous forests, the honeycombs are sustainably harvested by Tharu tribe communities. We pay a fair wage, protecting the forest ecosystem and helping local families thrive.',
    nutritionalBenefits: [
      'Rich in natural enzymes & flavonoids that aids efficient nutrient absorption & helps comfort the stomach lining thereby overall gut & digestive wellness',
      'Serves as a nutrient rich alternative to conventional sweeteners',
      'Acts as an intense cellular fuel source',
      'Helps support quality sleep',
      'Helps support respiratory wellness',
      'Balanced carbohydrate profile of wild raw forest honey may help provide steadier energy compared to highly refined sugars which can affect mood, focus & productivity',
      'Acts as a natural humectant useful in skin care applications & routines',
    ],
    ingredients: '100% Organic, pure, raw, un-processed honey. No additives, No preservatives, No added sugars, No artificial flavors. NABL Lab tested for purity and quality. 100% Organic certification by NPOP APEDA.',
    howToUse: [
      'Morning wellness drink: Mix 1 teaspoon of forest honey with warm water and fresh lemon juice. Consume first thing in the morning.',
      'Breakfast Enhancer: Drizzle over warm oatmeal, Greek yogurt, fruit bowls, or blend directly into breakfast smoothies.',
      'Herbal Wellness Teas: Pairs beautifully with Tulsi, Ginger, Chamomile, or Green tea. Important: Allow beverages to cool slightly before stirring in honey to protect enzymes.',
      'Natural Sweetener Substitute: Substitute refined white sugar in coffee, tea, everyday baking recipes, and homemade raw snacks.',
      'Evening Wellness Routine: Combine a small spoonful with warm milk or calming herbal bedtime infusions to promote evening relaxation.',
      'Skin care routines: DIY natural face masks of honey & turmeric, honey & aloevera which may help support hydrated & healthy-looking skin.',
    ],
    trustBadges: ['NPOP APEDA Organic', 'NABL Lab Tested', 'Ethically Harvested', 'Free Shipping ₹499+'],
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
      location: 'Madhya Pradesh, Uttar Pradesh & Chhattisgarh, India',
      harvestedBy: 'Tharu Tribe',
      beeSpecies: 'Apis dorsata (Giant Rock Bees)'
    },
    faqs: []
  },
  {
    id: 'prod_stingless_250',
    name: 'Rare Dammer Bee Honey',
    slug: 'rare-dammer-bee-honey',
    sku: 'SM-STB-250',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Ultra-rare, high-end therapeutic stingless bee honey. Tangy, dark amber, harvested from the hills of Nagaland. Rich in antioxidants, enzymes, anti-microbial compounds & probiotic properties.',
    description: 'Known locally as Melipona honey, this is the holy grail of medicinal honeys. Stingless bees (Dammer bees) are tiny, feeding on smaller medicinal flowers that larger bees cannot reach. The honey has a distinct, sour-tangy flavor due to natural fermentation inside the bee propolis cells. It has 10x the antioxidant density of standard honey and is highly priced for eye, skin, and respiratory healing. Dammer bees store their honey in pots made of propolis (bee glue) rather than wax. This leads to a slow natural fermentation that gives the honey a unique tartness and increases its organic acid profile. Also these bees are tiny and produce very little honey. A single hive produces less than 500g of honey annually, and harvesting it from deep forest hollows is highly labor-intensive, making it a rare medicinal superfood.',
    sourcingStory: 'Harvested in the pristine, chemical-free mountain forests of Nagaland by indigenous Angami tribe families. Since stingless bees produce less than 500g of honey per hive annually, this batch is extremely limited.',
    nutritionalBenefits: [
      'High concentrations of organic propolis helps deliver a powerhouse of cellular defense and natural immunity support',
      'Exceptionally low glycemic index provides a steady, clean release of metabolic energy, preventing the rapid insulin spikes typically associated with standard sugars & sweeteners',
      'Possesses a remarkably low pH and unique organic acids which helps retain its structural integrity and provide active, long-lasting respiratory and wellness support',
      'Naturally acariogenic and does not promote oral acidity or tooth decay, making it a rare wellness treat that actively respects oral microbiome',
      'Helps nourish beneficial gut flora, soothe mild metabolic inflammation, and helps support optimal nutrient absorption in the digestive tract',
    ],
    ingredients: '100% raw, un-processed honey. No additives, No preservatives, No added sugars, No artificial flavors. NABL Lab tested for purity and quality. Rich in antioxidants, enzymes, anti-microbial compounds & probiotic properties.',
    howToUse: [
      'The Sublingual Wellness Ritual (The Purist\'s Dose): Take half a teaspoon directly under the tongue first thing in the morning. Let it dissolve slowly. Its ultra-fluid consistency allows for rapid absorption of propolis and live enzymes directly into your system. Note: Because of its fluid, pourable texture and sharp, citrusy, tangy flavor profile, it is advisable never to cook with this honey or dilute it heavily. Treat it as a targeted wellness dose or a gourmet accent.',
      'The Artisanal Espresso & Matcha Cutter: The distinct citric acidity of Dammer Bee Honey acts like a premium lemon twist, cutting through the bitterness of a double shot of dark espresso or brightening the earthy notes of ceremonial Japanese Matcha perfectly.',
      'The Luxury Epicurean Glaze: Capitalize on its tangy, balsamic-like flavor profile. Drizzle it sparingly over sharp, aged cheeses (like Parmigiano-Reggiano or Pecorino), fresh goat cheese, or over pieces of 85% dark single-origin chocolate for a sophisticated, high-antioxidant dessert pairing.',
      'Propolis Spot Therapy (Elite Skincare): Due to its incredible anti-inflammatory and non-stick moisture barrier properties, apply a single drop directly to targeted skin blemishes, dry patches, or fine lines overnight. It acts as a natural, active serum that supports cellular regeneration.',
      'The Pre-Meditation Clarity Draught: Stir a teaspoon into a cup of lukewarm (never hot) blue pea tea or pure lotus infusion before a breathwork or meditation session. The slow-releasing trehalulose keeps your brain fueled and focused without any physical restlessness or jitters.',
    ],
    trustBadges: ['NABL Lab Tested', 'Ethically Harvested', 'Limited Batch', 'Ultra-Rare', 'Free Shipping ₹499+'],
    price: 1299,
    compareAtPrice: 1499,
    costPrice: 600,
    stock: 25,
    lowStockThreshold: 5,
    weight: 250,
    tags: ['rare', 'stingless-bee', 'nagaland', 'medicinal', 'tangy'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Rare Dammer Bee Honey from Nagaland | SUMOSTA',
    metaDescription: 'Discover the medicinal power of rare Dammer Bee Honey sourced from Nagaland. Highly antimicrobial, rich and tangy.',
    images: [
      { id: 'img_st_1', url: '/images/products/stingless-1.png', altText: 'Rare Dammer Bee Honey Jar', sortOrder: 1, isPrimary: true },
      { id: 'img_st_2', url: '/images/products/stingless-2.png', altText: 'Small Stingless Dammer Bee Hives', sortOrder: 2, isPrimary: false }
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
    faqs: []
  },
  {
    id: 'prod_tribal_500',
    name: 'Artisanal Heritage Forest Honey',
    slug: 'artisanal-heritage-forest-honey',
    sku: 'SM-TF-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Wild multi-floral honey sourced from the protected Kandhamal reserve. Sweet, earthy, and 100% natural.',
    description: 'Sourced from the deep biosphere of Kandhamal in Odisha, this artisanal heritage honey is collected from the wild hives of Apis dorsata (giant rock bees). The bees feed on native sal, mahua, and neem trees, imparting a thick, deep-golden body and an earthy, dark-caramel taste. Completely raw, unfiltered, and packed with bioactive compounds.',
    sourcingStory: 'Gathered by the Kondh tribe of Odisha using traditional, smoke-free collection methods that do not harm the wild colony. This honey provides an essential livelihood to forest dwellers.',
    nutritionalBenefits: [
      '100% wild multi-floral blend reflecting the rich herbal flora of Kandhamal',
      'Deep, earthy caramel taste rich in minerals like potassium, magnesium, and iron',
      'Raw, unheated processing protects delicate pollen and digestive enzymes',
      'Sustainably sourced, supporting forest tribal communities',
      'Pure wild-crafted biodiversity',
      'Its naturally occurring prebiotics help cultivate a healthy gut environment',
      'Acts as a natural coating to gently calm seasonal throat irritation and helps reinforce body\'s everyday defense mechanism',
      'Wholesome, clean metabolic energy for active lifestyles without the standard sugar crash',
    ],
    ingredients: '100% raw, un-processed honey. No additives, No preservatives, No added sugars, No artificial flavors. NABL Lab tested for purity and quality.',
    howToUse: [
      'The Ultimate Golden Immunity Shot: Mix 1 teaspoon of Kandhamal forest honey with warm water, a squeeze of lemon, and a tiny pinch of pure turmeric (a beautiful nod to Kandhamal\'s famous turmeric heritage!). Drink it every morning on an empty stomach to awaken your metabolism.',
      'Everyday Kitchen Sweetener: Easily replace refined white sugar in your daily routine. Because of its smooth, well-rounded sweetness, it blends seamlessly into your morning tea, daily coffee, freshly pressed juices, and homemade lemonade without overpowering the beverage.',
      'Traditional Ayurvedic Kadhas: Stir a spoonful into your home-brewed herbal decoctions or kadhas made with ginger, black pepper, and tulsi. Important Temperature Rule: To safeguard the precious live enzymes and raw nutrients, always allow your hot herbal teas or infusions to cool down to a warm, drinkable temperature before stirring in your honey.',
      'Wellness Breakfast Drizzle: Upgrade your breakfast by drizzling this rich honey over warm parathas, whole-wheat pancakes, overnight oats, or a bowl of fresh seasonal fruits and Greek yogurt.',
      'Soothing Evening Wind-Down: Add a teaspoon of this smooth honey to a warm glass of ashwagandha-infused milk or a cup of caffeine-free chamomile tea before bed to signal your body it\'s time to rest and recover.',
      'Heritage Skin Soother: Use it as a gentle, purifying base for traditional DIY face masks. Mix equal parts honey and organic chickpea flour (besan) with a splash of rose water for a deeply cleansing, hydrating ritual that leaves the skin feeling soft and naturally radiant.',
    ],
    trustBadges: ['Raw & Unfiltered', 'NABL Lab Tested', 'Ethically Harvested', 'Free Shipping ₹499+'],
    price: 549,
    compareAtPrice: 649,
    costPrice: 240,
    stock: 80,
    lowStockThreshold: 10,
    weight: 500,
    tags: ['raw', 'artisanal', 'kandhamal', 'multi-floral', 'earthy'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Artisanal Heritage Forest Honey (Kandhamal Odisha) | SUMOSTA',
    metaDescription: 'Authentic wild artisanal heritage forest honey from Kandhamal, Odisha. Hand-harvested, raw and pure.',
    images: [
      { id: 'img_tb_1', url: '/images/products/tribal-1.png', altText: 'Artisanal Heritage Forest Honey Jar', sortOrder: 1, isPrimary: true }
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
    faqs: []
  },
  {
    id: 'prod_honeydew_500',
    name: 'Canopy Dew Forest Honey',
    slug: 'canopy-dew-forest-honey',
    sku: 'SM-HD-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Rare, dark, mineral-rich dew honey from the massive Sal forests of Saranda. Deep woody flavor.',
    description: 'Unlike standard honey, Canopy dew forest honey is made by bees collecting sap secretions rather than flower nectar. Sourced from the dense Sal reserve of Saranda, Jharkhand, this honey is extremely dark, almost black. It is less acidic, crystallization-resistant, and possesses a robust woody flavor, rich with malty undertones. It features a superior profile of minerals, antioxidants, and oligosaccharides.',
    sourcingStory: 'Harvested from the wild depths of the Saranda Forest—the largest Sal forest in Asia. Traditional climbers scale forest canopies at night, collecting this slow-drip forest gold.',
    nutritionalBenefits: [
      'Rich in prebiotics (oligosaccharides) that actively nourish beneficial gut microflora',
      'Contains higher levels of iron, magnesium, and copper than standard honeys',
      'Higher electrical conductivity and mineral salts, highly supportive of physical recovery',
      'Highly resistant to crystallization, maintaining a smooth liquid state naturally',
    ],
    ingredients: '100% raw, un-processed honey. No additives, No preservatives, No added sugars, No artificial flavors. NABL Lab tested for purity and quality. Rich in antioxidants, minerals & oligosaccharides.',
    howToUse: [
      'The Active Recovery Hydration Booster: Stir a teaspoon into a glass of warm water or coconut water immediately following an intense workout, yoga session, or a long run. The rapid bio-availability of its natural tree minerals helps replenish lost electrolytes and revitalize tired muscles far cleaner than synthetic sports drinks.',
      'The Connoisseur\'s Coffee Companion: Traditional floral honeys often curdle or clash with the volatile acidity of coffee. However, the dark, woody, and caramel-like undertones of dew honey act as a premium natural sweetener that perfectly rounds out the bitter notes of cold brews, dark roasts, and artisan espressos.',
      'The Epicurean Cheese & Grazing Accent: Elevate your culinary pairings by drizzling this rich honey over robust, mature savory foods. It contrasts beautifully with aged white cheeses (like vintage cheddar or gouda), roasted walnuts, toasted sourdough, or sharp dark chocolate.',
      'The Gentle Overnight Moisture Trap: Use its high mineral and low-moisture profile as a highly effective topical skin treatment. Mix it with a few drops of rosewater or jojoba oil and apply it as a deeply hydrating overnight face mask to support barrier repair and leave your skin looking plump and glowing.',
      'Warming Botanical Infusions: Its earthy, complex nature stands up remarkably well to strong, spicy botanicals. Pair it with fresh ginger slices, cinnamon bark, or crushed peppercorns in warm water for a deeply grounding afternoon wellness ritual. Wellness Guardrail: Never mix raw honey into rolling, boiling water. Let your water or tea cool down to a comfortable warm drinking temperature before stirring it in to preserve the alive forest enzymes.',
    ],
    trustBadges: ['NABL Lab Tested', 'Ethically Harvested', 'Mineral Rich', 'Free Shipping ₹499+'],
    price: 599,
    compareAtPrice: 699,
    costPrice: 260,
    stock: 45,
    lowStockThreshold: 5,
    weight: 500,
    tags: ['raw', 'canopy-dew', 'saranda', 'woody', 'mineral-rich'],
    isFeatured: false,
    isActive: true,
    metaTitle: 'Canopy Dew Forest Honey | SUMOSTA',
    metaDescription: 'Indulge in rare, dark Canopy Dew Forest Honey from the Sal forests of Saranda, Jharkhand. Extremely rich in minerals and prebiotics.',
    images: [
      { id: 'img_hd_1', url: '/images/products/honeydew-1.png', altText: 'Canopy Dew Forest Honey Jar', sortOrder: 1, isPrimary: true }
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
    faqs: []
  },
  {
    id: 'prod_raktbeej_500',
    name: 'Bloodseed Forest Honey',
    slug: 'bloodseed-forest-honey',
    sku: 'SM-RB-500',
    categoryId: 'cat_raw_honey',
    category: STATIC_CATEGORIES['raw-honey'],
    shortDescription: 'Blood-red, therapeutic wild honey from the mysterious Abujhmarh reserves. High iron & antioxidants.',
    description: 'Harvested in the isolated, highly biodiverse forests of Abujhmarh in Chhattisgarh, Bloodseed Forest Honey has a dark, reddish-amber hue. Giant wild bees forage on iron-rich herbal flora and red silk cotton flowers deep within this protected reserve. This honey is prized for its high bio-available iron content, making it an excellent natural blood tonic. It carries a warm, spicy finish with a thick, velvety texture — a truly rare and powerful forest honey.',
    sourcingStory: 'Abujhmarh is a highly protected forest block. The honey is collected in small quantities by indigenous Madia & Muria Gond tribes who preserve the forest as sacred ground. Fully traceable and completely rare.',
    nutritionalBenefits: [
      'Distinct red-amber color signifying high iron content and organic anthocyanins.',
      'Acts as a natural hematinic, supporting red blood cell generation.',
      'High anti-inflammatory capacity due to native forest herbal pollens.',
      'Spicy, warming digestive aid.',
      'High level of anti-oxidants helps body combat daily oxidative stress.',
      'Vital trace minerals that support everyday cellular health.',
      'Acts as a soothing demulcent to calm seasonal throat irritation and strengthen natural defenses.'
    ],
    ingredients: '100% raw, un-processed honey. No additives, No preservatives, No added sugars, No artificial flavors. NABL Lab tested for purity and quality. High in Iron & anti-oxidants.',
    howToUse: [
      'Morning Vitality: Take 1 teaspoon on an empty stomach each morning to support iron levels and energize the body naturally.',
      'Robust Breakfast Pairing: Drizzle over warm oatmeal, whole grain toast, or mixed with warm water and lemon for a grounding start.',
      'Healing Teas & Kadhas: Stir into warm (not boiling) herbal kadhas, tulsi tea, or ginger-pepper brew to enhance medicinal potency.',
      'Post-Workout Recovery Shot: Mix 1 teaspoon in warm water with a pinch of black pepper after physical activity to aid muscle recovery and replenish minerals.',
      'Artisanal Sweetener: Use as a complex, warming sweetener in dark chocolate desserts, spiced smoothies, or immunity-boosting energy balls.',
      'Bedtime Ritual: Take 1 teaspoon before bed mixed with warm milk to support overnight recovery and deep restful sleep.',
      'High-Antioxidant Skin Rituals: Apply a thin layer as a face mask for 15 minutes — the natural iron and antioxidants help brighten and nourish skin.'
    ],
    trustBadges: ['NABL Lab Tested', 'Ethically Harvested', 'High in Iron & Antioxidants', 'Free Shipping ₹499+'],
    price: 699,
    compareAtPrice: 799,
    costPrice: 320,
    stock: 35,
    lowStockThreshold: 5,
    weight: 500,
    tags: ['raw', 'bloodseed', 'abujhmarh', 'red-honey', 'therapeutic'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'Bloodseed Forest Honey | High Iron Wild Honey | SUMOSTA',
    metaDescription: 'Taste the therapeutic Bloodseed Forest Honey from Abujhmarh Reserve. Rich in iron & antioxidants, deep red-amber color, ethically wild-harvested.',
    images: [
      { id: 'img_rk_1', url: '/images/products/raktbeej-1.png', altText: 'Bloodseed Forest Honey Jar', sortOrder: 1, isPrimary: true }
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
    faqs: []
  },
  {
    id: 'prod_trial_box_60g',
    name: 'The 5 Elements Collection',
    slug: '5-elements-collection',
    sku: 'SM-TB-5x70',
    categoryId: 'cat_gift_boxes',
    category: STATIC_CATEGORIES['gift-boxes'],
    shortDescription: 'A luxury nectar flight from India\'s pristine forests.',
    description: 'Five rare forest honeys. Five distinct terroirs. One extraordinary collection. The 5 Elements Collection brings together all of SUMOSTA\'s single-origin raw honeys in beautiful 70g glass jars — Bloodseed Forest Honey, Artisanal Heritage Forest Honey, Rare Dammer Bee Honey, Canopy Dew Forest Honey, and Organic Wild Forest Honey. Each honey is NABL lab tested, NPOP APEDA Organic certified, and ethically harvested by indigenous tribal communities from pristine Indian reserves. The perfect way to explore India\'s extraordinary forest honey diversity, or a truly memorable premium gift.',
    sourcingStory: 'Contains a curated selection of all 5 single-origin raw honeys, sourced directly from untouched Indian wilderness blocks in partnership with native tribes across India.',
    nutritionalBenefits: [
      'Please refer to respective raw forest honey sections to learn more about individual raw honey product benefits.'
    ],
    trustBadges: ['Ethically Harvested', 'Premium Gift Packaging', 'All 5 Forest Honeys', 'Free Shipping ₹499+'],
    price: 699,
    compareAtPrice: 899,
    costPrice: 300,
    stock: 50,
    lowStockThreshold: 5,
    weight: 350,
    tags: ['gift-box', 'collection', 'gifting', 'sample-pack', '5-elements'],
    isFeatured: true,
    isActive: true,
    metaTitle: 'The 5 Elements Collection | Premium Forest Honey Gift Set | SUMOSTA',
    metaDescription: 'Experience all 5 SUMOSTA raw forest honeys in a luxury 70g gift set. Bloodseed, Artisanal Heritage, Rare Dammer Bee, Canopy Dew, and Organic Wild Forest — NABL tested, NPOP certified.',
    images: [
      { id: 'img_tb_box_1', url: '/images/products/combo-trialbox.png', altText: 'The 5 Elements Collection Gift Box', sortOrder: 1, isPrimary: true }
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
      beeSpecies: 'Apis dorsata & Meliponini (Dammer Bee)'
    },
    faqs: []
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
    id: 'bundle_heritage_trio',
    name: 'The Heritage Trio',
    slug: 'heritage-trio',
    description: 'Three of India\'s most storied forest honeys, united in one extraordinary set. The Heritage Trio brings together Organic Wild Forest Honey (250g), Artisanal Heritage Forest Honey (250g), and Bloodseed Forest Honey (250g) — each harvested from ancient indigenous forest ecosystems by tribal communities who have practiced sustainable honey gathering for generations. These are not interchangeable products: each carries a distinct terroir, a unique color, a specific medicinal character, and a story rooted in place. Together, they represent the full depth of India\'s wild honey heritage.',
    price: 1399,
    compareAtPrice: 1647,
    image: '/images/products/combo-essentials.png',
    products: ['prod_wf_honey_500', 'prod_tribal_500', 'prod_raktbeej_500'],
    benefitsLabel: 'Why this Trio',
    benefitsBody: [
      'Organic Wild Forest Honey anchors the trio with its broad-spectrum floral complexity — a balanced, versatile everyday honey rich in enzymes and natural antioxidants from the biodiverse forests of Madhya Pradesh, Uttar Pradesh, and Chhattisgarh.',
      'Artisanal Heritage Forest Honey brings depth and heritage — a rare, slow-granulating variety harvested by Gond tribal communities using centuries-old bark-hive techniques. Its dark amber, resinous character reflects an ecosystem untouched by modern agriculture.',
      'Bloodseed Forest Honey completes the trio with therapeutic power — the reddish-amber wild honey from the protected Abujhmarh reserve, prized for its high bio-available iron content, natural anthocyanins, and warm, spicy finish that sets it apart from any commercial honey.',
      'Together, these three honeys span the spectrum from balanced wellness to deep, mineral-rich forest medicine — making The Heritage Trio the ideal way to explore raw Indian forest honey at its finest.',
      'All three are NABL lab tested for purity and quality, ethically harvested by indigenous communities, and bottled without heat, filtration, or additives.'
    ],
    variants: [
      { id: 'var_ht_250g', name: '250g Combo Set', sku: 'SM-CB-HT-250', priceAdjust: 0, stock: 30 }
    ]
  },
  {
    id: 'bundle_forest_alchemy',
    name: 'The Forest Alchemy Duo',
    slug: 'forest-alchemy-duo',
    description: 'Two of India\'s rarest forest honeys, brought together for those who seek the extraordinary. The Forest Alchemy Duo pairs Rare Dammer Bee Honey (250g) — harvested from stingless Meliponini bees in Kerala\'s ancient rainforests — with Canopy Dew Forest Honey (250g) — a remarkable honeydew variety collected from the forest canopy of Kandhamal\'s pristine sal and teak forests. Both are among the most unusual and sought-after raw honeys in India, prized by healers, chefs, and connoisseurs alike.',
    price: 1799,
    compareAtPrice: 1998,
    image: '/images/products/combo-medicinal.png',
    products: ['prod_stingless_250', 'prod_honeydew_500'],
    benefitsLabel: 'Why this Duo',
    benefitsBody: 'Rare Dammer Bee Honey brings the ancient wisdom of stingless-bee honey — naturally lower in sugar, higher in organic acids, with a distinctive tangy-sweet profile uniquely suited for immune support and oral health. Canopy Dew Forest Honey adds a mineral-rich, complex sweetness derived not from flower nectar but from the concentrated forest canopy secretions gathered by wild bees. Together, they represent two completely different expressions of honey at its most elemental — complementary in character, extraordinary in origin, and unlike anything found in mainstream markets.',
    variants: [
      { id: 'var_fa_250g', name: '250g Combo Set', sku: 'SM-CB-FA-250', priceAdjust: 0, stock: 15 }
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

