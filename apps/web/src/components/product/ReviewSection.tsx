'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { reviewsApi } from '@/lib/api';
import type { Review } from 'shared';

interface ReviewSectionProps {
  productId: string;
  reviews:   Review[];
}

export default function ReviewSection({ productId, reviews }: ReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating]    = useState(5);
  const [title, setTitle]      = useState('');
  const [body, setBody]        = useState('');
  const [status, setStatus]    = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await reviewsApi.create({ productId, rating, title, body });
      setStatus('success');
      setFormOpen(false);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div id="reviews">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-jakarta font-bold text-charcoal text-2xl">Reviews</h2>
        {isAuthenticated && !formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="font-jakarta text-sm text-[#F97316] border border-[#F97316]/30 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Write review form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-[#FAF7F2] rounded-2xl p-6 mb-8 border border-[#E5E7EB]">
          <h3 className="font-jakarta text-charcoal font-bold mb-4">Your Review</h3>

          <div className="mb-4">
            <p className="font-jakarta text-gray-600 text-xs mb-2">Rating</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star size={24} className={s <= rating ? 'text-[#F97316] fill-[#F97316]' : 'text-[#E5E7EB] fill-[#E5E7EB]'} />
                </button>
              ))}
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            required
            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 mb-3 font-jakarta text-sm text-charcoal bg-white focus:outline-none focus:border-[#F97316]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others about your experience..."
            required
            rows={4}
            className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 mb-4 font-jakarta text-sm text-charcoal bg-white focus:outline-none focus:border-[#F97316] resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" disabled={status === 'loading'} className="btn-pill-orange disabled:opacity-60">
              {status === 'loading' ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="btn-pill-white">
              Cancel
            </button>
          </div>
          {status === 'error' && <p className="font-jakarta text-red-600 text-sm mt-3">Failed to submit review. Please try again.</p>}
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="font-jakarta text-gray-500 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col divide-y divide-[#E5E7EB]">
          {reviews.map((review) => (
            <div key={review.id} className="py-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= review.rating ? 'text-[#F97316] fill-[#F97316]' : 'text-[#E5E7EB] fill-[#E5E7EB]'} />
                  ))}
                </div>
                {review.isVerified && (
                  <span className="font-jakarta text-green-600 text-xs">✓ Verified Purchase</span>
                )}
              </div>
              <h4 className="font-jakarta text-charcoal font-semibold text-sm mb-1">{review.title}</h4>
              <p className="font-jakarta text-gray-600 text-sm leading-relaxed mb-2">{review.body}</p>
              <p className="font-jakarta text-gray-400 text-xs">
                {review.userName} · {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
