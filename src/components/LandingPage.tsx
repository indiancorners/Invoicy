import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, Zap, Layout, Target, Star, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { BrandLogo } from './BrandLogo';
import mascotImage from '../assets/images/regenerated_image_1778569549463.png';
import aboutImage from '../assets/images/regenerated_image_1778571099227.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Studio Landing Page Initialized");
  }, []);

  const features = [
    { 
      icon: <Zap className="text-flame" />, 
      title: "Engineered Speed", 
      desc: "Zero-latency live preview engine. Generate high-fidelity 300 DPI exports in absolute real-time." 
    },
    { 
      icon: <Layout className="text-blue" />, 
      title: "Agency Identities", 
      desc: "Curated collection of professional themes. Every layout is mathematically balanced for authority." 
    },
    { 
      icon: <Shield className="text-truffle" />, 
      title: "Privacy First", 
      desc: "Your data stays in your vault. Local-first architecture means your business remains your business." 
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$0",
      desc: "For individual creators",
      features: ["3 Studio Exports", "1 Base Identity Theme", "Standard Processing", "Local Data Vault"],
      button: "Start Creating",
      pro: false
    },
    {
      name: "Studio Pro",
      price: "$20",
      desc: "LIFETIME STUDIO ACCESS",
      features: ["Unlimited 300DPI Exports", "All 5 Agency Themes", "Client Portfolio Vault", "Priority Architecture Support", "Custom Identity Signatures"],
      button: "Unlock Full Studio",
      pro: true
    }
  ];

  const logos = [
    "STUDIO X", "MONO", "CRAFTER", "AGENCY", "PIXEL", "DESIGN", "MODERN", "ELITE", "VELOCITY", "QUARTZ", "NEON", "ALPHA"
  ];

  return (
    <div className="min-h-screen bg-palladian text-abyssal selection:bg-flame font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-abyssal/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group cursor-pointer hover:border-flame/50 transition-all">
            <BrandLogo className="w-6 h-6 text-flame group-hover:scale-110 transition-transform" />
          </Link>
          <Link to="/" className="font-bold tracking-tighter text-xl text-white uppercase">Invoicy</Link>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-flame transition-colors">Network</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-flame transition-colors">Mission</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-flame transition-colors">Pricing</a>
        </div>
        <button 
          type="button"
          onClick={() => navigate('/login')}
          className="bg-flame hover:bg-flame/90 text-abyssal px-8 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,177,98,0.2)] hover:shadow-[0_0_30px_rgba(255,177,98,0.4)] active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section - BOLD DARK VIBE */}
      <section className="pt-48 pb-32 px-6 md:px-12 relative overflow-hidden bg-abyssal text-white font-sans">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-flame/5 rounded-full blur-[180px] -mr-96 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue/10 rounded-full blur-[180px] -ml-96 -mb-48 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-flame mb-8 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-flame animate-pulse"></span>
                Engineered for Studios
              </div>
              <h1 className="text-6xl md:text-[88px] font-bold tracking-tighter mb-10 leading-[0.9] uppercase">
                Pro <br/>
                <span className="text-flame">Invoicing.</span>
              </h1>
              <p className="text-lg md:text-xl text-oatmeal/60 font-medium leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0">
                The high-performance billing engine for modern studios. Generate agency-grade invoices in seconds. No subscriptions. No noise. Just pure design.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group relative w-full sm:w-auto bg-white text-abyssal px-14 py-5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all overflow-hidden active:scale-95"
                >
                  <span className="relative z-10">Start Creating</span>
                  <div className="absolute inset-0 bg-flame translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <div className="flex -space-x-3 items-center">
                   {[
                     { seed: "felix", name: "Felix" },
                     { seed: "lisa", name: "Lisa" },
                     { seed: "alex", name: "Alex" },
                     { seed: "sophia", name: "Sophia" },
                     { seed: "marc", name: "Marc" }
                   ].map((u, i) => (
                       <motion.div 
                         key={i} 
                         whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                         className="w-12 h-12 rounded-full border-2 border-abyssal bg-palladian overflow-hidden shadow-xl"
                       >
                           <img 
                             referrerPolicy="no-referrer"
                             src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                             alt={u.name} 
                           />
                       </motion.div>
                   ))}
                   <div className="pl-6 flex flex-col">
                      <span className="text-[12px] font-black text-white uppercase tracking-widest">2.4k+ Teams</span>
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={8} className="text-flame fill-flame" />)}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* MASCOT SECTION */}
          <div className="flex-1 relative w-full lg:w-auto flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center"
            >
              {/* Hanging Icons */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-[20%] flex flex-col items-center"
                >
                  <div className="w-px h-24 bg-white/10"></div>
                  <div className="w-10 h-10 rounded-xl bg-abyssal/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                    <Zap size={16} className="text-flame" />
                  </div>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -15, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-0 right-[25%] flex flex-col items-center"
                >
                  <div className="w-px h-32 bg-white/10"></div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                    <Layout size={20} className="text-blue" />
                  </div>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 right-10 flex flex-col items-center"
                >
                  <div className="w-px h-16 bg-white/10"></div>
                  <div className="w-8 h-8 rounded-lg bg-abyssal border border-white/10 flex items-center justify-center shadow-2xl">
                    <Shield size={14} className="text-truffle" />
                  </div>
                </motion.div>
              </div>

              {/* The Mascot Body (Attached PNG Reference) */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <div className="absolute w-[80%] h-[80%] bg-flame/10 rounded-full blur-[100px]"></div>
                
                {/* 
                  NOTE: We are using the user-provided mascot image. 
                  The levitating motion is preserved.
                */}
                <img 
                  src={mascotImage} 
                  alt="Invoicy Mascot"
                  className="w-[120%] h-[120%] object-cover object-center relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] rounded-[2rem] border-4 border-white/10"
                  onError={(e) => {
                    // Fallback to high-quality placeholder if file is not found
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";
                  }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Decorative floating elements to match the PNG vibe */}
                <motion.div 
                  animate={{ y: [-10, 10], rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute top-[20%] right-[10%] text-flame/40"
                >
                  <Zap size={32} />
                </motion.div>
                
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-blue/20 rounded-full blur-xl"
                ></motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-24 bg-white overflow-hidden border-y border-oatmeal/30">
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center py-4">
            {Array(4).fill(logos).flat().map((logo, i) => (
              <span key={i} className="mx-16 text-4xl font-black tracking-[0.25em] text-abyssal/10 hover:text-flame transition-all duration-300 cursor-default uppercase hover:scale-110 inline-block">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - For Small Businesses & Startups */}
      <section id="about" className="py-48 px-6 md:px-12 bg-white font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
          <div className="flex-1">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter mb-10 leading-tight">
              Built for <br/>
              <span className="text-abyssal/30 font-black uppercase tracking-widest px-4 py-2 bg-palladian rounded-xl border border-oatmeal/40 inline-block mt-4">The Founders.</span>
            </h2>
            <div className="space-y-8 text-abyssal/60 font-medium leading-relaxed max-w-xl text-lg">
              <p>
                Invoicy was engineered for the innovators. We provide early-stage startups and boutique studios with the aesthetic weight of a global corporation, without the enterprise complexity.
              </p>
              <p>
                In a world of cluttered SaaS tools, we value precision over features. Our design-first approach ensures that your final client interaction is a masterclass in professionalism.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-2 gap-8 lg:gap-12 border-t border-oatmeal pt-12">
               <div>
                  <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">800+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Early Startups</p>
               </div>
               <div>
                  <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">25k+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Assets Exported</p>
               </div>
               <div>
                  <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">$10M+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Processed</p>
               </div>
               <div>
                  <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">100h+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Time Saved / Yr</p>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden border-[12px] border-palladian shadow-2xl">
                <img 
                  src={aboutImage} 
                  alt="Modern office" 
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 md:px-12 bg-palladian">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 uppercase">System Architecture.</h2>
             <p className="text-abyssal/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">We stripped away the noise. Invoicy is localized performance for teams who value design as much as function.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-12 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/20 hover:border-flame/30 hover:bg-white transition-all duration-500">
                <div className="w-14 h-14 bg-abyssal rounded-xl flex items-center justify-center mb-8 group-hover:bg-flame group-hover:text-abyssal transition-colors duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter">{f.title}</h3>
                <p className="text-sm text-abyssal/60 font-medium leading-[1.6]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 md:px-12 bg-abyssal text-palladian relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
             <h2 className="text-5xl font-bold tracking-tighter mb-6 uppercase">Access Tiers.</h2>
             <p className="text-oatmeal/60 font-medium max-w-xl mx-auto">Straightforward pricing for high-performing teams. No monthly fees, just results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((p, i) => (
              <div key={i} className={cn(
                "p-12 rounded-2xl border transition-all duration-700 relative flex flex-col group backdrop-blur-md",
                p.pro ? 'bg-white/5 border-flame/30 hover:bg-white/10' : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
              )}>
                {p.pro && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-flame text-abyssal text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-2xl">Agency Preferred</span>}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">{p.name}</h3>
                  <p className="text-oatmeal/40 text-[10px] font-bold uppercase tracking-widest">{p.desc}</p>
                </div>
                <div className="flex items-baseline gap-2 mb-12">
                   <span className="text-7xl font-bold tracking-tighter">{p.price}</span>
                   <span className="text-oatmeal/20 font-bold uppercase text-[10px] tracking-widest">/ Lifetime</span>
                </div>
                <div className="space-y-5 mb-16 flex-grow">
                   {p.features.map((f, j) => (
                     <div key={j} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-oatmeal/60 group-hover:text-oatmeal transition-colors">
                       <Check size={14} className={p.pro ? "text-flame" : "text-white/20"} />
                       {f}
                     </div>
                   ))}
                </div>
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className={cn(
                    "w-full py-5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl",
                    p.pro ? 'bg-flame text-abyssal hover:bg-[#ffbe7a]' : 'bg-white text-abyssal hover:bg-palladian'
                  )}
                >
                  {p.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-abyssal text-oatmeal/40 py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="flex items-center gap-3">
             <Link to="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
               <BrandLogo className="w-6 h-6 text-flame" />
             </Link>
             <Link to="/" className="font-bold tracking-tighter text-xl text-white uppercase">Invoicy</Link>
          </div>
          <div className="flex items-center gap-12 text-[9px] font-bold uppercase tracking-[0.2em]">
             <button onClick={() => navigate('/about')} className="hover:text-flame transition-colors uppercase">About</button>
             <button onClick={() => navigate('/privacy')} className="hover:text-flame transition-colors uppercase">Privacy</button>
             <button onClick={() => navigate('/terms')} className="hover:text-flame transition-colors uppercase">Terms</button>
             <a href="mailto:support@invoicy.studio" className="hover:text-flame transition-colors uppercase">Support</a>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">&copy; 2026 Invoicy Architecture.</p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
