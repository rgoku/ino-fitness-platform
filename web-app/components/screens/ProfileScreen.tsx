export default function ProfileScreen() {
  return (
    <div className="p-6 pb-24 overflow-y-auto h-full">
      {/* Avatar & Name */}
      <div className="text-center mb-8 pt-4">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-glow">
          <span className="text-2xl font-bold text-white">JD</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">John Doe</h2>
        <p className="text-sm text-text-tertiary mt-0.5">john.doe@email.com</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-border-light p-3 text-center shadow-xs">
          <p className="text-lg font-bold text-text-primary tabular-nums">12</p>
          <p className="text-[10px] text-text-tertiary mt-0.5">Streak</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light p-3 text-center shadow-xs">
          <p className="text-lg font-bold text-text-primary tabular-nums">87%</p>
          <p className="text-[10px] text-text-tertiary mt-0.5">Consistency</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light p-3 text-center shadow-xs">
          <p className="text-lg font-bold text-text-primary tabular-nums">52</p>
          <p className="text-[10px] text-text-tertiary mt-0.5">Workouts</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-border-light p-5 mb-6 shadow-xs">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-4">Personal Info</p>
        <div className="space-y-0">
          {[
            { label: 'Age', value: '28 years' },
            { label: 'Weight', value: '80 kg' },
            { label: 'Height', value: '180 cm' },
            { label: 'Goal', value: 'Build Muscle' },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex justify-between py-3 ${i < arr.length - 1 ? 'border-b border-border-light' : ''}`}>
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span className="text-sm font-medium text-text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coach Info */}
      <div className="bg-white rounded-2xl border border-border-light p-5 mb-6 shadow-xs">
        <p className="text-xs font-medium tracking-wider text-text-tertiary uppercase mb-4">Your Coach</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">MC</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Mike Chen</p>
            <p className="text-xs text-text-tertiary">Strength & Conditioning</p>
          </div>
          <button className="ml-auto text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg">
            Message
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full bg-brand-500 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-xs">
          Edit Profile
        </button>
        <button className="w-full bg-white text-error-600 py-3.5 rounded-xl text-sm font-medium border border-border hover:bg-error-50 transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
}
