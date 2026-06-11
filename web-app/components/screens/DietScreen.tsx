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
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-1">Nutrition</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Diet Plan</h1>
      </div>

      {/* Macro Rings */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium tracking-wider text-white/30 uppercase">Today&apos;s Macros</p>
          <span className="text-sm font-medium text-white/60 tabular-nums">
            {totalCal} / {targetCal} cal
          </span>
        </div>
        <div className="flex justify-around">
          <MacroRing value={102} target={165} label="Protein" unit="g" color="#3B82F6" />
          <MacroRing value={144} target={250} label="Carbs" unit="g" color="#F59E0B" />
          <MacroRing value={58} target={70} label="Fat" unit="g" color="#8B5CF6" />
        </div>

        {/* Calorie progress */}
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/30">Calorie progress</span>
            <span className="font-medium text-white/60 tabular-nums">{Math.round((totalCal / targetCal) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              style={{ width: `${Math.min((totalCal / targetCal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meals */}
      <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Meals</p>
      <div className="space-y-2">
        {meals.map(meal => (
          <div
            key={meal.id}
            className="rounded-xl p-4 transition-all hover:bg-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm text-white">{meal.name}</p>
                <p className="text-xs text-white/30 mt-0.5">{meal.items}</p>
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{meal.calories} cal</span>
            </div>
            <div className="flex gap-2">
              <MacroChip label="P" value={meal.protein} bg="bg-blue-500/10" text="text-blue-400" />
              <MacroChip label="C" value={meal.carbs} bg="bg-amber-500/10" text="text-amber-400" />
              <MacroChip label="F" value={meal.fat} bg="bg-purple-500/10" text="text-purple-400" />
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestion */}
      <div className="rounded-xl p-4 mt-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #111113, #09090B)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top right, rgba(16,185,129,0.1), transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <span className="text-[9px] font-bold text-brand-400">AI</span>
            </div>
            <span className="text-xs font-medium text-brand-400">AI Suggestion</span>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            You&apos;re 63g short on protein. A chicken breast with dinner would close the gap perfectly.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── SVG Ring Chart ──────────────────────────────────────────────── */
function MacroRing({ value, target, label, unit, color }: {
  value: number; target: number; label: string; unit: string; color: string;
}) {
  const pct = Math.min(value / target, 1);
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[76px] h-[76px]">
        <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle
            cx="38" cy="38" r={r} fill="none"
            stroke={color} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white tabular-nums">{value}</span>
          <span className="text-[9px] text-white/30">{unit}</span>
        </div>
      </div>
      <p className="text-[10px] text-white/40 mt-1.5">{label}</p>
      <p className="text-[9px] text-white/20">/ {target}{unit}</p>
    </div>
  );
}

function MacroChip({ label, value, bg, text }: { label: string; value: number; bg: string; text: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${bg} ${text} tabular-nums`}>
      {label} {value}g
    </span>
  );
}
