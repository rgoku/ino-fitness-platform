import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { DietPlan, Meal } from '../types';
import { apiService } from '../services/apiService';
import * as offlineCache from '../services/offlineCache';
import { offlineQueue } from '../services/offlineQueue';
import { ShoppingCartIcon, UtensilsIcon } from '../components/icons';

const MealCard = React.memo(({ item, onSwapMeal }: { item: Meal; onSwapMeal?: (mealId: string, alternativeId: string) => void }) => {
  const handleSwap = onSwapMeal && item.alternativeMeals?.[0]
    ? () => onSwapMeal(item.id, item.alternativeMeals![0].id)
    : undefined;
  return (
    <View style={styles.mealCard}>
      <Text style={styles.mealType}>{item.type?.toUpperCase() ?? 'MEAL'}</Text>
      <Text style={styles.mealName}>{item.name}</Text>
      <View style={styles.macrosRow}>
        <Text style={styles.macroText}>{Math.round(item.macros?.calories ?? 0)} cal</Text>
        <Text style={styles.macroText}>P: {Math.round(item.macros?.protein ?? 0)}g</Text>
        <Text style={styles.macroText}>C: {Math.round(item.macros?.carbs ?? 0)}g</Text>
        <Text style={styles.macroText}>F: {Math.round(item.macros?.fat ?? 0)}g</Text>
      </View>
      {item.swappable && item.alternativeMeals && item.alternativeMeals.length > 0 && handleSwap && (
        <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
          <Text style={styles.swapButtonText}>Swap Meal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});
MealCard.displayName = 'MealCard';

const DietPlanScreen = React.memo(() => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [noPlan, setNoPlan] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );

  const loadDietPlan = useCallback(async (fromCacheOnly = false) => {
    const cached = await offlineCache.getCached<DietPlan>(offlineCache.CACHE_KEYS.DIET_PLAN);
    if (cached) {
      setDietPlan(cached);
      setIsOffline(false);
    }
    if (fromCacheOnly) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const plan = await apiService.get<DietPlan>('/diet-plans/current');
      setDietPlan(plan);
      setNoPlan(false);
      await offlineCache.setCached(offlineCache.CACHE_KEYS.DIET_PLAN, plan);
      setIsOffline(false);
    } catch (error: any) {
      if (error?.message === 'Offline' && cached) {
        setIsOffline(true);
      } else if (error?.status === 404 || error?.response?.status === 404 || error?.message?.includes('404')) {
        // Backend doesn't have this endpoint yet — show friendly empty state
        setNoPlan(true);
        setDietPlan(null);
      } else {
        console.error('Error loading diet plan:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDietPlan();
  }, [loadDietPlan]);

  useEffect(() => {
    const unsub = offlineCache.onReconnect(() => loadDietPlan());
    return unsub;
  }, [loadDietPlan]);

  const generateGroceryList = useCallback(() => {
    // Navigate to grocery list screen
  }, []);

  const swapMeal = useCallback(
    async (mealId: string, alternativeMealId: string) => {
      if (!dietPlan?.id) return;
      let alternativeMeal: Meal | undefined;
      for (const day of Object.values(dietPlan.weeklyPlan)) {
        const meal = day.find((m) => m.id === mealId);
        if (meal?.alternativeMeals) {
          alternativeMeal = meal.alternativeMeals.find((m) => m.id === alternativeMealId);
          break;
        }
      }
      const prevPlan = dietPlan;
      if (alternativeMeal) {
        const optimisticPlan: DietPlan = {
          ...dietPlan,
          weeklyPlan: { ...dietPlan.weeklyPlan },
        };
        for (const day of Object.keys(optimisticPlan.weeklyPlan)) {
          optimisticPlan.weeklyPlan[day] = optimisticPlan.weeklyPlan[day].map((m) =>
            m.id === mealId ? alternativeMeal! : m
          );
        }
        setDietPlan(optimisticPlan);
        await offlineCache.setCached(offlineCache.CACHE_KEYS.DIET_PLAN, optimisticPlan);
      }
      try {
        await apiService.post(`/diet-plans/${dietPlan.id}/swap-meal`, {
          mealId,
          alternativeMealId,
        });
        loadDietPlan();
      } catch (error: any) {
        if (error?.message === 'Offline') {
          await offlineQueue.queueRequest('POST', `/diet-plans/${dietPlan.id}/swap-meal`, {
            mealId,
            alternativeMealId,
          });
        } else if (alternativeMeal) {
          setDietPlan(prevPlan);
          await offlineCache.setCached(offlineCache.CACHE_KEYS.DIET_PLAN, prevPlan);
          console.error('Error swapping meal:', error);
        }
      }
    },
    [dietPlan, loadDietPlan]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!dietPlan) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <View style={styles.emptyIcon}>
          <UtensilsIcon color="#10B981" size={36} strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>No diet plan yet</Text>
        <Text style={styles.emptyDesc}>
          Your coach hasn&apos;t set up a diet plan for you yet. As soon as they do, your meals, macros, and grocery list will land here.
        </Text>
        <View style={styles.emptyHintBadge}>
          <Text style={styles.emptyHintText}>Waiting for coach</Text>
        </View>
      </View>
    );
  }

  const todayMeals = dietPlan.weeklyPlan[selectedDay] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Showing cached plan. Changes will sync when back online.</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>Diet Plan</Text>
        <TouchableOpacity style={styles.groceryButton} onPress={generateGroceryList}>
          <ShoppingCartIcon color="#FFFFFF" size={16} />
          <Text style={styles.groceryButtonText}>Grocery List</Text>
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

      {todayMeals.map((item) => (
        <MealCard key={item.id} item={item} onSwapMeal={swapMeal} />
      ))}

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
});

DietPlanScreen.displayName = 'DietPlanScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
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
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  groceryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#0C1220',
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
    backgroundColor: '#2563EB',
  },
  dayButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  mealCard: {
    backgroundColor: '#0C1220',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  mealType: {
    fontSize: 12,
    color: '#2563EB',
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
    color: '#64748B',
  },
  swapButton: {
    backgroundColor: '#2563EB',
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
    backgroundColor: '#0C1220',
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
    color: '#64748B',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  emptyHintBadge: {
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.30)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  emptyHintText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  offlineBanner: {
    backgroundColor: '#1E293B',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DietPlanScreen;

