import type { Metadata } from 'next';
import EvidenceHub from '@/components/home/EvidenceHub';

export const metadata: Metadata = {
  title: "SUMOSTA Evidence Hub — Lab Verified Honey Purity",
  description: "Verify batch-wise NABL lab certificates, organic certificates, and purity reports for your SUMOSTA raw honey purchase.",
};

export default function EvidenceHubPage() {
  return (
    <div className="pt-16">
      <EvidenceHub />
    </div>
  );
}
