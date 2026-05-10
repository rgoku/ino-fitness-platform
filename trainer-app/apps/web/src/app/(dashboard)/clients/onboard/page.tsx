'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, User, Heart, Target, Dumbbell,
  Utensils, Check, Sparkles, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'basics', label: 'Basics', icon: User },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'training', label: 'Training', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'review', label: 'Review', icon: Check },
];

const GOALS = ['Build Muscle', 'Lose Fat', 'Get Stronger', 'Improve Endurance', 'Body Recomp', 'Sport Performance', 'General Health'];
const EXPERIENCE = ['Complete Beginner', '< 6 months', '6-12 months', '1-3 years', '3+ years'];
const EQUIPMENT = ['Full Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only', 'Resistance Bands'];
const RESTRICTIONS = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher'];
const INJURIES = ['None', 'Lower Back', 'Shoulder', 'Knee', 'Hip', 'Wrist', 'Ankle', 'Neck'];

export default function ClientOnboardPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', age: '', sex: 'male',
    weight: '', height: '', bodyFat: '',
    injuries: [] as string[], conditions: '',
    goals: [] as string[], timeline: '12 weeks',
    experience: '', daysPerWeek: '4', sessionLength: '60',
    equipment: '',
    dietaryRestrictions: [] as string[], mealsPerDay: '4',
    allergies: '', supplements: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const update = (field: string, value: string | string[]) => setForm((f) => ({ ...f, [field]: value }));
  const toggleArray = (field: string, value: string) => {
    const arr = form[field as keyof typeof form] as string[];
    update(field, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setGenerating(false);
    setGenerated(true);
  };

  const canProceed = () => {
    if (step === 0) return form.name && form.email && form.age;
    if (step === 2) return form.goals.length > 0;
    if (step === 3) return form.experience && form.equipment;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Link href="/clients" className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
        <ChevronLeft size={16} /> Clients
      </Link>

      <div>
        <h1 className="text-heading-2 text-[var(--color-text-primary)]">New Client Onboarding</h1>
        <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
          Gather client info to generate a personalized AI training + nutrition plan.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-body-xs font-medium transition-colors',
                i < step ? 'bg-brand-500 text-white' :
                i === step ? 'bg-brand-500 text-white' :
                'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]'
              )}>
                {i < step ? <Check size={14} /> : <s.icon size={14} />}
              </div>
              <span className={cn('mt-1 text-body-xs', i === step ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-tertiary)]')}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px w-8 mx-1 mb-5', i < step ? 'bg-brand-500' : 'bg-[var(--color-border)]')} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="space-y-5">
          {step === 0 && (
            <>
              <p className="text-sub-md text-[var(--color-text-primary)]">Basic Information</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Smith" />
                <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="john@email.com" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Age" type="number" value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="28" />
                <div className="space-y-1.5">
                  <label className="block text-body-sm font-medium text-[var(--color-text-primary)]">Sex</label>
                  <div className="flex gap-2">
                    {['male', 'female'].map((s) => (
                      <button key={s} onClick={() => update('sex', s)} className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-body-sm capitalize transition-colors',
                        form.sex === s ? 'border-brand-500 bg-brand-50/50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                      )}>{s}</button>
                    ))}
                  </div>
                </div>
                <Input label="Body Fat %" type="number" value={form.bodyFat} onChange={(e) => update('bodyFat', e.target.value)} placeholder="15" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Weight (kg)" type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} placeholder="80" />
                <Input label="Height (cm)" type="number" value={form.height} onChange={(e) => update('height', e.target.value)} placeholder="178" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sub-md text-[var(--color-text-primary)]">Health & Injuries</p>
              <div>
                <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-2">Current Injuries</label>
                <div className="flex flex-wrap gap-2">
                  {INJURIES.map((inj) => (
                    <button key={inj} onClick={() => toggleArray('injuries', inj)} className={cn(
                      'rounded-lg border px-3 py-1.5 text-body-xs transition-colors',
                      form.injuries.includes(inj) ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                    )}>{inj}</button>
                  ))}
                </div>
              </div>
              <Input label="Medical Conditions (optional)" value={form.conditions} onChange={(e) => update('conditions', e.target.value)} placeholder="e.g., asthma, diabetes, PCOS" />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sub-md text-[var(--color-text-primary)]">Goals</p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <button key={goal} onClick={() => toggleArray('goals', goal)} className={cn(
                    'rounded-lg border px-4 py-2 text-body-sm transition-colors',
                    form.goals.includes(goal) ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                  )}>{goal}</button>
                ))}
              </div>
              <div>
                <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-2">Timeline</label>
                <div className="flex gap-2">
                  {['8 weeks', '12 weeks', '16 weeks', '6 months'].map((t) => (
                    <button key={t} onClick={() => update('timeline', t)} className={cn(
                      'rounded-lg border px-3 py-1.5 text-body-xs transition-colors',
                      form.timeline === t ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    )}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sub-md text-[var(--color-text-primary)]">Training Preferences</p>
              <div>
                <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-2">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE.map((exp) => (
                    <button key={exp} onClick={() => update('experience', exp)} className={cn(
                      'rounded-lg border px-3 py-1.5 text-body-xs transition-colors',
                      form.experience === exp ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    )}>{exp}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Days per week" type="number" value={form.daysPerWeek} onChange={(e) => update('daysPerWeek', e.target.value)} />
                <Input label="Session length (min)" type="number" value={form.sessionLength} onChange={(e) => update('sessionLength', e.target.value)} />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-2">Equipment Access</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map((eq) => (
                    <button key={eq} onClick={() => update('equipment', eq)} className={cn(
                      'rounded-lg border px-3 py-1.5 text-body-xs transition-colors',
                      form.equipment === eq ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    )}>{eq}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sub-md text-[var(--color-text-primary)]">Nutrition Preferences</p>
              <div>
                <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-2">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {RESTRICTIONS.map((r) => (
                    <button key={r} onClick={() => toggleArray('dietaryRestrictions', r)} className={cn(
                      'rounded-lg border px-3 py-1.5 text-body-xs transition-colors',
                      form.dietaryRestrictions.includes(r) ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    )}>{r}</button>
                  ))}
                </div>
              </div>
              <Input label="Meals per day" type="number" value={form.mealsPerDay} onChange={(e) => update('mealsPerDay', e.target.value)} />
              <Input label="Food Allergies" value={form.allergies} onChange={(e) => update('allergies', e.target.value)} placeholder="e.g., peanuts, shellfish" />
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-sub-md text-[var(--color-text-primary)]">Review & Generate</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">Client</p>
                    <p className="text-sub-sm text-[var(--color-text-primary)]">{form.name || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">Age / Sex</p>
                    <p className="text-sub-sm text-[var(--color-text-primary)]">{form.age || '—'} / {form.sex}</p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">Weight / Height</p>
                    <p className="text-sub-sm text-[var(--color-text-primary)]">{form.weight || '—'}kg / {form.height || '—'}cm</p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">Experience</p>
                    <p className="text-sub-sm text-[var(--color-text-primary)]">{form.experience || '—'}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                  <p className="text-body-xs text-[var(--color-text-tertiary)] mb-1">Goals</p>
                  <div className="flex flex-wrap gap-1">
                    {form.goals.map((g) => <Badge key={g} variant="brand">{g}</Badge>)}
                  </div>
                </div>
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                  <p className="text-body-xs text-[var(--color-text-tertiary)] mb-1">Training</p>
                  <p className="text-body-sm text-[var(--color-text-primary)]">
                    {form.daysPerWeek}x/week • {form.sessionLength}min • {form.equipment || '—'}
                  </p>
                </div>
                {form.injuries.length > 0 && form.injuries[0] !== 'None' && (
                  <div className="rounded-lg bg-warning-50/50 dark:bg-amber-900/10 border border-warning-500/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={12} className="text-warning-500" />
                      <p className="text-body-xs font-medium text-warning-600 dark:text-amber-400">Injuries</p>
                    </div>
                    <p className="text-body-sm text-[var(--color-text-primary)]">{form.injuries.join(', ')}</p>
                  </div>
                )}
              </div>

              {generated ? (
                <div className="rounded-xl bg-success-50/50 dark:bg-emerald-900/10 border border-success-500/20 p-4 text-center animate-scale-in">
                  <Check size={24} className="mx-auto text-success-500 mb-2" />
                  <p className="text-sub-md text-[var(--color-text-primary)]">Plans Generated!</p>
                  <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">Workout + nutrition plans created for {form.name}</p>
                  <div className="flex gap-2 mt-4 justify-center">
                    <Button variant="primary" size="md">View Workout Plan</Button>
                    <Button variant="secondary" size="md">View Diet Plan</Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full"
                  onClick={handleGenerate}
                  loading={generating}
                  icon={<Sparkles size={16} />}
                >
                  {generating ? 'Generating AI Plans...' : 'Generate Workout + Nutrition Plan'}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex justify-between">
          <Button variant="ghost" size="md" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft size={14} className="mr-1" /> Back
          </Button>
          <Button variant="primary" size="md" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
