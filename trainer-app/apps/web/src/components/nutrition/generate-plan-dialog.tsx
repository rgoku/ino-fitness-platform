'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { WizardStepClient, type WizardFormData } from './wizard-step-client';
import { WizardStepHealth } from './wizard-step-health';
import { WizardStepGoalsTraining } from './wizard-step-goals-training';
import { WizardStepPreferences } from './wizard-step-preferences';
import { WizardStepLifestyle } from './wizard-step-lifestyle';
import { WizardStepReview } from './wizard-step-review';
import { useGenerateDietPlan } from '@/hooks/use-diet-plans';
import { cn } from '@/lib/utils';
import type { BloodWorkRecord } from '@/lib/blood-work-types';
import type { MockDietPlan } from '@/lib/mock-data';

const steps = [
  { label: 'Client' },
  { label: 'Health' },
  { label: 'Goals' },
  { label: 'Food' },
  { label: 'Lifestyle' },
  { label: 'Review' },
];

const defaultFormData: WizardFormData = {
  // Step 1
  clientId: '',
  clientName: '',
  sex: 'male',
  age: 0,
  weight: 0,
  height: 0,
  bodyFatPercent: 0,
  activityLevel: 'moderate',
  occupation: 'sedentary-desk',
  dailySteps: 0,

  // Step 2
  diabetes: 'none',
  pcos: false,
  thyroid: 'none',
  bloodPressure: 'normal',
  digestiveIssues: [],
  allergies: [],
  foodIntolerances: [],
  injuries: '',
  pregnancyStatus: 'none',

  // Step 3
  goals: [],
  timeline: '12-weeks',
  targetWeight: 0,
  targetBodyFat: 0,
  trainingDaysPerWeek: 4,
  splitType: 'ppl',
  cardioType: 'none',
  cardioFrequency: 0,
  trainingTime: 'morning',
  fastedCardio: false,

  // Step 4
  proteinSources: [],
  carbSources: [],
  fatSources: [],
  hatedFoods: '',
  restrictions: [],
  cuisines: [],
  cookingSkill: 'intermediate',
  mealPrepTime: 30,
  mealsPerDay: 4,

  // Step 5
  sleepHours: 0,
  caffeineTolerance: 'moderate',
  alcohol: 'none',
  waterIntake: 0,
  stressEating: false,
  lateNightSnacking: false,
  currentSupplements: [],
  supplementPreference: 'open',
  proteinFloor: 0,
  maxDeficitPercent: 0,
  carbCap: 0,
  fatMinimum: 0,
  sodiumCap: 0,
  fiberMinimum: 0,
  refeedFrequency: 'none',
  coachNotes: '',
};

interface GeneratePlanDialogProps {
  open: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: MockDietPlan) => void;
  bloodWorkRecords: BloodWorkRecord[];
}

export function GeneratePlanDialog({
  open,
  onClose,
  onPlanGenerated,
  bloodWorkRecords,
}: GeneratePlanDialogProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData);
  const generatePlan = useGenerateDietPlan();

  const handleClose = () => {
    setStep(0);
    setFormData(defaultFormData);
    onClose();
  };

  const handleGenerate = () => {
    const clientBloodWork = bloodWorkRecords.find((r) => r.clientId === formData.clientId);

    generatePlan.mutate(
      {
        ...formData,
        bloodWorkMarkers: clientBloodWork?.markers,
        bloodWorkDate: clientBloodWork?.uploadedAt,
      },
      {
        onSuccess: (plan) => {
          onPlanGenerated(plan);
          handleClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Generate Diet Plan" className="max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  i < step
                    ? 'bg-brand-500 text-white'
                    : i === step
                      ? 'bg-brand-600 text-white'
                      : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]'
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  'mt-1 text-[10px]',
                  i === step
                    ? 'text-[var(--color-text-primary)] font-medium'
                    : 'text-[var(--color-text-tertiary)]'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px w-10 mx-1.5 mb-4',
                  i < step ? 'bg-brand-500' : 'bg-[var(--color-border)]'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <WizardStepClient
          formData={formData}
          setFormData={setFormData}
          bloodWorkRecords={bloodWorkRecords}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <WizardStepHealth
          formData={formData}
          setFormData={setFormData}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <WizardStepGoalsTraining
          formData={formData}
          setFormData={setFormData}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <WizardStepPreferences
          formData={formData}
          setFormData={setFormData}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <WizardStepLifestyle
          formData={formData}
          setFormData={setFormData}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <WizardStepReview
          formData={formData}
          bloodWorkRecords={bloodWorkRecords}
          generating={generatePlan.isPending}
          onBack={() => setStep(4)}
          onGenerate={handleGenerate}
        />
      )}
    </Dialog>
  );
}
