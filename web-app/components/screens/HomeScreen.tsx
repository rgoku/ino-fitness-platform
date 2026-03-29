export default function HomeScreen() {
  const workouts = [
    { id: 1, name: 'Upper Body Strength', duration: '45 min', calories: 320, exercises: 5 },
    { id: 2, name: 'HIIT Cardio', duration: '25 min', calories: 280, exercises: 8 },
    { id: 3, name: 'Mobility & Recovery', duration: '20 min', calories: 80, exercises: 6 },
  ];

  return (
    <div className="p-6 pb-24 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-1">Good Morning</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Let's train.</h1>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard value="1,450" label="Calories" color="brand" />
        <StatCard value="4/5" label="Workouts" color="blue" />
        <StatCard value="12d" label="Streak" color="orange" />
      </div>

      {/* AI Insight */}
      <div className="bg-brand-50 rounded-xl p-4 mb-8 border border-brand-100">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-brand-100 flex items-center justify-center">
            <span className="text-[9px] font-bold text-brand-600">AI</span>
          </div>
          <span className="text-xs font-medium text-brand-600">AI Insight</span>
        </div>
        <p className="text-sm text-text-primary leading-relaxed">
          Your protein intake has been below target this week. Add a post-workout shake to hit your goals.
        </p>
      </div>

      {/* Today's Workouts */}
      <div className="mb-6">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-3">Today's Workouts</p>
        <div className="space-y-2">
          {workouts.map(workout => (
            <div
              key={workout.id}
              className="bg-white rounded-xl border border-border-light p-4 flex justify-between items-center shadow-xs hover:shadow-card transition-shadow"
            >
              <div>
                <p className="font-medium text-sm text-text-primary">{workout.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-tertiary">{workout.exercises} exercises</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <span className="text-xs text-text-tertiary">{workout.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <span className="text-xs text-text-tertiary">{workout.calories} cal</span>
                </div>
              </div>
              <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors shadow-xs">
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction icon="📸" label="Scan Food" bg="bg-brand-50" />
        <QuickAction icon="💬" label="Coach" bg="bg-blue-50" />
        <QuickAction icon="📊" label="Progress" bg="bg-purple-50" />
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  };
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 shadow-xs">
      <div className={`w-2 h-2 rounded-full ${colorMap[color]} mb-2`} />
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({ icon, label, bg }: { icon: string; label: string; bg: string }) {
  return (
    <button className="bg-white rounded-xl border border-border-light p-4 flex flex-col items-center gap-2 shadow-xs hover:shadow-card transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center text-lg`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-text-primary">{label}</span>
    </button>
  );
}
