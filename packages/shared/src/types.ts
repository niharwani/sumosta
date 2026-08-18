// ============================================================
// SHARED TYPES — used by both frontend (apps/web) and backend (apps/api)
// ============================================================

export interface User {
  id:         string;
  name:       string;
  email:      string;
  phone:      string;
  role:       'customer' | 'admin' | 'superadmin';
  createdAt:  string;
}

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  imageUrl:    string | null;
  sortOrder:   number;
}

export interface ProductImage {
  id:         string;
  url:        string;
  altText:    string | null;
  sortOrder:  number;
  isPrimary:  boolean;
}

export interface ProductVariant {
  id:                    string;
  name:                  string;
  sku:                   string;
  priceAdjust:           number;
  compareAtPriceAdjust?: number;
  stock:                 number;
}

export interface Product {
  id:               string;
  name:             string;
  slug:             string;
  sku:              string;
  categoryId:       string;
  category?:        Category;
  shortDescription: string;
  description:      string;
  price:            number;
  compareAtPrice:   number | null;
  costPrice:        number | null;
  stock:            number;
  lowStockThreshold: number;
  weight:           number | null;
  tags:             string[];
  isFeatured:       boolean;
  isActive:         boolean;
  metaTitle:        string | null;
  metaDescription:  string | null;
  images:           ProductImage[];
  variants:         ProductVariant[];
  // Optional so pre-launch SKUs with no reviews yet can omit these entirely.
  // UI hides the rating summary when both are missing/zero.
  averageRating?:   number;
  reviewCount?:     number;
  createdAt:        string;
  updatedAt:        string;
}

export interface CartItem {
  productId:  string;
  variantId:  string | null;
  product:    Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'stock'>;
  variant:    ProductVariant | null;
  quantity:   number;
  unitPrice:  number;
  lineTotal:  number;
}

export interface Cart {
  items:     CartItem[];
  subtotal:  number;
  discount:  number;
  shipping:  number;
  total:     number;
  coupon:    Coupon | null;
}

export interface Address {
  id?:           string;
  name:          string;
  phone:         string;
  addressLine1:  string;
  addressLine2?: string;
  city:          string;
  state:         string;
  pincode:       string;
  isDefault?:    boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded';

export interface OrderItem {
  id:            string;
  productId:     string;
  variantId:     string | null;
  productName:   string;
  variantName:   string | null;
  sku:           string;
  quantity:      number;
  unitPrice:     number;
  lineTotal:     number;
  imageUrl:      string | null;
}

export interface Order {
  id:                    string;
  orderNumber:           string;
  userId:                string | null;
  guestEmail:            string | null;
  status:                OrderStatus;
  paymentStatus:         PaymentStatus;
  items:                 OrderItem[];
  shippingAddress:       Address;
  subtotal:              number;
  discount:              number;
  shippingAmount:        number;
  tax:                   number;
  total:                 number;
  couponCode:            string | null;
  trackingNumber:        string | null;
  estimatedDeliveryDate: string | null;
  paidAt:                string | null;
  shippedAt:             string | null;
  deliveredAt:           string | null;
  createdAt:             string;
  updatedAt:             string;
}

export interface Review {
  id:         string;
  productId:  string;
  userId:     string;
  userName:   string;
  rating:     number;
  title:      string;
  body:       string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt:  string;
}

export interface Coupon {
  id:              string;
  code:            string;
  type:            'percentage' | 'fixed';
  value:           number;
  minOrderAmount:  number | null;
  maxUsage:        number | null;
  usageCount:      number;
  isFirstOrderOnly: boolean;
  isActive:        boolean;
  expiresAt:       string | null;
}

export interface ApiResponse<T> {
  data:    T;
  success: true;
}

export interface ApiError {
  error:   string;
  code:    string;
  success: false;
}

export interface PaginatedResponse<T> {
  data:        T[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
}

export interface DashboardStats {
  today:      PeriodStats;
  yesterday:  PeriodStats;
  thisMonth:  PeriodStats;
  recentOrders:     Order[];
  lowStockProducts: Product[];
  topProducts:      TopProduct[];
}

export interface PeriodStats {
  revenue:   number;
  orders:    number;
  aov:       number;
  visitors:  number;
}

export interface TopProduct {
  productId: string;
  name:      string;
  revenue:   number;
  units:     number;
}
