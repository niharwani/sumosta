'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { adminFetch } from '@/lib/admin-auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function InvoiceContent() {
  const [id, setId] = useState('_placeholder');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const match = window.location.pathname.match(/\/admin\/invoices\/([^/]+)/);
    if (match?.[1]) setId(match[1]);
  }, []);

  // Fetch the same GST-compliant PDF the customer download + email
  // attachment use — rendered inline via a blob URL so this View tab
  // never drifts from the canonical `apps/api/src/services/invoice.ts`
  // layout. Uses `adminFetch` so the JWT is attached (the PDF endpoint
  // is behind admin auth).
  useEffect(() => {
    if (!id || id === '_placeholder') return;
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      setError(null);
      try {
        const res = await adminFetch(`${API}/api/admin/orders/${id}/invoice.pdf`);
        if (!res.ok) throw new Error(`Failed to load invoice (${res.status})`);
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const handleDownload = async () => {
    if (!id || id === '_placeholder' || downloading) return;
    setDownloading(true);
    try {
      const res = await adminFetch(`${API}/api/admin/orders/${id}/invoice.pdf`);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (id === '_placeholder' || (!pdfUrl && !error)) {
    return <div className="flex justify-center py-20"><HoneycombLoader size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="font-satoshi text-red-500 mb-2">Could not load invoice</p>
        <p className="font-satoshi text-gray-400 text-sm">{error}</p>
        <Link href="/admin/invoices" className="font-satoshi text-honey-500 hover:underline mt-4 inline-block">
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/invoices" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={16} />
          <span className="font-satoshi text-sm">Back to Invoices</span>
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !pdfUrl}
          className="inline-flex items-center gap-2 bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="Invoice PDF"
            className="w-full"
            style={{ height: 'calc(100vh - 180px)', minHeight: '600px' }}
          />
        )}
      </div>
    </div>
  );
}
