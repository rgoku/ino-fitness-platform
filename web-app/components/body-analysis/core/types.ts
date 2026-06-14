export type MuscleSlug =
  | 'chest' | 'obliques' | 'abs' | 'biceps' | 'triceps' | 'trapezius'
  | 'deltoids' | 'quadriceps' | 'tibialis' | 'calves' | 'forearm'
  | 'adductors' | 'upper-back' | 'lower-back' | 'gluteal' | 'hamstring';

export type BodyView = 'front' | 'back';

export type MuscleVolume = Partial<Record<MuscleSlug, number>>;

export interface LoggedSet {
  exercise: string;
  sets: number;
}

export interface MuscleEntry {
  slug: string;
  paths: string[];
}

export interface BodySide {
  viewBox: string;
  outline: string;
  muscles: MuscleEntry[];
}

export interface BodyData {
  front: BodySide;
  back: BodySide;
}
