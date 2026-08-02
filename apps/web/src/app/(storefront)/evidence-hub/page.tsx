'use client';
import { useEffect } from 'react';
import Link from 'next/link';

const RESEARCH_STUDIES = [
  {
    honey: 'Rare Dammer Bee Honey',
    accent: '#D4891A',
    tag: 'Low Glycaemic',
    icon: '🧬',
    claim: 'The Low-GI Miracle: A Rare Sugar That Prevents Glucose Spikes While Fermenting in Propolis',
    science: 'Stingless bee honey is biologically distinct from standard honey. It contains massive natural concentrations of trehalulose — a rare, low-glycaemic disaccharide that is absorbed slowly without causing rapid insulin spikes. Additionally, because the bees cure this honey inside propolis (medicinal tree resin) pots instead of wax, it naturally undergoes a mild, health-boosting fermentation process that supercharges its antioxidant and anti-inflammatory properties.',
    studies: [
      {
        title: 'Stingless bee honey, a novel source of trehalulose: a biologically active disaccharide with health benefits',
        journal: 'Scientific Reports / NIH PubMed Central',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7376065/',
        note: 'Confirms trehalulose as the dominant disaccharide in stingless bee honey with demonstrated low-GI properties',
      },
      {
        title: 'Stingless bee honey: Quality parameters, bioactive compounds, health-promotion properties and modification detection strategies',
        journal: 'Food Research International / ResearchGate',
        href: 'https://www.researchgate.net/publication/327440148_Stingless_bee_honey_Quality_parameters_bioactive_compounds_health-promotion_properties_and_modification_detection_strategies',
        note: 'Comprehensive review of physicochemical properties, biological activities, and therapeutic applications of stingless bee honey',
      },
      {
        title: 'Physicochemical Characteristics, Antioxidant Capacity, and Antimicrobial Activity of Stingless Bee Honey',
        journal: 'MDPI Foods',
        href: 'https://doi.org/10.3390/foods14060995',
        note: 'Detailed analysis of antioxidant capacity and antimicrobial activity across stingless bee honey varieties',
      },
    ],
  },
  {
    honey: 'Canopy Dew Forest Honey',
    accent: '#7A4D0B',
    tag: 'Prebiotic',
    icon: '🌿',
    claim: 'The Prebiotic Powerhouse: How Honeydew Honey Nourishes Gut Microflora and Outperforms Nectar Honey',
    science: 'Unlike blossom honeys, honeydew honey is incredibly rich in complex oligosaccharides (like melezitose and erlose). These non-digestible carbohydrates survive upper-intestinal digestion to act as highly effective prebiotics, feeding and multiplying beneficial gut bacteria (Lactobacillus and Bifidobacterium) while crowding out harmful pathogens. It also boasts a significantly higher mineral, protein, and amino acid profile.',
    studies: [
      {
        title: 'Effect of honey in improving the gut microbial balance and prebiotic potential',
        journal: 'Food Quality and Safety / ResearchGate',
        href: 'https://www.researchgate.net/publication/317294452_Effect_of_honey_in_improving_the_gut_microbial_balance',
        note: 'Demonstrates oligosaccharide-driven prebiotic activity and its impact on Lactobacillus and Bifidobacterium populations',
      },
      {
        title: 'Coniferous Honeydew Honey: Antibacterial Activity and Anti-Migration Properties',
        journal: 'MDPI Applied Sciences',
        href: 'https://www.mdpi.com/2076-3417/14/2/710',
        note: 'Studies antibacterial mechanisms of coniferous honeydew honey and its bioactive oligosaccharide profile',
      },
      {
        title: 'New Insights on Quality, Safety, Nutritional, and Nutraceutical Properties of Honeydew Honeys',
        journal: 'MDPI Molecules',
        href: 'https://www.mdpi.com/1420-3049/30/2/410',
        note: "Comprehensive review of honeydew honey’s superior mineral, amino acid, and prebiotic carbohydrate composition vs floral honeys",
      },
    ],
  },
  {
    honey: 'Organic Wild Forest Honey',
    accent: '#5C8A3C',
    tag: 'Antimicrobial',
    icon: '🛡️',
    claim: 'Pure Forest Canopies: Why Wild Rock Bee Honey Has Superior Antimicrobial and Radical-Scavenging Action',
    science: 'Foraged by the giant Apis dorsata bee from untouched, highly biodiverse forest canopies, wild forest honey is naturally rich in unique phytochemicals. Studies prove that this multifloral, wild-harvested honey exhibits exceptionally potent antimicrobial activity against common pathogens and boasts a far superior free-radical scavenging capacity compared to industrially farmed honeys.',
    studies: [
      {
        title: 'Antibacterial properties of Apis dorsata honey against some bacterial pathogens',
        journal: 'Saudi Journal of Biological Sciences / NIH PubMed Central',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8847928/',
        note: 'Confirms potent MIC activity of wild Apis dorsata honey against Staphylococcus aureus, E. coli, and other key pathogens',
      },
      {
        title: 'Physicochemical and antioxidant properties of forest honeys produced by Apis dorsata',
        journal: 'Food Chemistry / NIH PubMed Central',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11773047/',
        note: 'Physico-chemical analysis and antioxidant potential of wild Apis dorsata honey from pristine forest ecosystems',
      },
      {
        title: 'Antioxidant Capacity and Therapeutic Applications of Honey: Health Benefits, Antimicrobial Activity and Food Processing Roles',
        journal: 'MDPI Antioxidants',
        href: 'https://www.mdpi.com/2076-3921/14/8/959',
        note: 'Reviews superior radical-scavenging and antimicrobial properties of wild forest honey varieties including Apis dorsata',
      },
    ],
  },
  {
    honey: 'Bloodseed Forest Honey',
    accent: '#8B2500',
    tag: 'High Antioxidant',
    icon: '⚡',
    claim: 'The Science of Color: Why Deep, Dark Honeys Carry the Most Powerful Antioxidant Shield',
    science: 'In the scientific community, honey color is directly tied to medicinal value. Dark forest honeys derive their deep pigments from heavy concentrations of plant polyphenols, carotenoids, and flavonoids. These dark, nutrient-dense honeys contain significantly higher levels of antioxidants and trace minerals (like iron, magnesium, and zinc) compared to light-colored, mass-produced varieties.',
    studies: [
      {
        title: 'The Total Phenolic Content and Antioxidant Activity of Nine Monofloral Honey Types',
        journal: 'MDPI Applied Sciences',
        href: 'https://www.mdpi.com/2076-3417/14/10/4329',
        note: 'Establishes the direct correlation between honey color intensity and total phenolic content and antioxidant potency across monofloral varieties',
      },
      {
        title: "Honey's Antioxidant and Antimicrobial Properties: A Bibliometric Study",
        journal: 'MDPI Antioxidants',
        href: 'https://www.mdpi.com/2076-3921/12/2/414',
        note: 'Comprehensive analysis of antioxidant and antimicrobial performance of dark forest honeys including FRAP and DPPH assay data',
      },
    ],
  },
  {
    honey: 'Artisanal Heritage Honey',
    accent: '#5C4A32',
    tag: 'Antibacterial',
    icon: '🌸',
    claim: 'The Biosphere Effect: Why Tribal-Harvested Wild Honey Holds Unmatched Bioactive and Mineral Complexity',
    science: 'Research focusing on wild-harvested tribal honeys shows they possess a highly potent, broad-spectrum antimicrobial defense system. The natural presence of organic acids (giving the honey a lower, more protective pH) combined with active hydrogen peroxide production and phytochemicals from wild forest blossoms effectively inhibits the growth of highly resilient, drug-resistant bacterial pathogens. This validates why tribal cultures have used these specific forest honeys as highly effective traditional wound-dressings and respiratory remedies for centuries.',
    studies: [
      {
        title: 'Antibacterial Efficacy of Raw and Processed Honey',
        journal: 'NIH PubMed Central',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3042689/',
        note: 'Evaluates antibacterial and healing properties of wild forest honey, confirming broad-spectrum activity against drug-resistant pathogenic bacteria',
      },
      {
        title: 'Effect of heat and filtration processing on antimicrobial activity and hydrogen peroxide levels in honey',
        journal: 'Frontiers in Microbiology / NIH PubMed Central',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3406342/',
        note: 'Demonstrates that raw unpasteurised tribal forest honey retains significantly higher antibacterial activity vs commercially processed counterparts',
      },
      {
        title: 'Properties and antimicrobial activity of Apis dorsata honey',
        journal: 'ResearchGate',
        href: 'https://www.researchgate.net/publication/253827126_Properties_and_antimicrobial_activity_of_Apis_dorsata_honey_from_Thailand',
        note: 'Confirms the antimicrobial potency of wild Apis dorsata honey harvested by traditional communities from pristine forest reserves',
      },
    ],
  },
  {
    honey: 'Raw vs Processed Honey',
    accent: '#2C2417',
    tag: 'Why Raw Matters',
    icon: '🔬',
    claim: 'Heat vs. Healing: How Commercial Processing Kills Honey\'s Natural Enzymes and Bioactive Integrity',
    science: 'Standard commercial honeys are ultra-filtered and pasteurized at high temperatures to prevent crystallization, which completely destroys fragile, heat-sensitive enzymes (like amylase, catalase, and glucose oxidase) and drastically lowers total phenolic content. Raw, unheated forest honey preserves these "living enzymes" and natural antioxidants, allowing them to effectively neutralize systemic oxidative stress and support metabolic health.',
    studies: [
      {
        title: 'A Review on the Effect of Processing Temperature and Time Duration on Commercial Honey Quality',
        journal: 'ResearchGate',
        href: 'https://www.researchgate.net/publication/338821626_A_Review_on_the_Effect_of_Processing_Temperature_and_Time_duration_on_Commercial_Honey_Quality',
        note: 'Quantifies how thermal heat processing and adulteration destroy enzyme activity, phenolic content, and overall honey quality',
      },
      {
        title: 'Honey as an antioxidant therapy to reduce cognitive ageing',
        journal: 'Iranian Journal of Basic Medical Sciences / ResearchGate',
        href: 'https://www.researchgate.net/publication/339769285_Honey_as_an_antioxidant_therapy_to_reduce_cognitive_ageing',
        note: 'Demonstrates how raw honey combats oxidative stress and systemic ageing — properties destroyed by commercial heat processing',
      },
      {
        title: 'Physicochemical and antioxidant properties of honeys produced by Apis cerana, Apis dorsata and Apis mellifera',
        journal: 'BMC Complementary Medicine / NIH PubMed Central',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3598513/',
        note: 'Comparative analysis of physicochemical and antioxidant properties of wild forest honey (Apis dorsata) versus clinical Manuka honey standards',
      },
    ],
  },
];

