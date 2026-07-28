'use client';
import { useEffect } from 'react';
import Link from 'next/link';

const RESEARCH_STUDIES = [
  {
    honey: 'Rare Dammer Bee Honey',
    accent: '#D4891A',
    tag: 'Low Glycaemic',
    icon: '🧬',
    claim: 'Naturally low-glycaemic due to trehalulose — safe for metabolic health',
    science: 'Rare Dammer bee honey (Tetragonula species) is exceptionally rich in trehalulose — a disaccharide that produces a significantly lower glycaemic response than sucrose or standard fructose-glucose blends found in commercial honey. Trehalulose is absorbed slowly in the small intestine, reducing post-meal blood glucose spikes, making this honey particularly relevant for those managing metabolic health, insulin sensitivity, or pre-diabetic conditions.',
    studies: [
      {
        title: 'Trehalulose: a healthful approach to reduce the risk of obesity',
        journal: 'BMC Nutrition / NIH',
        href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8042873/',
        note: 'Demonstrates trehalulose\'s lower glycaemic index and metabolic benefits',
      },
      {
        title: 'Stingless bee honey: composition and biological activities',
        journal: 'MDPI Nutrients',
        href: 'https://www.mdpi.com/2072-6643/11/10/2300',
        note: 'Review of trehalulose-rich stingless bee honeys including Tetragonula spp.',
      },
    ],
  },
  {
    honey: 'Canopy Dew Forest Honey',
    accent: '#7A4D0B',
    tag: 'Prebiotic',
    icon: '🌿',
    claim: 'Rich in prebiotic oligosaccharides — feeds your gut microbiome',
    science: 'Forest honeydew honeys — produced when bees collect honeydew secretions from tree-feeding insects rather than flower nectar — contain a markedly different carbohydrate profile from floral honeys. They are particularly rich in oligosaccharides including erlose, raffinose, and melezitose, which function as prebiotics: feeding beneficial gut bacteria (Bifidobacterium and Lactobacillus) without being digested directly. This makes Canopy Dew honey functionally distinct from regular honey for gut health.',
    studies: [
      {
        title: 'Prebiotic properties of honeydew honey oligosaccharides',
        journal: 'Food Chemistry / ScienceDirect',
        href: 'https://www.sciencedirect.com/science/article/pii/S0308814620318161',
        note: 'Demonstrates oligosaccharide-driven prebiotic activity in honeydew honeys',
      },
      {
        title: 'Honeydew honeys: a review of composition and bioactivity',
        journal: 'ResearchGate / LWT Food Science',
        href: 'https://www.researchgate.net/publication/338290871_Honeydew_honeys',
        note: 'Comparative analysis of honeydew vs floral honey bioactive profiles',
      },
    ],
  },
  {
    honey: 'Organic Wild Forest Honey',
    accent: '#5C8A3C',
    tag: 'Antimicrobial',
    icon: '🛡️',
    claim: 'Potent natural antimicrobial — MIC tested against common pathogens',
    science: 'Raw wild forest honey exhibits well-documented antimicrobial activity through multiple mechanisms: hydrogen peroxide production (via glucose oxidase), low water activity, acidic pH (~3.9), and the presence of defensin-1 (bee-derived antimicrobial peptide). Studies on raw multi-floral wild honeys from biodiverse forest ecosystems consistently show minimum inhibitory concentration (MIC) activity against Staphylococcus aureus, E. coli, and Pseudomonas aeruginosa. This activity is heat-sensitive — it is substantially reduced or eliminated when honey is pasteurised above 40°C.',
    studies: [
      {
        title: 'Antibacterial activity of honey against clinical pathogens',
        journal: 'PLOS ONE / NIH',
        href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5948899/',
        note: 'Confirms MIC activity of raw honey against drug-resistant strains',
      },
      {
        title: 'Heat processing destroys honey antimicrobial properties',
        journal: 'Journal of Food Science / NIH',
        href: 'https://pubmed.ncbi.nlm.nih.gov/12690478/',
        note: 'Shows 65% loss of H₂O₂ activity after mild heating at 50°C for 3 hours',
      },
    ],
  },
  {
    honey: 'Bloodseed Forest Honey',
    accent: '#8B2500',
    tag: 'High Antioxidant',
    icon: '⚡',
    claim: 'Dark forest honey with exceptionally high FRAP antioxidant activity',
    science: 'Dark-coloured honeys consistently demonstrate higher total phenolic content (TPC) and stronger antioxidant activity (measured by FRAP and DPPH assays) compared to lighter floral honeys. Bloodseed honey, sourced from deep tribal forest ecosystems where bees forage on high-tannin, polyphenol-rich flora, shows antioxidant profiles comparable to Manuka and Buckwheat honeys — considered the gold standard for antioxidant-dense honeys. These phenolics include quercetin, kaempferol, caffeic acid, and ellagic acid.',
    studies: [
      {
        title: 'Correlation between honey colour intensity and antioxidant capacity',
        journal: 'Food Chemistry / NIH',
        href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7824684/',
        note: 'Establishes colour-antioxidant correlation across 40+ honey varieties',
      },
      {
        title: 'Polyphenol content in dark monofloral and polyfloral honeys',
        journal: 'MDPI Antioxidants',
        href: 'https://www.mdpi.com/2076-3921/9/9/806',
        note: 'TPC and FRAP analysis of dark forest and tribal honeys',
      },
    ],
  },
  {
    honey: 'Artisanal Heritage Honey',
    accent: '#5C4A32',
    tag: 'Wound Healing',
    icon: '🌸',
    claim: 'Traditional tribal use supported by wound-healing and antibacterial science',
    science: 'Artisanal wild honeys harvested by tribal communities — typically multi-floral, from high-altitude or ecologically intact forests — have been used for centuries in Ayurvedic and traditional tribal medicine for wound care, skin ailments, and respiratory infections. Modern research validates many of these uses: the combination of osmotic stress, H₂O₂ activity, and high phenolic content creates a triple-mechanism wound environment that inhibits biofilm formation, promotes tissue granulation, and reduces inflammatory cytokine expression.',
    studies: [
      {
        title: 'Honey for wound healing: systematic review of clinical evidence',
        journal: 'Cochrane Database / NIH',
        href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5389019/',
        note: 'Clinical evidence for raw honey in wound management and debridement',
      },
      {
        title: 'Traditional use and scientific validation of Indian wild honeys',
        journal: 'ResearchGate / Journal of Ethnopharmacology',
        href: 'https://www.researchgate.net/publication/322480521_Honey_in_traditional_and_modern_medicine',
        note: 'Documents tribal honey use in India against known pharmacological actions',
      },
    ],
  },
  {
    honey: 'Raw vs Processed Honey',
    accent: '#2C2417',
    tag: 'Why Raw Matters',
    icon: '🔬',
    claim: 'Processing destroys the very compounds that make honey beneficial',
    science: 'Commercial pasteurisation (typically 60–72°C for 15–30 minutes) and ultra-filtration are applied to extend shelf life and create a visually appealing, clear product. However, this processing cascade destroys glucose oxidase (cutting H₂O₂ production by 60–90%), denatures diastase and invertase enzymes (used as purity markers under FSSAI norms), removes pollen (eliminating traceability and allergy-desensitisation potential), and reduces total phenolic content by 30–50%. The result is a product that is microbiologically safer and shelf-stable, but is nutritionally closer to flavoured sugar syrup than to raw honey.',
    studies: [
      {
        title: 'Effect of thermal processing on bioactive compounds in honey',
        journal: 'Food Chemistry / ScienceDirect',
        href: 'https://www.sciencedirect.com/science/article/pii/S0308814618317758',
        note: 'Quantifies enzyme, phenolic, and antioxidant losses during pasteurisation',
      },
      {
        title: 'HMF formation during honey heating — quality implications',
        journal: 'NIH / Journal of Food Composition',
        href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5400751/',
        note: 'Shows HMF accumulation (toxicity marker) increases with heat processing',
      },
    ],
  },
];

const CERTIFICATIONS = [
  {
    name: 'NABL Accredited Lab Testing',
    icon: '🧪',
    desc: 'Every production batch is independently tested at a National Accreditation Board for Testing and Calibration Laboratories (NABL) accredited facility for purity, moisture content (≤18%), HMF levels, adulteration markers, and absence of antibiotics. The batch certificate is tied to the Batch ID printed on every jar.',
  },
  {
    name: 'NPOP APEDA Organic Certification',
    icon: '🌿',
    desc: 'Our sourcing practices and apiaries are certified under the National Programme for Organic Production (NPOP), governed by APEDA (Agricultural and Processed Food Products Export Development Authority). This certifies that our honeys are free from synthetic pesticides, antibiotics, and chemical treatments at both the apiary and processing level.',
  },
  {
    name: 'FSSAI Registered',
    icon: '✅',
    desc: 'SUMOSTA is registered with the Food Safety and Standards Authority of India (FSSAI). Our products meet all mandated quality parameters including diastase activity, moisture content, sucrose limits, and HMF thresholds prescribed under Indian food safety law.',
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
