import React from 'react';
import { T } from '@ino/ui';

interface HeroProps { animIn: boolean; }

export const Hero = ({ animIn }: HeroProps) => (
  <section style={{
    padding: '100px 48px 60px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: T.bg,
  }}>
    {/* Background blurs */}
    <div style={{ position: 'absolute', top: -160, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(16,185,129,0.05)', filter: 'blur(100px)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: -120, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.04)', filter: 'blur(100px)', pointerEvents: 'none' }} />

    {/* Badge */}
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
      background: T.primaryBg, borderRadius: 100, marginBottom: 32,
      border: `1px solid ${T.primaryBorder}`,
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.6s ease',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: T.primary }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: T.primary, letterSpacing: '-0.01em' }}>
        AI-Powered Coaching Platform
      </span>
    </div>

    {/* Japanese subtitle */}
    <p style={{
      fontFamily: '"Noto Sans JP", sans-serif', fontSize: 14, fontWeight: 300,
      color: T.textDim, letterSpacing: '0.2em', marginBottom: 16,
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.6s ease 0.05s',
    }}>
      鍛える・管理する・成長する
    </p>

    {/* Heading */}
    <h1 style={{
      margin: '0 auto 28px', fontSize: 64, fontWeight: 700, color: T.text,
      lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: 800,
      fontFamily: T.font,
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.7s ease 0.1s',
    }}>
      Scale to 100+ clients{' '}
      <span style={{
        background: T.gradientHero,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
      }}>
        without losing quality.
      </span>
    </h1>

    {/* Subtitle */}
    <p style={{
      margin: '0 auto 48px', fontSize: 18, color: T.textMuted, maxWidth: 560,
      lineHeight: 1.7, letterSpacing: '-0.01em', fontFamily: T.font,
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(16px)',
      transition: 'all 0.7s ease 0.2s',
    }}>
      INO uses AI to generate workout plans, analyze nutrition, and track progress
      — so every client still feels coached, not managed.
    </p>

    {/* CTA Buttons */}
    <div style={{
      display: 'flex', gap: 12, justifyContent: 'center',
      opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.7s ease 0.3s',
    }}>
      <button style={{
        padding: '14px 32px', background: T.primary, color: '#fff',
        borderRadius: T.radius.lg, border: 'none', fontSize: 15, fontWeight: 600,
        cursor: 'pointer', fontFamily: T.font, letterSpacing: '-0.01em',
        boxShadow: T.shadowGlow,
        transition: 'all 0.15s ease',
      }}>
        Start Free Trial
      </button>
      <button style={{
        padding: '14px 32px', background: T.bgCard, color: T.text,
        borderRadius: T.radius.lg, border: `1px solid ${T.border}`,
        fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
        letterSpacing: '-0.01em', boxShadow: T.shadow,
        transition: 'all 0.15s ease',
      }}>
        See Demo
      </button>
    </div>

    {/* Social proof */}
    <div style={{
      marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
      opacity: animIn ? 1 : 0,
      transition: 'all 0.7s ease 0.4s',
    }}>
      <div style={{ display: 'flex' }}>
        {['#10B981', '#3B82F6', '#F97316', '#8B5CF6'].map((c, i) => (
          <div key={i} style={{
            width: 32, height: 32, borderRadius: 16, background: c,
            border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#fff',
          }}>
            {['MC', 'JD', 'SK', 'AT'][i]}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Trusted by 200+ coaches</p>
        <p style={{ fontSize: 12, color: T.textDim }}>Managing 10,000+ athletes worldwide</p>
      </div>
    </div>
  </section>
);
