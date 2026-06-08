'use client';

import { useState } from 'react';
import {
  Clock,
  Copy,
  CalendarDays,
  ChevronDown,
  Plus,
  Flame,
  Beef,
  Wheat,
  Droplets,
  UtensilsCrossed,
  Cookie,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- Mock Data ---

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const CLIENTS = [
  { id: '1', name: 'Alex Rivera' },
  { id: '2', name: 'Sarah Chen' },
  { id: '3', name: 'Marcus Johnson' },
  { id: '4', name: 'Emma Wilson' },
];

interface Ingredient {
  name: string;
  grams: number;
  calories: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
}

interface Snack {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quickAdd?: boolean;
}

const MEALS: Record<string, Meal[]> = {
  Mon: [
    {
      id: 'm1',
      name: 'Protein Oatmeal Bowl',
      time: '7:30 AM',
      calories: 485,
      protein: 38,
      carbs: 52,
      fat: 14,
      ingredients: [
        { name: 'Rolled oats', grams: 80, calories: 304 },
        { name: 'Whey protein (vanilla)', grams: 30, calories: 120 },
        { name: 'Banana', grams: 100, calories: 89 },
        { name: 'Almond butter', grams: 15, calories: 92 },
        { name: 'Blueberries', grams: 50, calories: 29 },
      ],
    },
    {
      id: 'm2',
      name: 'Grilled Chicken & Quinoa',
      time: '12:30 PM',
      calories: 620,
      protein: 52,
      carbs: 58,
      fat: 18,
      ingredients: [
        { name: 'Chicken breast', grams: 200, calories: 330 },
        { name: 'Quinoa (cooked)', grams: 150, calories: 180 },
        { name: 'Mixed greens', grams: 80, calories: 16 },
        { name: 'Olive oil', grams: 10, calories: 88 },
        { name: 'Cherry tomatoes', grams: 100, calories: 18 },
      ],
    },
    {
      id: 'm3',
      name: 'Salmon with Sweet Potato',
      time: '7:00 PM',
      calories: 580,
      protein: 44,
      carbs: 42,
      fat: 24,
      ingredients: [
        { name: 'Atlantic salmon fillet', grams: 180, calories: 374 },
        { name: 'Sweet potato', grams: 200, calories: 172 },
        { name: 'Asparagus', grams: 100, calories: 20 },
        { name: 'Lemon juice', grams: 15, calories: 4 },
        { name: 'Butter', grams: 10, calories: 72 },
      ],
    },
  ],
  Tue: [
    {
      id: 'm4',
      name: 'Greek Yogurt Parfait',
      time: '7:00 AM',
      calories: 420,
      protein: 35,
      carbs: 48,
      fat: 12,
      ingredients: [
        { name: 'Greek yogurt (0%)', grams: 200, calories: 118 },
        { name: 'Granola', grams: 50, calories: 220 },
        { name: 'Honey', grams: 15, calories: 48 },
        { name: 'Strawberries', grams: 80, calories: 26 },
      ],
    },
    {
      id: 'm5',
      name: 'Turkey Wrap',
      time: '1:00 PM',
      calories: 550,
      protein: 45,
      carbs: 48,
      fat: 20,
      ingredients: [
        { name: 'Turkey breast (sliced)', grams: 150, calories: 195 },
        { name: 'Whole wheat tortilla', grams: 80, calories: 200 },
        { name: 'Avocado', grams: 50, calories: 80 },
        { name: 'Spinach', grams: 40, calories: 9 },
        { name: 'Mustard', grams: 10, calories: 7 },
      ],
    },
    {
      id: 'm6',
      name: 'Lean Beef Stir Fry',
      time: '7:30 PM',
      calories: 610,
      protein: 48,
      carbs: 52,
      fat: 22,
      ingredients: [
        { name: 'Lean beef strips', grams: 180, calories: 288 },
        { name: 'Brown rice (cooked)', grams: 150, calories: 165 },
        { name: 'Bell peppers', grams: 100, calories: 31 },
        { name: 'Broccoli', grams: 100, calories: 34 },
        { name: 'Sesame oil', grams: 10, calories: 88 },
      ],
    },
  ],
};

// Fill remaining days with Mon's data for demo
DAYS.forEach((day) => {
  if (!MEALS[day]) MEALS[day] = MEALS['Mon'];
});

const SNACKS: Snack[] = [
  { id: 's1', name: 'Protein Shake', portion: '1 scoop + 250ml water', calories: 120, protein: 24, carbs: 3, fat: 1, quickAdd: true },
  { id: 's2', name: 'Mixed Nuts', portion: '30g handful', calories: 185, protein: 5, carbs: 6, fat: 16, quickAdd: true },
  { id: 's3', name: 'Apple + PB', portion: '1 medium + 1 tbsp', calories: 195, protein: 4, carbs: 28, fat: 9, quickAdd: true },
  { id: 's4', name: 'Rice Cakes + Cottage Cheese', portion: '2 cakes + 100g', calories: 160, protein: 14, carbs: 18, fat: 3 },
  { id: 's5', name: 'Beef Jerky', portion: '50g', calories: 165, protein: 26, carbs: 5, fat: 4, quickAdd: true },
  { id: 's6', name: 'Dark Chocolate (85%)', portion: '20g (2 squares)', calories: 120, protein: 2, carbs: 8, fat: 10 },
];

// --- Component ---

export default function DietPage() {
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Mon');
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const meals = MEALS[selectedDay] || [];
  const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const selectedClientName = CLIENTS.find((c) => c.id === selectedClient)?.name || '';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Meals & Snacks</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Plan and manage daily nutrition for your clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Copy size={14} />} size="sm">
            Copy Day
          </Button>
          <Button variant="secondary" icon={<CalendarDays size={14} />} size="sm">
            Copy Week
          </Button>
        </div>
      </div>

      {/* Controls: Client Selector + Day Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Client selector */}
        <div className="relative">
          <button
            onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-body-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <span className="font-medium">{selectedClientName}</span>
            <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
          </button>
          {clientDropdownOpen && (
            <div className="absolute z-20 mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg">
              {CLIENTS.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client.id);
                    setClientDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-body-sm transition-colors hover:bg-[var(--color-surface-hover)]',
                    client.id === selectedClient
                      ? 'text-blue-600 font-medium'
                      : 'text-[var(--color-text-primary)]'
                  )}
                >
                  {client.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Day selector */}
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'rounded-md px-3 py-1.5 text-body-xs font-medium transition-all',
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Daily summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
                <Flame size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Daily Total</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{totalCals} kcal</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Protein</p>
                <p className="text-sub-md tabular-nums text-blue-600">{totalProtein}g</p>
              </div>
              <div className="text-center">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Carbs</p>
                <p className="text-sub-md tabular-nums text-amber-600">{totalCarbs}g</p>
              </div>
              <div className="text-center">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Fat</p>
                <p className="text-sub-md tabular-nums text-rose-500">{totalFat}g</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed size={18} className="text-[var(--color-text-tertiary)]" />
          <h2 className="text-sub-md text-[var(--color-text-primary)]">Meals</h2>
          <Badge variant="default">{meals.length}</Badge>
        </div>

        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                className="w-full text-left"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Timing indicator */}
                      <div className="flex flex-col items-center gap-0.5 pt-0.5">
                        <Clock size={14} className="text-[var(--color-text-tertiary)]" />
                        <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)]">{meal.time}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-body-sm font-medium text-[var(--color-text-primary)]">{meal.name}</h3>
                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="flex items-center gap-1 text-body-xs text-[var(--color-text-secondary)]">
                            <Flame size={12} />
                            <span className="tabular-nums">{meal.calories} kcal</span>
                          </span>
                          <span className="flex items-center gap-1 text-body-xs text-blue-600">
                            <Beef size={12} />
                            <span className="tabular-nums">{meal.protein}g P</span>
                          </span>
                          <span className="flex items-center gap-1 text-body-xs text-amber-600">
                            <Wheat size={12} />
                            <span className="tabular-nums">{meal.carbs}g C</span>
                          </span>
                          <span className="flex items-center gap-1 text-body-xs text-rose-500">
                            <Droplets size={12} />
                            <span className="tabular-nums">{meal.fat}g F</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="info">{meal.ingredients.length} items</Badge>
                  </div>
                </CardContent>
              </button>

              {/* Expanded ingredient list */}
              {expandedMeal === meal.id && (
                <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-6 py-4">
                  <p className="text-body-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
                    Ingredients
                  </p>
                  <div className="space-y-2">
                    {meal.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-body-sm text-[var(--color-text-primary)]">{ing.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)]">{ing.grams}g</span>
                          <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)] w-16 text-right">{ing.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Snacks Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cookie size={18} className="text-[var(--color-text-tertiary)]" />
            <h2 className="text-sub-md text-[var(--color-text-primary)]">Snacks</h2>
            <Badge variant="default">{SNACKS.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" icon={<Plus size={14} />}>
            Add Snack
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SNACKS.map((snack) => (
            <Card key={snack.id} className="hover:border-[var(--color-text-tertiary)]/30 transition-all">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-body-sm font-medium text-[var(--color-text-primary)]">{snack.name}</h4>
                    <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">{snack.portion}</p>
                  </div>
                  {snack.quickAdd && (
                    <Badge variant="brand" className="shrink-0">Quick Add</Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)]">{snack.calories} kcal</span>
                  <span className="text-body-xs tabular-nums text-blue-600">{snack.protein}g P</span>
                  <span className="text-body-xs tabular-nums text-amber-600">{snack.carbs}g C</span>
                  <span className="text-body-xs tabular-nums text-rose-500">{snack.fat}g F</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
