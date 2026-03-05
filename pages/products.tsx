import { useState } from 'react';
import {
  Package, Search, Plus, Filter, Eye,
  Heart, DollarSign, TrendingUp, Image,
  MoreVertical, ExternalLink, Tag
} from 'lucide-react';
import type { Product, ProductStatus } from '@/lib/types';

const STATUS_CONFIG: Record<ProductStatus, { label: string; class: string }> = {
  DRAFT: { label: 'Draft', class: 'badge-gray' },
  ACTIVE: { label: 'Active', class: 'badge-success' },
  SOLD_OUT: { label: 'Sold Out', class: 'badge-warning' },
  PAUSED: { label: 'Paused', class: 'badge-info' },
  REMOVED: { label: 'Removed', class: 'badge-danger' },
};

const mockProducts: (Product & { storeName: string })[] = [
  { id: '1', storeId: '1', title: 'Mountain Landscape Canvas Print - Nature Photography Wall Art', description: '', price: 34.99, cost: 12.50, podProviderId: 'printful', podProductId: 'pf-1', designFileUrl: null, etsyListingId: 'etsy-1234', shopifyProductId: null, status: 'ACTIVE', tags: ['landscape', 'mountain', 'nature', 'canvas', 'wall art'], category: 'Home Decor', views: 342, favorites: 28, sales: 15, createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Cozy Home Prints' },
  { id: '2', storeId: '1', title: 'Sunset Beach Canvas - Ocean Photography Art Print', description: '', price: 29.99, cost: 10.00, podProviderId: 'printful', podProductId: 'pf-2', designFileUrl: null, etsyListingId: 'etsy-1235', shopifyProductId: null, status: 'ACTIVE', tags: ['sunset', 'beach', 'ocean', 'canvas'], category: 'Home Decor', views: 256, favorites: 19, sales: 11, createdAt: '2026-01-22T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Cozy Home Prints' },
  { id: '3', storeId: '1', title: 'Botanical Garden Set of 3 - Minimalist Plant Art', description: '', price: 44.99, cost: 15.00, podProviderId: 'printful', podProductId: 'pf-3', designFileUrl: null, etsyListingId: 'etsy-1236', shopifyProductId: null, status: 'ACTIVE', tags: ['botanical', 'plant', 'minimalist', 'set'], category: 'Home Decor', views: 189, favorites: 31, sales: 8, createdAt: '2026-01-25T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Cozy Home Prints' },
  { id: '5', storeId: '2', title: 'Abstract Blue Wave Print - Modern Wall Art', description: '', price: 29.99, cost: 10.00, podProviderId: 'printful', podProductId: 'pf-5', designFileUrl: null, etsyListingId: 'etsy-2235', shopifyProductId: null, status: 'ACTIVE', tags: ['abstract', 'blue', 'wave', 'modern'], category: 'Wall Art', views: 412, favorites: 35, sales: 18, createdAt: '2026-01-28T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Art Wall Studio' },
  { id: '8', storeId: '2', title: 'City Skyline Poster - Urban Photography', description: '', price: 39.99, cost: 13.50, podProviderId: 'printful', podProductId: 'pf-8', designFileUrl: null, etsyListingId: 'etsy-2238', shopifyProductId: null, status: 'ACTIVE', tags: ['city', 'skyline', 'urban', 'photography'], category: 'Wall Art', views: 167, favorites: 12, sales: 5, createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Art Wall Studio' },
  { id: '12', storeId: '3', title: 'Custom Pet Portrait Mug - Dog & Cat', description: '', price: 24.99, cost: 8.50, podProviderId: 'printful', podProductId: 'pf-12', designFileUrl: null, etsyListingId: 'etsy-3234', shopifyProductId: null, status: 'ACTIVE', tags: ['pet', 'portrait', 'mug', 'custom', 'dog', 'cat'], category: 'Pet Products', views: 523, favorites: 45, sales: 22, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Pet Love Designs' },
  { id: '15', storeId: '3', title: 'Paw Print Phone Case - iPhone & Samsung', description: '', price: 19.99, cost: 7.50, podProviderId: 'printful', podProductId: 'pf-15', designFileUrl: null, etsyListingId: 'etsy-3237', shopifyProductId: null, status: 'ACTIVE', tags: ['paw', 'phone case', 'pet lover'], category: 'Pet Products', views: 234, favorites: 18, sales: 9, createdAt: '2026-02-08T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Pet Love Designs' },
  { id: '20', storeId: '4', title: 'Recipe Wall Art Set - Kitchen Typography', description: '', price: 32.99, cost: 11.00, podProviderId: 'printful', podProductId: 'pf-20', designFileUrl: null, etsyListingId: 'etsy-4234', shopifyProductId: null, status: 'PAUSED', tags: ['recipe', 'kitchen', 'typography', 'wall art'], category: 'Kitchen & Dining', views: 89, favorites: 7, sales: 3, createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', storeName: 'Kitchen Art Co' },
];

function MarginBadge({ price, cost }: { price: number; cost: number }) {
  const margin = ((price - cost) / price * 100);
  const color = margin >= 60 ? 'text-emerald-600' : margin >= 40 ? 'text-amber-600' : 'text-red-600';
  return <span className={`text-xs font-medium ${color}`}>{margin.toFixed(0)}%</span>;
}

export default function ProductsPage() {
  const [products] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');

  const stores = Array.from(new Set(products.map(p => p.storeName)));

  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesStore = storeFilter === 'ALL' || p.storeName === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  const totalViews = products.reduce((s, p) => s + p.views, 0);
  const totalSales = products.reduce((s, p) => s + p.sales, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage listings across all stores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-500">Total Products</p>
          </div>
          <p className="text-2xl font-bold mt-1">{totalProducts}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{activeProducts}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-gray-500">Total Views</p>
          </div>
          <p className="text-2xl font-bold mt-1">{totalViews.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-500" />
            <p className="text-sm text-gray-500">Total Sales</p>
          </div>
          <p className="text-2xl font-bold mt-1">{totalSales}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" className="input-field pl-10" placeholder="Search products or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input-field w-auto" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
          <option value="ALL">All Stores</option>
          {stores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="table-header px-6 py-3">Product</th>
              <th className="table-header px-6 py-3">Store</th>
              <th className="table-header px-6 py-3">Price</th>
              <th className="table-header px-6 py-3">Cost</th>
              <th className="table-header px-6 py-3">Margin</th>
              <th className="table-header px-6 py-3">Views</th>
              <th className="table-header px-6 py-3">Favs</th>
              <th className="table-header px-6 py-3">Sales</th>
              <th className="table-header px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="max-w-[280px]">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {product.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{tag}</span>
                      ))}
                      {product.tags.length > 3 && <span className="text-xs text-gray-400">+{product.tags.length - 3}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{product.storeName}</td>
                <td className="px-6 py-3 text-sm font-medium">${product.price.toFixed(2)}</td>
                <td className="px-6 py-3 text-sm text-gray-500">${product.cost.toFixed(2)}</td>
                <td className="px-6 py-3"><MarginBadge price={product.price} cost={product.cost} /></td>
                <td className="px-6 py-3 text-sm text-gray-600">{product.views}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{product.favorites}</span>
                </td>
                <td className="px-6 py-3 text-sm font-medium">{product.sales}</td>
                <td className="px-6 py-3"><span className={STATUS_CONFIG[product.status].class}>{STATUS_CONFIG[product.status].label}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
