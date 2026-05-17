import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Eye, Layers, Lock, Star, ChevronDown, FileText, Download, Clock, Users, TrendingUp, Layout } from 'lucide-react';
import { cn } from '../lib/utils';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '@clerk/clerk-react';
import aboutImage from '../assets/images/regenerated_image_1778571099227.png';

const ease = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-56px' },
    transition: { duration: 0.8, ease, delay },
  };
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    console.log("Studio Landing Page Initialized");
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const ctaTarget = isSignedIn === true ? '/app' : '/login';
  const ctaLabel = isSignedIn === true ? 'Go to Dashboard' : 'Start Creating';

  const features = [
    {
      icon: <Eye className="text-accent" />,
      title: "Instant Live Preview",
      desc: "See your invoice update in real-time as you type. Zero lag. What you see is exactly what exports."
    },
    {
      icon: <Layers className="text-accent" />,
      title: "5 Professional Themes",
      desc: "From minimalist to corporate — every layout is precision-crafted for authority and client confidence."
    },
    {
      icon: <Lock className="text-accent" />,
      title: "Your Data is Yours",
      desc: "Local-first architecture with optional cloud sync. Your business details never leave without your say."
    }
  ];

  const steps = [
    {
      number: "01",
      icon: <FileText size={28} className="text-accent" />,
      title: "Fill Your Details",
      desc: "Set up your business profile once. It auto-fills on every invoice — your name, logo, address, and tax ID are always ready."
    },
    {
      number: "02",
      icon: <Layout size={28} className="text-accent" />,
      title: "Pick a Design",
      desc: "Choose from 5 agency-grade invoice designs. Toggle live preview to see exactly how your client will receive it."
    },
    {
      number: "03",
      icon: <Download size={28} className="text-accent" />,
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
    <div className="min-h-screen bg-[#FAFAFA] text-foreground selection:bg-accent/20 font-sans">
      {/* Navigation — scroll-aware frosted glass */}
      <header
        className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-xl flex items-center justify-center border bg-foreground/5 border-border hover:border-accent/40 group cursor-pointer transition-all">
            <BrandLogo className="w-5 h-5 group-hover:scale-110 transition-transform" onDark={false} />
          </Link>
          <Link
            to="/"
            className="font-semibold tracking-tight text-foreground"
            style={{ fontSize: '15px' }}
          >
            Invoicy
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('how-it-works')} className="text-[13px] text-muted hover:text-foreground transition-colors">How It Works</button>
          <button onClick={() => scrollTo('features')} className="text-[13px] text-muted hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo('about')} className="text-[13px] text-muted hover:text-foreground transition-colors">About</button>
          <button onClick={() => scrollTo('pricing')} className="text-[13px] text-muted hover:text-foreground transition-colors">Pricing</button>
        </div>
        {isSignedIn === true ? (
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="rounded-full h-8 px-4 text-[13px] font-medium hover:opacity-80 transition-all flex items-center gap-1.5 bg-[#1D1D1F] text-white"
          >
            Dashboard <ArrowRight size={12} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full h-8 px-4 text-[13px] font-medium hover:opacity-80 transition-all bg-[#1D1D1F] text-white"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-36 px-6 md:px-12 relative overflow-hidden bg-white font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-border text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Invoice in minutes, not hours
            </div>
            <h1
              className="font-extrabold mb-6 text-foreground leading-[1.05]"
              style={{ fontSize: 'clamp(44px,7.5vw,92px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: '1.05' }}
            >
              Look Like<br />
              <span className="text-accent">A Pro.</span><br />
              <span className="text-foreground/25">Get Paid Faster.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
              Stop losing hours to spreadsheets and Word templates. Invoicy generates agency-quality invoices in under 60 seconds — with live preview, 5 professional designs, and one-click PDF export.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                type="button"
                onClick={() => navigate(ctaTarget)}
                className="rounded-full bg-[#1D1D1F] text-white h-12 px-8 text-[14px] font-semibold hover:opacity-80 transition-opacity active:scale-95 w-full sm:w-auto"
              >
                {ctaLabel}
              </button>
              <button
                type="button"
                onClick={() => scrollTo('how-it-works')}
                className="flex items-center gap-2 text-muted hover:text-foreground transition-colors text-[14px] font-medium"
              >
                See how it works <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
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
                    className="w-10 h-10 rounded-full border-2 border-white bg-[#F5F5F7] overflow-hidden shadow-md"
                  >
                    <img
                      referrerPolicy="no-referrer"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                      alt={u.name}
                    />
                  </motion.div>
                ))}
                <div className="pl-5 flex flex-col text-left">
                  <span className="text-[12px] font-semibold text-foreground">2,400+ freelancers</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className="text-accent fill-accent" />)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-muted text-[13px] font-medium">
                <span className="flex items-center gap-1.5"><Clock size={12} /> 60-sec setup</span>
                <span className="flex items-center gap-1.5"><TrendingUp size={12} /> $10M+ invoiced</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 md:px-12 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-6">
              Simple by design
            </div>
            <h2
              className="font-bold mb-4 text-foreground"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              Done in 3 Steps.
            </h2>
            <p className="text-muted max-w-xl mx-auto font-medium text-lg">No learning curve. No manual. Your first professional invoice is 60 seconds away.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-border" />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.12)}
                className="relative flex flex-col items-center md:items-start text-center md:text-left p-8 rounded-2xl bg-white"
              >
                <div className="w-14 h-14 bg-[#F5F5F7] rounded-2xl border border-border flex items-center justify-center mb-6 shadow-sm relative z-10">
                  {step.icon}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-3">{step.number}</span>
                <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">{step.title}</h3>
                <p className="text-sm text-muted font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-16 bg-[#1D1D1F] overflow-hidden border-y border-white/5">
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center py-4">
            {Array(4).fill(logos).flat().map((logo, i) => (
              <span key={i} className="mx-16 text-3xl font-black tracking-[0.25em] text-white/10 hover:text-white/30 transition-all duration-300 cursor-default uppercase hover:scale-110 inline-block">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 md:px-12 bg-white font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-8">
              Our story
            </div>
            <h2
              className="font-bold mb-10 text-foreground leading-tight"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              Built for<br />
              <span className="text-foreground">Modern Businesses.</span>
            </h2>
            <div className="space-y-6 text-muted font-medium leading-relaxed max-w-xl text-lg">
              <p>
                Invoicy was built because billing software was stuck in 2005. We believed freelancers, agencies, and small businesses deserved tools that looked as professional as their work.
              </p>
              <p>
                We stripped away the subscription tiers, the bloated dashboards, and the ugly exports. What remained is a precision tool: fast, beautiful, and permanently yours for $20.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 lg:gap-12 border-t border-border pt-12">
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-foreground">2,400+</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-placeholder">Businesses & Freelancers</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-foreground">25k+</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-placeholder">Invoices Exported</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-foreground">$10M+</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-placeholder">Revenue Processed</p>
              </div>
              <div>
                <p className="text-4xl lg:text-5xl font-black mb-2 text-foreground">60s</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-placeholder">Avg. Invoice Created</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-square lg:aspect-[4/5] rounded-[2rem] overflow-hidden border-[12px] border-[#F5F5F7] shadow-2xl">
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
      <section id="features" className="py-32 px-6 md:px-12 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-6">
              What you get
            </div>
            <h2
              className="font-bold mb-6 text-foreground"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              Why Invoicy.
            </h2>
            <p className="text-muted max-w-2xl mx-auto font-medium text-lg leading-relaxed">Everything you need to invoice professionally. Nothing you don't.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="group p-8 rounded-2xl bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center mb-8">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tight text-foreground">{f.title}</h3>
                <p className="text-sm text-muted font-medium leading-[1.7]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 md:px-12 bg-[#1D1D1F] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-6 flex items-center justify-center gap-2">
              <Users size={12} /> 2,400+ users worldwide
            </div>
            <h2
              className="font-bold text-white"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              Real People.<br />Real Results.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col"
              >
                <div className="flex gap-1 mb-6">
                  {Array(t.stars).fill(0).map((_, s) => (
                    <Star key={s} size={12} className="text-accent fill-accent" />
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
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[13px] text-[#6E6E73]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 md:px-12 bg-[#F5F5F7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-placeholder mb-6">
              Honest pricing
            </div>
            <h2
              className="font-bold mb-6 text-foreground"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              No Subscriptions.<br />Ever.
            </h2>
            <p className="text-muted font-medium max-w-xl mx-auto text-lg">One price. Lifetime access. No gotchas, no paywalls after year one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((p, i) => (
              <div
                key={i}
                className={cn(
                  "p-12 rounded-2xl relative flex flex-col",
                  p.pro
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-white border border-[#D2D2D7]'
                )}
              >
                {p.pro && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                    Most Popular
                  </span>
                )}
                <div className="mb-12">
                  <h3 className={cn("text-2xl font-bold mb-2 tracking-tight", p.pro ? "text-white" : "text-foreground")}>{p.name}</h3>
                  <p className={cn("text-[11px] font-semibold uppercase tracking-widest", p.pro ? "text-white/40" : "text-placeholder")}>{p.desc}</p>
                </div>
                <div className="flex items-baseline gap-2 mb-12">
                  <span className={cn("text-7xl font-bold tracking-tighter", p.pro ? "text-white" : "text-foreground")}>{p.price}</span>
                  <span className={cn("font-medium text-[13px]", p.pro ? "text-white/30" : "text-muted")}>/ Lifetime</span>
                </div>
                <div className="space-y-5 mb-16 flex-grow">
                  {p.features.map((f, j) => (
                    <div key={j} className={cn("flex items-center gap-4 text-[13px] font-medium", p.pro ? "text-white/70" : "text-muted")}>
                      <Check size={14} className={p.pro ? "text-accent" : "text-accent"} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ctaTarget)}
                  className={cn(
                    "w-full h-12 rounded-full font-semibold text-[14px] transition-opacity active:scale-95 hover:opacity-80",
                    p.pro ? 'bg-white text-[#1D1D1F]' : 'bg-[#1D1D1F] text-white'
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
            <h2
              className="font-bold mb-4 text-foreground"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              Questions?<br />Answered.
            </h2>
            <p className="text-muted font-medium text-lg">Everything you need to make a confident decision.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-[#F5F5F7] transition-colors"
                >
                  <span className="font-semibold text-base tracking-tight text-foreground pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={18} className="text-muted" />
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
                      <div className="px-8 pb-6 text-muted font-medium leading-relaxed border-t border-border pt-5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-muted font-medium text-sm mb-4">Still have questions?</p>
            <a href="mailto:support@invoicy.studio" className="text-accent font-semibold text-sm hover:underline">support@invoicy.studio</a>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-36 px-6 md:px-12 bg-[#1D1D1F] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <h2
              className="font-bold text-white mb-6"
              style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.035em' }}
            >
              Ready to Invoice<br />Like a Pro?
            </h2>
            <p className="text-white/50 font-medium text-lg mb-10">Join 2,400+ businesses that bill with confidence. Free to start. $20 to own forever.</p>
            <button
              type="button"
              onClick={() => navigate(ctaTarget)}
              className="rounded-full bg-white text-[#1D1D1F] h-12 px-8 font-semibold text-[14px] hover:opacity-80 transition-opacity active:scale-95 inline-flex items-center gap-2"
            >
              {ctaLabel} <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D1D1F] text-[#6E6E73] py-20 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
            <div className="flex items-center gap-3">
              <Link to="/" className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <BrandLogo className="w-5 h-5" onDark={true} />
              </Link>
              <Link to="/" className="font-semibold tracking-tight text-white" style={{ fontSize: '15px' }}>Invoicy</Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <button onClick={() => scrollTo('how-it-works')} className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollTo('features')} className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollTo('pricing')} className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">Pricing</button>
              <button onClick={() => navigate('/about')} className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">About</button>
              <button onClick={() => navigate('/privacy')} className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">Privacy</button>
              <button onClick={() => navigate('/terms')} className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">Terms</button>
              <a href="mailto:support@invoicy.studio" className="text-[13px] text-[#6E6E73] hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-[#6E6E73]">&copy; 2026 Invoicy. All rights reserved.</p>
            <p className="text-[13px] text-white/20">Engineered for modern businesses.</p>
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
