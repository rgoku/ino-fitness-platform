'use client';

import { Bot, PenLine, Utensils, BookOpen, Flame, FlaskConical } from 'lucide-react';
import { MacroRing } from './macro-ring';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MockDietPlan } from '@/lib/mock-data';

const evidenceVariant: Record<string, 'success' | 'info' | 'warning'> = {
  high: 'success',
  moderate: 'info',
  preliminary: 'warning',
};

const evidenceLabel: Record<string, string> = {
  high: 'Strong evidence',
  moderate: 'Moderate evidence',
  preliminary: 'Preliminary',
};

interface DietPlanCardProps {
  plan: MockDietPlan;
  selected: boolean;
  onClick: () => void;
}

export function DietPlanCard({ plan, selected, onClick }: DietPlanCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-100 hover:border-[var(--color-text-tertiary)] hover-limitless',
        selected && 'ring-2 ring-[var(--color-accent)] border-[var(--color-accent)]'
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header: client + evidence */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={plan.client_name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {plan.name}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">{plan.client_name}</p>
            </div>
          </div>
          <Badge variant={evidenceVariant[plan.evidence_level]}>
            {evidenceLabel[plan.evidence_level]}
          </Badge>
        </div>

        {/* Description — 2 lines max */}
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {plan.description}
        </p>

        {/* Macros */}
        <div className="flex items-center gap-3">
          <MacroRing
            protein={plan.protein_target}
            carbs={plan.carbs_target}
            fat={plan.fat_target}
            size={44}
            strokeWidth={5}
          />
          <div className="flex-1 grid grid-cols-3 gap-1 text-[11px]">
            <div>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
              <span className="text-[var(--color-text-secondary)]">P </span>
              <span className="font-medium text-[var(--color-text-primary)]">{plan.protein_target}g</span>
            </div>
            <div>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" />
              <span className="text-[var(--color-text-secondary)]">C </span>
              <span className="font-medium text-[var(--color-text-primary)]">{plan.carbs_target}g</span>
            </div>
            <div>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
              <span className="text-[var(--color-text-secondary)]">F </span>
              <span className="font-medium text-[var(--color-text-primary)]">{plan.fat_target}g</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-1 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1" title="Training / Rest day calories">
            <Flame size={12} />
            {plan.calories_target}
            {plan.rest_day_calories > 0 && (
              <span className="text-[var(--color-text-tertiary)]">/ {plan.rest_day_calories}</span>
            )}
            {' '}kcal
          </span>
          <span className="flex items-center gap-1">
            <Utensils size={12} />
            {plan.meals.length} meals
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {plan.research_citations.length} citations
          </span>
          {plan.blood_work_informed && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <FlaskConical size={11} />
              Blood work
            </span>
          )}
          <span className="ml-auto flex items-center gap-1" title={plan.generated_by === 'ai' ? 'AI-generated' : 'Coach-written'}>
            {plan.generated_by === 'ai' ? <Bot size={12} /> : <PenLine size={12} />}
            {plan.generated_by === 'ai' ? 'AI' : 'Coach'}
          </span>
        </div>
      </div>
    </Card>
  );
}
