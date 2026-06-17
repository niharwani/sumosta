export const SITE_CONFIG = {
  name:        'SUMOSTA',
  tagline:     "Nature's Golden Promise",
  url:         'https://sumosta.com',
  description: "Raw, unprocessed honey sourced from India's wildest apiaries. From hive to home, nothing added, nothing taken.",
  email:       'hello@sumosta.com',
  phone:       '+91 98765 43210',
  currency:    'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 500,
  defaultPageSize: 12,
};

export const NAV_LINKS = [
  { href: '/shop',                  label: 'Shop' },
  { href: '/shop/raw-honey',        label: 'Raw Honey' },
  { href: '/shop/honey-sticks',     label: 'Honey Sticks' },
  { href: '/shop/honey-spreads',    label: 'Spreads' },
  { href: '/shop/gift-boxes',       label: 'Gift Boxes' },
  { href: '/about',                 label: 'Our Story' },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: '/shop',                  label: 'All Products' },
    { href: '/shop/honey-sticks',     label: 'Honey Sticks' },
    { href: '/shop/honey-spreads',    label: 'Spreads' },
    { href: '/shop/gift-boxes',       label: 'Gift Boxes' },
    { href: '/shop?sort=newest',      label: 'New Arrivals' },
  ],
  company: [
    { href: '/about',   label: 'Our Story' },
    { href: '/about#sourcing',     label: 'Sourcing' },
    { href: '/about#sustainability', label: 'Sustainability' },
    { href: '/contact', label: 'Contact' },
  ],
  help: [
    { href: '/track',              label: 'Track Order' },
    { href: '/policies/shipping',  label: 'Shipping Policy' },
    { href: '/policies/refund',    label: 'Returns' },
    { href: '/policies/privacy',   label: 'Privacy Policy' },
    { href: '/policies/terms',     label: 'Terms of Service' },
  ],
} as const;

export const CATEGORIES = [
  { slug: 'raw-honey',      label: 'Raw Honey',      emoji: '🍯' },
  { slug: 'honey-sticks',   label: 'Honey Sticks',   emoji: '🍡' },
  { slug: 'honey-spreads',  label: 'Honey Spreads',  emoji: '🫙' },
  { slug: 'honeycomb',      label: 'Honeycomb',      emoji: '🐝' },
  { slug: 'gift-boxes',     label: 'Gift Boxes',     emoji: '🎁' },
] as const;

export const SORT_OPTIONS = [
  { value: 'featured',    label: 'Featured' },
  { value: 'newest',      label: 'Newest First' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
] as const;

export const MARQUEE_TEXT =
  'RAW HONEY • WILD SOURCED • UNPROCESSED • SINGLE ORIGIN • WESTERN GHATS • SUNDARBANS • HIMALAYAN • PURE NATURE •';

export const TRUST_BADGES = [
  { icon: '🌿', label: '100% Raw' },
  { icon: '🔬', label: 'Lab Tested' },
  { icon: '🚚', label: 'Free Shipping ₹500+' },
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
