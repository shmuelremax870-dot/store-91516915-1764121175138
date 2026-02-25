import { useState } from 'react';
import Link from 'next/link';
import {
  Store as StoreIcon, Plus, Search, Grid3X3, List,
  ExternalLink, Activity, TrendingUp, MoreVertical,
  Pause, Play, Trash2, Copy
} from 'lucide-react';
import type { Store, StoreStatus, Platform } from '@/lib/types';

const STATUS_CONFIG: Record<StoreStatus, { label: string; class: string; color: string }> = {
  CREATING: { label: 'Creating', class: 'badge-info', color: 'bg-blue-500' },
  WARMING_UP: { label: 'Warming Up', class: 'badge-warning', color: 'bg-amber-500' },
  ACTIVE: { label: 'Active', class: 'badge-success', color: 'bg-emerald-500' },
  PAUSED: { label: 'Paused', class: 'badge-gray', color: 'bg-gray-400' },
  SUSPENDED: { label: 'Suspended', class: 'badge-danger', color: 'bg-red-500' },
  TERMINATED: { label: 'Terminated', class: 'badge-danger', color: 'bg-red-800' },
};

const mockStores: (Store & { accountHolderName: string; nicheName: string })[] = [
  { id: '1', accountHolderId: '1', platform: 'ETSY', storeName: 'Cozy Home Prints', storeUrl: 'https://etsy.com/shop/CozyHomePrints', nicheId: '1', status: 'ACTIVE', healthScore: 95, etsyStoreId: 'ets_1234', shopifyStoreId: null, mirrorStoreId: null, listingCount: 120, totalRevenue: 2840, totalOrders: 89, warmupWeek: 8, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', accountHolderName: 'משה כהן', nicheName: 'Home Decor', _count: { products: 120, orders: 89 } },
  { id: '2', accountHolderId: '1', platform: 'ETSY', storeName: 'Art Wall Studio', storeUrl: 'https://etsy.com/shop/ArtWallStudio', nicheId: '2', status: 'ACTIVE', healthScore: 88, etsyStoreId: 'ets_2345', shopifyStoreId: null, mirrorStoreId: null, listingCount: 85, totalRevenue: 2150, totalOrders: 67, warmupWeek: 6, createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', accountHolderName: 'משה כהן', nicheName: 'Wall Art', _count: { products: 85, orders: 67 } },
  { id: '3', accountHolderId: '2', platform: 'ETSY', storeName: 'Pet Love Designs', storeUrl: 'https://etsy.com/shop/PetLoveDesigns', nicheId: '3', status: 'ACTIVE', healthScore: 92, etsyStoreId: 'ets_3456', shopifyStoreId: null, mirrorStoreId: null, listingCount: 65, totalRevenue: 1430, totalOrders: 45, warmupWeek: 5, createdAt: '2026-01-25T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', accountHolderName: 'יעקב לוי', nicheName: 'Pet Products', _count: { products: 65, orders: 45 } },
  { id: '4', accountHolderId: '3', platform: 'ETSY', storeName: 'Kitchen Art Co', storeUrl: 'https://etsy.com/shop/KitchenArtCo', nicheId: '4', status: 'WARMING_UP', healthScore: 78, etsyStoreId: 'ets_4567', shopifyStoreId: null, mirrorStoreId: null, listingCount: 25, totalRevenue: 980, totalOrders: 28, warmupWeek: 3, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', accountHolderName: 'אברהם גולדשטיין', nicheName: 'Kitchen & Dining', _count: { products: 25, orders: 28 } },
  { id: '5', accountHolderId: '3', platform: 'ETSY', storeName: 'Baby Room Prints', storeUrl: null, nicheId: '5', status: 'WARMING_UP', healthScore: 85, etsyStoreId: 'ets_5678', shopifyStoreId: null, mirrorStoreId: null, listingCount: 15, totalRevenue: 620, totalOrders: 18, warmupWeek: 2, createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', accountHolderName: 'אברהם גולדשטיין', nicheName: 'Baby & Kids', _count: { products: 15, orders: 18 } },
  { id: '6', accountHolderId: '5', platform: 'ETSY', storeName: 'Gym Motivation Art', storeUrl: null, nicheId: '6', status: 'CREATING', healthScore: 100, etsyStoreId: null, shopifyStoreId: null, mirrorStoreId: null, listingCount: 0, totalRevenue: 0, totalOrders: 0, warmupWeek: 1, createdAt: '2026-02-22T00:00:00Z', updatedAt: '2026-02-22T00:00:00Z', accountHolderName: 'שמואל רוזנברג', nicheName: 'Fitness', _count: { products: 0, orders: 0 } },
  { id: '7', accountHolderId: '1', platform: 'ETSY', storeName: 'Vintage Typography', storeUrl: 'https://etsy.com/shop/VintageTypography', nicheId: '7', status: 'SUSPENDED', healthScore: 35, etsyStoreId: 'ets_6789', shopifyStoreId: null, mirrorStoreId: null, listingCount: 45, totalRevenue: 890, totalOrders: 22, warmupWeek: 4, createdAt: '2026-01-28T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z', accountHolderName: 'משה כהן', nicheName: 'Typography', _count: { products: 45, orders: 22 } },
];

function HealthBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-500">{score}</span>
    </div>
  );
}

export default function StoresPage() {
  const [stores] = useState(mockStores);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const filtered = stores.filter(s => {
    const matchesSearch = s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || s.accountHolderName.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesPlatform = platformFilter === 'ALL' || s.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-sm text-gray-500 mt-1">{stores.length} stores across {new Set(stores.map(s => s.accountHolderId)).size} account holders</p>
        </div>
        <Link href="/stores/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Store
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
          const count = stores.filter(s => s.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'ALL' : key)}
              className={`card p-3 text-center transition-all ${statusFilter === key ? 'ring-2 ring-brand-500' : 'hover:shadow-md'}`}
            >
              <div className={`w-2 h-2 rounded-full ${conf.color} mx-auto mb-1`} />
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs text-gray-500">{conf.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="input-field w-auto" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="ALL">All Platforms</option>
          <option value="ETSY">Etsy</option>
          <option value="SHOPIFY">Shopify</option>
        </select>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Store List */}
      {viewMode === 'list' ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header px-6 py-3">Store</th>
                <th className="table-header px-6 py-3">Account Holder</th>
                <th className="table-header px-6 py-3">Niche</th>
                <th className="table-header px-6 py-3">Status</th>
                <th className="table-header px-6 py-3">Health</th>
                <th className="table-header px-6 py-3">Listings</th>
                <th className="table-header px-6 py-3">Revenue</th>
                <th className="table-header px-6 py-3">Orders</th>
                <th className="table-header px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${store.platform === 'ETSY' ? 'bg-orange-500' : 'bg-green-500'}`} />
                      <Link href={`/stores/${store.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                        {store.storeName}
                      </Link>
                      {store.storeUrl && (
                        <a href={store.storeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {store.status === 'WARMING_UP' && (
                      <span className="text-xs text-amber-600">Week {store.warmupWeek}/5</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{store.accountHolderName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{store.nicheName}</td>
                  <td className="px-6 py-4"><span className={STATUS_CONFIG[store.status].class}>{STATUS_CONFIG[store.status].label}</span></td>
                  <td className="px-6 py-4"><HealthBar score={store.healthScore} /></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{store.listingCount}</td>
                  <td className="px-6 py-4 text-sm font-medium">${store.totalRevenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{store.totalOrders}</td>
                  <td className="px-6 py-4">
                    <Link href={`/stores/${store.id}`} className="text-brand-600 hover:text-brand-700 text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${store.platform === 'ETSY' ? 'bg-orange-500' : 'bg-green-500'}`} />
                  <h3 className="font-semibold text-gray-900">{store.storeName}</h3>
                </div>
                <span className={STATUS_CONFIG[store.status].class}>{STATUS_CONFIG[store.status].label}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{store.accountHolderName} | {store.nicheName}</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Revenue</p>
                  <p className="text-sm font-semibold">${store.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Orders</p>
                  <p className="text-sm font-semibold">{store.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Listings</p>
                  <p className="text-sm font-semibold">{store.listingCount}</p>
                </div>
              </div>
              <HealthBar score={store.healthScore} />
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <StoreIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No stores found matching your filters</p>
        </div>
      )}
    </div>
  );
}
