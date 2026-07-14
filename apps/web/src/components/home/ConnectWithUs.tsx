'use client';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { BRAND_CONTENT } from '@/lib/content';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ConnectWithUs() {
  const { headline, address, pob, whatsapp, hours, email } = BRAND_CONTENT.connect;

  return (
    <section className="py-16 bg-cream border-t border-sand relative overflow-hidden" id="contact">
      {/* Decorative background accent */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-honey-200/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Compact Header */}
        <div className="text-center mb-10">
          <RevealOnScroll variant="fadeUp">
            <span className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.2em] block mb-2 font-bold">
              Get in Touch
            </span>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.05}>
            <h2 className="font-clash text-charcoal font-bold mb-3 text-3xl md:text-4xl leading-tight">
              Connect with Us
            </h2>
          </RevealOnScroll>
          <RevealOnScroll variant="fadeUp" delay={0.1}>
            <p className="font-satoshi text-bark text-sm leading-relaxed max-w-md mx-auto">
              {headline}
            </p>
          </RevealOnScroll>
        </div>

        {/* Streamlined Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Location Block */}
          <RevealOnScroll variant="fadeUp" delay={0.15}>
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-sand">
                <MapPin size={18} className="text-honey-500" />
                <h3 className="font-clash font-bold text-charcoal text-base uppercase tracking-wider">
                  Our Location
                </h3>
              </div>
              
              <div className="font-satoshi text-bark text-xs leading-relaxed space-y-4">
                <div>
                  <p className="font-bold text-charcoal mb-0.5">Yatris NutriFoods Pvt Ltd</p>
                  <p className="text-earth-light uppercase text-[9px] tracking-wider font-semibold">Registered Office</p>
                  <p className="mt-1 whitespace-pre-line text-bark leading-normal">
                    {address.replace("Yatris NutriFoods Pvt Ltd\nRegistered Address:\n", "")}
                  </p>
                </div>
                <div className="pt-3 border-t border-sand/40">
                  <p className="text-earth-light uppercase text-[9px] tracking-wider font-semibold">Office & Storage</p>
                  <p className="mt-1 whitespace-pre-line text-bark leading-normal">
                    {pob.replace("Additional POB:\n", "")}
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Contact Details Block */}
          <RevealOnScroll variant="fadeUp" delay={0.2}>
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-sand">
                <Phone size={18} className="text-honey-500" />
                <h3 className="font-clash font-bold text-charcoal text-base uppercase tracking-wider">
                  Direct Connect
                </h3>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-50 flex items-center justify-center text-honey-500 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <span className="block font-satoshi text-[9px] text-earth-light uppercase tracking-wider font-semibold">Call / WhatsApp</span>
                    <a href={`tel:${whatsapp}`} className="font-satoshi text-xs font-bold text-charcoal hover:text-honey-500 transition-colors">
                      {whatsapp}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-50 flex items-center justify-center text-honey-500 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <span className="block font-satoshi text-[9px] text-earth-light uppercase tracking-wider font-semibold">Email Inquiry</span>
                    <a href={`mailto:${email}`} className="font-satoshi text-xs font-bold text-charcoal hover:text-honey-500 transition-colors">
                      {email}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-honey-50 flex items-center justify-center text-honey-500 shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <span className="block font-satoshi text-[9px] text-earth-light uppercase tracking-wider font-semibold">Support Hours</span>
                    <p className="font-satoshi text-xs text-bark font-bold">{hours}</p>
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
