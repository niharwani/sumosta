'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const schema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category_id: z.string().min(1, 'Select a category'),
  price: z.coerce.number().min(1),
  compare_at_price: z.coerce.number().optional(),
  cost_price: z.coerce.number().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  stock_quantity: z.coerce.number().min(0),
  low_stock_threshold: z.coerce.number().min(0).default(10),
  weight_grams: z.coerce.number().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  tags: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry'];

interface PendingImage {
  file:    File;
  preview: string;   // object URL for on-screen preview
}

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [variants, setVariants] = useState<{ name: string; sku: string; price_adjustment: number; stock: number }[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const next: PendingImage[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue;
      next.push({ file: f, preview: URL.createObjectURL(f) });
    }
    setPendingImages((prev) => [...prev, ...next]);
  };
  const removePending = (idx: number) => {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/categories`);
      return res.json();
    },
  });

  const categories = catData?.data ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: { is_active: true, is_featured: false, stock_quantity: 0, low_stock_threshold: 10 },
  });

  const addVariant = () => setVariants([...variants, { name: '', sku: '', price_adjustment: 0, stock: 0 }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: string | number) =>
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const payload = {
        name:              data.name,
        slug,
        sku:               data.sku,
        categoryId:        data.category_id,
        shortDescription:  data.short_description,
        description:       data.description,
        price:             data.price,
        compareAtPrice:    data.compare_at_price,
        costPrice:         data.cost_price,
        stock:             data.stock_quantity,
        lowStockThreshold: data.low_stock_threshold,
        weight:            data.weight_grams,
        metaTitle:         data.meta_title,
        metaDescription:   data.meta_description,
        isActive:          data.is_active,
        isFeatured:        data.is_featured,
        tags: data.tags
          ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        variants,
      };

      const res = await adminFetch(`${API}/api/admin/products`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create product');

      // Upload any buffered images against the freshly-created product.
      // Failures are surfaced as a soft warning; the product is still created.
      const newId = json?.data?.id;
      if (newId && pendingImages.length > 0) {
        const uploadErrors: string[] = [];
        for (let i = 0; i < pendingImages.length; i++) {
          const img = pendingImages[i];
          try {
            const fd = new FormData();
            fd.append('file', img.file);
            fd.append('folder', 'products');
            fd.append('productId', newId);
            fd.append('isPrimary', i === 0 ? '1' : '0');
            const up = await adminFetch(`${API}/api/admin/media/upload`, {
              method: 'POST',
              body:   fd,
              headers: {}, // let browser set multipart boundary
            });
            if (!up.ok) {
              const j = await up.json().catch(() => ({}));
              uploadErrors.push(`${img.file.name}: ${j.error ?? up.statusText}`);
            }
          } catch (e) {
            uploadErrors.push(`${img.file.name}: ${e instanceof Error ? e.message : 'upload failed'}`);
          }
        }
        if (uploadErrors.length > 0) {
          alert(`Product created but some images failed to upload:\n\n${uploadErrors.join('\n')}\n\nOpen the product edit page to retry.`);
        }
        pendingImages.forEach((p) => URL.revokeObjectURL(p.preview));
      }

      router.push(newId ? `/admin/products/${newId}/edit` : '/admin/products');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 transition-colors';
  const labelClass = 'block font-satoshi text-gray-700 text-sm font-medium mb-1.5';
  const errorClass = 'font-satoshi text-red-500 text-xs mt-1';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-satoshi text-gray-800 font-semibold">New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Product Name *</label>
              <input {...register('name')} className={inputClass} placeholder="Western Ghats Raw Honey" />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>SKU *</label>
              <input {...register('sku')} className={inputClass} placeholder="WG-RAW-500" />
              {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select {...register('category_id')} className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className={errorClass}>{errors.category_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Short Description</label>
            <textarea {...register('short_description')} className={`${inputClass} resize-none`} rows={2} placeholder="Brief product summary" />
          </div>
          <div>
            <label className={labelClass}>Full Description</label>
            <textarea {...register('description')} className={`${inputClass} resize-none`} rows={5} placeholder="Full product description (markdown supported)" />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Price (₹) *</label>
              <input type="number" {...register('price')} className={inputClass} placeholder="599" />
              {errors.price && <p className={errorClass}>{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Compare-at Price (₹)</label>
              <input type="number" {...register('compare_at_price')} className={inputClass} placeholder="799" />
            </div>
            <div>
              <label className={labelClass}>Cost Price (₹)</label>
              <input type="number" {...register('cost_price')} className={inputClass} placeholder="250" />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Inventory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Stock Quantity *</label>
              <input type="number" {...register('stock_quantity')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Low Stock Threshold</label>
              <input type="number" {...register('low_stock_threshold')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weight (grams)</label>
              <input type="number" {...register('weight_grams')} className={inputClass} placeholder="500" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Images</h2>
            <label className="flex items-center gap-1.5 text-xs font-satoshi font-medium text-honey-600 hover:text-honey-700 cursor-pointer">
              <Plus size={13} /> Add images
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} />
            </label>
          </div>
          {pendingImages.length === 0 ? (
            <label className="block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-honey-300 hover:bg-gray-50 transition-colors">
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} />
              <ImageIcon size={20} className="text-gray-300 mx-auto mb-1.5" />
              <p className="font-satoshi text-sm text-gray-400">Click to add images (first image becomes primary)</p>
            </label>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative group border border-gray-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt={img.file.name} className="w-full aspect-square object-cover" />
                  {i === 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-honey-400 text-midnight text-[9px] font-satoshi font-bold px-1.5 py-0.5 rounded-full">
                      Primary
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    aria-label={`Remove ${img.file.name}`}
                  >
                    <span className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center">
                      <X size={16} />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="font-satoshi text-xs text-gray-400">
            Images upload after the product is created. You can reorder and add more on the edit page.
          </p>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Variants</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-satoshi font-medium text-honey-600 hover:text-honey-700">
              <Plus size={13} /> Add Variant
            </button>
          </div>
          {variants.length === 0 && (
            <p className="font-satoshi text-gray-400 text-sm">No variants — single product. Add variants for size/flavor options.</p>
          )}
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end border border-gray-100 rounded-lg p-3">
              <div>
                <label className={labelClass}>Variant Name</label>
                <input
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className={inputClass}
                  placeholder="500g"
                />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input
                  value={v.sku}
                  onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                  className={inputClass}
                  placeholder="WG-500G"
                />
              </div>
              <div>
                <label className={labelClass}>Price Adj. (₹)</label>
                <input
                  type="number"
                  value={v.price_adjustment}
                  onChange={(e) => updateVariant(i, 'price_adjustment', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={labelClass}>Stock</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <button type="button" onClick={() => removeVariant(i)} className="pb-2.5 text-gray-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">SEO</h2>
          <div>
            <label className={labelClass}>Meta Title</label>
            <input {...register('meta_title')} className={inputClass} placeholder="Western Ghats Raw Honey — SUMOSTA" />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea {...register('meta_description')} className={`${inputClass} resize-none`} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input {...register('tags')} className={inputClass} placeholder="raw honey, organic, western ghats" />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">Status</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_active')} className="accent-honey-400 w-4 h-4" />
              <span className="font-satoshi text-gray-700 text-sm">Active (visible to customers)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_featured')} className="accent-honey-400 w-4 h-4" />
              <span className="font-satoshi text-gray-700 text-sm">Featured (show on homepage)</span>
            </label>
          </div>
        </div>

        {error && <p className="font-satoshi text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-midnight font-satoshi font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {submitting ? <HoneycombLoader size="sm" /> : null}
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
          <Link href="/admin/products" className="font-satoshi text-gray-500 hover:text-gray-700 text-sm px-4 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
