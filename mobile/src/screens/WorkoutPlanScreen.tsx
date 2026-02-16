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
import { WorkoutPlan, Exercise } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const WorkoutPlanScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutPlan();
  }, []);

  const loadWorkoutPlan = async () => {
    try {
      const plan = await apiService.get<WorkoutPlan>(`/workout-plans/current`);
      setWorkoutPlan(plan);
    } catch (error) {
      console.error('Error loading workout plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = () => {
    if (workoutPlan) {
      navigation.navigate('WorkoutSession', { workoutPlanId: workoutPlan.id });
    }
  };

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
        <Text style={styles.noPlanText}>No workout plan available</Text>
        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Generate AI Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{workoutPlan.name}</Text>
        <Text style={styles.duration}>{workoutPlan.duration} min</Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Exercises</Text>
      <FlatList
        data={workoutPlan.exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseNumber}>{index + 1}</Text>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>
                {item.sets} sets × {item.reps} reps
                {item.weight && ` @ ${item.weight}kg`}
              </Text>
              <Text style={styles.exerciseMuscles}>
                {item.muscleGroups.join(', ')}
              </Text>
              {item.videoUrl && (
                <TouchableOpacity style={styles.videoButton}>
                  <Text style={styles.videoButtonText}>📹 Watch Demo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  duration: {
    fontSize: 16,
    color: '#8E8E93',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  exerciseNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 15,
    width: 30,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 5,
  },
  exerciseMuscles: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 10,
  },
  videoButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  videoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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

export default WorkoutPlanScreen;

