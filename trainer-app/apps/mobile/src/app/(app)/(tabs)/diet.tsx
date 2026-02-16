import React from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native';

interface Meal {
  id: number;
  name: string;
  items: string;
  calories: number;
  protein: number;
}

export default function DietScreen() {
  const meals: Meal[] = [
    { id: 1, name: 'Breakfast', items: 'Oatmeal with berries, Green tea', calories: 350, protein: 12 },
    { id: 2, name: 'Lunch', items: 'Grilled chicken salad, Brown rice', calories: 550, protein: 35 },
    { id: 3, name: 'Snack', items: 'Greek yogurt, Almonds', calories: 200, protein: 15 },
    { id: 4, name: 'Dinner', items: 'Salmon, Vegetables, Quinoa', calories: 600, protein: 40 },
  ];

  const renderMeal = ({ item }: { item: Meal }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealCalories}>{item.calories} cal</Text>
      </View>
      <Text style={styles.mealItems}>{item.items}</Text>
      <Text style={styles.mealProtein}>Protein: {item.protein}g</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diet Plan 🥗</Text>
        <Text style={styles.subtitle}>1,700 / 2,000 calories today</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>102g</Text>
          <Text style={styles.statLabel}>Protein</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>180g</Text>
          <Text style={styles.statLabel}>Carbs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>55g</Text>
          <Text style={styles.statLabel}>Fat</Text>
        </View>
      </View>
          export default function DietScreen() {
            const [meals] = useState([
              { id: 1, name: 'Breakfast', items: 'Oatmeal with berries, Green tea', calories: 350, protein: 12 },
              { id: 2, name: 'Lunch', items: 'Grilled chicken salad, Brown rice', calories: 550, protein: 35 },
              { id: 3, name: 'Snack', items: 'Greek yogurt, Almonds', calories: 200, protein: 15 },
              { id: 4, name: 'Dinner', items: 'Salmon, Vegetables, Quinoa', calories: 600, protein: 40 },
            ]);
      />
            return (
              <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                  <View style={styles.header}>
                    <Text style={styles.greeting}>Diet Plan 🥗</Text>
                    <Text style={styles.subtext}>1,700 / 2,000 calories today</Text>
                  </View>

                  <View style={styles.macrosCard}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>102g</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>180g</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>55g</Text>
                      <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                  </View>

                  {meals.map(meal => (
                    <View key={meal.id} style={styles.mealCard}>
                      <View style={styles.mealHeader}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                      </View>
                      <Text style={styles.mealItems}>{meal.items}</Text>
                      <Text style={styles.mealProtein}>Protein: {meal.protein}g</Text>
                    </View>
                  ))}
                </ScrollView>
              </SafeAreaView>
            );
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  mealsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  mealItems: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  mealProtein: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
