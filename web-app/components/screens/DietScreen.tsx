export default function DietScreen() {
  const meals = [
    { id: 1, name: 'Breakfast', items: 'Oatmeal with berries, Green tea', calories: 350, protein: 12, carbs: 52, fat: 8 },
    { id: 2, name: 'Lunch', items: 'Grilled chicken salad, Brown rice', calories: 550, protein: 35, carbs: 45, fat: 18 },
    { id: 3, name: 'Snack', items: 'Greek yogurt, Almonds', calories: 200, protein: 15, carbs: 12, fat: 10 },
    { id: 4, name: 'Dinner', items: 'Salmon, Vegetables, Quinoa', calories: 600, protein: 40, carbs: 35, fat: 22 },
  ];

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const targetCal = 2200;

  return (
    <div className="p-6 pb-24 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-1" style={{ fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: '0.15em' }}>栄養管理</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Diet Plan</h1>
      </div>

      {/* Macro Rings */}
      <div className="bg-white rounded-2xl border border-border-light p-6 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase">Today's Macros</p>
          <span className="text-sm font-medium text-text-secondary tabular-nums">
            {totalCal} / {targetCal} cal
          </span>
        </div>
        <div className="flex justify-around">
          <MacroDisplay value={102} target={165} label="Protein" unit="g" color="text-blue-500" />
          <MacroDisplay value={144} target={250} label="Carbs" unit="g" color="text-orange-500" />
          <MacroDisplay value={58} target={70} label="Fat" unit="g" color="text-purple-500" />
        </div>

        {/* Calorie progress */}
        <div className="mt-5 pt-4 border-t border-border-light">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-text-tertiary">Calorie progress</span>
            <span className="font-medium text-text-secondary tabular-nums">{Math.round((totalCal / targetCal) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-tertiary">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${Math.min((totalCal / targetCal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meals */}
      <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-3">Meals</p>
      <div className="space-y-2">
        {meals.map(meal => (
          <div key={meal.id} className="bg-white rounded-xl border border-border-light p-4 shadow-xs hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm text-text-primary">{meal.name}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{meal.items}</p>
              </div>
              <span className="text-sm font-bold text-text-primary tabular-nums">{meal.calories} cal</span>
            </div>
            <div className="flex gap-2">
              <MacroChip label="P" value={meal.protein} color="bg-blue-50 text-blue-600" />
              <MacroChip label="C" value={meal.carbs} color="bg-orange-50 text-orange-600" />
              <MacroChip label="F" value={meal.fat} color="bg-purple-50 text-purple-600" />
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestion */}
      <div className="bg-brand-50 rounded-xl p-4 mt-6 border border-brand-100">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-brand-100 flex items-center justify-center">
            <span className="text-[9px] font-bold text-brand-600">AI</span>
          </div>
          <span className="text-xs font-medium text-brand-600">AI Suggestion</span>
        </div>
        <p className="text-sm text-text-primary leading-relaxed">
          You're 63g short on protein. A chicken breast with dinner would close the gap perfectly.
        </p>
      </div>
    </div>
  );
}

function MacroDisplay({ value, target, label, unit, color }: {
  value: number; target: number; label: string; unit: string; color: string;
}) {
  const pct = Math.round((value / target) * 100);
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}<span className="text-sm font-normal">{unit}</span></p>
      <p className="text-xs text-text-tertiary mt-0.5">/ {target}{unit}</p>
      <p className="text-[10px] text-text-tertiary mt-0.5">{label} ({pct}%)</p>
    </div>
  );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${color} tabular-nums`}>
      {label} {value}g
    </span>
  );
}
