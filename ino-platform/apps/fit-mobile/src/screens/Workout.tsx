import React from 'react';
import { T, Icon, DEMO_WORKOUTS } from '@ino/ui';

interface WorkoutProps {
  workoutId: string;
  completions: Record<string, boolean>;
  onComplete: (workoutId: string, exerciseName: string) => void;
  onBack: () => void;
}

export const Workout = ({ workoutId, completions, onComplete, onBack }: WorkoutProps) => {
  const workout = DEMO_WORKOUTS.find(w => w.id === workoutId);
  if (!workout) return null;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack} style={{
        background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px',
        color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18,
      }}>
        <Icon name="chevronLeft" size={16} color="#fff" /> Back
      </button>

      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{workout.title}</div>
      <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20 }}>{workout.desc}</div>

      {workout.exercises.map((e, i) => {
        const done = completions[`${workout.id}_${e.name}`];
        return (
          <div key={i} style={{
            background: done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
            borderRadius: 14, padding: 16, marginBottom: 10,
            border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: done ? T.success : '#fff' }}>
                  {done && '✓ '}{e.name}
                </div>
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{e.sets} sets × {e.reps} reps</div>
              </div>
              {!done && (
                <button onClick={() => onComplete(workout.id, e.name)} style={{
                  background: T.success, border: 'none', borderRadius: 10, padding: '8px 16px',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>Done</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
