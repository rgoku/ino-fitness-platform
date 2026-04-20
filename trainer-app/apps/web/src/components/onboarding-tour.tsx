'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus, Dumbbell, CreditCard, Rocket, ArrowRight, ArrowLeft,
  X, Check, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'Welcome to INÖ',
    subtitle: "Let's get you set up in 4 quick steps.",
    icon: Sparkles,
    body: (
      <div className="space-y-3 text-body-sm text-[var(--color-text-secondary)]">
        <p>The world&apos;s most efficient coaching platform. Here&apos;s what you can do:</p>
        <ul className="space-y-2">
          {['Manage up to 100 clients', 'AI-generated workout + diet plans', 'Accept payments via Stripe', 'Track PRs, compliance, and revenue'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={14} className="text-brand-500" /> {item}
            </li>
          ))}
        </ul>
      </div>
    ),
    cta: { label: "Let's go", href: null },
  },
  {
    title: 'Add your first client',
    subtitle: 'Use the onboarding wizard to collect goals, injuries, and preferences.',
    icon: UserPlus,
    body: (
      <div className="space-y-3">
        <p className="text-body-sm text-[var(--color-text-secondary)]">
          The 6-step wizard gathers everything needed to generate a personalized AI plan.
        </p>
        <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-body-xs text-[var(--color-text-tertiary)]">
          Tip: Press <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1">⌘K</kbd> then <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1">C</kbd> to add a client from anywhere.
        </div>
      </div>
    ),
    cta: { label: 'Add Client', href: '/clients/onboard' },
  },
  {
    title: 'Create your first program',
    subtitle: 'Use the AI builder or browse the marketplace.',
    icon: Dumbbell,
    body: (
      <div className="space-y-3">
        <p className="text-body-sm text-[var(--color-text-secondary)]">
          Type exercises naturally (&quot;bench 4x8, squat 5x5&quot;) and AI will enrich them with coaching cues, muscle groups, and video demos.
        </p>
        <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
          <p className="text-body-xs font-mono text-[var(--color-text-secondary)]">bench press 4x8 @RPE8</p>
          <p className="text-body-xs font-mono text-[var(--color-text-secondary)]">squat 5x5 - pause at bottom</p>
        </div>
      </div>
    ),
    cta: { label: 'Open AI Builder', href: '/programs/builder' },
  },
  {
    title: 'Set up payments',
    subtitle: 'Connect Stripe to charge clients directly through INÖ.',
    icon: CreditCard,
    body: (
      <div className="space-y-3">
        <p className="text-body-sm text-[var(--color-text-secondary)]">
          Three plans pre-configured — Starter ($129), Pro ($249), Scale ($399). Clients check out via Stripe Checkout.
        </p>
        <div className="rounded-lg bg-brand-50/50 dark:bg-brand-900/20 border border-brand-500/20 p-3 text-body-xs text-[var(--color-text-primary)]">
          💡 You keep 80% of every client&apos;s subscription. INÖ takes 20% platform fee.
        </div>
      </div>
    ),
    cta: { label: 'Configure Stripe', href: '/settings' },
  },
  {
    title: "You're ready 🚀",
    subtitle: 'Time to coach.',
    icon: Rocket,
    body: (
      <div className="space-y-3 text-body-sm text-[var(--color-text-secondary)]">
        <p>You&apos;ve got everything you need. A few pro tips:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs">⌘K</kbd>
            <span>Open command palette — jump anywhere instantly</span>
          </li>
          <li className="flex items-start gap-2">
            <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs">/</kbd>
            <span>Focus search from anywhere</span>
          </li>
          <li className="flex items-start gap-2">
            <kbd className="shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs">?</kbd>
            <span>Show all keyboard shortcuts</span>
          </li>
        </ul>
      </div>
    ),
    cta: { label: 'Start coaching', href: '/' },
  },
];

const STORAGE_KEY = 'ino_onboarding_completed';

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';
    if (!completed) {
      // Show after a brief delay so dashboard animates in first
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const complete = () => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  const next = () => {
    if (step === STEPS.length - 1) complete();
    else setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!open) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-overlay animate-scale-in overflow-hidden">
        {/* Close */}
        <button
          onClick={complete}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] transition-colors z-10"
        >
          <X size={14} />
        </button>

        {/* Step progress */}
        <div className="flex gap-1.5 px-6 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i === step ? 'bg-brand-500' : i < step ? 'bg-brand-500/40' : 'bg-[var(--color-surface-tertiary)]'
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 shadow-lg">
              <current.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-body-xs font-medium text-brand-500 uppercase tracking-wider">
                Step {step + 1} of {STEPS.length}
              </p>
              <p className="text-heading-3 text-[var(--color-text-primary)]">{current.title}</p>
            </div>
          </div>

          <p className="text-body-sm text-[var(--color-text-secondary)]">{current.subtitle}</p>

          <div className="py-2">{current.body}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border-light)] px-6 py-4 bg-[var(--color-surface-secondary)]">
          <Button variant="ghost" size="sm" onClick={prev} disabled={isFirst} icon={<ArrowLeft size={14} />}>
            Back
          </Button>
          <div className="flex gap-2">
            {!isLast && current.cta.href && (
              <Link href={current.cta.href} onClick={complete}>
                <Button variant="secondary" size="md">
                  {current.cta.label}
                </Button>
              </Link>
            )}
            <Button variant="primary" size="md" onClick={next}>
              {isLast ? current.cta.label : 'Next'}
              {!isLast && <ArrowRight size={14} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
