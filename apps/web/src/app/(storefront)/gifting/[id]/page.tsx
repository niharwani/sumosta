import ComboDetailContent from './_content';

export function generateStaticParams() {
  return [
    'fivepack-elements',
    'quartet-main',
    'trio-wellness',
    'trio-terroir',
    'duo-bloodseed-artisanal',
    'duo-wild-artisanal',
    'duo-bloodseed-wild',
    'duo-dammer-dew',
  ].map((id) => ({ id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <ComboDetailContent id={params.id} />;
}
