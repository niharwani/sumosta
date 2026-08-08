export const SITE_CONFIG = {
  name:        'SUMOSTA',
  tagline:     'Indulgence that cares',
  url:         'https://sumosta.com',
  description: "Raw, unprocessed honey sourced from India's wildest apiaries. From hive to home, nothing added, nothing taken.",
  email:       'hello@sumosta.com',
  phone:       '+91 9137881791',
  currency:    'INR',
  currencySymbol: '₹',
  defaultPageSize: 12,
};

export const NAV_LINKS = [
  { href: '/',              label: 'Home' },
  { href: '/shop',          label: 'Shop' },
  { href: '/gifting',       label: 'Gift Combos' },
  { href: '/about',         label: 'Our Story' },
  { href: '/evidence-hub',  label: 'Evidence Hub' },
] as const;

/**
 * Canonical navigation categories.
 * These slugs correspond directly to the filters the /shop page understands
 * (see productsApi.list in lib/api.ts and shop [[...slug]] content).
 * All chrome consumers (Navbar, MobileMenu, Footer, CategoryGrid) should
 * import from this array so the labels stay in lock-step with the storefront.
 */
export const NAV_CATEGORIES = [
  { slug: 'raw-honey',  label: 'Raw Honey',            href: '/shop/raw-honey' },
  { slug: 'gift-boxes', label: 'Gift Boxes & Combos',  href: '/shop/gift-boxes' },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: '/shop',              label: 'All Products' },
    { href: '/shop/raw-honey',    label: 'Raw Honey' },
    { href: '/shop/gift-boxes',   label: 'Gift Boxes & Combos' },
    { href: '/gifting',           label: 'Corporate Gifting' },
  ],
  company: [
    { href: '/about',             label: 'Our Story' },
    { href: '/about#sourcing',    label: 'Sourcing' },
    { href: '/evidence-hub',      label: 'Evidence Hub' },
    { href: '/contact',           label: 'Contact' },
  ],
  help: [
    { href: '/track',             label: 'Track Order' },
    { href: '/policies/shipping', label: 'Shipping Policy' },
    { href: '/policies/refund',   label: 'Returns' },
    { href: '/policies/privacy',  label: 'Privacy Policy' },
    { href: '/policies/terms',    label: 'Terms of Service' },
  ],
} as const;

/** @deprecated Use NAV_CATEGORIES instead. Kept for backwards compat. */
export const CATEGORIES = NAV_CATEGORIES;

export const SORT_OPTIONS = [
  { value: 'featured',    label: 'Featured' },
  { value: 'newest',      label: 'Newest First' },
] as const;

export const MARQUEE_TEXT =
  'RAW • AUTHENTIC • UNPROCESSED • SINGLE-SOURCE • SOURCED FROM INDIA\'S UNTOUCHED LANDSCAPES & PRISTINE FORESTS • ';

export const TRUST_BADGES = [
  { icon: '🌿', label: '100% Raw' },
  { icon: '🔬', label: 'Lab Tested' },
  { icon: '🍯', label: 'Single Origin' },
  { icon: '♻️', label: 'Eco Packaging' },
] as const;

export const SOCIAL_LINKS = [
  { platform: 'instagram', href: 'https://instagram.com/sumosta',        label: 'Follow on Instagram' },
  { platform: 'facebook',  href: 'https://facebook.com/sumosta',         label: 'Follow on Facebook'  },
  { platform: 'twitter',   href: 'https://twitter.com/sumosta',          label: 'Follow on Twitter'   },
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;
