/**
 * Premium muscle heatmap with inspector panel (React Native).
 * Anatomy paths: react-native-body-highlighter (MIT © Hicham ELABBASSI)
 */
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
const C = {
  bg: '#0b0e13',
  panel: '#12161f',
  panel2: '#0e121a',
  line: '#1e2530',
  ink: '#e8edf4',
  muted: '#7b8696',
  accent: '#ff3b30',
  body: '#2b313c',
  edge: '#39414e',
  up: '#39d98a',
  down: '#ff6b6b',
};

function colorFor(value: number | undefined): string {
  if (!value || value <= 0) return C.body;
  for (const step of RED_SCALE) if (value <= step.max) return step.color;
  return RED_SCALE[RED_SCALE.length - 1].color;
}

/**
 * Cheap-but-effective SVG path bounding box.
 * Walks the `d` string for numeric pairs, returns the min/max of each.
 * Doesn't honor arc/curve control points exactly — but for hit-testing
 * a tap against a muscle, the bbox of the *vertices* is plenty accurate
 * because the body anatomy paths are dense polylines.
 */
const _BBOX_CACHE = new Map<string, { minX: number; maxX: number; minY: number; maxY: number }>();
function muscleBBox(paths: string[]): { minX: number; maxX: number; minY: number; maxY: number } | null {
  const key = paths.join('|');
  const cached = _BBOX_CACHE.get(key);
  if (cached) return cached;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let any = false;
  for (const d of paths) {
    // Pull all signed numeric tokens out of the path string.
    const nums = d.match(/-?\d+(\.\d+)?/g);
    if (!nums) continue;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = parseFloat(nums[i]);
      const y = parseFloat(nums[i + 1]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        any = true;
      }
    }
  }
  if (!any) return null;
  const box = { minX, maxX, minY, maxY };
  _BBOX_CACHE.set(key, box);
  return box;
}

interface Props {
  thisWeek: MuscleVolume;
  lastWeek: MuscleVolume;
  /** Controlled selection (overrides internal state if provided). */
  selectedMuscle?: MuscleSlug;
  onSelectMuscle?: (slug: MuscleSlug) => void;
  /** Controlled body view (overrides internal state if provided). */
  view?: BodyView;
  onChangeView?: (v: BodyView) => void;
}

