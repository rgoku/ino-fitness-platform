'use client';

/**
 * Premium muscle heatmap with inspector panel.
 * Click any muscle to see weekly volume, recovery, and bar comparison.
 * Anatomy paths: react-native-body-highlighter (MIT © Hicham ELABBASSI)
 */
import { useEffect, useMemo, useState } from 'react';
import {
  BODY,
  MUSCLE_LABELS,
  type MuscleSlug,
  type BodyView,
  type MuscleVolume,
} from './core';

const RED_SCALE = [
  { max: 5, color: '#5a2d33' },
  { max: 10, color: '#9c3530' },
  { max: 18, color: '#e23b2e' },
  { max: Infinity, color: '#ff5a3c' },
];
const REST_FILL = '#2b313c';
const BODY_FILL = '#2b313c';
const EDGE = '#39414e';

function colorFor(value: number | undefined): string {
  if (!value || value <= 0) return REST_FILL;
  for (const step of RED_SCALE) if (value <= step.max) return step.color;
  return RED_SCALE[RED_SCALE.length - 1].color;
}

interface Props {
  thisWeek: MuscleVolume;
  lastWeek: MuscleVolume;
}

export function MuscleHeatmapPro({ thisWeek, lastWeek }: Props) {
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<MuscleSlug>('quadriceps');
  const [working, setWorking] = useState<MuscleVolume>(thisWeek);

  // Update working set if props change
  useEffect(() => setWorking(thisWeek), [thisWeek]);

  const side = BODY[view];
  const sel = selected;
  const thisVal = working[sel] ?? 0;
  const lastVal = lastWeek[sel] ?? 0;
  const delta = thisVal - lastVal;
  const maxBar = Math.max(thisVal, lastVal, 10);
  const recovery = Math.max(0, Math.min(100, Math.round(100 - (thisVal / 25) * 100)));

  // Top three trained muscles (working set)
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
    <div className="muscleHM-wrap">
      <style>{`
        .muscleHM-wrap {
          --bg: #0b0e13; --panel: #12161f; --panel2: #0e121a;
          --line: #1e2530; --ink: #e8edf4; --muted: #7b8696;
          --accent: #ff3b30; --body: #2b313c; --edge: #39414e;
          display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
          background: var(--line); border: 1px solid var(--line);
          border-radius: 20px; overflow: hidden;
          font-family: 'Saira', system-ui, sans-serif;
          color: var(--ink);
        }
        @media (max-width: 720px) { .muscleHM-wrap { grid-template-columns: 1fr; } }
        .muscleHM-stage {
          background: linear-gradient(180deg, var(--panel), var(--panel2));
          padding: 20px 16px 14px;
        }
        .muscleHM-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 8px; padding: 0 6px;
        }
        .muscleHM-logo {
          font-family: 'Saira Condensed', sans-serif; font-weight: 700;
          letter-spacing: .12em; font-size: 20px;
        }
        .muscleHM-logo b { color: var(--accent); }
        .muscleHM-tag {
          margin-left: auto; font-size: 11px; letter-spacing: .18em;
          text-transform: uppercase; color: var(--muted);
        }
        .muscleHM-toggle-wrap { display: flex; justify-content: center; }
        .muscleHM-toggle {
          display: inline-flex; background: var(--panel2);
          border: 1px solid var(--line); border-radius: 999px;
          padding: 3px; margin: 2px auto 6px;
        }
        .muscleHM-toggle button {
          font-family: 'Saira Semi Condensed', sans-serif; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase; font-size: 12px;
          color: var(--muted); background: none; border: none; cursor: pointer;
          padding: 7px 20px; border-radius: 999px; transition: .2s;
        }
        .muscleHM-toggle button.on { background: var(--accent); color: #fff; }
        .muscleHM-figure {
          display: flex; justify-content: center; align-items: center;
        }
        .muscleHM-figure svg { height: 460px; width: auto; max-width: 100%; }
        .muscleHM-figure svg path.m { cursor: pointer; transition: fill .45s ease; }
        .muscleHM-figure svg path.m:hover {
          filter: drop-shadow(0 0 6px rgba(255, 59, 48, .5));
        }
        .muscleHM-figure svg path.sel { stroke: #fff; stroke-width: 4; paint-order: stroke; }
        .muscleHM-legend {
          display: flex; align-items: center; justify-content: center; margin-top: 6px;
        }
        .muscleHM-legend .sw { width: 34px; height: 9px; }
        .muscleHM-legend .sw:first-child { border-radius: 3px 0 0 3px; }
        .muscleHM-legend .sw:last-child { border-radius: 0 3px 3px 0; }
        .muscleHM-legend small {
          color: var(--muted); font-size: 10px; letter-spacing: .12em;
          margin: 0 8px; text-transform: uppercase;
        }
        .muscleHM-panel {
          background: var(--panel); padding: 24px 22px;
          display: flex; flex-direction: column;
        }
        .muscleHM-panel h2 {
          font-family: 'Saira Condensed', sans-serif; font-weight: 700;
          font-size: 13px; letter-spacing: .22em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 14px;
        }
        .muscleHM-selname {
          font-family: 'Saira Condensed', sans-serif; font-weight: 700;
          font-size: 36px; line-height: .95; text-transform: uppercase;
        }
        .muscleHM-selsub { color: var(--muted); font-size: 13px; margin-top: 4px; }
        .muscleHM-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
          background: var(--line); border: 1px solid var(--line);
          border-radius: 14px; overflow: hidden; margin-top: 18px;
        }
        .muscleHM-stat { background: var(--panel2); padding: 14px 16px; }
        .muscleHM-stat .k {
          font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted);
        }
        .muscleHM-stat .v {
          font-family: 'Saira Semi Condensed', sans-serif; font-weight: 700;
          font-size: 28px; font-variant-numeric: tabular-nums; margin-top: 3px;
        }
        .muscleHM-stat .v small { font-size: 12px; color: var(--muted); font-weight: 500; }
        .muscleHM-up { color: #39d98a; }
        .muscleHM-down { color: #ff6b6b; }
        .muscleHM-bars { margin-top: 16px; }
        .muscleHM-barrow {
          display: flex; align-items: center; gap: 10px; margin: 8px 0;
        }
        .muscleHM-barrow .lab {
          width: 64px; font-size: 11px; color: var(--muted);
          text-transform: uppercase; letter-spacing: .08em;
        }
        .muscleHM-barrow .track {
          flex: 1; height: 8px; background: var(--panel2);
          border-radius: 6px; overflow: hidden;
        }
        .muscleHM-barrow .fill { height: 100%; border-radius: 6px; transition: width .5s; }
        .muscleHM-barrow .num {
          width: 30px; text-align: right; font-variant-numeric: tabular-nums; font-size: 12px;
        }
        .muscleHM-rec { margin-top: auto; padding-top: 16px; }
        .muscleHM-rec .row {
          display: flex; justify-content: space-between; align-items: baseline;
        }
        .muscleHM-rec .pct {
          font-family: 'Saira Semi Condensed', sans-serif; font-weight: 700;
          font-size: 22px; font-variant-numeric: tabular-nums;
        }
        .muscleHM-rec .track {
          height: 6px; background: var(--panel2); border-radius: 6px;
          margin-top: 8px; overflow: hidden;
        }
        .muscleHM-rec .fill {
          height: 100%;
          background: linear-gradient(90deg, #ff3b30, #ffb020, #39d98a);
          border-radius: 6px; transition: width .5s;
        }
        .muscleHM-hint { color: var(--muted); font-size: 12px; }
        .muscleHM-sim { margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
        .muscleHM-sim button {
          font-family: 'Saira Semi Condensed', sans-serif; font-weight: 600;
          font-size: 11.5px; letter-spacing: .05em; text-transform: uppercase;
          background: var(--panel2); color: var(--ink);
          border: 1px solid var(--line); border-radius: 8px;
          padding: 7px 10px; cursor: pointer; transition: .15s;
        }
        .muscleHM-sim button:hover { border-color: var(--accent); color: #fff; }
        .muscleHM-attr { margin-top: 12px; font-size: 10px; color: #4d5563; }
      `}</style>

      {/* Load Saira font once */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700&family=Saira:wght@400;500;600&family=Saira+Semi+Condensed:wght@600;700&display=swap"
        rel="stylesheet"
      />

      {/* LEFT: stage */}
      <div className="muscleHM-stage">
        <div className="muscleHM-brand">
          <span className="muscleHM-logo">IN<b>Ö</b></span>
          <span className="muscleHM-tag">Muscle Heatmap</span>
        </div>
        <div className="muscleHM-toggle-wrap">
          <div className="muscleHM-toggle">
            <button className={view === 'front' ? 'on' : ''} onClick={() => setView('front')}>Front</button>
            <button className={view === 'back' ? 'on' : ''} onClick={() => setView('back')}>Back</button>
          </div>
        </div>

        <div className="muscleHM-figure">
          <svg viewBox={side.viewBox} xmlns="http://www.w3.org/2000/svg">
            {/* Body outline */}
            <path d={side.outline} fill={BODY_FILL} stroke={EDGE} strokeWidth={1.5} />
            {/* Muscles */}
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
          {RED_SCALE.map((s, i) => (
            <div key={i} className="sw" style={{ background: s.color }} />
          ))}
          <small style={{ marginLeft: 12 }}>Light → Heavy</small>
        </div>
      </div>

      {/* RIGHT: panel */}
      <div className="muscleHM-panel">
        <h2>Muscle Detail</h2>
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
              <small> sets</small>
            </div>
          </div>
        </div>

        <div className="muscleHM-bars">
          <div className="muscleHM-barrow">
            <div className="lab">This wk</div>
            <div className="track">
              <div className="fill" style={{ background: '#ff3b30', width: `${(thisVal / maxBar) * 100}%` }} />
            </div>
            <div className="num">{thisVal}</div>
          </div>
          <div className="muscleHM-barrow">
            <div className="lab">Last wk</div>
            <div className="track">
              <div className="fill" style={{ background: '#3a4150', width: `${(lastVal / maxBar) * 100}%` }} />
            </div>
            <div className="num">{lastVal}</div>
          </div>
        </div>

        {top.length > 0 && (
          <div className="muscleHM-bars" style={{ marginTop: 18 }}>
            <h2 style={{ fontSize: 11, marginBottom: 8 }}>Top trained · this wk</h2>
            {top.map(([slug, v]) => (
              <div key={slug} className="muscleHM-barrow">
                <div className="lab" style={{ width: 80 }}>{MUSCLE_LABELS[slug] ?? slug}</div>
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
            <span className="muscleHM-hint">Recovery</span>
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
  );
}
