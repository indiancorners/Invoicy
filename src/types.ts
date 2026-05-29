export type ThemeType = 'minimalist' | 'corporate' | 'retro' | 'clean' | 'modern';

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  id: string;
  publicToken: string;
  number: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  lastModified: number;
  sender: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gst?: string;
    logo?: string;
  };
  receiver: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gst?: string;
  };
  items: InvoiceItem[];
  taxRate: number;
  currency: string;
  paymentTerms?: string;
  notes: string;
  theme: ThemeType;
  signature?: string;
}

// Browser-safe ID generator. Falls back to a random hex string if randomUUID
// isn't available (older Safari, non-secure context).
const newId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  (crypto?.getRandomValues ?? ((b: Uint8Array) => b.forEach((_, i) => (b[i] = Math.floor(Math.random() * 256)))))(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export const newInvoiceId = newId;
export const newPublicToken = newId;

export const DEFAULT_INVOICE = (id: string = newId()): InvoiceData => {
  let profile = null;
  try {
    const savedProfile = localStorage.getItem('invoicy_business_profile');
    profile = savedProfile ? JSON.parse(savedProfile) : null;
  } catch (e) {
    console.error("Failed to parse business profile", e);
  }

  return {
    id,
    publicToken: newPublicToken(),
    number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    lastModified: Date.now(),
    sender: {
      name: profile?.name || 'Your Company Name',
      email: profile?.email || 'hello@yourcompany.com',
      phone: profile?.phone || '+1 (555) 000-0000',
      address: profile?.address || '123 Business Ave, Suite 100\nNew York, NY 10001',
      gst: profile?.gst || '',
      logo: profile?.logo || '',
    },
    receiver: {
      name: 'Client Name',
      email: 'billing@client.com',
      phone: '+1 (555) 111-2222',
      address: '456 client St\nSan Francisco, CA 94105',
      gst: '',
    },
    items: [
      { id: '1', description: 'Brand Design System', quantity: 1, price: 2500 },
    ],
    taxRate: 10,
    currency: profile?.currency || '$',
    notes: 'Thank you for your business. Please pay within 14 days.',
    theme: 'minimalist',
  };
};
