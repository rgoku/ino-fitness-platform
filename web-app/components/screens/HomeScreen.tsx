export default function HomeScreen() {
  const workouts = [
    { id: 1, name: 'Morning Run', duration: '30 min', calories: 250 },
    { id: 2, name: 'Strength Training', duration: '45 min', calories: 300 },
    { id: 3, name: 'Yoga', duration: '20 min', calories: 100 },
  ];

  return (
    <div className="p-4 pb-20 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Welcome Back! 💪</h1>
        <p className="text-gray-600">Let's crush today's goals</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-6 flex justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500 mb-1">1,250</div>
          <div className="text-xs text-gray-600">Calories Burned</div>
        </div>
        <div className="w-px bg-gray-200"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500 mb-1">5.2</div>
          <div className="text-xs text-gray-600">Miles Run</div>
        </div>
        <div className="w-px bg-gray-200"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500 mb-1">3/5</div>
          <div className="text-xs text-gray-600">Workouts</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Workouts</h2>
      {workouts.map(workout => (
        <div key={workout.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 flex justify-between items-center">
          <div>
            <div className="font-semibold text-gray-800 mb-1">{workout.name}</div>
            <div className="text-sm text-gray-600">{workout.duration} • {workout.calories} cal</div>
          </div>
          <button className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
            Start
          </button>
        </div>
      ))}
    </div>
  );
}
