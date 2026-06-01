/**
 * MuscleHeatmap — INÖ  (dependency-free)
 * ---------------------------------------------------------------------------
 * Real anatomical figure (front + back) driven by weekly training volume.
 * Renders the inlined paths from ./bodyPaths.ts with react-native-svg directly
 * — no react-native-body-highlighter dependency, so nothing external can break
 * your build. Anatomy paths: MIT © Hicham ELABBASSI (keep the attribution).
 *
 *   npm i react-native-svg
 * ---------------------------------------------------------------------------
 */
import React from "react";
import Svg, { Path } from "react-native-svg";
import { BODY } from "./bodyPaths";

/* ============================================================ TYPES */
export type MuscleSlug =
  | "chest" | "obliques" | "abs" | "biceps" | "triceps" | "trapezius"
  | "deltoids" | "quadriceps" | "tibialis" | "calves" | "forearm"
  | "adductors" | "upper-back" | "lower-back" | "gluteal" | "hamstring";

export type BodyView = "front" | "back";
/** Weekly working sets per muscle. Missing / 0 → rest. */
export type MuscleVolume = Partial<Record<MuscleSlug, number>>;

/* ============================================================ COLOR
   Single source of truth: sets → fill. Tune thresholds/colors freely. */
const REST_FILL  = "#384150"; // faint relief for unworked muscle
const SEPARATOR  = "#1b212b"; // stroke between muscles
const BODY_FILL  = "#2b313c"; // silhouette
const OUTLINE    = "#39414e"; // body outline
const SEL_STROKE = "#ffffff"; // selected highlight

const SCALE: { max: number; c: string }[] = [
  { max: 5,  c: "#5a2d33" }, // light   (1–5)
  { max: 10, c: "#9c3530" }, // medium  (6–10)
  { max: 18, c: "#e23b2e" }, // hard    (11–18)
  { max: Infinity, c: "#ff5a3c" }, // overload (19+)
];

export function getColor(sets: number): string {
  if (sets <= 0) return REST_FILL;
  return (SCALE.find((s) => sets <= s.max) ?? SCALE[SCALE.length - 1]).c;
}

/* ============================================================ COMPONENT */
interface Props {
  volumes: MuscleVolume;
  view?: BodyView;
  selected?: MuscleSlug | null;
  onSelectMuscle?: (slug: MuscleSlug) => void;
  width?: number;
  height?: number;
}

export default function MuscleHeatmap({
  volumes,
  view = "front",
  selected = null,
  onSelectMuscle,
  width = 240,
  height = 480,
}: Props) {
  const side = BODY[view];
  return (
    <Svg viewBox={side.viewBox} width={width} height={height}>
      {/* silhouette */}
      <Path d={side.outline} fill={BODY_FILL} stroke={OUTLINE} strokeWidth={3} />
      {/* muscles */}
      {side.muscles.map((m) => {
        const fill = getColor(volumes[m.slug as MuscleSlug] ?? 0);
        const isSel = m.slug === selected;
        return m.paths.map((d, i) => (
          <Path
            key={`${m.slug}-${i}`}
            d={d}
            fill={fill}
            stroke={isSel ? SEL_STROKE : SEPARATOR}
            strokeWidth={isSel ? 5 : 1.4}
            onPress={() => onSelectMuscle?.(m.slug as MuscleSlug)}
          />
        ));
      })}
    </Svg>
  );
}

/* ============================================================ WORKOUT → VOLUME
   Turn a logged session into per-muscle weekly sets. Fractional factors
   credit secondary movers (squats hit glutes + hams, etc.). */
export const EXERCISE_MAP: Record<string, Partial<Record<MuscleSlug, number>>> = {
  Squat:               { quadriceps: 1, gluteal: 1, hamstring: 0.5, "lower-back": 0.5 },
  "Leg Press":         { quadriceps: 1, gluteal: 0.5 },
  "Walking Lunge":     { quadriceps: 1, gluteal: 1, hamstring: 0.5 },
  "Romanian Deadlift": { hamstring: 1, gluteal: 1, "lower-back": 0.5 },
  "Calf Raise":        { calves: 1, tibialis: 0.25 },
  "Bench Press":       { chest: 1, deltoids: 0.5, triceps: 0.5 },
  "Incline Press":     { chest: 1, deltoids: 0.75, triceps: 0.5 },
  "Overhead Press":    { deltoids: 1, triceps: 0.5, trapezius: 0.5 },
  "Lat Pulldown":      { "upper-back": 1, biceps: 0.5 },
  "Barbell Row":       { "upper-back": 1, biceps: 0.5, trapezius: 0.5 },
  Deadlift:            { hamstring: 1, gluteal: 1, "lower-back": 1, trapezius: 0.5, forearm: 0.5 },
  "Bicep Curl":        { biceps: 1, forearm: 0.5 },
  "Tricep Pushdown":   { triceps: 1 },
  Crunch:              { abs: 1, obliques: 0.5 },
};

export interface LoggedSet { exercise: string; sets: number; }

export function aggregateVolume(log: LoggedSet[]): MuscleVolume {
  const out: MuscleVolume = {};
  for (const { exercise, sets } of log) {
    const map = EXERCISE_MAP[exercise];
    if (!map) continue;
    for (const [m, factor] of Object.entries(map) as [MuscleSlug, number][]) {
      out[m] = (out[m] ?? 0) + sets * factor;
    }
  }
  return out;
}

/* ============================================================ USAGE
   const volumes = aggregateVolume([
     { exercise: "Squat", sets: 4 },
     { exercise: "Calf Raise", sets: 3 },
   ]);
   const [muscle, setMuscle] = useState<MuscleSlug | null>(null);

   <MuscleHeatmap volumes={volumes} view="front"
                  selected={muscle} onSelectMuscle={setMuscle} />
============================================================ */
