export default function DietScreen() {
  const meals = [
    { id: 1, name: 'Breakfast', items: 'Oatmeal with berries, Green tea', calories: 350, protein: 12 },
    { id: 2, name: 'Lunch', items: 'Grilled chicken salad, Brown rice', calories: 550, protein: 35 },
    { id: 3, name: 'Snack', items: 'Greek yogurt, Almonds', calories: 200, protein: 15 },
    { id: 4, name: 'Dinner', items: 'Salmon, Vegetables, Quinoa', calories: 600, protein: 40 },
  ];

  return (
    <div className="p-4 pb-20 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Diet Plan 🥗</h1>
        <p className="text-gray-600">1,700 / 2,000 calories today</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-6 flex justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">102g</div>
          <div className="text-xs text-gray-600">Protein</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">180g</div>
          <div className="text-xs text-gray-600">Carbs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">55g</div>
          <div className="text-xs text-gray-600">Fat</div>
        </div>
      </div>

      {meals.map(meal => (
        <div key={meal.id} className="bg-white rounded-xl shadow-sm p-4 mb-3">
          <div className="flex justify-between mb-2">
            <div className="text-lg font-semibold text-gray-800">{meal.name}</div>
            <div className="text-lg font-semibold text-green-500">{meal.calories} cal</div>
          </div>
          <div className="text-sm text-gray-600 mb-1">{meal.items}</div>
          <div className="text-xs text-gray-500">Protein: {meal.protein}g</div>
        </div>
      ))}
    </div>
  );
}
