import React, { useState } from 'react';
import { T, Icon, PLANS, COMPARISON_FEATURES } from '@ino/ui';

interface PricingProps { onNavigate: (target: string) => void; }

export const Pricing = ({ onNavigate }: PricingProps) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <>
      <section id="pricing" style={{ padding: '80px 48px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
            Pricing that scales with you
          </h2>
          <p style={{ margin: '14px 0 24px', color: T.textMuted, fontSize: 17 }}>
            No per-client fees. No hidden costs. Just the tools to grow.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28 }}>
            {[
              { icon: 'shield', text: '14-day free trial' },
              { icon: 'creditCard', text: 'No credit card required' },
              { icon: 'x', text: 'Cancel anytime' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={b.icon} size={14} color={T.textDim} />
                <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>{b.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'inline-flex', background: T.bgAlt, borderRadius: 12, padding: 4, border: `1px solid ${T.border}` }}>
            {['monthly', 'yearly'].map(c => (
              <button key={c} onClick={() => setBillingCycle(c)} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                background: billingCycle === c ? T.bgCard : 'transparent',
                color: billingCycle === c ? T.text : T.textMuted,
                boxShadow: billingCycle === c ? T.shadowMd : 'none',
              }}>
                {c === 'monthly' ? 'Monthly' : 'Yearly'}
                {c === 'yearly' && <span style={{ fontSize: 11, color: T.success, marginLeft: 6, fontWeight: 700 }}>Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 24 }}>
          {PLANS.map(plan => {
            const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={plan.id} style={{
                background: T.bgCard, borderRadius: 24, overflow: 'hidden',
                border: plan.popular ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                boxShadow: plan.popular ? '0 16px 48px rgba(99,102,241,0.15)' : T.shadow,
                transform: plan.popular ? 'scale(1.03)' : 'none', position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16, background: T.gradient,
                    padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    color: '#fff', letterSpacing: '0.02em',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ padding: 32 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>{plan.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: T.text, letterSpacing: '-0.04em' }}>${price}</span>
                    <span style={{ fontSize: 16, color: T.textDim, fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>Up to {plan.clients}</div>
                  <button onClick={() => onNavigate('demo')} style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: plan.popular ? T.gradient : T.bgAlt,
                    color: plan.popular ? '#fff' : T.text,
                    boxShadow: plan.popular ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
                  }}>Start 14-Day Free Trial</button>
                </div>
                <div style={{ padding: '0 32px 32px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>What's included:</div>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <Icon name="check" size={16} color={T.success} />
                      <span style={{ fontSize: 14, color: T.textSecondary }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: 0.4 }}>
                      <Icon name="x" size={16} color={T.textDim} />
                      <span style={{ fontSize: 14, color: T.textDim }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '40px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.text }}>Full feature comparison</h3>
        </div>
        <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', padding: '18px 28px', borderBottom: `2px solid ${T.border}`, background: T.bgAlt }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted }}>FEATURE</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textAlign: 'center' }}>STARTER</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, textAlign: 'center' }}>PRO</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textAlign: 'center' }}>SCALE</div>
          </div>
          {COMPARISON_FEATURES.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
              padding: '14px 28px', borderBottom: i < COMPARISON_FEATURES.length - 1 ? `1px solid ${T.border}` : 'none',
              background: i % 2 === 0 ? 'transparent' : T.bg,
            }}>
              <div style={{ fontSize: 14, color: T.textSecondary, fontWeight: 500 }}>{row.name}</div>
              {(['starter', 'pro', 'scale'] as const).map(plan => {
                const val = row[plan];
                return (
                  <div key={plan} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {val === true ? (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={13} color={T.success} />
                      </div>
                    ) : val === false ? (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="x" size={11} color={T.textDim} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{val}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
