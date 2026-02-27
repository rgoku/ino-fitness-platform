'use client';

import { ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WizardFormData } from './wizard-step-client';

const caffeineLabels: Record<string, string> = {
  none: 'None', low: 'Low', moderate: 'Moderate', high: 'High',
};
const alcoholLabels: Record<string, string> = {
  none: 'None', occasional: 'Occasional', moderate: 'Moderate', heavy: 'Heavy',
};
const suppOptions = [
  { value: 'open' as const, label: 'Open to supplements' },
  { value: 'minimal' as const, label: 'Minimal' },
  { value: 'none' as const, label: 'None' },
];
const refeedOptions = [
  { value: 'none', label: 'None' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'as-needed', label: 'As needed' },
];

interface StepLifestyleProps {
  formData: WizardFormData;
  setFormData: (data: WizardFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WizardStepLifestyle({ formData, setFormData, onBack, onNext }: StepLifestyleProps) {
  const update = (patch: Partial<WizardFormData>) => setFormData({ ...formData, ...patch });

  const radioClass = (selected: boolean) =>
    cn(
      'flex-1 rounded-lg border py-2 text-center text-xs font-medium transition-colors cursor-pointer',
      selected
        ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
    );

  return (
    <div className="space-y-5">
      {/* ── Client-reported lifestyle (read-only) ── */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3.5 py-2.5">
        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
              Client-reported lifestyle data
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
              Reported by {formData.clientName || 'the client'} in their app.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        {/* Sleep & Hydration */}
        <ReadOnlySection title="Sleep & Hydration">
          <ReadOnlyRow label="Sleep" value={`${formData.sleepHours || '—'} hours/night`} highlight={formData.sleepHours > 0 && formData.sleepHours < 6} />
          <ReadOnlyRow label="Water intake" value={`${formData.waterIntake || '—'} L/day`} />
        </ReadOnlySection>

        {/* Habits */}
        <ReadOnlySection title="Habits">
          <ReadOnlyRow label="Caffeine" value={caffeineLabels[formData.caffeineTolerance]} />
          <ReadOnlyRow label="Alcohol" value={alcoholLabels[formData.alcohol]} highlight={formData.alcohol === 'heavy'} />
          <ReadOnlyRow label="Stress eating" value={formData.stressEating ? 'Yes' : 'No'} highlight={formData.stressEating} />
          <ReadOnlyRow label="Late-night snacking" value={formData.lateNightSnacking ? 'Yes' : 'No'} highlight={formData.lateNightSnacking} />
        </ReadOnlySection>

        {/* Current Supplements */}
        <ReadOnlySection title="Current Supplements">
          {formData.currentSupplements.length > 0 ? (
            <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
              {formData.currentSupplements.map((s) => (
                <span key={s} className="inline-flex items-center rounded-md bg-[var(--color-surface-tertiary)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">None reported</p>
          )}
        </ReadOnlySection>
      </div>

      {/* ── Coach Controls (editable) ── */}
      <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            Coach Controls
          </label>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
            Override auto-calculated values. Leave at 0 to let the generator decide.
          </p>
        </div>

        {/* Supplement preference */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Supplementation preference</label>
          <div className="flex gap-2">
            {suppOptions.map((opt) => (
              <button key={opt.value} type="button" onClick={() => update({ supplementPreference: opt.value })} className={radioClass(formData.supplementPreference === opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Protein floor (g/kg)"
            type="number"
            value={formData.proteinFloor || ''}
            onChange={(e) => update({ proteinFloor: Number(e.target.value) })}
            placeholder="0"
            min={0}
            max={5}
          />
          <Input
            label="Max deficit %"
            type="number"
            value={formData.maxDeficitPercent || ''}
            onChange={(e) => update({ maxDeficitPercent: Number(e.target.value) })}
            placeholder="0"
            min={0}
            max={50}
          />
          <Input
            label="Carb cap (g)"
            type="number"
            value={formData.carbCap || ''}
            onChange={(e) => update({ carbCap: Number(e.target.value) })}
            placeholder="0"
            min={0}
            max={800}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Fat minimum (g)"
            type="number"
            value={formData.fatMinimum || ''}
            onChange={(e) => update({ fatMinimum: Number(e.target.value) })}
            placeholder="0"
            min={0}
            max={200}
          />
          <Input
            label="Sodium cap (mg)"
            type="number"
            value={formData.sodiumCap || ''}
            onChange={(e) => update({ sodiumCap: Number(e.target.value) })}
            placeholder="0"
            min={0}
            max={6000}
          />
          <Input
            label="Fiber min (g)"
            type="number"
            value={formData.fiberMinimum || ''}
            onChange={(e) => update({ fiberMinimum: Number(e.target.value) })}
            placeholder="0"
            min={0}
            max={80}
          />
        </div>

        {/* Refeed frequency */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Refeed frequency</label>
          <div className="flex gap-2">
            {refeedOptions.map((r) => (
              <button key={r.value} type="button" onClick={() => update({ refeedFrequency: r.value })} className={radioClass(formData.refeedFrequency === r.value)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coach notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          Coach notes <span className="font-normal text-[var(--color-text-tertiary)]">(optional)</span>
        </label>
        <textarea
          value={formData.coachNotes}
          onChange={(e) => update({ coachNotes: e.target.value })}
          placeholder="e.g., client skips breakfast, prefers high-volume meals, needs to eat at work..."
          rows={2}
          className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <Button size="sm" onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

function ReadOnlySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="px-3 text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">{title}</p>
      {children}
    </div>
  );
}

function ReadOnlyRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1">
      <span className="text-xs text-[var(--color-text-tertiary)] w-32 shrink-0">{label}</span>
      <span className={cn(
        'text-xs',
        highlight
          ? 'font-medium text-amber-600 dark:text-amber-400'
          : 'text-[var(--color-text-primary)]'
      )}>
        {value}
      </span>
    </div>
  );
}
