'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PLANS,
  FEATURES,
  TESTIMONIALS,
  FAQ_DATA,
  COMPARISON_FEATURES,
  YEARLY_DISCOUNT,
  BEFORE_AFTER,
  PROBLEM_SOLUTION,
  MARQUEE_ITEMS,
} from '@/lib/platform-data';
import { CustomCursor } from '@/components/CustomCursor';

/* ── Scroll reveal ── */
function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: 0 | 1 | 2 | 3 | 4 }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${delay ? `reveal-delay-${delay}` : ''} ${className}`}>
      {children}
    </div>
  );
}

/* ── Animated counter ── */
function AnimatedNumber({ value }: { value: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(num)) { setDisplay(value); return; }
    const suffix = value.replace(/[0-9,]/g, '');
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.floor(ease * num).toLocaleString() + suffix);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(e.target);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{display}</span>;
}

/* ── Icons (minimal, monoline) ── */
const IconCheck = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconX = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconArrow = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

function FeatureIcon({ name }: { name: string }) {
  const c = "w-5 h-5";
  switch (name) {
    case 'cpu': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>;
    case 'zap': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'video': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" /></svg>;
    case 'alertCircle': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>;
    case 'heartPulse': return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 2.25 1.5 4.5 3 6l6 6 6-6c1.5-1.5 3-3.75 3-6z" /></svg>;
    default: return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path d="M3 3v18h18" strokeLinecap="round" /><path d="M7 14l4-4 4 4 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
}

/* ══════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                */
/* ══════════════════════════════════════════════════════════ */
export default function PlatformLandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="min-h-screen noise">
      <CustomCursor />

      {/* ══ NAV ══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0A0A0A]/85 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#3A86FF] flex items-center justify-center text-white font-black text-[10px] tracking-tight">INÖ</div>
            <span className="font-semibold text-white/90 text-sm tracking-tight">Platform</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-white/50 hover:text-white/90 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-white/50 hover:text-white/90 transition-colors">Pricing</Link>
            <Link href="/demo" className="text-sm text-white/50 hover:text-white/90 transition-colors">Demo</Link>
          </div>
          <Link href="/demo" className="px-4 py-2 rounded-md bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern" />
        {/* Ambient blue glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#3A86FF]/[0.04] blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#00B4D8]/[0.03] blur-[120px]" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/60 mb-10 tracking-wide">
              <span className="dot-accent" />
              For coaches scaling beyond 30 clients
            </div>
          </Reveal>

          <Reveal delay={1}>
            <h1 className="text-[2.75rem] sm:text-5xl md:text-[4.5rem] lg:text-[5.25rem] font-black tracking-[-0.035em] leading-[0.95] mb-8 text-white">
              The AI system that lets coaches scale to{' '}
              <span className="text-gradient">100+ clients</span>{' '}
              without losing personalization.
            </h1>
          </Reveal>

          <Reveal delay={2}>
            <p className="max-w-xl mx-auto text-base md:text-lg text-white/50 leading-relaxed mb-12">
              Automation that handles the busywork. Programs that feel custom. A business that finally scales — without burnout.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-24">
              <Link href="/demo" className="group flex items-center gap-2 px-7 py-3.5 rounded-md bg-[#3A86FF] text-white font-semibold text-sm hover:bg-[#5196FF] transition-all shadow-lg shadow-[#3A86FF]/20">
                Start Building Your System
                <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="#features" className="px-7 py-3.5 rounded-md border border-white/10 text-white/70 font-medium text-sm hover:border-white/25 hover:text-white transition-all">
                See How It Works
              </Link>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal delay={4}>
            <div className="grid grid-cols-3 gap-6 md:gap-16 max-w-3xl mx-auto pt-10 border-t border-white/[0.06]">
              {[
                { value: '2400', suffix: '+', label: 'Active Coaches' },
                { value: '10', suffix: 'x', label: 'Efficiency Gain' },
                { value: '100', suffix: '+', label: 'Clients / Coach' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-5xl font-black text-white tracking-tight stat-number">
                    <AnimatedNumber value={s.value + s.suffix} />
                  </div>
                  <div className="text-[11px] md:text-xs text-white/35 mt-2 uppercase tracking-[0.15em] font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-white/30 animate-bounce" />
          </div>
        </div>
      </section>

      <div className="glow-line w-full" />

      {/* ══ MARQUEE ══ */}
      <section className="py-6 border-y border-white/5 overflow-hidden bg-white/[0.012]">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-5 pr-5 shrink-0 text-white/25 font-semibold text-sm md:text-base uppercase tracking-[0.1em]">
              <span>{item}</span>
              <span className="text-[#3A86FF]">★</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PROBLEM → SOLUTION ══ */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-4">
            <Reveal>
              <div className="card-cinematic rounded-2xl p-10 h-full border-red-500/10 hover:border-red-500/20" style={{ borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-red-400/70 font-semibold mb-5">The Problem</div>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-5">
                  {PROBLEM_SOLUTION.problem.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {PROBLEM_SOLUTION.problem.desc}
                </p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="card-cinematic rounded-2xl p-10 h-full" style={{ borderColor: 'rgba(58, 134, 255, 0.2)', background: 'linear-gradient(180deg, rgba(58, 134, 255, 0.04), transparent)' }}>
                <div className="text-xs uppercase tracking-[0.2em] text-[#3A86FF] font-semibold mb-5">The System</div>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-5">
                  {PROBLEM_SOLUTION.solution.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {PROBLEM_SOLUTION.solution.desc}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[0.2em] text-[#3A86FF] font-semibold mb-4">Built for scale</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Every tool you need.<br />
                <span className="text-white/35">Nothing you don&apos;t.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="card-cinematic rounded-xl p-7 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#3A86FF]/10 border border-[#3A86FF]/20 flex items-center justify-center text-[#3A86FF] mb-5">
                    <FeatureIcon name={f.icon} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line w-full" />

      {/* ══ BEFORE / AFTER ══ */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[0.2em] text-[#3A86FF] font-semibold mb-4">The Transformation</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                From capped out<br />
                <span className="text-gradient">to operating at scale.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4">
            <Reveal>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-10 h-full">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40">{BEFORE_AFTER.before.label}</span>
                </div>
                <ul className="space-y-4">
                  {BEFORE_AFTER.before.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/50">
                      <IconX className="w-4 h-4 mt-0.5 text-white/25 flex-shrink-0" />
                      <span className="text-[15px] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="rounded-2xl border border-[#3A86FF]/25 bg-[#3A86FF]/[0.03] p-10 h-full glow-accent">
                <div className="flex items-center gap-2 mb-8">
                  <span className="dot-accent" />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#3A86FF]">{BEFORE_AFTER.after.label}</span>
                </div>
                <ul className="space-y-4">
                  {BEFORE_AFTER.after.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80">
                      <IconCheck className="w-4 h-4 mt-0.5 text-[#3A86FF] flex-shrink-0" />
                      <span className="text-[15px] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="glow-line w-full" />

      {/* ══ TRUST / SOCIAL PROOF ══ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-[#3A86FF] font-semibold mb-4">Real Coaches. Real Results.</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                Built by engineers<br />
                <span className="text-white/35">and coaches — not marketers.</span>
              </h2>
              <p className="text-white/40 text-base mt-6 max-w-lg mx-auto">
                Used by coaches managing 50–100+ clients across the US, UK, and EU.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="card-cinematic rounded-xl p-8 h-full flex flex-col">
                  <div className="inline-flex self-start px-2.5 py-1 rounded-md bg-[#3A86FF]/10 border border-[#3A86FF]/20 text-[11px] font-bold text-[#3A86FF] mb-6 tracking-wider uppercase">
                    {t.metric}
                  </div>
                  <p className="text-white/70 leading-relaxed flex-1 mb-8 text-[14px]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                    <div className="w-9 h-9 rounded-full bg-[#3A86FF]/10 border border-[#3A86FF]/15 flex items-center justify-center text-[#3A86FF] font-bold text-xs">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-white text-[13px] font-semibold">{t.name}</div>
                      <div className="text-white/35 text-[11px]">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line w-full" />

      {/* ══ PRICING ══ */}
      <section id="pricing" className="py-32 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#3A86FF] font-semibold mb-4">Pricing</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                Priced like software.<br />
                <span className="text-white/35">Not a membership.</span>
              </h2>
              <p className="text-white/40 text-base">No per-client fees. No surprise charges.</p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 text-xs text-white/40">
              {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-[#3A86FF]" /> {t}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="flex justify-center my-10">
              <div className="inline-flex bg-white/[0.03] border border-white/10 rounded-full p-1">
                {(['monthly', 'yearly'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setBillingCycle(c)}
                    className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                      billingCycle === c ? 'bg-white text-black' : 'text-white/45 hover:text-white/80'
                    }`}
                  >
                    {c === 'monthly' ? 'Monthly' : 'Yearly'}
                    {c === 'yearly' && <span className="ml-1.5 text-[#3A86FF] font-bold">−20%</span>}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan, i) => {
              const price = billingCycle === 'yearly' ? Math.round(plan.price * (1 - YEARLY_DISCOUNT)) : plan.price;
              return (
                <Reveal key={plan.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <div className={`rounded-2xl p-8 h-full flex flex-col ${
                    plan.popular ? 'pricing-popular border glow-accent' : 'card-cinematic'
                  }`}>
                    {plan.popular && (
                      <div className="inline-flex self-start px-2.5 py-1 rounded-md bg-[#3A86FF] text-[11px] font-bold text-white mb-4 tracking-wider uppercase">
                        Most Popular
                      </div>
                    )}
                    <div className="text-base font-bold text-white mb-1">{plan.name}</div>
                    <div className="text-sm text-white/45 mb-6">{plan.desc}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-black text-white tracking-tight">${price}</span>
                      <span className="text-white/35 font-medium text-sm">/mo</span>
                    </div>
                    <div className="text-sm text-white/40 mb-8">Up to {plan.clients}</div>
                    <Link
                      href="/demo"
                      className={`block w-full py-3 rounded-md text-center font-semibold text-sm transition-all mb-8 ${
                        plan.popular ? 'bg-[#3A86FF] text-white hover:bg-[#5196FF] shadow-lg shadow-[#3A86FF]/20' : 'bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.1]'
                      }`}
                    >
                      Start Free Trial
                    </Link>
                    <div className="space-y-3 flex-1">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-white/35 mb-3">Includes</div>
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-3">
                          <IconCheck className="w-3.5 h-3.5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                          <span className="text-[13px] text-white/65">{f}</span>
                        </div>
                      ))}
                      {plan.missing.map((f) => (
                        <div key={f} className="flex items-start gap-3 opacity-35">
                          <IconX className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="text-[13px] text-white/45">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON TABLE ══ */}
      <section className="py-20 px-6">
        <Reveal>
          <div className="max-w-5xl mx-auto">
            <h3 className="text-center text-2xl md:text-3xl font-black text-white mb-10 tracking-tight">Full feature comparison</h3>
            <div className="card-cinematic rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-white/[0.03] border-b border-white/[0.06] text-[10px] font-bold text-white/40 uppercase tracking-[0.12em]">
                <div>Feature</div>
                <div className="text-center">Starter</div>
                <div className="text-center text-[#3A86FF]">Pro</div>
                <div className="text-center">Scale</div>
              </div>
              {COMPARISON_FEATURES.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 gap-4 px-6 py-3.5 text-[13px] border-b border-white/[0.04] last:border-0 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                  <div className="text-white/65 font-medium">{row.name}</div>
                  {(['starter', 'pro', 'scale'] as const).map((plan) => {
                    const val = row[plan];
                    return (
                      <div key={plan} className="flex justify-center items-center">
                        {val === true ? (
                          <IconCheck className="w-4 h-4 text-[#3A86FF]" />
                        ) : val === false ? (
                          <IconX className="w-4 h-4 text-white/15" />
                        ) : (
                          <span className="font-semibold text-white/80 text-[13px]">{val}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <div className="glow-line w-full" />

      {/* ══ FAQ ══ */}
      <section className="py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-[#3A86FF] font-semibold mb-4">FAQ</p>
              <h2 className="text-4xl font-black text-white tracking-tight">Common questions</h2>
            </div>
          </Reveal>
          <div className="space-y-2">
            {FAQ_DATA.map((faq, i) => (
              <Reveal key={i}>
                <div className={`rounded-xl border overflow-hidden transition-all ${
                  openFaq === i ? 'border-[#3A86FF]/25 bg-[#3A86FF]/[0.02]' : 'border-white/[0.06]'
                }`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 flex justify-between items-center text-left">
                    <span className="font-semibold text-white/85 text-[15px]">{faq.q}</span>
                    <span className={`text-xl text-white/30 font-light transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${openFaq === i ? 'max-h-60' : 'max-h-0'}`}>
                    <p className="px-6 pb-6 text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A86FF]/[0.04] to-transparent" />
        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[0.95]">
              Stop trading your<br />
              <span className="text-gradient">time for clients.</span>
            </h2>
            <p className="text-lg text-white/45 max-w-lg mx-auto mb-12 leading-relaxed">
              Build a coaching business that scales with infrastructure — not with your hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/demo" className="group inline-flex items-center gap-3 px-8 py-4 rounded-md bg-[#3A86FF] text-white font-semibold text-base hover:bg-[#5196FF] transition-all shadow-lg shadow-[#3A86FF]/25">
                Start Building Your System
                <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-md border border-white/10 text-white/70 font-medium text-base hover:border-white/25 hover:text-white transition-all">
                See How It Works
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#3A86FF] flex items-center justify-center text-white font-black text-[9px]">INÖ</div>
            <span className="text-xs text-white/25">&copy; 2026 INÖ Platform. Engineered for scale.</span>
          </div>
          <div className="flex items-center gap-8 text-xs text-white/25">
            <Link href="#" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white/50 transition-colors">Status</Link>
            <Link href="#" className="hover:text-white/50 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
