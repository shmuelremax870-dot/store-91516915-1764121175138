import { useState } from 'react';
import {
  Heart, DollarSign, Users, Calendar,
  Download, Send, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, ArrowUpRight
} from 'lucide-react';
import type { TorahFund, Payout, PaymentMethod } from '@/lib/types';

const mockTorahFunds: (TorahFund & { accountHolderName: string; storeName: string; orderNumber: string })[] = [
  { id: '1', accountHolderId: '1', orderId: '1', storeId: '1', saleAmount: 34.99, fundRate: 0.05, fundAmount: 1.75, status: 'APPROVED', payoutId: null, createdAt: '2026-02-24T10:30:00Z', accountHolderName: 'משה כהן', storeName: 'Cozy Home Prints', orderNumber: 'ETY-001247' },
  { id: '2', accountHolderId: '2', orderId: '2', storeId: '2', saleAmount: 29.99, fundRate: 0.05, fundAmount: 1.50, status: 'PENDING', payoutId: null, createdAt: '2026-02-24T09:15:00Z', accountHolderName: 'יעקב לוי', storeName: 'Art Wall Studio', orderNumber: 'ETY-001246' },
  { id: '3', accountHolderId: '1', orderId: '3', storeId: '1', saleAmount: 44.99, fundRate: 0.05, fundAmount: 2.25, status: 'APPROVED', payoutId: null, createdAt: '2026-02-23T16:45:00Z', accountHolderName: 'משה כהן', storeName: 'Cozy Home Prints', orderNumber: 'ETY-001245' },
  { id: '4', accountHolderId: '3', orderId: '5', storeId: '3', saleAmount: 24.99, fundRate: 0.05, fundAmount: 1.25, status: 'APPROVED', payoutId: null, createdAt: '2026-02-23T11:00:00Z', accountHolderName: 'אברהם גולדשטיין', storeName: 'Pet Love Designs', orderNumber: 'ETY-001244' },
  { id: '5', accountHolderId: '3', orderId: '6', storeId: '3', saleAmount: 19.99, fundRate: 0.05, fundAmount: 1.00, status: 'PAID', payoutId: 'p1', createdAt: '2026-02-22T15:30:00Z', accountHolderName: 'אברהם גולדשטיין', storeName: 'Pet Love Designs', orderNumber: 'ETY-001243' },
  { id: '6', accountHolderId: '1', orderId: '8', storeId: '1', saleAmount: 27.99, fundRate: 0.05, fundAmount: 1.40, status: 'PAID', payoutId: 'p1', createdAt: '2026-02-21T12:00:00Z', accountHolderName: 'משה כהן', storeName: 'Cozy Home Prints', orderNumber: 'ETY-001241' },
  { id: '7', accountHolderId: '4', orderId: '7', storeId: '4', saleAmount: 32.99, fundRate: 0.05, fundAmount: 1.65, status: 'CLAWED_BACK', payoutId: null, createdAt: '2026-02-22T09:00:00Z', accountHolderName: 'דוד פרידמן', storeName: 'Kitchen Art Co', orderNumber: 'ETY-001242' },
];

const mockPayouts: (Payout & { accountHolderName: string; fundCount: number })[] = [
  { id: 'p1', accountHolderId: '1', amountUsd: 45.50, amountIls: 163.80, exchangeRate: 3.60, paymentMethod: 'BANK_TRANSFER', reference: 'PAY-2026-001', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'משה כהן', fundCount: 15 },
  { id: 'p2', accountHolderId: '3', amountUsd: 62.30, amountIls: 224.28, exchangeRate: 3.60, paymentMethod: 'BIT', reference: 'PAY-2026-002', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'אברהם גולדשטיין', fundCount: 22 },
  { id: 'p3', accountHolderId: '2', amountUsd: 38.20, amountIls: 137.52, exchangeRate: 3.60, paymentMethod: 'BANK_TRANSFER', reference: 'PAY-2026-003', status: 'COMPLETED', createdAt: '2026-02-01T10:00:00Z', accountHolderName: 'יעקב לוי', fundCount: 12 },
];

// Aggregate data by account holder
const holderSummary = [
  { name: 'אברהם גולדשטיין', pending: 1.25, approved: 0, paid: 63.30, total: 64.55, stores: 4 },
  { name: 'משה כהן', pending: 0, approved: 3.99, paid: 46.90, total: 50.89, stores: 3 },
  { name: 'יעקב לוי', pending: 1.50, approved: 0, paid: 38.20, total: 39.70, stores: 2 },
  { name: 'שמואל רוזנברג', pending: 0, approved: 0, paid: 15.60, total: 15.60, stores: 2 },
  { name: 'דוד פרידמן', pending: 0, approved: 0, paid: 0, total: 0, stores: 0 },
];

