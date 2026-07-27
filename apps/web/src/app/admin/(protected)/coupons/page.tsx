'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function authHeaders() {
  const token = localStorage.getItem('sumosta_access_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const EMPTY_FORM = { code: '', type: 'percentage', value: '', minOrderAmount: '', maxUsage: '', expiresAt: '' };

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/coupons`, { headers: authHeaders() });
      return res.json();
    },
  });

  // API returns { success, data: { coupons: [...], total, page, ... } }
  const coupons = data?.data?.coupons ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/api/admin/coupons`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          code:           form.code.toUpperCase(),
          type:           form.type,
          value:          Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          maxUsage:       form.maxUsage ? Number(form.maxUsage) : null,
          isFirstOrderOnly: false,
          isActive:       true,
          expiresAt:      form.expiresAt ? `${form.expiresAt}T23:59:59.000Z` : null,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        qc.invalidateQueries({ queryKey: ['admin-coupons'] });
        setShowForm(false);
        setForm(EMPTY_FORM);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return res.json();
    },
    onSuccess: () => {
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const inputClass =
    'border border-gray-200 rounded-lg px-3 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 w-full';

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h2 className="font-satoshi text-gray-800 font-semibold mb-4">New Coupon</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-satoshi text-gray-600 text-xs mb-1">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={inputClass}
                placeholder="HONEY20"
              />
            </div>
            <div>
              <label className="block font-satoshi text-gray-600 text-xs mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-satoshi text-gray-600 text-xs mb-1">
                Value ({form.type === 'percentage' ? '%' : '₹'}) *
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className={inputClass}
                placeholder={form.type === 'percentage' ? '10' : '200'}
              />
            </div>
            <div>
              <label className="block font-satoshi text-gray-600 text-xs mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className={inputClass}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block font-satoshi text-gray-600 text-xs mb-1">Max Uses</label>
              <input
                type="number"
                value={form.maxUsage}
                onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
                className={inputClass}
                placeholder="100"
              />
            </div>
            <div>
              <label className="block font-satoshi text-gray-600 text-xs mb-1">Expires At</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {createMutation.data && !createMutation.data.success && (
            <p className="font-satoshi text-red-500 text-xs mt-3">
              {createMutation.data.error ?? 'Failed to create coupon'}
            </p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.code || !form.value || createMutation.isPending}
              className="bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-midnight font-satoshi font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="font-satoshi text-gray-500 text-sm px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Code', 'Type', 'Value', 'Min Order', 'Used / Max', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c: any) => {
                const expired   = c.expires_at && new Date(c.expires_at) < new Date();
                // DB columns: max_usage, usage_count
                const exhausted = c.max_usage && c.usage_count >= c.max_usage;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-honey-500" />
                        <span className="font-satoshi text-gray-800 text-sm font-medium">{c.code}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm capitalize">{c.type}</td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-medium">
                      {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">
                      {c.min_order_amount ? formatPrice(c.min_order_amount) : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">
                      {c.usage_count ?? 0} / {c.max_usage ?? '∞'}
                    </td>
                    <td className="px-5 py-3.5 font-satoshi text-gray-400 text-xs">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-satoshi font-medium px-2 py-0.5 rounded-full ${
                        expired || exhausted || !c.is_active
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {expired ? 'Expired' : exhausted ? 'Exhausted' : c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {deleting === c.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteMutation.mutate(c.id)}
                            className="text-xs text-red-500 font-satoshi font-medium"
                          >
                            Confirm
                          </button>
                          <button onClick={() => setDeleting(null)} className="text-xs text-gray-400 font-satoshi">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleting(c.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 font-satoshi text-gray-400">
                    No coupons created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
