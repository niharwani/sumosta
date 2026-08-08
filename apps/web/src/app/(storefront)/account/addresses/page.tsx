'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, X, MapPin } from 'lucide-react';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import { addressesApi, ApiError, type Address, type AddressInput } from '@/lib/api';
import { HONEY_EASE_OUT } from '@/lib/animations';
import { cn } from '@/lib/utils';

const addressSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  phone:        z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(2, 'City is required'),
  state:        z.string().min(2, 'State is required'),
  pincode:      z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  isDefault:    z.boolean().optional(),
});
type AddressData = z.infer<typeof addressSchema>;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
  'Puducherry',
];

type Toast = { id: number; text: string; tone: 'success' | 'error' };

function mapAddressToForm(addr: Address): AddressData {
  return {
    name:         addr.name,
    phone:        addr.phone,
    addressLine1: addr.address_line1,
    addressLine2: addr.address_line2 ?? '',
    city:         addr.city,
    state:        addr.state,
    pincode:      addr.pincode,
    isDefault:    Boolean(addr.is_default),
  };
}

export default function AddressesPage() {
  const [showForm, setShowForm]           = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [deleteTargetId, setDeleteTarget] = useState<string | null>(null);
  const [toasts, setToasts]               = useState<Toast[]>([]);
  const qc = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const pushToast = (text: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const { data: addresses = [], isLoading, isError, refetch } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn:  () => addressesApi.list(),
    retry:    false,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema as never),
    defaultValues: {
      name: '', phone: '', addressLine1: '', addressLine2: '',
      city: '', state: '', pincode: '', isDefault: false,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AddressData) => {
      const payload: AddressInput = {
        name:         data.name,
        phone:        data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city:         data.city,
        state:        data.state,
        pincode:      data.pincode,
        isDefault:    data.isDefault,
      };
      return editingId
        ? addressesApi.update(editingId, payload)
        : addressesApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      pushToast(editingId ? 'Address updated' : 'Address saved');
      setShowForm(false);
      setEditingId(null);
      reset();
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Could not save address. Please try again.';
      pushToast(msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      pushToast('Address deleted');
      setDeleteTarget(null);
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Could not delete address.';
      pushToast(msg, 'error');
      setDeleteTarget(null);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      pushToast('Default address updated');
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Could not update default address.';
      pushToast(msg, 'error');
    },
  });

  const openNew = () => {
    reset({
      name: '', phone: '', addressLine1: '', addressLine2: '',
      city: '', state: '', pincode: '', isDefault: false,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    reset(mapAddressToForm(addr));
    setEditingId(addr.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  // ─── Pincode → city/state auto-fill (debounced) ────────────
  const pincodeValue = watch('pincode');
  useEffect(() => {
    if (!/^\d{6}$/.test(pincodeValue ?? '')) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pincodeValue}`,
          { signal: controller.signal },
        );
        const json = await res.json();
        const office = json?.[0]?.PostOffice?.[0];
        if (office?.District && office?.State) {
          setValue('city', office.District, { shouldValidate: true, shouldDirty: true });
          setValue('state', office.State, { shouldValidate: true, shouldDirty: true });
        }
      } catch {
        /* silent — user can fill manually */
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [pincodeValue, setValue]);

  const deleteTarget = addresses.find((a) => a.id === deleteTargetId) ?? null;

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-[--charcoal] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--honey-400] transition-colors min-h-[44px]',
      hasError
        ? 'border-[--terracotta] focus:border-[--terracotta]'
        : 'border-[--sand] focus:border-[--honey-400]',
    );

  const labelClass = 'block font-satoshi text-[--charcoal] text-xs font-medium mb-1.5';

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="font-clash font-semibold text-[--charcoal] text-2xl md:text-3xl m-0">
          Saved Addresses
        </h1>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-5 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
        >
          <Plus size={15} aria-hidden /> Add Address
        </button>
      </div>

      {/* ── Add/Edit form ───────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: HONEY_EASE_OUT }}
            className="bg-[--cream-warm] rounded-2xl border border-[--sand] p-6 md:p-7 mb-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-clash text-[--charcoal] font-semibold text-lg m-0">
                {editingId ? 'Edit Address' : 'New Address'}
              </h2>
              <button
                type="button"
                onClick={cancelForm}
                aria-label="Close form"
                className="p-2 text-[--earth] hover:text-[--charcoal] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400]"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addr-name" className={labelClass}>Full Name *</label>
                  <input
                    id="addr-name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    className={inputClass(!!errors.name)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'addr-name-err' : undefined}
                  />
                  {errors.name && (
                    <p id="addr-name-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="addr-phone" className={labelClass}>Phone *</label>
                  <input
                    id="addr-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    {...register('phone')}
                    className={inputClass(!!errors.phone)}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'addr-phone-err' : undefined}
                  />
                  {errors.phone && (
                    <p id="addr-phone-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="addr-line1" className={labelClass}>Address Line 1 *</label>
                <input
                  id="addr-line1"
                  type="text"
                  autoComplete="address-line1"
                  {...register('addressLine1')}
                  className={inputClass(!!errors.addressLine1)}
                  aria-invalid={!!errors.addressLine1}
                  aria-describedby={errors.addressLine1 ? 'addr-line1-err' : undefined}
                />
                {errors.addressLine1 && (
                  <p id="addr-line1-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="addr-line2" className={labelClass}>Address Line 2</label>
                <input
                  id="addr-line2"
                  type="text"
                  autoComplete="address-line2"
                  {...register('addressLine2')}
                  className={inputClass(false)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="addr-pincode" className={labelClass}>Pincode *</label>
                  <input
                    id="addr-pincode"
                    type="text"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={6}
                    {...register('pincode')}
                    className={inputClass(!!errors.pincode)}
                    aria-invalid={!!errors.pincode}
                    aria-describedby={errors.pincode ? 'addr-pincode-err' : 'addr-pincode-hint'}
                  />
                  {errors.pincode ? (
                    <p id="addr-pincode-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                      {errors.pincode.message}
                    </p>
                  ) : (
                    <p id="addr-pincode-hint" className="font-satoshi text-[--earth] text-xs mt-1">
                      City &amp; state auto-fill from pincode
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="addr-city" className={labelClass}>City *</label>
                  <input
                    id="addr-city"
                    type="text"
                    autoComplete="address-level2"
                    {...register('city')}
                    className={inputClass(!!errors.city)}
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'addr-city-err' : undefined}
                  />
                  {errors.city && (
                    <p id="addr-city-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="addr-state" className={labelClass}>State *</label>
                  <select
                    id="addr-state"
                    autoComplete="address-level1"
                    {...register('state')}
                    className={inputClass(!!errors.state)}
                    aria-invalid={!!errors.state}
                    aria-describedby={errors.state ? 'addr-state-err' : undefined}
                  >
                    <option value="">Select</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && (
                    <p id="addr-state-err" className="font-satoshi text-[--terracotta] text-xs mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isDefault')}
                  className="w-4 h-4 accent-[--honey-500] focus:ring-2 focus:ring-[--honey-400]"
                />
                <span className="font-satoshi text-sm text-[--bark]">
                  Set as default delivery address
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="font-satoshi text-sm font-semibold text-[--bark] border border-[--sand] rounded-full px-5 py-2.5 min-h-[44px] hover:bg-[--cream] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || formSubmitting}
                  className="inline-flex items-center justify-center gap-2 font-satoshi text-sm font-semibold text-[--charcoal] bg-[--honey-400] hover:bg-[--honey-500] rounded-full px-6 py-2.5 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors disabled:opacity-60"
                >
                  {saveMutation.isPending ? <HoneycombLoader size="sm" /> : null}
                  {saveMutation.isPending
                    ? 'Saving…'
                    : editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── List ───────────────────────────────────────────── */}
      {isLoading ? (
        <div
          className="flex justify-center py-16"
          role="status"
          aria-label="Loading saved addresses"
        >
          <HoneycombLoader size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-[--cream-warm] rounded-2xl border border-[--sand]">
          <p className="font-satoshi text-[--bark] mb-4">
            We couldn&apos;t load your addresses.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-satoshi font-semibold text-sm bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-6 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-20 bg-[--cream-warm] rounded-2xl border border-[--sand]">
          <MapPin size={40} className="mx-auto text-[--earth-light] mb-4" aria-hidden />
          <p className="font-clash text-[--charcoal] font-semibold mb-1 text-lg">
            No saved addresses yet
          </p>
          <p className="font-satoshi text-[--earth] text-sm mb-6">
            Add an address to speed up checkout on future orders.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 font-satoshi font-semibold text-sm bg-[--honey-400] hover:bg-[--honey-500] text-[--charcoal] px-6 py-2.5 min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-500] transition-colors"
          >
            <Plus size={15} aria-hidden /> Add your first address
          </button>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isDefault = Boolean(addr.is_default);
            return (
              <div
                key={addr.id}
                className={cn(
                  'bg-[--cream-warm] rounded-2xl border p-5 relative transition-colors',
                  isDefault ? 'border-[--honey-400]' : 'border-[--sand]',
                )}
              >
                {isDefault && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-satoshi font-semibold text-[--honey-600]">
                    <Star size={12} className="fill-[--honey-500] text-[--honey-500]" aria-hidden />
                    Default
                  </span>
                )}
                <p className="font-satoshi text-[--charcoal] font-semibold text-sm">
                  {addr.name}
                </p>
                <p className="font-satoshi text-[--earth] text-sm mt-1">{addr.phone}</p>
                <p className="font-satoshi text-[--bark] text-sm mt-2 leading-relaxed">
                  {addr.address_line1}
                  {addr.address_line2 && `, ${addr.address_line2}`}
                  <br />
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[--sand] flex-wrap">
                  <button
                    type="button"
                    onClick={() => openEdit(addr)}
                    aria-label={`Edit address for ${addr.name}`}
                    className="inline-flex items-center gap-1.5 text-xs font-satoshi text-[--bark] hover:text-[--charcoal] min-h-[36px] px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded"
                  >
                    <Pencil size={13} aria-hidden /> Edit
                  </button>
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultMutation.mutate(addr.id)}
                      disabled={setDefaultMutation.isPending}
                      aria-label={`Set ${addr.name} as default address`}
                      className="inline-flex items-center gap-1.5 text-xs font-satoshi text-[--bark] hover:text-[--charcoal] min-h-[36px] px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] rounded disabled:opacity-60"
                    >
                      <Star size={13} aria-hidden /> Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(addr.id)}
                    aria-label={`Delete address for ${addr.name}`}
                    className="inline-flex items-center gap-1.5 text-xs font-satoshi text-[--earth] hover:text-[--terracotta] min-h-[36px] px-1 ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[--terracotta] rounded"
                  >
                    <Trash2 size={13} aria-hidden /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── Delete confirmation ────────────────────────────── */}
      <Dialog.Root open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AnimatePresence>
          {deleteTargetId && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-[--overlay]"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                aria-describedby="delete-addr-desc"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <motion.div
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-[--cream-warm] border border-[--sand] rounded-2xl p-6 shadow-[0_12px_40px_rgba(44,36,23,0.16)]"
                  initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: HONEY_EASE_OUT }}
                >
                  <Dialog.Title className="font-clash text-xl text-[--charcoal] m-0">
                    Delete this address?
                  </Dialog.Title>
                  <Dialog.Description
                    id="delete-addr-desc"
                    className="font-satoshi text-sm text-[--bark] mt-2"
                  >
                    {deleteTarget
                      ? `"${deleteTarget.name} — ${deleteTarget.address_line1}" will be permanently removed. This can't be undone.`
                      : 'This address will be permanently removed. This can\'t be undone.'}
                  </Dialog.Description>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        className="flex-1 font-satoshi text-sm font-semibold text-[--bark] border border-[--sand] rounded-full px-5 py-2.5 min-h-[44px] hover:bg-[--cream] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--honey-400] transition-colors disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="button"
                      onClick={() => deleteTargetId && deleteMutation.mutate(deleteTargetId)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 font-satoshi text-sm font-semibold text-white bg-[--terracotta] hover:opacity-90 rounded-full px-5 py-2.5 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--terracotta] transition-opacity disabled:opacity-60"
                    >
                      {deleteMutation.isPending ? <HoneycombLoader size="sm" /> : null}
                      {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      {/* ── Toasts ─────────────────────────────────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: HONEY_EASE_OUT }}
              className={cn(
                'font-satoshi text-sm px-4 py-3 rounded-xl border shadow-[0_8px_24px_rgba(44,36,23,0.12)] pointer-events-auto',
                t.tone === 'success'
                  ? 'bg-[--sage-light] border-[--sage]/30 text-[--charcoal]'
                  : 'bg-[--terracotta-light] border-[--terracotta]/30 text-[--charcoal]',
              )}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