const STATUS_MAP = {
  PENDING: { label: 'Pending', class: 'badge-warning' },
  APPROVED: { label: 'Approved', class: 'badge-info' },
  PAID: { label: 'Paid', class: 'badge-success' },
  CLAWED_BACK: { label: 'Clawed Back', class: 'badge-danger' },
};

const PAYOUT_STATUS_MAP = {
  PENDING: { label: 'Pending', class: 'badge-warning' },
  PROCESSING: { label: 'Processing', class: 'badge-info' },
  COMPLETED: { label: 'Completed', class: 'badge-success' },
  FAILED: { label: 'Failed', class: 'badge-danger' },
};

export default function TorahFundPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');

  const totalPending = mockTorahFunds.filter(f => f.status === 'PENDING').reduce((s, f) => s + f.fundAmount, 0);
  const totalApproved = mockTorahFunds.filter(f => f.status === 'APPROVED').reduce((s, f) => s + f.fundAmount, 0);
  const totalPaid = mockPayouts.reduce((s, p) => s + p.amountUsd, 0);
  const totalClawedBack = mockTorahFunds.filter(f => f.status === 'CLAWED_BACK').reduce((s, f) => s + f.fundAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Torah Fund (קרן תורה)</h1>
          <p className="text-sm text-gray-500 mt-1">5% of every sale goes to support Torah study</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Process Payouts
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">${totalApproved.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-gray-500">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-gray-500">Clawed Back</p>
          </div>
          <p className="text-2xl font-bold text-red-600">${totalClawedBack.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['overview', 'transactions', 'payouts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Account Holder Summary</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header px-6 py-3">Account Holder</th>
                  <th className="table-header px-6 py-3">Stores</th>
                  <th className="table-header px-6 py-3">Pending</th>
                  <th className="table-header px-6 py-3">Approved</th>
                  <th className="table-header px-6 py-3">Paid</th>
                  <th className="table-header px-6 py-3">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {holderSummary.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{h.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{h.stores}</td>
                    <td className="px-6 py-3 text-sm text-amber-600">${h.pending.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-blue-600">${h.approved.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-emerald-600">${h.paid.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm font-bold">${h.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header px-6 py-3">Date</th>
                <th className="table-header px-6 py-3">Order</th>
                <th className="table-header px-6 py-3">Store</th>
                <th className="table-header px-6 py-3">Account Holder</th>
                <th className="table-header px-6 py-3">Sale</th>
                <th className="table-header px-6 py-3">Rate</th>
                <th className="table-header px-6 py-3">Fund Amount</th>
                <th className="table-header px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTorahFunds.map((fund) => (
                <tr key={fund.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(fund.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium">{fund.orderNumber}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{fund.storeName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{fund.accountHolderName}</td>
                  <td className="px-6 py-3 text-sm">${fund.saleAmount.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{(fund.fundRate * 100).toFixed(0)}%</td>
                  <td className="px-6 py-3 text-sm font-medium text-brand-600">${fund.fundAmount.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={STATUS_MAP[fund.status].class}>{STATUS_MAP[fund.status].label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header px-6 py-3">Date</th>
                <th className="table-header px-6 py-3">Reference</th>
                <th className="table-header px-6 py-3">Account Holder</th>
                <th className="table-header px-6 py-3">Amount (USD)</th>
                <th className="table-header px-6 py-3">Amount (ILS)</th>
                <th className="table-header px-6 py-3">Rate</th>
                <th className="table-header px-6 py-3">Method</th>
                <th className="table-header px-6 py-3">Funds</th>
                <th className="table-header px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(payout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium">{payout.reference}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{payout.accountHolderName}</td>
                  <td className="px-6 py-3 text-sm font-medium">${payout.amountUsd.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm font-medium">₪{payout.amountIls.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{payout.exchangeRate}</td>
                  <td className="px-6 py-3">
                    <span className="badge-gray">{payout.paymentMethod.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{payout.fundCount} orders</td>
                  <td className="px-6 py-3">
                    <span className={PAYOUT_STATUS_MAP[payout.status].class}>{PAYOUT_STATUS_MAP[payout.status].label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
