'use client';

import { useEffect, useRef, useState } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'ino-theme';

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(STORAGE_KEY, t); } catch {}
}

/**
 * Theme toggle pill with a cinematic L→R then R→L curtain wipe.
 * The curtain is rendered in the new theme's bg color and slides across
 * the viewport; theme swaps at the 50% mark (when the screen is fully
 * covered), so the new theme is "carried in" by the wipe.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const wipeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initial: Theme = 'dark';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') initial = stored;
    } catch {}
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const wipe = wipeRef.current;
    if (!wipe) {
      setTheme(next);
      applyTheme(next);
      return;
    }
    // Curtain renders in the destination theme's bg so it visually "carries"
    // the new theme across the screen.
    wipe.style.setProperty('--wipe-bg', next === 'light' ? '#FAFAFA' : '#0A0A0A');
    wipe.classList.remove('firing');
    void wipe.offsetWidth; // restart animation
    wipe.classList.add('firing');

    // Swap the theme at the midpoint of the 900ms animation, when the curtain
    // fully covers the screen — the uncover phase then reveals the new theme.
    window.setTimeout(() => {
      setTheme(next);
      applyTheme(next);
    }, 450);
  };

  // Avoid SSR/CSR mismatch: render a placeholder until after mount.
  if (!mounted) {
    return <div className={`w-[64px] h-8 ${className}`} aria-hidden />;
  }

  const isLight = theme === 'light';

  return (
    <>
      {/* Full-screen wipe overlay — sits above page content, below cursor */}
      <div ref={wipeRef} className="ino-theme-wipe" aria-hidden />

      <button
        onClick={toggle}
        aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        className={`hoverable relative inline-flex items-center gap-1 p-1 rounded-full border transition-colors
          ${isLight
            ? 'bg-black/[0.04] border-black/10 hover:border-black/20'
            : 'bg-white/[0.04] border-white/10 hover:border-white/20'}
          ${className}`}
      >
        {/* Sliding pill background */}
        <span
          aria-hidden
          className="absolute top-1 bottom-1 w-7 rounded-full bg-[#3A86FF] shadow-md shadow-[#3A86FF]/30 transition-transform duration-300 ease-out"
          style={{ transform: isLight ? 'translateX(28px)' : 'translateX(0px)' }}
        />

        {/* Moon (dark) */}
        <span className={`relative z-10 w-7 h-6 flex items-center justify-center transition-colors ${isLight ? 'text-black/50' : 'text-white'}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>

        {/* Sun (light) */}
        <span className={`relative z-10 w-7 h-6 flex items-center justify-center transition-colors ${isLight ? 'text-white' : 'text-white/50'}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </span>
      </button>
    </>
  );
}
