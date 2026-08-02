import { create } from 'zustand';
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

interface CartActions {
  addItem: (
    productId: string,
    variantId: string | null,
    quantity: number,
    product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'stock'>,
    variant?: ProductVariant | null,
  ) => void;
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

function computeDerived(items: CartItem[], coupons: Coupon[]): CartDerived {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const couponDiscounts: CouponDiscount[] = [];
  let totalDiscount = 0;

  for (const coupon of coupons) {
    const meetsMinimum = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;
    if (!meetsMinimum) continue;

    const amount =
      coupon.type === 'percentage'
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;

    couponDiscounts.push({ code: coupon.code, amount });
    totalDiscount += amount;
  }

  const discount = totalDiscount;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= 499 ? 0 : 49;
  const total = afterDiscount + shipping;

  return { subtotal, discount, shipping, total, itemCount, couponDiscounts };
}

type CartStore = CartState & CartDerived & CartActions;

const DERIVED_ZERO: CartDerived = {
  subtotal: 0,
  discount: 0,
  shipping: 49,
  total: 49,
  itemCount: 0,
  couponDiscounts: [],
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  coupons: [],

  ...DERIVED_ZERO,

  addItem: (productId, variantId, quantity, product, variant) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === productId && i.variantId === (variantId ?? null),
      );

      const unitPrice = computeUnitPrice(product, variant);
      let newItems: CartItem[];

      if (existing) {
        const newQty = existing.quantity + quantity;
        newItems = state.items.map((i) =>
          i.productId === productId && i.variantId === (variantId ?? null)
            ? { ...i, quantity: newQty, lineTotal: unitPrice * newQty }
            : i,
        );
      } else {
        const newItem: CartItem = {
          productId,
          variantId: variantId ?? null,
          product,
          variant: variant ?? null,
          quantity,
          unitPrice,
          lineTotal: unitPrice * quantity,
        };
        newItems = [...state.items, newItem];
      }

      return { items: newItems, ...computeDerived(newItems, state.coupons) };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === (variantId ?? null)),
      );
      return { items: newItems, ...computeDerived(newItems, state.coupons) };
    });
  },

  updateQuantity: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantId);
      return;
    }
    set((state) => {
      const newItems = state.items.map((i) =>
        i.productId === productId && i.variantId === (variantId ?? null)
          ? { ...i, quantity, lineTotal: i.unitPrice * quantity }
          : i,
      );
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
}));
