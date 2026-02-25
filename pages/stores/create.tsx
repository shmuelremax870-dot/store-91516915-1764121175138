import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Store, Zap, AlertCircle } from 'lucide-react';
import type { CreateStoreInput, Platform } from '@/lib/types';

const mockAccountHolders = [
  { id: '1', fullName: 'משה כהן', storeCount: 3, maxStores: 5 },
  { id: '2', fullName: 'יעקב לוי', storeCount: 2, maxStores: 5 },
  { id: '3', fullName: 'אברהם גולדשטיין', storeCount: 4, maxStores: 5 },
  { id: '5', fullName: 'שמואל רוזנברג', storeCount: 2, maxStores: 5 },
];

const mockNiches = [
  { id: '1', name: 'Home Decor', competition: 'HIGH', trending: 85 },
  { id: '2', name: 'Wall Art', competition: 'HIGH', trending: 90 },
  { id: '3', name: 'Pet Products', competition: 'MEDIUM', trending: 75 },
  { id: '4', name: 'Kitchen & Dining', competition: 'MEDIUM', trending: 70 },
  { id: '5', name: 'Baby & Kids', competition: 'HIGH', trending: 88 },
  { id: '6', name: 'Fitness & Gym', competition: 'LOW', trending: 65 },
  { id: '7', name: 'Typography', competition: 'MEDIUM', trending: 72 },
  { id: '8', name: 'Nature & Landscape', competition: 'HIGH', trending: 80 },
  { id: '9', name: 'Minimalist Art', competition: 'MEDIUM', trending: 78 },
  { id: '10', name: 'Funny Quotes', competition: 'LOW', trending: 60 },
];

export default function CreateStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateStoreInput>({
    accountHolderId: '',
    platform: 'ETSY',
    storeName: '',
    nicheId: '',
  });
  const [generateName, setGenerateName] = useState(false);

  const selectedHolder = mockAccountHolders.find(h => h.id === form.accountHolderId);
  const holderAtLimit = selectedHolder && selectedHolder.storeCount >= selectedHolder.maxStores;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (holderAtLimit) return;
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    alert('Store creation initiated! (Mock - will connect to Etsy API)\n\nThe store will go through warm-up protocol:\nWeek 1: 5-10 listings\nWeek 2: 15-25 listings\nWeek 3: 30-50 listings\nWeek 4: Full catalog');
    setLoading(false);
    router.push('/stores');
  };

  const handleGenerateName = () => {
    const niche = mockNiches.find(n => n.id === form.nicheId);
    const prefixes = ['Cozy', 'Modern', 'Artful', 'Creative', 'Premium', 'Elegant', 'Fresh', 'Divine'];
    const suffixes = ['Studio', 'Prints', 'Designs', 'Shop', 'Co', 'Art', 'House', 'Gallery'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const nichePart = niche ? niche.name.split(' ')[0] : 'Art';
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    setForm(prev => ({ ...prev, storeName: `${prefix} ${nichePart} ${suffix}` }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/stores" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Store</h1>
          <p className="text-sm text-gray-500 mt-0.5">Admin-driven store creation - fully automated</p>
        </div>
      </div>

      {/* Warm-up Info */}
      <div className="card p-4 border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Automated Store Warm-up Protocol</p>
            <p className="text-xs text-blue-700 mt-1">
              New stores follow a gradual warm-up: Week 1 (5-10 listings) → Week 2 (15-25) → Week 3 (30-50) → Week 4 (50-100) → Week 5+ (up to 500).
              All managed automatically by the platform.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Holder Selection */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Holder (Identity)</h2>
          <p className="text-sm text-gray-500 mb-3">Select whose identity this store will be registered under</p>

          <select
            className="input-field"
            value={form.accountHolderId}
            onChange={(e) => setForm(prev => ({ ...prev, accountHolderId: e.target.value }))}
            required
          >
            <option value="">Select Account Holder...</option>
            {mockAccountHolders.map(h => (
              <option key={h.id} value={h.id} disabled={h.storeCount >= h.maxStores}>
                {h.fullName} ({h.storeCount}/{h.maxStores} stores){h.storeCount >= h.maxStores ? ' - FULL' : ''}
              </option>
            ))}
          </select>

          {holderAtLimit && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>This account holder has reached their store limit ({selectedHolder?.maxStores})</span>
            </div>
          )}
        </div>

        {/* Store Details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
              <select
                className="input-field"
                value={form.platform}
                onChange={(e) => setForm(prev => ({ ...prev, platform: e.target.value as Platform }))}
              >
                <option value="ETSY">Etsy</option>
                <option value="SHOPIFY">Shopify (Mirror - will be created later)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niche *</label>
              <select
                className="input-field"
                value={form.nicheId}
                onChange={(e) => setForm(prev => ({ ...prev, nicheId: e.target.value }))}
                required
              >
                <option value="">Select Niche...</option>
                {mockNiches.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} (Competition: {n.competition}, Trending: {n.trending}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={form.storeName}
                  onChange={(e) => setForm(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="e.g. Cozy Home Prints"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateName}
                  className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Zap className="w-4 h-4" />
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unique store name for Etsy (no spaces, 4-20 chars recommended)</p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next (Automated)</h2>
          <div className="space-y-3">
            {[
              { step: 1, text: 'Create Etsy account with Account Holder identity', auto: true },
              { step: 2, text: 'Generate unique logo, banner, and About page via AI', auto: true },
              { step: 3, text: 'Set up anti-detect browser profile & proxy', auto: true },
              { step: 4, text: 'Configure store policies and shipping profiles', auto: true },
              { step: 5, text: 'Begin warm-up protocol (Week 1: 5-10 listings)', auto: true },
              { step: 6, text: 'Gradually increase listings over 5 weeks', auto: true },
              { step: 7, text: 'Enable Etsy Ads after Week 3', auto: true },
              { step: 8, text: 'Torah Fund tracking starts with first sale', auto: true },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-sm text-gray-700">{item.text}</span>
                {item.auto && <span className="badge-info text-xs">Auto</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading || !!holderAtLimit}
          >
            <Store className="w-4 h-4" />
            {loading ? 'Creating Store...' : 'Create Store'}
          </button>
          <Link href="/stores" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
