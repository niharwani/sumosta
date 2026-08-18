'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

type FilterTab = 'pending' | 'approved' | 'all';

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<FilterTab>('pending');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', tab],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      // Map tab → approved param: pending=0, approved=1, all=undefined
      if (tab === 'pending')  params.set('approved', '0');
      if (tab === 'approved') params.set('approved', '1');
      const res = await adminFetch(`${API}/api/admin/reviews?${params}`);
      return res.json();
    },
  });

  const reviews = data?.data?.reviews ?? [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const res = await adminFetch(`${API}/api/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_approved }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`${API}/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'all'] as FilterTab[]).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`font-satoshi text-sm px-4 py-2 rounded-lg capitalize transition-colors ${
              tab === s
                ? 'bg-honey-400 text-midnight font-semibold'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-honey-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= r.rating ? 'text-honey-400 fill-honey-400' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="font-satoshi text-gray-800 text-sm font-medium">
                      {r.user_name ?? 'Anonymous'}
                    </span>
                    <span className="font-satoshi text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </span>
                    {r.is_verified ? (
                      <span className="text-xs font-satoshi text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    ) : null}
                  </div>
                  {r.title && (
                    <p className="font-satoshi text-gray-800 text-sm font-semibold mb-1">{r.title}</p>
                  )}
                  <p className="font-satoshi text-gray-600 text-sm leading-relaxed">{r.body}</p>
                  <p className="font-satoshi text-gray-400 text-xs mt-2">
                    Product: <span className="text-gray-600">{r.product_name}</span>
                    {r.user_email && (
                      <span className="ml-3 text-gray-400">· {r.user_email}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!r.is_approved && (
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, is_approved: true })}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 text-xs font-satoshi font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}
                  {r.is_approved ? (
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, is_approved: false })}
                      disabled={updateMutation.isPending}
                      className="text-xs font-satoshi text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Unapprove
                    </button>
                  ) : null}
                  <button
                    onClick={() => deleteMutation.mutate(r.id)}
                    disabled={deleteMutation.isPending}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
              <p className="font-satoshi text-gray-400">No {tab} reviews</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
