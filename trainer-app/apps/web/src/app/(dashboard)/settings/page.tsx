'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sun, Moon, Bell, CreditCard, Shield, LogOut,
  Upload, Check, Globe, Clock, Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useThemeStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    clientActivity: true,
    weeklyReport: true,
    newCheckIn: true,
    missedWorkout: true,
    emailDigest: false,
    pushNotifications: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-2xl animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Settings</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Manage your profile, preferences, and subscription.
        </p>
      </div>

      {/* Profile */}
      <Card className="hover-limitless">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-900/20">
              <Upload size={12} className="text-brand-600 dark:text-brand-400" />
            </div>
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={user?.name || 'Coach'} size="xl" />
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-xs hover:bg-brand-600 transition-colors">
                <Upload size={12} />
              </button>
            </div>
            <div>
              <p className="text-sub-md text-[var(--color-text-primary)]">{user?.name || 'Coach'}</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">{user?.email || 'coach@ino.fit'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={name.split(' ')[0] || ''} onChange={(e) => setName(e.target.value)} />
            <Input label="Last Name" value={name.split(' ')[1] || ''} onChange={() => {}} />
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Business Name" placeholder="Your coaching business" />
          <Input label="Timezone" value="America/New_York (EST)" icon={<Clock size={14} />} readOnly />
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} loading={saving} size="md">
            <Check size={14} className="mr-1" /> Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Appearance */}
      <Card className="hover-limitless">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-900/20">
              <Sun size={12} className="text-purple-600 dark:text-purple-400" />
            </div>
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { value: 'light' as const, label: 'Light', icon: Sun, desc: 'Clean and bright' },
              { value: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-2 rounded-xl border p-5 transition-all duration-200',
                  theme === opt.value
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 glow-green'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                )}
              >
                <opt.icon size={22} className={theme === opt.value ? 'text-brand-500' : ''} />
                <span className="text-sub-sm">{opt.label}</span>
                <span className="text-body-xs text-[var(--color-text-tertiary)]">{opt.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="hover-limitless">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
              <Bell size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { key: 'clientActivity' as const, label: 'Client activity', desc: 'When a client logs a workout or meal' },
            { key: 'weeklyReport' as const, label: 'Weekly report', desc: 'Monday morning digest' },
            { key: 'newCheckIn' as const, label: 'New check-in', desc: 'When a client submits a check-in' },
            { key: 'missedWorkout' as const, label: 'Missed workout alerts', desc: 'Clients inactive 3+ days' },
            { key: 'emailDigest' as const, label: 'Email digest', desc: 'Daily summary to your inbox' },
            { key: 'pushNotifications' as const, label: 'Push notifications', desc: 'Browser push alerts' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
              <div>
                <p className="text-sub-sm text-[var(--color-text-primary)]">{item.label}</p>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors duration-200',
                  notifications[item.key] ? 'bg-brand-500' : 'bg-[var(--color-surface-tertiary)]'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200',
                  notifications[item.key] && 'translate-x-5'
                )} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="hover-limitless">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-50 dark:bg-orange-900/20">
              <CreditCard size={12} className="text-orange-600 dark:text-orange-400" />
            </div>
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-brand-500/30 bg-brand-50/30 dark:bg-brand-900/10 p-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sub-md text-[var(--color-text-primary)]">Pro Plan</p>
                <Badge variant="brand">Active</Badge>
              </div>
              <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">$249/month &middot; Up to 50 clients</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">Next billing: May 15, 2026</p>
            </div>
            <Button variant="secondary" size="sm">Manage</Button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
              <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">12</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">Active clients</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
              <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">50</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">Client limit</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
              <p className="text-heading-3 tabular-nums text-brand-500">38</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="hover-limitless">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-50 dark:bg-red-900/20">
              <Shield size={12} className="text-red-600 dark:text-red-400" />
            </div>
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="secondary" size="md" className="w-full justify-start">
            <Shield size={14} className="mr-2" /> Change Password
          </Button>
          <Button variant="secondary" size="md" className="w-full justify-start">
            <Smartphone size={14} className="mr-2" /> Enable Two-Factor Auth
          </Button>
          <Button variant="secondary" size="md" className="w-full justify-start">
            <Globe size={14} className="mr-2" /> Active Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error-500/20">
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <p className="text-sub-sm text-[var(--color-text-primary)]">Sign out of your account</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)]">You'll need to sign in again to access your dashboard.</p>
          </div>
          <Button variant="danger" size="md" icon={<LogOut size={14} />}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
