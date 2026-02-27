'use client';

import { UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WizardFormData } from './wizard-step-client';

const sourceLabels: Record<string, string> = {
  chicken: 'Chicken', beef: 'Beef', fish: 'Fish', turkey: 'Turkey',
  eggs: 'Eggs', tofu: 'Tofu', whey: 'Whey', 'greek-yogurt': 'Greek yogurt',
  rice: 'Rice', potatoes: 'Potatoes', oats: 'Oats', pasta: 'Pasta',
  bread: 'Bread', 'sweet-potato': 'Sweet potato', quinoa: 'Quinoa', fruits: 'Fruits',
  avocado: 'Avocado', nuts: 'Nuts', 'peanut-butter': 'Peanut butter',
  'olive-oil': 'Olive oil', butter: 'Butter', 'coconut-oil': 'Coconut oil', cheese: 'Cheese',
};

const restrictionLabels: Record<string, string> = {
  vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten-free',
  'dairy-free': 'Dairy-free', 'nut-allergy': 'Nut allergy', halal: 'Halal', kosher: 'Kosher',
};

const cuisineLabels: Record<string, string> = {
  mediterranean: 'Mediterranean', asian: 'Asian', 'latin-american': 'Latin American',
  'north-american': 'North American', indian: 'Indian', 'middle-eastern': 'Middle Eastern',
};

const skillLabels: Record<string, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};

const mealCounts = [3, 4, 5, 6];

interface StepPreferencesProps {
  formData: WizardFormData;
  setFormData: (data: WizardFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WizardStepPreferences({ formData, setFormData, onBack, onNext }: StepPreferencesProps) {
  const update = (patch: Partial<WizardFormData>) => setFormData({ ...formData, ...patch });

  const hasPreferences = formData.proteinSources.length > 0 || formData.carbSources.length > 0 || formData.fatSources.length > 0;

  const radioClass = (selected: boolean) =>
    cn(
      'flex-1 rounded-lg border py-2 text-center text-xs font-medium transition-colors cursor-pointer',
      selected
        ? 'border-[var(--color-accent)] bg-blue-50 dark:bg-blue-950/20 text-[var(--color-text-primary)]'
        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
    );

  return (
    <div className="space-y-4">
      {/* Header note */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3.5 py-2.5">
        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
              Client food preferences
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
              Provided by {formData.clientName || 'the client'} in their app. Used to filter meals in the generated plan.
            </p>
          </div>
        </div>
      </div>

      {!hasPreferences ? (
        <div className="rounded-lg border border-[var(--color-border)] p-6 text-center">
          <UtensilsCrossed size={24} className="mx-auto text-[var(--color-text-tertiary)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">No preferences set</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            {formData.clientName || 'Client'} hasn't set food preferences yet. The generator will use defaults.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {/* Protein Sources */}
          <ReadOnlySection title="Protein Sources">
            <ChipList items={formData.proteinSources} labels={sourceLabels} color="blue" />
          </ReadOnlySection>

          {/* Carb Sources */}
          <ReadOnlySection title="Carb Sources">
            <ChipList items={formData.carbSources} labels={sourceLabels} color="amber" />
          </ReadOnlySection>

          {/* Fat Sources */}
          <ReadOnlySection title="Fat Sources">
            <ChipList items={formData.fatSources} labels={sourceLabels} color="emerald" />
          </ReadOnlySection>

          {/* Hated Foods */}
          {formData.hatedFoods && (
            <ReadOnlySection title="Foods They Hate">
              <p className="px-3 py-1.5 text-xs text-[var(--color-text-primary)]">{formData.hatedFoods}</p>
            </ReadOnlySection>
          )}

          {/* Dietary Restrictions */}
          <ReadOnlySection title="Dietary Restrictions">
            {formData.restrictions.length > 0 ? (
              <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
                {formData.restrictions.map((r) => (
                  <span key={r} className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                    {restrictionLabels[r] || r}
                  </span>
                ))}
              </div>
            ) : (
              <p className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">None</p>
            )}
          </ReadOnlySection>

          {/* Cuisine Preferences */}
          <ReadOnlySection title="Cuisine Preferences">
            {formData.cuisines.length > 0 ? (
              <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
                {formData.cuisines.map((c) => (
                  <span key={c} className="inline-flex items-center rounded-md bg-[var(--color-surface-tertiary)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                    {cuisineLabels[c] || c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">No preference</p>
            )}
          </ReadOnlySection>

          {/* Cooking Skill + Prep Time */}
          <ReadOnlySection title="Cooking">
            <ReadOnlyRow label="Skill level" value={skillLabels[formData.cookingSkill] || formData.cookingSkill} />
            <ReadOnlyRow label="Prep time" value={`${formData.mealPrepTime} min`} />
          </ReadOnlySection>
        </div>
      )}

      {/* ── Coach-editable: Meals per day ── */}
      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Meals per day</label>
        <div className="flex gap-2">
          {mealCounts.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update({ mealsPerDay: n })}
              className={radioClass(formData.mealsPerDay === n)}
            >
              {n}
            </button>
          ))}
        </div>
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

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1">
      <span className="text-xs text-[var(--color-text-tertiary)] w-32 shrink-0">{label}</span>
      <span className="text-xs text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

const chipColors: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
};

function ChipList({ items, labels, color }: { items: string[]; labels: Record<string, string>; color: string }) {
  if (items.length === 0) return <p className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">None selected</p>;
  return (
    <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={cn('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium', chipColors[color])}>
          {labels[item] || item}
        </span>
      ))}
    </div>
  );
}
