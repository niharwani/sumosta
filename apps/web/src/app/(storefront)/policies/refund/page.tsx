import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Refund & Returns Policy' };

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-clash text-charcoal font-bold text-4xl mb-2">Refund & Returns Policy</h1>
      <p className="font-satoshi text-earth text-sm mb-10">Last updated: December 2024</p>

      <div className="space-y-8 font-satoshi text-bark leading-relaxed">
        <section className="bg-cream-warm border border-sand rounded-xl p-5">
          <h3 className="font-satoshi text-charcoal font-semibold mb-2">Our Promise</h3>
          <p className="text-earth">
            If you're unhappy for any reason, we want to make it right. Reach out within 7 days of delivery and we'll work with you to find the best solution — whether that's a replacement, store credit, or a full refund.
          </p>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">What We Accept Returns For</h2>
          <div className="space-y-3">
            {[
              { title: 'Damaged in transit', desc: 'If your order arrives physically damaged, we\'ll replace it or issue a full refund.' },
              { title: 'Wrong item received', desc: 'If we shipped the wrong product, we\'ll send the correct item at no additional cost.' },
              { title: 'Quality issues', desc: 'If the honey doesn\'t meet our standards — unusual taste, texture, or signs of contamination — contact us immediately.' },
              { title: 'Missing items', desc: 'If items are missing from your order, we\'ll ship them separately or refund the missing items.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3 p-4 bg-cream-warm rounded-xl border border-sand">
                <div className="w-2 h-2 rounded-full bg-honey-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-satoshi text-bark font-semibold">{title}</p>
                  <p className="font-satoshi text-earth text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">What We Cannot Accept Returns For</h2>
          <ul className="list-disc list-inside space-y-2 text-earth">
            <li>Change of mind (food products are non-returnable once delivered)</li>
            <li>Opened or partially consumed products (unless there's a quality issue)</li>
            <li>Incorrect delivery address provided by the customer</li>
            <li>Products not returned within 7 days of delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">How to Initiate a Return or Refund</h2>
          <ol className="list-decimal list-inside space-y-3 text-earth">
            <li>
              <span className="font-satoshi text-bark">Email us at </span>
              <a href="mailto:support@sumosta.com" className="text-honey-500 hover:underline">support@sumosta.com</a>
              <span className="font-satoshi text-bark"> within 7 days of delivery</span>
            </li>
            <li>Include your order number, photos of the issue, and a brief description</li>
            <li>Our team will respond within 24 hours (business days)</li>
            <li>If approved, we'll arrange pickup or advise on next steps</li>
            <li>Refunds are processed within 5–7 business days to your original payment method</li>
          </ol>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Refund Timelines</h2>
          <div className="border border-sand rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream-warm">
                <tr>
                  <th className="text-left px-5 py-3 font-satoshi text-earth text-sm font-semibold">Payment Method</th>
                  <th className="text-left px-5 py-3 font-satoshi text-earth text-sm font-semibold">Refund Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {[
                  ['UPI', '1–3 business days'],
                  ['Debit / Credit Card', '5–7 business days'],
                  ['Net Banking', '3–5 business days'],
                  ['SUMOSTA Store Credit', 'Immediate'],
                ].map(([method, time]) => (
                  <tr key={method}>
                    <td className="px-5 py-3 font-satoshi text-bark text-sm">{method}</td>
                    <td className="px-5 py-3 font-satoshi text-bark text-sm">{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-satoshi text-charcoal font-semibold text-lg mb-3">Contact for Returns</h2>
          <p>
            Email: <a href="mailto:support@sumosta.com" className="text-honey-500 hover:underline">support@sumosta.com</a>
            <br />
            Phone: +91 98765 43210 (Mon–Sat, 10 AM – 6 PM IST)
          </p>
        </section>
      </div>
    </div>
  );
}
