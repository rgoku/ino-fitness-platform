import React from 'react';
import { T, Icon, DEMO_MEMBERS } from '@ino/ui';

interface ProgressProps { completions: Record<string, boolean>; }

export const Progress = ({ completions }: ProgressProps) => {
  const user = DEMO_MEMBERS[0];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Your Progress</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Day Streak', value: user.streak, icon: 'fire', color: T.orange },
          { label: 'Adherence', value: `${Math.round(user.progress * 100)}%`, icon: 'target', color: T.success },
          { label: 'Workouts', value: 3, icon: 'dumbbell', color: T.primary },
          { label: 'Completed', value: Object.keys(completions).length, icon: 'check', color: T.cyan },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 18, textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <Icon name={s.icon} size={20} color={s.color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
