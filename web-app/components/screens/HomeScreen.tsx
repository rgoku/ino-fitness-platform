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
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-1">Good Morning</p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Let&apos;s train.</span>
        </h1>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard value="1,450" label="Calories" icon={<FlameIcon />} gradient="from-orange-500/20 to-orange-600/5" />
        <StatCard value="4/5" label="Workouts" icon={<DumbbellIcon />} gradient="from-blue-500/20 to-blue-600/5" />
        <StatCard value="12d" label="Streak" icon={<ZapIcon />} gradient="from-brand-500/20 to-brand-600/5" />
      </div>

      {/* AI Insight */}
      <div className="rounded-xl p-4 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #111113, #09090B)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.12), transparent 60%), radial-gradient(ellipse at bottom left, rgba(6,182,212,0.08), transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))' }}>
              <span className="text-[9px] font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </div>
            <span className="text-xs font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">AI Insight</span>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            Your protein intake has been below target this week. Add a post-workout shake to hit your goals.
          </p>
        </div>
      </div>

      {/* Today's Workouts */}
      <div className="mb-6">
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Today&apos;s Workouts</p>
        <div className="space-y-2">
          {workouts.map(workout => (
            <div
              key={workout.id}
              className="rounded-xl p-4 flex justify-between items-center transition-all hover:bg-white/[0.04]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="font-medium text-sm text-white">{workout.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/40">{workout.exercises} exercises</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-xs text-white/40">{workout.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-xs text-white/40">{workout.calories} cal</span>
                </div>
              </div>
              <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction icon={<CameraIcon />} label="Scan Food" />
        <QuickAction icon={<MessageIcon />} label="Coach" />
        <QuickAction icon={<TrendingUpIcon />} label="Progress" />
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, gradient }: { value: string; label: string; icon: React.ReactNode; gradient: string }) {
  return (
    <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <div className="mb-2 text-white/40">{icon}</div>
        <p className="text-xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-white/[0.04]"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center text-brand-400">
        {icon}
      </div>
      <span className="text-xs font-medium text-white/60">{label}</span>
    </button>
  );
}

/* ── SVG Icons ────────────────────────────────────────────────────── */
function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
