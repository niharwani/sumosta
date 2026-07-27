import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | SUMOSTA' };

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-[148px] pb-20 bg-[#FAF7F2]">
      <h1 className="font-jakarta font-bold text-charcoal text-4xl mb-2">Privacy Policy</h1>
      <p className="font-jakarta text-gray-400 text-sm mb-10">Last updated: July 2026</p>

      <div className="space-y-8 font-jakarta text-charcoal leading-relaxed text-justify">
        <p className="text-sm text-gray-700">
          SUMOSTA is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website <span className="font-semibold text-charcoal">www.sumosta.com</span> and purchase our products.
        </p>

        <section className="space-y-4">
          <h2 className="font-jakarta font-bold text-charcoal text-xl border-b border-[#E5E7EB] pb-2">1. Information We Collect</h2>
          <p className="text-sm text-gray-700">We collect information directly from you when you interact with our website. This includes:</p>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2 text-gray-700">
            <li>
              <span className="font-bold text-charcoal">Personal Identity Data:</span> Name, email address, phone number, shipping address, and billing address.
            </li>
            <li>
              <span className="font-bold text-charcoal">Payment Data:</span> Transaction details processed securely through our RBI-authorized third-party payment gateways (e.g., Razorpay, PayU). <span className="italic">We never store your credit card numbers, CVVs, or net banking passwords on our servers.</span>
            </li>
            <li>
              <span className="font-bold text-charcoal">Technical Data:</span> IP address, browser type, device details, and website browsing behavior collected through cookies to enhance your shopping experience.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-jakarta font-bold text-charcoal text-xl border-b border-[#E5E7EB] pb-2">2. How We Use Your Information</h2>
          <p className="text-sm text-gray-700">We use your data strictly to fulfill our commitment to you:</p>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2 text-gray-700">
            <li>To process, pack, track, and deliver your orders.</li>
            <li>To send transactional updates (order confirmation, shipping tracking).</li>
            <li>To share curated wellness insights, upcoming launches (like our spreads and lattes), and exclusive offers (only if you opt-in).</li>
            <li>To combat fraudulent transactions and ensure website safety.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-jakarta font-bold text-charcoal text-xl border-b border-[#E5E7EB] pb-2">3. Data Protection & Sharing</h2>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2 text-gray-700">
            <li><span className="font-bold text-charcoal">We never</span> sell, rent, or trade your personal data to third-party marketing companies.</li>
            <li>Your data is shared exclusively with trusted service providers necessary to operate our brand: courier and logistics partners (to deliver your honey) and secure payment processors.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-jakarta font-bold text-charcoal text-xl border-b border-[#E5E7EB] pb-2">4. Cookies</h2>
          <p className="text-sm text-gray-700">
            We use cookies to remember the items in your shopping cart, analyze web traffic, and personalize your experience. You can choose to disable cookies through your browser settings, though it may limit some features of our online store.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-jakarta font-bold text-charcoal text-xl border-b border-[#E5E7EB] pb-2">5. Your Rights</h2>
          <p className="text-sm text-gray-700">
            You have the right to access, update, or request the deletion of your personal data stored with us at any time. Please contact our Grievance Officer at <a href="mailto:hello@sumosta.com" className="text-[#F97316] hover:underline font-bold">hello@sumosta.com</a> for any privacy-related requests.
          </p>
        </section>
      </div>
    </div>
  );
}
