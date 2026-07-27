'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const ALL_PRODUCTS = [
  { id: 1, name: 'Western Ghats Raw Honey', category: 'Raw Honey', price: 599, compareAt: null },
  { id: 2, name: 'Himalayan Wild Honey', category: 'Raw Honey', price: 699, compareAt: null },
  { id: 3, name: 'Sundarbans Mangrove Honey', category: 'Raw Honey', price: 549, compareAt: null },
  { id: 4, name: 'Classic Honey Sticks — 10 Pack', category: 'Honey Sticks', price: 199, compareAt: null },
  { id: 5, name: 'Assorted Flavor Honey Sticks — 20 Pack', category: 'Honey Sticks', price: 449, compareAt: null },
  { id: 6, name: 'Cinnamon Honey Spread', category: 'Honey Spreads', price: 399, compareAt: null },
  { id: 7, name: 'Vanilla Bean Honey Spread', category: 'Honey Spreads', price: 399, compareAt: null },
  { id: 8, name: 'Cardamom Honey Spread', category: 'Honey Spreads', price: 399, compareAt: null },
  { id: 9, name: 'Turmeric Golden Honey Spread', category: 'Honey Spreads', price: 449, compareAt: null },
  { id: 10, name: 'Raw Honeycomb Piece', category: 'Honeycomb', price: 799, compareAt: null },
  { id: 11, name: 'The Essentials Gift Box', category: 'Gift Boxes', price: 1499, compareAt: 1799 },
  { id: 12, name: 'The Connoisseur Gift Box', category: 'Gift Boxes', price: 2999, compareAt: 3499 },
];

const CATEGORIES = ['All', 'Raw Honey', 'Honey Sticks', 'Honey Spreads', 'Gift Boxes'];

const SLUG_TO_CATEGORY: Record<string, string> = {
  'raw-honey': 'Raw Honey',
  'honey-sticks': 'Honey Sticks',
  'honey-spreads': 'Honey Spreads',
  'gift-boxes': 'Gift Boxes',
};

export default function ShopContent() {
  const params = useParams<{ slug?: string[] }>();
  const slugCat = params.slug?.[0] ? SLUG_TO_CATEGORY[params.slug[0]] ?? 'All' : 'All';

  const [category, setCategory] = useState(slugCat);
  const [sort, setSort] = useState('featured');
  const [transitioning, setTransitioning] = useState(false);
  const [filterStuck, setFilterStuck] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const filterTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Sticky filter bar + reveal
  useEffect(() => {
    const onScroll = () => {
      const stuck = window.scrollY > 190;
      setFilterStuck(stuck);

      // reveal
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          el.classList.add('revealed');
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeCategory = useCallback((cat: string) => {
    setTransitioning(true);
    clearTimeout(filterTimeout.current);
    filterTimeout.current = setTimeout(() => {
      setCategory(cat);
      setTransitioning(false);
    }, 180);
  }, []);

  const filtered = (() => {
    let list = category === 'All' ? ALL_PRODUCTS : ALL_PRODUCTS.filter((p) => p.category === category);
    list = [...list];
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  })();

  const activeLabel = category === 'All' ? '' : category;

  return (
    <div style={{ background: '#FFFDF8', fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif', color: '#2C2417', minHeight: '100vh' }}>

      {/* Page header */}
      <section style={{ padding: '150px 24px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <p style={{ fontSize: '13px', color: '#C4B39A', margin: '0 0 12px' }}>
          <Link href="/" style={{ color: '#C4B39A', textDecoration: 'none' }}>Home</Link> / Shop
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,4vw,3rem)', color: '#2C2417', margin: '0 0 8px' }}>The Collection</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'var(--font-instrument), serif', fontStyle: 'italic', fontSize: '18px', color: '#8B7355', margin: 0 }}>
                Showing {filtered.length} products{activeLabel ? ` in ${activeLabel}` : ''}
              </p>
              {activeLabel && (
                <button onClick={() => changeCategory('All')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF0D6', color: '#A66A10', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer' }}>
                  {activeLabel} ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,253,248,0.96)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #F0E6D3', padding: '14px 24px', boxShadow: filterStuck ? '0 4px 16px rgba(44,36,23,0.07)' : 'none', transition: 'box-shadow 0.3s ease' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => {
              const active = cat === category;
              return (
                <button key={cat} onClick={() => changeCategory(cat)} style={{ padding: '8px 18px', borderRadius: '999px', border: active ? '1px solid #F5A623' : '1px solid #F0E6D3', background: active ? '#F5A623' : '#FFFDF8', color: active ? '#1A150E' : '#5C4A32', fontSize: '13px', fontWeight: active ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
                  {cat}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ appearance: 'none', padding: '10px 34px 10px 16px', borderRadius: '8px', border: '1px solid #F0E6D3', background: '#FFFDF8', fontSize: '13px', color: '#5C4A32', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8B7355', fontSize: '10px' }}>▾</span>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <section style={{ padding: '48px 24px 96px', maxWidth: '1400px', margin: '0 auto' }}>
        {filtered.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '24px', opacity: transitioning ? 0 : 1, transition: 'opacity 0.18s ease' }} className="sum-shop-grid">
              {filtered.map((p) => {
                const hovered = hoveredId === p.id;
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    data-reveal
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,#FFF0D6 0px,#FFF0D6 14px,#FFF9F0 14px,#FFF9F0 28px)', border: '1px solid #F0E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '12px', transform: hovered ? 'scale(1.02)' : 'scale(1)', boxShadow: hovered ? '0 16px 32px rgba(212,137,26,0.18)' : 'none', transition: 'transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s ease' }}>
                      {p.compareAt && (
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#C4573A', color: '#FDE8E3', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>SALE</span>
                      )}
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '10px', letterSpacing: '0.06em', color: '#8B7355', textTransform: 'uppercase', padding: '0 16px' }}>product photo<br />{p.name}</span>
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#F5A623', color: '#1A150E', fontSize: '12px', fontWeight: 700, padding: '12px', textAlign: 'center', transform: hovered ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s cubic-bezier(.16,1,.3,1)' }}>Quick Add</span>
                    </div>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C4B39A', margin: '0 0 4px' }}>{p.category}</p>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#2C2417', margin: '0 0 6px' }}>{p.name}</h3>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#D4891A', margin: 0 }}>
                      ₹{p.price}
                      {p.compareAt && <span style={{ fontSize: '12px', color: '#C4B39A', textDecoration: 'line-through', fontWeight: 500, marginLeft: '6px' }}>₹{p.compareAt}</span>}
                    </p>
                  </Link>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '56px' }}>
              <button style={{ background: '#FFFDF8', border: '1px solid #F5A623', color: '#D4891A', fontWeight: 700, fontSize: '14px', padding: '14px 36px', borderRadius: '8px', cursor: 'pointer' }}>Load More</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '999px', background: '#FDF6EC', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🍯</div>
            <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: '20px', color: '#2C2417', margin: '0 0 8px' }}>No products found</h3>
            <p style={{ fontSize: '14px', color: '#8B7355', margin: '0 0 24px' }}>Try a different category or clear your filters.</p>
            <button onClick={() => changeCategory('All')} style={{ background: '#F5A623', color: '#1A150E', fontWeight: 700, fontSize: '14px', padding: '12px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Clear Filters</button>
          </div>
        )}
      </section>

      <style>{`
        @media (min-width: 640px) { .sum-shop-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (min-width: 1024px) { .sum-shop-grid { grid-template-columns: repeat(4,1fr) !important; } }
      `}</style>
    </div>
  );
}
