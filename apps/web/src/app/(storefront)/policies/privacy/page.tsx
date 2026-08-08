import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | SUMOSTA' };

export default function PrivacyPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <h1 className="font-clash font-bold text-charcoal text-4xl mb-2">Privacy Policy</h1>
        <p className="font-satoshi text-earth text-sm mb-10">
          Last updated: <time dateTime="2026-07-01">July 2026</time>
        </p>

        <div className="space-y-8 font-satoshi text-bark leading-relaxed">
          <p className="text-sm">
            SUMOSTA is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website{' '}
            <span className="font-semibold text-charcoal">www.sumosta.com</span> and purchase our products.
          </p>

          <section className="space-y-4">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              1. Information We Collect
            </h2>
            <p className="text-sm">We collect information directly from you when you interact with our website. This includes:</p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>
                <span className="font-bold text-charcoal">Personal Identity Data:</span> Name, email address, phone number, shipping address, and billing address.
              </li>
              <li>
                <span className="font-bold text-charcoal">Payment Data:</span> Transaction details processed securely through our RBI-authorised third-party payment gateway (Razorpay). <span className="italic">We never store your credit card numbers, CVVs, or net banking passwords on our servers.</span>
              </li>
              <li>
                <span className="font-bold text-charcoal">Technical Data:</span> IP address, browser type, device details, and website browsing behaviour collected through cookies to enhance your shopping experience.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              2. How We Use Your Information
            </h2>
            <p className="text-sm">We use your data strictly to fulfil our commitment to you:</p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>To process, pack, track, and deliver your orders.</li>
              <li>To send transactional updates (order confirmation, shipping tracking).</li>
              <li>To share curated wellness insights, upcoming launches, and exclusive offers (only if you opt-in).</li>
              <li>To combat fraudulent transactions and ensure website safety.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              3. Data Protection &amp; Sharing
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>
                <span className="font-bold text-charcoal">We never</span> sell, rent, or trade your personal data to third-party marketing companies.
              </li>
              <li>
                Your data is shared exclusively with trusted service providers necessary to operate our brand: courier and logistics partners (to deliver your honey) and secure payment processors.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">4. Cookies</h2>
            <p className="text-sm">
              We use cookies to remember the items in your shopping cart, analyse web traffic, and personalise your experience. You can choose to disable cookies through your browser settings, though it may limit some features of our online store.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">5. Your Rights</h2>
            <p className="text-sm">
              You have the right to access, update, or request the deletion of your personal data stored with us at any time. Please contact our Grievance Officer at{' '}
              <a
                href="mailto:hello@sumosta.com"
                className="text-honey-600 hover:text-honey-500 underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
              >
                hello@sumosta.com
              </a>{' '}
              for any privacy-related requests.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
