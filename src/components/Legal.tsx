import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const LegalPage: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-palladian p-6 md:p-12 lg:p-24 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-abyssal/50 hover:text-abyssal font-bold text-[10px] uppercase tracking-widest mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-abyssal mb-12 uppercase leading-none">
          {title}
        </h1>
        
        <div className="prose prose-neutral max-w-none">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-oatmeal/50 shadow-xl space-y-6">
            <p className="text-abyssal/70 font-medium leading-relaxed italic">
              "Invoicy is a performance-driven invoicing engine built for modern studios. We prioritize typography, clarity, and rapid export over bloated CRM features."
            </p>
            {content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-abyssal/80 leading-relaxed font-medium">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        
        <div className="mt-12 pt-12 border-t border-oatmeal/50 flex justify-between items-center text-[10px] font-bold text-abyssal/30 uppercase tracking-widest">
           <span>© 2026 INVOICY STUDIO</span>
           <span>v1.0.4-STABLE</span>
        </div>
      </motion.div>
    </div>
  );
};
