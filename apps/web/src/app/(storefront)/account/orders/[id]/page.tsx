// This route uses static export (`next.config.js` sets `output: 'export'`).
// Because the order ID is only known at runtime (fetched by the client shell),
// we ship a single placeholder param at build time and let the client-side
// `_content.tsx` read the real ID from `useParams()`.
//
// Next.js dev mode also visits this file when navigating to any /account/orders/*
// route — the placeholder param is never actually rendered as a linked page in production.
//
// If/when this app moves off `output: 'export'`, replace this file with:
//   export const dynamic = 'force-dynamic';
export function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

import Content from './_content';

export default function Page() {
  return <Content />;
}
