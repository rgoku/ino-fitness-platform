import React, { useState } from 'react';
import { T, FAQ_DATA } from '@ino/ui';

export const FAQ = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section style={{ padding: '40px 48px 80px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
          Frequently asked questions
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FAQ_DATA.map((faq, i) => {
          const isOpen = openFaq === i;
          return (
            <div key={i} style={{
              background: T.bgCard, borderRadius: 16,
              border: `1px solid ${isOpen ? T.primary + '30' : T.border}`,
              overflow: 'hidden', transition: 'all 0.2s ease',
            }}>
              <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: T.text, textAlign: 'left' }}>{faq.q}</span>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: isOpen ? T.primaryBg : T.bgAlt,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginLeft: 16,
                  transition: 'all 0.3s ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1, color: isOpen ? T.primary : T.textDim, fontWeight: 300 }}>+</span>
                </div>
              </button>
              <div style={{ maxHeight: isOpen ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                <div style={{ padding: '0 24px 20px' }}>
                  <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
