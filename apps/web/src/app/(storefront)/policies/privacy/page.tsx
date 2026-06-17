import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">Privacy Policy</h1>
      <p className="font-satoshi text-earth text-sm mb-10">Last updated: December 2024</p>

      <div className="prose-sumosta space-y-8 font-satoshi text-bark leading-relaxed">
        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">1. Information We Collect</h2>
          <p>
            When you use SUMOSTA, we collect information you provide directly to us, including your name, email address, phone number, and shipping address when you create an account or place an order. We also collect payment information (processed securely through PhonePe — we never store card details) and your order history.
          </p>
          <p className="mt-3">
            We automatically collect certain information when you visit our website, including your IP address, browser type, pages viewed, and referring URLs. This helps us improve our site and detect fraud.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-earth">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates via email and SMS</li>
            <li>Respond to your customer service requests</li>
            <li>Send you marketing emails (only with your consent, unsubscribe anytime)</li>
            <li>Improve our products, website, and customer experience</li>
            <li>Detect and prevent fraud and unauthorized access</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">3. Information Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal information with third parties for their marketing purposes. We share your information only with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-earth mt-3">
            <li><strong>Shipping partners</strong> — to deliver your orders</li>
            <li><strong>PhonePe</strong> — to process payments securely</li>
            <li><strong>Resend</strong> — to send transactional emails</li>
            <li><strong>Cloudflare</strong> — our infrastructure provider</li>
            <li><strong>Law enforcement</strong> — if required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">4. Data Security</h2>
          <p>
            We use industry-standard encryption (TLS/HTTPS) for all data in transit. Passwords are hashed using bcrypt. We never store payment card numbers. Access to customer data is restricted to authorized personnel only.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-earth mt-3">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Lodge a complaint with the relevant data protection authority</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at <a href="mailto:privacy@sumosta.com" className="text-honey-500 hover:underline">privacy@sumosta.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">6. Cookies</h2>
          <p>
            We use essential cookies to keep you logged in and remember your cart. We use analytics cookies to understand how visitors use our site (you can opt out). We do not use third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">7. Contact</h2>
          <p>
            For privacy questions, contact us at <a href="mailto:privacy@sumosta.com" className="text-honey-500 hover:underline">privacy@sumosta.com</a> or write to us at our registered address in Mumbai, Maharashtra, India.
          </p>
        </section>
      </div>
    </div>
  );
}
