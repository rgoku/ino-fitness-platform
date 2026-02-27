'use client';

import { useState } from 'react';
import { useClients } from '@/hooks/use-clients';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BloodWorkRecord } from '@/lib/blood-work-types';

export interface WizardFormData {
  // Step 1: Client & Body
  clientId: string;
  clientName: string;
  sex: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  bodyFatPercent: number;
  activityLevel: string;
  occupation: 'sedentary-desk' | 'lightly-active' | 'active-job' | 'very-active-job';
  dailySteps: number;

  // Step 2: Health & Medical
  diabetes: 'none' | 'type1' | 'type2' | 'pre-diabetic';
  pcos: boolean;
  thyroid: 'none' | 'hypothyroid' | 'hyperthyroid';
  bloodPressure: 'normal' | 'high' | 'low';
  digestiveIssues: string[];
  allergies: string[];
  foodIntolerances: string[];
  injuries: string;
  pregnancyStatus: 'none' | 'pregnant' | 'breastfeeding';

  // Step 3: Goals & Training
  goals: string[];
  timeline: string;
  targetWeight: number;
  targetBodyFat: number;
  trainingDaysPerWeek: number;
  splitType: 'ppl' | 'upper-lower' | 'full-body' | 'bro-split' | 'custom';
  cardioType: string;
  cardioFrequency: number;
  trainingTime: 'morning' | 'afternoon' | 'evening';
  fastedCardio: boolean;

  // Step 4: Food Preferences
  proteinSources: string[];
  carbSources: string[];
  fatSources: string[];
  hatedFoods: string;
  restrictions: string[];
  cuisines: string[];
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  mealPrepTime: 15 | 30 | 45 | 60;
  mealsPerDay: number;

  // Step 5: Lifestyle & Coach Controls
  sleepHours: number;
  caffeineTolerance: 'none' | 'low' | 'moderate' | 'high';
  alcohol: 'none' | 'occasional' | 'moderate' | 'heavy';
  waterIntake: number;
  stressEating: boolean;
  lateNightSnacking: boolean;
  currentSupplements: string[];
  supplementPreference: 'open' | 'minimal' | 'none';
  proteinFloor: number;
  maxDeficitPercent: number;
  carbCap: number;
  fatMinimum: number;
  sodiumCap: number;
  fiberMinimum: number;
  refeedFrequency: string;
  coachNotes: string;
}

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light (1–2x/week)' },
  { value: 'moderate', label: 'Moderate (3–4x/week)' },
  { value: 'active', label: 'Active (5–6x/week)' },
  { value: 'very-active', label: 'Very active (daily+)' },
];

const occupations = [
  { value: 'sedentary-desk', label: 'Desk / sedentary' },
  { value: 'lightly-active', label: 'Lightly active' },
  { value: 'active-job', label: 'Active job' },
  { value: 'very-active-job', label: 'Very active job' },
];

interface StepClientProps {
  formData: WizardFormData;
  setFormData: (data: WizardFormData) => void;
  bloodWorkRecords: BloodWorkRecord[];
  onNext: () => void;
}

// Conversion helpers
const lbsToKg = (lbs: number) => Math.round(lbs * 0.453592 * 10) / 10;
const kgToLbs = (kg: number) => Math.round(kg / 0.453592 * 10) / 10;
const ftInToCm = (ft: number, inches: number) => Math.round((ft * 30.48 + inches * 2.54) * 10) / 10;
const cmToFtIn = (cm: number): [number, number] => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return [ft, inches];
};

