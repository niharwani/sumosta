'use client';
import Link from 'next/link';
import Image from 'next/image';

const BLOGS = [
  {
    id: '1',
    title: 'From Beehives to Better Digestion: Why We Created Gut Health Honey',
    snippet: 'Back in April 2025, we asked our community a simple question: what health challenges would you like support with? The response was clear: digestion, gut health, and clean energy.',
    date: '15 October, 2025',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Unprocessed vs Commercial Honey: What You Need to Know',
    snippet: 'Most commercial honey is industrially dead — heavily heated and stripped of live enzymes. Here is how raw single-origin forest honey protects your immune system.',
    date: '02 November, 2025',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=800&auto=format&fit=crop',
  },
];

export default function LatestBlogs() {
  return (
    <section className="py-16 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header (Ref Image 1) */}
        <div className="mb-10">
          <h2 className="font-jakarta font-bold text-charcoal text-3xl sm:text-4xl tracking-tight">
            Latest Blogs
          </h2>
        </div>

        {/* Blog Cards Grid (Ref Image 1 layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOGS.map((blog) => (
            <Link
              key={blog.id}
              href="/about"
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] sm:w-48 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-jakarta font-bold text-charcoal text-base sm:text-lg leading-snug group-hover:text-[#F97316] transition-colors mb-2">
                    {blog.title}
                  </h3>
                  <p className="font-jakarta text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4">
                    {blog.snippet}
                  </p>
                </div>

                <span className="font-jakarta text-gray-400 text-[11px] font-medium">
                  {blog.date}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
