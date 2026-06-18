'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Upload, Star, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

function authHeaders(contentType = 'application/json') {
  const token = localStorage.getItem('sumosta_access_token');
  const h: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (contentType) h['Content-Type'] = contentType;
  return h;
}

const schema = z.object({
  name:                z.string().min(2),
  sku:                 z.string().min(2),
  category_id:         z.string().min(1, 'Select a category'),
  price:               z.coerce.number().min(1),
  compare_at_price:    z.coerce.number().optional(),
  cost_price:          z.coerce.number().optional(),
  short_description:   z.string().optional(),
  description:         z.string().optional(),
  stock_quantity:      z.coerce.number().min(0),
  low_stock_threshold: z.coerce.number().min(0).default(10),
  weight_grams:        z.coerce.number().optional(),
  meta_title:          z.string().optional(),
  meta_description:    z.string().optional(),
  tags:                z.string().optional(),
  is_active:           z.boolean().default(true),
  is_featured:         z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: number | boolean;
  sort_order: number;
}

// ─── Media Section ──────────────────────────────────────────
function MediaSection({ productId, images, onRefresh }: {
  productId: string;
  images: ProductImage[];
  onRefresh: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const isImage = (url: string) => /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(url);
  const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}…`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'products');

      const uploadRes = await fetch(`${API}/api/admin/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sumosta_access_token')}` },
        body: fd,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || 'Upload failed');

      const { publicUrl } = uploadJson.data;
      setUploadProgress('Linking to product…');

      const linkRes = await fetch(`${API}/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          url: publicUrl,
          altText: file.name.replace(/\.[^.]+$/, ''),
          isPrimary: images.length === 0,
        }),
      });
      if (!linkRes.ok) throw new Error('Failed to link media to product');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  async function setPrimary(imageId: string) {
    await fetch(`${API}/api/admin/products/${productId}/images/${imageId}/primary`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    onRefresh();
  }

  async function deleteImage(imageId: string) {
    if (!confirm('Remove this media?')) return;
    await fetch(`${API}/api/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    onRefresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">
          Media
        </h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-satoshi font-medium text-honey-600 hover:text-honey-700 disabled:opacity-50"
        >
          <Upload size={13} /> Upload files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-honey-400 bg-honey-50' : 'border-gray-200 hover:border-honey-300 hover:bg-gray-50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-honey-400 animate-spin" />
            <p className="font-satoshi text-sm text-gray-500">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 text-gray-300">
              <ImageIcon size={22} />
              <Video size={22} />
            </div>
            <p className="font-satoshi text-sm text-gray-400">
              Drop images or videos here, or <span className="text-honey-500 font-medium">browse</span>
            </p>
            <p className="font-satoshi text-xs text-gray-300">JPG, PNG, WebP, GIF, MP4, WebM — max 20 MB each</p>
          </div>
        )}
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => {
            const primary = img.is_primary === 1 || img.is_primary === true;
            const video = isVideo(img.url);
            return (
              <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                primary ? 'border-honey-400' : 'border-gray-100 hover:border-gray-200'
              }`}>
                {video ? (
                  <video
                    src={img.url}
                    className="w-full aspect-square object-cover bg-gray-100"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={img.url}
                    alt={img.alt_text ?? ''}
                    className="w-full aspect-square object-cover bg-gray-100"
                  />
                )}

                {/* Primary badge */}
                {primary && (
                  <div className="absolute top-1.5 left-1.5 bg-honey-400 text-midnight text-[9px] font-satoshi font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star size={8} fill="currentColor" /> Primary
                  </div>
                )}

                {/* Video badge */}
                {video && (
                  <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[9px] font-satoshi px-1.5 py-0.5 rounded-full">
                    VIDEO
                  </div>
                )}

                {/* Hover controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!primary && !video && (
                    <button
                      type="button"
                      onClick={() => setPrimary(img.id)}
                      title="Set as primary"
                      className="w-7 h-7 bg-honey-400 hover:bg-honey-500 text-midnight rounded-full flex items-center justify-center transition-colors"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteImage(img.id)}
                    title="Remove"
                    className="w-7 h-7 bg-white/90 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="font-satoshi text-xs text-gray-400 text-center">No media yet — upload images or videos above.</p>
      )}
    </div>
  );
}

// ─── Main edit form ──────────────────────────────────────────
export default function EditProductContent() {
  const router = useRouter();
  const params = useParams();
  const id = params['id'] as string;
  const qc = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [variants, setVariants] = useState<{ name: string; sku: string; price_adjustment: number; stock: number }[]>([]);

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/categories`, { headers: authHeaders() });
      return res.json();
    },
  });

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/products/${id}`, { headers: authHeaders() });
      return res.json();
    },
    enabled: !!id && id !== '_placeholder',
  });

  const categories = catData?.data ?? [];
  const product = productData?.data;
  const images: ProductImage[] = product?.images ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: { is_active: true, is_featured: false, stock_quantity: 0, low_stock_threshold: 10 },
  });

  useEffect(() => {
    if (!product) return;
    const tagsStr = Array.isArray(product.tags)
      ? product.tags.join(', ')
      : typeof product.tags === 'string'
        ? (() => { try { return JSON.parse(product.tags).join(', '); } catch { return product.tags; } })()
        : '';

    reset({
      name:                product.name ?? '',
      sku:                 product.sku ?? '',
      category_id:         product.category_id ?? '',
      price:               product.price ?? 0,
      compare_at_price:    product.compare_at_price ?? undefined,
      cost_price:          product.cost_price ?? undefined,
      short_description:   product.short_description ?? '',
      description:         product.description ?? '',
      stock_quantity:      product.stock ?? 0,
      low_stock_threshold: product.low_stock_threshold ?? 10,
      weight_grams:        product.weight ?? undefined,
      meta_title:          product.meta_title ?? '',
      meta_description:    product.meta_description ?? '',
      tags:                tagsStr,
      is_active:           product.is_active === 1 || product.is_active === true,
      is_featured:         product.is_featured === 1 || product.is_featured === true,
    });

    if (Array.isArray(product.variants)) {
      setVariants(product.variants.map((v: any) => ({
        name:             v.name ?? '',
        sku:              v.sku ?? '',
        price_adjustment: v.price_adjustment ?? 0,
        stock:            v.stock ?? 0,
      })));
    }
  }, [product, reset]);

  const addVariant = () => setVariants([...variants, { name: '', sku: '', price_adjustment: 0, stock: 0 }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: string | number) =>
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
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
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        variants,
      };

      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save product');
      router.push('/admin/products');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-satoshi text-gray-700 focus:outline-none focus:border-honey-400 transition-colors';
  const labelClass = 'block font-satoshi text-gray-700 text-sm font-medium mb-1.5';
  const errorClass = 'font-satoshi text-red-500 text-xs mt-1';

  if (id === '_placeholder') {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (!productLoading && !product) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-gray-400 mb-2">Product not found.</p>
        <Link href="/admin/products" className="font-satoshi text-honey-500 hover:underline text-sm">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-satoshi text-gray-800 font-semibold">Edit Product</h1>
          {product && <p className="font-satoshi text-gray-400 text-xs truncate">{product.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Media */}
        {id && id !== '_placeholder' && (
          <MediaSection
            productId={id}
            images={images}
            onRefresh={() => qc.invalidateQueries({ queryKey: ['admin-product', id] })}
          />
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Product Name *</label>
              <input {...register('name')} className={inputClass} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>SKU *</label>
              <input {...register('sku')} className={inputClass} />
              {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select {...register('category_id')} className={inputClass}>
              <option value="">Select a category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className={errorClass}>{errors.category_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Short Description</label>
            <textarea {...register('short_description')} className={`${inputClass} resize-none`} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Full Description</label>
            <textarea {...register('description')} className={`${inputClass} resize-none`} rows={5} />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Price (₹) *</label>
              <input type="number" {...register('price')} className={inputClass} />
              {errors.price && <p className={errorClass}>{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Compare-at Price (₹)</label>
              <input type="number" {...register('compare_at_price')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cost Price (₹)</label>
              <input type="number" {...register('cost_price')} className={inputClass} />
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
              <input type="number" {...register('weight_grams')} className={inputClass} />
            </div>
          </div>
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
                <label className={labelClass}>Name</label>
                <input value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} className={inputClass} placeholder="500g" />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className={inputClass} placeholder="WG-500G" />
              </div>
              <div>
                <label className={labelClass}>Price Adj. (₹)</label>
                <input type="number" value={v.price_adjustment} onChange={(e) => updateVariant(i, 'price_adjustment', Number(e.target.value))} className={inputClass} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={labelClass}>Stock</label>
                  <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} className={inputClass} />
                </div>
                <button type="button" onClick={() => removeVariant(i)} className="pb-2.5 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-satoshi text-gray-700 font-semibold text-sm uppercase tracking-wider">SEO</h2>
          <div>
            <label className={labelClass}>Meta Title</label>
            <input {...register('meta_title')} className={inputClass} />
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

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-midnight font-satoshi font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {submitting ? <HoneycombLoader size="sm" /> : null}
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href="/admin/products" className="font-satoshi text-gray-500 hover:text-gray-700 text-sm px-4 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
