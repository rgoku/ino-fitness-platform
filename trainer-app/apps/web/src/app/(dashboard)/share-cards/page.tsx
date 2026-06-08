'use client';

import { useRef, useState } from 'react';
import {
  Download, Instagram, Trophy, TrendingUp, Flame, Copy, Check,
  Share2, MessageCircle, Mail, Facebook, Twitter, Music2, MessageSquare, ImageDown,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CARD_STYLES = [
  { id: 'dark', label: 'Dark', bg: 'bg-gradient-to-br from-[#0A0F1E] to-[#131B2E]', text: 'text-white' },
  { id: 'brand', label: 'Brand', bg: 'bg-gradient-to-br from-brand-500 to-cyan-500', text: 'text-white' },
  { id: 'minimal', label: 'Minimal', bg: 'bg-white', text: 'text-gray-900' },
];

const CARD_TYPES = [
  { id: 'transformation', label: 'Transformation', icon: TrendingUp },
  { id: 'pr', label: 'New PR', icon: Trophy },
  { id: 'streak', label: 'Streak', icon: Flame },
];

const CLIENT_NAME = 'James Wilson';
const SHARE_URL = typeof window !== 'undefined' ? window.location.origin + '/share/jw' : 'https://ino.fitness/share/jw';

export default function ShareCardsPage() {
  const [style, setStyle] = useState('dark');
  const [type, setType] = useState('transformation');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentStyle = CARD_STYLES.find((s) => s.id === style) || CARD_STYLES[0];

  const cardLabel =
    type === 'transformation' ? '12 Week Transformation' :
    type === 'pr' ? 'New Personal Record' : 'Streak Achievement';

  const shareText = `${CLIENT_NAME} just hit a ${cardLabel.toLowerCase()} with INÖ Fitness`;

  async function renderToBlob(): Promise<Blob | null> {
    if (!previewRef.current) return null;
    const dataUrl = await toPng(previewRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: style === 'minimal' ? '#ffffff' : '#0A0F1E',
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  async function downloadCard() {
    setBusy('download');
    try {
      const blob = await renderToBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${CLIENT_NAME.replace(/\s+/g, '-').toLowerCase()}-${type}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setBusy(null); }
  }

  async function nativeShare() {
    setBusy('share');
    try {
      const blob = await renderToBlob();
      if (!blob) return;
      const file = new File([blob], `${CLIENT_NAME}-${type}.png`, { type: 'image/png' });
      const data: ShareData = { title: 'INÖ Progress', text: shareText, files: [file] };
      // @ts-ignore — canShare is supported on mobile browsers
      if (navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        await downloadCard();
        window.open(SHARE_URL, '_blank');
      }
    } catch (err) {
      // user cancelled — silent
    } finally { setBusy(null); }
  }

  async function shareToInstagram() {
    // Web cannot upload directly to IG Stories. Best UX: download the image, open IG.
    await downloadCard();
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (isMobile) window.location.href = 'instagram://story-camera';
    else window.open('https://www.instagram.com/', '_blank');
  }

  async function shareToTikTok() {
    await downloadCard();
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (isMobile) window.location.href = 'snssdk1233://upload?source=share_card';
    else window.open('https://www.tiktok.com/upload', '_blank');
  }

  function shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=500');
  }

  function shareToTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SHARE_URL)}`;
    window.open(url, '_blank', 'width=600,height=500');
  }

  function shareToWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${SHARE_URL}`)}`;
    window.open(url, '_blank');
  }

  function shareViaSMS() {
    window.location.href = `sms:?&body=${encodeURIComponent(`${shareText} ${SHARE_URL}`)}`;
  }

  function shareViaEmail() {
    const subject = `${CLIENT_NAME}'s ${cardLabel}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${shareText}\n\n${SHARE_URL}`)}`;
  }

  function copyLink() {
    navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Share Cards</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Auto-generate Instagram-ready progress cards for your clients. Free marketing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Preview</p>
          <div
            ref={previewRef}
            className={cn('rounded-2xl p-8 aspect-square flex flex-col justify-between', currentStyle.bg, currentStyle.text)}
          >
            <div>
              <p className={cn('text-body-xs uppercase tracking-widest', style === 'minimal' ? 'text-gray-500' : 'opacity-70')}>
                {cardLabel.toUpperCase()}
              </p>
              <h2 className="text-3xl font-bold mt-2">{CLIENT_NAME}</h2>
            </div>

            {type === 'transformation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Weight', change: '-4kg' },
                    { label: 'Body Fat', change: '-4.3%' },
                    { label: 'Strength', change: 'total' },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>{m.label}</p>
                      <p className="text-2xl font-bold tabular-nums">{m.change}</p>
                    </div>
                  ))}
                </div>
                <div className={cn('h-px', style === 'minimal' ? 'bg-gray-200' : 'bg-white/20')} />
                <div className="flex justify-between items-center">
                  <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>94% compliance · 45 workouts</p>
                  <p className="text-body-sm font-semibold">INÖ Fitness</p>
                </div>
              </div>
            )}

            {type === 'pr' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Trophy size={40} className={cn('mx-auto mb-3', style === 'brand' ? 'text-white' : 'text-amber-500')} />
                  <p className="text-5xl font-bold tabular-nums">102.5 kg</p>
                  <p className={cn('text-lg mt-1', style === 'minimal' ? 'text-gray-500' : 'opacity-70')}>Bench Press</p>
                  <p className={cn('text-body-sm mt-2', style === 'minimal' ? 'text-gray-400' : 'opacity-50')}>+32.5kg since starting</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>12-week program</p>
                  <p className="text-body-sm font-semibold">INÖ Fitness</p>
                </div>
              </div>
            )}

            {type === 'streak' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Flame size={48} className={cn('mx-auto mb-3', style === 'brand' ? 'text-white' : 'text-orange-500')} />
                  <p className="text-6xl font-bold tabular-nums">22</p>
                  <p className={cn('text-xl mt-1', style === 'minimal' ? 'text-gray-500' : 'opacity-70')}>Day Streak</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>Consistency champion</p>
                  <p className="text-body-sm font-semibold">INÖ Fitness</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Card Type</p>
            <div className="flex gap-2">
              {CARD_TYPES.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)} className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-body-sm transition-colors',
                  type === t.id ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                )}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Style</p>
            <div className="flex gap-2">
              {CARD_STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={cn(
                  'flex-1 rounded-lg border p-3 text-body-sm font-medium text-center transition-colors capitalize',
                  style === s.id ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button variant="primary" size="lg" className="w-full" icon={<Share2 size={16} />} onClick={nativeShare} disabled={busy !== null}>
              {busy === 'share' ? 'Opening share sheet…' : 'Share to apps (Instagram, TikTok, more…)'}
            </Button>
            <Button variant="secondary" size="lg" className="w-full" icon={<ImageDown size={16} />} onClick={downloadCard} disabled={busy !== null}>
              {busy === 'download' ? 'Generating…' : 'Save to phone (1080×1080 PNG)'}
            </Button>
          </div>

          <div>
            <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Quick share</p>
            <div className="grid grid-cols-4 gap-2">
              <PlatformButton icon={<Instagram size={18} />} label="Instagram" onClick={shareToInstagram} accent="from-fuchsia-500 to-orange-400" />
              <PlatformButton icon={<Music2 size={18} />} label="TikTok" onClick={shareToTikTok} accent="from-cyan-400 to-pink-500" />
              <PlatformButton icon={<Facebook size={18} />} label="Facebook" onClick={shareToFacebook} accent="from-blue-600 to-blue-500" />
              <PlatformButton icon={<Twitter size={18} />} label="X" onClick={shareToTwitter} accent="from-slate-700 to-slate-900" />
              <PlatformButton icon={<MessageCircle size={18} />} label="WhatsApp" onClick={shareToWhatsApp} accent="from-emerald-500 to-emerald-600" />
              <PlatformButton icon={<MessageSquare size={18} />} label="SMS" onClick={shareViaSMS} accent="from-sky-500 to-sky-600" />
              <PlatformButton icon={<Mail size={18} />} label="Email" onClick={shareViaEmail} accent="from-amber-500 to-orange-500" />
              <PlatformButton
                icon={copied ? <Check size={18} /> : <Copy size={18} />}
                label={copied ? 'Copied' : 'Copy Link'}
                onClick={copyLink}
                accent="from-zinc-500 to-zinc-600"
              />
            </div>
          </div>

          <Card className="card-domain">
            <CardContent className="p-4">
              <p className="text-body-xs text-[var(--color-text-secondary)]">
                <span className="text-brand-400 font-medium">Pro tip:</span> Clients who share progress cards generate 3x more referrals. Enable auto-generate after every weekly check-in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface PlatformButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent: string;
}

function PlatformButton({ icon, label, onClick, accent }: PlatformButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] hover:-translate-y-0.5"
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm', accent)}>
        {icon}
      </span>
      <span className="text-body-xs font-medium leading-tight">{label}</span>
    </button>
  );
}
