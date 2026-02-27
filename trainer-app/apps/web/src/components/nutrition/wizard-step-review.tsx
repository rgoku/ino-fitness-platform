'use client';

import { useState, useEffect } from 'react';
import { Loader2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WizardFormData } from './wizard-step-client';
import type { BloodWorkRecord } from '@/lib/blood-work-types';

const goalLabels: Record<string, string> = {
  bulk: 'Lean bulk',
  cut: 'Cut / fat loss',
  recomp: 'Recomp',
  maintenance: 'Maintenance',
  performance: 'Performance',
  'anti-inflammatory': 'Anti-inflammatory',
  'reverse-diet': 'Reverse diet',
  'comp-prep': 'Competition prep',
  'metabolic-repair': 'Metabolic repair',
  'gut-health': 'Gut health reset',
};

const activityLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Light (1–2x/week)',
  moderate: 'Moderate (3–4x/week)',
  active: 'Active (5–6x/week)',
  'very-active': 'Very active (daily+)',
};

const suppLabels: Record<string, string> = {
  open: 'Open to supplements',
  minimal: 'Minimal',
  none: 'None',
};

const splitLabels: Record<string, string> = {
  ppl: 'Push/Pull/Legs',
  'upper-lower': 'Upper/Lower',
  'full-body': 'Full body',
  'bro-split': 'Bro split',
  custom: 'Custom',
};

const statusMessages = [
  'Analyzing client profile & medical history...',
  'Searching PubMed for relevant research...',
  'Calculating training/rest day macro splits...',
  'Building meal plan with preferred food sources...',
  'Generating grocery list & supplement timing...',
  'Finalizing evidence-backed recommendations...',
];

interface StepReviewProps {
  formData: WizardFormData;
  bloodWorkRecords: BloodWorkRecord[];
  generating: boolean;
  onBack: () => void;
  onGenerate: () => void;
}

export function WizardStepReview({
  formData,
  bloodWorkRecords,
  generating,
  onBack,
  onGenerate,
}: StepReviewProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!generating) {
      setStatusIndex(0);
      return;
    }
    const intervals = [800, 1000, 800, 1000, 500, 400];
    let i = 0;
    const advance = () => {
      i++;
      if (i < statusMessages.length) {
        setStatusIndex(i);
        setTimeout(advance, intervals[i]);
      }
    };
    setTimeout(advance, intervals[0]);
  }, [generating]);

  const clientBloodWork = bloodWorkRecords.filter((r) => r.clientId === formData.clientId);
  const hasBloodWork = clientBloodWork.length > 0;

  const restrictions = formData.restrictions.length > 0
    ? formData.restrictions.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')
    : 'None';

  const cuisines = formData.cuisines.length > 0
    ? formData.cuisines.map((c) => c.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
    : 'No preference';

  const formatSources = (sources: string[]) =>
    sources.length > 0
      ? sources.map((s) => s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
      : 'Any';

  const medicalItems: string[] = [];
  if (formData.diabetes !== 'none') medicalItems.push(`Diabetes: ${formData.diabetes}`);
  if (formData.pcos) medicalItems.push('PCOS');
  if (formData.thyroid !== 'none') medicalItems.push(formData.thyroid.charAt(0).toUpperCase() + formData.thyroid.slice(1));
  if (formData.bloodPressure !== 'normal') medicalItems.push(`BP: ${formData.bloodPressure}`);
  if (formData.digestiveIssues.length > 0) medicalItems.push(formData.digestiveIssues.join(', ').toUpperCase());
  if (formData.allergies.length > 0) medicalItems.push(`Allergies: ${formData.allergies.join(', ')}`);
  if (formData.foodIntolerances.length > 0) medicalItems.push(`Intol: ${formData.foodIntolerances.join(', ')}`);
  if (formData.pregnancyStatus !== 'none') medicalItems.push(formData.pregnancyStatus.charAt(0).toUpperCase() + formData.pregnancyStatus.slice(1));

  return (
    <div className="space-y-4 relative">
      {/* Generating overlay */}
      {generating && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-surface)]/90 rounded-lg">
          <Loader2 size={24} className="animate-spin text-[var(--color-accent)] mb-3" />
          <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">
            {statusMessages[statusIndex]}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className={`space-y-3 ${generating ? 'opacity-30' : ''}`}>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Review</h3>

        <div className="rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {/* Client & Body */}
          <Section title="Client & Body">
            <Row label="Client" value={formData.clientName} />
            <Row label="Sex" value={formData.sex.charAt(0).toUpperCase() + formData.sex.slice(1)} />
            <Row label="Biometrics" value={`${formData.age}y · ${formData.weight}kg · ${formData.height}cm${formData.bodyFatPercent ? ` · ${formData.bodyFatPercent}% BF` : ''}`} />
            <Row label="Activity" value={activityLabels[formData.activityLevel] || formData.activityLevel} />
            {formData.dailySteps > 0 && <Row label="Daily steps" value={formData.dailySteps.toLocaleString()} />}
          </Section>

          {/* Health */}
          <Section title="Health">
            <Row label="Conditions" value={medicalItems.length > 0 ? medicalItems.join(' · ') : 'None reported'} />
            {formData.injuries && <Row label="Injuries" value={formData.injuries} />}
          </Section>

          {/* Goals & Training */}
          <Section title="Goals & Training">
            <Row label="Goal" value={formData.goals.map((g) => goalLabels[g] || g).join(', ')} />
            <Row label="Timeline" value={formData.timeline.replace('-', ' ')} />
            {formData.targetWeight > 0 && <Row label="Target weight" value={`${formData.targetWeight}kg`} />}
            <Row label="Training" value={`${formData.trainingDaysPerWeek}x/week · ${splitLabels[formData.splitType] || formData.splitType}`} />
            {formData.cardioType !== 'none' && <Row label="Cardio" value={`${formData.cardioType.toUpperCase()} ${formData.cardioFrequency}x/week`} />}
          </Section>

          {/* Food Preferences */}
          <Section title="Food Preferences">
            <Row label="Protein" value={formatSources(formData.proteinSources)} />
            <Row label="Carbs" value={formatSources(formData.carbSources)} />
            <Row label="Fats" value={formatSources(formData.fatSources)} />
            <Row label="Restrictions" value={restrictions} />
            <Row label="Cuisines" value={cuisines} />
            <Row label="Meals/day" value={String(formData.mealsPerDay)} />
          </Section>

          {/* Lifestyle */}
          <Section title="Lifestyle & Controls">
            <Row label="Supplements" value={suppLabels[formData.supplementPreference]} />
            {formData.currentSupplements.length > 0 && <Row label="Currently taking" value={formData.currentSupplements.join(', ')} />}
            {formData.proteinFloor > 0 && <Row label="Protein floor" value={`${formData.proteinFloor}g/kg`} />}
            {formData.coachNotes && <Row label="Notes" value={formData.coachNotes} />}
          </Section>
        </div>

        {/* Blood work callout */}
        {hasBloodWork && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2.5">
            <div className="flex items-start gap-2">
              <FlaskConical size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  Blood work will be considered
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {clientBloodWork.length} file{clientBloodWork.length > 1 ? 's' : ''} on record.
                  Markers will influence meal selection and supplement recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={generating}>
          Back
        </Button>
        <Button size="sm" onClick={onGenerate} loading={generating}>
          Generate Plan
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="px-3 text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-3 py-1">
      <span className="text-xs text-[var(--color-text-tertiary)] w-28 shrink-0">{label}</span>
      <span className="text-xs text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}