const CERTIFICATIONS = [
  {
    name: 'NABL Accredited Lab Testing',
    icon: '🧪',
    desc: 'Every production batch is independently tested at a National Accreditation Board for Testing and Calibration Laboratories (NABL) accredited facility for purity, moisture content, HMF levels, adulteration markers, and absence of antibiotics. Lab test reports are available in the respective product section.',
  },
  {
    name: 'NPOP APEDA Organic Certification',
    icon: '🌿',
    desc: 'Our sourcing practices and apiaries are certified under the National Programme for Organic Production (NPOP), governed by APEDA (Agricultural and Processed Food Products Export Development Authority). This certifies that our wild forest honeys are free from synthetic pesticides, antibiotics, and chemical treatments.',
  },
  {
    name: 'FSSAI Registered',
    icon: '✅',
    desc: 'SUMOSTA is registered with the Food Safety and Standards Authority of India (FSSAI). Our products meet all mandated quality parameters & thresholds prescribed under Indian Food Safety law.',
  },
];

export default function EvidenceHubPage() {
  useEffect(() => {
    const reveal = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          el.classList.add('revealed');
        }
      });
    };
    window.addEventListener('scroll', reveal, { passive: true });
    reveal();
    return () => window.removeEventListener('scroll', reveal);
  }, []);

  return (
    <div style={{ background: '#FFFDF8', fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif', color: '#2C2417', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: '#1A150E', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23F5A623' stroke-width='1'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#FFCC66', fontWeight: 700, margin: '0 0 20px' }}>Evidence Hub</p>
          <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.8rem)', lineHeight: 1.1, color: '#FFFDF8', margin: '0 0 24px' }}>
            In a world of marketing claims,<br />we chose scientific facts.
          </h1>
          <p style={{ fontSize: '17px', color: '#C4B39A', lineHeight: 1.75, maxWidth: '680px', margin: '0 auto 40px' }}>
            Every claim we make about our honeys is backed by peer-reviewed research, NABL-certified lab testing, and organic certification. This page is our commitment to transparency — a living record of the science behind SUMOSTA.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#certifications" style={{ background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '14px', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-bricolage), sans-serif' }}>View Certifications</a>
            <a href="#research" style={{ background: 'transparent', color: '#FFCC66', fontWeight: 600, fontSize: '14px', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(255,204,102,0.4)' }}>Read the Science</a>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div id="certifications" style={{ padding: '80px 24px', background: '#FDF6EC' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 12px' }}>Certifications & Compliance</p>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#2C2417', margin: 0 }}>Third-Party Verified. Every Batch.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="sum-cert-grid">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.name} data-reveal style={{ background: '#FFFDF8', borderRadius: '16px', border: '1px solid #F0E6D3', padding: '32px 36px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '36px', flexShrink: 0, lineHeight: 1 }}>{cert.icon}</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '18px', color: '#2C2417', margin: '0 0 10px' }}>{cert.name}</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#5C4A32', margin: 0 }}>{cert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Research Studies */}
      <div id="research" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4891A', fontWeight: 700, margin: '0 0 12px' }}>Research & Studies</p>
            <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#2C2417', margin: '0 0 16px' }}>The Science Behind Each Honey</h2>
            <p style={{ fontSize: '15px', color: '#5C4A32', maxWidth: '620px', margin: '0 auto', lineHeight: 1.75 }}>Links below lead to peer-reviewed sources on NIH PubMed, MDPI, ScienceDirect, and ResearchGate. We do not fabricate claims — we summarise published science.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {RESEARCH_STUDIES.map((study) => (
              <div key={study.honey} data-reveal style={{ background: '#FFFDF8', borderRadius: '20px', border: '1px solid #F0E6D3', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '28px 36px', background: '#FDF6EC', borderBottom: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{study.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '20px', color: '#2C2417', margin: '0 0 4px' }}>{study.honey}</h3>
                    <span style={{ display: 'inline-block', background: study.accent, color: '#FFFDF8', fontSize: '11px', fontWeight: 700, padding: '3px 12px', borderRadius: '999px', letterSpacing: '0.06em' }}>{study.tag}</span>
                  </div>
                </div>
                {/* Content */}
                <div style={{ padding: '28px 36px' }}>
                  {/* Claim */}
                  <div style={{ borderLeft: `3px solid ${study.accent}`, paddingLeft: '16px', marginBottom: '20px' }}>
                    <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '16px', color: study.accent, margin: 0 }}>{study.claim}</p>
                  </div>
                  {/* Science */}
                  <p style={{ fontSize: '14px', lineHeight: 1.85, color: '#5C4A32', margin: '0 0 24px' }}>{study.science}</p>
                  {/* Studies */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8B7355', fontWeight: 700, margin: 0 }}>Supporting Research</p>
                    {study.studies.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#FFF9F0', border: '1px solid #FFE0A8', borderRadius: '10px', padding: '14px 18px', textDecoration: 'none', transition: 'border-color 0.2s' }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#2C2417', lineHeight: 1.4 }}>{s.title}</span>
                        <span style={{ fontSize: '12px', color: '#D4891A', fontWeight: 600 }}>{s.journal}</span>
                        <span style={{ fontSize: '12px', color: '#8B7355' }}>{s.note}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#FDF6EC', padding: '40px 24px', borderTop: '1px solid #F0E6D3' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#8B7355', lineHeight: 1.7, margin: '0 0 20px' }}>
            <strong style={{ color: '#5C4A32' }}>Disclaimer:</strong> The scientific studies referenced on this page are independent third-party research published in peer-reviewed journals. SUMOSTA summarises these findings for educational purposes only. Our products are food products, not medicines, and are not intended to diagnose, treat, cure, or prevent any disease. Consult a qualified healthcare professional before using honey for specific health conditions.
          </p>
          <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '14px', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-bricolage), sans-serif' }}>
            Shop the Collection →
          </Link>
        </div>
      </div>

      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        [data-reveal].revealed { opacity: 1; transform: none; }
        @media (min-width: 768px) {
          .sum-cert-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
