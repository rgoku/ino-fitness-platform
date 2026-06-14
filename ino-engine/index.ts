/**
 * ino-engine
 * ----------
 * Top-level barrel export for the ML exercise intelligence engine.
 *
 * Mobile:  ExerciseCamera (React Native / Expo)
 * Web:     CameraAnalysis (Next.js 'use client')
 * Types:   EngineState    (shared contract with the Python backend)
 */
export { ExerciseCamera } from './mobile';
export { default as CameraAnalysis } from './web-overlay/CameraAnalysis';
export type { EngineState } from './mobile';
