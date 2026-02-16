import React from 'react';
import { T, Icon, Avatar, DEMO_MEMBERS } from '@ino/ui';

interface ProfileProps {
  onNavigate: (target: string) => void;
  showToast: (msg: string) => void;
}

export const Profile = ({ onNavigate, showToast }: ProfileProps) => {
  const user = DEMO_MEMBERS[0];

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <Avatar initials={user.initials} size={80} color={T.primary} />
      <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 14 }}>{user.name}</div>
      <div style={{ fontSize: 13, color: T.textDim, marginTop: 4 }}>james@email.com</div>
      <div style={{ marginTop: 28, textAlign: 'left' }}>
        {[
          { label: 'Notifications', icon: 'bell', action: () => showToast('Notifications enabled ✅') },
          { label: 'Goals', icon: 'target', action: () => showToast('Goals: Lose 10lbs, Bench 225 🎯') },
          { label: 'Settings', icon: 'settings', action: () => showToast('Settings opened ⚙️') },
          { label: 'My Coach', icon: 'user', action: () => showToast('Coach: Sarah Mitchell 🏋️') },
          { label: 'Back to Plans', icon: 'arrowLeft', action: () => onNavigate('landing') },
        ].map(item => (
          <div key={item.label} onClick={item.action} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: item.label === 'Back to Plans' ? T.dangerBg : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={item.icon} size={18} color={item.label === 'Back to Plans' ? T.danger : T.textDim} />
            </div>
            <span style={{ flex: 1, color: item.label === 'Back to Plans' ? T.danger : '#fff', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            <Icon name="chevronRight" size={18} color={T.textDim} />
          </div>
        ))}
      </div>
    </div>
  );
};
