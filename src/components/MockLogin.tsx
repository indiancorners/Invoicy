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
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <BrandLogo className="w-10 h-10" onDark={true} />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted text-[9px] font-medium">The studio is open. Ready to bill?</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleLogin(true)}
            className="w-full bg-subtle border border-border py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-80 group active:scale-95"
          >
            <Chrome className="text-muted group-hover:text-foreground transition-colors" size={20} />
            <span className="font-medium text-[11px] text-muted group-hover:text-foreground">Paid Access (Simulation)</span>
          </button>

          <button
             type="button"
             onClick={() => handleLogin(false)}
             className="w-full rounded-full bg-[#1D1D1F] text-white py-4 font-medium text-[11px] hover:opacity-80 flex items-center justify-center gap-3 group active:scale-95"
          >
            <Mail size={18} className="text-accent" />
            <span className="text-white">Fresh User (Email)</span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-muted font-medium">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy</span>.
        </p>
      </motion.div>
    </div>
  );
};
