import React, { useState } from 'react';
import { useNavigate, NavLink, Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserButton } from '@clerk/clerk-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Plus, label: 'New Invoice', path: '/app/create' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  return (
    <div className="h-screen w-full flex bg-palladian overflow-hidden font-sans text-abyssal">
      {/* Permanent Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex bg-abyssal flex-col shrink-0 relative z-40"
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-flame rounded-full flex items-center justify-center text-abyssal shadow-xl z-50 hover:scale-110 active:scale-95 transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        <div className={cn("p-8 pb-12 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
          <Link to="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group cursor-pointer hover:border-flame/50 transition-colors shrink-0">
            <BrandLogo className="w-6 h-6 text-flame group-hover:scale-110 transition-transform" />
          </Link>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link to="/" className="font-bold tracking-tighter text-2xl text-white uppercase">
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
                  ? "bg-flame text-abyssal shadow-[0_10px_30px_rgba(255,177,98,0.2)]" 
                  : "text-oatmeal hover:bg-white/5 hover:text-white",
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
              <div className="absolute top-0 right-0 w-24 h-24 bg-flame/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col items-center">
                 {!isCollapsed ? (
                   <>
                     <div className="flex items-center gap-2 mb-3 w-full">
                        <Star size={16} className={cn("text-flame", pro.isPremium && "fill-flame")} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-flame">
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
                           <span className="text-[8px] font-bold text-oatmeal/50 uppercase tracking-widest">Free Plan</span>
                           <span className="text-[8px] font-bold text-flame uppercase tracking-widest">1 Invoice Max</span>
                         </div>
                       </div>
                     )}
                     {!pro.isPremium ? (
                        <button 
                          onClick={() => pro.activatePro()}
                          className="w-full bg-flame text-abyssal py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-[#ffbe7a] active:scale-95 shadow-lg"
                        >
                           Get Lifetime Access <Zap size={14} className="fill-current" />
                        </button>
                     ) : (
                        <div className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 py-3 rounded-xl uppercase tracking-widest text-center border border-emerald-400/20 w-full">
                           Elite Membership
                        </div>
                     )}
                   </>
                 ) : (
                   <div 
                     className="w-10 h-10 bg-flame/10 rounded-xl flex items-center justify-center text-flame cursor-pointer hover:bg-flame hover:text-abyssal transition-all"
                     onClick={() => !pro.isPremium && pro.activatePro()}
                   >
                     {pro.isPremium ? <Star size={20} className="fill-current" /> : <Zap size={20} />}
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className={cn("p-6 border-t border-white/5 flex justify-center", isCollapsed && "p-3")}>
           <UserButton
             appearance={{
               elements: {
                 avatarBox: "w-10 h-10 border border-white/10",
                 userButtonPopoverCard: "bg-abyssal border border-white/10 shadow-2xl",
                 userPreviewPrimaryIdentifier: "text-white font-bold text-sm",
                 userPreviewSecondaryIdentifier: "text-truffle text-xs",
               }
             }} 
           />
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-grow relative flex flex-col h-full overflow-hidden">
        {/* Mobile Nav */}
        <header className="lg:hidden h-24 bg-white border-b border-oatmeal/50 flex items-center justify-between px-6 shrink-0 z-30">
           <div className="flex items-center gap-3">
              <Link to="/" className="w-10 h-10 bg-abyssal rounded-xl flex items-center justify-center">
                <BrandLogo className="w-6 h-6 text-flame" />
              </Link>
              <Link to="/" className="font-black tracking-tighter text-xl text-abyssal uppercase">Invoicy</Link>
           </div>
           
           <div className="flex items-center gap-4">
              <UserButton />
           </div>
        </header>

        {/* Content Outlet */}
        <div className="flex-grow overflow-auto bg-palladian">
           <Outlet />
        </div>

        {/* Mobile Bottom Bar */}
        <nav className="lg:hidden h-24 bg-white border-t border-neutral-100 flex items-center justify-around px-6 shrink-0 pb-safe z-30 shadow-[0_-10px_25px_rgba(0,0,0,0.02)]">
           {navItems.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               end={item.path === '/app'}
               className={({ isActive }) => cn(
                 "flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all",
                 isActive ? "text-flame bg-flame/5" : "text-neutral-400 hover:text-abyssal"
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
