'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { z } from 'zod';

const addressSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  phone:        z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(2, 'City is required'),
  state:        z.string().min(2, 'State is required'),
  pincode:      z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  isDefault:    z.boolean().optional(),
});

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
type AddressData = z.infer<typeof addressSchema>;

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry'];

function authHeaders() {
  const token = localStorage.getItem('sumosta_access_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/addresses`, { headers: authHeaders() });
      return res.json();
    },
  });

  const addresses = data?.data ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressData>({
    resolver: zodResolver(addressSchema as any),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AddressData) => {
      const url = editingId ? `${API}/api/addresses/${editingId}` : `${API}/api/addresses`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setEditingId(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/addresses/${id}`, { method: 'DELETE', headers: authHeaders() });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/addresses/${id}/default`, { method: 'POST', headers: authHeaders() });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const openEdit = (addr: any) => {
    reset(addr);
    setEditingId(addr.id);
    setShowForm(true);
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm font-satoshi text-bark bg-white focus:outline-none transition-colors ${
      hasError ? 'border-terracotta/50' : 'border-sand focus:border-honey-400'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-satoshi text-charcoal font-semibold text-lg">Saved Addresses</h2>
        <button
          onClick={() => { reset(); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 font-satoshi text-sm font-semibold text-honey-600 hover:text-honey-700"
        >
          <Plus size={15} /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-sand p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-satoshi text-bark font-semibold">{editingId ? 'Edit Address' : 'New Address'}</h3>
            <button onClick={() => setShowForm(false)} className="text-earth-light hover:text-earth">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-satoshi text-bark text-xs font-medium mb-1">Full Name *</label>
                <input {...register('name')} className={inputClass(!!errors.name)} />
                {errors.name && <p className="font-satoshi text-terracotta text-xs mt-0.5">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block font-satoshi text-bark text-xs font-medium mb-1">Phone *</label>
                <input {...register('phone')} className={inputClass(!!errors.phone)} />
                {errors.phone && <p className="font-satoshi text-terracotta text-xs mt-0.5">{errors.phone.message}</p>}
              </div>
            </div>
            <div>
              <label className="block font-satoshi text-bark text-xs font-medium mb-1">Address Line 1 *</label>
              <input {...register('addressLine1')} className={inputClass(!!errors.addressLine1)} />
              {errors.addressLine1 && <p className="font-satoshi text-terracotta text-xs mt-0.5">{errors.addressLine1.message}</p>}
            </div>
            <div>
              <label className="block font-satoshi text-bark text-xs font-medium mb-1">Address Line 2</label>
              <input {...register('addressLine2')} className={inputClass(false)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-satoshi text-bark text-xs font-medium mb-1">City *</label>
                <input {...register('city')} className={inputClass(!!errors.city)} />
              </div>
              <div>
                <label className="block font-satoshi text-bark text-xs font-medium mb-1">State *</label>
                <select {...register('state')} className={inputClass(!!errors.state)}>
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-satoshi text-bark text-xs font-medium mb-1">Pincode *</label>
                <input {...register('pincode')} className={inputClass(!!errors.pincode)} maxLength={6} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 text-midnight font-satoshi font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {saveMutation.isPending ? <HoneycombLoader size="sm" /> : null}
                {saveMutation.isPending ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="font-satoshi text-earth text-sm px-4">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><HoneycombLoader size="lg" /></div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-sand">
          <p className="font-satoshi text-earth mb-4">No saved addresses yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="font-satoshi font-semibold text-sm text-honey-600 hover:text-honey-700 underline"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className={`bg-white rounded-2xl border p-5 relative ${addr.is_default ? 'border-honey-300' : 'border-sand'}`}>
              {addr.is_default && (
                <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-satoshi font-medium text-honey-600">
                  <Star size={11} className="fill-honey-400" /> Default
                </span>
              )}
              <p className="font-satoshi text-charcoal font-semibold text-sm">{addr.name}</p>
              <p className="font-satoshi text-earth text-sm mt-1">{addr.phone}</p>
              <p className="font-satoshi text-bark text-sm mt-2 leading-relaxed">
                {addr.address_line1}
                {addr.address_line2 && `, ${addr.address_line2}`}
                <br />
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sand">
                <button onClick={() => openEdit(addr)} className="flex items-center gap-1.5 text-xs font-satoshi text-earth hover:text-bark">
                  <Pencil size={12} /> Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => setDefaultMutation.mutate(addr.id)} className="flex items-center gap-1.5 text-xs font-satoshi text-earth hover:text-bark">
                    <Star size={12} /> Set Default
                  </button>
                )}
                <button onClick={() => deleteMutation.mutate(addr.id)} className="flex items-center gap-1.5 text-xs font-satoshi text-earth hover:text-terracotta ml-auto">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
