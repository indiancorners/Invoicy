import React, { useMemo } from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const calculations = useMemo(() => {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const taxAmount = subtotal * (data.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [data.items, data.taxRate]);

  const { subtotal, taxAmount, total } = calculations;

  const renderTheme = () => {
    switch (data.theme) {
      case 'minimalist':
        return (
          <div className="flex flex-col h-full bg-white text-black p-12" style={{ fontFamily: '"DM Sans", Helvetica, Arial, sans-serif' }}>
            <div className="flex justify-between items-end border-b-2 border-black pb-8 mb-12">
              <div className="flex items-center gap-6">
                {data.sender.logo && <img src={data.sender.logo} alt="Logo" className="w-24 h-24 object-contain" />}
                <h1 className="text-6xl font-black uppercase tracking-tighter leading-none m-0">INVOICE</h1>
              </div>
              <div className="text-right flex flex-col justify-end">
                <p className="font-bold text-2xl uppercase tracking-widest">{data.number}</p>
                <p className="text-lg font-medium">{data.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-16">
              <div className="border-l-2 border-black pl-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black mb-4">From</p>
                <p className="text-xl font-bold uppercase leading-tight mb-2">{data.sender.name}</p>
                <p className="text-sm whitespace-pre-line font-medium leading-snug">{data.sender.address}</p>
                {data.sender.gst && <p className="text-xs font-bold mt-2">GSTIN: {data.sender.gst}</p>}
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black mb-4">To</p>
                <p className="text-xl font-bold uppercase leading-tight mb-2">{data.receiver.name}</p>
                <p className="text-sm whitespace-pre-line font-medium leading-snug">{data.receiver.address}</p>
                {data.receiver.gst && <p className="text-xs font-bold mt-2">GSTIN: {data.receiver.gst}</p>}
              </div>
            </div>

            <div className="flex-grow">
              <div className="grid grid-cols-12 gap-6 border-b-2 border-black pb-4 mb-4 text-[10px] font-black uppercase tracking-widest text-black">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="flex flex-col">
                {data.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-6 py-4 border-b border-gray-200 text-sm font-medium">
                    <div className="col-span-6 font-bold">{item.description}</div>
                    <div className="col-span-2 text-center">{item.quantity}</div>
                    <div className="col-span-2 text-right">{data.currency}{item.price.toFixed(2)}</div>
                    <div className="col-span-2 text-right font-black">{data.currency}{(item.quantity * item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t-2 border-black">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black mb-2">Notes</p>
                <p className="text-sm font-medium leading-relaxed">{data.notes}</p>
                {data.signature && (
                    <div className="mt-8">
                        <img src={data.signature} alt="Signature" className="h-20 object-contain" />
                        <div className="w-48 border-t border-black mt-2 pt-1">
                            <p className="text-[10px] uppercase font-bold text-gray-500">Authorized Signature</p>
                        </div>
                    </div>
                )}
              </div>
              <div className="text-right space-y-2 max-w-sm ml-auto w-full">
                <div className="flex justify-between text-sm font-bold">
                  <p className="uppercase tracking-widest text-gray-500">Subtotal</p>
                  <p>{data.currency}{subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <p className="uppercase tracking-widest text-gray-500">Tax ({data.taxRate}%)</p>
                  <p>{data.currency}{taxAmount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-3xl font-black border-t-2 border-black pt-4 mt-4">
                  <p className="uppercase tracking-tighter">Total</p>
                  <p>{data.currency}{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'corporate':
        return (
          <div className="flex flex-col h-full bg-slate-50 text-slate-800 p-0 font-sans">
             <div className="bg-slate-900 text-white p-12">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-6">
                    {data.sender.logo ? (
                        <img src={data.sender.logo} alt="Logo" className="h-16 object-contain bg-white p-2 rounded" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">LOGO</div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">{data.sender.name}</h1>
                        <p className="text-slate-400 text-sm mt-1 whitespace-pre-line">{data.sender.address}</p>
                        {data.sender.gst && <p className="text-slate-500 text-xs mt-1 font-bold">GSTIN: {data.sender.gst}</p>}
                    </div>
                 </div>
                 <div className="text-right">
                    <h2 className="text-4xl font-black uppercase tracking-widest text-slate-700 mb-2">INVOICE</h2>
                    <p className="text-sm font-bold text-slate-400">#{data.number}</p>
                 </div>
               </div>
             </div>

             <div className="p-12 flex-grow flex flex-col">
                <div className="grid grid-cols-2 gap-12 mb-12">
                   <div>
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-2">Billed To</p>
                     <p className="font-bold text-xl mb-1">{data.receiver.name}</p>
                     <p className="text-sm text-slate-600 whitespace-pre-line">{data.receiver.address}</p>
                     {data.receiver.gst && <p className="text-xs font-bold text-slate-500 mt-2">GSTIN: {data.receiver.gst}</p>}
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-2 text-right">Invoice Details</p>
                     <div className="flex justify-end gap-8 text-sm">
                        <div className="text-slate-500 font-medium">Issue Date<br/>{data.date}</div>
                        <div className="text-slate-500 font-medium">Due Date<br/>{data.dueDate}</div>
                     </div>
                   </div>
                </div>

                <div className="flex-grow">
                   <table className="w-full text-sm">
                      <thead className="bg-slate-200">
                         <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                            <th className="p-4">Description</th>
                            <th className="p-4 text-center">Qty</th>
                            <th className="p-4 text-right">Rate</th>
                            <th className="p-4 text-right">Amount</th>
                         </tr>
                      </thead>
                      <tbody>
                         {data.items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200 bg-white">
                               <td className="p-4 font-bold">{item.description}</td>
                               <td className="p-4 text-center text-slate-500">{item.quantity}</td>
                               <td className="p-4 text-right text-slate-500">{data.currency}{item.price.toFixed(2)}</td>
                               <td className="p-4 text-right font-bold text-slate-900">{data.currency}{(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-12">
                   <div className="bg-white p-6 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Information</p>
                      <p className="text-sm text-slate-600 mb-6">{data.notes}</p>
                      {data.signature && (
                          <div className="mt-4">
                              <img src={data.signature} alt="Signature" className="h-16 object-contain mb-2" />
                              <p className="text-[10px] text-slate-500 uppercase font-bold border-t border-slate-200 pt-1 inline-block">Authorized Signatory</p>
                          </div>
                      )}
                   </div>
                   <div className="bg-slate-900 text-white p-8 rounded-lg shadow-xl self-end">
                      <div className="space-y-3 mb-6 text-sm">
                         <div className="flex justify-between text-slate-400">
                            <span>Subtotal</span>
                            <span className="text-white">{data.currency}{subtotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-slate-400">
                            <span>Tax ({data.taxRate}%)</span>
                            <span className="text-white">{data.currency}{taxAmount.toFixed(2)}</span>
                         </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-700 pt-6">
                         <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Due</span>
                         <span className="text-4xl font-black">{data.currency}{total.toFixed(2)}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'retro':
        return (
          <div className="flex flex-col h-full bg-[#fdfaf6] text-[#2a2a2a] p-12 font-serif" style={{ backgroundImage: 'radial-gradient(#e5e1d8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div className="bg-white p-12 border-2 border-[#8b0000] shadow-[8px_8px_0px_#8b0000] h-full flex flex-col relative">
              
              <div className="flex justify-between items-end border-b-2 border-[#8b0000] pb-8 mb-12">
                 <div className="flex items-center gap-6">
                    {data.sender.logo && <img src={data.sender.logo} alt="Logo" className="w-20 h-20 object-contain p-1 border-2 border-[#8b0000] rounded-full" />}
                    <h1 className="text-7xl font-black uppercase text-[#8b0000] tracking-tighter">INVOICE</h1>
                 </div>
                 <div className="text-right border-l-2 border-[#8b0000] pl-6">
                    <p className="text-xl font-bold text-[#8b0000]">No. {data.number}</p>
                    <p className="text-sm font-medium uppercase tracking-widest mt-2">D: {data.date}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                 <div className="border-2 border-[#8b0000] p-6 bg-[#fdfaf6]">
                    <div className="bg-[#8b0000] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 inline-block mb-4 -mt-10 border-2 border-[#8b0000]">FROM</div>
                    <p className="text-2xl font-black uppercase text-[#8b0000] mb-2">{data.sender.name}</p>
                    <p className="text-sm font-medium leading-relaxed mb-2 whitespace-pre-line">{data.sender.address}</p>
                    {data.sender.gst && <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b0000]">GSTIN: {data.sender.gst}</p>}
                 </div>
                 <div className="border-2 border-[#8b0000] p-6 bg-[#fdfaf6]">
                    <div className="bg-[#8b0000] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 inline-block mb-4 -mt-10 border-2 border-[#8b0000]">TO</div>
                    <p className="text-2xl font-black uppercase text-[#8b0000] mb-2">{data.receiver.name}</p>
                    <p className="text-sm font-medium leading-relaxed mb-2 whitespace-pre-line">{data.receiver.address}</p>
                    {data.receiver.gst && <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b0000]">GSTIN: {data.receiver.gst}</p>}
                 </div>
              </div>

              <div className="flex-grow">
                 <table className="w-full text-left font-sans border-2 border-[#8b0000] bg-white">
                    <thead>
                       <tr className="bg-[#8b0000] text-white text-xs uppercase font-bold tracking-widest">
                          <th className="p-4 border-r-2 border-[#8b0000]">Description</th>
                          <th className="p-4 text-center border-r-2 border-[#8b0000]">Qty</th>
                          <th className="p-4 text-right border-r-2 border-[#8b0000]">Rate</th>
                          <th className="p-4 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody>
                       {data.items.map((item) => (
                          <tr key={item.id} className="border-b-2 border-[#8b0000] last:border-b-0">
                             <td className="p-4 border-r-2 border-[#8b0000] font-bold">{item.description}</td>
                             <td className="p-4 text-center border-r-2 border-[#8b0000] font-mono">{item.quantity}</td>
                             <td className="p-4 text-right border-r-2 border-[#8b0000] font-mono">{data.currency}{item.price.toFixed(2)}</td>
                             <td className="p-4 text-right font-bold text-[#8b0000] font-mono">{data.currency}{(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="flex justify-between items-end mt-12 pt-8 border-t-4 border-double border-[#8b0000]">
                 <div className="max-w-xs">
                    <p className="bg-[#8b0000] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 inline-block mb-2">NOTES</p>
                    <p className="text-sm font-medium border-l-2 border-[#8b0000] pl-4">{data.notes}</p>
                    {data.signature && (
                        <div className="mt-6 border-2 border-[#8b0000] p-4 bg-[#fdfaf6] w-fit transform -rotate-2">
                           <img src={data.signature} alt="Signature" className="h-16 object-contain mix-blend-multiply" />
                           <p className="text-[10px] text-center uppercase tracking-widest font-bold mt-2 text-[#8b0000]">Sign</p>
                        </div>
                    )}
                 </div>
                 <div className="w-64 border-2 border-[#8b0000] p-6 bg-[#fdfaf6] shadow-[4px_4px_0px_#8b0000]">
                    <div className="flex justify-between text-sm font-bold font-sans mb-2 pb-2 border-b-2 border-[#8b0000] border-dotted">
                       <span className="uppercase text-[#8b0000]">Subtotal</span>
                       <span className="font-mono">{data.currency}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold font-sans mb-4 pb-2 border-b-2 border-[#8b0000] border-dotted">
                       <span className="uppercase text-[#8b0000]">Tax ({data.taxRate}%)</span>
                       <span className="font-mono">{data.currency}{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#8b0000] text-white -mx-6 -mb-6 p-4 mt-4">
                       <span className="text-xs uppercase font-bold tracking-widest">Total</span>
                       <span className="text-2xl font-black font-mono">{data.currency}{total.toFixed(2)}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'clean':
        return (
          <div className="flex flex-col h-full bg-white text-gray-800 p-16 font-sans">
             <div className="flex justify-between items-center mb-16 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-8">
                   {data.sender.logo ? (
                       <img src={data.sender.logo} alt="Logo" className="w-20 object-contain" />
                   ) : (
                       <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                   )}
                   <div>
                       <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{data.sender.name}</h1>
                       <p className="text-gray-500 text-sm mt-1 whitespace-pre-line">{data.sender.address}</p>
                       {data.sender.gst && <p className="text-gray-400 text-xs mt-1 font-medium">GSTIN: {data.sender.gst}</p>}
                   </div>
                </div>
                <div className="text-right">
                   <h2 className="text-5xl font-light tracking-tighter text-gray-300 mb-2">INVOICE</h2>
                   <div className="text-sm font-medium">
                      <span className="text-gray-500">#{data.number}</span>
                      <span className="text-gray-300 mx-2">|</span>
                      <span className="text-gray-700">{data.date}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-16 mb-16">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4">Invoice To</p>
                   <p className="text-xl font-bold text-gray-900 mb-2">{data.receiver.name}</p>
                   <p className="text-gray-600 leading-relaxed max-w-sm whitespace-pre-line mb-2">{data.receiver.address}</p>
                   {data.receiver.gst && <p className="text-gray-400 text-xs font-medium">GSTIN: {data.receiver.gst}</p>}
                </div>
                <div>
                   <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex justify-between mb-2">
                         <span className="text-gray-500 font-medium">Invoice Date</span>
                         <span className="font-bold text-gray-900">{data.date}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500 font-medium">Due Date</span>
                         <span className="font-bold text-indigo-600">{data.dueDate}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex-grow">
                <table className="w-full text-left">
                   <thead className="border-b-2 border-gray-900">
                      <tr className="text-xs uppercase tracking-widest font-bold text-gray-500">
                         <th className="pb-4">Task Description</th>
                         <th className="pb-4 text-center">Qty</th>
                         <th className="pb-4 text-right">Price</th>
                         <th className="pb-4 text-right text-gray-900">Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {data.items.map((item) => (
                         <tr key={item.id} className="text-sm">
                            <td className="py-6 font-medium text-gray-900">{item.description}</td>
                            <td className="py-6 text-center text-gray-500">{item.quantity}</td>
                            <td className="py-6 text-right text-gray-500">{data.currency}{item.price.toFixed(2)}</td>
                            <td className="py-6 text-right font-bold text-gray-900">{data.currency}{(item.quantity * item.price).toFixed(2)}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
                <div className="max-w-sm gap-6 flex">
                   {data.signature && (
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Signature</p>
                          <img src={data.signature} alt="Signature" className="h-16 object-contain border-b border-gray-300 pb-2" />
                       </div>
                   )}
                   <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Note</p>
                       <p className="text-sm text-gray-600 leading-relaxed">{data.notes}</p>
                   </div>
                </div>
                <div className="w-72 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">{data.currency}{subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                      <span>Tax ({data.taxRate}%)</span>
                      <span className="font-medium text-gray-900">{data.currency}{taxAmount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-indigo-600">
                      <span className="text-xs uppercase font-bold tracking-widest">Total Due</span>
                      <span className="text-2xl font-black">{data.currency}{total.toFixed(2)}</span>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'modern':
        return (
          <div className="flex flex-col h-full bg-white text-[#111] p-12 font-sans tracking-tight">
             <div className="mb-16">
                 {data.sender.logo && <img src={data.sender.logo} alt="Logo" className="h-12 object-contain mb-8" />}
                 <div className="w-full h-px bg-[#111] mb-8"></div>
                 <div className="grid grid-cols-2 gap-12">
                    <div>
                       <h2 className="text-lg font-bold mb-1">{data.sender.name}</h2>
                       <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed max-w-xs">{data.sender.address}</p>
                       {data.sender.gst && <p className="text-xs text-gray-400 mt-2 font-medium">GSTIN: {data.sender.gst}</p>}
                    </div>
                    <div className="text-right">
                       <h1 className="text-4xl font-normal tracking-tighter mb-4">Invoice {data.number}</h1>
                       <div className="inline-grid grid-cols-2 gap-x-8 text-sm text-left">
                          <span className="text-gray-400">Date</span>
                          <span className="font-medium">{data.date}</span>
                          <span className="text-gray-400">Due</span>
                          <span className="font-medium">{data.dueDate}</span>
                       </div>
                    </div>
                 </div>
             </div>

             <div className="mb-12">
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Client</p>
                 <h2 className="text-2xl font-medium mb-2">{data.receiver.name}</h2>
                 <p className="text-gray-500 leading-relaxed max-w-sm whitespace-pre-line mb-2">{data.receiver.address}</p>
                 {data.receiver.gst && <p className="text-xs text-gray-400 font-medium">GSTIN: {data.receiver.gst}</p>}
             </div>

             <div className="flex-grow">
                 <div className="w-full h-px bg-[#111] mb-4"></div>
                 <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-widest text-gray-400 pb-4">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                 </div>
                 <div className="w-full h-px bg-gray-200 mb-4"></div>
                 
                 {data.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 text-sm py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                       <div className="col-span-6 font-medium">{item.description}</div>
                       <div className="col-span-2 text-gray-500">{item.quantity}</div>
                       <div className="col-span-2 text-right text-gray-500">{data.currency}{item.price.toFixed(2)}</div>
                       <div className="col-span-2 text-right font-medium">{data.currency}{(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                 ))}
                 <div className="w-full h-px bg-[#111] mt-4"></div>
             </div>

             <div className="flex justify-between items-end mt-12">
                <div className="max-w-md">
                   {data.signature && (
                       <img src={data.signature} alt="Signature" className="h-16 object-contain mb-4 filter grayscale" />
                   )}
                   <p className="text-xs text-gray-500 leading-relaxed">{data.notes}</p>
                </div>
                <div className="w-72">
                   <div className="flex justify-between py-2 text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#111]">{data.currency}{subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between py-2 text-sm text-gray-500 border-b border-gray-200">
                      <span>Tax ({data.taxRate}%)</span>
                      <span className="font-medium text-[#111]">{data.currency}{taxAmount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between py-4 text-2xl font-light">
                      <span>Total</span>
                      <span className="font-medium">{data.currency}{total.toFixed(2)}</span>
                   </div>
                </div>
             </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
        id="invoice-capture"
        className="w-[794px] min-h-[1123px] mx-auto shadow-[0_0_100px_rgba(0,0,0,0.15)] relative bg-white shrink-0"
    >
      {renderTheme()}
    </div>
  );
};
