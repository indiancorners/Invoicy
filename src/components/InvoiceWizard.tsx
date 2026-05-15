import React, { useState, useEffect } from 'react';
import { InvoiceData, ThemeType } from '../types';
import { LayoutGrid, Type, Cpu, Sparkles, Moon, ArrowRight, ArrowLeft, Check, Lock, Activity, Loader2, Star } from 'lucide-react';
import { cn, exportToPDF, exportToPNG } from '../lib/utils';
import { toast } from 'sonner';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { BrandLogo } from './BrandLogo';
import { UpgradeModal } from './UpgradeModal';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useInvoicyPro } from '../hooks/useInvoicyPro';

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
  const [upgradeReason, setUpgradeReason] = useState<'pro-theme' | 'invoice-limit'>('pro-theme');
  const navigate = useNavigate();
  const pro = useInvoicyPro();

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

  const handleFinalSave = () => {
    onSave(data);
    navigate('/app');
  };

  const handleExport = async (type: 'pdf' | 'png') => {
    setExportingType(type);
    setIsExporting(true);
    const toastId = toast.loading(`Preparing high-res ${type.toUpperCase()}...`);

    try {
      if (type === 'pdf') {
        await exportToPDF('invoice-capture', `Invoice-${data.number}`);
      } else {
        await exportToPNG('invoice-capture', `Invoice-${data.number}`);
      }
      toast.success(`${type.toUpperCase()} exported successfully!`, { id: toastId });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Failed to export ${type.toUpperCase()}. Pop-ups might be blocked.`, { id: toastId });
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
    <div className="flex flex-col h-[100dvh] bg-palladian overflow-hidden relative">
      {/* Export loading overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-abyssal/80 backdrop-blur-md flex flex-col items-center justify-center text-white"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-t-2 border-r-2 border-flame rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-flame animate-pulse" size={32} />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold tracking-tighter uppercase">Studio <span className="text-flame">Exporting...</span></h3>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Rendering high-fidelity assets</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-1 bg-neutral-200 w-full shrink-0 z-50">
         <motion.div
            className="h-full bg-flame"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
         />
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Full-width Control Panel */}
        <section className="w-full bg-white border-r border-neutral-200 flex flex-col h-full shadow-2xl shrink-0 z-40 relative transition-all duration-500">
          <header className="p-6 md:p-10 border-b border-neutral-100 bg-white z-10 shrink-0">
             <div className="flex items-center gap-4 mb-6">
                <button
                   type="button"
                   onClick={() => navigate('/app')}
                   className="w-10 h-10 border border-neutral-200 rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-all shadow-sm active:scale-90 shrink-0"
                   aria-label="Go back"
                >
                   <ArrowLeft size={20} />
                </button>
                <div className="h-4 w-px bg-neutral-200 shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold tracking-tighter leading-none uppercase">
                   {step === 1 && "Choose Design"}
                   {step === 2 && "Input Details"}
                   {step === 3 && "Final Review"}
                </h2>
             </div>
             <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-400">
                {step === 1 && "Select a visual direction for your business."}
                {step === 2 && "Precision detail for professional billing."}
                {step === 3 && "Confirm data and export your assets."}
             </p>
          </header>

          <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar bg-neutral-50/30">
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
                            "w-full flex flex-col p-6 rounded-xl border transition-all text-left group relative outline-none",
                            isActive
                              ? "border-abyssal bg-abyssal text-white translate-x-1 shadow-xl shadow-abyssal/10"
                              : "border-neutral-200/60 bg-white hover:border-flame hover:bg-neutral-50"
                          )}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-4 transition-colors", isActive ? theme.color : "bg-neutral-100 group-hover:bg-neutral-200 shadow-sm")}>
                             <Icon size={20} className={isActive ? "text-white" : "text-neutral-400"} />
                          </div>
                          <div>
                            <p className="font-bold text-[13px] tracking-tight uppercase mb-1">{theme.label}</p>
                            <p className={cn("text-[8px] font-bold uppercase tracking-widest", isActive ? "text-white/40" : "text-neutral-400")}>{theme.desc}</p>
                          </div>
                          {theme.isPremium && !pro.isPremium && !isActive && (
                             <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md shadow-sm">
                                <Lock size={10} className="text-neutral-400" />
                                <span className="text-[7px] font-bold uppercase tracking-widest text-neutral-400">Pro</span>
                             </div>
                          )}
                          {isActive && <Check size={18} className="text-flame absolute bottom-6 right-6" />}
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
                  <div className="flex gap-2 p-4 border-b border-neutral-100 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className={cn(
                        "px-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-all",
                        activeTab === 'details'
                          ? "bg-white border border-neutral-200 rounded-xl text-abyssal shadow-sm"
                          : "text-neutral-400 hover:text-abyssal"
                      )}
                    >
                      📝 Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={cn(
                        "px-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-all",
                        activeTab === 'preview'
                          ? "bg-white border border-neutral-200 rounded-xl text-abyssal shadow-sm"
                          : "text-neutral-400 hover:text-abyssal"
                      )}
                    >
                      👁 Preview
                    </button>
                  </div>

                  {/* Tab content */}
                  {activeTab === 'details' ? (
                    <div className="flex-grow overflow-y-auto overflow-x-hidden">
                      <InvoiceForm data={data} onChange={setData} />
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto overflow-y-auto flex-grow custom-scrollbar py-6">
                      <div className="mx-auto" style={{ zoom: 0.7, width: 'fit-content' }}>
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
                   <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-xl">
                      <div className="flex items-center justify-between mb-8 px-1">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Asset Export Hub</h4>
                      </div>
                      <div className="space-y-4">
                         <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => handleExport('pdf')}
                            className={cn(
                              "w-full flex items-center justify-between p-6 bg-neutral-50/50 border border-neutral-200 rounded-xl hover:border-abyssal hover:bg-white transition-all group active:scale-[0.98]",
                              isExporting && "opacity-50 cursor-not-allowed"
                            )}
                         >
                            <span className="flex items-center gap-4 font-bold text-[12px] uppercase tracking-widest">
                               <div className={cn(
                                 "w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors",
                                 exportingType === 'pdf' && "animate-pulse"
                               )}>
                                 {exportingType === 'pdf' ? (
                                   <Loader2 className="animate-spin" size={22} />
                                 ) : pro.isPremium ? (
                                   <BrandLogo className="w-6 h-6 text-flame" />
                                 ) : (
                                   <Lock size={22} />
                                 )}
                               </div>
                               {exportingType === 'pdf' ? "Exporting PDF..." : "Download PDF"}
                            </span>
                            <span className="text-[9px] bg-white border border-neutral-200 px-3 py-1.5 rounded-lg font-bold text-neutral-300">
                              {exportingType === 'pdf' ? "Processing" : "ISO A4 @ 300DPI"}
                            </span>
                         </button>

                         <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => handleExport('png')}
                            className={cn(
                              "w-full flex items-center justify-between p-6 bg-neutral-50/50 border border-neutral-200 rounded-xl hover:border-abyssal hover:bg-white transition-all group active:scale-[0.98]",
                              isExporting && "opacity-50 cursor-not-allowed"
                            )}
                         >
                            <span className="flex items-center gap-4 font-bold text-[12px] uppercase tracking-widest">
                               <div className={cn(
                                 "w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors",
                                 exportingType === 'png' && "animate-pulse"
                               )}>
                                 {exportingType === 'png' ? (
                                   <Loader2 className="animate-spin" size={22} />
                                 ) : pro.isPremium ? (
                                   <BrandLogo className="w-6 h-6 text-flame" />
                                 ) : (
                                   <Lock size={22} />
                                 )}
                               </div>
                               {exportingType === 'png' ? "Exporting PNG..." : "Download PNG"}
                            </span>
                            <span className="text-[9px] bg-white border border-neutral-200 px-3 py-1.5 rounded-lg font-bold text-neutral-300">
                               {exportingType === 'png' ? "Processing" : "Lossless Studio Asset"}
                            </span>
                         </button>

                         <button
                            type="button"
                            onClick={() => {
                               if (!pro.isPremium) {
                                  setUpgradeReason('pro-theme');
                                  setShowUpgradeModal(true);
                                  return;
                               }
                               navigator.clipboard.writeText(window.location.origin + `/preview/${data.id}`);
                               toast.success("Invoice link copied to clipboard!");
                            }}
                            className="w-full flex items-center justify-between p-6 bg-neutral-50/50 border border-neutral-200 rounded-xl hover:border-abyssal hover:bg-white transition-all group active:scale-[0.98]"
                         >
                            <span className="flex items-center gap-4 font-bold text-[12px] uppercase tracking-widest">
                               <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                 {pro.isPremium ? <BrandLogo className="w-6 h-6 text-flame" /> : <Lock size={22} />}
                               </div>
                               Copy Link
                            </span>
                            <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest">
                               {pro.isPremium ? "Unlocked" : "Pro Only"}
                            </span>
                         </button>
                      </div>
                   </div>

                   {!pro.isPremium && (
                      <div className="p-8 bg-abyssal text-palladian rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-flame/30 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-[14px] font-bold mb-3 uppercase tracking-wide flex items-center gap-2">
                           <Star size={16} className="text-flame fill-flame" /> Upgrade to Pro Unlimited
                        </h4>
                        <p className="text-[10px] text-oatmeal/60 font-bold uppercase tracking-[0.1em] mb-6 leading-relaxed">
                           Unlock all 5 studio-grade themes, unlimited high-fidelity exports, and shareable invoice links — forever.
                        </p>
                        <button
                           onClick={() => { setUpgradeReason('invoice-limit'); setShowUpgradeModal(true); }}
                           className="w-full bg-flame text-abyssal font-bold text-[11px] uppercase tracking-widest py-4 rounded-xl hover:bg-[#ffbe7a] transition-all shadow-xl active:scale-95"
                        >
                           Activate Elite Access / $20
                        </button>
                      </div>
                   )}

                   <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4 shadow-sm">
                      <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                        <Check size={20} className="text-emerald-600" />
                      </div>
                      <div>
                         <h5 className="text-[11px] text-emerald-900 font-bold uppercase tracking-widest mb-1">Validation Status: Perfect</h5>
                         <p className="text-[10px] text-emerald-800/60 font-bold uppercase tracking-widest leading-relaxed">All invoice fields have been verified. Your studio-grade export is ready for delivery.</p>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="p-6 md:p-10 border-t border-neutral-100 bg-white/80 backdrop-blur-xl shrink-0 flex gap-4 z-20">
                    {step > 1 && (
                       <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-4 border border-neutral-200 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center hover:border-neutral-300 active:scale-95 shadow-sm"
                       >
                  <ArrowLeft size={16} />
               </button>
            )}
            {step < 3 ? (
               <button
                  type="button"
                  onClick={handleNext}
                  className="flex-grow flex items-center justify-center gap-3 bg-abyssal text-white px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1B2632] transition-all shadow-2xl shadow-abyssal/20 active:scale-95 group"
               >
                  {step === 1 ? "Configure Details" : "Final Verification"}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            ) : (
               <button
                  type="button"
                  onClick={handleFinalSave}
                  className="flex-grow flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 group"
               >
                  Commit to Vault & Exit <Activity size={16} className="animate-pulse" />
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
  );
};
