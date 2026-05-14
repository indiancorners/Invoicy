import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Zap, Layout, Shield, Star, ChevronDown, FileText, Send, Download, Clock, Users, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '@clerk/clerk-react';
import mascotImage from '../assets/images/regenerated_image_1778569549463.png';
import aboutImage from '../assets/images/regenerated_image_1778571099227.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    console.log("Studio Landing Page Initialized");
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const ctaTarget = isSignedIn === true ? '/app' : '/login';
  const ctaLabel = isSignedIn === true ? 'Go to Dashboard' : 'Start Creating';

  const features = [
    {
      icon: <Zap className="text-flame" />,
      title: "Instant Live Preview",
      desc: "See your invoice update in real-time as you type. Zero lag. What you see is exactly what exports."
    },
    {
      icon: <Layout className="text-blue" />,
      title: "5 Professional Themes",
      desc: "From minimalist to corporate — every layout is precision-crafted for authority and client confidence."
    },
    {
      icon: <Shield className="text-truffle" />,
      title: "Your Data is Yours",
      desc: "Local-first architecture with optional cloud sync. Your business details never leave without your say."
    }
  ];

  const steps = [
    {
      number: "01",
      icon: <FileText size={28} className="text-flame" />,
      title: "Fill Your Details",
      desc: "Set up your business profile once. It auto-fills on every invoice — your name, logo, address, and tax ID are always ready."
    },
    {
      number: "02",
      icon: <Layout size={28} className="text-blue" />,
      title: "Pick a Design",
      desc: "Choose from 5 agency-grade invoice designs. Toggle live preview to see exactly how your client will receive it."
    },
    {
      number: "03",
      icon: <Download size={28} className="text-truffle" />,
      title: "Export & Send",
      desc: "Download a 300 DPI PDF or PNG, or share via a professional public link. Done in under 60 seconds."
    }
  ];

  const testimonials = [
    {
      seed: "sarah",
      name: "Sarah Kowalski",
      role: "Brand Designer, Freelance",
      quote: "I used to spend 30 minutes on every invoice. Now it takes me 2 minutes and looks 10x more professional. My clients actually compliment my invoices.",
      stars: 5
    },
    {
      seed: "james",
      name: "James Okonkwo",
      role: "Co-founder, Pixel Studio",
      quote: "The $20 lifetime deal was a no-brainer. We've invoiced over $200k through Invoicy. The corporate theme is exactly what enterprise clients expect.",
      stars: 5
    },
    {
      seed: "mei",
      name: "Mei Lin",
      role: "Video Producer & Editor",
      quote: "Finally an invoicing tool that doesn't look like it's from 2009. The PDF quality is incredible — crisp, clean, and branded exactly how I want.",
      stars: 5
    }
  ];

  const faqs = [
    {
      q: "Is the free plan really free?",
      a: "Yes — no credit card, no trial period. The free plan includes 1 complete invoice with full export capabilities. It's a real invoice, not a watermarked demo."
    },
    {
      q: "How does the $20 lifetime deal work?",
      a: "You pay once, you own it forever. No monthly fees, no annual renewals. All future theme updates and features are included. The $20 price won't last — it increases as we add more."
    },
    {
      q: "Can I add my own logo and signature?",
      a: "Absolutely. Upload your business logo (PNG/JPG) and draw or upload a signature. Both appear natively on every theme and export at full resolution."
    },
    {
      q: "Is my invoice data secure?",
      a: "Your business data is stored encrypted in Supabase (enterprise-grade PostgreSQL). We use Clerk for authentication. You can also export everything locally — your data is never held hostage."
    },
    {
      q: "What export formats are supported?",
      a: "PDF (A4, 300 DPI, ready to print or email) and PNG (high-res raster). Both are generated client-side — no server processing of your invoice content."
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$0",
      desc: "For individual creators",
      features: ["1 Full Invoice Export", "1 Base Theme (Minimalist)", "PDF & PNG Export", "Shareable Public Link", "Local Data Storage"],
      button: isSignedIn === true ? "Go to Dashboard" : "Start Free",
      pro: false
    },
    {
      name: "Studio Pro",
      price: "$20",
      desc: "LIFETIME STUDIO ACCESS",
      features: ["Unlimited Invoice Exports", "All 5 Professional Themes", "Business Logo & Signature", "Priority Support", "Cloud Sync via Supabase"],
      button: isSignedIn === true ? "Go to Dashboard" : "Unlock Pro — $20 Once",
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
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-flame transition-colors">How It Works</button>
          <button onClick={() => scrollTo('features')} className="hover:text-flame transition-colors">Features</button>
          <button onClick={() => scrollTo('about')} className="hover:text-flame transition-colors">About</button>
          <button onClick={() => scrollTo('pricing')} className="hover:text-flame transition-colors">Pricing</button>
        </div>
        {isSignedIn === true ? (
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="bg-flame hover:bg-flame/90 text-abyssal px-8 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,177,98,0.2)] hover:shadow-[0_0_30px_rgba(255,177,98,0.4)] active:scale-95 flex items-center gap-2"
          >
            Dashboard <ArrowRight size={12} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-flame hover:bg-flame/90 text-abyssal px-8 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,177,98,0.2)] hover:shadow-[0_0_30px_rgba(255,177,98,0.4)] active:scale-95"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero Section */}
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
                Invoice in minutes, not hours
              </div>
              <h1 className="text-6xl md:text-[80px] font-bold tracking-tighter mb-6 leading-[0.9] uppercase">
                Look Like<br/>
                <span className="text-flame">A Pro.</span><br/>
                <span className="text-white/30">Get Paid Faster.</span>
              </h1>
              <p className="text-lg md:text-xl text-oatmeal/60 font-medium leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0">
                Stop losing hours to spreadsheets and Word templates. Invoicy generates agency-quality invoices in under 60 seconds — with live preview, 5 professional designs, and one-click PDF export.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <button
                  type="button"
                  onClick={() => navigate(ctaTarget)}
                  className="group relative w-full sm:w-auto bg-white text-abyssal px-14 py-5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all overflow-hidden active:scale-95"
                >
                  <span className="relative z-10">{ctaLabel}</span>
                  <div className="absolute inset-0 bg-flame translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  See how it works <ArrowRight size={14} />
                </button>
              </div>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
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
                      className="w-10 h-10 rounded-full border-2 border-abyssal bg-palladian overflow-hidden shadow-xl"
                    >
                      <img
                        referrerPolicy="no-referrer"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                        alt={u.name}
                      />
                    </motion.div>
                  ))}
                  <div className="pl-5 flex flex-col">
                    <span className="text-[12px] font-black text-white uppercase tracking-widest">2,400+ freelancers</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className="text-flame fill-flame" />)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Clock size={10} /> 60-sec setup</span>
                  <span className="flex items-center gap-1.5"><TrendingUp size={10} /> $10M+ invoiced</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mascot Section */}
          <div className="flex-1 relative w-full lg:w-auto flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center"
            >
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

              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <div className="absolute w-[80%] h-[80%] bg-flame/10 rounded-full blur-[100px]"></div>
                <img
                  src={mascotImage}
                  alt="Invoicy Mascot"
                  className="w-[120%] h-[120%] object-cover object-center relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] rounded-[2rem] border-4 border-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";
                  }}
                  referrerPolicy="no-referrer"
                />
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

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 md:px-12 bg-white border-y border-oatmeal/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-flame/10 border border-flame/20 text-[10px] font-bold uppercase tracking-widest text-truffle mb-6">
              Simple by design
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">Done in 3 Steps.</h2>
            <p className="text-abyssal/50 max-w-xl mx-auto font-medium text-lg">No learning curve. No manual. Your first professional invoice is 60 seconds away.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-oatmeal/30"></div>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center md:items-start text-center md:text-left p-10 rounded-2xl bg-palladian border border-oatmeal/30"
              >
                <div className="w-14 h-14 bg-white rounded-2xl border border-oatmeal/30 flex items-center justify-center mb-6 shadow-sm relative z-10">
                  {step.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-oatmeal mb-3">{step.number}</span>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm text-abyssal/55 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-16 bg-abyssal overflow-hidden border-y border-white/5">
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center py-4">
            {Array(4).fill(logos).flat().map((logo, i) => (
              <span key={i} className="mx-16 text-3xl font-black tracking-[0.25em] text-white/10 hover:text-flame transition-all duration-300 cursor-default uppercase hover:scale-110 inline-block">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-48 px-6 md:px-12 bg-white font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-abyssal/5 border border-oatmeal/30 text-[10px] font-bold uppercase tracking-widest text-abyssal/50 mb-8">
              Our story
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter mb-10 leading-tight">
              Built for<br/>
              <span className="text-abyssal/30 font-black uppercase tracking-widest px-4 py-2 bg-palladian rounded-xl border border-oatmeal/40 inline-block mt-4">Modern Businesses.</span>
            </h2>
            <div className="space-y-6 text-abyssal/60 font-medium leading-relaxed max-w-xl text-lg">
              <p>
                Invoicy was built because billing software was stuck in 2005. We believed freelancers, agencies, and small businesses deserved tools that looked as professional as their work.
              </p>
              <p>
                We stripped away the subscription tiers, the bloated dashboards, and the ugly exports. What remained is a precision tool: fast, beautiful, and permanently yours for $20.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 lg:gap-12 border-t border-oatmeal pt-12">
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">2,400+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Businesses & Freelancers</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">25k+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Invoices Exported</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">$10M+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Revenue Processed</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-abyssal">60s</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Avg. Invoice Created</p>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-abyssal/5 border border-oatmeal/30 text-[10px] font-bold uppercase tracking-widest text-abyssal/50 mb-6">
              What you get
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 uppercase">Why Invoicy.</h2>
            <p className="text-abyssal/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">Everything you need to invoice professionally. Nothing you don't.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-12 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/20 hover:border-flame/30 hover:bg-white transition-all duration-500"
              >
                <div className="w-14 h-14 bg-abyssal rounded-xl flex items-center justify-center mb-8 group-hover:bg-flame group-hover:text-abyssal transition-colors duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter">{f.title}</h3>
                <p className="text-sm text-abyssal/60 font-medium leading-[1.7]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 md:px-12 bg-abyssal text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-flame mb-6">
              <Users size={10} /> 2,400+ users worldwide
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">Real People.<br/>Real Results.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all flex flex-col"
              >
                <div className="flex gap-1 mb-6">
                  {Array(t.stars).fill(0).map((_, s) => (
                    <Star key={s} size={12} className="text-flame fill-flame" />
                  ))}
                </div>
                <p className="text-white/70 font-medium leading-relaxed text-sm flex-1 mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-white/5 overflow-hidden">
                    <img
                      referrerPolicy="no-referrer"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                      alt={t.name}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 md:px-12 bg-palladian relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-abyssal/5 border border-oatmeal/30 text-[10px] font-bold uppercase tracking-widest text-abyssal/50 mb-6">
              Honest pricing
            </div>
            <h2 className="text-5xl font-bold tracking-tighter mb-6 uppercase">No Subscriptions.<br/>Ever.</h2>
            <p className="text-abyssal/60 font-medium max-w-xl mx-auto text-lg">One price. Lifetime access. No gotchas, no paywalls after year one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((p, i) => (
              <div key={i} className={cn(
                "p-12 rounded-2xl border transition-all duration-700 relative flex flex-col group",
                p.pro
                  ? 'bg-abyssal text-white border-flame/30 hover:border-flame/60 shadow-[0_0_60px_rgba(255,177,98,0.1)]'
                  : 'bg-white border-oatmeal/30 hover:border-oatmeal/60'
              )}>
                {p.pro && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-flame text-abyssal text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-2xl">Most Popular</span>}
                <div className="mb-12">
                  <h3 className={cn("text-2xl font-bold mb-2 uppercase tracking-tighter", p.pro ? "text-white" : "text-abyssal")}>{p.name}</h3>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", p.pro ? "text-oatmeal/50" : "text-abyssal/30")}>{p.desc}</p>
                </div>
                <div className="flex items-baseline gap-2 mb-12">
                  <span className={cn("text-7xl font-bold tracking-tighter", p.pro ? "text-white" : "text-abyssal")}>{p.price}</span>
                  <span className={cn("font-bold uppercase text-[10px] tracking-widest", p.pro ? "text-oatmeal/20" : "text-abyssal/20")}>/ Lifetime</span>
                </div>
                <div className="space-y-5 mb-16 flex-grow">
                  {p.features.map((f, j) => (
                    <div key={j} className={cn("flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest", p.pro ? "text-oatmeal/60 group-hover:text-oatmeal" : "text-abyssal/50 group-hover:text-abyssal/70", "transition-colors")}>
                      <Check size={14} className={p.pro ? "text-flame" : "text-abyssal/30"} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ctaTarget)}
                  className={cn(
                    "w-full py-5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                    p.pro ? 'bg-flame text-abyssal hover:bg-[#ffbe7a]' : 'bg-abyssal text-white hover:bg-abyssal/80'
                  )}
                >
                  {p.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">Questions?<br/>Answered.</h2>
            <p className="text-abyssal/50 font-medium text-lg">Everything you need to make a confident decision.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-oatmeal/30 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-palladian/50 transition-colors"
                >
                  <span className="font-bold text-base tracking-tight pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={18} className="text-abyssal/40" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6 text-abyssal/60 font-medium leading-relaxed border-t border-oatmeal/20 pt-5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-abyssal/40 font-medium text-sm mb-4">Still have questions?</p>
            <a href="mailto:support@invoicy.studio" className="text-flame font-bold text-sm hover:underline">support@invoicy.studio</a>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 px-6 md:px-12 bg-abyssal text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 uppercase">Ready to Invoice<br/>Like a Pro?</h2>
          <p className="text-oatmeal/50 font-medium text-lg mb-10">Join 2,400+ businesses that bill with confidence. Free to start. $20 to own forever.</p>
          <button
            type="button"
            onClick={() => navigate(ctaTarget)}
            className="group relative bg-flame text-abyssal px-16 py-5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all overflow-hidden active:scale-95 shadow-[0_0_40px_rgba(255,177,98,0.3)] hover:shadow-[0_0_60px_rgba(255,177,98,0.5)]"
          >
            {ctaLabel} <ArrowRight size={16} className="inline ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-abyssal text-oatmeal/40 py-20 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
            <div className="flex items-center gap-3">
              <Link to="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <BrandLogo className="w-6 h-6 text-flame" />
              </Link>
              <Link to="/" className="font-bold tracking-tighter text-xl text-white uppercase">Invoicy</Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-[9px] font-bold uppercase tracking-[0.2em]">
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-flame transition-colors">How It Works</button>
              <button onClick={() => scrollTo('features')} className="hover:text-flame transition-colors">Features</button>
              <button onClick={() => scrollTo('pricing')} className="hover:text-flame transition-colors">Pricing</button>
              <button onClick={() => navigate('/about')} className="hover:text-flame transition-colors">About</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-flame transition-colors">Privacy</button>
              <button onClick={() => navigate('/terms')} className="hover:text-flame transition-colors">Terms</button>
              <a href="mailto:support@invoicy.studio" className="hover:text-flame transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest">&copy; 2026 Invoicy. All rights reserved.</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Engineered for modern businesses.</p>
          </div>
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
