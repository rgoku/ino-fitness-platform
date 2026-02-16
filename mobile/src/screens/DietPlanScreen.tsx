import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { DietPlan, Meal } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const DietPlanScreen = () => {
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  useEffect(() => {
    loadDietPlan();
  }, []);

  const loadDietPlan = async () => {
    try {
      const plan = await apiService.get<DietPlan>(`/diet-plans/current`);
      setDietPlan(plan);
    } catch (error) {
      console.error('Error loading diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = () => {
    // Navigate to grocery list screen
    // This would aggregate all ingredients from the weekly plan
  };

  const swapMeal = async (mealId: string, alternativeMealId: string) => {
    try {
      await apiService.post(`/diet-plans/${dietPlan?.id}/swap-meal`, {
        mealId,
        alternativeMealId,
      });
      loadDietPlan();
    } catch (error) {
      console.error('Error swapping meal:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!dietPlan) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPlanText}>No diet plan available</Text>
        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Generate AI Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const todayMeals = dietPlan.weeklyPlan[selectedDay] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Diet Plan</Text>
        <TouchableOpacity style={styles.groceryButton} onPress={generateGroceryList}>
          <Text style={styles.groceryButtonText}>🛒 Grocery List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daySelector}>
        {Object.keys(dietPlan.weeklyPlan).map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[
              styles.dayButtonText,
              selectedDay === day && styles.dayButtonTextActive,
            ]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={todayMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealType}>{item.type.toUpperCase()}</Text>
            <Text style={styles.mealName}>{item.name}</Text>
            <View style={styles.macrosRow}>
              <Text style={styles.macroText}>
                {Math.round(item.macros.calories)} cal
              </Text>
              <Text style={styles.macroText}>
                P: {Math.round(item.macros.protein)}g
              </Text>
              <Text style={styles.macroText}>
                C: {Math.round(item.macros.carbs)}g
              </Text>
              <Text style={styles.macroText}>
                F: {Math.round(item.macros.fat)}g
              </Text>
            </View>
            {item.swappable && item.alternativeMeals && (
              <TouchableOpacity style={styles.swapButton}>
                <Text style={styles.swapButtonText}>Swap Meal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {dietPlan.citations && dietPlan.citations.length > 0 && (
        <View style={styles.citationsCard}>
          <Text style={styles.citationsTitle}>Scientific Citations</Text>
          {dietPlan.citations.map((citation, index) => (
            <Text key={index} style={styles.citation}>
              {index + 1}. {citation}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  groceryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  groceryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 5,
  },
  dayButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  mealCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  mealType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  mealName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  macroText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  swapButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  swapButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  citationsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  citationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  citation: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 10,
  },
  noPlanText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DietPlanScreen;

