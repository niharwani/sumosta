import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping Policy' };

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">Shipping Policy</h1>
      <p className="font-satoshi text-earth text-sm mb-10">Last updated: December 2024</p>

      <div className="space-y-8 font-satoshi text-bark leading-relaxed">
        <section className="bg-honey-50 border border-honey-100 rounded-xl p-5">
          <p className="font-satoshi text-honey-700 font-semibold">
            🍯 Free shipping on all orders above ₹500 within India.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Shipping Charges</h2>
          <div className="border border-sand rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream-warm">
                <tr>
                  <th className="text-left px-5 py-3 font-satoshi text-earth text-sm font-semibold">Order Value</th>
                  <th className="text-left px-5 py-3 font-satoshi text-earth text-sm font-semibold">Shipping Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                <tr>
                  <td className="px-5 py-3 font-satoshi text-bark text-sm">Below ₹500</td>
                  <td className="px-5 py-3 font-satoshi text-bark text-sm">₹99</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-satoshi text-bark text-sm">₹500 and above</td>
                  <td className="px-5 py-3 font-satoshi text-sage font-semibold text-sm">FREE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Delivery Timelines</h2>
          <div className="border border-sand rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream-warm">
                <tr>
                  <th className="text-left px-5 py-3 font-satoshi text-earth text-sm font-semibold">Location</th>
                  <th className="text-left px-5 py-3 font-satoshi text-earth text-sm font-semibold">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {[
                  ['Metro cities (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata)', '2–4 business days'],
                  ['Tier 2 cities', '3–5 business days'],
                  ['Tier 3 cities and towns', '5–7 business days'],
                  ['Remote / difficult-to-access areas', '7–10 business days'],
                ].map(([loc, time]) => (
                  <tr key={loc}>
                    <td className="px-5 py-3 font-satoshi text-bark text-sm">{loc}</td>
                    <td className="px-5 py-3 font-satoshi text-bark text-sm">{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-satoshi text-earth text-sm mt-3">
            Delivery times are estimates and may vary during peak seasons, festivals, or due to factors beyond our control.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Order Processing</h2>
          <p>
            Orders are processed within 1–2 business days of payment confirmation. You'll receive a confirmation email with your order number immediately after purchase, and a shipping email with tracking details once your order is dispatched.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Order Tracking</h2>
          <p>
            Track your order at <a href="/track" className="text-honey-500 hover:underline">sumosta.com/track</a> using your order number and registered email or phone. You'll also receive SMS and email updates at key milestones.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Shipping Partners</h2>
          <p>
            We ship with trusted logistics partners including BlueDart, Delhivery, and Xpressbees. The shipping partner is selected based on your location to ensure the fastest and safest delivery.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Damaged in Transit</h2>
          <p>
            If your order arrives damaged, please photograph the package and products immediately and contact us within 48 hours at <a href="mailto:support@sumosta.com" className="text-honey-500 hover:underline">support@sumosta.com</a>. We'll arrange a replacement or refund promptly.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Currently Shipping To</h2>
          <p>
            We currently ship to all serviceable pin codes within India. We do not ship internationally at this time. Enter your pin code at checkout to confirm serviceability.
          </p>
        </section>
      </div>
    </div>
  );
}
