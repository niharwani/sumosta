import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">Terms of Service</h1>
      <p className="font-satoshi text-earth text-sm mb-10">Last updated: December 2024</p>

      <div className="space-y-8 font-satoshi text-bark leading-relaxed">
        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using sumosta.com ("the Site") and purchasing products from SUMOSTA ("we," "us," "our"), you agree to be bound by these Terms of Service. If you disagree with any part, you may not access the Site.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">2. Products and Orders</h2>
          <p>
            All products are subject to availability. We reserve the right to limit quantities, refuse orders, or discontinue products at any time. Product images are for illustrative purposes; actual products may vary slightly.
          </p>
          <p className="mt-3">
            By placing an order, you confirm that all information provided is accurate and that you are authorized to use the payment method provided.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">3. Pricing and Payment</h2>
          <p>
            All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time. Orders are charged at the price displayed at the time of checkout.
          </p>
          <p className="mt-3">
            Payment is processed securely via PhonePe. SUMOSTA does not store payment card information.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">4. Shipping</h2>
          <p>
            We currently ship within India only. Estimated delivery times are 3–7 business days depending on your location. Delivery times are estimates, not guarantees. See our Shipping Policy for full details.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">5. Returns and Refunds</h2>
          <p>
            We accept returns within 7 days of delivery for damaged or incorrect items. Perishable food products cannot be returned unless they arrive damaged or spoiled. See our Refund Policy for full details.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">6. Intellectual Property</h2>
          <p>
            All content on the Site — including text, images, logos, and design — is owned by SUMOSTA and protected by copyright. You may not reproduce or use any content without our written permission.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">7. Limitation of Liability</h2>
          <p>
            SUMOSTA is not liable for any indirect, incidental, or consequential damages arising from your use of the Site or our products. Our maximum liability is limited to the amount you paid for the relevant order.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">9. Contact</h2>
          <p>
            Questions about these Terms? Email us at <a href="mailto:legal@sumosta.com" className="text-honey-500 hover:underline">legal@sumosta.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
