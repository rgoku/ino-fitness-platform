'use client';

import { useState, useMemo } from 'react';
import { Leaf } from 'lucide-react';
import { useDietPlans, useUpdateDietPlan } from '@/hooks/use-diet-plans';
import { useClients } from '@/hooks/use-clients';
import { DietPlanCard } from '@/components/nutrition/diet-plan-card';
import { DietPlanDetail } from '@/components/nutrition/diet-plan-detail';
import { NutritionToolbar } from '@/components/nutrition/nutrition-toolbar';
import { BloodWorkSection } from '@/components/nutrition/blood-work-section';
import { GeneratePlanDialog } from '@/components/nutrition/generate-plan-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BloodWorkRecord } from '@/lib/blood-work-types';
import type { MockDietPlan } from '@/lib/mock-data';

export default function NutritionPage() {
  const { data: plans, isLoading } = useDietPlans();
  const { data: clients } = useClients();
  const updatePlan = useUpdateDietPlan();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Wizard + blood work state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [bloodWorkRecords, setBloodWorkRecords] = useState<BloodWorkRecord[]>([]);
  const [bloodWorkExpanded, setBloodWorkExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!plans) return [];
    return plans.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchesEvidence = evidenceFilter === 'all' || p.evidence_level === evidenceFilter;
      const matchesSource = sourceFilter === 'all' || p.generated_by === sourceFilter;
      return matchesSearch && matchesEvidence && matchesSource;
    });
  }, [plans, search, evidenceFilter, sourceFilter]);

  const selectedPlan = plans?.find((p) => p.id === selectedId) ?? null;
  const hasFilters = search || evidenceFilter !== 'all' || sourceFilter !== 'all';

  const handlePlanGenerated = (plan: MockDietPlan) => {
    setSelectedId(plan.id);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
        Nutrition
        {plans && plans.length > 0 && (
          <span className="ml-2 text-base font-normal text-[var(--color-text-tertiary)]">
            {plans.length} plans
          </span>
        )}
      </h1>

      <NutritionToolbar
        search={search}
        onSearchChange={setSearch}
        evidenceFilter={evidenceFilter}
        onEvidenceFilterChange={setEvidenceFilter}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        onGenerateClick={() => setWizardOpen(true)}
      />

      {/* Blood Work Section */}
      <BloodWorkSection
        records={bloodWorkRecords}
        onRecordsChange={setBloodWorkRecords}
        clients={clients || []}
        expanded={bloodWorkExpanded}
        onToggle={() => setBloodWorkExpanded(!bloodWorkExpanded)}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : !plans || plans.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No diet plans yet"
          description="Diet plans will show up here when you create them for your clients."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="Nothing matches"
          description={
            hasFilters
              ? 'Try adjusting your filters or search terms.'
              : 'No plans found.'
          }
        />
      ) : (
        <div className="flex gap-5">
          {/* Card grid */}
          <div
            className={cn(
              'grid grid-cols-1 gap-4 flex-1 transition-all',
              selectedPlan
                ? 'lg:grid-cols-1 xl:grid-cols-2'
                : 'lg:grid-cols-2 xl:grid-cols-3'
            )}
          >
            {filtered.map((plan) => (
              <DietPlanCard
                key={plan.id}
                plan={plan}
                selected={plan.id === selectedId}
                onClick={() =>
                  setSelectedId(plan.id === selectedId ? null : plan.id)
                }
              />
            ))}
          </div>

          {/* Detail panel */}
          {selectedPlan && (
            <div className="hidden lg:block w-[400px] shrink-0 sticky top-0 h-[calc(100vh-180px)] rounded-lg border border-[var(--color-border)] overflow-hidden">
              <DietPlanDetail
                plan={selectedPlan}
                onClose={() => setSelectedId(null)}
                onSave={(updated) => updatePlan.mutate(updated)}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile detail — below the grid */}
      {selectedPlan && (
        <div className="lg:hidden rounded-lg border border-[var(--color-border)] overflow-hidden">
          <DietPlanDetail
            plan={selectedPlan}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}

      {/* Generate Plan Wizard */}
      <GeneratePlanDialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onPlanGenerated={handlePlanGenerated}
        bloodWorkRecords={bloodWorkRecords}
      />
    </div>
  );
}
