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

interface JournalData {
  mood: number | null;
  energy: number | null;
  sleepQuality: number | null;
  appetite: number | null;
  feeling: string;
  sleepHours: string;
  steps: string;
  weight: string;
}

// ─── Mood Selector ──────────────────────────────────────────────────────────

const moods = ['😫', '😕', '😐', '😊', '🔥'];

const MoodSelector = ({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (index: number) => void;
}) => (
  <View style={styles.moodRow}>
    {moods.map((emoji, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.moodButton,
          selected === index && styles.moodButtonSelected,
        ]}
        onPress={() => onSelect(index)}
      >
        <Text style={styles.moodEmoji}>{emoji}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Number Scale ───────────────────────────────────────────────────────────

const NumberScale = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (val: number) => void;
}) => (
  <View style={styles.scaleContainer}>
    <Text style={styles.scaleLabel}>{label}</Text>
    <View style={styles.scaleRow}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
        <TouchableOpacity
          key={num}
          style={[
            styles.scaleCircle,
            value === num && styles.scaleCircleSelected,
          ]}
          onPress={() => onChange(num)}
        >
          <Text
            style={[
              styles.scaleNumber,
              value === num && styles.scaleNumberSelected,
            ]}
          >
            {num}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Helper ─────────────────────────────────────────────────────────────────

function getTodayFormatted(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<JournalData>({
    mood: null,
    energy: null,
    sleepQuality: null,
    appetite: null,
    feeling: '',
    sleepHours: '',
    steps: '',
    weight: '',
  });

  const updateField = <K extends keyof JournalData>(
    key: K,
    value: JournalData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
  };

  if (saved) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Journal saved for today</Text>
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
        <Text style={styles.header}>Daily Journal</Text>
        <Text style={styles.dateText}>{getTodayFormatted()}</Text>

        {/* Mood Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How's your mood?</Text>
          <MoodSelector
            selected={data.mood}
            onSelect={(index) => updateField('mood', index)}
          />
        </View>

        {/* Energy Level */}
        <View style={styles.card}>
          <NumberScale
            label="Energy Level"
            value={data.energy}
            onChange={(val) => updateField('energy', val)}
          />
        </View>

        {/* Sleep Quality */}
        <View style={styles.card}>
          <NumberScale
            label="Sleep Quality"
            value={data.sleepQuality}
            onChange={(val) => updateField('sleepQuality', val)}
          />
        </View>

        {/* Appetite */}
        <View style={styles.card}>
          <NumberScale
            label="Appetite"
            value={data.appetite}
            onChange={(val) => updateField('appetite', val)}
          />
        </View>

        {/* Feeling text area */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe how you're feeling today..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={data.feeling}
            onChangeText={(val) => updateField('feeling', val)}
          />
        </View>

        {/* Manual Biometrics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Biometrics</Text>
          <Text style={styles.sectionSubtitle}>
            Manual entry (if no wearable connected)
          </Text>

          <View style={styles.biometricRow}>
            <Text style={styles.biometricLabel}>Sleep Hours</Text>
            <View style={styles.biometricInputWrapper}>
              <TextInput
                style={styles.biometricInput}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={data.sleepHours}
                onChangeText={(val) => updateField('sleepHours', val)}
              />
              <Text style={styles.inputUnit}>hrs</Text>
            </View>
          </View>

          <View style={styles.biometricRow}>
            <Text style={styles.biometricLabel}>Steps</Text>
            <View style={styles.biometricInputWrapper}>
              <TextInput
                style={styles.biometricInput}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={data.steps}
                onChangeText={(val) => updateField('steps', val)}
              />
              <Text style={styles.inputUnit}>steps</Text>
            </View>
          </View>

          <View style={styles.biometricRow}>
            <Text style={styles.biometricLabel}>Weight</Text>
            <View style={styles.biometricInputWrapper}>
              <TextInput
                style={styles.biometricInput}
                placeholder="0.0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={data.weight}
                onChangeText={(val) => updateField('weight', val)}
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Journal Entry</Text>
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
    marginTop: 12,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
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
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: -8,
    marginBottom: 16,
  },
  // Mood
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.inputBg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodButtonSelected: {
    borderColor: colors.brandBlue,
    backgroundColor: '#1E3A5F',
  },
  moodEmoji: {
    fontSize: 28,
  },
  // Number scale
  scaleContainer: {
    marginBottom: 0,
  },
  scaleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleCircleSelected: {
    backgroundColor: colors.brandBlue,
    borderColor: colors.brandBlue,
  },
  scaleNumber: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  scaleNumberSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  // Text area
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
  // Biometrics
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  biometricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  biometricInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricInput: {
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
  inputUnit: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    width: 40,
  },
  // Save button
  saveButton: {
    backgroundColor: colors.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
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
    textAlign: 'center',
  },
});
