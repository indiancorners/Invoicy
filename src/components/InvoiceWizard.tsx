import React, { useState, useEffect, useMemo } from 'react';
import { InvoiceData, ThemeType } from '../types';
import { LayoutGrid, Type, Cpu, Sparkles, Moon, ArrowRight, ArrowLeft, Check, Lock, Activity, Loader2, Star, AlertTriangle, X } from 'lucide-react';
import { cn, exportToPDF, exportToPNG } from '../lib/utils';
import { toast } from 'sonner';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { BrandLogo } from './BrandLogo';
import { UpgradeModal } from './UpgradeModal';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { usePro } from '../context/ProContext';

interface InvoiceWizardProps {
  initialData: InvoiceData;
  onSave: (data: InvoiceData) => void;
}

export const InvoiceWizard: React.FC<InvoiceWizardProps> = ({ initialData, onSave }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<InvoiceData>(initialData);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingType, setExportingType] = useState<'pdf' | 'png' | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'pro-theme' | 'invoice-limit' | 'export'>('pro-theme');
  const navigate = useNavigate();
  const pro = usePro();

  // Reset tab to details whenever step changes
  useEffect(() => {
    setActiveTab('details');
  }, [step]);

  const themes: { id: ThemeType; label: string; desc: string; icon: any; color: string; isPremium: boolean }[] = [
    { id: 'minimalist', label: 'Minimalist', desc: 'Free Basic Theme', icon: LayoutGrid, color: 'bg-black', isPremium: false },
    { id: 'corporate', label: 'Corporate', desc: 'Pro Studio Theme', icon: Cpu, color: 'bg-stone-800', isPremium: true },
    { id: 'retro', label: 'Retro', desc: 'Pro Designer Theme', icon: Type, color: 'bg-red-800', isPremium: true },
    { id: 'clean', label: 'Clean', desc: 'Pro Minimalist Theme', icon: Sparkles, color: 'bg-neutral-400', isPremium: true },
    { id: 'modern', label: 'Modern', desc: 'Pro Agency Theme', icon: Moon, color: 'bg-[#1a1a1a]', isPremium: true }
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  // Real field validation for Step 3 (replaces the previously hardcoded "Ready").
  const validation = useMemo(() => {
    const emailOk = (e?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());
    const items = data.items ?? [];
    const hasValidItem = items.some(
      (i) => (i.description || '').trim() !== '' && (i.quantity ?? 0) > 0 && (i.price ?? 0) >= 0
    );
    const datesOk =
      !!data.date && !!data.dueDate &&
      new Date(data.dueDate).getTime() >= new Date(data.date).getTime();
    const checks = [
      { label: 'Sender name', ok: (data.sender?.name || '').trim() !== '' },
      { label: 'Sender email', ok: emailOk(data.sender?.email) },
      { label: 'Client name', ok: (data.receiver?.name || '').trim() !== '' },
      { label: 'Client email', ok: emailOk(data.receiver?.email) },
      { label: 'At least one valid line item', ok: hasValidItem },
      { label: 'Due date on or after issue date', ok: datesOk },
    ];
    return { checks, isValid: checks.every((c) => c.ok) };
  }, [data]);

  const handleFinalSave = async () => {
    if (!validation.isValid) {
      toast.warning('Some details are incomplete — saving as a draft. Resolve the checklist before sending.');
    }
    try {
      await onSave(data);
      // onSave navigates to /app on success.
    } catch {
      // onSave shows its own error toast; stay on the wizard so work isn't lost.
    }
  };

  const handleExport = async (type: 'pdf' | 'png') => {
    setExportingType(type);
    setIsExporting(true);
    // The capture node is only mounted while exporting — wait for React to
    // commit it before html2canvas (in captureCanvas) looks it up by id.
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const toastId = toast.loading(`Preparing high-res ${type.toUpperCase()}...`);

    try {
      if (type === 'pdf') {
        await exportToPDF('invoice-capture', `Invoice-${data.number}`);
      } else {
        await exportToPNG('invoice-capture', `Invoice-${data.number}`);
      }
      toast.success(`${type.toUpperCase()} exported successfully!`, { id: toastId });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Surface the failure mode so debugging in production is tractable.
      const hint =
        msg.includes('not found') ? '(preview element missing)' :
        msg.toLowerCase().includes('tainted') ? '(image CORS / tainted canvas)' :
        msg.toLowerCase().includes('oklch') ? '(unparsed oklch color)' :
        '';
      console.error(`[Wizard] ${type.toUpperCase()} export failed ${hint}:`, error);
      toast.error(`Export failed: ${msg}`, { id: toastId });
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  const handleThemeSelect = (theme: typeof themes[0]) => {
    if (theme.isPremium && !pro.isPremium) {
      setUpgradeReason('pro-theme');
      setShowUpgradeModal(true);
      return;
    }
    setData({ ...data, theme: theme.id });
  };

  return (
    <>
    {/* Hidden export capture — mounted only while exporting so it doesn't
        re-render on every keystroke. id="invoice-capture" lives on InvoicePreview root. */}
    {isExporting && (
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: 0, top: 0, width: '794px', pointerEvents: 'none', visibility: 'hidden' }}
      >
        <InvoicePreview data={data} />
      </div>
    )}
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] overflow-hidden relative">
      {/* Export loading overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#1D1D1F]/80 backdrop-blur-md flex flex-col items-center justify-center text-white"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-t-2 border-r-2 border-[#2563EB] rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-[#2563EB] animate-pulse" size={32} />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold tracking-tighter">Exporting<span className="text-[#2563EB]">...</span></h3>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B]">Rendering high-fidelity assets</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step progress bar */}
      <div className="h-1 bg-[#E8E8ED] w-full shrink-0 z-50">
         <motion.div
            className="h-full bg-[#2563EB]"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
         />
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Full-width Control Panel */}
        <section className="w-full bg-white border-r border-[#D2D2D7] flex flex-col h-full shrink-0 z-40 relative transition-all duration-500">
          <header className="p-6 md:p-10 border-b border-[#D2D2D7] bg-white z-10 shrink-0">
             <div className="flex items-center gap-4 mb-6">
                <button
                   type="button"
                   onClick={() => navigate('/app')}
                   className="w-10 h-10 border border-[#D2D2D7] rounded-xl flex items-center justify-center hover:bg-[#F5F5F7] transition-all active:scale-90 shrink-0"
                   aria-label="Go back"
                >
                   <ArrowLeft size={20} className="text-[#1D1D1F]" />
                </button>
                <div className="h-4 w-px bg-[#D2D2D7] shrink-0" />
                <h2 className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
                   {step === 1 && "Choose Design"}
                   {step === 2 && "Input Details"}
                   {step === 3 && "Final Review"}
                </h2>
             </div>
             {/* Step indicator dots */}
             <div className="flex items-center gap-2">
               {[1, 2, 3].map((s) => (
                 <div
                   key={s}
                   className={cn(
                     "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all",
                     s === step
                       ? "bg-[#2563EB] text-white"
                       : s < step
                       ? "bg-[#1D1D1F] text-white"
                       : "bg-[#D2D2D7] text-[#6E6E73]"
                   )}
                 >
                   {s < step ? <Check size={12} /> : s}
                 </div>
               ))}
               <span className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B] ml-2">
                 {step === 1 && "Select a visual direction for your business."}
                 {step === 2 && "Precision detail for professional billing."}
                 {step === 3 && "Confirm data and export your assets."}
               </span>
             </div>
          </header>

          <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#FAFAFA]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6 md:p-10 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {themes.map((theme) => {
                      const Icon = theme.icon;
                      const isActive = data.theme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleThemeSelect(theme)}
                          className={cn(
                            "w-full flex flex-col p-6 rounded-2xl border transition-all text-left group relative outline-none",
                            isActive
                              ? "border-2 border-[#2563EB] bg-[#EFF6FF]"
                              : "border border-[#D2D2D7] bg-[#F5F5F7] hover:border-[#AEAEB2]"
                          )}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-4 transition-colors", isActive ? theme.color : "bg-white border border-[#D2D2D7] shadow-sm")}>
                             <Icon size={20} className={isActive ? "text-white" : "text-[#6E6E73]"} />
                          </div>
                          <div>
                            <p className="font-semibold text-[14px] tracking-tight text-[#1D1D1F] mb-1">{theme.label}</p>
                            <p className={cn("text-[11px] font-semibold uppercase tracking-widest", isActive ? "text-[#2563EB]" : "text-[#86868B]")}>{theme.desc}</p>
                          </div>
                          {theme.isPremium && !pro.isPremium && !isActive && (
                             <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white border border-[#D2D2D7] rounded-full shadow-sm">
                                <Lock size={10} className="text-[#6E6E73]" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6E6E73]">Pro</span>
                             </div>
                          )}
                          {isActive && <Check size={16} className="text-[#2563EB] absolute bottom-6 right-6" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                   key="step2"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="h-full flex flex-col"
                >
                  {/* Tab bar */}
                  <div className="flex p-4 border-b border-[#D2D2D7] bg-white shrink-0">
                    <div className="flex bg-[#F5F5F7] rounded-full p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={cn(
                          "px-5 py-2 text-[13px] font-medium rounded-full transition-all",
                          activeTab === 'details'
                            ? "bg-white text-[#1D1D1F] shadow-sm"
                            : "text-[#6E6E73] hover:text-[#1D1D1F]"
                        )}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                          "px-5 py-2 text-[13px] font-medium rounded-full transition-all",
                          activeTab === 'preview'
                            ? "bg-white text-[#1D1D1F] shadow-sm"
                            : "text-[#6E6E73] hover:text-[#1D1D1F]"
                        )}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Tab content */}
                  {activeTab === 'details' ? (
                    <div className="flex-grow overflow-y-auto overflow-x-hidden">
                      <InvoiceForm data={data} onChange={setData} />
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto overflow-y-auto flex-grow custom-scrollbar py-6">
                      <div className="mx-auto" style={{ transform: 'scale(0.7)', transformOrigin: 'top center', width: 'fit-content' }}>
                        <InvoicePreview data={data} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                   key="step3"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="p-6 md:p-10 space-y-8"
                >
                   <div className="bg-white p-8 rounded-2xl border border-[#D2D2D7]">
                      <div className="flex items-center justify-between mb-8 px-1 pb-4 border-b border-[#D2D2D7]">
                        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#86868B]">Asset Export Hub</h4>
                      </div>
                      <div className="space-y-4">
                         {/* PDF Export */}
                         <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => {
                              if (!pro.isPremium) {
                                setUpgradeReason('export');
                                setShowUpgradeModal(true);
                                return;
                              }
                              handleExport('pdf');
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl hover:border-[#AEAEB2] hover:bg-white transition-all active:scale-[0.98]",
                              isExporting && "opacity-50 cursor-not-allowed"
                            )}
                         >
                            <span className="flex items-center gap-4 font-semibold text-[14px] text-[#1D1D1F]">
                               <div className={cn(
                                 "w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center",
                                 exportingType === 'pdf' && "animate-pulse"
                               )}>
                                 {exportingType === 'pdf' ? (
                                   <Loader2 className="animate-spin" size={20} />
                                 ) : pro.isPremium ? (
                                   <BrandLogo className="w-5 h-5" />
                                 ) : (
                                   <Lock size={20} />
                                 )}
                               </div>
                               {exportingType === 'pdf' ? "Exporting PDF..." : "Download PDF"}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-widest bg-white border border-[#D2D2D7] px-3 py-1.5 rounded-full text-[#86868B]">
                              {exportingType === 'pdf' ? "Processing" : "ISO A4 · 300DPI"}
                            </span>
                         </button>

                         {/* PNG Export */}
                         <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => {
                              if (!pro.isPremium) {
                                setUpgradeReason('export');
                                setShowUpgradeModal(true);
                                return;
                              }
                              handleExport('png');
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl hover:border-[#AEAEB2] hover:bg-white transition-all active:scale-[0.98]",
                              isExporting && "opacity-50 cursor-not-allowed"
                            )}
                         >
                            <span className="flex items-center gap-4 font-semibold text-[14px] text-[#1D1D1F]">
                               <div className={cn(
                                 "w-11 h-11 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center",
                                 exportingType === 'png' && "animate-pulse"
                               )}>
                                 {exportingType === 'png' ? (
                                   <Loader2 className="animate-spin" size={20} />
                                 ) : pro.isPremium ? (
                                   <BrandLogo className="w-5 h-5" />
                                 ) : (
                                   <Lock size={20} />
                                 )}
                               </div>
                               {exportingType === 'png' ? "Exporting PNG..." : "Download PNG"}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-widest bg-white border border-[#D2D2D7] px-3 py-1.5 rounded-full text-[#86868B]">
                               {exportingType === 'png' ? "Processing" : "Lossless · 2x"}
                            </span>
                         </button>

                         {/* Copy Link */}
                         <button
                            type="button"
                            onClick={() => {
                               if (!pro.isPremium) {
                                  setUpgradeReason('pro-theme');
                                  setShowUpgradeModal(true);
                                  return;
                               }
                               if (!data.publicToken) {
                                  toast.error("Save the invoice first to generate a share link.");
                                  return;
                               }
                               navigator.clipboard.writeText(`${window.location.origin}/preview/${data.id}?t=${data.publicToken}`)
                                 .then(() => toast.success("Invoice link copied to clipboard!"))
                                 .catch(() => toast.error('Copy failed — please copy the URL manually.'));
                            }}
                            className="w-full flex items-center justify-between p-5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl hover:border-[#AEAEB2] hover:bg-white transition-all active:scale-[0.98]"
                         >
                            <span className="flex items-center gap-4 font-semibold text-[14px] text-[#1D1D1F]">
                               <div className="w-11 h-11 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                                 {pro.isPremium ? <BrandLogo className="w-5 h-5" /> : <Lock size={20} />}
                               </div>
                               Copy Link
                            </span>
                            <span className={cn(
                              "text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border",
                              pro.isPremium
                                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]"
                                : "bg-white border-[#D2D2D7] text-[#86868B]"
                            )}>
                               {pro.isPremium ? "Unlocked" : "Pro Only"}
                            </span>
                         </button>
                      </div>
                   </div>

                   {!pro.isPremium && (
                      <div className="p-8 bg-[#1D1D1F] text-white rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-[14px] font-semibold mb-3 flex items-center gap-2">
                           <Star size={16} className="text-[#2563EB] fill-[#2563EB]" /> Unlock Studio Pro
                        </h4>
                        <p className="text-[13px] text-white/60 mb-6 leading-relaxed">
                           Unlock all 5 studio-grade themes, unlimited high-fidelity exports, and shareable invoice links.
                        </p>
                        <button
                           onClick={() => { setUpgradeReason('invoice-limit'); setShowUpgradeModal(true); }}
                           className="w-full rounded-full bg-[#2563EB] text-white font-semibold text-[15px] h-12 px-7 hover:opacity-80 transition-all active:scale-95"
                        >
                           Get Studio Pro — $20
                        </button>
                      </div>
                   )}

                   <div className={cn(
                     "p-6 rounded-2xl border flex items-start gap-4",
                     validation.isValid ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FFFBEB] border-[#FDE68A]"
                   )}>
                      <div className={cn("p-2 rounded-full mt-0.5", validation.isValid ? "bg-[#DCFCE7]" : "bg-[#FEF3C7]")}>
                        {validation.isValid
                          ? <Check size={18} className="text-[#16A34A]" />
                          : <AlertTriangle size={18} className="text-[#D97706]" />}
                      </div>
                      <div className="flex-grow">
                         <h5 className={cn(
                           "text-[11px] font-semibold uppercase tracking-widest mb-1",
                           validation.isValid ? "text-[#16A34A]" : "text-[#D97706]"
                         )}>
                           {validation.isValid ? "Validation Status: Ready" : "Validation Status: Incomplete"}
                         </h5>
                         <p className={cn(
                           "text-[12px] leading-relaxed mb-3",
                           validation.isValid ? "text-[#15803D]/70" : "text-[#92400E]/80"
                         )}>
                           {validation.isValid
                             ? "All invoice fields verified. Your export is ready for delivery."
                             : "Some details need attention. You can still save as a draft, but resolve these before sending."}
                         </p>
                         <ul className="space-y-1.5">
                           {validation.checks.map((c) => (
                             <li key={c.label} className="flex items-center gap-2 text-[12px]">
                               {c.ok
                                 ? <Check size={13} className="text-[#16A34A] shrink-0" />
                                 : <X size={13} className="text-[#D97706] shrink-0" />}
                               <span className={c.ok ? "text-[#15803D]" : "text-[#92400E] font-medium"}>{c.label}</span>
                             </li>
                           ))}
                         </ul>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="p-6 md:p-10 border-t border-[#D2D2D7] bg-white shrink-0 flex gap-3 z-20">
            {step > 1 && (
               <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F] h-10 px-6 text-sm font-medium hover:opacity-80 transition-all flex items-center justify-center gap-2"
               >
                  <ArrowLeft size={15} /> Back
               </button>
            )}
            {step < 3 ? (
               <button
                  type="button"
                  onClick={handleNext}
                  className="flex-grow flex items-center justify-center gap-2 rounded-full bg-[#1D1D1F] text-white h-10 px-6 font-semibold text-sm hover:opacity-80 transition-all group"
               >
                  {step === 1 ? "Configure Details" : "Final Review"}
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
               </button>
            ) : (
               <button
                  type="button"
                  onClick={handleFinalSave}
                  className="flex-grow flex items-center justify-center gap-2 rounded-full bg-[#1D1D1F] text-white h-10 px-6 font-semibold text-sm hover:opacity-80 transition-all group"
               >
                  Save & Exit <Activity size={15} className="animate-pulse" />
               </button>
            )}
          </footer>
        </section>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={pro.activatePro}
        reason={upgradeReason}
      />
    </div>
    </>
  );
};
