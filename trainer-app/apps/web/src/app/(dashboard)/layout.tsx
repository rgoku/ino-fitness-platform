'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { CommandPalette } from '@/components/command-palette';
import { OnboardingTour } from '@/components/onboarding-tour';
import { QuickActionsFAB } from '@/components/quick-actions-fab';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Cmd+K / Ctrl+K always works (even while typing)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }

      if (isTyping) return;

      // Single-letter shortcuts (only when not typing)
      switch (e.key) {
        case '/': e.preventDefault(); setPaletteOpen(true); break;
        case 'c': router.push('/clients/onboard'); break;
        case 'p': router.push('/programs/builder'); break;
        case 's': router.push('/programs/session'); break;
        case 'm': router.push('/messages'); break;
        case 'd': router.push('/nutrition'); break;
        case 'q': router.push('/questionnaires/new'); break;
        case 'g': router.push('/'); break; // g = go home
        case '?':
          alert('⌘K / / — Command palette\nC — Add client\nP — AI program builder\nS — Start session\nM — Messages\nD — Nutrition\nG — Go home');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenCommandPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[var(--color-surface-secondary)]">
          <div className="mx-auto max-w-[1120px] px-6 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <OnboardingTour />
      <QuickActionsFAB onOpenCommandPalette={() => setPaletteOpen(true)} />
    </div>
  );
}
