export const SITE_CONFIG = {
  name:        'SUMOSTA',
  tagline:     "Indulgence that cares",
  url:         'https://sumosta.com',
  description: "Raw, unprocessed honey sourced from India's wildest apiaries. From hive to home, nothing added, nothing taken.",
  email:       'hello@sumosta.com',
  phone:       '+91 9137881791',
  currency:    'INR',
  currencySymbol: '₹',
  defaultPageSize: 12,
};

export const NAV_LINKS = [
  { href: '/',                  label: 'Home' },
  { href: '/shop',              label: 'Shop' },
  { href: '/gifting',            label: 'Gift Bundles' },
  { href: '/about',             label: 'Our Story' },
  { href: '/evidence-hub',      label: 'Evidence Hub' },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: '/shop/raw-honey',        label: 'Raw Honey' },
    { href: '/shop/gift-boxes',       label: 'Gift Boxes & Combos' },
    { href: '/gifting',              label: 'Corporate Gifting' },
  ],
  company: [
    { href: '/about',   label: 'Our Story' },
    { href: '/about#sourcing',     label: 'Sourcing' },
    { href: '/about#sustainability', label: 'Sustainability' },
    { href: '/contact', label: 'Contact' },
  ],
  help: [
    { href: '/policies/shipping',  label: 'Shipping Policy' },
    { href: '/policies/refund',    label: 'Returns' },
    { href: '/policies/privacy',   label: 'Privacy Policy' },
    { href: '/policies/terms',     label: 'Terms of Service' },
    { href: '/#faq',               label: 'FAQs' },
  ],
} as const;

export const CATEGORIES = [
  { slug: 'raw-honey',      label: 'Raw Honey',      emoji: '🍯' },
  { slug: 'gift-boxes',     label: 'Gift Boxes & Combos', emoji: '🎁' },
] as const;

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

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

