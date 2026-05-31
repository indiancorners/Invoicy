import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: 'invoice-limit' | 'pro-theme' | 'export';
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
    reason === 'export' ? 'Unlock PDF & PNG Export'
    : reason === 'pro-theme' ? 'Unlock All 5 Themes'
    : 'Unlock Studio Pro';

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
            className="absolute inset-0 bg-[#1D1D1F]/60 backdrop-blur-md"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm mx-4 bg-white rounded-2xl p-8 border border-border shadow-2xl"
          >
            {/* Icon */}
            <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center mb-6">
              <BrandLogo className="w-8 h-8" onDark={true} />
            </div>

            {/* Headline */}
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              {headline}
            </h3>

            {/* Subheading */}
            <p className="text-[13px] text-muted leading-relaxed mb-4">
              One payment. Unlimited invoices. All 5 studio themes. Shareable links.
            </p>

            {/* Price */}
            <p className="text-accent font-bold text-2xl tracking-tighter mb-6">
              $20 <span className="text-sm text-muted font-bold uppercase tracking-widest">lifetime access</span>
            </p>

            {/* Feature list */}
            <ul className="space-y-2 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[13px] font-medium text-foreground">
                  <div className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    <Check size={11} className="text-accent" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              className="w-full rounded-full bg-accent text-white font-bold text-[13px] py-4 hover:opacity-80 transition-all active:scale-95 mb-3"
            >
              Get Studio Pro — $20
            </button>

            {/* Secondary */}
            <button
              onClick={onClose}
              className="w-full text-[13px] font-medium text-muted hover:text-foreground transition-colors py-2"
            >
              Not right now
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
