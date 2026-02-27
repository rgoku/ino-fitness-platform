'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PLANS,
  FEATURES,
  TESTIMONIALS,
  FAQ_DATA,
  COMPARISON_FEATURES,
  YEARLY_DISCOUNT,
} from '@/lib/platform-data';

// Simple check icon for feature list
const Check = () => (
  <svg className="w-4 h-4 flex-shrink-0 text-platform-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const X = () => (
  <svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ArrowRight = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const colorMap: Record<string, string> = {
  primary: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  pink: 'bg-platform-pink/10 text-platform-pink border-platform-pink/20',
  danger: 'bg-platform-danger/10 text-platform-danger border-platform-danger/20',
  warning: 'bg-platform-warning/10 text-platform-warning border-platform-warning/20',
  success: 'bg-platform-success/10 text-platform-success border-platform-success/20',
  cyan: 'bg-platform-cyan/10 text-platform-cyan border-platform-cyan/20',
};

export default function PlatformLandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimIn(true));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafbfe] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#fafbfe]/90 backdrop-blur-xl border-b border-slate-200 px-6 md:px-12 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-platform-gradient flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30">
            INÖ
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
          >
            See Demo
          </Link>
          <Link
            href="/#pricing"
            className="px-5 py-2.5 rounded-lg bg-platform-gradient text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:opacity-95 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-platform-pink/5 blur-3xl pointer-events-none" />
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-sm font-semibold mb-7 transition-all duration-600 ${
            animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <span>💪</span> Professional-Grade Coaching Platform
        </div>
        <h1
          className={`max-w-3xl mx-auto text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 transition-all duration-700 delay-100 ${
            animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          Built for coaches who{' '}
          <span className="bg-platform-gradient bg-clip-text text-transparent">care about their clients</span> — and their time.
        </h1>
        <p
          className={`max-w-xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed mb-11 transition-all duration-700 delay-200 ${
            animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          INÖ helps coaches grow their roster while staying present, organized, and responsive — so every client still feels coached, not managed.
        </p>
        <div
          className={`flex justify-center gap-12 mb-6 transition-all duration-700 delay-300 ${
            animIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[
            { value: '2,400+', label: 'Active Coaches' },
            { value: '94%', label: 'Client Retention' },
            { value: '50,000+', label: 'Programs Delivered' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for how coaches actually work
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-md mx-auto">
            Every feature exists to save you time or keep your clients accountable. Nothing extra.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[f.color] || colorMap.primary} border`}
              >
                <span className="text-xl">{f.icon === 'dumbbell' ? '💪' : f.icon === 'video' ? '🎬' : f.icon === 'alertCircle' ? '⚠️' : f.icon === 'zap' ? '⚡' : f.icon === 'heartPulse' ? '❤️' : '📊'}</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mb-2">{f.title}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Two apps CTA */}
      <section className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
        <div className="bg-slate-900 rounded-3xl p-12 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-platform-pink/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-10 items-center relative">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-5">
                Two apps.<br />One seamless system.
              </h3>
              <p className="text-slate-400 text-base leading-relaxed mb-7">
                You get the coach dashboard on web. Your clients get INÖ Fit on mobile. Everything syncs in real time — workouts, check-ins, messages, progress.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">🖥️</div>
                  <div>
                    <div className="text-white font-bold text-sm">INÖ Coach</div>
                    <div className="text-slate-500 text-xs">Web dashboard</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-platform-pink/20 flex items-center justify-center text-platform-pink">📱</div>
                  <div>
                    <div className="text-white font-bold text-sm">INÖ Fit</div>
                    <div className="text-slate-500 text-xs">Client mobile app</div>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/demo"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-platform-gradient text-white font-bold text-base shadow-xl shadow-indigo-500/40 hover:opacity-95 transition"
            >
              Launch Live Demo <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Coaches who made the switch
          </h2>
          <p className="mt-4 text-slate-500 text-lg">Real results from real coaching businesses</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col relative">
              <div className={`absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold ${colorMap[t.color]}`}>
                {t.metric}
              </div>
              <div className="text-4xl text-slate-200 font-serif leading-none mb-2">&ldquo;</div>
              <p className="text-slate-600 leading-relaxed flex-1 mb-6">{t.quote}</p>
              <div className="flex items-center gap-3 pt-5 border-t border-slate-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${colorMap[t.color]}`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ROI strip */}
      <section className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
        <div className="bg-platform-gradient rounded-2xl p-10 md:p-11 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="text-sm text-white/80 font-semibold mb-1">Do the math</div>
            <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              $249/mo ÷ 50 clients = $4.98/client
            </div>
            <div className="text-white/90 mt-2">
              One retained client pays for a full year of INÖ.
            </div>
          </div>
          <div className="relative bg-white/15 backdrop-blur rounded-2xl px-7 py-5 border border-white/20 text-center">
            <div className="text-4xl font-extrabold text-white">247x</div>
            <div className="text-xs text-white/90 font-semibold">Average ROI</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-12 py-20 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pricing that scales with you
          </h2>
          <p className="mt-4 text-slate-500 text-lg">No per-client fees. No hidden costs. Just the tools to grow.</p>
        </div>
        <div className="flex justify-center gap-6 mb-8">
          {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((text, i) => (
            <div key={i} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <Check /> {text}
            </div>
          ))}
        </div>
        <div className="inline-flex bg-slate-100 rounded-xl p-1 border border-slate-200 mx-auto flex justify-center mb-8">
          {(['monthly', 'yearly'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setBillingCycle(c)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === c
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {c === 'monthly' ? 'Monthly' : 'Yearly'}
              {c === 'yearly' && <span className="ml-1.5 text-xs text-platform-success font-bold">Save 20%</span>}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? Math.round(plan.price * (1 - YEARLY_DISCOUNT)) : plan.price;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl overflow-hidden border-2 relative ${
                  plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-500/15 scale-[1.02]' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-platform-gradient px-3.5 py-1 rounded-full text-[11px] font-bold text-white tracking-wide">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <div className="text-lg font-bold text-slate-900 mb-1">{plan.name}</div>
                  <div className="text-sm text-slate-500 mb-6">{plan.desc}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">${price}</span>
                    <span className="text-slate-400 font-medium">/mo</span>
                  </div>
                  <div className="text-sm text-slate-500 mb-7">Up to {plan.clients}</div>
                  <Link
                    href="/demo"
                    className={`block w-full py-3.5 rounded-xl text-center font-bold text-sm transition ${
                      plan.popular
                        ? 'bg-platform-gradient text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    Start 14-Day Free Trial
                  </Link>
                </div>
                <div className="px-8 pb-8">
                  <div className="text-sm font-bold text-slate-900 mb-3">What&apos;s included:</div>
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 mb-2.5">
                      <Check />
                      <span className="text-sm text-slate-600">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 mb-2.5 opacity-40">
                      <X />
                      <span className="text-sm text-slate-400">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
        <h3 className="text-center text-xl font-bold text-slate-900 mb-8">Full feature comparison</h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b-2 border-slate-200 text-sm font-bold text-slate-500">
            <div>FEATURE</div>
            <div className="text-center">STARTER</div>
            <div className="text-center text-indigo-600">PRO</div>
            <div className="text-center">SCALE</div>
          </div>
          {COMPARISON_FEATURES.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-4 gap-4 px-6 py-3.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <div className="text-slate-600 font-medium">{row.name}</div>
              {(['starter', 'pro', 'scale'] as const).map((plan) => {
                const val = row[plan];
                return (
                  <div key={plan} className="flex justify-center items-center">
                    {val === true ? (
                      <div className="w-6 h-6 rounded-full bg-platform-success/10 flex items-center justify-center">
                        <Check />
                      </div>
                    ) : val === false ? (
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <X />
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-900">{val}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 py-16 max-w-2xl mx-auto">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {FAQ_DATA.map((faq, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border overflow-hidden transition ${
                openFaq === i ? 'border-indigo-500/30' : 'border-slate-200'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 flex justify-between items-center text-left"
              >
                <span className="font-semibold text-slate-900">{faq.q}</span>
                <span className={`text-2xl text-slate-400 font-light transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-48' : 'max-h-0'}`}>
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 md:px-12 py-12 text-center">
        <div className="bg-slate-900 rounded-3xl py-16 px-8 max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 relative">
            Stop coaching like it&apos;s 2019
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto mb-9 leading-relaxed relative">
            Your clients deserve a real app. Your business deserves real infrastructure. INÖ is the platform that makes both happen.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-platform-gradient text-white font-bold text-lg px-10 py-4 rounded-xl shadow-xl shadow-indigo-500/40 hover:opacity-95 transition relative"
          >
            Launch Demo <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
