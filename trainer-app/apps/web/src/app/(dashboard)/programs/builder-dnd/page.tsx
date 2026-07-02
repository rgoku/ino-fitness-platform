'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronLeft,
  GripVertical,
  Plus,
  Trash2,
  Search,
  Save,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api, ApiError, NetworkError } from '@/lib/api';

// ─── Mock exercise library (replace with real API call) ─────────────────────

interface LibraryExercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string;
}

const EXERCISE_LIBRARY: LibraryExercise[] = [
  { id: 'l1', name: 'Bench Press', muscleGroups: ['Chest', 'Triceps'], equipment: 'Barbell' },
  { id: 'l2', name: 'Squat', muscleGroups: ['Quads', 'Glutes'], equipment: 'Barbell' },
  { id: 'l3', name: 'Deadlift', muscleGroups: ['Back', 'Hamstrings'], equipment: 'Barbell' },
  { id: 'l4', name: 'Overhead Press', muscleGroups: ['Shoulders', 'Triceps'], equipment: 'Barbell' },
  { id: 'l5', name: 'Pull-up', muscleGroups: ['Back', 'Biceps'], equipment: 'Bodyweight' },
  { id: 'l6', name: 'Romanian Deadlift', muscleGroups: ['Hamstrings', 'Glutes'], equipment: 'Barbell' },
  { id: 'l7', name: 'Barbell Row', muscleGroups: ['Back', 'Biceps'], equipment: 'Barbell' },
  { id: 'l8', name: 'Lateral Raise', muscleGroups: ['Shoulders'], equipment: 'Dumbbell' },
  { id: 'l9', name: 'Bicep Curl', muscleGroups: ['Biceps'], equipment: 'Dumbbell' },
  { id: 'l10', name: 'Tricep Pushdown', muscleGroups: ['Triceps'], equipment: 'Cable' },
  { id: 'l11', name: 'Leg Press', muscleGroups: ['Quads', 'Glutes'], equipment: 'Machine' },
  { id: 'l12', name: 'Leg Curl', muscleGroups: ['Hamstrings'], equipment: 'Machine' },
  { id: 'l13', name: 'Calf Raise', muscleGroups: ['Calves'], equipment: 'Machine' },
  { id: 'l14', name: 'Hip Thrust', muscleGroups: ['Glutes'], equipment: 'Barbell' },
  { id: 'l15', name: 'Face Pull', muscleGroups: ['Shoulders', 'Back'], equipment: 'Cable' },
  { id: 'l16', name: 'Incline DB Press', muscleGroups: ['Chest', 'Shoulders'], equipment: 'Dumbbell' },
  { id: 'l17', name: 'Cable Fly', muscleGroups: ['Chest'], equipment: 'Cable' },
  { id: 'l18', name: 'Lat Pulldown', muscleGroups: ['Back', 'Biceps'], equipment: 'Cable' },
];

// ─── Plan model ─────────────────────────────────────────────────────────────

interface PlanExercise {
  /** unique row id (different from library id so the same exercise can appear twice) */
  rowId: string;
  libraryId: string;
  name: string;
  muscleGroups: string[];
  sets: number;
  reps: string;
  rest: string;
  rpe: string;
  notes: string;
}

let rowIdCounter = 0;
function newRowId() {
  rowIdCounter += 1;
  return `r-${Date.now()}-${rowIdCounter}`;
}

