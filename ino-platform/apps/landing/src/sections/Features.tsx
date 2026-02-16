import React, { useState } from 'react';
import { T, Icon, FEATURES } from '@ino/ui';

export const FeaturesGrid = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section style={{ padding: '60px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
          Built for how coaches actually work
        </h2>
        <p style={{ margin: '14px 0 0', color: T.textMuted, fontSize: 17, maxWidth: 540, marginInline: 'auto' }}>
          Every feature exists to save you time or keep your clients accountable. Nothing extra.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {FEATURES.map((f, i) => (
          <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{
            background: T.bgCard, borderRadius: 20, padding: 28,
            border: `1px solid ${hovered === i ? f.color + '40' : T.border}`,
            transition: 'all 0.3s ease',
            transform: hovered === i ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: hovered === i ? `0 16px 40px ${f.color}15` : T.shadow,
            cursor: 'default',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: f.color + '12',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              transition: 'all 0.3s ease', transform: hovered === i ? 'scale(1.1)' : 'scale(1)',
            }}>
              <Icon name={f.icon} size={26} color={f.color} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const AutomationRule = () => (
  <section style={{ padding: '0 48px 60px', maxWidth: 800, margin: '0 auto' }}>
    <div style={{
      background: T.bgCard, borderRadius: 24, border: `1px solid ${T.border}`,
      padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: T.gradientWarm }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: T.warningBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="zap" size={16} color={T.warning} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Example Automation Rule</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: T.successBg, color: T.success, marginLeft: 'auto' }}>Active</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Client misses 2 workouts', bg: T.dangerBg, color: T.danger, icon: 'alertCircle' },
          { label: '→', isArrow: true },
          { label: 'Auto-send check-in message', bg: T.primaryBg, color: T.primary, icon: 'send' },
          { label: '→', isArrow: true },
          { label: 'Flag coach after 48h', bg: T.warningBg, color: T.warning, icon: 'bell' },
        ].map((step: any, i) => (
          step.isArrow ? (
            <span key={i} style={{ fontSize: 18, color: T.textDim, fontWeight: 600 }}>→</span>
          ) : (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              background: step.bg, borderRadius: 12, border: `1px solid ${step.color}18`,
            }}>
              <Icon name={step.icon} size={16} color={step.color} />
              <span style={{ fontSize: 13, fontWeight: 600, color: step.color }}>{step.label}</span>
            </div>
          )
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: T.textMuted }}>
        This rule has saved coaches an average of 4.2 hours/week on client follow-up.
      </div>
    </div>
  </section>
);

export const BeforeAfter = () => (
  <section style={{ padding: '40px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
        The difference is night and day
      </h2>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: T.bgCard, borderRadius: 24, padding: 36, border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: T.danger }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: T.dangerBg, borderRadius: 100, marginBottom: 24 }}>
          <Icon name="x" size={14} color={T.danger} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.danger }}>WITHOUT INÖ</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            'Tracking clients across spreadsheets, DMs, and apps',
            'Missing check-ins with no system to follow up',
            'Clients ghosting because they feel forgotten',
            'Spending 3+ hours/day on admin instead of coaching',
            "No idea who's at risk until they've already quit",
            "Revenue capped because you can't take more clients",
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon name="x" size={12} color={T.danger} />
              </div>
              <span style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: T.bgCard, borderRadius: 24, padding: 36, border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: T.gradient }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: T.successBg, borderRadius: 100, marginBottom: 24 }}>
          <Icon name="checkCircle" size={14} color={T.success} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>WITH INÖ</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            'Every client, workout, and check-in in one dashboard',
            'Automated check-ins sent on schedule — zero effort',
            'Clients engaged daily through their own branded app',
            'Admin cut to 30 min/day with smart automation',
            'Real-time risk flags before clients disengage',
            'Scale to 50, 80, 100+ clients with the same energy',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: T.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon name="check" size={12} color={T.success} />
              </div>
              <span style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

interface TwoAppProps { onNavigate: (target: string) => void; }

export const TwoAppSection = ({ onNavigate }: TwoAppProps) => (
  <section style={{ padding: '20px 48px 60px', maxWidth: 1100, margin: '0 auto' }}>
    <div style={{ background: T.bgDark, borderRadius: 28, padding: '56px 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', gap: 48, alignItems: 'center', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Two apps.<br />One seamless system.
          </h3>
          <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.7 }}>
            You get the coach dashboard on web. Your clients get INÖ Fit on mobile. Everything syncs in real time — workouts, check-ins, messages, progress.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { icon: 'monitor', label: 'INÖ Coach', sub: 'Web dashboard', color: T.primary },
              { icon: 'smartphone', label: 'INÖ Fit', sub: 'Client mobile app', color: T.pink },
            ].map((app, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: app.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={app.icon} size={20} color={app.color} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{app.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{app.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <button onClick={() => onNavigate('demo')} style={{
            background: T.gradient, border: 'none', borderRadius: 16, padding: '18px 36px',
            fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            Launch Live Demo <Icon name="arrowRight" size={20} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  </section>
);
