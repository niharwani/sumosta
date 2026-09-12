import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Coupon, Product, ProductVariant } from 'shared';

// Coupon stacking rules:
// - PREPAID5 (5% prepaid): always applicable, never blocked by count limits
// - isFirstOrderOnly coupons (e.g. WELCOME10): validated server-side via order history
// - With a first-order coupon applied: max 3 total; otherwise max 2

export const MAX_COUPONS_DEFAULT = 2;
export const MAX_COUPONS_WITH_FIRST_ORDER = 3;
export const PREPAID_COUPON_CODE = 'PREPAID5';

export interface CouponDiscount {
  code: string;
  amount: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupons: Coupon[];
}

interface CartDerived {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
  couponDiscounts: CouponDiscount[];
}

export interface AddItemResult {
  /** how many units were actually added to the cart */
  added:     number;
  /** how many units the caller requested */
  requested: number;
  /** true when 0 units were added (out of stock) */
  blocked:   boolean;
  /** true when fewer units were added than requested (stock ceiling hit) */
  clamped:   boolean;
  /** known stock ceiling used to decide the outcome — null when unknown */
  stock:     number | null;
}

interface CartActions {
  addItem: (
    productId: string,
    variantId: string | null,
    quantity: number,
    product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'stock'>,
    variant?: ProductVariant | null,
  ) => AddItemResult;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  addCoupon: (coupon: Coupon) => void;
  removeCoupon: (code: string) => void;
  openCart: () => void;
  closeCart: () => void;
}

function computeUnitPrice(
  product: Pick<Product, 'price'>,
  variant: ProductVariant | null | undefined,
): number {
  return product.price + (variant?.priceAdjust ?? 0);
}

