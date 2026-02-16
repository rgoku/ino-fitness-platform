import React from 'react';
import { T, Icon, DEMO_MEMBERS, DEMO_WORKOUTS } from '@ino/ui';

interface HomeProps { onSelectWorkout: (id: string) => void; }

export const Home = ({ onSelectWorkout }: HomeProps) => {
  const user = DEMO_MEMBERS[0];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: T.textDim }}>Welcome back,</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{user.name.split(' ')[0]} 👋</div>
      </div>

      <div style={{ background: T.gradient, borderRadius: 20, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Current Streak</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{user.streak} days</div>
          </div>
          <div style={{ fontSize: 42 }}>🔥</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Adherence</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{Math.round(user.progress * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${user.progress * 100}%`, background: '#fff', borderRadius: 3 }} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Today's Workouts</div>
      {DEMO_WORKOUTS.map(w => (
        <div key={w.id} onClick={() => onSelectWorkout(w.id)} style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 10,
          border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{w.title}</div>
              <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{w.exercises.length} exercises · {w.desc}</div>
            </div>
            <Icon name="chevronRight" size={20} color={T.textDim} />
          </div>
        </div>
      ))}
    </div>
  );
};
