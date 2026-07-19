'use client';

/**
 * Premium muscle heatmap with inspector panel.
 * Anatomy paths: react-native-body-highlighter (MIT © Hicham ELABBASSI)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pipette } from 'lucide-react';
import {
  BODY,
  MUSCLE_LABELS,
  type MuscleSlug,
  type BodyView,
  type MuscleVolume,
} from './core';

type ThemeId = 'red' | 'electric' | 'cyan' | 'violet' | 'emerald' | 'custom';

const RAINBOW =
  'conic-gradient(from 0deg, #ef4444, #f59e0b, #fde047, #22c55e, #14b8a6, #3b82f6, #8b5cf6, #ec4899, #ef4444)';

// --- color helpers ----------------------------------------------------------
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(v * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function scaleFromHex(hex: string): { max: number; color: string }[] {
  const { h, s, l } = hexToHsl(hex);
  return [
    // Low end still readable against the dark body silhouette — bump lightness/saturation floor.
    { max: 5,        color: hslToHex(h, Math.max(45, s * 0.75), Math.max(32, Math.min(42, l * 0.6))) },
    { max: 10,       color: hslToHex(h, Math.max(55, s * 0.9),  Math.max(45, Math.min(58, l * 0.85))) },
    { max: 18,       color: hex },
    { max: Infinity, color: hslToHex(h, Math.min(100, s * 0.95), Math.min(82, l * 1.3 + 10)) },
  ];
}

interface Theme {
  id: ThemeId;
  label: string;
  swatch: string;
  scale: { max: number; color: string }[];
  accent: string;
  glow: string;
  trackFill: string;
}

const THEMES: Theme[] = [
  {
    id: 'red',
    label: 'Heat',
    swatch: '#ff3b30',
    accent: '#ff3b30',
    glow: 'rgba(255, 59, 48, 0.45)',
    trackFill: '#ff3b30',
    scale: [
      { max: 5, color: '#8a3a3f' },
      { max: 10, color: '#c64238' },
      { max: 18, color: '#ee4a3a' },
      { max: Infinity, color: '#ff7a55' },
    ],
  },
  {
    id: 'electric',
    label: 'Electric',
    swatch: '#3A86FF',
    accent: '#3A86FF',
    glow: 'rgba(58, 134, 255, 0.5)',
    trackFill: '#3A86FF',
    scale: [
      { max: 5, color: '#3a5a92' },
      { max: 10, color: '#4575d6' },
      { max: 18, color: '#3A86FF' },
      { max: Infinity, color: '#7eb0ff' },
    ],
  },
  {
    id: 'cyan',
    label: 'Cyan',
    swatch: '#00B4D8',
    accent: '#00B4D8',
    glow: 'rgba(0, 180, 216, 0.5)',
    trackFill: '#00B4D8',
    scale: [
      { max: 5, color: '#2a6376' },
      { max: 10, color: '#1c93b3' },
      { max: 18, color: '#00B4D8' },
      { max: Infinity, color: '#5bd9eb' },
    ],
  },
  {
    id: 'violet',
    label: 'Violet',
    swatch: '#8b5cf6',
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.5)',
    trackFill: '#8b5cf6',
    scale: [
      { max: 5, color: '#5b4191' },
      { max: 10, color: '#7250c8' },
      { max: 18, color: '#8b5cf6' },
      { max: Infinity, color: '#b69bfa' },
    ],
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#10B981',
    accent: '#10B981',
    glow: 'rgba(16, 185, 129, 0.5)',
    trackFill: '#10B981',
    scale: [
      { max: 5, color: '#2a6a55' },
      { max: 10, color: '#149e72' },
      { max: 18, color: '#10B981' },
      { max: Infinity, color: '#5ce0a8' },
    ],
  },
];

// Locked dark surface — independent of platform light/dark theme.
const SURFACE = {
  outer: '#0A0E16',
  stage: '#0E1320',
  panel: '#0B0F1A',
  panel2: '#141A28',
  line: '#1E2535',
  ink: '#F1F5F9',
  ink2: '#CBD5E1',
  muted: '#64748B',
  mutedSoft: '#475569',
  body: '#1F2633',
  edge: '#3A4358',
  muscleRest: '#323B4D',
  muscleEdge: '#475063',
  up: '#10B981',
  down: '#EF4444',
};

interface Props {
  thisWeek: MuscleVolume;
  lastWeek: MuscleVolume;
  defaultTheme?: ThemeId;
}

export function MuscleHeatmapPro({ thisWeek, lastWeek, defaultTheme = 'emerald' }: Props) {
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<MuscleSlug>('quadriceps');
  const [working, setWorking] = useState<MuscleVolume>(thisWeek);
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [customHex, setCustomHex] = useState<string>('#ff3b30');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const theme = useMemo<Theme>(() => {
    if (themeId === 'custom') {
      return {
        id: 'custom',
        label: 'Custom',
        swatch: customHex,
        accent: customHex,
        glow: hexToRgba(customHex, 0.5),
        trackFill: customHex,
        scale: scaleFromHex(customHex),
      };
    }
    return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  }, [themeId, customHex]);

  useEffect(() => setWorking(thisWeek), [thisWeek]);

  // Close palette popover on outside click
  useEffect(() => {
    if (!paletteOpen) return;
    const onDown = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [paletteOpen]);

  const colorFor = (value: number | undefined): string => {
    if (!value || value <= 0) return SURFACE.muscleRest;
    for (const step of theme.scale) if (value <= step.max) return step.color;
    return theme.scale[theme.scale.length - 1].color;
  };

  const side = BODY[view];
  const sel = selected;
  const thisVal = working[sel] ?? 0;
  const lastVal = lastWeek[sel] ?? 0;
  const delta = thisVal - lastVal;
  const maxBar = Math.max(thisVal, lastVal, 10);
  const recovery = Math.max(0, Math.min(100, Math.round(100 - (thisVal / 25) * 100)));

  const top = useMemo(() => {
    return (Object.entries(working) as [MuscleSlug, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [working]);

  const sim = (preset: 'legday' | 'push' | 'pull' | 'reset') => {
    if (preset === 'reset') return setWorking(thisWeek);
    const add: Record<typeof preset, Partial<MuscleVolume>> = {
      legday: { quadriceps: 8, hamstring: 6, gluteal: 5, calves: 4 },
      push: { chest: 6, triceps: 5, deltoids: 4, abs: 2 },
      pull: { 'upper-back': 6, biceps: 4, 'lower-back': 3, forearm: 2 },
    };
    setWorking((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(add[preset])) {
        next[k as MuscleSlug] = (next[k as MuscleSlug] ?? 0) + (v ?? 0);
      }
      return next;
    });
  };

  return (
    <div
      className="muscleHM-wrap"
      style={{
        ['--accent' as any]: theme.accent,
        ['--accent-glow' as any]: theme.glow,
      }}
    >
      <style>{`
        .muscleHM-wrap {
          background: ${SURFACE.outer};
          border: 1px solid ${SURFACE.line};
          border-radius: 18px;
          overflow: hidden;
          color: ${SURFACE.ink};
        }

        /* Top bar — centered title, palette button right */
        .muscleHM-topbar {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          padding: 14px 16px;
          border-bottom: 1px solid ${SURFACE.line};
          background: ${SURFACE.panel};
        }
        .muscleHM-title {
          font-weight: 600; font-size: 12px;
          letter-spacing: .28em; text-transform: uppercase;
          color: ${SURFACE.ink2};
        }
        .muscleHM-palette {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
        }
        .muscleHM-palette-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${SURFACE.panel2};
          border: 1px solid ${SURFACE.line};
          color: ${SURFACE.ink2};
          font-size: 11px; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 5px 11px 5px 5px;
          border-radius: 999px;
          cursor: pointer; transition: .15s;
        }
        .muscleHM-palette-btn:hover {
          border-color: var(--accent);
          color: ${SURFACE.ink};
        }
        .muscleHM-palette-btn .wheel {
          width: 22px; height: 22px; border-radius: 999px;
          background: ${RAINBOW};
          position: relative;
          box-shadow:
            inset 0 0 0 2px ${SURFACE.panel2},
            0 0 0 1px ${SURFACE.line};
        }
        .muscleHM-palette-btn .wheel::after {
          content: '';
          position: absolute; inset: 7px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 0 2px ${SURFACE.panel2};
        }
        .muscleHM-palette-btn .label-text {
          font-size: 10px;
        }

        .muscleHM-palette-pop {
          position: absolute; right: 0; top: calc(100% + 8px);
          padding: 12px;
          background: ${SURFACE.panel};
          border: 1px solid ${SURFACE.line};
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,.5);
          z-index: 20;
          min-width: 220px;
        }
        .muscleHM-pop-title {
          font-size: 10px; font-weight: 600;
          letter-spacing: .18em; text-transform: uppercase;
          color: ${SURFACE.muted};
          margin-bottom: 10px;
        }
        .muscleHM-pop-presets {
          display: flex; gap: 8px;
          margin-bottom: 14px;
        }
        .muscleHM-pop-presets button {
          width: 28px; height: 28px; border-radius: 999px;
          border: 2px solid transparent;
          cursor: pointer; padding: 0;
          transition: .15s;
          position: relative;
        }
        .muscleHM-pop-presets button:hover { transform: scale(1.1); }
        .muscleHM-pop-presets button.on {
          border-color: ${SURFACE.ink};
          box-shadow: 0 0 0 2px ${SURFACE.panel}, 0 0 0 3px var(--accent);
        }

        .muscleHM-pop-divider {
          height: 1px; background: ${SURFACE.line};
          margin: 0 -12px 12px;
        }

        .muscleHM-pop-custom-row {
          display: flex; align-items: center; gap: 10px;
        }
        .muscleHM-pop-swatch {
          width: 28px; height: 28px; border-radius: 999px;
          background: ${RAINBOW};
          position: relative;
          cursor: pointer;
          border: 2px solid ${SURFACE.line};
          flex-shrink: 0;
          transition: .15s;
        }
        .muscleHM-pop-swatch:hover { transform: scale(1.05); }
        .muscleHM-pop-swatch.on {
          border-color: ${SURFACE.ink};
          box-shadow: 0 0 0 2px ${SURFACE.panel}, 0 0 0 3px var(--accent);
        }
        .muscleHM-pop-swatch::after {
          content: '';
          position: absolute; inset: 6px;
          border-radius: 999px;
          background: var(--custom-color, ${RAINBOW});
          ${'' /* fallback */}
        }
        .muscleHM-pop-custom-label {
          flex: 1;
          font-size: 12px; font-weight: 600;
          color: ${SURFACE.ink};
        }
        .muscleHM-pop-custom-hex {
          font-size: 10px; font-weight: 500;
          color: ${SURFACE.muted};
          font-variant-numeric: tabular-nums;
          letter-spacing: .02em;
          text-transform: uppercase;
          margin-top: 1px;
        }
        .muscleHM-pop-pipette {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: ${SURFACE.panel2};
          border: 1px solid ${SURFACE.line};
          border-radius: 8px;
          color: ${SURFACE.ink2};
          cursor: pointer; transition: .15s;
        }
        .muscleHM-pop-pipette:hover {
          border-color: var(--accent);
          color: ${SURFACE.ink};
        }
        .muscleHM-color-input {
          position: absolute; opacity: 0;
          width: 1px; height: 1px;
          pointer-events: none;
        }

        /* Body of the widget — left stage / right inspector */
        .muscleHM-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: ${SURFACE.line};
        }
        @media (max-width: 720px) { .muscleHM-body { grid-template-columns: 1fr; } }

        .muscleHM-stage {
          background: ${SURFACE.stage};
          padding: 18px 16px 18px;
        }
        .muscleHM-toggle-wrap { display: flex; justify-content: center; }
        .muscleHM-toggle {
          display: inline-flex; background: ${SURFACE.panel};
          border: 1px solid ${SURFACE.line}; border-radius: 999px;
          padding: 3px;
        }
        .muscleHM-toggle button {
          font-weight: 600; letter-spacing: .04em; font-size: 11px;
          color: ${SURFACE.muted}; background: none; border: none; cursor: pointer;
          padding: 6px 20px; border-radius: 999px; transition: .2s;
        }
        .muscleHM-toggle button.on {
          background: var(--accent); color: #fff;
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        .muscleHM-figure {
          display: flex; justify-content: center; align-items: center;
          margin-top: 14px;
        }
        .muscleHM-figure svg { height: 440px; width: auto; max-width: 100%; }
        .muscleHM-figure svg path.m {
          cursor: pointer;
          stroke: ${SURFACE.muscleEdge};
          stroke-width: 0.6;
          paint-order: stroke;
          transition: fill .35s ease, filter .2s ease;
        }
        .muscleHM-figure svg path.m:hover {
          filter: drop-shadow(0 0 6px var(--accent-glow));
        }
        .muscleHM-figure svg path.sel {
          stroke: ${SURFACE.ink}; stroke-width: 4; paint-order: stroke;
        }

        .muscleHM-legend {
          display: flex; align-items: center; justify-content: center;
          margin-top: 10px; gap: 10px;
        }
        .muscleHM-scale { display: flex; }
        .muscleHM-scale .sw { width: 30px; height: 8px; }
        .muscleHM-scale .sw:first-child { border-radius: 3px 0 0 3px; }
        .muscleHM-scale .sw:last-child { border-radius: 0 3px 3px 0; }
        .muscleHM-legend small {
          color: ${SURFACE.muted}; font-size: 10px;
          letter-spacing: .12em; text-transform: uppercase; font-weight: 600;
        }

        /* Right panel — inspector */
        .muscleHM-panel {
          background: ${SURFACE.panel};
          padding: 24px 24px 22px;
          display: flex; flex-direction: column;
        }
        .muscleHM-eyebrow {
          font-weight: 600; font-size: 10px; letter-spacing: .22em;
          text-transform: uppercase; color: ${SURFACE.muted};
        }
        .muscleHM-selname {
          margin-top: 6px;
          font-weight: 800;
          font-size: 38px;
          line-height: 1;
          letter-spacing: -0.025em;
          color: ${SURFACE.ink};
          text-transform: capitalize;
        }
        .muscleHM-selsub {
          margin-top: 6px;
          color: ${SURFACE.muted}; font-size: 12px;
          letter-spacing: .01em;
        }

        .muscleHM-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
          background: ${SURFACE.line};
          border: 1px solid ${SURFACE.line};
          border-radius: 14px; overflow: hidden;
          margin-top: 18px;
        }
        .muscleHM-stat {
          background: ${SURFACE.panel2};
          padding: 14px 16px;
        }
        .muscleHM-stat .k {
          font-size: 10px; letter-spacing: .16em; text-transform: uppercase;
          color: ${SURFACE.muted}; font-weight: 600;
        }
        .muscleHM-stat .v {
          font-weight: 700; font-size: 30px;
          font-variant-numeric: tabular-nums;
          margin-top: 4px; color: ${SURFACE.ink};
          letter-spacing: -0.025em;
          line-height: 1;
        }
        .muscleHM-stat .v small {
          font-size: 12px; color: ${SURFACE.muted};
          font-weight: 600; margin-left: 4px;
          letter-spacing: 0;
        }
        .muscleHM-up { color: ${SURFACE.up} !important; }
        .muscleHM-down { color: ${SURFACE.down} !important; }

        .muscleHM-section { margin-top: 20px; }
        .muscleHM-section-title {
          font-weight: 600; font-size: 10px; letter-spacing: .18em;
          text-transform: uppercase; color: ${SURFACE.muted};
          margin-bottom: 10px;
        }
        .muscleHM-barrow {
          display: flex; align-items: center; gap: 12px; margin: 7px 0;
        }
        .muscleHM-barrow .lab {
          width: 76px; font-size: 11px; color: ${SURFACE.ink2};
          font-weight: 600; letter-spacing: .02em;
        }
        .muscleHM-barrow .track {
          flex: 1; height: 7px; background: ${SURFACE.panel2};
          border-radius: 999px; overflow: hidden;
        }
        .muscleHM-barrow .fill {
          height: 100%; border-radius: 999px;
          transition: width .5s ease;
        }
        .muscleHM-barrow .num {
          width: 28px; text-align: right;
          font-variant-numeric: tabular-nums;
          font-size: 12px; font-weight: 700;
          color: ${SURFACE.ink};
        }

        .muscleHM-rec { margin-top: auto; padding-top: 20px; }
        .muscleHM-rec .row {
          display: flex; justify-content: space-between; align-items: baseline;
        }
        .muscleHM-rec .hint {
          color: ${SURFACE.ink2}; font-size: 12px;
          font-weight: 600; letter-spacing: .02em;
        }
        .muscleHM-rec .pct {
          font-weight: 800; font-size: 22px;
          font-variant-numeric: tabular-nums;
          color: ${SURFACE.ink};
          letter-spacing: -0.02em;
        }
        .muscleHM-rec .track {
          height: 7px; background: ${SURFACE.panel2};
          border-radius: 999px; margin-top: 8px; overflow: hidden;
        }
        .muscleHM-rec .fill {
          height: 100%;
          background: linear-gradient(90deg, ${SURFACE.down}, #f59e0b, ${SURFACE.up});
          border-radius: 999px; transition: width .5s;
        }

        .muscleHM-sim {
          margin-top: 14px;
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .muscleHM-sim button {
          font-weight: 600; font-size: 11px; letter-spacing: .04em;
          background: ${SURFACE.panel2}; color: ${SURFACE.ink2};
          border: 1px solid ${SURFACE.line}; border-radius: 8px;
          padding: 7px 11px; cursor: pointer; transition: .15s;
        }
        .muscleHM-sim button:hover {
          border-color: var(--accent);
          color: ${SURFACE.ink};
          background: ${SURFACE.panel};
        }

        .muscleHM-attr {
          margin-top: 14px; font-size: 9px;
          color: ${SURFACE.mutedSoft};
          letter-spacing: .02em;
        }
      `}</style>

      {/* TOP BAR — centered title + palette button on the right */}
      <div className="muscleHM-topbar">
        <span className="muscleHM-title">Muscle Heatmap</span>
        <div className="muscleHM-palette" ref={paletteRef}>
          <button
            className="muscleHM-palette-btn"
            onClick={() => setPaletteOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={paletteOpen}
            aria-label="Change color theme"
          >
            <span className="wheel" />
            <span className="label-text">Color</span>
          </button>
          {paletteOpen && (
            <div className="muscleHM-palette-pop" role="menu">
              <div className="muscleHM-pop-title">Theme</div>
              <div className="muscleHM-pop-presets">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={t.id === themeId ? 'on' : ''}
                    style={{ background: t.swatch }}
                    title={t.label}
                    aria-label={`${t.label} theme`}
                    onClick={() => {
                      setThemeId(t.id);
                      setPaletteOpen(false);
                    }}
                  />
                ))}
              </div>

              <div className="muscleHM-pop-divider" />

              <div className="muscleHM-pop-title">Custom</div>
              <div className="muscleHM-pop-custom-row">
                <div
                  className={`muscleHM-pop-swatch ${themeId === 'custom' ? 'on' : ''}`}
                  style={{ ['--custom-color' as any]: themeId === 'custom' ? customHex : undefined }}
                  onClick={() => colorInputRef.current?.click()}
                  role="button"
                  aria-label="Pick custom color"
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="muscleHM-pop-custom-label">Pick any color</div>
                  <div className="muscleHM-pop-custom-hex">
                    {themeId === 'custom' ? customHex.toUpperCase() : 'Click swatch'}
                  </div>
                </div>
                <button
                  className="muscleHM-pop-pipette"
                  onClick={() => colorInputRef.current?.click()}
                  aria-label="Open color picker"
                  title="Open color picker"
                >
                  <Pipette size={14} />
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  className="muscleHM-color-input"
                  value={customHex}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    setThemeId('custom');
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="muscleHM-body">
        {/* LEFT: stage */}
        <div className="muscleHM-stage">
          <div className="muscleHM-toggle-wrap">
            <div className="muscleHM-toggle">
              <button className={view === 'front' ? 'on' : ''} onClick={() => setView('front')}>Front</button>
              <button className={view === 'back' ? 'on' : ''} onClick={() => setView('back')}>Back</button>
            </div>
          </div>

          <div className="muscleHM-figure">
            <svg viewBox={side.viewBox} xmlns="http://www.w3.org/2000/svg">
              <path d={side.outline} fill={SURFACE.body} stroke={SURFACE.edge} strokeWidth={1.5} />
              {side.muscles.map((m) => {
                const slug = m.slug as MuscleSlug;
                const isSelected = slug === selected;
                const fill = colorFor(working[slug]);
                return (
                  <g key={m.slug}>
                    {m.paths.map((d, i) => (
                      <path
                        key={i}
                        d={d}
                        className={`m ${isSelected ? 'sel' : ''}`}
                        fill={fill}
                        onClick={() => setSelected(slug)}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="muscleHM-legend">
            <div className="muscleHM-scale">
              {theme.scale.map((s, i) => (
                <div key={i} className="sw" style={{ background: s.color }} />
              ))}
            </div>
            <small>Light → Heavy</small>
          </div>
        </div>

        {/* RIGHT: panel */}
        <div className="muscleHM-panel">
          <div className="muscleHM-eyebrow">Muscle Detail</div>
          <div className="muscleHM-selname">{MUSCLE_LABELS[selected] ?? selected}</div>
          <div className="muscleHM-selsub">Tap any muscle to inspect</div>

          <div className="muscleHM-stats">
            <div className="muscleHM-stat">
              <div className="k">Sets · this wk</div>
              <div className="v">{thisVal}</div>
            </div>
            <div className="muscleHM-stat">
              <div className="k">vs last wk</div>
              <div className={`v ${delta >= 0 ? 'muscleHM-up' : 'muscleHM-down'}`}>
                {delta >= 0 ? '+' : ''}{delta}
                <small>sets</small>
              </div>
            </div>
          </div>

          <div className="muscleHM-section">
            <div className="muscleHM-barrow">
              <div className="lab">This wk</div>
              <div className="track">
                <div className="fill" style={{ background: theme.trackFill, width: `${(thisVal / maxBar) * 100}%` }} />
              </div>
              <div className="num">{thisVal}</div>
            </div>
            <div className="muscleHM-barrow">
              <div className="lab">Last wk</div>
              <div className="track">
                <div className="fill" style={{ background: SURFACE.mutedSoft, opacity: .7, width: `${(lastVal / maxBar) * 100}%` }} />
              </div>
              <div className="num">{lastVal}</div>
            </div>
          </div>

          {top.length > 0 && (
            <div className="muscleHM-section">
              <div className="muscleHM-section-title">Top trained · this wk</div>
              {top.map(([slug, v]) => (
                <div key={slug} className="muscleHM-barrow">
                  <div className="lab" style={{ width: 88 }}>{MUSCLE_LABELS[slug] ?? slug}</div>
                  <div className="track">
                    <div className="fill" style={{ background: colorFor(v), width: `${(v / top[0][1]) * 100}%` }} />
                  </div>
                  <div className="num">{v}</div>
                </div>
              ))}
            </div>
          )}

          <div className="muscleHM-rec">
            <div className="row">
              <span className="hint">Recovery</span>
              <span className="pct">{recovery}%</span>
            </div>
            <div className="track">
              <div className="fill" style={{ width: `${recovery}%` }} />
            </div>
            <div className="muscleHM-sim">
              <button onClick={() => sim('legday')}>+ Leg Day</button>
              <button onClick={() => sim('push')}>+ Push</button>
              <button onClick={() => sim('pull')}>+ Pull</button>
              <button onClick={() => sim('reset')}>Reset</button>
            </div>
            <div className="muscleHM-attr">
              Anatomy paths: react-native-body-highlighter (MIT © Hicham ELABBASSI)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
