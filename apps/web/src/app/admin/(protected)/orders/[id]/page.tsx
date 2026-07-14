import dynamic from 'next/dynamic';

const Content = dynamic(() => import('./_content'), { ssr: false });

export function generateStaticParams() { return [{ id: '_placeholder' }]; }

export default function Page() { return <Content />; }
