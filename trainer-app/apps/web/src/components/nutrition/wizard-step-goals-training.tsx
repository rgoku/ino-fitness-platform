'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WizardFormData } from './wizard-step-client';

const goals = [
  { value: 'bulk', label: 'Lean bulk' },
  { value: 'cut', label: 'Cut / fat loss' },
  { value: 'recomp', label: 'Recomp' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'performance', label: 'Performance' },
  { value: 'anti-inflammatory', label: 'Anti-inflammatory' },
  { value: 'reverse-diet', label: 'Reverse diet' },
  { value: 'comp-prep', label: 'Competition prep' },
  { value: 'metabolic-repair', label: 'Metabolic repair' },
  { value: 'gut-health', label: 'Gut health reset' },
];

const goalLabels: Record<string, string> = Object.fromEntries(goals.map((g) => [g.value, g.label]));

const timelines = [
  { value: '4-weeks', label: '4 weeks' },
  { value: '8-weeks', label: '8 weeks' },
  { value: '12-weeks', label: '12 weeks' },
  { value: '16-weeks', label: '16 weeks' },
  { value: '6-months', label: '6 months' },
];

const splitTypes = [
  { value: 'ppl', label: 'Push/Pull/Legs' },
  { value: 'upper-lower', label: 'Upper/Lower' },
  { value: 'full-body', label: 'Full body' },
  { value: 'bro-split', label: 'Bro split' },
  { value: 'custom', label: 'Custom' },
];

const cardioTypes = [
  { value: 'none', label: 'None' },
  { value: 'liss', label: 'LISS' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'mixed', label: 'Mixed' },
];

const trainingTimes = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

interface StepGoalsProps {
  formData: WizardFormData;
  setFormData: (data: WizardFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WizardStepGoalsTraining({ formData, setFormData, onBack, onNext }: StepGoalsProps) {
  const update = (patch: Partial<WizardFormData>) => setFormData({ ...formData, ...patch });

  const toggleGoal = (value: string) => {
    const has = formData.goals.includes(value);
    update({
      goals: has
        ? formData.goals.filter((g) => g !== value)
        : [...formData.goals, value],
    });
  };

  const isValid = formData.goals.length > 0 && formData.timeline && formData.trainingDaysPerWeek > 0;

  const selectClass = "block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  const radioClass = (selected: boolean) =>
    cn(
      'flex-1 rounded-lg border py-2 text-center text-xs font-medium transition-colors cursor-pointer',
      selected
        ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
    );

  const chipClass = (selected: boolean) =>
    cn(
      'rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-center',
      selected
        ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
    );

  return (
    <div className="space-y-5">
      {/* Goals (multi-select) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          Goals <span className="font-normal text-[var(--color-text-tertiary)]">(select one or more)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {goals.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => toggleGoal(g.value)}
              className={chipClass(formData.goals.includes(g.value))}
            >
              {g.label}
            </button>
          ))}
        </div>
        {formData.goals.length > 1 && (
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            Primary: {goalLabels[formData.goals[0]] || formData.goals[0]} (drives calorie/macro targets)
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Timeline</label>
        <div className="flex gap-2">
          {timelines.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update({ timeline: t.value })}
              className={radioClass(formData.timeline === t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Weight + Body Fat */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Target weight (kg)"
          type="number"
          value={formData.targetWeight || ''}
          onChange={(e) => update({ targetWeight: Number(e.target.value) })}
          placeholder="75"
          min={30}
          max={300}
        />
        <Input
          label="Target body fat %"
          type="number"
          value={formData.targetBodyFat || ''}
          onChange={(e) => update({ targetBodyFat: Number(e.target.value) })}
          placeholder="12"
          min={3}
          max={50}
        />
      </div>

      {/* Training Days + Split */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Training days/week</label>
          <div className="flex gap-1.5">
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update({ trainingDaysPerWeek: n })}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                  formData.trainingDaysPerWeek === n
                    ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Split type</label>
          <select
            value={formData.splitType}
            onChange={(e) => update({ splitType: e.target.value as WizardFormData['splitType'] })}
            className={selectClass}
          >
            {splitTypes.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cardio */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Cardio type</label>
          <div className="flex gap-2">
            {cardioTypes.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => update({ cardioType: c.value })}
                className={radioClass(formData.cardioType === c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Input
            label="Cardio sessions/week"
            type="number"
            value={formData.cardioFrequency || ''}
            onChange={(e) => update({ cardioFrequency: Number(e.target.value) })}
            placeholder="3"
            min={0}
            max={14}
          />
        </div>
      </div>

      {/* Training time + Fasted cardio */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Training time</label>
          <div className="flex gap-2">
            {trainingTimes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update({ trainingTime: t.value as WizardFormData['trainingTime'] })}
                className={radioClass(formData.trainingTime === t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Fasted cardio</label>
          <div className="flex gap-2">
            {[false, true].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => update({ fastedCardio: val })}
                className={radioClass(formData.fastedCardio === val)}
              >
                {val ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <Button size="sm" onClick={onNext} disabled={!isValid}>Next</Button>
      </div>
    </div>
  );
}
