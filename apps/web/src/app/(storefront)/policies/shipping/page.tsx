import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping & Delivery Policy | SUMOSTA' };

export default function ShippingPage() {
  return (
    <div className="bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <h1 className="font-clash font-bold text-charcoal text-4xl mb-2">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="font-satoshi text-earth text-sm mb-10">
          Last updated: <time dateTime="2026-07-01">July 2026</time>
        </p>

        <div className="space-y-8 font-satoshi text-bark leading-relaxed">
          <section className="bg-honey-50 border border-honey-200 p-6 rounded-2xl">
            <p className="font-satoshi text-honey-600 font-semibold text-center text-sm md:text-base m-0">
              Thank you for choosing SUMOSTA. We are committed to delivering our products straight from nature to your dining table as safely and swiftly as possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Processing &amp; Timeline
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>
                <span className="font-bold text-charcoal">Order Processing:</span> All orders are processed within 24 to 48 business hours (excluding Sundays and National Holidays) after receiving your order confirmation. If for some reason the dispatch is delayed beyond the stipulated 48 hours, our customers will be informed about the reason for the delay and given an expected dispatch date.
              </li>
              <li>
                <span className="font-bold text-charcoal">Transit Times:</span>
                <ul className="list-[circle] pl-6 mt-2 space-y-1">
                  <li>
                    <span className="font-semibold text-charcoal">Metro Cities:</span> 3 to 5 business days.
                  </li>
                  <li>
                    <span className="font-semibold text-charcoal">Rest of India:</span> 5 to 7 business days.
                  </li>
                  <li>
                    <span className="italic">Note:</span> Remote regions or regions experiencing unexpected weather disruptions may take up to 10 business days.
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Shipping Charges
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>
                <span className="font-bold text-charcoal">Standard Shipping:</span> We offer free shipping on all orders above{' '}
                <span className="font-bold text-honey-600">₹499</span>.
              </li>
              <li>
                <span className="font-bold text-charcoal">Orders below the threshold:</span> A flat shipping fee of{' '}
                <span className="font-bold text-charcoal">₹49</span> will be applied at checkout.
              </li>
              <li>
                <span className="font-bold text-charcoal">Cash on Delivery (COD):</span> COD is available for select pin codes. An additional COD handling fee of{' '}
                <span className="font-bold text-charcoal">₹69</span> shall apply to COD orders.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Cash On Delivery
            </h2>
            <p className="text-sm">
              While COD is an available payment option, SUMOSTA reserves the right to decline the dispatch of COD orders if the authenticity of the order is in doubt. This measure is put in place to ensure genuine and transparent transactions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Tracking Your Order
            </h2>
            <p className="text-sm">
              Once your order has shipped, you will receive an automated email and/or SMS containing your tracking number and a link to track your package live.
            </p>
          </section>

          <section className="space-y-3 bg-sage-light border border-sage/30 p-6 rounded-2xl">
            <h2 className="font-clash font-bold text-charcoal text-xl m-0">Damaged in Transit</h2>
            <p className="text-sm m-0">
              We use heavy-duty, eco-conscious packaging to protect our glass jars. However, if your package arrives visibly damaged, leaking, or broken, please take a photo or video immediately and contact us at{' '}
              <a
                href="mailto:hello@sumosta.com"
                className="text-honey-600 hover:text-honey-500 underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
              >
                hello@sumosta.com
              </a>{' '}
              within <span className="font-bold text-charcoal">48 hours of delivery</span> so we can issue a complimentary replacement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Delivery Delays
            </h2>
            <p className="text-sm">
              While we commit to a prompt dispatch, the delivery duration largely depends on the efficiency of the courier service. SUMOSTA is not liable for any delays instigated by courier companies. For real-time updates, customers can utilise the tracking number provided to them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-clash font-bold text-charcoal text-xl border-b border-sand pb-2">
              Policy Modifications
            </h2>
            <p className="text-sm">
              SUMOSTA reserves the right to alter this Shipping Policy as and when required without prior notification. To stay updated on our shipping guidelines, we recommend that customers periodically check this Shipping Policy.
            </p>
          </section>

          <section className="bg-cream-warm border border-sand p-6 rounded-2xl mt-8">
            <p className="text-xs text-bark text-center leading-relaxed m-0">
              For further inquiries or clarifications about our shipping procedures, our customer service team is always available. We are here to ensure your shopping experience is as smooth as honey.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
