'use client';

import { useState, useCallback } from 'react';
import {
  X, FlaskConical, ChevronDown, ChevronRight, Pill, ExternalLink,
  Droplets, Leaf, ShoppingCart, Clock, PenLine, Save, Undo2, Plus, Trash2,
} from 'lucide-react';
import { MacroRing } from './macro-ring';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MockDietPlan, MockMeal, SupplementTiming } from '@/lib/mock-data';

const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const mealTypeLabel: Record<string, string> = {
  breakfast: 'Morning',
  lunch: 'Midday',
  dinner: 'Evening',
  snack: 'Snack',
};

const timingLabel: Record<string, string> = {
  morning: 'Morning',
  'pre-workout': 'Pre-workout',
  'post-workout': 'Post-workout',
  'with-meals': 'With meals',
  bedtime: 'Bedtime',
};

const timingOptions: SupplementTiming['timing'][] = [
  'morning', 'pre-workout', 'post-workout', 'with-meals', 'bedtime',
];

const categoryLabel: Record<string, string> = {
  protein: 'Protein',
  carbs: 'Carbs & Grains',
  fats: 'Fats & Oils',
  produce: 'Produce',
  dairy: 'Dairy',
  pantry: 'Pantry',
  supplements: 'Supplements',
};

const categoryOrder = ['protein', 'produce', 'carbs', 'fats', 'dairy', 'pantry', 'supplements'];

interface DietPlanDetailProps {
  plan: MockDietPlan;
  onClose: () => void;
  onSave?: (updated: MockDietPlan) => void;
}

