import React from 'react';
import { T } from '@ino/ui';

export const ROI = () => (
  <section style={{ padding: '0 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <div style={{
      background: T.gradient, borderRadius: 24, padding: '44px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 600 }}>Do the math</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          $249/mo ÷ 50 clients = $4.98/client
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
          One retained client pays for a full year of INÖ.
        </div>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '20px 28px',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
        textAlign: 'center', position: 'relative',
      }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>247x</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Average ROI</div>
      </div>
    </div>
  </section>
);