function fromLibrary(lx: LibraryExercise): PlanExercise {
  return {
    rowId: newRowId(),
    libraryId: lx.id,
    name: lx.name,
    muscleGroups: lx.muscleGroups,
    sets: 3,
    reps: '8-10',
    rest: '90s',
    rpe: '7',
    notes: '',
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DragDropBuilderPage() {
  const [workoutName, setWorkoutName] = useState('Push Day A');
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<PlanExercise[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const filteredLibrary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXERCISE_LIBRARY;
    return EXERCISE_LIBRARY.filter(
      (lx) =>
        lx.name.toLowerCase().includes(q) ||
        lx.muscleGroups.some((m) => m.toLowerCase().includes(q)) ||
        lx.equipment.toLowerCase().includes(q),
    );
  }, [query]);

  const handleAdd = (lx: LibraryExercise) => {
    setPlan((p) => [...p, fromLibrary(lx)]);
    setSaved(false);
  };

  const handleRemove = (rowId: string) => {
    setPlan((p) => p.filter((row) => row.rowId !== rowId));
    setSaved(false);
  };

  const handlePatch = useCallback((rowId: string, patch: Partial<PlanExercise>) => {
    setPlan((p) => p.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)));
    setSaved(false);
  }, []);

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setPlan((p) => {
      const oldIndex = p.findIndex((r) => r.rowId === active.id);
      const newIndex = p.findIndex((r) => r.rowId === over.id);
      if (oldIndex < 0 || newIndex < 0) return p;
      return arrayMove(p, oldIndex, newIndex);
    });
  };

  const totalSets = plan.reduce((sum, ex) => sum + (Number(ex.sets) || 0), 0);
  const muscleGroups = [...new Set(plan.flatMap((p) => p.muscleGroups))];

  const handleSave = async () => {
    if (plan.length === 0) {
      setSaveError('Add at least one exercise before saving.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await api.post('/api/v1/programs', {
        name: workoutName.trim() || 'Untitled Program',
        weeks: 1,
        days_per_week: 1,
        exercises: plan.map((ex, idx) => ({
          name: ex.name,
          sets: Number(ex.sets) || 0,
          reps: String(ex.reps ?? ''),
          rest: ex.rest || null,
          rpe: ex.rpe || null,
          notes: ex.notes || null,
          muscle_groups: ex.muscleGroups ?? [],
          order_index: idx,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(
          err.status === 401 || err.status === 403
            ? 'Your session expired or you are not signed in as a coach. Please log in again.'
            : `Couldn't save program: ${err.detail}`,
        );
      } else if (err instanceof NetworkError) {
        setSaveError("Couldn't reach the server. Is the backend running?");
      } else {
        setSaveError('Something went wrong while saving. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={1.6} />
        Programs
      </Link>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Program Builder</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Drag exercises from the library into your plan, then tweak sets, reps, rest, and RPE.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="primary"
            size="md"
            icon={saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save Program'}
          </Button>
          {saveError && (
            <p className="text-body-xs text-[var(--color-danger,#ef4444)] max-w-xs text-right">{saveError}</p>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* PLAN COLUMN */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <label className="block text-body-xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)] mb-2">
                Workout name
              </label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Push Day A"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3 text-body-xs text-[var(--color-text-secondary)]">
                <Pill>{plan.length} exercises</Pill>
                <Pill>{totalSets} sets</Pill>
                {muscleGroups.slice(0, 4).map((m) => (
                  <Pill key={m} tone="brand">
                    {m}
                  </Pill>
                ))}
                {muscleGroups.length > 4 && (
                  <Pill>+{muscleGroups.length - 4} more</Pill>
                )}
              </div>
            </div>

            {plan.length === 0 ? (
              <EmptyPlan />
            ) : (
              <SortableContext items={plan.map((r) => r.rowId)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-3">
                  {plan.map((row, idx) => (
                    <SortableRow
                      key={row.rowId}
                      row={row}
                      index={idx}
                      onRemove={handleRemove}
                      onPatch={handlePatch}
                    />
                  ))}
                </ul>
              </SortableContext>
            )}
          </div>

          {/* LIBRARY COLUMN */}
          <aside className="space-y-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exercises…"
                  className="pl-9"
                />
              </div>
              <p className="mt-3 text-body-xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)]">
                Exercise Library
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-1.5">
              {filteredLibrary.map((lx) => (
                <LibraryRow key={lx.id} lx={lx} onAdd={() => handleAdd(lx)} />
              ))}
              {filteredLibrary.length === 0 && (
                <p className="px-3 py-6 text-body-sm text-center text-[var(--color-text-tertiary)]">
                  No exercises match "{query}"
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* Drag preview */}
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border border-brand-500/50 bg-[var(--color-surface-elevated)] px-4 py-3 shadow-lg shadow-brand-500/10">
              <p className="text-body-sm font-semibold text-[var(--color-text-primary)]">
                {plan.find((r) => r.rowId === activeId)?.name}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────────

function Pill({ children, tone }: { children: React.ReactNode; tone?: 'brand' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-body-xs font-medium',
        tone === 'brand'
          ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
          : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]',
      )}
    >
      {children}
    </span>
  );
}

function EmptyPlan() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <Dumbbell className="mx-auto mb-3 text-[var(--color-text-tertiary)]" size={28} />
      <p className="text-body-md font-semibold text-[var(--color-text-primary)]">
        No exercises yet
      </p>
      <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
        Click <span className="font-medium text-brand-400">+</span> next to any exercise on the right to add it.
      </p>
    </div>
  );
}

function LibraryRow({ lx, onAdd }: { lx: LibraryExercise; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-[var(--color-text-primary)] truncate">{lx.name}</p>
        <p className="mt-0.5 text-body-xs text-[var(--color-text-tertiary)] truncate">
          {lx.muscleGroups.join(' · ')} · {lx.equipment}
        </p>
      </div>
      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-tertiary)] transition-colors group-hover:border-brand-500/60 group-hover:text-brand-400">
        <Plus size={14} />
      </span>
    </button>
  );
}

function SortableRow({
  row,
  index,
  onRemove,
  onPatch,
}: {
  row: PlanExercise;
  index: number;
  onRemove: (rowId: string) => void;
  onPatch: (rowId: string, patch: Partial<PlanExercise>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.rowId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-xs font-bold tabular-nums text-[var(--color-text-tertiary)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="text-body-md font-semibold text-[var(--color-text-primary)]">{row.name}</p>
            {row.muscleGroups.slice(0, 3).map((m) => (
              <Pill key={m}>{m}</Pill>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            <Field label="Sets" value={String(row.sets)} onChange={(v) => onPatch(row.rowId, { sets: Number(v) || 0 })} />
            <Field label="Reps" value={row.reps} onChange={(v) => onPatch(row.rowId, { reps: v })} />
            <Field label="Rest" value={row.rest} onChange={(v) => onPatch(row.rowId, { rest: v })} />
            <Field label="RPE" value={row.rpe} onChange={(v) => onPatch(row.rowId, { rpe: v })} />
          </div>
        </div>

        <button
          onClick={() => onRemove(row.rowId)}
          className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-red-500/10 hover:text-red-400"
          aria-label="Remove exercise"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-body-xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)] mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5 text-body-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 tabular-nums"
      />
    </div>
  );
}