export function DietPlanDetail({ plan, onClose, onSave }: DietPlanDetailProps) {
  const [activeTab, setActiveTab] = useState('meals');
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [dayType, setDayType] = useState<'training' | 'rest'>('training');
  const [proteinUnit, setProteinUnit] = useState<'g' | 'oz'>('g');

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MockDietPlan>(plan);

  // Reset draft when plan changes from outside
  const startEditing = useCallback(() => {
    setDraft({ ...plan, meals: plan.meals.map((m) => ({ ...m })), rest_day_meals: plan.rest_day_meals.map((m) => ({ ...m })), supplement_schedule: plan.supplement_schedule.map((s) => ({ ...s })), grocery_list: plan.grocery_list.map((g) => ({ ...g })) });
    setEditing(true);
  }, [plan]);

  const cancelEditing = () => {
    setDraft(plan);
    setEditing(false);
  };

  const saveEditing = () => {
    onSave?.(draft);
    setEditing(false);
  };

  // Patch helpers
  const updateDraft = (patch: Partial<MockDietPlan>) => setDraft((d) => ({ ...d, ...patch }));

  const updateMeal = (mealId: string, patch: Partial<MockMeal>) => {
    const isTraining = dayType === 'training';
    const key = isTraining ? 'meals' : 'rest_day_meals';
    setDraft((d) => ({
      ...d,
      [key]: d[key].map((m) => (m.id === mealId ? { ...m, ...patch } : m)),
    }));
  };

  const removeMeal = (mealId: string) => {
    const key = dayType === 'training' ? 'meals' : 'rest_day_meals';
    setDraft((d) => ({ ...d, [key]: d[key].filter((m) => m.id !== mealId) }));
  };

  const addSupplement = () => {
    setDraft((d) => ({
      ...d,
      supplement_schedule: [
        ...d.supplement_schedule,
        { name: 'New Supplement', dose: '', timing: 'morning' as const },
      ],
    }));
  };

  const updateSupplement = (idx: number, patch: Partial<SupplementTiming>) => {
    setDraft((d) => ({
      ...d,
      supplement_schedule: d.supplement_schedule.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  };

  const removeSupplement = (idx: number) => {
    setDraft((d) => ({ ...d, supplement_schedule: d.supplement_schedule.filter((_, i) => i !== idx) }));
  };

  // Use draft or plan depending on mode
  const p = editing ? draft : plan;

  const tabs = [
    { id: 'meals', label: 'Meals', count: p.meals.length },
    { id: 'grocery', label: 'Grocery', count: p.grocery_list.length },
    { id: 'research', label: 'Research', count: p.research_citations.length },
    { id: 'supplements', label: 'Supplements', count: p.supplement_schedule.length },
  ];

  const toggleMeal = (id: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isTraining = dayType === 'training';
  const cals = isTraining ? p.calories_target : p.rest_day_calories;
  const protein = isTraining ? p.protein_target : p.rest_day_protein;
  const carbs = isTraining ? p.carbs_target : p.rest_day_carbs;
  const fat = isTraining ? p.fat_target : p.rest_day_fat;
  const activeMeals = isTraining ? p.meals : (p.rest_day_meals.length > 0 ? p.rest_day_meals : p.meals);

  const formatProtein = (g: number) => {
    if (proteinUnit === 'oz') return `${(g / 28.35).toFixed(1)}oz`;
    return `${g}g`;
  };

  const mealsByType = mealTypeOrder
    .map((type) => ({
      type,
      label: mealTypeLabel[type],
      meals: activeMeals.filter((m) => m.meal_type === type),
    }))
    .filter((g) => g.meals.length > 0);

  const groceryByCategory = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabel[cat] || cat,
      items: p.grocery_list.filter((g) => g.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  // Editable number input helper
  const numInput = (value: number, onChange: (v: number) => void, className?: string) => (
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'w-16 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs text-[var(--color-text-primary)] text-center focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
        className
      )}
    />
  );

  // Macro update helpers for training/rest
  const setMacro = (field: string, value: number) => {
    if (isTraining) {
      updateDraft({ [field === 'cals' ? 'calories_target' : field === 'protein' ? 'protein_target' : field === 'carbs' ? 'carbs_target' : 'fat_target']: value });
    } else {
      updateDraft({ [field === 'cals' ? 'rest_day_calories' : field === 'protein' ? 'rest_day_protein' : field === 'carbs' ? 'rest_day_carbs' : 'rest_day_fat']: value });
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-[var(--color-border)]">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              type="text"
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              className="w-full text-sm font-semibold text-[var(--color-text-primary)] bg-transparent border-b border-[var(--color-accent)] focus:outline-none pb-0.5"
            />
          ) : (
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {p.name}
            </h2>
          )}
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{p.client_name}</p>
        </div>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={cancelEditing}>
                <Undo2 size={14} />
              </Button>
              <Button size="sm" onClick={saveEditing}>
                <Save size={14} className="mr-1" />
                Save
              </Button>
            </>
          ) : (
            onSave && (
              <button
                onClick={startEditing}
                className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Edit plan"
              >
                <PenLine size={15} />
              </button>
            )
          )}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Training / Rest day toggle */}
      <div className="px-5 pt-3 flex items-center justify-between">
        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
          <button
            type="button"
            onClick={() => setDayType('training')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              isTraining
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            Training Day
          </button>
          <button
            type="button"
            onClick={() => setDayType('rest')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              !isTraining
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            Rest Day
          </button>
        </div>
        {/* Protein unit toggle */}
        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
          <button
            type="button"
            onClick={() => setProteinUnit('g')}
            className={cn(
              'px-2 py-1 text-[10px] font-medium transition-colors',
              proteinUnit === 'g'
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            grams
          </button>
          <button
            type="button"
            onClick={() => setProteinUnit('oz')}
            className={cn(
              'px-2 py-1 text-[10px] font-medium transition-colors',
              proteinUnit === 'oz'
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            oz
          </button>
        </div>
      </div>

      {/* Macro overview */}
      <div className="px-5 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <MacroRing
            protein={protein}
            carbs={carbs}
            fat={fat}
            size={56}
            strokeWidth={5}
          />
          <div className="flex-1 space-y-1">
            {editing ? (
              <div className="flex items-center gap-1.5">
                {numInput(cals, (v) => setMacro('cals', v), 'w-20 text-sm font-semibold')}
                <span className="text-xs text-[var(--color-text-tertiary)]">kcal/{isTraining ? 'training' : 'rest'} day</span>
              </div>
            ) : (
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {cals}
                <span className="text-xs font-normal text-[var(--color-text-tertiary)] ml-1">kcal/{isTraining ? 'training' : 'rest'} day</span>
              </p>
            )}
            <div className="flex gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[var(--color-text-secondary)]">P</span>
                {editing ? numInput(protein, (v) => setMacro('protein', v), 'w-14') : (
                  <span className="font-medium text-[var(--color-text-primary)]">{formatProtein(protein)}</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[var(--color-text-secondary)]">C</span>
                {editing ? numInput(carbs, (v) => setMacro('carbs', v), 'w-14') : (
                  <span className="font-medium text-[var(--color-text-primary)]">{carbs}g</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[var(--color-text-secondary)]">F</span>
                {editing ? numInput(fat, (v) => setMacro('fat', v), 'w-14') : (
                  <span className="font-medium text-[var(--color-text-primary)]">{fat}g</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Water / Sodium / Fiber targets */}
        <div className="flex gap-3 mt-2 pt-2 border-t border-[var(--color-border)]">
          {editing ? (
            <>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                <Droplets size={12} className="text-blue-400" />
                {numInput(p.water_target, (v) => updateDraft({ water_target: v }), 'w-12')}L
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                {numInput(p.sodium_target, (v) => updateDraft({ sodium_target: v }), 'w-16')}mg
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                <Leaf size={12} className="text-green-500" />
                {numInput(p.fiber_target, (v) => updateDraft({ fiber_target: v }), 'w-12')}g
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                <Droplets size={12} className="text-blue-400" />
                {p.water_target}L water
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                {p.sodium_target}mg sodium
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                <Leaf size={12} className="text-green-500" />
                {p.fiber_target}g fiber
              </span>
            </>
          )}
        </div>
      </div>

      {/* Scientific basis callout */}
      <div className="mx-5 mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3.5 py-2.5">
        <div className="flex items-start gap-2">
          <FlaskConical size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            {p.scientific_basis}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-3">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {activeTab === 'meals' && (
          <div className="space-y-4">
            {mealsByType.map((group) => (
              <div key={group.type}>
                <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.meals.map((meal) => (
                    <MealRow
                      key={meal.id}
                      meal={meal}
                      expanded={expandedMeals.has(meal.id)}
                      onToggle={() => toggleMeal(meal.id)}
                      proteinUnit={proteinUnit}
                      editing={editing}
                      onUpdate={(patch) => updateMeal(meal.id, patch)}
                      onRemove={() => removeMeal(meal.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grocery' && (
          <div className="space-y-4">
            {groceryByCategory.map((group) => (
              <div key={group.category}>
                <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  <ShoppingCart size={11} className="inline mr-1" />
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-1.5"
                    >
                      <span className="text-xs text-[var(--color-text-primary)]">{item.name}</span>
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-3">
            {p.research_citations.map((citation, i) => (
              <div
                key={citation.id}
                className="rounded-lg border border-[var(--color-border)] p-3 space-y-1.5"
              >
                <div className="flex items-start gap-2">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-surface-tertiary)] text-[10px] font-bold text-[var(--color-text-tertiary)]">
                    {i + 1}
                  </span>
                  <p className="text-xs font-medium text-[var(--color-text-primary)] leading-snug">
                    {citation.title}
                  </p>
                </div>
                <p className="text-[11px] text-[var(--color-text-tertiary)] pl-7">
                  {citation.authors}
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] pl-7">
                  <span className="italic">{citation.journal}</span> ({citation.year})
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] pl-7 leading-relaxed">
                  {citation.summary}
                </p>
                <div className="pl-7">
                  <a
                    href={`https://doi.org/${citation.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink size={10} />
                    DOI: {citation.doi}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'supplements' && (
          <div className="space-y-3">
            {p.supplement_schedule.length > 0 ? (
              <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--color-surface-tertiary)]">
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-tertiary)]">Supplement</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-tertiary)]">Dose</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--color-text-tertiary)]">
                        <Clock size={11} className="inline mr-1" />
                        When
                      </th>
                      {editing && <th className="w-8" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {p.supplement_schedule.map((supp, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">
                          {editing ? (
                            <input
                              type="text"
                              value={supp.name}
                              onChange={(e) => updateSupplement(i, { name: e.target.value })}
                              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
                            />
                          ) : (
                            <>
                              <Pill size={12} className="inline mr-1.5 text-[var(--color-text-tertiary)]" />
                              {supp.name}
                            </>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                          {editing ? (
                            <input
                              type="text"
                              value={supp.dose}
                              onChange={(e) => updateSupplement(i, { dose: e.target.value })}
                              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
                            />
                          ) : (
                            supp.dose
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editing ? (
                            <select
                              value={supp.timing}
                              onChange={(e) => updateSupplement(i, { timing: e.target.value as SupplementTiming['timing'] })}
                              className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
                            >
                              {timingOptions.map((t) => (
                                <option key={t} value={t}>{timingLabel[t]}</option>
                              ))}
                            </select>
                          ) : (
                            <>
                              <Badge variant="info">{timingLabel[supp.timing] || supp.timing}</Badge>
                              {supp.notes && (
                                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{supp.notes}</p>
                              )}
                            </>
                          )}
                        </td>
                        {editing && (
                          <td className="px-1 py-2">
                            <button onClick={() => removeSupplement(i)} className="p-1 text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-tertiary)] text-center py-6">No supplements recommended for this plan.</p>
            )}

            {editing && (
              <button
                onClick={addSupplement}
                className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <Plus size={14} /> Add supplement
              </button>
            )}

            {/* Legacy text recommendations if any don't overlap */}
            {p.supplement_recommendations.length > 0 && p.supplement_schedule.length === 0 && (
              <div className="space-y-2">
                {p.supplement_recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-[var(--color-border)] px-3 py-2.5"
                  >
                    <Pill size={14} className="text-[var(--color-text-tertiary)] mt-0.5 shrink-0" />
                    <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Meal accordion row ---
function MealRow({
  meal,
  expanded,
  onToggle,
  proteinUnit,
  editing,
  onUpdate,
  onRemove,
}: {
  meal: MockMeal;
  expanded: boolean;
  onToggle: () => void;
  proteinUnit: 'g' | 'oz';
  editing: boolean;
  onUpdate: (patch: Partial<MockMeal>) => void;
  onRemove: () => void;
}) {
  const formatP = (g: number) => proteinUnit === 'oz' ? `${(g / 28.35).toFixed(1)}oz` : `${g}g`;

  const numInput = (value: number, onChange: (v: number) => void) => (
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-14 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5 text-[10px] text-center text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
    />
  );

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
          )}
          {editing ? (
            <input
              type="text"
              value={meal.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-xs font-medium text-[var(--color-text-primary)] bg-transparent border-b border-dashed border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          ) : (
            <span className="flex-1 text-xs font-medium text-[var(--color-text-primary)] truncate">
              {meal.name}
            </span>
          )}
        </button>
        <span className="text-[10px] text-[var(--color-text-tertiary)]">
          {meal.calories} kcal
        </span>
        {editing && (
          <button onClick={onRemove} className="p-0.5 text-red-400 hover:text-red-600 shrink-0">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-[var(--color-border)]">
          {/* Macros */}
          {editing ? (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-0.5">
                <Badge variant="success">P</Badge>
                {numInput(meal.protein, (v) => onUpdate({ protein: v }))}
              </span>
              <span className="flex items-center gap-0.5">
                <Badge variant="info">C</Badge>
                {numInput(meal.carbs, (v) => onUpdate({ carbs: v }))}
              </span>
              <span className="flex items-center gap-0.5">
                <Badge variant="warning">F</Badge>
                {numInput(meal.fat, (v) => onUpdate({ fat: v }))}
              </span>
              <span className="flex items-center gap-0.5 ml-1">
                <span className="text-[var(--color-text-tertiary)]">kcal</span>
                {numInput(meal.calories, (v) => onUpdate({ calories: v }))}
              </span>
            </div>
          ) : (
            <div className="flex gap-2 text-[10px]">
              <Badge variant="success">P {formatP(meal.protein)}</Badge>
              <Badge variant="info">C {meal.carbs}g</Badge>
              <Badge variant="warning">F {meal.fat}g</Badge>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <p className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
              Ingredients
            </p>
            {editing ? (
              <textarea
                value={meal.ingredients.join('\n')}
                onChange={(e) => onUpdate({ ingredients: e.target.value.split('\n').filter(Boolean) })}
                rows={Math.min(meal.ingredients.length + 1, 6)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[10px] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {meal.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          {!editing && (
            <div>
              <p className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
                Steps
              </p>
              <ol className="space-y-0.5">
                {meal.instructions.map((step, i) => (
                  <li key={i} className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                    <span className="text-[var(--color-text-tertiary)] mr-1">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Nutritional benefits callout */}
          {!editing && meal.research_backed && (
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-2">
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                {meal.nutritional_benefits}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
