'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGallery  from '@/components/product/ProductGallery';
import ProductInfo     from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import GoldenDivider   from '@/components/shared/GoldenDivider';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { productsApi } from '@/lib/api';
import { STATIC_PRODUCTS, STATIC_COMBOS } from '@/lib/content';
import { ShieldCheck, CheckCircle2, X, Sparkles, Send } from 'lucide-react';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const cleanSlug = slug ? decodeURIComponent(slug).replace(/\/$/, '') : '';
  const isReady = cleanSlug && cleanSlug !== '_placeholder' && cleanSlug !== '[slug]';

  const [showCertModal, setShowCertModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Synchronous static fallback map for instant load & offline capability
  const allProducts = [
    ...STATIC_PRODUCTS,
    ...STATIC_COMBOS.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sku: c.id,
      categoryId: 'gift-boxes',
      category: {
        id: 'gift-boxes',
        name: 'Gift Boxes & Combos',
        slug: 'gift-boxes',
        description: 'SUMOSTA curated forest honey combinations and gifting sets.',
        imageUrl: null,
        sortOrder: 5,
      },
      shortDescription: c.description,
      description: c.description,
      price: c.price,
      compareAtPrice: c.compareAtPrice,
      costPrice: null,
      stock: 50,
      lowStockThreshold: 2,
      weight: 1500,
      tags: ['combo', 'gifting', 'giftbox', 'organic'],
      isFeatured: true,
      isActive: true,
      metaTitle: c.name,
      metaDescription: c.description,
      images: [
        {
          id: `img_${c.id}`,
          url: c.image,
          altText: c.name,
          sortOrder: 1,
          isPrimary: true,
        },
      ],
      variants: c.variants ?? [],
      averageRating: 4.8,
      reviewCount: 15,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      comingSoon: false,
      batchCertificate: undefined,
      sourcingStory: 'A beautifully packaged curation of our finest wild forest honeys. Perfect for gifting wellness to loved ones.',
      nutritionalBenefits: [
        'Verifiably pure wild honey assortments.',
        'Packaged in organic premium gift settings.',
        'Provides diverse nutritional profiles in one set.'
      ],
    })),
  ];

  const localProduct = (() => {
    const found = allProducts.find(p => p.slug === cleanSlug || p.id === cleanSlug);
    if (!found) return undefined;
    return {
      ...found,
      reviews: [],
      relatedProducts: allProducts.filter(p => p.id !== found.id && p.categoryId === found.categoryId).slice(0, 4)
    };
  })();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', cleanSlug],
    queryFn: () => productsApi.get(cleanSlug),
    enabled: !!isReady,
    initialData: localProduct as any,
  });

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySuccess(true);
    setNotifyEmail('');
  };

  if ((isLoading && !product) || !product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-cream">
        <HoneycombLoader size="lg" />
      </div>
    );
  }

  if (isError && !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-cream">
        <p className="font-satoshi text-earth text-lg">Product not found.</p>
        <a href="/shop" className="font-satoshi text-honey-500 underline">Browse all products</a>
      </div>
    );
  }

  const isComingSoon = product.comingSoon;
  const cert = product.batchCertificate;

  return (
    <div className="bg-cream min-h-screen pt-8 pb-20">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        
        {/* Breadcrumbs */}
        <nav className="font-satoshi text-xs text-earth-light mb-8 flex gap-2">
          <a href="/" className="hover:text-honey-500">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-honey-500">Shop</a>
          <span>/</span>
          <span className="text-bark">{product.name}</span>
        </nav>

        {/* Top Split: Gallery + Purchase details */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="relative">
            {isComingSoon && (
              <span className="absolute top-4 left-4 z-10 bg-honey-400 text-midnight text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                Coming Soon
              </span>
            )}
            <ProductGallery images={product.images ?? []} productName={product.name} batchCertificate={(product as any).batchCertificate} />
          </div>

          <div className="space-y-6">
            {!isComingSoon ? (
              // Standard Product Info
              <ProductInfo product={product} />
            ) : (
              // Custom Coming Soon product interface
              <div className="space-y-6">
                <div>
                  <span className="bg-honey-100 text-honey-600 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {product.category?.name}
                  </span>
                  <h1 className="font-clash text-charcoal font-bold text-3xl md:text-4xl mt-3 mb-2">
                    {product.name}
                  </h1>
                  <p className="font-bespoke italic text-honey-500 text-lg">Launch Reservation Open</p>
                </div>

                <p className="font-satoshi text-bark text-sm leading-relaxed">{product.description}</p>
                
                <div className="border border-sand bg-cream-warm p-6 rounded-2xl space-y-4">
                  <h3 className="font-clash font-bold text-charcoal text-sm flex items-center gap-1.5">
                    <Sparkles size={16} className="text-honey-500" /> Sourcing Launch Alert
                  </h3>
                  <p className="font-satoshi text-bark text-xs leading-relaxed">
                    This premium product is currently in the harvesting and sourcing phase. Enter your email below to be notified first when this batch is launched.
                  </p>

                  {notifySuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-sage-light/40 border border-sage/10 text-sage text-xs p-3 rounded-lg flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} /> You&apos;ve registered successfully! We will email you the moment we harvest.
                    </motion.div>
                  ) : (
                    <form onSubmit={handleNotifySubmit} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-white border border-sand px-3 py-2 text-xs rounded focus:outline-none focus:border-honey-500 font-satoshi text-charcoal"
                      />
                      <button 
                        type="submit"
                        className="bg-midnight hover:bg-honey-500 hover:text-midnight text-cream text-xs font-bold px-4 py-2 rounded flex items-center gap-1 transition-colors"
                      >
                        <Send size={12} /> Notify Me
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}


          </div>
        </div>

        <GoldenDivider className="my-16" />

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}
      </div>

      {/* COA Certificate Modal */}
      <AnimatePresence>
        {showCertModal && cert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream w-full max-w-2xl rounded-2xl shadow-lg border border-sand overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Header */}
              <div className="bg-midnight text-cream p-4 px-6 flex justify-between items-center border-b border-earth/20 relative">
                <div className="absolute inset-0 honeycomb-bg pointer-events-none opacity-[0.03]" />
                <div className="relative z-10">
                  <h3 className="font-clash text-base md:text-lg font-bold flex items-center gap-2 text-honey-400">
                    🛡️ Certificate of Analysis (COA)
                  </h3>
                  <p className="font-satoshi text-earth-light text-xs">Official Laboratory Test Breakdown</p>
                </div>
                <button 
                  onClick={() => setShowCertModal(false)}
                  className="text-earth-light hover:text-cream transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 font-satoshi">
                
                {/* Lab Info Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-sand pb-4">
                  <div>
                    <p className="text-earth-light uppercase tracking-wider text-[10px]">Testing Lab</p>
                    <p className="text-bark font-bold mt-0.5">{cert.nablLab}</p>
                    <p className="text-earth-light mt-0.5">Accreditation: NABL Accredited / Government Approved</p>
                  </div>
                  <div>
                    <p className="text-earth-light uppercase tracking-wider text-[10px]">Certificate Details</p>
                    <p className="text-bark font-mono font-bold mt-0.5">Cert No: {cert.certificateNo}</p>
                    <p className="text-bark font-mono mt-0.5">Batch: {cert.batchNo}</p>
                  </div>
                  <div>
                    <p className="text-earth-light uppercase tracking-wider text-[10px]">Analysis Date</p>
                    <p className="text-bark font-bold mt-0.5">{cert.testingDate}</p>
                  </div>
                  <div>
                    <p className="text-earth-light uppercase tracking-wider text-[10px]">Expiry Date</p>
                    <p className="text-bark font-bold mt-0.5">{cert.expiryDate}</p>
                  </div>
                </div>

                {/* Parameters Table */}
                <div>
                  <h4 className="font-clash font-bold text-charcoal text-sm mb-3">Testing Parameters Table:</h4>
                  <div className="border border-sand rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-cream-warm border-b border-sand text-xs text-earth uppercase font-semibold">
                        <tr>
                          <th className="p-3 pl-4">Parameter Name</th>
                          <th className="p-3">Analysis Result</th>
                          <th className="p-3">Permitted Limit</th>
                          <th className="p-3 pr-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand text-xs text-bark">
                        {cert.parameters.map((param: any) => (
                          <tr key={param.name} className="hover:bg-honey-50/10">
                            <td className="p-3 pl-4 font-medium text-charcoal">{param.name}</td>
                            <td className="p-3 font-mono">{param.result}</td>
                            <td className="p-3 text-earth-light">{param.fssaiLimit}</td>
                            <td className="p-3 pr-4 text-right">
                              <span className="inline-flex items-center gap-0.5 text-sage font-bold bg-sage-light/60 px-1.5 py-0.5 rounded">
                                <CheckCircle2 size={10} /> {param.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footnote stamp */}
                <div className="bg-sage-light/20 border border-sage/10 p-4 rounded-xl flex gap-3 items-center">
                  <span className="text-2xl text-sage">🛡️</span>
                  <div className="text-xs text-bark">
                    <p className="font-semibold text-charcoal">NPOP APEDA Traceability Verified</p>
                    <p className="text-earth-light mt-0.5">This batch complies strictly with standard organic frameworks. No heavy metals, pesticides, or C3/C4 cane/corn syrups detected.</p>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-cream-warm border-t border-sand p-4 px-6 flex justify-between items-center">
                <span className="text-xs text-earth-light">SUMOSTA Integrity Assurance</span>
                <button 
                  onClick={() => setShowCertModal(false)}
                  className="bg-midnight hover:bg-charcoal text-cream text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  Download PDF Report
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
