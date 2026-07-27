'use client';
import { useState } from 'react';
import { couponsApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';
import { X } from 'lucide-react';

export default function CouponInput() {
  const [code, setCode]     = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg]       = useState('');
  const { subtotal, coupon, applyCoupon, removeCoupon } = useCartStore();

  const handleApply = async () => {
    if (!code.trim()) return;
    setStatus('loading');
    try {
      const res = await couponsApi.validate(code.toUpperCase(), subtotal);
      if (res.valid && res.coupon) {
        applyCoupon(res.coupon);
        setStatus('success');
        setMsg(`${res.coupon.code} applied! You save ₹${res.discount}`);
        setCode('');
      } else {
        setStatus('error');
        setMsg(res.error ?? 'Invalid coupon');
      }
    } catch {
      setStatus('error');
      setMsg('Failed to validate coupon');
    }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div>
          <p className="font-jakarta text-green-700 font-semibold text-sm">{coupon.code}</p>
          <p className="font-jakarta text-green-600 text-xs">Coupon applied</p>
        </div>
        <button onClick={() => { removeCoupon(); setStatus('idle'); setMsg(''); }} className="text-green-600 hover:text-green-800 transition-colors">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="flex-1 border border-[#E5E7EB] rounded-full px-4 py-2.5 font-jakarta text-sm text-charcoal bg-white focus:outline-none focus:border-[#F97316]"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={status === 'loading'}
          className="bg-charcoal text-white font-jakarta text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? '...' : 'Apply'}
        </button>
      </div>
      {msg && (
        <p className={`font-jakarta text-xs mt-2 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
