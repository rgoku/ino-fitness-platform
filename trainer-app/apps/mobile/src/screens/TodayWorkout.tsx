import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  BounceIn,
  FadeIn,
} from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loggingService, trophyService } from '@trainer-app/api';
import type { Trophy } from '@trainer-app/types';

interface WorkoutSet {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  rpe: string;
  rest: string;
  videoUrl?: string;
  notes?: string;
  logged: {
    reps: number;
    weight: string;
  }[];
}

export default function TodayWorkout() {
  const { workoutId, clientId } = useLocalSearchParams();
  const [exercises, setExercises] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSetInput, setCurrentSetInput] = useState<{
    [key: string]: { reps: string; weight: string };
  }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      // TODO: Fetch workout details from Supabase
      // For now, using mock data
      const mockExercises: WorkoutSet[] = [
        {
          id: '1',
          exerciseName: 'Bench Press',
          sets: 4,
          reps: '8-10',
          rpe: '8-9',
          rest: '3:00',
          videoUrl: 'https://example.com/bench-press',
          logged: [],
        },
        {
          id: '2',
          exerciseName: 'Incline Dumbbell Press',
          sets: 3,
          reps: '10-12',
          rpe: '8',
          rest: '2:00',
          logged: [],
        },
        {
          id: '3',
          exerciseName: 'Cable Flyes',
          sets: 3,
          reps: '12-15',
          rpe: '7-8',
          rest: '1:30',
          logged: [],
        },
      ];
      setExercises(mockExercises);
    } catch (error) {
      console.error('Error loading workout:', error);
      Alert.alert('Error', 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSet = async (exerciseId: string, setIndex: number) => {
    try {
      const input = currentSetInput[`${exerciseId}-${setIndex}`];
      if (!input?.reps || !input?.weight) {
        Alert.alert('Missing Info', 'Please enter reps and weight');
        return;
      }

      setSubmitting(true);

      // Log the set via Supabase
      const { error } = await loggingService.logSet({
        client_id: clientId as string,
        workout_exercise_id: exerciseId,
        reps: parseInt(input.reps, 10),
        weight: parseFloat(input.weight),
      });

      if (error) throw error;

      // Update local state
      setExercises((prev: WorkoutSet[]) =>
        prev.map((ex: WorkoutSet) => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              logged: [
                ...ex.logged,
                { reps: parseInt(input.reps, 10), weight: input.weight },
              ],
            };
          }
          return ex;
        })
      );

      // Clear input
      setCurrentSetInput((prev: typeof currentSetInput) => {
        const newState = { ...prev };
        delete newState[`${exerciseId}-${setIndex}`];
        return newState;
      });

      // Check for trophy awards
      await checkTrophyAwards();

      Alert.alert('Success', 'Set logged!');
    } catch (error) {
      console.error('Error logging set:', error);
      Alert.alert('Error', 'Failed to log set');
    } finally {
      setSubmitting(false);
    }
  };

  const checkTrophyAwards = async () => {
    try {
      // Get client's stats
      const totalSets = exercises.reduce(
        (sum: number, ex: WorkoutSet) => sum + ex.logged.length,
        0
      );

      // Check for milestones and award trophies
      if (totalSets === 1) {
        // First workout
        const { data: trophies } = await trophyService.getTrophies();
        const firstWorkoutTrophy = trophies?.find(
          (t: Trophy) => t.type === 'workout_count' && t.threshold === 1
        );

        if (firstWorkoutTrophy) {
          await trophyService.awardTrophy(
            clientId as string,
            firstWorkoutTrophy.id
          );
        }
      }

      if (totalSets === 10) {
        // 10 workouts trophy
        const { data: trophies } = await trophyService.getTrophies();
        const tenWorkoutsTrophy = trophies?.find(
          (t: Trophy) => t.type === 'workout_count' && t.threshold === 10
        );

        if (tenWorkoutsTrophy) {
          await trophyService.awardTrophy(
            clientId as string,
            tenWorkoutsTrophy.id
          );
        }
      }
    } catch (error) {
      console.error('Error checking trophies:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gradient-to-b from-blue-600 to-blue-400 px-6 py-6">
        <Text className="text-3xl font-bold text-white mb-2">
          Today's Workout
        </Text>
        <Text className="text-blue-100">
          {exercises.length} exercises • {exercises.reduce((sum: number, ex: WorkoutSet) => sum + ex.sets, 0)}{' '}
          total sets
        </Text>
      </View>

      {/* Exercises */}
      <View className="p-6">
        {exercises.map((exercise: WorkoutSet, index: number) => (
          <Animated.View
            key={exercise.id}
            entering={FadeIn.delay(index * 100)}
            className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {/* Exercise Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  {exercise.exerciseName}
                </Text>
                <View className="flex-row gap-3 mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="repeat" size={14} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {exercise.sets} sets
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="fitness" size={14} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {exercise.reps} reps
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="hourglass" size={14} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {exercise.rest} rest
                    </Text>
                  </View>
                </View>
                {exercise.notes && (
                  <Text className="text-xs text-gray-600 mt-2 italic">
                    {exercise.notes}
                  </Text>
                )}
              </View>
            </View>

            {/* Set Logging Inputs */}
            <View className="space-y-3 mb-4">
              {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                <View
                  key={`${exercise.id}-${setIndex}`}
                  className="flex-row gap-2 bg-white rounded p-3 border border-gray-300"
                >
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Set {setIndex + 1}
                    </Text>
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 bg-gray-100 rounded px-2 py-2 text-sm"
                        placeholder="Reps"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        value={
                          currentSetInput[`${exercise.id}-${setIndex}`]
                            ?.reps || ''
                        }
                        onChangeText={(text: string) =>
                          setCurrentSetInput((prev: typeof currentSetInput) => ({
                            ...prev,
                            [`${exercise.id}-${setIndex}`]: {
                              ...prev[`${exercise.id}-${setIndex}`],
                              reps: text,
                            },
                          }))
                        }
                      />
                      <TextInput
                        className="flex-1 bg-gray-100 rounded px-2 py-2 text-sm"
                        placeholder="Weight"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        value={
                          currentSetInput[`${exercise.id}-${setIndex}`]
                            ?.weight || ''
                        }
                        onChangeText={(text: string) =>
                          setCurrentSetInput((prev: typeof currentSetInput) => ({
                            ...prev,
                            [`${exercise.id}-${setIndex}`]: {
                              ...prev[`${exercise.id}-${setIndex}`],
                              weight: text,
                            },
                          }))
                        }
                      />
                      <TouchableOpacity
                        className="bg-blue-500 rounded px-3 py-2 justify-center"
                        onPress={() =>
                          handleLogSet(exercise.id, setIndex)
                        }
                        disabled={submitting}
                      >
                        {submitting ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Ionicons name="checkmark" size={18} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Logged Sets History */}
            {exercise.logged.length > 0 && (
              <View className="bg-green-50 rounded p-3 border border-green-200">
                <Text className="text-xs font-semibold text-green-700 mb-2">
                  Logged Sets
                </Text>
                {exercise.logged.map((log: { reps: number; weight: string }, logIndex: number) => (
                  <Text key={logIndex} className="text-xs text-green-700">
                    Set {logIndex + 1}: {log.reps} reps × {log.weight} lbs
                  </Text>
                ))}
              </View>
            )}
          </Animated.View>
        ))}
      </View>

      {/* Spacer */}
      <View className="h-8" />
    </ScrollView>
  );
}

// ============================================================================
// TROPHY POPUP COMPONENT
// ============================================================================

interface TrophyPopupProps {
  trophy: Trophy;
  visible: boolean;
  onClose: () => void;
}

export function TrophyPopup({ trophy, visible, onClose }: TrophyPopupProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <Animated.View entering={BounceIn} className="items-center gap-6">
        {/* Trophy Icon */}
        <View className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <Text className="text-6xl">{trophy.icon}</Text>
        </View>

        {/* Trophy Title */}
        <Text className="text-3xl font-bold text-white text-center">
          {trophy.title}
        </Text>

        {/* Trophy Description */}
        <Text className="text-base text-gray-200 text-center px-6">
          {trophy.description}
        </Text>

        {/* Badge Type */}
        <View className="px-4 py-2 bg-white/20 rounded-full">
          <Text className="text-sm font-semibold text-white capitalize">
            {trophy.type.replace('_', ' ')}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          className="mt-6 px-8 py-3 bg-white rounded-full"
          onPress={onClose}
        >
          <Text className="font-semibold text-blue-600">Awesome!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
