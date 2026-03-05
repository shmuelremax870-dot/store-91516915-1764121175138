/**
 * Shared TypeScript types for the platform
 * These types mirror the Prisma schema but are used on the frontend
 */

// ============ Enums ============

export type AccountHolderStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'PAUSED' | 'TERMINATED';
export type Platform = 'ETSY' | 'SHOPIFY';
export type StoreStatus = 'CREATING' | 'WARMING_UP' | 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'TERMINATED';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'PAUSED' | 'REMOVED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type TorahFundStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CLAWED_BACK';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PaymentMethod = 'BANK_TRANSFER' | 'BIT' | 'PAYBOX' | 'PAYPAL';
export type CompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProxyStatus = 'ACTIVE' | 'ROTATING' | 'EXPIRED';
export type ApiProvider = 'ETSY' | 'SHOPIFY' | 'PRINTFUL' | 'PRINTIFY' | 'GOOTEN' | 'SPOD' | 'PROXY' | 'OPENROUTER' | 'PAYMENT' | 'OTHER';

// ============ Entity Types ============

export interface AccountHolder {
  id: string;
  fullName: string;
  teudatZehut: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  bitPhone: string | null;
  status: AccountHolderStatus;
  maxStores: number;
  torahFundRate: number;
  totalEarned: number;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  stores?: Store[];
  _count?: { stores: number; torahFunds: number; payouts: number };
}

export interface Store {
  id: string;
  accountHolderId: string;
  platform: Platform;
  storeName: string;
  storeUrl: string | null;
  nicheId: string | null;
  status: StoreStatus;
  healthScore: number;
  etsyStoreId: string | null;
  shopifyStoreId: string | null;
  mirrorStoreId: string | null;
  listingCount: number;
  totalRevenue: number;
  totalOrders: number;
  warmupWeek: number;
  createdAt: string;
  updatedAt: string;
  accountHolder?: AccountHolder;
  niche?: Niche;
  products?: Product[];
  _count?: { products: number; orders: number };
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  cost: number;
  podProviderId: string | null;
  podProductId: string | null;
  designFileUrl: string | null;
  etsyListingId: string | null;
  shopifyProductId: string | null;
  status: ProductStatus;
  tags: string[];
  category: string | null;
  views: number;
  favorites: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
  store?: Store;
}

export interface Order {
  id: string;
  storeId: string;
  productId: string | null;
  platform: Platform;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string | null;
  amount: number;
  podCost: number;
  platformFees: number;
  profit: number;
  podProvider: string | null;
  podOrderId: string | null;
  trackingNumber: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  store?: Store;
  product?: Product;
  torahFund?: TorahFund;
}

export interface TorahFund {
  id: string;
  accountHolderId: string;
  orderId: string;
  storeId: string;
  saleAmount: number;
  fundRate: number;
  fundAmount: number;
  status: TorahFundStatus;
  payoutId: string | null;
  createdAt: string;
  accountHolder?: AccountHolder;
  order?: Order;
  store?: Store;
}

export interface Payout {
  id: string;
  accountHolderId: string;
  amountUsd: number;
  amountIls: number;
  exchangeRate: number;
  paymentMethod: PaymentMethod;
  reference: string | null;
  status: PayoutStatus;
  createdAt: string;
  accountHolder?: AccountHolder;
  torahFunds?: TorahFund[];
}

export interface Niche {
  id: string;
  name: string;
  description: string | null;
  keywords: string[];
  avgMargin: number;
  competitionLevel: CompetitionLevel;
  trendingScore: number;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSecret {
  id: string;
  name: string;
  provider: ApiProvider;
  apiKey: string;
  apiSecret: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  webhookSecret: string | null;
  metadata: Record<string, any> | null;
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any> | null;
  performedBy: string;
  createdAt: string;
}

// ============ Dashboard Stats ============

export interface DashboardStats {
  totalStores: number;
  activeStores: number;
  totalAccountHolders: number;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalTorahFund: number;
  pendingPayouts: number;
  storesByStatus: Record<StoreStatus, number>;
  recentOrders: Order[];
  topStores: Store[];
}

// ============ Form Types ============

export interface CreateAccountHolderInput {
  fullName: string;
  teudatZehut: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  bitPhone?: string;
  maxStores?: number;
  notes?: string;
}

export interface CreateStoreInput {
  accountHolderId: string;
  platform: Platform;
  storeName: string;
  nicheId?: string;
}

export interface CreateApiSecretInput {
  name: string;
  provider: ApiProvider;
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}