export function MuscleHeatmapPro({
  thisWeek,
  lastWeek,
  selectedMuscle,
  onSelectMuscle,
  view: controlledView,
  onChangeView,
}: Props) {
  // Controlled / uncontrolled hybrid — parent can persist selection across
  // tab focus by passing selectedMuscle + onSelectMuscle.
  const [internalView, setInternalView] = useState<BodyView>('front');
  const [internalSelected, setInternalSelected] = useState<MuscleSlug>('quadriceps');
  const [working, setWorking] = useState<MuscleVolume>(thisWeek);

  const view = controlledView ?? internalView;
  const selected = selectedMuscle ?? internalSelected;

  const setView = useCallback(
    (v: BodyView) => {
      if (onChangeView) onChangeView(v);
      else setInternalView(v);
    },
    [onChangeView],
  );

  const setSelected = useCallback(
    (slug: MuscleSlug) => {
      if (onSelectMuscle) onSelectMuscle(slug);
      else setInternalSelected(slug);
    },
    [onSelectMuscle],
  );

  useEffect(() => setWorking(thisWeek), [thisWeek]);

  const side = BODY[view];
  const thisVal = working[selected] ?? 0;
  const lastVal = lastWeek[selected] ?? 0;
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

  const screenWidth = Dimensions.get('window').width;
  const svgWidth = Math.min(screenWidth - 48, 280);
  const [vbX, vbY, vbW, vbH] = side.viewBox.split(' ').map(Number);
  const svgHeight = svgWidth * (vbH / vbW);

  return (
    <View style={styles.wrap}>
      {/* STAGE */}
      <View style={styles.stage}>
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>
            IN<Text style={styles.logoAccent}>Ö</Text>
          </Text>
          <Text style={styles.tag}>Muscle Heatmap</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            <Pressable
              onPress={() => setView('front')}
              style={[styles.toggleBtn, view === 'front' && styles.toggleBtnOn]}
            >
              <Text style={[styles.toggleText, view === 'front' && styles.toggleTextOn]}>Front</Text>
            </Pressable>
            <Pressable
              onPress={() => setView('back')}
              style={[styles.toggleBtn, view === 'back' && styles.toggleBtnOn]}
            >
              <Text style={[styles.toggleText, view === 'back' && styles.toggleTextOn]}>Back</Text>
            </Pressable>
          </View>
        </View>

        {/* SVG body + overlay tap layer.
            react-native-svg <Path onPress> is unreliable on Android
            (especially inside a ScrollView, which captures gestures
            first). We sidestep the SVG event system entirely: an
            absolutely-positioned Pressable above the SVG receives all
            taps, maps the touch into the SVG's viewBox coordinates,
            then runs point-in-bounding-box hit detection against the
            cached bboxes per muscle.

            For a path collection P_i with vertices V, the bbox is
            { minX, maxX, minY, maxY }. We pick the muscle whose bbox
            contains the tap point AND has the smallest area (so the
            chest doesn't swallow taps meant for the deltoids, etc.). */}
        <View style={styles.figure}>
          <View style={{ width: svgWidth, height: svgHeight, position: 'relative' }}>
            <Svg
              width={svgWidth}
              height={svgHeight}
              viewBox={side.viewBox}
              pointerEvents="none"
            >
              <Path d={side.outline} fill={C.body} stroke={C.edge} strokeWidth={1.5} />
              {side.muscles.map((m) => {
                const slug = m.slug as MuscleSlug;
                const isSelected = slug === selected;
                const fill = colorFor(working[slug]);
                return m.paths.map((d, i) => (
                  <Path
                    key={`${m.slug}-${i}`}
                    d={d}
                    fill={fill}
                    stroke={isSelected ? '#fff' : 'none'}
                    strokeWidth={isSelected ? 3 : 0}
                    strokeLinejoin="round"
                  />
                ));
              })}
            </Svg>

            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={(e) => {
                const { locationX, locationY } = e.nativeEvent;
                const vx = vbX + (locationX / svgWidth) * vbW;
                const vy = vbY + (locationY / svgHeight) * vbH;
                let hit: MuscleSlug | null = null;
                let hitArea = Infinity;
                for (const m of side.muscles) {
                  const bb = muscleBBox(m.paths);
                  if (!bb) continue;
                  if (vx < bb.minX || vx > bb.maxX || vy < bb.minY || vy > bb.maxY) continue;
                  const area = (bb.maxX - bb.minX) * (bb.maxY - bb.minY);
                  if (area < hitArea) {
                    hitArea = area;
                    hit = m.slug as MuscleSlug;
                  }
                }
                if (hit) setSelected(hit);
              }}
            />
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {RED_SCALE.map((s, i) => (
            <View
              key={i}
              style={[
                styles.legendSwatch,
                { backgroundColor: s.color },
                i === 0 && styles.legendFirst,
                i === RED_SCALE.length - 1 && styles.legendLast,
              ]}
            />
          ))}
          <Text style={styles.legendLabel}>Light → Heavy</Text>
        </View>
      </View>

      {/* PANEL */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Muscle Detail</Text>
        <Text style={styles.selName}>{(MUSCLE_LABELS[selected] ?? selected).toUpperCase()}</Text>
        <Text style={styles.selSub}>Tap any muscle to inspect</Text>

        {/* Stats grid */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statKey}>SETS · THIS WK</Text>
            <Text style={styles.statValue}>{thisVal}</Text>
          </View>
          <View style={[styles.stat, styles.statRight]}>
            <Text style={styles.statKey}>VS LAST WK</Text>
            <Text style={[styles.statValue, { color: delta >= 0 ? C.up : C.down }]}>
              {delta >= 0 ? '+' : ''}{delta}{' '}
              <Text style={styles.statValueSmall}>sets</Text>
            </Text>
          </View>
        </View>

        {/* Bars */}
        <View style={styles.bars}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>This wk</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: C.accent, width: `${(thisVal / maxBar) * 100}%` }]} />
            </View>
            <Text style={styles.barNum}>{thisVal}</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Last wk</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: '#3a4150', width: `${(lastVal / maxBar) * 100}%` }]} />
            </View>
            <Text style={styles.barNum}>{lastVal}</Text>
          </View>
        </View>

        {/* Top trained */}
        {top.length > 0 && (
          <View style={[styles.bars, { marginTop: 18 }]}>
            <Text style={[styles.panelTitle, { marginBottom: 8 }]}>Top trained · this wk</Text>
            {top.map(([slug, v]) => (
              <View key={slug} style={styles.barRow}>
                <Text style={[styles.barLabel, { width: 70 }]}>
                  {MUSCLE_LABELS[slug] ?? slug}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: colorFor(v), width: `${(v / top[0][1]) * 100}%` }]} />
                </View>
                <Text style={styles.barNum}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recovery */}
        <View style={styles.recovery}>
          <View style={styles.recoveryRow}>
            <Text style={styles.recoveryLabel}>Recovery</Text>
            <Text style={styles.recoveryPct}>{recovery}%</Text>
          </View>
          <View style={styles.recoveryTrack}>
            <View style={[styles.recoveryFill, { width: `${recovery}%` }]} />
          </View>

          {/* Sim buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.simScroll}>
            <View style={styles.sim}>
              <Pressable onPress={() => sim('legday')} style={styles.simBtn}>
                <Text style={styles.simText}>+ LEG DAY</Text>
              </Pressable>
              <Pressable onPress={() => sim('push')} style={styles.simBtn}>
                <Text style={styles.simText}>+ PUSH</Text>
              </Pressable>
              <Pressable onPress={() => sim('pull')} style={styles.simBtn}>
                <Text style={styles.simText}>+ PULL</Text>
              </Pressable>
              <Pressable onPress={() => sim('reset')} style={styles.simBtn}>
                <Text style={styles.simText}>RESET</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Text style={styles.attr}>Anatomy paths: react-native-body-highlighter (MIT © Hicham ELABBASSI)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: C.line,
    borderWidth: 1,
    borderColor: C.line,
  },
  stage: {
    backgroundColor: C.panel,
    padding: 16,
    paddingBottom: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  logo: {
    fontWeight: '700',
    letterSpacing: 2.4,
    fontSize: 20,
    color: C.ink,
  },
  logoAccent: { color: C.accent },
  tag: {
    marginLeft: 'auto',
    fontSize: 10,
    letterSpacing: 2,
    color: C.muted,
    textTransform: 'uppercase',
  },
  toggleWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 999,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  toggleBtnOn: { backgroundColor: C.accent },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.muted,
  },
  toggleTextOn: { color: '#fff' },
  figure: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  legendSwatch: { width: 28, height: 8 },
  legendFirst: { borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
  legendLast: { borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  legendLabel: {
    color: C.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: C.panel,
    padding: 22,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: C.muted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  selName: {
    fontWeight: '700',
    fontSize: 32,
    color: C.ink,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  selSub: { color: C.muted, fontSize: 12, marginTop: 4 },
  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 18,
  },
  stat: {
    flex: 1,
    backgroundColor: C.panel2,
    padding: 14,
    paddingHorizontal: 16,
  },
  statRight: { borderLeftWidth: 1, borderLeftColor: C.line },
  statKey: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: C.muted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 26,
    color: C.ink,
    marginTop: 4,
  },
  statValueSmall: { fontSize: 11, color: C.muted, fontWeight: '500' },
  bars: { marginTop: 16 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 8,
  },
  barLabel: {
    width: 60,
    fontSize: 10,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: C.panel2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 6 },
  barNum: {
    width: 28,
    textAlign: 'right',
    fontSize: 11,
    color: C.ink,
    fontVariant: ['tabular-nums'],
  },
  recovery: { marginTop: 18 },
  recoveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  recoveryLabel: { color: C.muted, fontSize: 12 },
  recoveryPct: {
    fontWeight: '700',
    fontSize: 22,
    color: C.ink,
    fontVariant: ['tabular-nums'],
  },
  recoveryTrack: {
    height: 6,
    backgroundColor: C.panel2,
    borderRadius: 6,
    marginTop: 8,
    overflow: 'hidden',
  },
  recoveryFill: {
    height: '100%',
    backgroundColor: '#39d98a',
    borderRadius: 6,
  },
  simScroll: { marginTop: 12 },
  sim: { flexDirection: 'row', gap: 6 },
  simBtn: {
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  simText: {
    fontWeight: '600',
    fontSize: 10.5,
    letterSpacing: 0.5,
    color: C.ink,
  },
  attr: {
    marginTop: 12,
    fontSize: 9,
    color: '#4d5563',
  },
});
