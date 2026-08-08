'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { reviewsApi } from '@/lib/api';
import type { Review } from 'shared';

interface ReviewSectionProps {
  productId: string;
  reviews:   Review[];
  averageRating?: number | null;
  reviewCount?: number | null;
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? 'text-honey-400 fill-honey-400'
              : 'text-sand fill-sand'
          }
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, reviews, averageRating, reviewCount }: ReviewSectionProps) {
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

  const avg = averageRating ?? (reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0);
  const count = reviewCount ?? reviews.length;

  return (
    <div id="reviews" className="bg-cream">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-clash font-bold text-charcoal text-2xl md:text-3xl mb-2">Reviews</h2>
          {count > 0 ? (
            <div className="flex items-center gap-3">
              <StarRow rating={avg} size={16} />
              <span className="font-satoshi text-charcoal text-sm font-semibold">
                {avg.toFixed(1)}
              </span>
              <span className="font-satoshi text-earth text-sm">
                ({count} {count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          ) : (
            <p className="font-satoshi text-earth text-sm">No reviews yet.</p>
          )}
        </div>
        {isAuthenticated ? (
          !formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi text-sm font-semibold px-6 py-2.5 rounded-full transition-colors min-h-[44px]"
            >
              Write a Review
            </button>
          )
        ) : (
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center bg-cream border border-sand hover:border-honey-400 text-charcoal font-satoshi text-sm font-semibold px-6 py-2.5 rounded-full transition-colors min-h-[44px]"
          >
            Sign in to write a review
          </Link>
        )}
      </div>

      {/* Write review form */}
      {formOpen && isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="bg-cream-warm rounded-2xl p-6 mb-8 border border-sand"
        >
          <h3 className="font-clash text-charcoal font-bold text-lg mb-4">Your Review</h3>

          <div className="mb-4">
            <p className="font-satoshi text-earth text-xs uppercase tracking-wider font-semibold mb-2">Rating</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  aria-label={`${s} star${s > 1 ? 's' : ''}`}
                  aria-pressed={s === rating}
                  className="p-1 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                >
                  <Star
                    size={24}
                    className={s <= rating ? 'text-honey-400 fill-honey-400' : 'text-sand fill-sand'}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </div>

          <label htmlFor="review-title" className="sr-only">Review title</label>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            required
            className="w-full border border-sand rounded-lg px-4 py-3 mb-3 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-400/30 transition-all"
          />
          <label htmlFor="review-body" className="sr-only">Your review</label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell others about your experience..."
            required
            rows={4}
            className="w-full border border-sand rounded-lg px-4 py-3 mb-4 font-satoshi text-sm text-charcoal bg-cream focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-400/30 resize-none transition-all"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center bg-honey-500 hover:bg-honey-600 text-cream font-satoshi text-sm font-semibold px-6 py-2.5 rounded-full transition-colors disabled:opacity-60 min-h-[44px]"
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="inline-flex items-center justify-center bg-cream border border-sand hover:border-earth-light text-charcoal font-satoshi text-sm font-semibold px-6 py-2.5 rounded-full transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
          {status === 'error' && (
            <p role="alert" className="font-satoshi text-terracotta text-sm mt-3">
              Failed to submit review. Please try again.
            </p>
          )}
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="font-satoshi text-earth text-sm">Be the first to leave a review.</p>
      ) : (
        <div className="flex flex-col divide-y divide-sand">
          {reviews.map((review) => (
            <article key={review.id} className="py-6">
              <div className="flex items-center gap-2 mb-2">
                <StarRow rating={review.rating} size={12} />
                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 font-satoshi text-sage text-xs">
                    <CheckCircle2 size={12} aria-hidden /> Verified Purchase
                  </span>
                )}
              </div>
              <h4 className="font-satoshi text-charcoal font-semibold text-sm mb-1">{review.title}</h4>
              <p className="font-satoshi text-bark text-sm leading-relaxed mb-2">{review.body}</p>
              <p className="font-satoshi text-earth-light text-xs">
                {review.userName} · {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
