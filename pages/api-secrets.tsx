import { useState } from 'react';
import { Key, Plus, Eye, EyeOff, Trash2, Edit2, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';
import type { ApiSecret, ApiProvider, CreateApiSecretInput } from '@/lib/types';

const PROVIDERS: { value: ApiProvider; label: string; color: string }[] = [
  { value: 'ETSY', label: 'Etsy', color: 'bg-orange-100 text-orange-800' },
  { value: 'SHOPIFY', label: 'Shopify', color: 'bg-green-100 text-green-800' },
  { value: 'PRINTFUL', label: 'Printful', color: 'bg-purple-100 text-purple-800' },
  { value: 'PRINTIFY', label: 'Printify', color: 'bg-blue-100 text-blue-800' },
  { value: 'GOOTEN', label: 'Gooten', color: 'bg-teal-100 text-teal-800' },
  { value: 'SPOD', label: 'SPOD', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'PROXY', label: 'Proxy Service', color: 'bg-gray-100 text-gray-800' },
  { value: 'OPENROUTER', label: 'OpenRouter AI', color: 'bg-pink-100 text-pink-800' },
  { value: 'PAYMENT', label: 'Payment (Wise/PayPal)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-600' },
];

// Mock data
const mockSecrets: ApiSecret[] = [
  { id: '1', name: 'Etsy Production', provider: 'ETSY', apiKey: 'ets_prod_ak_1a2b3c4d5e6f', apiSecret: 'ets_prod_sk_hidden', accessToken: 'at_ets_xxxx', refreshToken: 'rt_ets_xxxx', webhookSecret: null, metadata: null, isActive: true, expiresAt: '2027-01-15T00:00:00Z', lastUsedAt: '2026-02-24T15:30:00Z', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-24T15:30:00Z' },
  { id: '2', name: 'Printful Main', provider: 'PRINTFUL', apiKey: 'pf_api_key_xxxxx', apiSecret: null, accessToken: 'pf_token_xxxxx', refreshToken: null, webhookSecret: 'wh_pf_secret', metadata: null, isActive: true, expiresAt: null, lastUsedAt: '2026-02-24T14:00:00Z', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-02-24T14:00:00Z' },
  { id: '3', name: 'Proxy Pool (Bright Data)', provider: 'PROXY', apiKey: 'bd_zone_residential_il', apiSecret: 'bd_password_xxxx', accessToken: null, refreshToken: null, webhookSecret: null, metadata: { zone: 'residential', country: 'IL', ips: 5000 }, isActive: true, expiresAt: '2026-06-30T00:00:00Z', lastUsedAt: '2026-02-25T01:00:00Z', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-02-25T01:00:00Z' },
  { id: '4', name: 'OpenRouter Free Tier', provider: 'OPENROUTER', apiKey: 'sk-or-v1-xxxxx', apiSecret: null, accessToken: null, refreshToken: null, webhookSecret: null, metadata: { tier: 'free', modelsUsed: ['llama-3.1', 'mistral-7b'] }, isActive: true, expiresAt: null, lastUsedAt: '2026-02-24T18:00:00Z', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-02-24T18:00:00Z' },
  { id: '5', name: 'Wise Business', provider: 'PAYMENT', apiKey: 'wise_api_token_xxxx', apiSecret: 'wise_profile_id_xxxx', accessToken: null, refreshToken: null, webhookSecret: null, metadata: { profileId: '12345', currency: 'ILS' }, isActive: true, expiresAt: null, lastUsedAt: '2026-02-20T10:00:00Z', createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-02-20T10:00:00Z' },
  { id: '6', name: 'Etsy Staging', provider: 'ETSY', apiKey: 'ets_stg_ak_test123', apiSecret: 'ets_stg_sk_test456', accessToken: null, refreshToken: null, webhookSecret: null, metadata: null, isActive: false, expiresAt: null, lastUsedAt: null, createdAt: '2025-12-15T00:00:00Z', updatedAt: '2025-12-15T00:00:00Z' },
];

function maskSecret(secret: string): string {
  if (secret.length <= 8) return '•'.repeat(secret.length);
  return secret.slice(0, 4) + '•'.repeat(Math.min(secret.length - 8, 20)) + secret.slice(-4);
}

function getProviderStyle(provider: ApiProvider): string {
  return PROVIDERS.find(p => p.value === provider)?.color || 'bg-gray-100 text-gray-600';
}

export default function ApiSecretsPage() {
  const [secrets, setSecrets] = useState(mockSecrets);
  const [showModal, setShowModal] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [editingSecret, setEditingSecret] = useState<ApiSecret | null>(null);

  // Form state
  const [form, setForm] = useState<CreateApiSecretInput>({
    name: '', provider: 'ETSY', apiKey: '', apiSecret: '', accessToken: '', refreshToken: '', webhookSecret: '',
  });

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSecrets = filterProvider === 'ALL'
    ? secrets
    : secrets.filter(s => s.provider === filterProvider);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSecret: ApiSecret = {
      ...form,
      id: Date.now().toString(),
      apiSecret: form.apiSecret || null,
      accessToken: form.accessToken || null,
      refreshToken: form.refreshToken || null,
      webhookSecret: form.webhookSecret || null,
      metadata: null,
      isActive: true,
      expiresAt: null,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSecrets([newSecret, ...secrets]);
    setShowModal(false);
    setForm({ name: '', provider: 'ETSY', apiKey: '', apiSecret: '', accessToken: '', refreshToken: '', webhookSecret: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this API secret?')) {
      setSecrets(secrets.filter(s => s.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setSecrets(secrets.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Secrets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage API keys for Etsy, Shopify, POD providers, proxies, and payment services</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add API Secret
        </button>
      </div>

      {/* Security Notice */}
      <div className="card p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Security Notice</p>
          <p className="text-xs text-amber-700 mt-0.5">API secrets are encrypted at rest. Keys are masked by default. Click the eye icon to temporarily reveal. Never share these keys externally.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterProvider('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterProvider === 'ALL' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
        >
          All ({secrets.length})
        </button>
        {PROVIDERS.map(p => {
          const count = secrets.filter(s => s.provider === p.value).length;
          if (count === 0) return null;
          return (
            <button
              key={p.value}
              onClick={() => setFilterProvider(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterProvider === p.value ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
            >
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Secrets List */}
      <div className="space-y-3">
        {filteredSecrets.map((secret) => (
          <div key={secret.id} className={`card p-5 ${!secret.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${secret.isActive ? 'bg-brand-50' : 'bg-gray-100'}`}>
                  <Key className={`w-5 h-5 ${secret.isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{secret.name}</h3>
                    <span className={`badge ${getProviderStyle(secret.provider)}`}>{secret.provider}</span>
                    {secret.isActive ? (
                      <span className="badge-success">Active</span>
                    ) : (
                      <span className="badge-gray">Inactive</span>
                    )}
                  </div>
                  {secret.lastUsedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last used: {new Date(secret.lastUsedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(secret.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={secret.isActive ? 'Deactivate' : 'Activate'}>
                  {secret.isActive ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={() => handleDelete(secret.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Key Fields */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">API Key</span>
                  <button onClick={() => toggleReveal(`${secret.id}-key`)} className="text-gray-400 hover:text-gray-600">
                    {revealedKeys.has(`${secret.id}-key`) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <code className="text-sm text-gray-700 font-mono">
                  {revealedKeys.has(`${secret.id}-key`) ? secret.apiKey : maskSecret(secret.apiKey)}
                </code>
              </div>

              {secret.apiSecret && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">API Secret</span>
                    <button onClick={() => toggleReveal(`${secret.id}-secret`)} className="text-gray-400 hover:text-gray-600">
                      {revealedKeys.has(`${secret.id}-secret`) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <code className="text-sm text-gray-700 font-mono">
                    {revealedKeys.has(`${secret.id}-secret`) ? secret.apiSecret : maskSecret(secret.apiSecret)}
                  </code>
                </div>
              )}

              {secret.accessToken && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Access Token</span>
                    <button onClick={() => toggleReveal(`${secret.id}-at`)} className="text-gray-400 hover:text-gray-600">
                      {revealedKeys.has(`${secret.id}-at`) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <code className="text-sm text-gray-700 font-mono">
                    {revealedKeys.has(`${secret.id}-at`) ? secret.accessToken : maskSecret(secret.accessToken)}
                  </code>
                </div>
              )}

              {secret.webhookSecret && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Webhook Secret</span>
                  </div>
                  <code className="text-sm text-gray-700 font-mono">{maskSecret(secret.webhookSecret)}</code>
                </div>
              )}

              {secret.metadata && (
                <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                  <span className="text-xs font-medium text-gray-500 mb-1 block">Metadata</span>
                  <code className="text-sm text-gray-700 font-mono">{JSON.stringify(secret.metadata, null, 0)}</code>
                </div>
              )}
            </div>

            {secret.expiresAt && (
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <AlertCircle className={`w-3.5 h-3.5 ${new Date(secret.expiresAt) < new Date() ? 'text-red-500' : 'text-amber-500'}`} />
                <span className={new Date(secret.expiresAt) < new Date() ? 'text-red-600' : 'text-amber-600'}>
                  {new Date(secret.expiresAt) < new Date() ? 'Expired' : 'Expires'}: {new Date(secret.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add API Secret</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Etsy Production"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  className="input-field"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value as ApiProvider })}
                >
                  {PROVIDERS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="Enter API key"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                <input
                  type="password"
                  className="input-field font-mono"
                  placeholder="Enter API secret (optional)"
                  value={form.apiSecret}
                  onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input
                  type="password"
                  className="input-field font-mono"
                  placeholder="Enter access token (optional)"
                  value={form.accessToken}
                  onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
                <input
                  type="password"
                  className="input-field font-mono"
                  placeholder="Enter refresh token (optional)"
                  value={form.refreshToken}
                  onChange={(e) => setForm({ ...form, refreshToken: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                <input
                  type="password"
                  className="input-field font-mono"
                  placeholder="Enter webhook secret (optional)"
                  value={form.webhookSecret}
                  onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Save Secret</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