export function WizardStepClient({ formData, setFormData, bloodWorkRecords, onNext }: StepClientProps) {
  const { data: clients } = useClients();
  const [useImperial, setUseImperial] = useState(false);

  const [lbs, setLbs] = useState(() => formData.weight ? kgToLbs(formData.weight) : 0);
  const [feet, setFeet] = useState(() => formData.height ? cmToFtIn(formData.height)[0] : 0);
  const [inches, setInches] = useState(() => formData.height ? cmToFtIn(formData.height)[1] : 0);

  const update = (patch: Partial<WizardFormData>) => setFormData({ ...formData, ...patch });

  const clientHasBloodWork = bloodWorkRecords.some((r) => r.clientId === formData.clientId);

  const isValid = formData.clientId && formData.sex && formData.activityLevel &&
    formData.age > 0 && formData.weight > 0 && formData.height > 0;

  const handleUnitToggle = (imperial: boolean) => {
    if (imperial === useImperial) return;
    setUseImperial(imperial);
    if (imperial) {
      setLbs(formData.weight ? kgToLbs(formData.weight) : 0);
      const [f, i] = formData.height ? cmToFtIn(formData.height) : [0, 0];
      setFeet(f);
      setInches(i);
    }
  };

  const handleWeightLbs = (val: number) => {
    setLbs(val);
    update({ weight: val ? lbsToKg(val) : 0 });
  };

  const handleHeightFtIn = (ft: number, inc: number) => {
    setFeet(ft);
    setInches(inc);
    update({ height: (ft || inc) ? ftInToCm(ft, inc) : 0 });
  };

  const selectClass = "block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]";

  return (
    <div className="space-y-4">
      {/* Client */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Client</label>
        <select
          value={formData.clientId}
          onChange={(e) => {
            const client = clients?.find((c) => c.id === e.target.value);
            const hp = client?.healthProfile;
            const lp = client?.lifestyleProfile;
            const fp = client?.foodPreferences;
            update({
              clientId: e.target.value,
              clientName: client?.name || '',
              // Auto-populate from client health profile
              ...(hp ? {
                sex: hp.sex, age: hp.age, weight: hp.weight, height: hp.height,
                bodyFatPercent: hp.bodyFatPercent, dailySteps: hp.dailySteps,
                occupation: hp.occupation, activityLevel: hp.activityLevel,
                diabetes: hp.diabetes, pcos: hp.pcos, thyroid: hp.thyroid,
                bloodPressure: hp.bloodPressure, digestiveIssues: [...hp.digestiveIssues],
                allergies: [...hp.allergies], foodIntolerances: [...hp.foodIntolerances],
                injuries: hp.injuries, pregnancyStatus: hp.pregnancyStatus,
              } : {}),
              // Auto-populate from client lifestyle profile
              ...(lp ? {
                sleepHours: lp.sleepHours, caffeineTolerance: lp.caffeineTolerance,
                alcohol: lp.alcohol, waterIntake: lp.waterIntake,
                stressEating: lp.stressEating, lateNightSnacking: lp.lateNightSnacking,
                currentSupplements: [...lp.currentSupplements],
              } : {}),
              // Auto-populate from client food preferences
              ...(fp ? {
                proteinSources: [...fp.proteinSources], carbSources: [...fp.carbSources],
                fatSources: [...fp.fatSources], hatedFoods: fp.hatedFoods,
                restrictions: [...fp.restrictions], cuisines: [...fp.cuisines],
                cookingSkill: fp.cookingSkill, mealPrepTime: fp.mealPrepTime,
              } : {}),
            });
          }}
          className={selectClass}
        >
          <option value="">Select a client...</option>
          {clients?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {clientHasBloodWork && (
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="success">Blood work on file</Badge>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">Results will inform this plan</span>
          </div>
        )}
      </div>

      {/* Sex */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Sex</label>
        <div className="flex gap-2">
          {(['male', 'female'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ sex: s })}
              className={cn(
                'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                formData.sex === s
                  ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Activity Level</label>
        <select
          value={formData.activityLevel}
          onChange={(e) => update({ activityLevel: e.target.value })}
          className={selectClass}
        >
          <option value="">Select activity level...</option>
          {activityLevels.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Unit toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Biometrics</label>
        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
          <button
            type="button"
            onClick={() => handleUnitToggle(false)}
            className={cn(
              'px-2.5 py-1 text-xs font-medium transition-colors',
              !useImperial
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            kg / cm
          </button>
          <button
            type="button"
            onClick={() => handleUnitToggle(true)}
            className={cn(
              'px-2.5 py-1 text-xs font-medium transition-colors',
              useImperial
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            lbs / ft
          </button>
        </div>
      </div>

      {/* Biometrics row */}
      {useImperial ? (
        <div className="grid grid-cols-4 gap-3">
          <Input
            label="Age"
            type="number"
            value={formData.age || ''}
            onChange={(e) => update({ age: Number(e.target.value) })}
            placeholder="30"
            min={10}
            max={100}
          />
          <Input
            label="Weight (lbs)"
            type="number"
            value={lbs || ''}
            onChange={(e) => handleWeightLbs(Number(e.target.value))}
            placeholder="176"
            min={65}
            max={660}
          />
          <Input
            label="Height (ft)"
            type="number"
            value={feet || ''}
            onChange={(e) => handleHeightFtIn(Number(e.target.value), inches)}
            placeholder="5"
            min={3}
            max={8}
          />
          <Input
            label="Height (in)"
            type="number"
            value={inches || ''}
            onChange={(e) => handleHeightFtIn(feet, Number(e.target.value))}
            placeholder="11"
            min={0}
            max={11}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Age"
            type="number"
            value={formData.age || ''}
            onChange={(e) => update({ age: Number(e.target.value) })}
            placeholder="30"
            min={10}
            max={100}
          />
          <Input
            label="Weight (kg)"
            type="number"
            value={formData.weight || ''}
            onChange={(e) => update({ weight: Number(e.target.value) })}
            placeholder="80"
            min={30}
            max={300}
          />
          <Input
            label="Height (cm)"
            type="number"
            value={formData.height || ''}
            onChange={(e) => update({ height: Number(e.target.value) })}
            placeholder="180"
            min={100}
            max={250}
          />
        </div>
      )}

      {/* Body Fat % */}
      <Input
        label="Body fat %"
        type="number"
        value={formData.bodyFatPercent || ''}
        onChange={(e) => update({ bodyFatPercent: Number(e.target.value) })}
        placeholder="15"
        min={3}
        max={60}
      />

      {/* Daily Steps — presets + manual */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Daily steps</label>
        <div className="flex gap-1.5">
          {[
            { value: 8000, label: '8K' },
            { value: 10000, label: '10K' },
            { value: 20000, label: '20K' },
            { value: 30000, label: '30K' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ dailySteps: opt.value })}
              className={cn(
                'flex-1 rounded-lg border py-2 text-center text-xs font-medium transition-colors',
                formData.dailySteps === opt.value
                  ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={formData.dailySteps || ''}
          onChange={(e) => update({ dailySteps: Number(e.target.value) })}
          placeholder="Or enter manually..."
          min={0}
          max={50000}
          className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      {/* Occupation */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Occupation</label>
        <select
          value={formData.occupation}
          onChange={(e) => update({ occupation: e.target.value as WizardFormData['occupation'] })}
          className={selectClass}
        >
          {occupations.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Next */}
      <div className="flex items-center justify-between pt-2">
        {!isValid ? (
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            Fill in{' '}
            {[
              !formData.clientId && 'client',
              !formData.activityLevel && 'activity level',
              !(formData.age > 0) && 'age',
              !(formData.weight > 0) && 'weight',
              !(formData.height > 0) && 'height',
            ].filter(Boolean).join(', ')}{' '}
            to continue
          </p>
        ) : (
          <span />
        )}
        <Button size="sm" onClick={onNext} disabled={!isValid}>
          Next
        </Button>
      </div>
    </div>
  );
}
