export default function ProfileScreen() {
  return (
    <div className="p-4 pb-20 overflow-y-auto h-full">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">JD</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">John Doe</h2>
        <p className="text-gray-600">john.doe@email.com</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Age</span>
            <span className="font-semibold text-gray-800">28 years</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Weight</span>
            <span className="font-semibold text-gray-800">75 kg</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Height</span>
            <span className="font-semibold text-gray-800">180 cm</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600">Goal</span>
            <span className="font-semibold text-gray-800">Build Muscle</span>
          </div>
        </div>
      </div>

      <button className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold mb-3 hover:bg-blue-600 transition">
        Edit Profile
      </button>

      <button className="w-full bg-white text-red-500 py-4 rounded-xl font-semibold border-2 border-red-500 hover:bg-red-50 transition">
        Log Out
      </button>
    </div>
  );
}
