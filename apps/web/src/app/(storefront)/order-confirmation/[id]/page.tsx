export function generateStaticParams() { return [{ id: '_placeholder' }]; }
import { Suspense } from 'react';
import Content from './_content';
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <Content />
    </Suspense>
  );
}
