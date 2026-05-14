import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: 'invoice-limit' | 'pro-theme';
}

const features = [
  'Unlimited invoices',
  '5 premium themes',
  'Shareable preview links',
  'PDF + PNG exports',
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  reason,
}) => {
  const headline =
    reason === 'pro-theme' ? 'Unlock Pro Themes' : 'Upgrade to Pro';

  const handleUpgrade = () => {
    onUpgrade();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-abyssal/60 backdrop-blur-md"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm mx-4 bg-white rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            {/* Icon */}
            <div className="w-16 h-16 bg-abyssal rounded-2xl flex items-center justify-center mb-6 text-flame">
              <BrandLogo className="w-8 h-8" />
            </div>

            {/* Headline */}
            <h3 className="text-2xl font-bold tracking-tighter uppercase mb-2">
              {headline}
            </h3>

            {/* Subheading */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed mb-4">
              One payment. Unlimited invoices. All 5 studio themes. Shareable links.
            </p>

            {/* Price */}
            <p className="text-flame font-bold text-2xl tracking-tighter mb-6">
              $20 <span className="text-sm text-neutral-400 font-bold uppercase tracking-widest">lifetime access</span>
            </p>

            {/* Feature list */}
            <ul className="space-y-2 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-abyssal">
                  <div className="w-5 h-5 rounded-full bg-flame/10 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-flame" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              className="w-full bg-flame text-abyssal font-bold text-[11px] uppercase tracking-widest py-4 rounded-xl hover:bg-[#ffbe7a] transition-all shadow-xl shadow-flame/20 active:scale-95 mb-3"
            >
              Get Lifetime Access / $20
            </button>

            {/* Secondary */}
            <button
              onClick={onClose}
              className="w-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-abyssal transition-colors py-2"
            >
              Maybe later
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
