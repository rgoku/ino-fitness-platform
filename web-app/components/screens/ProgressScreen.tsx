// ─── Inline Muscle Heatmap (self-contained for web-app) ─────────────────────

const muscleData = [
  { id: 'chest', label: 'Chest', workouts: 12 },
  { id: 'shoulders', label: 'Shoulders', workouts: 14 },
  { id: 'biceps', label: 'Biceps', workouts: 10 },
  { id: 'triceps', label: 'Triceps', workouts: 8 },
  { id: 'abs', label: 'Abs', workouts: 6 },
  { id: 'quads', label: 'Quads', workouts: 15 },
  { id: 'hamstrings', label: 'Hamstrings', workouts: 11 },
  { id: 'calves', label: 'Calves', workouts: 7 },
  { id: 'glutes', label: 'Glutes', workouts: 13 },
  { id: 'lats', label: 'Lats', workouts: 10 },
  { id: 'traps', label: 'Traps', workouts: 9 },
  { id: 'forearms', label: 'Forearms', workouts: 4 },
];

function getHeatColor(workouts: number, max: number): string {
  if (workouts === 0) return '#F4F4F5';
  const ratio = workouts / max;
  if (ratio <= 0.15) return '#D1FAE5';
  if (ratio <= 0.3) return '#A7F3D0';
  if (ratio <= 0.5) return '#6EE7B7';
  if (ratio <= 0.7) return '#34D399';
  return '#10B981';
}

// SVG paths for front-view muscle groups
const frontPaths = [
  { id: 'traps', d: 'M85,72 C88,65 95,60 100,58 C105,60 112,65 115,72 L110,78 L90,78 Z' },
  { id: 'shoulders', d: 'M72,78 C68,75 62,78 60,85 C58,92 60,100 64,102 L80,98 L82,82 Z' },
  { id: 'shoulders', d: 'M128,78 C132,75 138,78 140,85 C142,92 140,100 136,102 L120,98 L118,82 Z' },
  { id: 'chest', d: 'M80,82 L82,98 L100,104 L100,82 C96,78 88,78 80,82 Z' },
  { id: 'chest', d: 'M120,82 L118,98 L100,104 L100,82 C104,78 112,78 120,82 Z' },
  { id: 'biceps', d: 'M60,102 C58,108 56,118 56,128 C56,134 58,138 62,138 L68,136 C70,130 70,118 68,106 L64,102 Z' },
  { id: 'biceps', d: 'M140,102 C142,108 144,118 144,128 C144,134 142,138 138,138 L132,136 C130,130 130,118 132,106 L136,102 Z' },
  { id: 'forearms', d: 'M56,138 C54,148 52,158 52,168 C52,174 54,178 56,178 L62,176 C64,170 64,158 62,146 L62,138 Z' },
  { id: 'forearms', d: 'M144,138 C146,148 148,158 148,168 C148,174 146,178 144,178 L138,176 C136,170 136,158 138,146 L138,138 Z' },
  { id: 'abs', d: 'M90,104 L88,120 L100,122 L112,120 L110,104 L100,106 Z' },
  { id: 'abs', d: 'M88,120 L86,140 L92,148 L100,150 L108,148 L114,140 L112,120 L100,122 Z' },
  { id: 'quads', d: 'M80,150 C78,152 76,154 78,164 L80,190 C82,204 84,216 86,224 L96,226 L100,226 L100,154 L92,150 Z' },
  { id: 'quads', d: 'M120,150 C122,152 124,154 122,164 L120,190 C118,204 116,216 114,224 L104,226 L100,226 L100,154 L108,150 Z' },
  { id: 'calves', d: 'M84,232 C82,242 80,258 80,270 C80,280 82,288 86,290 L94,288 C96,280 96,268 94,254 L90,232 Z' },
  { id: 'calves', d: 'M116,232 C118,242 120,258 120,270 C120,280 118,288 114,290 L106,288 C104,280 104,268 106,254 L110,232 Z' },
];

const headOutline = 'M100,8 C92,8 86,14 86,22 C86,30 90,38 92,42 L88,48 C86,52 85,58 85,62 L85,72 C88,65 95,60 100,58 C105,60 112,65 115,72 L115,62 C115,58 114,52 112,48 L108,42 C110,38 114,30 114,22 C114,14 108,8 100,8 Z';

function MuscleHeatmapInline() {
  const max = Math.max(...muscleData.map(d => d.workouts), 1);
  const dataMap = Object.fromEntries(muscleData.map(d => [d.id, d]));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 314" width="220" height="340" className="select-none">
        <path d={headOutline} fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="0.5" opacity="0.5" />
        {frontPaths.map((p, i) => {
          const d = dataMap[p.id];
          const color = d ? getHeatColor(d.workouts, max) : '#F4F4F5';
          return (
            <path key={i} d={p.d} fill={color} stroke="#E4E4E7" strokeWidth="0.5" opacity="0.85" />
          );
        })}
        <path d="M50,178 C48,182 46,186 46,188 C46,192 50,194 52,190 L56,180 Z" fill="#F4F4F5" opacity="0.4" />
        <path d="M150,178 C152,182 154,186 154,188 C154,192 150,194 148,190 L144,180 Z" fill="#F4F4F5" opacity="0.4" />
        <path d="M82,290 L80,300 C80,304 84,306 90,306 L96,304 L94,290 Z" fill="#F4F4F5" opacity="0.4" />
        <path d="M118,290 L120,300 C120,304 116,306 110,306 L104,304 L106,290 Z" fill="#F4F4F5" opacity="0.4" />
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1">
        <span className="text-[10px] text-text-tertiary">Less</span>
        {['#F4F4F5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981'].map((c, i) => (
          <div key={i} className="h-2.5 w-5 rounded-sm border border-border-light" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-text-tertiary">More</span>
      </div>

      {/* Muscle stats */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 w-full">
        {muscleData
          .filter(d => ['chest', 'shoulders', 'quads', 'abs', 'biceps', 'calves'].includes(d.id))
          .sort((a, b) => b.workouts - a.workouts)
          .map(d => (
            <div key={d.id} className="rounded-lg border border-border-light px-2 py-1.5">
              <p className="text-[10px] text-text-tertiary">{d.label}</p>
              <p className="text-sm font-bold text-text-primary tabular-nums">{d.workouts}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

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

      {/* Muscle Heatmap */}
      <div className="bg-white rounded-2xl border border-border-light p-6 mb-6 shadow-xs">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-4">Muscle Heatmap</p>
        <MuscleHeatmapInline />
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
