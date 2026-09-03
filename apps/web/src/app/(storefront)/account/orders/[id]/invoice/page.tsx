// Static export shell — mirrors the parent `[id]/page.tsx` pattern.
// The real order ID is read at runtime by `_content.tsx` from the pathname.
export function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

import Content from './_content';

export default function Page() {
  return <Content />;
}
