'use client';

import { useState } from 'react';
import { Check, Plug, Zap, Activity, Heart, Footprints, Watch, Smartphone, Apple, Moon, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const INTEGRATIONS = [
  { id: 'whoop', name: 'WHOOP', category: 'Recovery', icon: Watch, color: 'bg-black text-white', description: 'Auto-sync HRV, strain, sleep, recovery score', connected: true, dataPoints: ['HRV', 'Strain', 'Recovery', 'Sleep stages'] },
  { id: 'strava', name: 'Strava', category: 'Cardio', icon: Activity, color: 'bg-orange-500 text-white', description: 'Import runs, rides, swims automatically', connected: true, dataPoints: ['Distance', 'Pace', 'HR zones', 'Elevation'] },
  { id: 'apple-health', name: 'Apple Health', category: 'Health', icon: Apple, color: 'bg-gray-900 text-white', description: 'All iOS health data in one place', connected: true, dataPoints: ['Steps', 'Weight', 'HR', 'Workouts'] },
  { id: 'google-fit', name: 'Google Fit', category: 'Health', icon: Heart, color: 'bg-blue-500 text-white', description: 'Android health platform sync', connected: false, dataPoints: ['Steps', 'Weight', 'Workouts'] },
  { id: 'oura', name: 'Oura Ring', category: 'Recovery', icon: Moon, color: 'bg-purple-600 text-white', description: 'Sleep, readiness, and activity scores', connected: false, dataPoints: ['Sleep score', 'Readiness', 'HRV', 'Body temp'] },
  { id: 'garmin', name: 'Garmin', category: 'Cardio', icon: Watch, color: 'bg-blue-700 text-white', description: 'Connect IQ activity data', connected: false, dataPoints: ['Workouts', 'VO2 max', 'Training load'] },
  { id: 'fitbit', name: 'Fitbit', category: 'Health', icon: Footprints, color: 'bg-teal-500 text-white', description: 'Steps, sleep, heart rate', connected: false, dataPoints: ['Steps', 'Sleep', 'HR', 'Weight'] },
  { id: 'myfitnesspal', name: 'MyFitnessPal', category: 'Nutrition', icon: Apple, color: 'bg-green-600 text-white', description: 'Import food logs & macros', connected: true, dataPoints: ['Calories', 'Macros', 'Food log'] },
  { id: 'zapier', name: 'Zapier', category: 'Automation', icon: Zap, color: 'bg-orange-600 text-white', description: '5,000+ app integrations via Zaps', connected: false, dataPoints: ['Custom workflows'] },
  { id: 'stripe', name: 'Stripe', category: 'Payments', icon: TrendingUp, color: 'bg-indigo-600 text-white', description: 'Payment processing & subscriptions', connected: true, dataPoints: ['Subscriptions', 'Invoices'] },
  { id: 'calendly', name: 'Calendly', category: 'Scheduling', icon: Smartphone, color: 'bg-blue-600 text-white', description: 'Book 1:1 calls with clients', connected: false, dataPoints: ['Bookings', 'Availability'] },
  { id: 'intercom', name: 'Intercom', category: 'Support', icon: Zap, color: 'bg-blue-500 text-white', description: 'Live chat + email automation', connected: false, dataPoints: ['Conversations', 'Users'] },
];

const CATEGORIES = ['All', 'Recovery', 'Cardio', 'Health', 'Nutrition', 'Automation', 'Payments', 'Scheduling', 'Support'];

export default function IntegrationsPage() {
  const [category, setCategory] = useState('All');
  const filtered = INTEGRATIONS.filter((i) => category === 'All' || i.category === category);
  const connected = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Integrations</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Auto-sync client data from wearables and apps. No more manual logging.
        </p>
      </div>

      {/* Summary */}
      <Card className="card-domain">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
              <Plug size={20} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sub-md text-[var(--color-text-inverse)]">{connected} of {INTEGRATIONS.length} integrations connected</p>
              <p className="text-body-sm text-[var(--color-text-secondary)]">
                Your clients are auto-syncing data from {connected} sources. That's {connected * 4}+ data points captured per client per day.
              </p>
            </div>
            <div className="text-right">
              <p className="text-heading-2 tabular-nums text-brand-400">{Math.round((connected / INTEGRATIONS.length) * 100)}%</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-full px-4 py-1.5 text-body-xs font-medium transition-colors',
              category === cat ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((int) => (
          <Card key={int.id} className={cn('hover-limitless', int.connected && 'border-brand-500/30')}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', int.color)}>
                  <int.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sub-md text-[var(--color-text-primary)]">{int.name}</h3>
                    {int.connected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <Badge variant="default">{int.category}</Badge>
                </div>
              </div>
              <p className="text-body-sm text-[var(--color-text-secondary)] mb-3 leading-relaxed">{int.description}</p>

              {/* Data points */}
              <div className="flex flex-wrap gap-1 mb-4">
                {int.dataPoints.slice(0, 4).map((dp) => (
                  <span key={dp} className="rounded-md bg-[var(--color-surface-secondary)] px-2 py-0.5 text-body-xs text-[var(--color-text-tertiary)]">
                    {dp}
                  </span>
                ))}
              </div>

              <Button
                variant={int.connected ? 'secondary' : 'primary'}
                size="sm"
                className="w-full"
                icon={int.connected ? undefined : <Plug size={12} />}
              >
                {int.connected ? 'Manage' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
