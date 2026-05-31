import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InvoiceData, InvoiceStatus } from '../types';
import { Plus, Search, FileText, Download, Trash2, Edit2, Share2, TrendingUp, Clock, CheckCircle2, Calendar, ArrowUpRight, Zap, AlertCircle, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, exportToPDF } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { usePro } from '../context/ProContext';
import { toast } from 'sonner';
import { UpgradeModal } from './UpgradeModal';
import { InvoicePreview } from './InvoicePreview';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partially_paid: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

const ALL_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled'];

// InvoicePreview renders an outer <div id="invoice-capture"> — target that
// directly when triggering a Dashboard download.
const CAPTURE_ID = 'invoice-capture';

interface DashboardProps {
  invoices: InvoiceData[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  isLoading: boolean;
  fetchError?: string | null;
  onRetryFetch?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, onDelete, onStatusChange, isLoading, fetchError, onRetryFetch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const pro = usePro();

  const downloadingInvoice = useMemo(
    () => invoices.find((i) => i.id === downloadingId) ?? null,
    [downloadingId, invoices]
  );

  useEffect(() => {
    // Bug 1 fix: always clear stale downloadingId if invoice isn't found
    if (!downloadingInvoice) { setDownloadingId(null); return; }
    let cancelled = false;
    const filename = `Invoice-${downloadingInvoice.number || downloadingInvoice.id}`;
    const toastId = toast.loading('Preparing PDF…');
    (async () => {
      try {
        // Two RAFs give React + fonts time to mount and lay out the preview.
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r()))
        );
        if (cancelled) return;
        await exportToPDF(CAPTURE_ID, filename);
        if (!cancelled) toast.success('PDF downloaded.', { id: toastId });
      } catch (err) {
        console.error('[Dashboard] PDF export failed:', err);
        // Bug 12 fix: show friendly message, not raw internal error
        if (!cancelled) toast.error('PDF export failed. Please try again.', { id: toastId });
      } finally {
        if (!cancelled) setDownloadingId(null);
      }
    })();
    // Bug 2 fix: dismiss the loading toast if the effect is cleaned up (navigation away)
    return () => { cancelled = true; toast.dismiss(toastId); };
  }, [downloadingInvoice]);

  const handleDownload = (invoice: InvoiceData) => {
    if (!pro.isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    if (downloadingId) return; // already exporting
    setDownloadingId(invoice.id);
  };

  const stats = useMemo(() => {
    const total = invoices.reduce((acc, inv) => {
      // Bug 11 fix: guard against undefined items/taxRate
      const subtotal = (inv.items ?? []).reduce(
        (sum, item) => sum + (item.quantity ?? 0) * (item.price ?? 0), 0
      );
      return acc + subtotal * (1 + (inv.taxRate ?? 0) / 100);
    }, 0);
    const paid = invoices.filter(i => i.status === 'paid').length;
    // Bug 8 fix: "Awaiting" = sent + overdue + viewed (all outstanding invoices)
    const pending = invoices.filter(i => ['sent', 'overdue', 'viewed'].includes(i.status)).length;
    // Bug 9 fix: derive dominant currency symbol (use most common; fall back to no symbol)
    const currencyCounts: Record<string, number> = {};
    invoices.forEach(inv => {
      if (inv.currency) currencyCounts[inv.currency] = (currencyCounts[inv.currency] ?? 0) + 1;
    });
    const currencyEntries = Object.entries(currencyCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
    const dominantCurrency = currencyEntries[0]?.[0] ?? '';
    const mixedCurrencies = Object.keys(currencyCounts).length > 1;
    return { total, paid, pending, dominantCurrency, mixedCurrencies };
  }, [invoices]);

  const filteredInvoices = useMemo(() => invoices.filter(inv =>
    (statusFilter === 'all' || inv.status === statusFilter) &&
    // Bug 10 fix: guard against undefined number/receiver.name
    ((inv.number ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.receiver?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0)),
  [invoices, statusFilter, searchTerm]);

  const calculateTotal = (inv: InvoiceData) => {
    // Bug 11 fix: guard against undefined items/taxRate
    return (inv.items ?? []).reduce(
      (sum, item) => sum + (item.quantity ?? 0) * (item.price ?? 0), 0
    ) * (1 + (inv.taxRate ?? 0) / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base p-6 md:p-12 font-sans text-foreground">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="h-10 w-48 bg-border/50 animate-pulse rounded-xl" />
              <div className="h-3 w-64 bg-border/50 animate-pulse rounded-lg" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-36 bg-border/50 animate-pulse rounded-xl" />
              <div className="h-12 w-36 bg-border/50 animate-pulse rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-[#D2D2D7] p-8 rounded-2xl">
                <div className="h-3 w-24 bg-border/50 animate-pulse rounded-lg mb-4" />
                <div className="h-9 w-32 bg-border/50 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
            <div className="p-6 border-b border-[#D2D2D7]">
              <div className="h-10 w-64 bg-border/50 animate-pulse rounded-xl" />
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-10 py-6 border-b border-[#D2D2D7] flex items-center gap-6">
                <div className="w-10 h-10 bg-border/50 animate-pulse rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-border/50 animate-pulse rounded" />
                  <div className="h-2 w-24 bg-border/50 animate-pulse rounded" />
                </div>
                <div className="h-4 w-20 bg-border/50 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-6 md:p-12 font-sans text-foreground">
      <main className="max-w-7xl mx-auto space-y-12">
        {/* Welcome Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 {pro.isPremium ? (
                   <h1 className="text-4xl font-bold tracking-tight"><span className="text-accent">Pro</span> Dashboard</h1>
                 ) : (
                   <h1 className="text-4xl font-bold tracking-tight">Studio <span className="text-muted">Dashboard</span></h1>
                 )}
              </div>
              <p className="text-muted font-bold tracking-widest text-[9px] uppercase">
                 Welcome back. You have {invoices.length} total records in your vault.
                 {pro.isPremium ? " You are on the Pro Plan." : " You are on the Free Plan."}
              </p>
              {!pro.isPremium && (
                <span className={cn(
                  "inline-flex items-center mt-2 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                  pro.isLimitReached(invoices.length)
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-subtle text-muted border-border"
                )}>
                  {`${invoices.length}/${pro.freeLimit} invoice${pro.freeLimit === 1 ? '' : 's'} used`}
                </span>
              )}
           </div>
           <div className="flex items-center gap-3">
             {!pro.isPremium ? (
               <button
                 onClick={() => pro.activatePro()}
                 className="rounded-full bg-accent text-white h-9 px-5 text-[13px] font-medium hover:opacity-80 transition-all flex items-center gap-2 active:scale-95"
               >
                 Get Lifetime Access <Zap size={14} className="fill-current" />
               </button>
             ) : (
               <div className="rounded-full bg-accent-light text-accent px-6 py-2 text-[13px] font-medium flex items-center gap-2 border border-accent/20 cursor-default">
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
               className={cn(
                 "rounded-full bg-[#1D1D1F] text-white h-9 px-5 text-[13px] font-medium hover:opacity-80 transition-all active:scale-95 flex items-center gap-2",
                 isLoading && "opacity-50 cursor-not-allowed"
               )}
             >
               <Plus size={16} /> New Invoice
             </button>
           </div>
        </header>

        {/* Error Banner — Bug 3 fix: single notification (no duplicate toast), with Retry */}
        {fetchError && (
          <div className="flex items-center justify-between gap-4 bg-danger/10 border border-danger/30 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-danger flex-shrink-0" />
              <p className="text-[11px] font-medium text-danger">{fetchError}</p>
            </div>
            {onRetryFetch && (
              <button
                onClick={onRetryFetch}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-danger border border-danger/30 rounded-full px-4 py-2 hover:bg-danger/10 transition-colors shrink-0"
              >
                <RefreshCw size={12} /> Retry
              </button>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#D2D2D7] p-8 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold text-placeholder uppercase tracking-widest mb-3">Total Volume</p>
              <h3 className="text-4xl font-bold tracking-tighter">
                {stats.mixedCurrencies ? '' : stats.dominantCurrency}{stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              {stats.mixedCurrencies && <p className="text-[9px] text-placeholder font-bold uppercase tracking-widest mt-1">Mixed currencies</p>}
            </div>
            <div className="w-12 h-12 bg-subtle rounded-xl flex items-center justify-center text-foreground">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="bg-white border border-[#D2D2D7] p-8 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold text-accent uppercase tracking-widest mb-3">Awaiting</p>
              <h3 className="text-4xl font-bold tracking-tighter">{stats.pending} <span className="text-xl text-muted font-bold uppercase">Invoices</span></h3>
            </div>
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center text-accent">
              <Clock size={20} />
            </div>
          </div>
          <div className="bg-white border border-[#D2D2D7] p-8 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold text-success uppercase tracking-widest mb-3">Paid</p>
              <h3 className="text-4xl font-bold tracking-tighter">{stats.paid} <span className="text-xl text-muted font-bold uppercase">Cleared</span></h3>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#D2D2D7] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-placeholder" size={16} />
                <input
                  type="text"
                  placeholder="Search vault..."
                  className="w-full bg-subtle pl-12 pr-6 py-3.5 rounded-full border border-border focus:bg-white focus:border-accent outline-none transition-all text-[11px] font-bold text-foreground placeholder:text-placeholder uppercase tracking-widest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-subtle p-1.5 rounded-full border border-border overflow-x-auto w-full sm:w-auto">
                {(['all', 'draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      statusFilter === status
                        ? "bg-white text-foreground shadow-sm border border-border"
                        : "text-muted hover:text-foreground border border-transparent"
                    )}
                  >
                    {status === 'all' ? 'All' : (STATUS_LABELS[status] ?? status)}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden xl:inline-flex text-[9px] items-center font-bold text-placeholder uppercase tracking-[0.2em] bg-subtle px-5 py-2.5 rounded-full border border-border shrink-0">
              {filteredInvoices.length} {filteredInvoices.length === 1 ? 'Invoice' : 'Invoices'}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-subtle text-[11px] font-semibold uppercase tracking-widest text-placeholder border-b border-[#D2D2D7]">
                  <th className="px-10 py-6">Invoice</th>
                  <th className="px-10 py-6">Client</th>
                  <th className="px-10 py-6 text-right">Amount</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2D2D7]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-subtle transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-subtle text-foreground rounded-xl flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <div>
                          <span className="font-bold tracking-tight text-sm block mb-0.5 uppercase">{inv.number}</span>
                          <span className="text-[9px] font-bold text-placeholder uppercase tracking-widest block">{inv.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-[11px] font-bold text-foreground mb-0.5 truncate max-w-[200px] uppercase tracking-tight">{inv.receiver.name}</p>
                      <p className="text-[9px] text-placeholder font-bold uppercase tracking-widest truncate max-w-[200px]">{inv.receiver.email}</p>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <p className="font-bold text-base tracking-tighter">{inv.currency}{calculateTotal(inv).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-10 py-6">
                      <StatusSelect status={inv.status} onChange={(s) => onStatusChange(inv.id, s)} />
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300">
                         <ActionButtons invoice={inv} setDeleteConfirmId={setDeleteConfirmId} navigate={navigate} isPro={pro.isPremium} onProLimited={() => setShowUpgradeModal(true)} onDownload={handleDownload} isDownloading={downloadingId === inv.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-[#D2D2D7]">
            <AnimatePresence>
              {filteredInvoices.map((inv) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={inv.id}
                  className="p-6 md:p-8 flex flex-col gap-6 hover:bg-subtle transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-subtle rounded-xl flex items-center justify-center text-foreground">
                          <FileText size={18} />
                       </div>
                       <div>
                         <span className="text-[9px] font-bold uppercase tracking-widest text-placeholder block mb-1">{inv.number}</span>
                         <h4 className="font-bold text-lg leading-none text-foreground uppercase">{inv.receiver?.name}</h4>
                       </div>
                    </div>
                    <StatusSelect status={inv.status} onChange={(s) => onStatusChange(inv.id, s)} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-foreground/80 bg-subtle p-5 rounded-xl border border-border">
                    <span className="flex items-center gap-2 text-placeholder"><Calendar size={12}/> <span className="font-bold text-foreground uppercase tracking-widest text-[9px]">{inv.date}</span></span>
                    <span className="font-bold text-base text-foreground tracking-tighter">{inv.currency}{calculateTotal(inv).toLocaleString()}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/app/edit/${inv.id}`)}
                      className="text-[9px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-full bg-[#1D1D1F] text-white hover:opacity-80 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Edit2 size={14} /> Open Invoice
                    </button>
                    <div className="flex items-center gap-2">
                       <ActionButtons invoice={inv} setDeleteConfirmId={setDeleteConfirmId} navigate={navigate} isPro={pro.isPremium} onProLimited={() => setShowUpgradeModal(true)} onDownload={handleDownload} isDownloading={downloadingId === inv.id} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredInvoices.length === 0 && (
            invoices.length > 0 ? (
              <div className="p-20 md:p-32 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-subtle rounded-2xl flex items-center justify-center text-foreground/20 mb-8 border border-border">
                   <Search size={32} className="relative z-10" />
                </div>
                <h3 className="text-3xl font-bold tracking-tighter mb-4 text-foreground uppercase">No matches.</h3>
                <p className="text-muted text-[10px] md:text-xs max-w-[260px] mx-auto mb-10 leading-relaxed font-bold uppercase tracking-widest">
                  No invoices match your search or filter.
                </p>
                <button
                  onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}
                  className="rounded-full bg-[#1D1D1F] text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-10 py-4 hover:opacity-80 transition-all active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
            <div className="p-20 md:p-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-subtle rounded-2xl flex items-center justify-center text-foreground/20 mb-8 border border-border">
                 <FileText size={32} className="relative z-10" />
              </div>
              <h3 className="text-3xl font-bold tracking-tighter mb-4 text-foreground uppercase">No invoices yet.</h3>
              <p className="text-muted text-[10px] md:text-xs max-w-[260px] mx-auto mb-10 leading-relaxed font-bold uppercase tracking-widest">
                Your workspace is empty. Create your first invoice — it only takes 60 seconds.
              </p>
              <button
                onClick={() => navigate('/app/create')}
                className="rounded-full bg-[#1D1D1F] text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 px-10 py-4 hover:opacity-80 transition-all active:scale-95"
              >
                New Invoice <ArrowUpRight size={16} />
              </button>
            </div>
            )
          )}
        </div>
      </main>

      {/* Hidden export capture — mounted only while a download is in-flight.
          InvoicePreview already exposes id="invoice-capture" on its wrapper. */}
      {downloadingInvoice && (
        <div
          aria-hidden="true"
          style={{ position: 'fixed', left: 0, top: 0, width: '794px', pointerEvents: 'none', visibility: 'hidden' }}
        >
          <InvoicePreview data={downloadingInvoice} />
        </div>
      )}

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
              className="absolute inset-0 bg-[#1D1D1F]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 border border-[#D2D2D7] shadow-2xl"
            >
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter uppercase mb-2">Delete Invoice?</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted leading-relaxed mb-8">
                This invoice will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (deleteConfirmId) {
                      onDelete(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }}
                  className="w-full rounded-full bg-danger text-white py-4 font-bold text-[10px] uppercase tracking-widest hover:opacity-80 transition-all active:scale-95"
                >
                  Yes, Delete Invoice
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full rounded-full bg-subtle text-foreground py-4 font-bold text-[10px] uppercase tracking-widest hover:opacity-80 transition-all active:scale-95"
                >
                  Cancel
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
      "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
      status === 'paid'          && "bg-success/10 text-success border-success/20",
      status === 'sent'          && "bg-accent-light text-accent border-accent/20",
      status === 'draft'         && "bg-subtle text-muted border-border",
      status === 'viewed'        && "bg-blue-50 text-blue-500 border-blue-200",
      status === 'partially_paid' && "bg-warning/10 text-warning border-warning/20",
      status === 'overdue'       && "bg-danger/10 text-danger border-danger/20",
      status === 'cancelled'     && "bg-subtle text-placeholder border-border line-through",
    )}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};

// Interactive status pill — click to open a menu and change the invoice state.
const StatusSelect = ({ status, onChange }: { status: InvoiceStatus; onChange: (s: InvoiceStatus) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="inline-flex items-center gap-1 rounded-full hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
        title="Change status"
      >
        <StatusBadge status={status} />
        <ChevronDown size={12} className="text-placeholder" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-2 left-0 w-44 bg-white border border-[#D2D2D7] rounded-xl shadow-xl overflow-hidden p-1"
          >
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors",
                  s === status ? "bg-subtle text-foreground" : "text-muted hover:bg-subtle hover:text-foreground"
                )}
              >
                <span className="w-3 flex justify-center shrink-0">
                  {s === status && <CheckCircle2 size={11} className="text-success" />}
                </span>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButtons = ({ invoice, setDeleteConfirmId, navigate, isPro, onProLimited, onDownload, isDownloading }: { invoice: InvoiceData; setDeleteConfirmId: (id: string) => void; navigate: ReturnType<typeof useNavigate>; isPro: boolean; onProLimited: () => void; onDownload: (inv: InvoiceData) => void; isDownloading: boolean }) => {
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/app/edit/${invoice.id}`);
        }}
        className="p-2 hover:bg-subtle rounded-full text-muted hover:text-foreground transition-all"
        title="Edit"
      >
        <Edit2 size={16} />
      </button>
      <button
        type="button"
        disabled={isDownloading}
        onClick={(e) => {
          e.stopPropagation();
          onDownload(invoice);
        }}
        className={cn(
          "p-2 hover:bg-subtle rounded-full text-muted hover:text-accent transition-all",
          isDownloading && "opacity-50 cursor-wait"
        )}
        title={isPro ? "Download PDF" : "Upgrade to download PDF"}
      >
        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      </button>
      <button
        type="button"
        className="p-2 hover:bg-subtle rounded-full text-muted hover:text-accent transition-all"
        title={isPro ? "Copy share link" : "Upgrade to share invoice"}
        onClick={(e) => {
          e.stopPropagation();
          if (!isPro) {
            onProLimited();
            return;
          }
          if (!invoice.publicToken) {
            toast.error('This invoice was created before share links — open and re-save it to enable sharing.');
            return;
          }
          navigator.clipboard.writeText(`${window.location.origin}/preview/${invoice.id}?t=${invoice.publicToken}`)
            .then(() => toast.success('Link copied to clipboard!'))
            .catch(() => toast.error('Copy failed — please copy the URL manually.'));
        }}
      >
        <Share2 size={16} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDeleteConfirmId(invoice.id);
        }}
        className="p-2 hover:bg-subtle rounded-full text-muted hover:text-danger transition-all"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </>
  );
};
