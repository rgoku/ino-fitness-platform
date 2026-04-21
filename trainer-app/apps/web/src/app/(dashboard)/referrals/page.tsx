'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Gift, DollarSign, Users, Mail, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';

const REFERRALS = [
  { id: 1, name: 'James W.', email: 'james@example.com', status: 'signed_up', date: '2026-04-15', earnings: 49.80 },
  { id: 2, name: 'Maria S.', email: 'maria@example.com', status: 'active', date: '2026-03-28', earnings: 99.60 },
  { id: 3, name: 'Sophie T.', email: 'sophie@example.com', status: 'active', date: '2026-03-10', earnings: 99.60 },
  { id: 4, name: 'Alex Chen', email: 'alex@example.com', status: 'invited', date: '2026-04-18', earnings: 0 },
  { id: 5, name: 'Tom B.', email: 'tom@example.com', status: 'active', date: '2026-02-20', earnings: 149.40 },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const referralCode = 'SARAH20';
  const referralUrl = `https://ino.fit/r/${referralCode}`;

  const totalEarnings = REFERRALS.reduce((s, r) => s + r.earnings, 0);
  const activeReferrals = REFERRALS.filter((r) => r.status === 'active').length;
  const pendingReferrals = REFERRALS.filter((r) => r.status === 'invited' || r.status === 'signed_up').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    setInviteSent(true);
    setEmail('');
    setTimeout(() => setInviteSent(false), 2500);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Referrals</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Earn 20% recurring commission for every coach you invite to INÖ.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-limitless">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-body-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Total Earned</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">${totalEarnings.toFixed(2)}</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">Lifetime earnings from referrals</p>
          </CardContent>
        </Card>
        <Card className="hover-limitless">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-body-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Active Referrals</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Users size={16} />
              </div>
            </div>
            <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{activeReferrals}</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">Paying subscribers via your link</p>
          </CardContent>
        </Card>
        <Card className="hover-limitless">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-body-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Pending</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Gift size={16} />
              </div>
            </div>
            <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{pendingReferrals}</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">Invited, not yet converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral link box */}
      <Card className="card-domain">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10">
              <Sparkles size={18} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sub-md text-[var(--color-text-inverse)]">Your referral link</p>
              <p className="text-body-sm text-[var(--color-text-secondary)]">
                Share with other coaches. They get 20% off first 3 months, you earn 20% recurring.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2">
              <span className="text-sub-sm font-mono text-[var(--color-text-inverse)]">{referralUrl}</span>
            </div>
            <Button
              size="md"
              variant={copied ? 'secondary' : 'primary'}
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="md" variant="secondary" icon={<Share2 size={14} />}>Share</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite by email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={14} className="text-brand-500" />
            Invite by email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              icon={inviteSent ? <Check size={14} /> : <Mail size={14} />}
              onClick={handleInvite}
              disabled={!email.includes('@')}
            >
              {inviteSent ? 'Sent!' : 'Send Invite'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress to next tier */}
      <Card>
        <CardHeader>
          <CardTitle>Next milestone: 10 active referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ProgressBar value={activeReferrals} max={10} showValue variant="brand" />
            <p className="text-body-sm text-[var(--color-text-secondary)]">
              Get {10 - activeReferrals} more active referrals to unlock <span className="font-semibold text-brand-500">25% commission rate</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referral list */}
      <Card>
        <CardHeader>
          <CardTitle>Your referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Coach</th>
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Joined</th>
                  <th className="pb-3 text-right text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {REFERRALS.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--color-border-light)]">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.name} size="sm" />
                        <div>
                          <p className="text-sub-sm text-[var(--color-text-primary)]">{r.name}</p>
                          <p className="text-body-xs text-[var(--color-text-tertiary)]">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={r.status === 'active' ? 'success' : r.status === 'signed_up' ? 'info' : 'default'}
                        dot
                      >
                        {r.status === 'active' ? 'Active' : r.status === 'signed_up' ? 'Signed up' : 'Invited'}
                      </Badge>
                    </td>
                    <td className="py-3 text-[var(--color-text-tertiary)]">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 text-right tabular-nums text-[var(--color-text-primary)] font-medium">
                      ${r.earnings.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
