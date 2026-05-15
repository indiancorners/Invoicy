import React, { useState } from 'react';
import { useNavigate, NavLink, Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserButton, useUser } from '@clerk/clerk-react';
import {
  Plus,
  LayoutDashboard,
  Settings,
  LogOut,
  FileText,
  CreditCard,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useInvoicyPro } from '../hooks/useInvoicyPro';
import { BrandLogo } from './BrandLogo';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const pro = useInvoicyPro();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('invoicy_sidebar_collapsed') === 'true'
  );

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Plus, label: 'New Invoice', path: '/app/create' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  return (
    <div className="h-screen w-full flex bg-base overflow-hidden font-sans text-foreground">
      {/* Permanent Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex bg-[#1D1D1F] flex-col shrink-0 relative z-40"
      >
        {/* Toggle Button */}
        <button
          onClick={() => {
            const next = !isCollapsed;
            setIsCollapsed(next);
            localStorage.setItem('invoicy_sidebar_collapsed', String(next));
          }}
          className="absolute -right-3 top-24 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white shadow-xl z-50 hover:opacity-80 active:scale-95 transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        <div className={cn("p-8 pb-12 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
          <Link to="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group cursor-pointer hover:border-accent/50 transition-colors shrink-0">
            <BrandLogo className="w-6 h-6 group-hover:scale-110 transition-transform" onDark={true} />
          </Link>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link to="/" className="text-[15px] font-semibold tracking-tight text-white">
                Invoicy
              </Link>
            </motion.div>
          )}
        </div>

        <nav className={cn("flex-grow px-6 space-y-2", isCollapsed && "px-3")}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden whitespace-nowrap",
                isActive
                  ? "bg-accent text-white shadow-none"
                  : "text-white/60 hover:bg-white/8 hover:text-white",
                isCollapsed && "px-0 justify-center"
              )}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110 shrink-0")} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-[10px] uppercase tracking-widest"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Pro Upgrade Card */}
        <div className={cn("p-6", isCollapsed && "p-3")}>
           <div className={cn(
             "bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group backdrop-blur-xl transition-all",
             isCollapsed && "p-3 flex justify-center"
           )}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col items-center">
                 {!isCollapsed ? (
                   <>
                     <div className="flex items-center gap-2 mb-3 w-full">
                        <Star size={16} className={cn("text-accent", pro.isPremium && "fill-accent")} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent">
                          {pro.isPremium ? "Pro Active" : "Professional Studio"}
                        </span>
                     </div>
                     <h4 className="text-[13px] font-bold text-white mb-4 leading-tight">
                        {pro.isPremium
                          ? "You have lifetime access to all studio assets."
                          : "Only 1 invoice limit. Unlock Unlimited Access."}
                     </h4>
                     {!pro.isPremium && (
                       <div className="mb-4 bg-white/5 rounded-lg p-3 border border-white/5">
                         <div className="flex justify-between items-center">
                           <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Free Plan</span>
                           <span className="text-[8px] font-bold text-accent uppercase tracking-widest">1 Invoice Max</span>
                         </div>
                       </div>
                     )}
                     {!pro.isPremium ? (
                        <button
                          onClick={() => pro.activatePro()}
                          className="w-full rounded-full bg-accent text-white py-3 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:opacity-80 active:scale-95"
                        >
                           Get Lifetime Access <Zap size={14} className="fill-current" />
                        </button>
                     ) : (
                        <div className="text-[9px] font-bold text-success bg-success/10 py-3 rounded-xl uppercase tracking-widest text-center border border-success/20 w-full">
                           Elite Membership
                        </div>
                     )}
                   </>
                 ) : (
                   <div
                     className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent cursor-pointer hover:opacity-80 transition-all"
                     onClick={() => !pro.isPremium && pro.activatePro()}
                   >
                     {pro.isPremium ? <Star size={20} className="fill-current" /> : <Zap size={20} />}
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className={cn("p-6 border-t border-white/5 flex items-center gap-3", isCollapsed && "p-3 justify-center")}>
           <UserButton
             appearance={{
               elements: {
                 avatarBox: "w-10 h-10 border border-white/10 shrink-0",
                 userButtonPopoverCard: "bg-[#1D1D1F] border border-white/10 shadow-2xl",
                 userPreviewPrimaryIdentifier: "text-white font-bold text-sm",
                 userPreviewSecondaryIdentifier: "text-danger text-xs",
               }
             }}
           />
           {!isCollapsed && user && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden min-w-0">
               <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest leading-none truncate">
                 {user.firstName || user.username || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}
               </p>
               <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1 truncate">
                 {user.emailAddresses?.[0]?.emailAddress}
               </p>
             </motion.div>
           )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-grow relative flex flex-col h-full overflow-hidden">
        {/* Mobile Nav */}
        <header className="lg:hidden h-24 bg-white border-b border-[#D2D2D7] flex items-center justify-between px-6 shrink-0 z-30">
           <div className="flex items-center gap-3">
              <Link to="/" className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center">
                <BrandLogo className="w-6 h-6" onDark={true} />
              </Link>
              <Link to="/" className="font-black tracking-tighter text-xl text-foreground uppercase">Invoicy</Link>
           </div>

           <div className="flex items-center gap-4">
              <UserButton />
           </div>
        </header>

        {/* Content Outlet */}
        <div className="flex-grow overflow-auto bg-base">
           <Outlet />
        </div>

        {/* Mobile Bottom Bar */}
        <nav className="lg:hidden h-24 bg-white border-t border-[#D2D2D7] flex items-center justify-around px-6 shrink-0 pb-safe z-30">
           {navItems.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               end={item.path === '/app'}
               className={({ isActive }) => cn(
                 "flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all",
                 isActive ? "text-accent" : "text-muted hover:text-foreground"
               )}
             >
               {({ isActive }) => (
                 <>
                   <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                   <span className="text-[9px] font-black uppercase tracking-widest leading-none">{item.label.split(' ')[0]}</span>
                 </>
               )}
             </NavLink>
           ))}
        </nav>
      </main>
    </div>
  );
};
