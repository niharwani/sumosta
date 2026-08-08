import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Return & Refund Policy | SUMOSTA' };

export default function RefundPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <h1 className="font-clash font-bold text-charcoal text-4xl mb-2">
          Return &amp; Refund Policy
        </h1>
        <p className="font-satoshi text-earth text-sm mb-10">
          Last updated: <time dateTime="2026-07-01">July 2026</time>
        </p>

        <div className="space-y-8 font-satoshi text-bark leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Cancellations and Changes
            </h2>
            <p className="text-sm">
              You can cancel your order at any time before it ships. Once the order is dispatched from our warehouse, cancellations cannot be processed. To cancel, please email us immediately at{' '}
              <a
                href="mailto:hello@sumosta.com"
                className="text-honey-600 hover:text-honey-500 underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
              >
                hello@sumosta.com
              </a>.
            </p>
          </section>

          <section className="space-y-4 bg-terracotta-light border border-terracotta/30 p-6 rounded-2xl">
            <h2 className="font-clash font-bold text-charcoal text-xl m-0">
              Return &amp; Replacement Eligibility
            </h2>
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
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              How to Raise a Claim
            </h2>
            <p className="text-sm">
              If you encounter any of the issues listed above, please follow these steps within{' '}
              <span className="font-bold text-charcoal">48 hours</span> of receiving your order:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
              <li>
                Send an email to{' '}
                <a
                  href="mailto:hello@sumosta.com"
                  className="text-honey-600 hover:text-honey-500 underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
                >
                  hello@sumosta.com
                </a>{' '}
                with your <span className="font-bold">Order ID</span> in the subject line.
              </li>
              <li>
                Attach a clear{' '}
                <span className="font-bold text-charcoal">unboxing video or photographs</span> showing the damage, leakage, or incorrect item.
              </li>
              <li>
                Our quality care team will review your claim within 48 hours. If approved, a fresh replacement will be dispatched, or a full refund will be processed as the case may be.
              </li>
              <li>
                In case of returns, please note that returns will need to be sent to the following address:
                <div className="bg-cream-warm border border-sand p-4 rounded-xl mt-2 font-mono text-xs text-charcoal">
                  Office no. 49, 5th floor, Steel Yard House, 67F, Sant Tukaram Road, Masjid Bunder (East), Mumbai - 400009.
                </div>
              </li>
            </ol>
          </section>

          <section className="space-y-3 bg-sage-light border border-sage/30 p-6 rounded-2xl">
            <h2 className="font-clash font-bold text-charcoal text-xl m-0">
              Refunds (If Applicable)
            </h2>
            <p className="text-sm m-0">
              Approved refunds will be credited back to your original payment method (Credit/Debit Card, Net Banking, UPI) within{' '}
              <span className="font-bold text-charcoal">8 to 10 business days</span>, depending on your bank&apos;s processing cycles. For COD orders, refunds will be issued via bank transfer or UPI link into your verified account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
