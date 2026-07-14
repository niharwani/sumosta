import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Return & Refund Policy | SUMOSTA' };

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 bg-cream">
      <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">Return & Refund Policy</h1>
      <p className="font-satoshi text-earth-light text-sm mb-10">Last updated: July 2026</p>

      <div className="space-y-8 font-satoshi text-bark leading-relaxed text-justify">
        
        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">Cancellations and Changes</h2>
          <p className="text-sm">
            You can cancel your order at any time before it ships. Once the order is dispatched from our warehouse, cancellations cannot be processed. To cancel, please email us immediately at <a href="mailto:hello@sumosta.com" className="text-honey-500 hover:underline font-bold">hello@sumosta.com</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">Return & Replacement Eligibility</h2>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2">
            <li>
              <span className="font-bold text-charcoal">Food Safety Mandate:</span> Due to the consumable nature of our products we do not accept returns on opened, unsealed, or used products.
            </li>
            <li>
              <span className="font-bold text-charcoal">When We Replace/Refund:</span> We will gladly issue a free replacement or full refund if you receive:
              <ol className="list-decimal pl-6 mt-2 space-y-1 font-normal">
                <li>A damaged or leaking container.</li>
                <li>An incorrect item or missing SKU.</li>
                <li>A product past its expiration date upon arrival.</li>
              </ol>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">How to Raise a Claim</h2>
          <p className="text-sm">
            If you encounter any of the issues listed above, please follow these steps within <span className="font-bold text-charcoal">48 hours</span> of receiving your order:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
            <li>Send an email to <a href="mailto:hello@sumosta.com" className="text-honey-500 hover:underline font-bold">hello@sumosta.com</a> with your <span className="font-bold">Order ID</span> in the subject line.</li>
            <li>Attach a clear <span className="font-bold text-charcoal">unboxing video or photographs</span> showing the damage, leakage, or incorrect item.</li>
            <li>Our quality care team will review your claim within 48 hours. If approved, a fresh replacement will be dispatched, or a full refund will be processed as the case may be.</li>
            <li>
              In case of returns, please note that returns will need to be sent to the following address:
              <div className="bg-cream-warm border border-sand p-4 rounded-xl mt-2 font-mono text-xs">
                Office no.6, 3rd Floor, Lalji Ramji Building, Bhat Bazar, Chinch Bunder, Mandvi, Mumbai – 400009.
              </div>
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-clash text-charcoal font-bold text-xl border-b border-sand pb-2">Refunds (If Applicable)</h2>
          <p className="text-sm">
            Approved refunds will be credited back to your original payment method (Credit/Debit Card, Net Banking, UPI) within <span className="font-bold text-charcoal">8 to 10 business days</span>, depending on your bank&apos;s processing cycles. For COD orders, refunds will be issued via bank transfer or UPI link into your verified account.
          </p>
        </section>
      </div>
    </div>
  );
}
