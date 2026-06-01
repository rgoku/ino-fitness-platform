import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Goal, UserBiometrics } from '../types';
import { apiService } from '../services/apiService';

const OnboardingScreen = () => {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [biometrics, setBiometrics] = useState<Partial<UserBiometrics>>({
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activityLevel: 'moderate',
    goals: [],
  });
  // Height input — feet by default, with toggle to cm
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [cm, setCm] = useState('');

  // Convert ft/in → cm (stored value)
  const updateHeightFromFt = (f: string, inc: string) => {
    setFeet(f);
    setInches(inc);
    const ft = parseFloat(f) || 0;
    const i = parseFloat(inc) || 0;
    const total = Math.round((ft * 30.48 + i * 2.54) * 10) / 10;
    setBiometrics((b) => ({ ...b, height: total }));
  };
  const updateHeightFromCm = (v: string) => {
    setCm(v);
    setBiometrics((b) => ({ ...b, height: parseFloat(v) || 0 }));
  };
  // Switch unit and convert displayed value
  const switchUnit = (unit: 'ft' | 'cm') => {
    if (unit === heightUnit) return;
    const cmVal = biometrics.height || 0;
    if (unit === 'cm') {
      setCm(cmVal > 0 ? cmVal.toString() : '');
    } else {
      const totalIn = cmVal / 2.54;
      const ft = Math.floor(totalIn / 12);
      const inc = Math.round(totalIn - ft * 12);
      setFeet(cmVal > 0 ? ft.toString() : '');
      setInches(cmVal > 0 ? inc.toString() : '');
    }
    setHeightUnit(unit);
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setLoading(true);
      try {
        await completeOnboarding(biometrics);
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleGoal = (goal: Goal) => {
    const goals = biometrics.goals || [];
    if (goals.includes(goal)) {
      setBiometrics({ ...biometrics, goals: goals.filter(g => g !== goal) });
    } else {
      setBiometrics({ ...biometrics, goals: [...goals, goal] });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome to INÖ</Text>
      <Text style={styles.subtitle}>Let's set up your fitness profile</Text>

      {step === 1 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>What's your goal?</Text>
          <View style={styles.goalsContainer}>
            {(['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength'] as Goal[]).map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalButton,
                  biometrics.goals?.includes(goal) && styles.goalButtonActive,
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <Text style={[
                  styles.goalText,
                  biometrics.goals?.includes(goal) && styles.goalTextActive,
                ]}>
                  {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Your Measurements</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={biometrics.weight?.toString() || ''}
              onChangeText={(text) => setBiometrics({ ...biometrics, weight: parseFloat(text) || 0 })}
              placeholder="70"
            />
          </View>
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.label}>Height</Text>
              <View style={{ flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 2 }}>
                <TouchableOpacity
                  onPress={() => switchUnit('ft')}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6,
                    backgroundColor: heightUnit === 'ft' ? '#3A86FF' : 'transparent',
                  }}
                >
                  <Text style={{ color: heightUnit === 'ft' ? '#fff' : '#999', fontWeight: '600', fontSize: 12 }}>ft</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => switchUnit('cm')}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6,
                    backgroundColor: heightUnit === 'cm' ? '#3A86FF' : 'transparent',
                  }}
                >
                  <Text style={{ color: heightUnit === 'cm' ? '#fff' : '#999', fontWeight: '600', fontSize: 12 }}>cm</Text>
                </TouchableOpacity>
              </View>
            </View>
            {heightUnit === 'ft' ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={feet}
                    onChangeText={(t) => updateHeightFromFt(t, inches)}
                    placeholder="5"
                  />
                  <Text style={{ color: '#666', fontSize: 11, marginTop: 4, textAlign: 'center' }}>feet</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={inches}
                    onChangeText={(t) => updateHeightFromFt(feet, t)}
                    placeholder="10"
                  />
                  <Text style={{ color: '#666', fontSize: 11, marginTop: 4, textAlign: 'center' }}>inches</Text>
                </View>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cm}
                onChangeText={updateHeightFromCm}
                placeholder="175"
              />
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={biometrics.age?.toString() || ''}
              onChangeText={(text) => setBiometrics({ ...biometrics, age: parseInt(text) || 0 })}
              placeholder="25"
            />
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Gender</Text>
          {(['male', 'female', 'other'] as const).map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.optionButton,
                biometrics.gender === gender && styles.optionButtonActive,
              ]}
              onPress={() => setBiometrics({ ...biometrics, gender })}
            >
              <Text style={[
                styles.optionText,
                biometrics.gender === gender && styles.optionTextActive,
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 4 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Activity Level</Text>
          {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                biometrics.activityLevel === level && styles.optionButtonActive,
              ]}
              onPress={() => setBiometrics({ ...biometrics, activityLevel: level })}
            >
              <Text style={[
                styles.optionText,
                biometrics.activityLevel === level && styles.optionTextActive,
              ]}>
                {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 5 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Review</Text>
          <Text style={styles.reviewText}>Goals: {biometrics.goals?.join(', ')}</Text>
          <Text style={styles.reviewText}>Weight: {biometrics.weight} kg</Text>
          <Text style={styles.reviewText}>
            Height: {(() => {
              const h = biometrics.height || 0;
              if (heightUnit === 'ft') {
                const totalIn = h / 2.54;
                const ft = Math.floor(totalIn / 12);
                const inc = Math.round(totalIn - ft * 12);
                return `${ft}'${inc}" (${h.toFixed(1)} cm)`;
              }
              return `${h.toFixed(1)} cm`;
            })()}
          </Text>
          <Text style={styles.reviewText}>Age: {biometrics.age}</Text>
          <Text style={styles.reviewText}>Gender: {biometrics.gender}</Text>
          <Text style={styles.reviewText}>Activity Level: {biometrics.activityLevel}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 5 ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 40,
    textAlign: 'center',
  },
  step: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  goalsContainer: {
    gap: 15,
  },
  goalButton: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#001A3D',
  },
  goalText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  goalTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionButton: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#001A3D',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default OnboardingScreen;

