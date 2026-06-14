import MuscleTwin from '../body-analysis/MuscleTwin';

export default function ProgressScreen() {
  const today = new Date().getDay(); // 0=Sun
  const dayIndex = today === 0 ? 6 : today - 1;

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
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-1">Your Journey</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Progress</h1>
      </div>

      {/* Body Analysis — Digital Twin */}
      <div className="mb-6">
        <MuscleTwin />
      </div>

      {/* Streak Card */}
      <div className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(251,191,36,0.02))', border: '1px solid rgba(245,158,11,0.12)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(245,158,11,0.1)' }}>
          <StreakIcon />
        </div>
        <p className="text-4xl font-bold text-white tabular-nums">12</p>
        <p className="text-sm font-medium text-white mt-1">Day Streak</p>
        <p className="text-xs text-white/30 mt-0.5">Longest: 21 days</p>
      </div>

      {/* Weekly Activity Chart */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-4">Weekly Activity</p>
        <div className="flex justify-around items-end h-32">
          {stats.map((stat, index) => {
            const isToday = index === dayIndex;
            return (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-white/30 tabular-nums">{stat.value}m</span>
                <div className="w-8 h-24 bg-white/[0.04] rounded-lg relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 w-full rounded-lg transition-all duration-500 ${isToday ? 'bg-brand-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-brand-500/60'}`}
                    style={{ height: `${(stat.value / maxValue) * 100}%` }}
                  />
                </div>
                <span className={`text-[11px] ${isToday ? 'text-brand-400 font-medium' : 'text-white/30'}`}>{stat.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* This Week Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile value="4/5" label="Workouts" color="bg-brand-500/20" dot="bg-brand-400" />
        <StatTile value="180m" label="Duration" color="bg-blue-500/20" dot="bg-blue-400" />
        <StatTile value="2,840" label="Calories" color="bg-orange-500/20" dot="bg-orange-400" />
      </div>

      {/* Personal Records */}
      <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Personal Records</p>
      <div className="space-y-2 mb-6">
        {[
          { exercise: 'Bench Press', weight: '102.5 kg', date: '2 weeks ago' },
          { exercise: 'Squat', weight: '142.5 kg', date: '1 week ago' },
          { exercise: 'Deadlift', weight: '185 kg', date: '3 days ago' },
        ].map((pr, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <TrophyIcon />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{pr.exercise}</p>
              <p className="text-xs text-white/30">{pr.date}</p>
            </div>
            <p className="text-sm font-semibold text-brand-400 tabular-nums">{pr.weight}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Achievements</p>
      <div className="space-y-2">
        {[
          { icon: <StreakIcon />, title: '7 Day Streak', desc: 'Completed workouts 7 days in a row' },
          { icon: <MuscleIcon />, title: 'Strong Start', desc: 'Completed 50 workouts' },
        ].map((a, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-400 shrink-0" style={{ background: 'rgba(16,185,129,0.08)' }}>
              {a.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{a.title}</p>
              <p className="text-xs text-white/30">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ value, label, color, dot }: { value: string; label: string; color: string; dot: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={`w-2 h-2 rounded-full ${dot} mb-2`} />
      <p className="text-xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

/* ── SVG Icons ──────────────────────────────────────────────────── */
function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function StreakIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function MuscleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
