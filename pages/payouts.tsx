import { useState } from 'react';
import { Wallet, Send, Download, Calendar, DollarSign, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import type { Payout, PayoutStatus, PaymentMethod } from '@/lib/types';

const STATUS_CONFIG: Record<PayoutStatus, { label: string; class: string }> = {
  PENDING: { label: 'Pending', class: 'badge-warning' },
  PROCESSING: { label: 'Processing', class: 'badge-info' },
  COMPLETED: { label: 'Completed', class: 'badge-success' },
  FAILED: { label: 'Failed', class: 'badge-danger' },
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  BIT: 'Bit App',
  PAYBOX: 'PayBox',
  PAYPAL: 'PayPal',
};

const mockPayouts: (Payout & { accountHolderName: string; city: string; orderCount: number })[] = [
  { id: 'p1', accountHolderId: '1', amountUsd: 45.50, amountIls: 163.80, exchangeRate: 3.60, paymentMethod: 'BANK_TRANSFER', reference: 'PAY-2026-001', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'משה כהן', city: 'בני ברק', orderCount: 15 },
  { id: 'p2', accountHolderId: '3', amountUsd: 62.30, amountIls: 224.28, exchangeRate: 3.60, paymentMethod: 'BIT', reference: 'PAY-2026-002', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'אברהם גולדשטיין', city: 'ירושלים', orderCount: 22 },
  { id: 'p3', accountHolderId: '2', amountUsd: 38.20, amountIls: 137.52, exchangeRate: 3.60, paymentMethod: 'BANK_TRANSFER', reference: 'PAY-2026-003', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'יעקב לוי', city: 'בני ברק', orderCount: 12 },
  { id: 'p4', accountHolderId: '5', amountUsd: 28.60, amountIls: 102.96, exchangeRate: 3.60, paymentMethod: 'BIT', reference: 'PAY-2026-004', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'שמואל רוזנברג', city: 'ביתר עילית', orderCount: 8 },
  { id: 'p5', accountHolderId: '1', amountUsd: 52.15, amountIls: 187.74, exchangeRate: 3.60, paymentMethod: 'BANK_TRANSFER', reference: 'PAY-2026-005', status: 'PENDING', createdAt: '2026-03-01T00:00:00Z', accountHolderName: 'משה כהן', city: 'בני ברק', orderCount: 18 },
  { id: 'p6', accountHolderId: '3', amountUsd: 71.80, amountIls: 258.48, exchangeRate: 3.60, paymentMethod: 'BIT', reference: 'PAY-2026-006', status: 'PENDING', createdAt: '2026-03-01T00:00:00Z', accountHolderName: 'אברהם גולדשטיין', city: 'ירושלים', orderCount: 25 },
];

export default function PayoutsPage() {
  const [payouts] = useState(mockPayouts);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = statusFilter === 'ALL' ? payouts : payouts.filter(p => p.status === statusFilter);
  const totalPaid = payouts.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amountUsd, 0);
  const totalPending = payouts.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amountUsd, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Torah fund payouts to Account Holders (monthly, 1st of each month)</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Process Pending
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-gray-500">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">₪{(totalPaid * 3.60).toFixed(2)} ILS</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">₪{(totalPending * 3.60).toFixed(2)} ILS</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-brand-500" />
            <p className="text-sm text-gray-500">Next Payout Date</p>
          </div>
          <p className="text-2xl font-bold">Mar 1, 2026</p>
          <p className="text-xs text-gray-400 mt-1">2 pending payouts</p>
        </div>
      </div>

      {/* Shabbat Notice */}
      <div className="card p-3 border-amber-200 bg-amber-50 text-sm text-amber-800 flex items-center gap-2">
        <Calendar className="w-4 h-4 flex-shrink-0" />
        Payouts are never processed on Shabbat or Jewish holidays. If the 1st falls on Shabbat, processing moves to Sunday.
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
          >
            {status === 'ALL' ? 'All' : STATUS_CONFIG[status as PayoutStatus].label}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="table-header px-6 py-3">Reference</th>
              <th className="table-header px-6 py-3">Account Holder</th>
              <th className="table-header px-6 py-3">City</th>
              <th className="table-header px-6 py-3">Amount (USD)</th>
              <th className="table-header px-6 py-3">Amount (ILS)</th>
              <th className="table-header px-6 py-3">Method</th>
              <th className="table-header px-6 py-3">Orders</th>
              <th className="table-header px-6 py-3">Status</th>
              <th className="table-header px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(payout => (
              <tr key={payout.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium">{payout.reference}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{payout.accountHolderName}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{payout.city}</td>
                <td className="px-6 py-3 text-sm font-medium">${payout.amountUsd.toFixed(2)}</td>
                <td className="px-6 py-3 text-sm font-medium">₪{payout.amountIls.toFixed(2)}</td>
                <td className="px-6 py-3"><span className="badge-gray">{METHOD_LABELS[payout.paymentMethod]}</span></td>
                <td className="px-6 py-3 text-sm text-gray-600">{payout.orderCount}</td>
                <td className="px-6 py-3"><span className={STATUS_CONFIG[payout.status].class}>{STATUS_CONFIG[payout.status].label}</span></td>
                <td className="px-6 py-3 text-sm text-gray-500">
                  {new Date(payout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
