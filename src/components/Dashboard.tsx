import React, { useMemo, useState } from 'react';
import { InvoiceData } from '../types';
import { Plus, Search, FileText, Download, Trash2, Edit2, Share2, TrendingUp, Clock, CheckCircle2, Calendar, DollarSign, ArrowUpRight, Zap, Target, Layout, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useInvoicyPro } from '../hooks/useInvoicyPro';
import { toast } from 'sonner';
import { UpgradeModal } from './UpgradeModal';

interface DashboardProps {
  invoices: InvoiceData[];
  onDelete: (id: string) => void;
  isLoading: boolean;
  fetchError?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, onDelete, isLoading, fetchError }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const pro = useInvoicyPro();

  const stats = useMemo(() => {
    const total = invoices.reduce((acc, inv) => {
        const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        return acc + subtotal * (1 + inv.taxRate / 100);
    }, 0);
    const paid = invoices.filter(i => i.status === 'paid').length;
    const pending = invoices.filter(i => i.status === 'sent').length;
    return { total, paid, pending };
  }, [invoices]);

  const filteredInvoices = invoices.filter(inv => 
    (statusFilter === 'all' || inv.status === statusFilter) &&
    (inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => b.lastModified - a.lastModified);

  const calculateTotal = (inv: InvoiceData) => {
    return inv.items.reduce((sum, item) => sum + item.quantity * item.price, 0) * (1 + inv.taxRate / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-palladian p-6 md:p-12 font-sans text-abyssal">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="h-10 w-48 bg-oatmeal/30 animate-pulse rounded-xl" />
              <div className="h-3 w-64 bg-oatmeal/20 animate-pulse rounded-lg" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-36 bg-oatmeal/20 animate-pulse rounded-xl" />
              <div className="h-12 w-36 bg-oatmeal/20 animate-pulse rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/60 p-8 rounded-2xl border border-white/50">
                <div className="h-3 w-24 bg-oatmeal/20 animate-pulse rounded-lg mb-4" />
                <div className="h-9 w-32 bg-oatmeal/30 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
          <div className="bg-white/80 rounded-2xl border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-oatmeal/20">
              <div className="h-10 w-64 bg-oatmeal/20 animate-pulse rounded-xl" />
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-10 py-6 border-b border-oatmeal/10 flex items-center gap-6">
                <div className="w-10 h-10 bg-oatmeal/20 animate-pulse rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-oatmeal/20 animate-pulse rounded" />
                  <div className="h-2 w-24 bg-oatmeal/15 animate-pulse rounded" />
                </div>
                <div className="h-4 w-20 bg-oatmeal/20 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-palladian p-6 md:p-12 font-sans text-abyssal">
      <main className="max-w-7xl mx-auto space-y-12">
        {/* Welcome Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 {pro.isPremium ? (
                   <h1 className="text-4xl font-bold tracking-tighter uppercase"><span className="text-flame">Pro</span> Dashboard</h1>
                 ) : (
                   <h1 className="text-4xl font-bold tracking-tighter uppercase">Studio <span className="text-neutral-400">Dashboard</span></h1>
                 )}
              </div>
              <p className="text-abyssal/50 font-bold tracking-widest text-[9px] uppercase">
                 Welcome back. You have {invoices.length} total records in your vault.
                 {pro.isPremium ? " You are on the Pro Plan." : " You are on the Free Plan."}
              </p>
              {!pro.isPremium && (
                <span className={cn(
                  "inline-flex items-center mt-2 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                  invoices.length >= 1
                    ? "bg-flame/10 text-truffle border-flame/30"
                    : "bg-neutral-100 text-neutral-400 border-neutral-200"
                )}>
                  {invoices.length >= 1 ? "1/1 free invoice used" : "1 free invoice available"}
                </span>
              )}
           </div>
           <div className="flex items-center gap-3">
             {!pro.isPremium ? (
               <button 
                 onClick={() => pro.activatePro()}
                 className="bg-flame text-black px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#ffbe7a] transition-all flex items-center gap-2 shadow-2xl shadow-flame/40 active:scale-95"
               >
                 Get Lifetime Access <Zap size={14} className="fill-current" />
               </button>
             ) : (
               <div className="bg-flame/10 text-flame px-6 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border border-flame/20 cursor-default">
                 Pro Activated <CheckCircle2 size={14} className="fill-current" />
               </div>
             )}
             <button
               onClick={() => {
                 if (isLoading) return;
                 if (pro.isLimitReached(invoices.length)) {
                   setShowUpgradeModal(true);
                   return;
                 }
                 navigate('/app/create');
               }}
               disabled={isLoading}
               className={cn("group relative bg-abyssal text-palladian px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest overflow-hidden transition-all active:scale-95 flex items-center gap-2 shadow-2xl shadow-abyssal/20", isLoading && "opacity-50 cursor-not-allowed")}
             >
               <span className="relative z-10 flex items-center gap-2">
                 <Plus size={16} /> New Invoice
               </span>
               <div className="absolute inset-0 bg-flame translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </button>
           </div>
        </header>

        {/* Error Banner */}
        {fetchError && (
          <div className="flex items-center gap-4 bg-truffle/10 border border-truffle/30 rounded-2xl p-5">
            <AlertCircle size={18} className="text-truffle flex-shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-truffle">{fetchError}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/50 shadow-sm flex items-start justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Total Volume</p>
              <h3 className="text-4xl font-bold tracking-tighter">${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 bg-palladian rounded-xl flex items-center justify-center text-abyssal group-hover:scale-110 group-hover:bg-abyssal group-hover:text-palladian transition-all">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/50 shadow-sm flex items-start justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <p className="text-[9px] font-bold text-flame uppercase tracking-widest mb-3">Awaiting</p>
              <h3 className="text-4xl font-bold tracking-tighter">{stats.pending} <span className="text-xl text-neutral-300 font-bold uppercase">Invoices</span></h3>
            </div>
            <div className="w-12 h-12 bg-flame/10 rounded-xl flex items-center justify-center text-flame group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl border border-white/50 shadow-sm flex items-start justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Paid</p>
              <h3 className="text-4xl font-bold tracking-tighter">{stats.paid} <span className="text-xl text-neutral-300 font-bold uppercase">Cleared</span></h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-oatmeal/20 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                <input
                  type="text"
                  placeholder="Search vault..."
                  className="w-full bg-palladian/30 pl-12 pr-6 py-3.5 rounded-xl border border-transparent focus:bg-white focus:border-flame/30 outline-none transition-all text-[11px] font-bold text-abyssal placeholder:text-neutral-400 uppercase tracking-widest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-palladian/30 p-1.5 rounded-xl border border-oatmeal/20 overflow-x-auto w-full sm:w-auto">
                {(['all', 'draft', 'sent', 'paid'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      statusFilter === status 
                        ? "bg-white text-abyssal shadow-sm border border-neutral-200" 
                        : "text-neutral-400 hover:text-abyssal hover:bg-white/50 border border-transparent"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden xl:inline-flex text-[9px] items-center font-bold text-neutral-400 uppercase tracking-[0.2em] bg-palladian px-5 py-2.5 rounded-full border border-oatmeal/20 shrink-0">
              {filteredInvoices.length} RECORDED ASSETS
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-palladian/10 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-oatmeal/20">
                  <th className="px-10 py-6">Invoice</th>
                  <th className="px-10 py-6">Client Entity</th>
                  <th className="px-10 py-6 text-right">Net Value</th>
                  <th className="px-10 py-6">State</th>
                  <th className="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oatmeal/10">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-palladian/20 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-white border border-oatmeal/20 text-abyssal rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-500">
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className="font-bold tracking-tight text-sm block mb-0.5 uppercase">{inv.number}</span>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">{inv.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-[11px] font-bold text-abyssal mb-0.5 truncate max-w-[200px] uppercase tracking-tight">{inv.receiver.name}</p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{inv.receiver.email}</p>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <p className="font-bold text-base tracking-tighter">{inv.currency}{calculateTotal(inv).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-10 py-6">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <ActionButtons invoice={inv} setDeleteConfirmId={setDeleteConfirmId} navigate={navigate} canShare={pro.isPremium} onShareLimited={() => setShowUpgradeModal(true)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-oatmeal/10">
            <AnimatePresence>
              {filteredInvoices.map((inv) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={inv.id} 
                  className="p-6 md:p-8 flex flex-col gap-6 bg-white/50 hover:bg-white transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-palladian rounded-xl flex items-center justify-center text-abyssal">
                          <FileText size={18} />
                       </div>
                       <div>
                         <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">{inv.number}</span>
                         <h4 className="font-bold text-lg leading-none text-abyssal uppercase">{inv.receiver.name}</h4>
                       </div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-abyssal/80 bg-palladian/30 p-5 rounded-xl border border-oatmeal/20">
                    <span className="flex items-center gap-2 text-neutral-400"><Calendar size={12}/> <span className="font-bold text-abyssal uppercase tracking-widest text-[9px]">{inv.date}</span></span>
                    <span className="font-bold text-base text-abyssal tracking-tighter">{inv.currency}{calculateTotal(inv).toLocaleString()}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button 
                      onClick={() => navigate(`/app/edit/${inv.id}`)} 
                      className="text-[9px] font-bold uppercase tracking-widest px-6 py-3.5 bg-abyssal text-palladian rounded-xl hover:bg-[#2b3b4d] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-abyssal/10"
                    >
                      <Edit2 size={14} /> Open Invoice
                    </button>
                    <div className="flex items-center gap-2">
                       <ActionButtons invoice={inv} setDeleteConfirmId={setDeleteConfirmId} navigate={navigate} canShare={pro.isPremium} onShareLimited={() => setShowUpgradeModal(true)} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredInvoices.length === 0 && (
            <div className="p-20 md:p-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-palladian rounded-2xl flex items-center justify-center text-abyssal/20 mb-8 border border-oatmeal shadow-inner relative group">
                 <div className="absolute inset-0 bg-flame/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <FileText size={32} className="relative z-10" />
              </div>
              <h3 className="text-3xl font-bold tracking-tighter mb-4 text-abyssal uppercase">Records Void.</h3>
              <p className="text-abyssal/40 text-[10px] md:text-xs max-w-[250px] mx-auto mb-10 leading-relaxed font-bold uppercase tracking-widest">
                Your invoice vault is empty. Create your first invoice to get started.
              </p>
              <button
                onClick={() => navigate('/app/create')}
                className="text-abyssal font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 bg-flame hover:bg-[#ffbe7a] px-10 py-4 rounded-xl transition-all shadow-2xl shadow-flame/10 active:scale-95"
              >
                New Invoice <ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={pro.activatePro}
        reason="invoice-limit"
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-abyssal/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="w-16 h-16 bg-truffle/10 text-truffle rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter uppercase mb-2">Confirm Removal</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed mb-8">
                This asset will be permanently expunged from your vault. This action cannot be reversed.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (deleteConfirmId) {
                      onDelete(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }}
                  className="w-full bg-truffle text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-truffle/20"
                >
                  Confirm Expungement
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full bg-palladian text-abyssal py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95"
                >
                  Retain Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span className={cn(
      "px-3 py-1 bg-white/50 backdrop-blur-sm rounded-lg text-[9px] font-bold uppercase tracking-widest border",
      status === 'paid' && "bg-abyssal text-palladian border-abyssal/20",
      status === 'sent' && "bg-flame/10 text-truffle border-flame/30",
      status === 'draft' && "bg-transparent text-abyssal/40 border-oatmeal/50",
    )}>
      {status}
    </span>
  );
};

const ActionButtons = ({ invoice, setDeleteConfirmId, navigate, canShare, onShareLimited }: { invoice: InvoiceData; setDeleteConfirmId: (id: string) => void; navigate: ReturnType<typeof useNavigate>; canShare: boolean; onShareLimited: () => void }) => {
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/app/edit/${invoice.id}`);
        }}
        className="p-3 hover:bg-white hover:shadow-xl rounded-xl text-abyssal/30 hover:text-abyssal transition-all group"
        title="Edit"
      >
        <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        type="button"
        className="p-3 hover:bg-white hover:shadow-xl rounded-xl text-abyssal/30 hover:text-blue-500 transition-all group"
        title="Share"
        onClick={(e) => {
            e.stopPropagation();
            if (!canShare) {
              onShareLimited();
              return;
            }
            navigator.clipboard.writeText(window.location.origin + `/preview/${invoice.id}`);
            toast.success('Link copied to clipboard!');
        }}
      >
        <Share2 size={16} className="group-hover:scale-110 transition-transform" />
      </button>
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDeleteConfirmId(invoice.id);
        }}
        className="p-3 hover:bg-white hover:shadow-xl rounded-xl text-abyssal/30 hover:text-truffle transition-all group"
        title="Delete"
      >
        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
      </button>
    </>
  );
};
