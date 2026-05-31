import React, { useRef } from 'react';
import { InvoiceData, InvoiceItem, newInvoiceId } from '../types';
import { Plus, Trash2, FileText, User, MapPin, Mail, Hash, Percent, Phone, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

const CURRENCIES = [
  { symbol: '$', code: 'USD' }, { symbol: '€', code: 'EUR' }, { symbol: '£', code: 'GBP' },
  { symbol: '₹', code: 'INR' }, { symbol: '¥', code: 'JPY' }, { symbol: 'A$', code: 'AUD' },
  { symbol: 'C$', code: 'CAD' }, { symbol: 'CHF', code: 'CHF' }, { symbol: 'R$', code: 'BRL' },
  { symbol: '₩', code: 'KRW' }, { symbol: 'S$', code: 'SGD' }, { symbol: 'د.إ', code: 'AED' },
  { symbol: 'kr', code: 'SEK' }, { symbol: 'zł', code: 'PLN' }, { symbol: '₪', code: 'ILS' },
];

const PAYMENT_TERMS = [
  'Due on Receipt', 'Net 7', 'Net 14', 'Net 30', 'Net 45', 'Net 60',
  '50% Upfront / 50% on Delivery', 'Milestone-based', 'Custom',
];

const selectClass = "w-full bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-[#1D1D1F] font-medium appearance-none uppercase tracking-widest";

// Reusable premium input component
const Input = ({ label, value, onChange, type = "text", placeholder = "", icon: Icon, className = "" }: any) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" size={15} />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-[#1D1D1F] font-medium placeholder:text-[#86868B]",
          Icon && "pl-10"
        )}
      />
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder = "", rows = 2 }: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-1">{label}</label>
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-[#1D1D1F] font-medium placeholder:text-[#86868B] resize-none custom-scrollbar"
    />
  </div>
);

