import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { workoutService } from '../services/workoutService';

const { width, height } = Dimensions.get('window');

function getScoreColor(score: number): string {
  if (score >= 80) return '#34C759';
  if (score >= 60) return '#FF9500';
  return '#FF3B30';
}

export default function FormCheckScreen({ navigation, route }: any) {
  const { exerciseName } = route.params || { exerciseName: 'Exercise' };
  const { user } = useAuth();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result?.granted) {
          Alert.alert('Camera permission required', 'Please enable camera access');
        }
      }
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsRecording(true);
      const recording = await cameraRef.current.recordAsync();
      setRecordedUri(recording.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const analyzeForm = async () => {
    if (!recordedUri || !user?.id) {
      Alert.alert('Error', 'Please record a video first');
      return;
    }

    setLoading(true);
    try {
      const result = await workoutService.analyzeFormFromVideo(
        'session_123',
        recordedUri,
        exerciseName
      );
      setFeedback(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze form');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetRecording = () => {
    setRecordedUri(null);
    setFeedback(null);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera access is required</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (feedback) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Form Score</Text>
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreValue, { color: getScoreColor(feedback.score) }]}>
              {feedback.score}
            </Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreProgress,
                {
                  width: `${feedback.score}%`,
                  backgroundColor: getScoreColor(feedback.score),
                },
              ]}
            />
          </View>
        </View>

        {/* Safety Level */}
        {feedback.safety_level && (
          <View style={styles.safetyCard}>
            <Text style={styles.cardTitle}>Safety Level</Text>
            <Text
              style={[
                styles.safetyText,
                {
                  color:
                    feedback.safety_level === 'safe'
                      ? '#34C759'
                      : feedback.safety_level === 'moderate'
                      ? '#FF9500'
                      : '#FF3B30',
                },
              ]}
            >
              {feedback.safety_level.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Strengths</Text>
            {feedback.strengths.map((strength: string, idx: number) => (
              <View key={idx} style={styles.point}>
                <Text style={styles.pointBullet}>•</Text>
                <Text style={styles.pointText}>{strength}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Areas for Improvement */}
        {feedback.improvements && feedback.improvements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📌 Areas to Improve</Text>
            {feedback.improvements.map((improvement: string, idx: number) => (
              <View key={idx} style={styles.point}>
                <Text style={styles.pointBullet}>•</Text>
                <Text style={styles.pointText}>{improvement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {feedback.recommendations && feedback.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Recommendations</Text>
            {feedback.recommendations.map((rec: string, idx: number) => (
              <View key={idx} style={styles.point}>
                <Text style={styles.pointBullet}>•</Text>
                <Text style={styles.pointText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Warnings */}
        {feedback.warnings && feedback.warnings.length > 0 && (
          <View style={[styles.section, styles.warningSection]}>
            <Text style={styles.sectionTitle}>⚠️ Warnings</Text>
            {feedback.warnings.map((warning: string, idx: number) => (
              <View key={idx} style={styles.point}>
                <Text style={styles.pointBullet}>•</Text>
                <Text style={[styles.pointText, styles.warningText]}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetRecording}
          >
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      {!recordedUri ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          {/* Guide Overlay */}
          <View style={styles.guideOverlay}>
            <View style={styles.guideBox}>
              <View style={styles.guideBorder} />
              <Text style={styles.guideText}>Position yourself in the frame</Text>
            </View>

            {/* Recording Button */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View
                  style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordButtonInnerActive,
                  ]}
                />
              </TouchableOpacity>
              <Text style={styles.recordButtonLabel}>
                {isRecording ? 'Stop' : 'Start Recording'}
              </Text>
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Video Ready for Analysis</Text>
          <Text style={styles.previewSubtext}>Exercise: {exerciseName}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resetRecording}
              >
                <Text style={styles.secondaryButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={analyzeForm}
              >
                <Text style={styles.buttonText}>Analyze Form</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  guideOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  guideBox: {
    width: width * 0.8,
    height: height * 0.5,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  recordButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    color: '#8E8E93',
    fontSize: 18,
    marginLeft: 4,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3A3C',
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
  },
  safetyCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  cardTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  point: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pointBullet: {
    color: '#007AFF',
    fontSize: 18,
    marginRight: 12,
    marginTop: -2,
  },
  pointText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  warningSection: {
    backgroundColor: '#3C2620',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  warningText: {
    color: '#FF3B30',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#3A3A3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
});

