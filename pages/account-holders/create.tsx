import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import type { CreateAccountHolderInput } from '@/lib/types';

const CITIES = ['בני ברק', 'ירושלים', 'בית שמש', 'מודיעין עילית', 'ביתר עילית', 'אלעד', 'רכסים', 'צפת', 'אשדוד'];
const BANKS = ['הפועלים', 'לאומי', 'דיסקונט', 'מזרחי טפחות', 'הבינלאומי', 'מרכנתיל', 'אגוד', 'יהב', 'אוצר החייל', 'דואר ישראל'];

export default function CreateAccountHolderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateAccountHolderInput>({
    fullName: '',
    teudatZehut: '',
    email: '',
    phone: '+972-',
    address: '',
    city: 'בני ברק',
    bankName: 'הפועלים',
    bankAccount: '',
    bankBranch: '',
    bitPhone: '',
    maxStores: 5,
    notes: '',
  });

  const updateField = (field: keyof CreateAccountHolderInput, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Account Holder created successfully! (Mock - will connect to API)');
    setLoading(false);
    router.push('/account-holders');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/account-holders" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Account Holder</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register a new identity provider from the Haredi community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (שם מלא) *</label>
              <input type="text" className="input-field" dir="rtl" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teudat Zehut (ת.ז.) *</label>
              <input type="text" className="input-field" maxLength={9} pattern="[0-9]{8,9}" value={form.teudatZehut} onChange={(e) => updateField('teudatZehut', e.target.value.replace(/\D/g, ''))} required placeholder="e.g. 123456789" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" className="input-field" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required placeholder="+972-50-1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address (כתובת) *</label>
              <input type="text" className="input-field" dir="rtl" value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City (עיר) *</label>
              <select className="input-field" value={form.city} onChange={(e) => updateField('city', e.target.value)}>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Details (פרטי בנק)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank (בנק) *</label>
              <select className="input-field" value={form.bankName} onChange={(e) => updateField('bankName', e.target.value)}>
                {BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Number (סניף) *</label>
              <input type="text" className="input-field" value={form.bankBranch} onChange={(e) => updateField('bankBranch', e.target.value.replace(/\D/g, ''))} required placeholder="e.g. 690" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (מספר חשבון) *</label>
              <input type="text" className="input-field" value={form.bankAccount} onChange={(e) => updateField('bankAccount', e.target.value.replace(/\D/g, ''))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bit Phone (optional)</label>
              <input type="tel" className="input-field" value={form.bitPhone} onChange={(e) => updateField('bitPhone', e.target.value)} placeholder="+972-50-1234567" />
              <p className="text-xs text-gray-400 mt-1">For Bit app payouts</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Stores</label>
              <input type="number" className="input-field" min={1} max={10} value={form.maxStores} onChange={(e) => updateField('maxStores', parseInt(e.target.value) || 5)} />
              <p className="text-xs text-gray-400 mt-1">Maximum number of stores under this identity</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Torah Fund Rate</label>
              <div className="input-field bg-gray-50 text-gray-600">5% (fixed)</div>
              <p className="text-xs text-gray-400 mt-1">5% of every sale goes to Torah study</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (הערות)</label>
            <textarea className="input-field" rows={3} dir="rtl" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="e.g. הומלץ ע״י הרב כהן, לומד בכולל פוניבז'..." />
          </div>
        </div>

        {/* Agreement Notice */}
        <div className="card p-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-800">
            By creating this account holder, an agreement will be sent for digital signing (Hebrew + English)
            explaining the passive role and 5% Torah fund terms.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Account Holder'}
          </button>
          <Link href="/account-holders" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
