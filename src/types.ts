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

export const DEFAULT_INVOICE = (id: string = Math.random().toString(36).substr(2, 9)): InvoiceData => {
  let profile = null;
  try {
    const savedProfile = localStorage.getItem('invoicy_business_profile');
    profile = savedProfile ? JSON.parse(savedProfile) : null;
  } catch (e) {
    console.error("Failed to parse business profile", e);
  }
  
  return {
    id,
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
