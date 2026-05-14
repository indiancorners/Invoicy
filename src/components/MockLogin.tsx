import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Chrome, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { useInvoicyPro } from '../hooks/useInvoicyPro';

export const MockLogin: React.FC = () => {
  const navigate = useNavigate();
  const pro = useInvoicyPro();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (isPaid: boolean = false) => {
    if (!isPaid) {
      localStorage.removeItem('invoicy_vault');
      localStorage.removeItem('invoicy_business_profile');
      localStorage.removeItem('invoicy_downloads_count');
      localStorage.removeItem('invoicy_pro_active');
    } else {
      pro.activatePro();
    }
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
    if (!isPaid) window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-palladian flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-flame/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-2xl border border-white p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-abyssal rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <BrandLogo className="w-10 h-10 text-flame" />
          </div>
          <h1 className="text-3xl font-bold text-abyssal tracking-tighter mb-2 uppercase">Welcome Back</h1>
          <p className="text-abyssal/50 font-bold tracking-widest text-[9px] uppercase">The studio is open. Ready to bill?</p>
        </div>

        <div className="space-y-4">
          <button 
            type="button"
            onClick={() => handleLogin(true)}
            className="w-full bg-white border border-oatmeal/50 py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-neutral-50 hover:shadow-lg group active:scale-95"
          >
            <Chrome className="text-neutral-500 group-hover:text-abyssal transition-colors" size={20} />
            <span className="font-bold text-[11px] uppercase tracking-widest text-neutral-600 group-hover:text-abyssal">Paid Access (Simulation)</span>
          </button>
          
          <button 
             type="button"
             onClick={() => handleLogin(false)}
             className="w-full bg-abyssal text-palladian py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#1B2632] transition-all shadow-xl shadow-abyssal/20 flex items-center justify-center gap-3 group active:scale-95"
          >
            <Mail size={18} className="text-flame" />
            <span className="text-white">Fresh User (Email)</span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-neutral-400 font-medium">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy</span>.
        </p>
      </motion.div>
    </div>
  );
};
