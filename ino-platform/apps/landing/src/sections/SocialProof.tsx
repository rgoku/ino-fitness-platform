import React from 'react';
import { T, Icon, Avatar, TESTIMONIALS } from '@ino/ui';

interface SocialProofProps { animIn: boolean; }

const STATS = [
  { value: '2,400+', label: 'Active Coaches' },
  { value: '94%', label: 'Client Retention' },
  { value: '50,000+', label: 'Programs Delivered' },
];

export const SocialProofStrip = ({ animIn }: SocialProofProps) => (
  <div style={{
    display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 20, padding: '0 48px',
    opacity: animIn ? 1 : 0, transition: 'all 0.7s ease 0.35s',
  }}>
    {STATS.map((s, i) => (
      <div key={i} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{s.value}</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
      </div>
    ))}
  </div>
);

export const TestimonialsSection = () => (
  <section style={{ padding: '60px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
        Coaches who made the switch
      </h2>
      <p style={{ margin: '14px 0 0', color: T.textMuted, fontSize: 17 }}>
        Real results from real coaching businesses
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {TESTIMONIALS.map((t, i) => (
        <div key={i} style={{
          background: T.bgCard, borderRadius: 24, padding: 32, border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 20, right: 20,
            background: t.color + '10', padding: '5px 12px', borderRadius: 100,
            fontSize: 11, fontWeight: 700, color: t.color,
          }}>{t.metric}</div>

          <div style={{ fontSize: 48, lineHeight: 1, color: t.color + '25', fontFamily: 'Georgia, serif', marginBottom: 8 }}>"</div>

          <p style={{ fontSize: 15, color: T.textSecondary, lineHeight: 1.7, flex: 1, margin: '0 0 24px' }}>
            {t.quote}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
            <Avatar initials={t.initials} size={42} color={t.color} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
