'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function ConnectWithUs() {
  const { headline, address, pob, whatsapp, hours, email } = BRAND_CONTENT.connect;

  return (
    <section className="section-padding-sm bg-cream-warm border-t border-sand relative overflow-hidden" id="contact">
      {/* Background Accent */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-honey-200/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-600 text-xs font-bold uppercase tracking-[0.25em] block mb-2">
              Get In Touch
            </span>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.05}>
            <h2 className="font-clash text-charcoal font-bold mb-3 text-3xl sm:text-4xl tracking-tight">
              Connect With Us
            </h2>
          </RevealOnScroll>

          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <p className="font-satoshi text-bark text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {headline}
            </p>
          </RevealOnScroll>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Location Block */}
          <RevealOnScroll variant="slideInLeft" delay={0.15}>
            <div className="bg-cream border border-sand p-6 sm:p-8 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-sand">
                <div className="w-9 h-9 rounded-xl bg-honey-100 flex items-center justify-center text-honey-600">
                  <MapPin size={18} />
                </div>
                <h3 className="font-clash font-bold text-charcoal text-base uppercase tracking-wider">
                  Our Office Location
                </h3>
              </div>
              
              <div className="font-satoshi text-bark text-xs sm:text-sm leading-relaxed space-y-3">
                <div>
                  <p className="font-bold text-charcoal">Yatris NutriFoods Pvt Ltd</p>
                  <p className="text-earth-light uppercase text-[10px] tracking-wider font-semibold">Registered Address</p>
                  <p className="mt-1 text-bark/90">
                    603, Om Residency, Murar Road, Mulund West, Mumbai, Maharashtra, India - 400080
                  </p>
                </div>
                <div className="pt-3 border-t border-sand/40">
                  <p className="text-earth-light uppercase text-[10px] tracking-wider font-semibold">Office & Storage POB</p>
                  <p className="mt-1 text-bark/90">
                    Office no. 49, 5th floor, Steel Yard House, 67F, Sant Tukaram Road, Masjid Bunder (East), Mumbai - 400009
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Direct Contact Block */}
          <RevealOnScroll variant="slideInRight" delay={0.2}>
            <div className="bg-cream border border-sand p-6 sm:p-8 rounded-2xl space-y-5 shadow-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-sand">
                <div className="w-9 h-9 rounded-xl bg-honey-100 flex items-center justify-center text-honey-600">
                  <MessageSquare size={18} />
                </div>
                <h3 className="font-clash font-bold text-charcoal text-base uppercase tracking-wider">
                  Direct Contact
                </h3>
              </div>

              <div className="space-y-4 font-satoshi">
                {/* Phone / WhatsApp */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-50 flex items-center justify-center text-honey-600 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-earth-light uppercase tracking-wider font-bold">Call / WhatsApp</span>
                    <a href={`tel:${whatsapp}`} className="text-sm font-bold text-charcoal hover:text-honey-600 transition-colors">
                      {whatsapp}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-50 flex items-center justify-center text-honey-600 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-earth-light uppercase tracking-wider font-bold">Email Support</span>
                    <a href={`mailto:${email}`} className="text-sm font-bold text-charcoal hover:text-honey-600 transition-colors">
                      {email}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-50 flex items-center justify-center text-honey-600 shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-earth-light uppercase tracking-wider font-bold">Support Hours</span>
                    <p className="text-xs text-bark font-bold">{hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

        </div>

      </div>
    </section>
  );
}
