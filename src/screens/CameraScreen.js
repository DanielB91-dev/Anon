import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import HudOverlay from '../components/HudOverlay';
import { analyzeImage, getApiKey } from '../services/vision';
import { COLORS } from '../constants/theme';

export default function CameraScreen({ onOpenSettings }) {
  const cameraRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [description, setDescription] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [facing, setFacing] = useState('back');

  const captureAndAnalyze = useCallback(async () => {
    if (isAnalyzing || !cameraRef.current) return;

    if (!getApiKey()) {
      Alert.alert('API Key Required', 'Please set your Anthropic API key in Settings.', [
        { text: 'Open Settings', onPress: onOpenSettings },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });

      // Resize for faster upload
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const result = await analyzeImage(manipulated.base64);
      const now = new Date();
      setDescription(result);
      setTimestamp(now.toLocaleTimeString());
    } catch (error) {
      Alert.alert('Analysis Failed', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, onOpenSettings]);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <HudOverlay
          description={description}
          isAnalyzing={isAnalyzing}
          timestamp={timestamp}
        />

        {/* Bottom controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onOpenSettings}>
            <Text style={styles.secondaryButtonText}>⚙</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
            onPress={captureAndAnalyze}
            disabled={isAnalyzing}
            activeOpacity={0.7}
          >
            <View style={styles.captureButtonInner}>
              <View style={[styles.captureButtonCenter, isAnalyzing && styles.captureButtonCenterActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={toggleFacing}>
            <Text style={styles.secondaryButtonText}>⟲</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    borderColor: COLORS.textSecondary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonCenter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primaryDim,
  },
  captureButtonCenterActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.4)',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 20,
  },
});
