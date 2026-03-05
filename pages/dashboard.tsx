import { useState } from 'react';
import {
  Store, ShoppingCart, Users, TrendingUp,
  DollarSign, Heart, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Package, Activity
} from 'lucide-react';

// Mock data for Phase 1 - will be replaced with real API calls
const mockStats = {
  totalStores: 12,
  activeStores: 8,
  totalAccountHolders: 5,
  totalOrders: 247,
  totalRevenue: 8420.50,
  totalProfit: 3520.75,
  totalTorahFund: 421.03,
  pendingPayouts: 2,
  suspendedStores: 1,
};

const mockRecentOrders = [
  { id: '1', orderNumber: 'ETY-001247', storeName: 'Cozy Home Prints', customer: 'Sarah M.', amount: 34.99, status: 'SHIPPED', platform: 'ETSY', createdAt: '2026-02-24T10:30:00Z' },
  { id: '2', orderNumber: 'ETY-001246', storeName: 'Art Wall Studio', customer: 'John D.', amount: 29.99, status: 'PRODUCTION', platform: 'ETSY', createdAt: '2026-02-24T09:15:00Z' },
  { id: '3', orderNumber: 'ETY-001245', storeName: 'Cozy Home Prints', customer: 'Emily R.', amount: 44.99, status: 'DELIVERED', platform: 'ETSY', createdAt: '2026-02-23T16:45:00Z' },
  { id: '4', orderNumber: 'SHP-000089', storeName: 'Art Wall Studio', customer: 'Mike T.', amount: 39.99, status: 'PENDING', platform: 'SHOPIFY', createdAt: '2026-02-23T14:20:00Z' },
  { id: '5', orderNumber: 'ETY-001244', storeName: 'Pet Love Designs', customer: 'Lisa K.', amount: 24.99, status: 'SHIPPED', platform: 'ETSY', createdAt: '2026-02-23T11:00:00Z' },
];

const mockTopStores = [
  { name: 'Cozy Home Prints', revenue: 2840, orders: 89, health: 95, status: 'ACTIVE' as const },
  { name: 'Art Wall Studio', revenue: 2150, orders: 67, health: 88, status: 'ACTIVE' as const },
  { name: 'Pet Love Designs', revenue: 1430, orders: 45, health: 92, status: 'ACTIVE' as const },
  { name: 'Kitchen Art Co', revenue: 980, orders: 28, health: 78, status: 'WARMING_UP' as const },
  { name: 'Baby Room Prints', revenue: 620, orders: 18, health: 85, status: 'WARMING_UP' as const },
];

function StatCard({ title, value, icon: Icon, change, changeType, subtitle }: {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  changeType?: 'up' | 'down';
  subtitle?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${changeType === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-brand-50 rounded-xl">
          <Icon className="w-6 h-6 text-brand-600" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'badge-success',
    WARMING_UP: 'badge-warning',
    PENDING: 'badge-warning',
    SHIPPED: 'badge-info',
    DELIVERED: 'badge-success',
    PRODUCTION: 'badge-info',
    SUSPENDED: 'badge-danger',
  };
  return <span className={styles[status] || 'badge-gray'}>{status.replace('_', ' ')}</span>;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+12.5% this month"
          changeType="up"
        />
        <StatCard
          title="Active Stores"
          value={`${mockStats.activeStores} / ${mockStats.totalStores}`}
          icon={Store}
          change="+3 this month"
          changeType="up"
        />
        <StatCard
          title="Total Orders"
          value={mockStats.totalOrders}
          icon={ShoppingCart}
          change="+8.2% this week"
          changeType="up"
        />
        <StatCard
          title="Torah Fund"
          value={`$${mockStats.totalTorahFund.toLocaleString()}`}
          icon={Heart}
          subtitle={`${mockStats.pendingPayouts} pending payouts`}
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Net Profit"
          value={`$${mockStats.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          change="+15.3% this month"
          changeType="up"
        />
        <StatCard
          title="Account Holders"
          value={mockStats.totalAccountHolders}
          icon={Users}
          subtitle="All active"
        />
        <StatCard
          title="Alerts"
          value={mockStats.suspendedStores}
          icon={AlertTriangle}
          subtitle="1 store needs attention"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <a href="/orders" className="text-sm text-brand-600 hover:text-brand-700">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header px-6 py-3">Order</th>
                  <th className="table-header px-6 py-3">Store</th>
                  <th className="table-header px-6 py-3">Customer</th>
                  <th className="table-header px-6 py-3">Amount</th>
                  <th className="table-header px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${order.platform === 'ETSY' ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <span className="text-sm font-medium">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{order.storeName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-3 text-sm font-medium">${order.amount}</td>
                    <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Stores */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Top Stores</h3>
            <a href="/stores" className="text-sm text-brand-600 hover:text-brand-700">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {mockTopStores.map((store, i) => (
              <div key={i} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{store.name}</span>
                  <StatusBadge status={store.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>${store.revenue.toLocaleString()} revenue</span>
                  <span>{store.orders} orders</span>
                </div>
                <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${store.health >= 90 ? 'bg-emerald-500' : store.health >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${store.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Active', count: 8, color: 'bg-emerald-500', total: 12 },
              { label: 'Warming Up', count: 2, color: 'bg-amber-500', total: 12 },
              { label: 'Creating', count: 1, color: 'bg-blue-500', total: 12 },
              { label: 'Suspended', count: 1, color: 'bg-red-500', total: 12 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / item.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/stores/create" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <Store className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-medium">New Store</span>
            </a>
            <a href="/account-holders/create" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <Users className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-medium">Add Holder</span>
            </a>
            <a href="/products" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <Package className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-medium">Products</span>
            </a>
            <a href="/torah-fund" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <Heart className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-medium">Payouts</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
