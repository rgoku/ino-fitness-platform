export default function ProfileScreen() {
  return (
    <div className="p-6 pb-24 overflow-y-auto h-full">
      {/* Avatar & Name */}
      <div className="text-center mb-8 pt-4">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
          <span className="text-2xl font-bold text-white">JD</span>
        </div>
        <h2 className="text-xl font-bold text-white">John Doe</h2>
        <p className="text-sm text-white/30 mt-0.5">john.doe@email.com</p>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="text-[10px] font-bold text-brand-400 tracking-wider">PRO</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { value: '12', label: 'Streak' },
          { value: '87%', label: 'Consistency' },
          { value: '52', label: 'Workouts' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-lg font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Personal Info */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-4">Personal Info</p>
        <div className="space-y-0">
          {[
            { label: 'Age', value: '28 years' },
            { label: 'Weight', value: '80 kg' },
            { label: 'Height', value: '180 cm' },
            { label: 'Goal', value: 'Build Muscle' },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex justify-between py-3 ${i < arr.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
              <span className="text-sm text-white/40">{item.label}</span>
              <span className="text-sm font-medium text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coach Info */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-4">Your Coach</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">MC</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Mike Chen</p>
            <p className="text-xs text-white/30">Strength & Conditioning</p>
          </div>
          <button className="ml-auto text-xs font-medium text-brand-400 px-3 py-1.5 rounded-lg transition-colors hover:bg-brand-500/10" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            Message
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full bg-brand-500 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-brand-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          Edit Profile
        </button>
        <button className="w-full py-3.5 rounded-xl text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(239,68,68,0.15)' }}>
          Log Out
        </button>
      </div>
    </div>
  );
}
