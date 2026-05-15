import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const LegalPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base p-6 md:p-12 lg:p-24 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] text-muted hover:text-foreground flex items-center gap-2 mb-12 transition-colors font-medium"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <h1
          className="font-bold tracking-tight text-foreground mb-12 leading-none"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}
        >
          {title}
        </h1>

        <div className="prose prose-neutral max-w-none">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-border space-y-6">
            <p className="text-foreground/70 font-medium leading-relaxed italic">
              "Invoicy is a performance-driven invoicing engine built for modern studios. We prioritize typography, clarity, and rapid export over bloated CRM features."
            </p>
            {content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-foreground/80 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-border flex justify-between items-center text-[10px] font-bold text-placeholder uppercase tracking-widest">
           <span>© 2026 INVOICY STUDIO</span>
           <span>v1.0.4-STABLE</span>
        </div>
      </motion.div>
    </div>
  );
};
