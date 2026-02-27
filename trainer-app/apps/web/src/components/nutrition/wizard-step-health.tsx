'use client';

import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WizardFormData } from './wizard-step-client';

const diabetesLabels: Record<string, string> = {
  none: 'None', 'pre-diabetic': 'Pre-diabetic', type1: 'Type 1', type2: 'Type 2',
};
const thyroidLabels: Record<string, string> = {
  none: 'None', hypothyroid: 'Hypothyroid', hyperthyroid: 'Hyperthyroid',
};
const bpLabels: Record<string, string> = {
  normal: 'Normal', high: 'High', low: 'Low',
};
const pregnancyLabels: Record<string, string> = {
  none: 'N/A', pregnant: 'Pregnant', breastfeeding: 'Breastfeeding',
};

interface StepHealthProps {
  formData: WizardFormData;
  setFormData: (data: WizardFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WizardStepHealth({ formData, onBack, onNext }: StepHealthProps) {
  const hasConditions =
    formData.diabetes !== 'none' || formData.pcos || formData.thyroid !== 'none' ||
    formData.bloodPressure !== 'normal' || formData.digestiveIssues.length > 0 ||
    formData.allergies.length > 0 || formData.foodIntolerances.length > 0 ||
    formData.injuries || formData.pregnancyStatus !== 'none';

  return (
    <div className="space-y-4">
      {/* Header note */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3.5 py-2.5">
        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
              Client-reported health data
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
              This information was provided by {formData.clientName || 'the client'} in their app.
              It will be used to tailor the diet plan.
            </p>
          </div>
        </div>
      </div>

      {!hasConditions ? (
        <div className="rounded-lg border border-[var(--color-border)] p-6 text-center">
          <ShieldCheck size={24} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">No conditions reported</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            {formData.clientName || 'Client'} has not reported any medical conditions, allergies, or intolerances.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {/* Medical Conditions */}
          <ReadOnlySection title="Medical Conditions">
            <ReadOnlyRow label="Diabetes" value={diabetesLabels[formData.diabetes]} highlight={formData.diabetes !== 'none'} />
            <ReadOnlyRow label="PCOS" value={formData.pcos ? 'Yes' : 'No'} highlight={formData.pcos} />
            <ReadOnlyRow label="Thyroid" value={thyroidLabels[formData.thyroid]} highlight={formData.thyroid !== 'none'} />
            <ReadOnlyRow label="Blood Pressure" value={bpLabels[formData.bloodPressure]} highlight={formData.bloodPressure !== 'normal'} />
            <ReadOnlyRow label="Pregnancy / Nursing" value={pregnancyLabels[formData.pregnancyStatus]} highlight={formData.pregnancyStatus !== 'none'} />
          </ReadOnlySection>

          {/* Digestive */}
          {formData.digestiveIssues.length > 0 && (
            <ReadOnlySection title="Digestive Issues">
              <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
                {formData.digestiveIssues.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                    <AlertCircle size={11} className="shrink-0" />
                    {d.toUpperCase()}
                  </span>
                ))}
              </div>
            </ReadOnlySection>
          )}

          {/* Food Intolerances */}
          {formData.foodIntolerances.length > 0 && (
            <ReadOnlySection title="Food Intolerances">
              <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
                {formData.foodIntolerances.map((i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                    {i.charAt(0).toUpperCase() + i.slice(1)}
                  </span>
                ))}
              </div>
            </ReadOnlySection>
          )}

          {/* Allergies */}
          {formData.allergies.length > 0 && (
            <ReadOnlySection title="Allergies">
              <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
                {formData.allergies.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-950/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                    <AlertCircle size={11} className="shrink-0" />
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </span>
                ))}
              </div>
            </ReadOnlySection>
          )}

          {/* Injuries */}
          {formData.injuries && (
            <ReadOnlySection title="Injuries / Limitations">
              <div className="px-3 py-1.5">
                <p className="text-xs text-[var(--color-text-primary)]">{formData.injuries}</p>
              </div>
            </ReadOnlySection>
          )}
        </div>
      )}

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
