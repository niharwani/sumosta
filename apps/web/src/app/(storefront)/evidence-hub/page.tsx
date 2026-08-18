'use client';
import { useEffect } from 'react';
import Link from 'next/link';

type Study = { title: string; journal: string; href: string; note: string };
type Specimen = {
  honey: string;
  accent: string;
  tag: string;
  claim: string;
  science: string;
  studies: Study[];
};

const RESEARCH_STUDIES: Specimen[] = [
  {
    honey: 'Rare Dammer Bee Honey',
    accent: '#D4891A',
    tag: 'Low glycaemic',
    claim: 'The low-GI miracle: a rare sugar that prevents glucose spikes while fermenting in propolis.',
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
    claim: 'The prebiotic powerhouse: how honeydew honey nourishes gut microflora and outperforms nectar honey.',
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
    claim: 'Pure forest canopies: why wild rock bee honey has superior antimicrobial and radical-scavenging action.',
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
    tag: 'High antioxidant',
    claim: 'The science of colour: why deep, dark honeys carry the most powerful antioxidant shield.',
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
    claim: 'The biosphere effect: why tribal-harvested wild honey holds unmatched bioactive and mineral complexity.',
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
    tag: 'Why raw matters',
    claim: 'Heat vs healing: how commercial processing kills honey\'s natural enzymes and bioactive integrity.',
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

const CERTIFICATIONS: {
  name: string;
  desc: string;
  pdfUrl: string;
  pdfLabel: string;
}[] = [
  {
    name: 'NABL accredited lab testing',
    desc: 'Every production batch is independently tested at a National Accreditation Board for Testing and Calibration Laboratories (NABL) accredited facility for purity, moisture content, HMF levels, adulteration markers, and absence of antibiotics. Full consolidated report available below; per-SKU reports are on each product page.',
    pdfUrl: '/certificates/SUMOSTA_RawHoney_LabTestReport.pdf',
    pdfLabel: 'Consolidated lab report',
  },
  {
    name: 'NPOP APEDA organic certification',
    desc: 'Our sourcing practices and apiaries are certified under the National Programme for Organic Production (NPOP), governed by APEDA (Agricultural and Processed Food Products Export Development Authority). This certifies that our wild forest honeys are free from synthetic pesticides, antibiotics, and chemical treatments.',
    pdfUrl: '/certificates/Organic_Cert.pdf',
    pdfLabel: 'Organic certificate',
  },
  {
    name: 'FSSAI registered',
    desc: 'SUMOSTA is registered with the Food Safety and Standards Authority of India (FSSAI). Our products meet all mandated quality parameters and thresholds prescribed under Indian Food Safety law.',
    pdfUrl: '/certificates/YATRIS_FSSAI.pdf',
    pdfLabel: 'FSSAI certificate',
  },
];

const TOTAL_PAPERS = RESEARCH_STUDIES.reduce((n, s) => n + s.studies.length, 0);

// Two-digit zero-padded label. Kept out of JSX so grep-for-string stays clean.
const pad2 = (n: number) => n.toString().padStart(2, '0');

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
    <div className="eh-root">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="eh-hero">
        <div className="eh-hero-inner">
          <p className="eh-eyebrow eh-eyebrow--onDark">Evidence Hub</p>
          <h1 className="eh-h1">
            In a world of marketing claims,<br />we chose scientific facts.
          </h1>
          <p className="eh-hero-lede">
            Every claim we make is backed by peer-reviewed research, NABL-certified lab testing, and organic certification. This is our commitment to transparency — a living record of the science behind SUMOSTA.
          </p>
          <div className="eh-hero-ctas">
            <a href="#certifications" className="eh-btn eh-btn--primary">View certifications</a>
            <a href="#research" className="eh-btn eh-btn--ghost">Read the science</a>
          </div>
        </div>
      </section>

      {/* ── RECEIPTS STRIP ───────────────────────────────────────────── */}
      <section aria-label="At a glance" className="eh-strip">
        <div className="eh-strip-inner">
          <span className="eh-strip-item"><b>{pad2(RESEARCH_STUDIES.length)}</b> Specimens</span>
          <span className="eh-strip-dot" aria-hidden>·</span>
          <span className="eh-strip-item"><b>{pad2(TOTAL_PAPERS)}</b> Peer-reviewed papers</span>
          <span className="eh-strip-dot" aria-hidden>·</span>
          <span className="eh-strip-item"><b>{pad2(CERTIFICATIONS.length)}</b> Certifications</span>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────────────────────── */}
      <section id="certifications" className="eh-section eh-section--cream">
        <header className="eh-section-head" data-reveal>
          <p className="eh-eyebrow">Certifications</p>
          <h2 className="eh-h2">Third-party verified. Every batch.</h2>
        </header>

        <ol className="eh-cert-list">
          {CERTIFICATIONS.map((cert, i) => (
            <li key={cert.name} data-reveal className="eh-cert">
              <span className="eh-cert-num" aria-hidden>{pad2(i + 1)}</span>
              <div className="eh-cert-body">
                <h3 className="eh-cert-name">{cert.name}</h3>
                <p className="eh-cert-desc">{cert.desc}</p>
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eh-download"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{cert.pdfLabel}</span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── SPECIMENS INDEX + LIST ───────────────────────────────────── */}
      <section id="research" className="eh-section">
        <header className="eh-section-head" data-reveal>
          <p className="eh-eyebrow">Research</p>
          <h2 className="eh-h2">The science behind each honey.</h2>
          <p className="eh-section-lede">
            Six honeys. Fifteen peer-reviewed sources. Links below lead to NIH PubMed, MDPI, ScienceDirect, and ResearchGate — we don&apos;t fabricate claims, we summarise published science.
          </p>
        </header>

        {/* Jump-to index — useful on mobile with 6 long specimens */}
        <nav aria-label="Jump to specimen" className="eh-index" data-reveal>
          <span className="eh-index-label">Jump to</span>
          <ul className="eh-index-list">
            {RESEARCH_STUDIES.map((s, i) => (
              <li key={s.honey}>
                <a href={`#specimen-${i + 1}`} className="eh-index-chip">
                  <span className="eh-index-num">{pad2(i + 1)}</span>
                  <span className="eh-index-name">{s.honey}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="eh-specimens">
          {RESEARCH_STUDIES.map((s, i) => (
            <article
              key={s.honey}
              id={`specimen-${i + 1}`}
              data-reveal
              className="eh-specimen"
            >
              <header className="eh-specimen-head">
                <p className="eh-specimen-label" style={{ color: s.accent }}>
                  Specimen — {pad2(i + 1)}
                </p>
                <h3 className="eh-specimen-name">{s.honey}</h3>
                <p className="eh-specimen-tag">{s.tag}</p>
              </header>

              <div
                className="eh-claim"
                style={{ borderLeftColor: s.accent }}
              >
                <p className="eh-block-label">The claim</p>
                <p className="eh-claim-text">{s.claim}</p>
              </div>

              <div className="eh-science">
                <p className="eh-block-label">The science</p>
                <p className="eh-science-text">{s.science}</p>
              </div>

              <div className="eh-evidence">
                <p className="eh-block-label">
                  Evidence — {pad2(s.studies.length)} {s.studies.length === 1 ? 'paper' : 'papers'}
                </p>
                <ol className="eh-papers">
                  {s.studies.map((paper, j) => (
                    <li key={paper.href} className="eh-paper">
                      <a
                        href={paper.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eh-paper-link"
                      >
                        <span className="eh-paper-num" aria-hidden>{pad2(j + 1)}</span>
                        <span className="eh-paper-body">
                          <span className="eh-paper-title">{paper.title}</span>
                          <span className="eh-paper-journal">{paper.journal}</span>
                          <span className="eh-paper-note">{paper.note}</span>
                        </span>
                        <span className="eh-paper-arrow" aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── DISCLAIMER ───────────────────────────────────────────────── */}
      <section className="eh-disclaimer">
        <div className="eh-disclaimer-inner">
          <p className="eh-block-label">Disclaimer</p>
          <p className="eh-disclaimer-text">
            The scientific studies referenced on this page are independent third-party research published in peer-reviewed journals. SUMOSTA summarises these findings for educational purposes only. Our products are food products, not medicines, and are not intended to diagnose, treat, cure, or prevent any disease. Consult a qualified healthcare professional before using honey for specific health conditions.
          </p>
          <Link href="/shop" className="eh-btn eh-btn--primary eh-btn--wideOnMobile">
            Shop the collection →
          </Link>
        </div>
      </section>

      {/* ── STYLES ───────────────────────────────────────────────────── */}
      <style>{`
        .eh-root {
          background: #FFFDF8;
          color: #2C2417;
          min-height: 100vh;
          font-family: var(--font-manrope), var(--font-jakarta), system-ui, sans-serif;
        }

        /* Mono utility — the page's signature voice. System stack, no import. */
        .eh-eyebrow,
        .eh-strip-item,
        .eh-cert-num,
        .eh-specimen-label,
        .eh-block-label,
        .eh-paper-num,
        .eh-paper-journal,
        .eh-index-label,
        .eh-index-num {
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          letter-spacing: 0.05em;
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity .6s ease, transform .6s ease;
        }
        [data-reveal].revealed { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; transition: none; }
        }

        /* ── HERO ────────────────────────────────────────────────── */
        .eh-hero {
          background: #1A150E;
          padding: 56px 20px 44px;
          position: relative;
          overflow: hidden;
        }
        .eh-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.06;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23F5A623' stroke-width='1'/%3E%3C/svg%3E");
        }
        .eh-hero-inner {
          position: relative;
          max-width: 860px;
          margin: 0 auto;
        }
        .eh-eyebrow--onDark {
          color: #FFCC66;
        }
        .eh-eyebrow {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #D4891A;
          margin: 0 0 14px;
        }
        .eh-h1 {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 5vw, 3.6rem);
          line-height: 1.12;
          letter-spacing: -0.01em;
          color: #FFFDF8;
          margin: 0 0 18px;
        }
        .eh-hero-lede {
          font-size: 14px;
          line-height: 1.65;
          color: #C4B39A;
          margin: 0 0 28px;
        }
        .eh-hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Buttons */
        .eh-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 700;
          font-size: 13px;
          padding: 13px 22px;
          border-radius: 6px;
          text-decoration: none;
          transition: background .2s ease, color .2s ease, border-color .2s ease;
          min-height: 44px;
        }
        .eh-btn--primary {
          background: #F5A623;
          color: #1A150E;
        }
        .eh-btn--primary:hover { background: #D4891A; }
        .eh-btn--ghost {
          background: transparent;
          color: #FFCC66;
          border: 1px solid rgba(255,204,102,0.4);
        }
        .eh-btn--ghost:hover {
          border-color: #FFCC66;
          background: rgba(255,204,102,0.08);
        }
        .eh-btn--wideOnMobile {
          width: 100%;
          max-width: 320px;
        }

        /* ── RECEIPTS STRIP ─────────────────────────────────────── */
        .eh-strip {
          background: #FDF6EC;
          border-bottom: 1px solid #F0E6D3;
          padding: 14px 20px;
        }
        .eh-strip-inner {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 6px 10px;
          font-size: 11px;
          text-transform: uppercase;
          color: #5C4A32;
        }
        .eh-strip-item b {
          color: #D4891A;
          font-weight: 700;
        }
        .eh-strip-dot { color: #C4B39A; }

        /* ── SECTION SCAFFOLD ───────────────────────────────────── */
        .eh-section {
          padding: 56px 20px 64px;
        }
        .eh-section--cream {
          background: #FDF6EC;
          border-bottom: 1px solid #F0E6D3;
        }
        .eh-section-head {
          max-width: 1100px;
          margin: 0 auto 32px;
        }
        .eh-h2 {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: clamp(1.5rem, 3.5vw, 2.6rem);
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: #2C2417;
          margin: 0 0 8px;
        }
        .eh-section-lede {
          font-size: 14px;
          line-height: 1.6;
          color: #5C4A32;
          margin: 12px 0 0;
          max-width: 620px;
        }

        /* ── CERTIFICATIONS ─────────────────────────────────────── */
        .eh-cert-list {
          max-width: 1100px;
          margin: 0 auto;
          list-style: none;
          padding: 0;
          border-top: 1px solid #F0E6D3;
        }
        .eh-cert {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 14px;
          padding: 22px 0;
          border-bottom: 1px solid #F0E6D3;
        }
        .eh-cert-num {
          font-size: 22px;
          font-weight: 700;
          color: #D4891A;
          line-height: 1;
          padding-top: 3px;
        }
        .eh-cert-name {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 700;
          font-size: 17px;
          line-height: 1.3;
          color: #2C2417;
          margin: 0 0 8px;
          text-transform: capitalize;
        }
        .eh-cert-desc {
          font-size: 13.5px;
          line-height: 1.65;
          color: #5C4A32;
          margin: 0 0 14px;
        }
        .eh-download {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: #D4891A;
          text-decoration: none;
          border-bottom: 1px dashed rgba(212,137,26,0.35);
          padding-bottom: 2px;
          transition: color .2s ease, border-color .2s ease;
        }
        .eh-download:hover {
          color: #A66A10;
          border-color: #A66A10;
        }

        /* ── SPECIMENS INDEX (horizontal scroll pill row on mobile) ── */
        .eh-index {
          max-width: 1100px;
          margin: 0 auto 32px;
        }
        .eh-index-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #8B7355;
          display: block;
          margin-bottom: 8px;
        }
        .eh-index-list {
          list-style: none;
          padding: 0 0 4px;
          margin: 0;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x proximity;
        }
        .eh-index-list::-webkit-scrollbar { display: none; }
        .eh-index-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          background: #FFFDF8;
          border: 1px solid #F0E6D3;
          border-radius: 999px;
          text-decoration: none;
          color: #2C2417;
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
          flex-shrink: 0;
          scroll-snap-align: start;
          transition: border-color .2s ease, background .2s ease;
        }
        .eh-index-chip:hover {
          border-color: #F5A623;
          background: #FFF9F0;
        }
        .eh-index-num {
          font-size: 11px;
          font-weight: 700;
          color: #D4891A;
          flex-shrink: 0;
        }
        .eh-index-name {
          font-weight: 600;
        }

        /* ── SPECIMEN CARDS (flush document, hairline-separated) ─ */
        .eh-specimens {
          max-width: 1100px;
          margin: 0 auto;
          border-top: 1px solid #F0E6D3;
        }
        .eh-specimen {
          padding: 32px 0 40px;
          border-bottom: 1px solid #F0E6D3;
          /* offset for anchor jumps so header doesn't clip */
          scroll-margin-top: calc(var(--header-height) + 16px);
        }
        .eh-specimen-head {
          margin-bottom: 20px;
        }
        .eh-specimen-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0 0 6px;
        }
        .eh-specimen-name {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 800;
          font-size: 22px;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #2C2417;
          margin: 0 0 6px;
        }
        .eh-specimen-tag {
          font-size: 12px;
          color: #8B7355;
          margin: 0;
          font-style: italic;
          font-family: var(--font-instrument), serif;
        }

        /* Shared block label — mono, tiny, sets up each part */
        .eh-block-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #8B7355;
          margin: 0 0 8px;
        }

        .eh-claim {
          border-left: 3px solid #D4891A; /* overridden inline per specimen */
          padding: 4px 0 4px 14px;
          margin-bottom: 22px;
        }
        .eh-claim-text {
          font-family: var(--font-bricolage), sans-serif;
          font-weight: 700;
          font-size: 15.5px;
          line-height: 1.35;
          color: #2C2417;
          margin: 0;
        }
        .eh-science { margin-bottom: 24px; }
        .eh-science-text {
          font-size: 13.5px;
          line-height: 1.7;
          color: #5C4A32;
          margin: 0;
        }

        /* Papers */
        .eh-papers {
          list-style: none;
          padding: 0;
          margin: 12px 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .eh-paper-link {
          display: grid;
          grid-template-columns: 30px 1fr 20px;
          gap: 10px;
          align-items: start;
          padding: 12px 14px;
          background: #FFF9F0;
          border: 1px solid #F0E6D3;
          border-radius: 6px;
          text-decoration: none;
          transition: border-color .2s ease, background .2s ease;
        }
        .eh-paper-link:hover {
          border-color: #F5A623;
          background: #FFF0D6;
        }
        .eh-paper-num {
          font-size: 11px;
          font-weight: 700;
          color: #D4891A;
          padding-top: 2px;
        }
        .eh-paper-body {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .eh-paper-title {
          font-size: 13px;
          font-weight: 600;
          color: #2C2417;
          line-height: 1.35;
        }
        .eh-paper-journal {
          font-size: 11px;
          font-weight: 600;
          color: #D4891A;
        }
        .eh-paper-note {
          font-size: 11.5px;
          color: #8B7355;
          line-height: 1.5;
        }
        .eh-paper-arrow {
          font-size: 14px;
          color: #8B7355;
          padding-top: 2px;
        }
        .eh-paper-link:hover .eh-paper-arrow {
          color: #D4891A;
        }

        /* ── DISCLAIMER ─────────────────────────────────────────── */
        .eh-disclaimer {
          background: #FDF6EC;
          border-top: 1px solid #F0E6D3;
          padding: 36px 20px 48px;
        }
        .eh-disclaimer-inner {
          max-width: 720px;
          margin: 0 auto;
          text-align: left;
        }
        .eh-disclaimer-text {
          font-size: 12px;
          line-height: 1.65;
          color: #8B7355;
          margin: 0 0 24px;
        }

        /* ── TABLET & ABOVE ─────────────────────────────────────── */
        @media (min-width: 640px) {
          .eh-hero { padding: 80px 32px 64px; }
          .eh-hero-ctas { flex-direction: row; gap: 12px; }
          .eh-section { padding: 80px 32px; }
          .eh-cert { grid-template-columns: 60px 1fr; gap: 20px; padding: 28px 0; }
          .eh-cert-num { font-size: 26px; }
          .eh-cert-name { font-size: 19px; }
          .eh-cert-desc { font-size: 14px; }
          .eh-specimen { padding: 44px 0 52px; }
          .eh-specimen-name { font-size: 28px; }
          .eh-claim-text { font-size: 17px; }
          .eh-science-text { font-size: 14.5px; line-height: 1.75; }
          .eh-btn--wideOnMobile { width: auto; }
        }

        /* ── DESKTOP ────────────────────────────────────────────────
           Everything stays LEFT-aligned to preserve the documentary
           voice. Hero is the exception (centered — hero moment).
           Specimens split into a 2-col layout: argument left, evidence
           right, like an academic abstract with a citations sidebar. */
        @media (min-width: 1024px) {
          .eh-hero { padding: 120px 40px 96px; text-align: center; }
          .eh-hero-inner { text-align: center; }
          .eh-hero-lede { margin-left: auto; margin-right: auto; max-width: 640px; font-size: 15px; }
          .eh-hero-ctas { justify-content: center; }
          .eh-h1 { text-align: center; }

          .eh-strip { padding: 18px 40px; }
          .eh-strip-inner { justify-content: flex-start; font-size: 12px; }

          .eh-section { padding: 96px 40px; }
          .eh-section-head { margin: 0 auto 48px; max-width: 1100px; }
          .eh-section-lede { max-width: 640px; }

          .eh-cert { grid-template-columns: 72px 1fr 220px; gap: 32px; align-items: start; padding: 32px 0; }
          .eh-cert-num { font-size: 30px; padding-top: 4px; }
          .eh-cert-name { font-size: 22px; }
          .eh-cert-desc { font-size: 14px; margin-bottom: 0; }
          .eh-download { justify-self: end; align-self: start; margin-top: 4px; }

          .eh-index { margin: 0 auto 48px; }
          .eh-index-list { justify-content: flex-start; overflow-x: visible; flex-wrap: wrap; }

          .eh-specimen {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            grid-template-areas:
              "head     head"
              "claim    evidence"
              "science  evidence";
            column-gap: 56px;
            row-gap: 0;
            padding: 56px 0 64px;
          }
          .eh-specimen-head { grid-area: head; margin-bottom: 28px; }
          .eh-claim         { grid-area: claim; }
          .eh-science       { grid-area: science; }
          .eh-evidence      { grid-area: evidence; }
          .eh-specimen-name { font-size: 36px; }
          .eh-specimen-tag { font-size: 13px; }
          .eh-claim { padding-left: 18px; margin-bottom: 24px; }
          .eh-claim-text { font-size: 19px; line-height: 1.35; }
          .eh-science { margin-bottom: 0; }
          .eh-science-text { font-size: 15px; line-height: 1.8; }
          .eh-evidence { align-self: start; }

          .eh-disclaimer { padding: 56px 40px 72px; }
        }

        /* ── LARGE DESKTOP ─────────────────────────────────────── */
        @media (min-width: 1400px) {
          .eh-specimen-name { font-size: 42px; }
          .eh-claim-text { font-size: 21px; }
        }
      `}</style>
    </div>
  );
}
