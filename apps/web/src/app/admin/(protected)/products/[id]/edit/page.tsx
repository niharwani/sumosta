import dynamic from 'next/dynamic';

const EditProductContent = dynamic(() => import('./_content'), { ssr: false });

export function generateStaticParams() { return [{ id: '_placeholder' }]; }

export default function EditProductPage() {
  return <EditProductContent />;
}
