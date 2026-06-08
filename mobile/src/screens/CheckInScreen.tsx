import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0F1E',
  surface: '#0C1220',
  border: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  brandBlue: '#2563EB',
  inputBg: '#111827',
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface CheckInData {
  frontPhoto: boolean;
  backPhoto: boolean;
  weight: string;
  waist: string;
  hips: string;
  chest: string;
  arms: string;
  workoutAdherence: number;
  nutritionAdherence: number;
  sleepQuality: number;
  weekSummary: string;
  issues: string;
}

// ─── Slider Component ───────────────────────────────────────────────────────

const AdherenceSlider = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) => (
  <View style={styles.sliderContainer}>
    <View style={styles.sliderHeader}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <Text style={styles.sliderValue}>{value}/10</Text>
    </View>
    <View style={styles.sliderTrack}>
      {Array.from({ length: 11 }, (_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onChange(i)}
          style={[
            styles.sliderDot,
            i <= value && { backgroundColor: colors.brandBlue },
            i === value && styles.sliderDotActive,
          ]}
        >
          <Text
            style={[
              styles.sliderDotText,
              i <= value && { color: colors.textPrimary },
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Photo Box Component ────────────────────────────────────────────────────

const PhotoBox = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.photoBox, selected && styles.photoBoxSelected]}
    onPress={onPress}
  >
    {selected ? (
      <Text style={styles.photoCheckmark}>✓</Text>
    ) : (
      <Text style={styles.cameraIcon}>📷</Text>
    )}
    <Text style={styles.photoLabel}>{label}</Text>
    <Text style={styles.photoHint}>
      {selected ? 'Photo selected' : 'Tap to take/select'}
    </Text>
  </TouchableOpacity>
);

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function CheckInScreen() {
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<CheckInData>({
    frontPhoto: false,
    backPhoto: false,
    weight: '',
    waist: '',
    hips: '',
    chest: '',
    arms: '',
    workoutAdherence: 7,
    nutritionAdherence: 7,
    sleepQuality: 7,
    weekSummary: '',
    issues: '',
  });

  const updateField = <K extends keyof CheckInData>(
    key: K,
    value: CheckInData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Check-in submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your coach will review it soon.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.header}>Weekly Check-in</Text>

        {/* Photo Upload Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Progress Photos</Text>
          <View style={styles.photoRow}>
            <PhotoBox
              label="Front"
              selected={data.frontPhoto}
              onPress={() => updateField('frontPhoto', !data.frontPhoto)}
            />
            <PhotoBox
              label="Back"
              selected={data.backPhoto}
              onPress={() => updateField('backPhoto', !data.backPhoto)}
            />
          </View>
        </View>

        {/* Weight */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={data.weight}
              onChangeText={(val) => updateField('weight', val)}
            />
            <Text style={styles.inputUnit}>kg</Text>
          </View>
        </View>

        {/* Body Measurements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Body Measurements</Text>
          {(['waist', 'hips', 'chest', 'arms'] as const).map((field) => (
            <View key={field} style={styles.measurementRow}>
              <Text style={styles.measurementLabel}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Text>
              <View style={styles.measurementInputWrapper}>
                <TextInput
                  style={styles.measurementInput}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={data[field]}
                  onChangeText={(val) => updateField(field, val)}
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Adherence Sliders */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Adherence Ratings</Text>
          <AdherenceSlider
            label="Workout Adherence"
            value={data.workoutAdherence}
            onChange={(val) => updateField('workoutAdherence', val)}
          />
          <AdherenceSlider
            label="Nutrition Adherence"
            value={data.nutritionAdherence}
            onChange={(val) => updateField('nutritionAdherence', val)}
          />
          <AdherenceSlider
            label="Sleep Quality"
            value={data.sleepQuality}
            onChange={(val) => updateField('sleepQuality', val)}
          />
        </View>

        {/* Free text areas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How did this week go?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share your thoughts on this week..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={data.weekSummary}
            onChangeText={(val) => updateField('weekSummary', val)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Any issues or blockers?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Injuries, schedule conflicts, motivation..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={data.issues}
            onChangeText={(val) => updateField('issues', val)}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Check-in</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
    marginTop: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  // Photo boxes
  photoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBox: {
    flex: 1,
    height: 140,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBoxSelected: {
    borderColor: colors.brandBlue,
    borderStyle: 'solid',
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoCheckmark: {
    fontSize: 32,
    color: colors.brandBlue,
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  photoHint: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  // Input fields
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  // Measurements
  measurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  measurementLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  measurementInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementInput: {
    width: 80,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  // Slider
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandBlue,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotActive: {
    borderColor: colors.brandBlue,
    borderWidth: 2,
  },
  sliderDotText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  // Text areas
  textArea: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
  },
  // Submit
  submitButton: {
    backgroundColor: colors.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bottomSpacer: {
    height: 40,
  },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 64,
    color: colors.brandBlue,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
