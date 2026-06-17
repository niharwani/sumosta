'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function authHeaders() {
  const token = localStorage.getItem('sumosta_access_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function useProducts(search: string, category: string) {
  return useQuery({
    queryKey: ['admin-products', search, category],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const res = await fetch(`${API}/api/admin/products?${params}`, { headers: authHeaders() });
      return res.json();
    },
  });
}

function useCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/categories`, { headers: authHeaders() });
      return res.json();
    },
  });
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useProducts(search, category);
  const { data: catData } = useCategories();
  const products = data?.data?.products ?? [];
  const categories = catData?.data ?? [];

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: active ? 0 : 1 }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return res.json();
    },
    onSuccess: () => {
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 w-56"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-satoshi text-gray-400 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {product.primary_image && (
                        <img
                          src={product.primary_image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                      )}
                      <div>
                        <div className="font-satoshi text-gray-800 text-sm font-medium">{product.name}</div>
                        <div className="font-satoshi text-gray-400 text-xs">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-600 text-sm">{product.category_name}</td>
                  <td className="px-5 py-3.5 font-satoshi text-gray-800 text-sm font-medium">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-satoshi text-sm ${(product.stock ?? 0) < 10 ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleMutation.mutate({ id: product.id, active: product.is_active })}
                      className={`text-xs font-satoshi font-medium px-2.5 py-1 rounded-full ${
                        product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMutation.mutate({ id: product.id, active: product.is_active })}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {product.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-gray-400 hover:text-honey-500 transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      {deleting === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(product.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-satoshi font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleting(null)}
                            className="text-xs text-gray-400 font-satoshi"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleting(product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-satoshi text-gray-400">
                    No products found
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