const ImageUpload = ({ label, value, onChange, onRemove }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-1">{label}</label>
      {value ? (
        <div className="relative w-full h-32 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl overflow-hidden group">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button
               type="button"
               onClick={(e) => {
                 e.preventDefault();
                 onRemove();
               }}
               className="bg-[#DC2626] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xl flex items-center gap-2 active:scale-95"
             >
                <Trash2 size={13} /> Remove
             </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-[#D2D2D7] flex items-center justify-center text-[#86868B] group-hover:border-[#AEAEB2] transition-all shadow-sm">
             <Upload size={14} />
          </div>
          <span className="text-[12px] font-medium text-[#86868B] group-hover:text-[#1D1D1F]">Upload Image (PNG/JPG)</span>
        </button>
      )}
      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 2) {
      onChange({
        ...data,
        [keys[0]]: { ...data[keys[0] as keyof InvoiceData] as any, [keys[1]]: value },
      });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = data.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: newInvoiceId(),
      description: '',
      quantity: 1,
      price: 0,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });
  };

  return (
    <div className="space-y-8 p-6 md:p-8 pb-32">
      {/* Core Setup */}
      <section className="bg-white p-6 rounded-2xl border border-[#D2D2D7] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#D2D2D7]">
            <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] border border-[#D2D2D7] flex items-center justify-center">
                <FileText size={16} className="text-[#1D1D1F]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1D1D1F]">Document Base</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B]">Invoice details & terms</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Invoice Number"
            value={data.number}
            onChange={(v: string) => updateField('number', v)}
            icon={Hash}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Issue Date"
              type="date"
              value={data.date}
              onChange={(v: string) => updateField('date', v)}
            />
            <div>
              <Input
                label="Due Date"
                type="date"
                value={data.dueDate}
                onChange={(v: string) => updateField('dueDate', v)}
              />
              {data.dueDate && data.date && new Date(data.dueDate) < new Date(data.date) && (
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#DC2626] mt-1.5 ml-1">
                  Due date is before issue date
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-1">Current Status</label>
               <select className={selectClass} value={data.status} onChange={(e) => updateField('status', e.target.value)}>
                 <option value="draft">Draft</option>
                 <option value="sent">Sent</option>
                 <option value="viewed">Viewed</option>
                 <option value="partially_paid">Partially Paid</option>
                 <option value="paid">Paid</option>
                 <option value="overdue">Overdue</option>
                 <option value="cancelled">Cancelled</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-1">Payment Terms</label>
               <select className={selectClass} value={data.paymentTerms || ''} onChange={(e) => updateField('paymentTerms', e.target.value)}>
                 <option value="">Select Terms</option>
                 {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-1">Currency</label>
            <select className={selectClass} value={data.currency} onChange={(e) => updateField('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c.code} value={c.symbol}>{c.symbol} — {c.code}</option>)}
            </select>
          </div>
          <Input
            label="Tax Rate (%)"
            type="number"
            value={data.taxRate}
            onChange={(v: number) => updateField('taxRate', v)}
            icon={Percent}
          />
        </div>
      </section>

      {/* Entity Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#D2D2D7] space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#D2D2D7]">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <User size={16} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1D1D1F]">Your Business</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B]">Sender information</p>
            </div>
          </div>
          <Input label="Name / Company" value={data.sender.name} onChange={(v: string) => updateField('sender.name', v)} />
          <Input label="Email Address" type="email" value={data.sender.email} onChange={(v: string) => updateField('sender.email', v)} icon={Mail} />
          <Input label="Phone Number" value={data.sender.phone || ''} onChange={(v: string) => updateField('sender.phone', v)} icon={Phone} />
          <Input label="GST / VAT Number" value={data.sender.gst || ''} onChange={(v: string) => updateField('sender.gst', v)} />
          <Textarea label="Physical Address" value={data.sender.address} onChange={(v: string) => updateField('sender.address', v)} />
          <ImageUpload
            label="Business Logo"
            value={data.sender.logo}
            onChange={(v: string) => updateField('sender.logo', v)}
            onRemove={() => updateField('sender.logo', undefined)}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D2D2D7] space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#D2D2D7]">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] flex items-center justify-center">
                <MapPin size={16} className="text-[#E11D48]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1D1D1F]">Billed Entity</p>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B]">Client information</p>
            </div>
          </div>
          <Input label="Client Name" value={data.receiver.name} onChange={(v: string) => updateField('receiver.name', v)} />
          <Input label="Client Email" type="email" value={data.receiver.email} onChange={(v: string) => updateField('receiver.email', v)} icon={Mail} />
          <Input label="Client Phone" value={data.receiver.phone || ''} onChange={(v: string) => updateField('receiver.phone', v)} icon={Phone} />
          <Input label="Client GST / VAT" value={data.receiver.gst || ''} onChange={(v: string) => updateField('receiver.gst', v)} />
          <Textarea label="Client Address" value={data.receiver.address} onChange={(v: string) => updateField('receiver.address', v)} />
        </div>
      </section>

      {/* Line Items */}
      <section className="bg-white p-6 rounded-2xl border border-[#D2D2D7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-[#D2D2D7] gap-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1D1D1F]">Line Items</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] mt-0.5">Services or products billed</p>
          </div>
          <button
            onClick={addItem}
            className="flex items-center justify-center gap-2 rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium px-5 py-2 hover:opacity-80 transition-all"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-12 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#86868B] px-4">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-4 lg:space-y-3">
            {data.items.map((item, index) => (
              <div key={item.id} className="relative flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 lg:items-center bg-[#F5F5F7] border border-[#D2D2D7] lg:border-transparent lg:bg-transparent p-5 lg:p-0 rounded-2xl lg:rounded-none group transition-all">

                {/* Mobile Item Header */}
                <div className="lg:hidden flex justify-between items-center mb-1 pb-3 border-b border-[#D2D2D7]">
                   <span className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B]">Item {index + 1}</span>
                   <button
                     type="button"
                     onClick={(e) => {
                       e.preventDefault();
                       removeItem(item.id);
                     }}
                     className="rounded-full text-[#DC2626] hover:bg-[#DC2626]/10 p-2 transition-colors"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>

                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Service or product description..."
                    className="w-full bg-white lg:bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl px-4 py-3 lg:py-2.5 text-[14px] focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all placeholder:text-[#86868B] font-medium text-[#1D1D1F]"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 lg:col-span-2 items-center gap-4">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] lg:hidden ml-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => { const n = parseFloat(e.target.value); updateItem(item.id, 'quantity', Number.isFinite(n) ? n : 0); }}
                    className="w-full bg-white lg:bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl px-4 py-3 lg:py-2.5 text-[14px] lg:text-center focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all font-medium text-[#1D1D1F]"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 lg:col-span-3 items-center gap-4">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] lg:hidden ml-1">Unit Price</label>
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#86868B] font-medium">{data.currency}</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => { const n = parseFloat(e.target.value); updateItem(item.id, 'price', Number.isFinite(n) ? n : 0); }}
                      className="w-full bg-white lg:bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl pl-8 pr-4 py-3 lg:py-2.5 text-[14px] text-left lg:text-right focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all font-medium text-[#1D1D1F]"
                    />
                  </div>
                </div>

                <div className="hidden lg:flex col-span-1 items-center justify-end pr-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.id);
                    }}
                    className="rounded-full text-[#D2D2D7] hover:text-[#DC2626] hover:bg-[#DC2626]/10 p-2 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.items.length === 0 && (
              <div className="text-center py-10 bg-[#F5F5F7] rounded-2xl border border-[#D2D2D7] border-dashed">
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-[#86868B]">No items added yet.</p>
              </div>
          )}
        </div>
      </section>

      {/* Footer Notes & Signature */}
      <section className="bg-white p-6 rounded-2xl border border-[#D2D2D7] space-y-6">
        <div className="pb-4 border-b border-[#D2D2D7]">
          <p className="text-[15px] font-semibold text-[#1D1D1F]">Notes & Signature</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] mt-0.5">Terms, payment instructions, authorization</p>
        </div>
        <Textarea label="Terms, Notes & Payment Instructions" value={data.notes} onChange={(v: string) => updateField('notes', v)} rows={3} placeholder="e.g. Please remit payment to our business account within 14 days." />
        <div className="w-full sm:w-1/2">
           <ImageUpload
             label="Authorized Signature"
             value={data.signature}
             onChange={(v: string) => updateField('signature', v)}
             onRemove={() => updateField('signature', undefined)}
           />
        </div>
      </section>
    </div>
  );
};
