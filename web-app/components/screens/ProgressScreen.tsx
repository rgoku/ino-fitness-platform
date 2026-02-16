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
    <div className="p-4 pb-20 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Your Progress 📊</h1>
        <p className="text-gray-600">Keep up the great work!</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Weekly Activity (minutes)</h3>
        <div className="flex justify-around items-end h-32">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-8 h-28 bg-gray-100 rounded relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full bg-blue-500 rounded transition-all"
                  style={{ height: `${(stat.value / maxValue) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">{stat.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements 🏆</h3>
        <div className="flex items-center mb-4">
          <div className="text-4xl mr-4">🔥</div>
          <div>
            <div className="font-semibold text-gray-800">7 Day Streak</div>
            <div className="text-sm text-gray-600">Completed workouts 7 days in a row</div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-4xl mr-4">💪</div>
          <div>
            <div className="font-semibold text-gray-800">Strong Start</div>
            <div className="text-sm text-gray-600">Completed 50 workouts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
