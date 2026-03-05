import { useState } from 'react';
import {
  ShoppingCart, Search, Filter, ExternalLink,
  Package, Truck, CheckCircle, XCircle, Clock,
  RefreshCw, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import type { Order, OrderStatus, Platform } from '@/lib/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; class: string; icon: any }> = {
  PENDING: { label: 'Pending', class: 'badge-warning', icon: Clock },
  PROCESSING: { label: 'Processing', class: 'badge-info', icon: RefreshCw },
  PRODUCTION: { label: 'In Production', class: 'badge-info', icon: Package },
  SHIPPED: { label: 'Shipped', class: 'badge-info', icon: Truck },
  DELIVERED: { label: 'Delivered', class: 'badge-success', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', class: 'badge-danger', icon: XCircle },
  REFUNDED: { label: 'Refunded', class: 'badge-danger', icon: AlertTriangle },
};

const mockOrders: (Order & { storeName: string; productTitle: string })[] = [
  { id: '1', storeId: '1', productId: '1', platform: 'ETSY', orderNumber: 'ETY-001247', customerName: 'Sarah Mitchell', customerEmail: 'sarah@example.com', customerAddress: '123 Oak St, Portland, OR 97201', amount: 34.99, podCost: 12.50, platformFees: 5.25, profit: 15.49, podProvider: 'Printful', podOrderId: 'PF-88234', trackingNumber: '9400111899223100324872', status: 'SHIPPED', createdAt: '2026-02-24T10:30:00Z', updatedAt: '2026-02-24T15:00:00Z', storeName: 'Cozy Home Prints', productTitle: 'Mountain Landscape Canvas' },
  { id: '2', storeId: '2', productId: '5', platform: 'ETSY', orderNumber: 'ETY-001246', customerName: 'John Davis', customerEmail: 'john@example.com', customerAddress: '456 Pine Ave, Seattle, WA 98101', amount: 29.99, podCost: 10.00, platformFees: 4.50, profit: 14.24, podProvider: 'Printful', podOrderId: 'PF-88235', trackingNumber: null, status: 'PRODUCTION', createdAt: '2026-02-24T09:15:00Z', updatedAt: '2026-02-24T12:00:00Z', storeName: 'Art Wall Studio', productTitle: 'Abstract Blue Wave Print' },
  { id: '3', storeId: '1', productId: '3', platform: 'ETSY', orderNumber: 'ETY-001245', customerName: 'Emily Roberts', customerEmail: 'emily@example.com', customerAddress: '789 Elm Blvd, Denver, CO 80201', amount: 44.99, podCost: 15.00, platformFees: 6.75, profit: 20.99, podProvider: 'Printful', podOrderId: 'PF-88230', trackingNumber: '9400111899223100324889', status: 'DELIVERED', createdAt: '2026-02-23T16:45:00Z', updatedAt: '2026-02-24T10:00:00Z', storeName: 'Cozy Home Prints', productTitle: 'Botanical Garden Set' },
  { id: '4', storeId: '2', productId: '8', platform: 'SHOPIFY', orderNumber: 'SHP-000089', customerName: 'Mike Thompson', customerEmail: 'mike@example.com', customerAddress: '321 Maple Dr, Austin, TX 78701', amount: 39.99, podCost: 13.50, platformFees: 4.00, profit: 20.49, podProvider: 'Printful', podOrderId: null, trackingNumber: null, status: 'PENDING', createdAt: '2026-02-23T14:20:00Z', updatedAt: '2026-02-23T14:20:00Z', storeName: 'Art Wall Studio', productTitle: 'City Skyline Poster' },
  { id: '5', storeId: '3', productId: '12', platform: 'ETSY', orderNumber: 'ETY-001244', customerName: 'Lisa Kim', customerEmail: 'lisa@example.com', customerAddress: '555 Cherry Ln, San Francisco, CA 94102', amount: 24.99, podCost: 8.50, platformFees: 3.75, profit: 11.49, podProvider: 'Printful', podOrderId: 'PF-88225', trackingNumber: '9400111899223100324896', status: 'SHIPPED', createdAt: '2026-02-23T11:00:00Z', updatedAt: '2026-02-23T18:00:00Z', storeName: 'Pet Love Designs', productTitle: 'Custom Pet Portrait Mug' },
  { id: '6', storeId: '3', productId: '15', platform: 'ETSY', orderNumber: 'ETY-001243', customerName: 'David Wilson', customerEmail: 'david@example.com', customerAddress: '777 River Rd, Chicago, IL 60601', amount: 19.99, podCost: 7.50, platformFees: 3.00, profit: 8.24, podProvider: 'Printful', podOrderId: 'PF-88220', trackingNumber: '9400111899223100324903', status: 'DELIVERED', createdAt: '2026-02-22T15:30:00Z', updatedAt: '2026-02-24T08:00:00Z', storeName: 'Pet Love Designs', productTitle: 'Paw Print Phone Case' },
  { id: '7', storeId: '4', productId: '20', platform: 'ETSY', orderNumber: 'ETY-001242', customerName: 'Jennifer Brown', customerEmail: 'jen@example.com', customerAddress: '888 Beach Blvd, Miami, FL 33101', amount: 32.99, podCost: 11.00, platformFees: 4.95, profit: 15.39, podProvider: 'Printful', podOrderId: 'PF-88215', trackingNumber: null, status: 'CANCELLED', createdAt: '2026-02-22T09:00:00Z', updatedAt: '2026-02-22T14:00:00Z', storeName: 'Kitchen Art Co', productTitle: 'Recipe Wall Art Set' },
  { id: '8', storeId: '1', productId: '2', platform: 'ETSY', orderNumber: 'ETY-001241', customerName: 'Robert Taylor', customerEmail: 'robert@example.com', customerAddress: '999 Lake St, Minneapolis, MN 55401', amount: 27.99, podCost: 9.50, platformFees: 4.20, profit: 12.89, podProvider: 'Printful', podOrderId: 'PF-88210', trackingNumber: '9400111899223100324910', status: 'DELIVERED', createdAt: '2026-02-21T12:00:00Z', updatedAt: '2026-02-23T09:00:00Z', storeName: 'Cozy Home Prints', productTitle: 'Sunset Beach Canvas' },
];

export default function OrdersPage() {
  const [orders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const filtered = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPlatform = platformFilter === 'ALL' || o.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);
  const torahFund = totalRevenue * 0.05;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Unified order feed from all Etsy + Shopify stores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className="text-2xl font-bold text-emerald-600">${totalProfit.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Torah Fund (5%)</p>
          <p className="text-2xl font-bold text-brand-600">${torahFund.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by order #, customer, store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
            <option key={key} value={key}>{conf.label}</option>
          ))}
        </select>
        <select className="input-field w-auto" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="ALL">All Platforms</option>
          <option value="ETSY">Etsy</option>
          <option value="SHOPIFY">Shopify</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="table-header px-6 py-3">Order</th>
              <th className="table-header px-6 py-3">Store</th>
              <th className="table-header px-6 py-3">Product</th>
              <th className="table-header px-6 py-3">Customer</th>
              <th className="table-header px-6 py-3">Amount</th>
              <th className="table-header px-6 py-3">Profit</th>
              <th className="table-header px-6 py-3">POD</th>
              <th className="table-header px-6 py-3">Status</th>
              <th className="table-header px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((order) => {
              const statusConf = STATUS_CONFIG[order.status];
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${order.platform === 'ETSY' ? 'bg-orange-500' : 'bg-green-500'}`} />
                      <span className="text-sm font-medium">{order.orderNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{order.storeName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 max-w-[150px] truncate">{order.productTitle}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{order.customerName}</td>
                  <td className="px-6 py-3 text-sm font-medium">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm font-medium text-emerald-600">${order.profit.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <div className="text-xs text-gray-500">
                      {order.podProvider}
                      {order.trackingNumber && (
                        <div className="text-brand-600 truncate max-w-[80px]" title={order.trackingNumber}>
                          {order.trackingNumber.slice(-8)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3"><span className={statusConf.class}>{statusConf.label}</span></td>
                  <td className="px-6 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
