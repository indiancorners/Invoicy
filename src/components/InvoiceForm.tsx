import React, { useRef } from 'react';
import { InvoiceData, InvoiceItem } from '../types';
import { Plus, Trash2, Calendar, FileText, User, MapPin, Mail, Hash, Percent, DollarSign, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

// Reusable premium input component
const Input = ({ label, value, onChange, type = "text", placeholder = "", icon: Icon, className = "" }: any) => (
  <div className={cn("space-y-2", className)}>
    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-neutral-50/50 border border-neutral-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-neutral-900 font-medium placeholder:text-neutral-300",
          Icon && "pl-10"
        )}
      />
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder = "", rows = 2 }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-50/50 border border-neutral-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-neutral-900 font-medium placeholder:text-neutral-300 resize-none custom-scrollbar"
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
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">{label}</label>
      {value ? (
        <div className="relative w-full h-32 bg-neutral-50/50 border border-neutral-200/60 rounded-xl overflow-hidden group">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
               type="button"
               onClick={(e) => {
                 e.preventDefault();
                 onRemove();
               }} 
               className="bg-white/20 text-white hover:bg-red-500 hover:border-red-500 border border-white/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xl backdrop-blur-sm shadow-black/20 flex items-center gap-2 active:scale-95"
             >
                <Trash2 size={14} /> Remove
             </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 bg-neutral-50/50 hover:bg-neutral-100 border border-neutral-200/60 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-black group-hover:border-black/20 transition-all shadow-sm">
             <Upload size={14} />
          </div>
          <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-700">Upload Image (PNG/JPG)</span>
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
      id: Math.random().toString(36).substr(2, 9),
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
    <div className="space-y-12 p-6 md:p-8 pb-32">
      {/* Core Setup */}
      <section className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2 border-b border-neutral-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                <FileText size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Document Base</h3>
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
            <Input 
              label="Due Date" 
              type="date" 
              value={data.dueDate} 
              onChange={(v: string) => updateField('dueDate', v)} 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Current Status</label>
               <div className="relative">
                 <select 
                    className="w-full bg-neutral-50/50 border border-neutral-200/60 rounded-xl px-4 py-[13px] text-[13px] focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-neutral-900 font-bold appearance-none uppercase tracking-widest"
                    value={data.status}
                    onChange={(e) => updateField('status', e.target.value)}
                 >
                     <option value="draft">Draft / Internal</option>
                     <option value="sent">Sent / Awaiting</option>
                     <option value="paid">Paid / Complete</option>
                 </select>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Currency" 
                value={data.currency} 
                onChange={(v: string) => updateField('currency', v)} 
                icon={DollarSign} 
              />
              <Input 
                label="Tax Rate (%)" 
                type="number" 
                value={data.taxRate} 
                onChange={(v: number) => updateField('taxRate', v)} 
                icon={Percent} 
              />
            </div>
        </div>
      </section>

      {/* Entity Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-[10px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-800 opacity-80">Your Business</h3>
          </div>
          <Input label="Name / Company" value={data.sender.name} onChange={(v: string) => updateField('sender.name', v)} />
          <Input label="Email Address" type="email" value={data.sender.email} onChange={(v: string) => updateField('sender.email', v)} icon={Mail} />
          <Input label="GST Number" value={data.sender.gst || ''} onChange={(v: string) => updateField('sender.gst', v)} />
          <Textarea label="Physical Address" value={data.sender.address} onChange={(v: string) => updateField('sender.address', v)} />
          <ImageUpload 
            label="Business Logo" 
            value={data.sender.logo} 
            onChange={(v: string) => updateField('sender.logo', v)} 
            onRemove={() => updateField('sender.logo', undefined)} 
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-[10px] bg-pink-50 text-pink-600 flex items-center justify-center">
                <MapPin size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-800 opacity-80">Billed Entity</h3>
          </div>
          <Input label="Client Name" value={data.receiver.name} onChange={(v: string) => updateField('receiver.name', v)} />
          <Input label="Client Email" type="email" value={data.receiver.email} onChange={(v: string) => updateField('receiver.email', v)} icon={Mail} />
          <Input label="Client GST Number" value={data.receiver.gst || ''} onChange={(v: string) => updateField('receiver.gst', v)} />
          <Textarea label="Client Address" value={data.receiver.address} onChange={(v: string) => updateField('receiver.address', v)} />
        </div>
      </section>

      {/* Line Items */}
      <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-neutral-100 gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-800 opacity-80">Line Items</h3>
          <button
            onClick={addItem}
            className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white bg-black px-4 py-2.5 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-12 gap-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-4">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="space-y-4 lg:space-y-3">
            {data.items.map((item, index) => (
              <div key={item.id} className="relative flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 lg:items-center bg-neutral-50/80 border border-neutral-200/50 lg:border-transparent lg:bg-transparent p-5 lg:p-0 rounded-2xl lg:rounded-none group transition-all">
                
                {/* Mobile Item Header */}
                <div className="lg:hidden flex justify-between items-center mb-1 pb-3 border-b border-neutral-200/50">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Item {index + 1}</span>
                   <button 
                     type="button"
                     onClick={(e) => {
                       e.preventDefault();
                       removeItem(item.id);
                     }}
                     className="text-neutral-400 hover:text-red-500 bg-white p-2 rounded-lg shadow-sm border border-neutral-200/50 transition-colors active:scale-95"
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
                    className="w-full bg-white lg:bg-neutral-50/50 border border-neutral-200/60 rounded-xl px-4 py-3 lg:py-2.5 text-sm focus:bg-white focus:border-black outline-none transition-all placeholder:text-neutral-300 font-bold uppercase tracking-widest text-[11px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-1 lg:col-span-2 items-center gap-4">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest lg:hidden ml-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || '')}
                    className="w-full bg-white lg:bg-neutral-50/50 border border-neutral-200/60 rounded-xl px-4 py-3 lg:py-2.5 text-sm lg:text-center focus:bg-white focus:border-black outline-none transition-all font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 lg:col-span-3 items-center gap-4">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest lg:hidden ml-1">Unit Price</label>
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-bold">{data.currency}</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || '')}
                      className="w-full bg-white lg:bg-neutral-50/50 border border-neutral-200/60 rounded-xl pl-8 pr-4 py-3 lg:py-2.5 text-sm text-left lg:text-right focus:bg-white focus:border-black outline-none transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="hidden lg:flex col-span-1 border-transparent items-center justify-end pr-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.id);
                    }}
                    className="text-neutral-300 hover:text-red-500 hover:bg-white hover:shadow-sm p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-neutral-200/60 active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.items.length === 0 && (
              <div className="text-center py-10 bg-neutral-50/50 rounded-2xl border border-neutral-200/50 border-dashed">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">No items added yet. Let's calculate some value.</p>
              </div>
          )}
        </div>
      </section>

      {/* Footer Notes & Signature */}
      <section className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
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
