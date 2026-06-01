/**
 * Body Analysis Module — INÖ
 *
 * Central hub for body visualization, ML analysis, and progress tracking.
 * Uses real anatomical SVG paths (MIT © Hicham ELABBASSI).
 */

export { default as MuscleHeatmap } from './MuscleHeatmap';
export type { MuscleSlug, BodyView, MuscleVolume, LoggedSet } from './MuscleHeatmap';
export { EXERCISE_MAP, aggregateVolume, getColor } from './MuscleHeatmap';
