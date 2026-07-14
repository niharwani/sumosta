import ShopPageContent from './_content';

export function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['raw-honey'] },
    { slug: ['superfoods'] },
    { slug: ['spreads'] },
    { slug: ['honey-nuts'] },
    { slug: ['gift-boxes'] },
  ];
}

export default function ShopPage() {
  return <ShopPageContent />;
}
