import type { Metadata } from 'next';
import HomeContent from './_content';

export const metadata: Metadata = {
  title: 'SUMOSTA — Nature\'s Golden Promise',
  description: 'Raw, single-origin honey sourced from India\'s wildest apiaries. Western Ghats, Sundarbans, Himalayan foothills. Nothing added, nothing taken.',
};

export default function HomePage() {
  return <HomeContent />;
}
