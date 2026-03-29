export default function ProgressScreen() {
  const stats = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 75 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 95 },
  ];

  const maxValue = Math.max(...stats.map(s => s.value));

  return (
    <div className="p-6 pb-24 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-1">Your Journey</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Progress</h1>
      </div>

      {/* Streak Card */}
      <div className="bg-white rounded-2xl border border-border-light p-6 mb-6 shadow-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🔥</span>
        </div>
        <p className="text-4xl font-bold text-text-primary tabular-nums">12</p>
        <p className="text-sm font-medium text-text-primary mt-1">Day Streak</p>
        <p className="text-xs text-text-tertiary mt-0.5">Longest: 21 days</p>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-2xl border border-border-light p-6 mb-6 shadow-xs">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-4">Weekly Activity</p>
        <div className="flex justify-around items-end h-32">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-text-tertiary tabular-nums">{stat.value}m</span>
              <div className="w-8 h-24 bg-surface-tertiary rounded-lg relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full rounded-lg transition-all duration-500 bg-brand-500"
                  style={{ height: `${(stat.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-text-tertiary">{stat.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* This Week Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile value="4/5" label="Workouts" dot="bg-brand-500" />
        <StatTile value="180m" label="Duration" dot="bg-blue-500" />
        <StatTile value="2,840" label="Calories" dot="bg-orange-500" />
      </div>

      {/* Personal Records */}
      <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-3">Personal Records</p>
      <div className="space-y-2 mb-6">
        {[
          { exercise: 'Bench Press', weight: '102.5 kg', date: '2 weeks ago' },
          { exercise: 'Squat', weight: '142.5 kg', date: '1 week ago' },
          { exercise: 'Deadlift', weight: '185 kg', date: '3 days ago' },
        ].map((pr, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-light p-4 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <span className="text-base">🏆</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{pr.exercise}</p>
              <p className="text-xs text-text-tertiary">{pr.date}</p>
            </div>
            <p className="text-sm font-semibold text-brand-600 tabular-nums">{pr.weight}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-3">Achievements</p>
      <div className="space-y-2">
        {[
          { icon: '🔥', title: '7 Day Streak', desc: 'Completed workouts 7 days in a row' },
          { icon: '💪', title: 'Strong Start', desc: 'Completed 50 workouts' },
        ].map((a, i) => (
          <div key={i} className="bg-white rounded-xl border border-border-light p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-surface-tertiary flex items-center justify-center text-xl shrink-0">
              {a.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{a.title}</p>
              <p className="text-xs text-text-tertiary">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ value, label, dot }: { value: string; label: string; dot: string }) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 shadow-xs">
      <div className={`w-2 h-2 rounded-full ${dot} mb-2`} />
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
    </div>
  );
}
