import { create } from 'zustand';
import type { CartItem, Coupon, Product, ProductVariant } from 'shared';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: Coupon | null;
}

interface CartDerived {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
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
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
}

function computeUnitPrice(
  product: Pick<Product, 'price'>,
  variant: ProductVariant | null | undefined,
): number {
  return product.price + (variant?.priceAdjust ?? 0);
}

function computeDerived(items: CartItem[], coupon: Coupon | null): CartDerived {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      discount = 0;
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= 500 ? 0 : 99;
  const total = afterDiscount + shipping;

  return { subtotal, discount, shipping, total, itemCount };
}

type CartStore = CartState & CartDerived & CartActions;

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  coupon: null,

  subtotal: 0,
  discount: 0,
  shipping: 99,
  total: 99,
  itemCount: 0,

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

      return { items: newItems, ...computeDerived(newItems, state.coupon) };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === (variantId ?? null)),
      );
      return { items: newItems, ...computeDerived(newItems, state.coupon) };
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
      return { items: newItems, ...computeDerived(newItems, state.coupon) };
    });
  },

  clearCart: () => {
    set({ items: [], coupon: null, ...computeDerived([], null) });
  },

  applyCoupon: (coupon) => {
    set((state) => ({
      coupon,
      ...computeDerived(state.items, coupon),
    }));
  },

  removeCoupon: () => {
    set((state) => ({
      coupon: null,
      ...computeDerived(state.items, null),
    }));
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
