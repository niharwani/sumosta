import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms & Conditions | SUMOSTA' };

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 bg-cream">
      <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">Terms & Conditions</h1>
      <p className="font-satoshi text-earth-light text-sm mb-10">Last updated: July 2026</p>

      <div className="space-y-8 font-satoshi text-bark leading-relaxed text-justify">
        <p className="text-sm">
          Welcome to <span className="font-bold text-charcoal font-clash">SUMOSTA</span>. This website, located at <span className="font-semibold text-charcoal">www.sumosta.com</span>, is operated by SUMOSTA. By accessing our site, browsing our philosophy, or purchasing our products, you agree to be bound by the following Terms & Conditions.
        </p>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">1. Accuracy of Information</h2>
          <p className="text-sm">
            While we strive to keep all details on our website completely accurate, we are delivering raw, organic, single-source honeys directly from nature. Because nature cannot be mass-standardized, slight natural variations in color, texture, and natural crystallization are completely normal across batches and do not constitute a product defect.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">2. Medical & Health Disclaimer</h2>
          <p className="text-sm">
            The information provided on this website, including narratives surrounding our upcoming Moringa and Golden Latte rituals, is intended for general educational, lifestyle, and dietary purposes. Our products are premium functional foods and are <span className="font-bold text-charcoal">not</span> intended to diagnose, treat, cure, or prevent any chronic medical condition. Always consult a certified healthcare professional if you have underlying health concerns or allergies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">3. Pricing and Availability</h2>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2">
            <li>All prices listed on our website are inclusive of applicable taxes (GST) unless stated otherwise.</li>
            <li>We reserve the right to modify prices or discontinue a product SKU without prior notice. In the event an item becomes unavailable after an order is placed, we will notify you and issue an immediate refund.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">4. Intellectual Property</h2>
          <p className="text-sm">
            All content on this website — including the SUMOSTA name, logo, custom tagline (<span className="italic">Indulgence that cares</span>), original brand philosophy illustrations, product descriptions, and web copy — is the exclusive intellectual property of SUMOSTA. Any unauthorized duplication, reproduction, or commercial exploitation is strictly prohibited under Indian Copyright and Trademark laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">5. Prohibited Use</h2>
          <p className="text-sm">
            You are prohibited from using our website to conduct illegal activities, transmit malware or viruses, harvest customer data, or bypass our website security measures.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">6. Governing Law & Jurisdiction</h2>
          <p className="text-sm">
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any legal disputes or claims arising out of the use of this website or the purchase of our products shall be subject to the exclusive jurisdiction of the courts in <span className="font-bold text-charcoal">Mumbai, Maharashtra</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
