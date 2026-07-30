import Link from 'next/link';

const SHOP_LINKS = [
  { label: 'All Products',       href: '/shop' },
  { label: 'Gift Boxes & Combos', href: '/shop/gift-boxes' },
];

const COMPANY_LINKS = [
  { label: 'Our Story',    href: '/about' },
  { label: 'Evidence Hub', href: '/evidence-hub' },
  { label: 'Contact',      href: '/contact' },
];

const HELP_LINKS = [
  { label: 'Track Order',      href: '/track' },
  { label: 'Shipping Policy',  href: '/policies/shipping' },
  { label: 'Returns',          href: '/policies/refund' },
  { label: 'Terms of Service', href: '/policies/terms' },
  { label: 'Privacy Policy',   href: '/policies/privacy' },
];

const linkStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#C4B39A',
  textDecoration: 'none',
};

const headingStyle: React.CSSProperties = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: '#FFCC66',
  fontWeight: 700,
  margin: '0 0 16px',
};

export default function Footer() {
  return (
    <footer
      style={{
        background: '#1A150E',
        padding: '64px 24px 32px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'overlay',
          opacity: 0.35,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        }}
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        <div className="sum-footer-grid" style={{ marginBottom: '48px' }}>
          {/* Brand */}
          <div>
            <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: '20px', color: '#FFFDF8' }}>
              SUMOSTA
            </span>
            <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', color: '#C4B39A', fontSize: '14px', margin: '8px 0 16px' }}>
              Indulgence that cares
            </p>
            <p style={{ fontSize: '12px', lineHeight: 1.7, color: '#C4B39A', margin: 0 }}>
              Raw, unprocessed honey sourced from India&apos;s wildest apiaries.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 style={headingStyle}>Shop</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SHOP_LINKS.map((l) => <Link key={l.label} href={l.href} style={linkStyle}>{l.label}</Link>)}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 style={headingStyle}>Company</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {COMPANY_LINKS.map((l) => <Link key={l.label} href={l.href} style={linkStyle}>{l.label}</Link>)}
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 style={headingStyle}>Help</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {HELP_LINKS.map((l) => <Link key={l.label} href={l.href} style={linkStyle}>{l.label}</Link>)}
            </div>
          </div>
        </div>

        {/* Certification logos row */}
        <div style={{ borderTop: '1px solid rgba(139,115,85,0.2)', paddingTop: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8B7355', fontWeight: 600, margin: '0 0 12px' }}>Certified & Compliant</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            {[
              { label: 'FSSAI', desc: 'Food Safety Certified' },
              { label: 'Make in India', desc: '🇮🇳 Proudly Indian' },
              { label: 'NPOP APEDA', desc: 'Organic Certified' },
              { label: 'NABL', desc: 'Lab Tested' },
            ].map((cert) => (
              <div key={cert.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFCC66', letterSpacing: '0.06em', border: '1px solid rgba(255,204,102,0.3)', borderRadius: '4px', padding: '3px 8px' }}>{cert.label}</span>
                <span style={{ fontSize: '9px', color: '#8B7355', letterSpacing: '0.04em' }}>{cert.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(139,115,85,0.2)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontSize: '12px', color: '#C4B39A', margin: 0 }}>© 2026 SUMOSTA · Yatris NutriFoods Pvt Ltd. All rights reserved.</p>
          <p style={{ fontSize: '12px', color: '#C4B39A', margin: 0 }}>UPI &bull; Visa &bull; Mastercard &bull; RuPay &bull; COD</p>
        </div>
      </div>

      <style>{`
        .sum-footer-grid { display:grid; grid-template-columns:1fr; gap:36px; }
        @media(min-width:1024px){ .sum-footer-grid{ grid-template-columns:repeat(4,1fr) !important; } }
      `}</style>
    </footer>
  );
}
