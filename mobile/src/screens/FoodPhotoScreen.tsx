import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { FoodDetectionResult } from '../types';
import { apiService } from '../services/apiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const colors = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceTertiary: '#F1F1F1',
  border: '#E4E4E7',
  borderLight: '#F0F0F2',
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#A0A0AB',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  orange: '#F97316',
  purple: '#8B5CF6',
  white: '#FFFFFF',
};

const FoodPhotoScreen = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<FoodDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const takePicture = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission required', 'Camera permission is required to take photos');
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeFood(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeFood(result.assets[0].uri);
    }
  };

  const analyzeFood = async (imageUri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'food.jpg',
      } as any);
      const detectionResult = await apiService.post<FoodDetectionResult>(
        '/ai/food-detection',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(detectionResult);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze food photo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.permissionIcon}>
          <Text style={{ fontSize: 32 }}>📸</Text>
        </View>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionDesc}>
          We need camera access to analyze your food photos and estimate macros.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!image ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing}>
            {/* Viewfinder overlay */}
            <View style={styles.viewfinderOverlay}>
              <View style={styles.viewfinderBox}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.viewfinderHint}>Position food within the frame</Text>
            </View>

            {/* Bottom controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {/* Image preview */}
          <Image source={{ uri: image }} style={styles.imagePreview} />

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Analyzing food...</Text>
              <Text style={styles.loadingSubtext}>AI is estimating macros</Text>
            </View>
          ) : result ? (
            <View style={styles.resultsCard}>
              {/* Confidence */}
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round((result.confidence ?? 0.85) * 100)}% confidence
                  </Text>
                </View>
              </View>

              {/* Detected Foods */}
              <Text style={styles.resultsTitle}>Detected Foods</Text>
              {result.foods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View style={styles.foodRow}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodCalories}>{Math.round(food.macros.calories)} cal</Text>
                  </View>
                  <Text style={styles.foodPortion}>
                    {food.portionSize} {food.unit}
                  </Text>
                  <View style={styles.macroChips}>
                    <MacroChip label="P" value={food.macros.protein} color={colors.blue} />
                    <MacroChip label="C" value={food.macros.carbs} color={colors.orange} />
                    <MacroChip label="F" value={food.macros.fat} color={colors.purple} />
                  </View>
                </View>
              ))}

              {/* Total */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalCalories}>{Math.round(result.macros.calories)} cal</Text>
                </View>
                <View style={styles.macroChips}>
                  <MacroChip label="Protein" value={result.macros.protein} color={colors.blue} />
                  <MacroChip label="Carbs" value={result.macros.carbs} color={colors.orange} />
                  <MacroChip label="Fat" value={result.macros.fat} color={colors.purple} />
                </View>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => Alert.alert('Success', 'Macros added to daily log')}
              >
                <Text style={styles.primaryButtonText}>Add to Daily Log</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Retake */}
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => { setImage(null); setResult(null); }}
          >
            <Text style={styles.retakeButtonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Macro Chip ─────────────────────────────────────────────────────────────

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.macroChip, { backgroundColor: `${color}10` }]}>
      <View style={[styles.macroChipDot, { backgroundColor: color }]} />
      <Text style={[styles.macroChipText, { color }]}>
        {label} {Math.round(value)}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },

  // Viewfinder
  viewfinderOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderBox: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.white,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  viewfinderHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 16,
  },

  // Camera controls
  cameraControls: {
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: 'center',
    gap: 16,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  galleryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  galleryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },

  // Result
  resultContainer: {
    flex: 1,
    padding: 24,
  },
  imagePreview: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 20,
  },

  // Loading
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Results
  resultsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  confidenceRow: {
    marginBottom: 16,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  foodItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  foodPortion: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  macroChips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  macroChipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  macroChipText: {
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

  // Total
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalCalories: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  retakeButton: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Permission
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});

export default FoodPhotoScreen;
