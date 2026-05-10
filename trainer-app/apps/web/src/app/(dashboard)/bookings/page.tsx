'use client';

import { useState } from 'react';
import { Plus, Clock, Video, User, Calendar, MapPin, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const BOOKINGS = [
  { id: 'b1', client: 'James W.', type: 'check-in', date: '2026-04-21', time: '10:00', duration: 30, mode: 'video', status: 'confirmed' },
  { id: 'b2', client: 'Maria S.', type: 'onboarding', date: '2026-04-21', time: '14:00', duration: 60, mode: 'video', status: 'confirmed' },
  { id: 'b3', client: 'Sophie T.', type: 'check-in', date: '2026-04-22', time: '09:00', duration: 30, mode: 'in-person', status: 'pending' },
  { id: 'b4', client: 'Alex Chen', type: 'program-review', date: '2026-04-22', time: '16:00', duration: 45, mode: 'video', status: 'confirmed' },
  { id: 'b5', client: 'Emma D.', type: 'check-in', date: '2026-04-23', time: '11:00', duration: 30, mode: 'video', status: 'confirmed' },
];

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm
const DAYS = ['Mon 21', 'Tue 22', 'Wed 23', 'Thu 24', 'Fri 25'];

const TYPE_COLORS: Record<string, string> = {
  'check-in': 'bg-brand-500',
  onboarding: 'bg-purple-500',
  'program-review': 'bg-blue-500',
};

export default function BookingsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Bookings</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            1:1 calls, check-ins, and onboarding sessions with clients.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Calendar size={14} />}>Availability</Button>
          <Button variant="primary" icon={<Plus size={14} />}>New Booking</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'This Week', value: '8', sub: 'sessions' },
          { label: 'Today', value: '2', sub: 'remaining' },
          { label: 'Avg Duration', value: '35m', sub: 'per session' },
          { label: 'Completion', value: '96%', sub: 'show rate' },
        ].map((s) => (
          <Card key={s.label} className="hover-limitless">
            <CardContent className="p-4 text-center">
              <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{s.value}</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">{s.label} · {s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={<ChevronLeft size={14} />}>Prev</Button>
        <p className="text-sub-md text-[var(--color-text-primary)]">April 21 – 25, 2026</p>
        <Button variant="ghost" size="sm">Next <ChevronRight size={14} className="ml-1" /></Button>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="grid grid-cols-[60px_repeat(5,1fr)] min-w-[700px]">
            {/* Header */}
            <div className="border-b border-r border-[var(--color-border-light)] p-2" />
            {DAYS.map((d) => (
              <div key={d} className="border-b border-r last:border-r-0 border-[var(--color-border-light)] p-3 text-center">
                <p className="text-body-xs font-medium text-[var(--color-text-primary)]">{d.split(' ')[0]}</p>
                <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{d.split(' ')[1]}</p>
              </div>
            ))}

            {/* Time rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-r border-b border-[var(--color-border-light)] p-2 text-right">
                  <span className="text-body-xs text-[var(--color-text-tertiary)] tabular-nums">{hour}:00</span>
                </div>
                {DAYS.map((day) => {
                  const dayNum = day.split(' ')[1];
                  const booking = BOOKINGS.find((b) => b.date.endsWith(`-${dayNum}`) && parseInt(b.time) === hour);
                  return (
                    <div key={day} className="border-r last:border-r-0 border-b border-[var(--color-border-light)] p-1 min-h-[50px] relative hover:bg-[var(--color-surface-hover)] transition-colors">
                      {booking && (
                        <div className={cn(
                          'rounded-md p-2 text-white text-body-xs cursor-pointer',
                          TYPE_COLORS[booking.type] || 'bg-brand-500'
                        )}>
                          <p className="font-medium truncate">{booking.client}</p>
                          <p className="opacity-80">{booking.time} · {booking.duration}m</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming list */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BOOKINGS.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-lg p-3 hover:bg-[var(--color-surface-hover)] transition-colors">
              <Avatar name={b.client} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sub-sm text-[var(--color-text-primary)]">{b.client}</p>
                <div className="flex items-center gap-2 text-body-xs text-[var(--color-text-tertiary)]">
                  <Clock size={11} /> {b.time} · {b.duration}m
                  <span className="capitalize">{b.type.replace('-', ' ')}</span>
                </div>
              </div>
              <Badge variant={b.mode === 'video' ? 'info' : 'default'}>
                {b.mode === 'video' ? <><Video size={10} className="mr-1" /> Video</> : <><MapPin size={10} className="mr-1" /> In-person</>}
              </Badge>
              <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'} dot>{b.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
