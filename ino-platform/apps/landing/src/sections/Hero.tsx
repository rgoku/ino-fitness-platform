import React from 'react';
import { T, Icon } from '@ino/ui';

interface HeroProps { animIn: boolean; }

export const Hero = ({ animIn }: HeroProps) => (
  <section style={{ padding: '80px 48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -100, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(236,72,153,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
      background: T.primaryBg, borderRadius: 100, marginBottom: 28,
      border: '1px solid rgba(99,102,241,0.12)',
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.6s ease',
    }}>
      <Icon name="dumbbell" size={16} color={T.primary} />
      <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>Professional-Grade Coaching Platform</span>
    </div>

    <h1 style={{
      margin: '0 auto 24px', fontSize: 64, fontWeight: 800, color: T.text,
      lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: 820,
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.7s ease 0.1s',
    }}>
      Built for coaches who{' '}
      <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: 2, display: 'inline-block' }}>
        care about their clients
      </span>
      {' '}— and their time.
    </h1>

    <p style={{
      margin: '0 auto 44px', fontSize: 20, color: T.textMuted, maxWidth: 600, lineHeight: 1.6,
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(16px)',
      transition: 'all 0.7s ease 0.2s',
    }}>
      INÖ helps coaches grow their roster while staying present, organized, and
      responsive — so every client still feels coached, not managed.
    </p>
  </section>
);
