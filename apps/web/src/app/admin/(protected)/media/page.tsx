'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const res = await adminFetch(`${API}/api/admin/media`);
      return res.json();
    },
  });

  const files = data?.data?.files ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await adminFetch(`${API}/api/admin/media/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ['admin-media'] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        await adminFetch(`${API}/api/admin/media/upload`, {
          method: 'POST',
          body:   fd,
        });
      }
      qc.invalidateQueries({ queryKey: ['admin-media'] });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-satoshi text-gray-500 text-sm">{files.length} files</p>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-50 text-midnight font-satoshi font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {uploading ? <HoneycombLoader size="sm" /> : <Upload size={16} />}
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>
      ) : files.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl py-20 text-center cursor-pointer hover:border-honey-300 transition-colors"
        >
          <Upload size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-satoshi text-gray-400">Click to upload images</p>
          <p className="font-satoshi text-gray-300 text-sm mt-1">PNG, JPG, WebP up to 10MB each</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((f: any) => (
            <div key={f.key} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 aspect-square">
              <img src={f.publicUrl} alt={f.key} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-midnight/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(f.publicUrl)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  title="Copy URL"
                >
                  {copied === f.publicUrl ? <Check size={14} /> : <Copy size={14} />}
                </button>
                {deleting === f.key ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteMutation.mutate(f.key)}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white text-xs font-satoshi"
                    >
                      Del
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-satoshi"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleting(f.key)}
                    className="p-2 bg-white/20 hover:bg-red-500/80 rounded-lg text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-midnight/80 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="font-satoshi text-white text-xs truncate">{f.key.split('/').pop()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
