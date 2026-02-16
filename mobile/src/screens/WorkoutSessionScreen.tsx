import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { WorkoutPlan, Exercise, WorkoutSession, ExerciseSession } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const WorkoutSessionScreen = ({ route, navigation }: any) => {
  const { workoutPlanId } = route.params || {};
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [exerciseSessions, setExerciseSessions] = useState<{ [key: string]: ExerciseSession }>({});

  useEffect(() => {
    loadWorkoutData();
  }, [workoutPlanId]);

  const loadWorkoutData = async () => {
    try {
      const plan = await apiService.get<WorkoutPlan>(`/workout-plans/${workoutPlanId}`);
      setWorkoutPlan(plan);
      
      // Check for existing session
      try {
        const session = await apiService.get<WorkoutSession>(`/workout-sessions/today/${workoutPlanId}`);
        setWorkoutSession(session);
        setStarted(true);
        setExerciseSessions(session.exercises.reduce((acc, ex) => {
          acc[ex.exerciseId] = ex;
          return acc;
        }, {} as { [key: string]: ExerciseSession }));
      } catch {
        // No existing session, create new one
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async () => {
    if (!workoutPlan) return;

    try {
      const session = await apiService.post<WorkoutSession>('/workout-sessions', {
        workoutPlanId: workoutPlan.id,
      });
      setWorkoutSession(session);
      setStarted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
      console.error(error);
    }
  };

  const completeWorkout = async () => {
    if (!workoutSession) return;

    try {
      const duration = Math.floor((Date.now() - new Date(workoutSession.date).getTime()) / 1000 / 60);
      await apiService.patch(`/workout-sessions/${workoutSession.id}`, {
        completed: true,
        duration,
        exercises: Object.values(exerciseSessions),
      });
      setCompleted(true);
      Alert.alert('Great job!', 'Workout completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete workout');
      console.error(error);
    }
  };

  const updateExerciseSession = (exerciseId: string, sets: any[]) => {
    setExerciseSessions(prev => ({
      ...prev,
      [exerciseId]: {
        exerciseId,
        sets,
      },
    }));
  };

  const currentExercise = workoutPlan?.exercises[currentExerciseIndex];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!workoutPlan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout plan not found</Text>
      </View>
    );
  }

  if (!started) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{workoutPlan.name}</Text>
          <Text style={styles.duration}>{workoutPlan.duration} minutes</Text>
          <Text style={styles.exerciseCount}>{workoutPlan.exercises.length} exercises</Text>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedTitle}>Workout Complete!</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentExerciseIndex + 1) / workoutPlan.exercises.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseNumber}>
            Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}
          </Text>
          <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
          <Text style={styles.exerciseDetails}>
            {currentExercise?.sets} sets × {currentExercise?.reps} reps
            {currentExercise?.weight && ` @ ${currentExercise.weight}kg`}
          </Text>
        </View>

        {currentExercise && (
          <View style={styles.setsContainer}>
            {Array.from({ length: currentExercise.sets }).map((_, index) => {
              const session = exerciseSessions[currentExercise.id];
              const set = session?.sets[index];
              return (
                <View key={index} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {index + 1}</Text>
                  <View style={styles.setInputs}>
                    <TextInput
                      style={styles.setInput}
                      placeholder="Weight"
                      keyboardType="numeric"
                      value={set?.weight?.toString() || ''}
                      onChangeText={(text) => {
                        const sets = exerciseSessions[currentExercise.id]?.sets || [];
                        sets[index] = {
                          setNumber: index + 1,
                          reps: set?.reps || currentExercise.reps,
                          weight: parseFloat(text) || 0,
                          completed: set?.completed || false,
                        };
                        updateExerciseSession(currentExercise.id, sets);
                      }}
                    />
                    <TextInput
                      style={styles.setInput}
                      placeholder="Reps"
                      keyboardType="numeric"
                      value={set?.reps?.toString() || ''}
                      onChangeText={(text) => {
                        const sets = exerciseSessions[currentExercise.id]?.sets || [];
                        sets[index] = {
                          setNumber: index + 1,
                          reps: parseInt(text) || 0,
                          weight: set?.weight || 0,
                          completed: set?.completed || false,
                        };
                        updateExerciseSession(currentExercise.id, sets);
                      }}
                    />
                    <TouchableOpacity
                      style={[
                        styles.checkButton,
                        set?.completed && styles.checkButtonActive,
                      ]}
                      onPress={() => {
                        const sets = exerciseSessions[currentExercise.id]?.sets || [];
                        sets[index] = {
                          ...sets[index] || {
                            setNumber: index + 1,
                            reps: currentExercise.reps,
                            weight: currentExercise.weight || 0,
                            completed: false,
                          },
                          completed: !set?.completed,
                        };
                        updateExerciseSession(currentExercise.id, sets);
                      }}
                    >
                      <Text style={styles.checkButtonText}>
                        {set?.completed ? '✓' : '○'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.formCheckButton}
          onPress={() => navigation.navigate('FormCheck', { exerciseName: currentExercise?.name })}
        >
          <Text style={styles.formCheckButtonText}>📹 Form Check</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentExerciseIndex > 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentExerciseIndex < workoutPlan.exercises.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.completeButton]}
            onPress={completeWorkout}
          >
            <Text style={styles.navButtonText}>Complete Workout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1C1C1E',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  duration: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 5,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  exerciseHeader: {
    marginBottom: 30,
  },
  exerciseNumber: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#8E8E93',
  },
  setsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 60,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  setInput: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonActive: {
    backgroundColor: '#007AFF',
  },
  checkButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  formCheckButton: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  formCheckButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default WorkoutSessionScreen;

