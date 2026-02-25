import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Search, Filter, MoreVertical,
  CheckCircle, Clock, PauseCircle, XCircle,
  Store, Heart, ChevronRight
} from 'lucide-react';
import type { AccountHolder, AccountHolderStatus } from '@/lib/types';

const STATUS_CONFIG: Record<AccountHolderStatus, { label: string; class: string; icon: any }> = {
  PENDING_VERIFICATION: { label: 'Pending', class: 'badge-warning', icon: Clock },
  ACTIVE: { label: 'Active', class: 'badge-success', icon: CheckCircle },
  PAUSED: { label: 'Paused', class: 'badge-info', icon: PauseCircle },
  TERMINATED: { label: 'Terminated', class: 'badge-danger', icon: XCircle },
};

// Mock data
const mockAccountHolders: AccountHolder[] = [
  { id: '1', fullName: 'משה כהן', teudatZehut: '12345678', email: 'moshe@example.com', phone: '+972-50-1234567', address: 'רחוב הרב קוק 15', city: 'בני ברק', bankName: 'הפועלים', bankAccount: '123456789', bankBranch: '690', bitPhone: '+972-50-1234567', status: 'ACTIVE', maxStores: 5, torahFundRate: 0.05, totalEarned: 245.50, verifiedAt: '2026-01-15T00:00:00Z', notes: null, createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', _count: { stores: 3, torahFunds: 72, payouts: 2 } },
  { id: '2', fullName: 'יעקב לוי', teudatZehut: '23456789', email: 'yaakov@example.com', phone: '+972-52-2345678', address: 'רחוב חזון איש 8', city: 'בני ברק', bankName: 'לאומי', bankAccount: '234567890', bankBranch: '780', bitPhone: null, status: 'ACTIVE', maxStores: 5, torahFundRate: 0.05, totalEarned: 189.25, verifiedAt: '2026-01-20T00:00:00Z', notes: null, createdAt: '2026-01-18T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', _count: { stores: 2, torahFunds: 54, payouts: 2 } },
  { id: '3', fullName: 'אברהם גולדשטיין', teudatZehut: '34567890', email: 'avraham@example.com', phone: '+972-53-3456789', address: 'רחוב בר אילן 22', city: 'ירושלים', bankName: 'מזרחי', bankAccount: '345678901', bankBranch: '450', bitPhone: '+972-53-3456789', status: 'ACTIVE', maxStores: 5, torahFundRate: 0.05, totalEarned: 312.80, verifiedAt: '2026-01-25T00:00:00Z', notes: 'חברותא בכולל פוניבז\'', createdAt: '2026-01-22T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', _count: { stores: 4, torahFunds: 95, payouts: 3 } },
  { id: '4', fullName: 'דוד פרידמן', teudatZehut: '45678901', email: 'david@example.com', phone: '+972-54-4567890', address: 'רחוב הרצל 5', city: 'מודיעין עילית', bankName: 'דיסקונט', bankAccount: '456789012', bankBranch: '320', bitPhone: null, status: 'PENDING_VERIFICATION', maxStores: 5, torahFundRate: 0.05, totalEarned: 0, verifiedAt: null, notes: 'ממתין לאימות ת.ז.', createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z', _count: { stores: 0, torahFunds: 0, payouts: 0 } },
  { id: '5', fullName: 'שמואל רוזנברג', teudatZehut: '56789012', email: 'shmuel@example.com', phone: '+972-55-5678901', address: 'רחוב הנשיא 10', city: 'ביתר עילית', bankName: 'הפועלים', bankAccount: '567890123', bankBranch: '690', bitPhone: '+972-55-5678901', status: 'ACTIVE', maxStores: 5, torahFundRate: 0.05, totalEarned: 156.40, verifiedAt: '2026-02-05T00:00:00Z', notes: null, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-24T00:00:00Z', _count: { stores: 2, torahFunds: 42, payouts: 1 } },
];

export default function AccountHoldersPage() {
  const [holders, setHolders] = useState(mockAccountHolders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = holders.filter(h => {
    const matchesSearch = h.fullName.includes(searchQuery) || h.email.includes(searchQuery) || h.city.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEarned = holders.reduce((sum, h) => sum + h.totalEarned, 0);
  const totalStores = holders.reduce((sum, h) => sum + (h._count?.stores || 0), 0);
  const activeCount = holders.filter(h => h.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Holders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage identity providers and Torah fund payouts</p>
        </div>
        <Link href="/account-holders/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Account Holder
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Holders</p>
          <p className="text-2xl font-bold">{holders.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Stores</p>
          <p className="text-2xl font-bold">{totalStores}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Torah Fund Paid</p>
          <p className="text-2xl font-bold text-brand-600">${totalEarned.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name, email, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_VERIFICATION">Pending</option>
          <option value="PAUSED">Paused</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

      {/* Holders List */}
      <div className="space-y-3">
        {filtered.map((holder) => {
          const statusConf = STATUS_CONFIG[holder.status];
          const StatusIcon = statusConf.icon;

          return (
            <Link key={holder.id} href={`/account-holders/${holder.id}`} className="card p-5 block hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                    {holder.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{holder.fullName}</h3>
                      <span className={statusConf.class}>{statusConf.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{holder.city}</span>
                      <span>ת.ז. {holder.teudatZehut}</span>
                      <span>{holder.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Store className="w-3.5 h-3.5" />
                      <span className="text-sm">{holder._count?.stores || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400">stores</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-brand-600">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="text-sm font-medium">${holder.totalEarned.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400">earned</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No account holders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
