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
        <h2 className="font-clash text-charcoal font-bold text-2xl">Reviews</h2>
        {isAuthenticated && !formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="font-satoshi text-sm text-honey-500 border border-honey-300 px-4 py-2 rounded-md hover:bg-honey-50 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Write review form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-cream-warm rounded-xl p-6 mb-8 border border-sand">
          <h3 className="font-satoshi text-charcoal font-semibold mb-4">Your Review</h3>

          <div className="mb-4">
            <p className="font-satoshi text-bark text-xs mb-2">Rating</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star size={24} className={s <= rating ? 'text-honey-400 fill-honey-400' : 'text-sand fill-sand'} />
                </button>
              ))}
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            required
            className="w-full border border-sand rounded-md px-4 py-3 mb-3 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others about your experience..."
            required
            rows={4}
            className="w-full border border-sand rounded-md px-4 py-3 mb-4 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" disabled={status === 'loading'} className="bg-honey-400 text-midnight font-satoshi font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-honey-500 transition-colors disabled:opacity-60">
              {status === 'loading' ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="font-satoshi text-bark text-sm px-4 py-2.5 border border-sand rounded-md hover:border-honey-300 transition-colors">
              Cancel
            </button>
          </div>
          {status === 'error' && <p className="font-satoshi text-terracotta text-sm mt-3">Failed to submit review. Please try again.</p>}
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="font-satoshi text-earth text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col divide-y divide-sand">
          {reviews.map((review) => (
            <div key={review.id} className="py-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= review.rating ? 'text-honey-400 fill-honey-400' : 'text-sand fill-sand'} />
                  ))}
                </div>
                {review.isVerified && (
                  <span className="font-satoshi text-sage text-xs">✓ Verified Purchase</span>
                )}
              </div>
              <h4 className="font-satoshi text-charcoal font-semibold text-sm mb-1">{review.title}</h4>
              <p className="font-satoshi text-bark text-sm leading-relaxed mb-2">{review.body}</p>
              <p className="font-satoshi text-earth-light text-xs">
                {review.userName} · {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