// Kept in lock-step with the backend so displayed cart total exactly
// matches what Razorpay/COD ends up charging.
//   Backend: apps/api/src/lib/utils.ts (calcShipping) — must stay in sync.
//   Backend: apps/api/src/routes/{checkout,razorpay}.ts (coupon amount rounding).
function computeDerived(items: CartItem[], coupons: Coupon[]): CartDerived {
  const subtotal = round2(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const couponDiscounts: CouponDiscount[] = [];
  let totalDiscount = 0;

  for (const coupon of coupons) {
    const meetsMinimum = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;
    if (!meetsMinimum) continue;

    const amount =
      coupon.type === 'percentage'
        ? round2(subtotal * coupon.value / 100)
        : Math.min(coupon.value, subtotal);

    couponDiscounts.push({ code: coupon.code, amount });
    totalDiscount += amount;
  }

  const discount = round2(totalDiscount);
  const afterDiscount = Math.max(0, round2(subtotal - discount));
  // Matches backend calcShipping — free above ₹499 order value (pre-coupon),
  // else flat ₹69. Qualifying on subtotal (not afterDiscount) means coupons
  // never bump a customer out of the free-shipping tier.
  const shipping = subtotal >= 499 ? 0 : 69;
  const total = round2(afterDiscount + shipping);

  return { subtotal, discount, shipping, total, itemCount, couponDiscounts };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

type CartStore = CartState & CartDerived & CartActions;

const DERIVED_ZERO: CartDerived = {
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  itemCount: 0,
  couponDiscounts: [],
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
  items: [],
  isOpen: false,
  coupons: [],

  ...DERIVED_ZERO,

  addItem: (productId, variantId, quantity, product, variant) => {
    const state = get();
    const existing = state.items.find(
      (i) => i.productId === productId && i.variantId === (variantId ?? null),
    );

    const unitPrice = computeUnitPrice(product, variant);
    // Server-side is still authoritative on stock, but reject client-side
    // pushes past known stock so the shopper doesn't reach checkout only
    // to get bounced. `undefined` stock (static catalog) falls through.
    const maxStock = variant?.stock ?? product.stock;
    const knownStock: number | null = typeof maxStock === 'number' ? maxStock : null;

    // Fully out of stock — refuse the add. Callers surface an "Out of stock"
    // message on the add button.
    if (knownStock !== null && knownStock <= 0) {
      return {
        added: 0, requested: quantity, blocked: true, clamped: false, stock: 0,
      };
    }

    const currentQty = existing?.quantity ?? 0;
    const targetQty = knownStock !== null
      ? Math.min(currentQty + quantity, knownStock)
      : currentQty + quantity;
    const added = targetQty - currentQty;
    const clamped = knownStock !== null && added < quantity;

    // Nothing new to add (cart already at ceiling) — bail without mutating.
    if (added <= 0) {
      return {
        added: 0, requested: quantity, blocked: true, clamped: true, stock: knownStock,
      };
    }

    set((state) => {
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.productId === productId && i.variantId === (variantId ?? null)
            ? { ...i, quantity: targetQty, lineTotal: unitPrice * targetQty }
            : i,
        );
      } else {
        const newItem: CartItem = {
          productId,
          variantId: variantId ?? null,
          product,
          variant: variant ?? null,
          quantity: targetQty,
          unitPrice,
          lineTotal: unitPrice * targetQty,
        };
        newItems = [...state.items, newItem];
      }

      // Fire analytics for the newly-added units only (not the running total)
      if (typeof window !== 'undefined') {
        import('@/lib/tracker').then(({ tracker }) => {
          tracker?.track('add_to_cart', {
            productId,
            variantId: variantId ?? null,
            productName: product.name,
            price:       unitPrice,
            quantity:    added,
          });
        }).catch(() => { /* non-blocking */ });
      }

      return { items: newItems, ...computeDerived(newItems, state.coupons) };
    });

    return { added, requested: quantity, blocked: false, clamped, stock: knownStock };
  },

  removeItem: (productId, variantId) => {
    set((state) => {
      const removed = state.items.find(
        (i) => i.productId === productId && i.variantId === (variantId ?? null),
      );
      const newItems = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === (variantId ?? null)),
      );
      if (removed && typeof window !== 'undefined') {
        import('@/lib/tracker').then(({ tracker }) => {
          tracker?.track('remove_from_cart', {
            productId: removed.productId,
            productName: removed.product.name,
            quantity: removed.quantity,
          });
        }).catch(() => { /* non-blocking */ });
      }
      // Auto-remove COMBO10 if the cart no longer qualifies. The 5 Elements
      // Collection is EXCLUDED from combo eligibility (single low-priced SKU
      // per client rule), so it doesn't count toward the 2-item threshold.
      const COMBO10_EXCLUDED_IDS = ['prod_trial_box_60g'];
      const eligibleQty = newItems
        .filter((i) => !COMBO10_EXCLUDED_IDS.includes(i.productId))
        .reduce((s, i) => s + i.quantity, 0);
      let newCoupons = state.coupons;
      if (eligibleQty < 2) {
        newCoupons = state.coupons.filter((c) => c.code !== 'COMBO10');
      }
      return { items: newItems, coupons: newCoupons, ...computeDerived(newItems, newCoupons) };
    });
  },

  updateQuantity: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantId);
      return;
    }
    set((state) => {
      const newItems = state.items.map((i) => {
        if (i.productId !== productId || i.variantId !== (variantId ?? null)) return i;
        const maxStock = i.variant?.stock ?? i.product.stock;
        const clamped = typeof maxStock === 'number' ? Math.min(quantity, maxStock) : quantity;
        return { ...i, quantity: clamped, lineTotal: i.unitPrice * clamped };
      });
      return { items: newItems, ...computeDerived(newItems, state.coupons) };
    });
  },

  clearCart: () => {
    set({ items: [], coupons: [], ...DERIVED_ZERO });
  },

  addCoupon: (coupon) => {
    set((state) => {
      if (state.coupons.some((c) => c.code === coupon.code)) return state;
      const newCoupons = [...state.coupons, coupon];
      return { coupons: newCoupons, ...computeDerived(state.items, newCoupons) };
    });
  },

  removeCoupon: (code) => {
    set((state) => {
      const newCoupons = state.coupons.filter((c) => c.code !== code);
      return { coupons: newCoupons, ...computeDerived(state.items, newCoupons) };
    });
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
    }),
    {
      name:    'sumosta-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items + coupons; isOpen is UI state, derived values are recomputed.
      partialize: (state) => ({ items: state.items, coupons: state.coupons }),
      // Recompute derived totals after hydration so shipping/discount/total are consistent.
      // Also strip COMBO10 if the persisted cart no longer qualifies — protects
      // users whose cart was saved before the 5-Elements exclusion rule shipped.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const COMBO10_EXCLUDED_IDS = ['prod_trial_box_60g'];
        const eligibleQty = state.items
          .filter((i) => !COMBO10_EXCLUDED_IDS.includes(i.productId))
          .reduce((s, i) => s + i.quantity, 0);
        if (eligibleQty < 2 && state.coupons.some((c) => c.code === 'COMBO10')) {
          state.coupons = state.coupons.filter((c) => c.code !== 'COMBO10');
        }
        const derived = computeDerived(state.items, state.coupons);
        Object.assign(state, derived);
      },
      version: 1,
    },
  ),
);
