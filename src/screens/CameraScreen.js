import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import HudOverlay from '../components/HudOverlay';
import { analyzeImage, getApiKey } from '../services/vision';
import { COLORS } from '../constants/theme';

export default function CameraScreen({ onOpenSettings }) {
  const cameraRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [description, setDescription] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [facing, setFacing] = useState('back');
  const [autoScan, setAutoScan] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const captureAndAnalyze = useCallback(async () => {
    if (isAnalyzingRef.current || !cameraRef.current) return;
    if (!getApiKey()) {
      setAutoScan(false);
      Alert.alert('API Key Required', 'Please set your Anthropic API key in Settings.', [
        { text: 'Open Settings', onPress: onOpenSettings },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.4 });
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 720 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const result = await analyzeImage(manipulated.base64);
      const now = new Date();
      setDescription(result);
      setTimestamp(now.toLocaleTimeString());
      setScanCount((prev) => prev + 1);
    } catch (error) {
      if (error.message.includes('API key')) {
        setAutoScan(false);
      }
      setDescription('Error: ' + error.message);
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalyzing(false);
    }
  }, [onOpenSettings]);

  // Auto-scan: chain scans back-to-back instead of fixed interval
  useEffect(() => {
    if (!autoScan) return;
    let cancelled = false;

    const runLoop = async () => {
      while (!cancelled) {
        await captureAndAnalyze();
        // Small pause between scans to let the camera settle
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };
    runLoop();

    return () => { cancelled = true; };
  }, [autoScan, captureAndAnalyze]);

  const toggleAutoScan = useCallback(() => {
    setAutoScan((prev) => !prev);
  }, []);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      <HudOverlay
        description={description}
        isAnalyzing={isAnalyzing}
        timestamp={timestamp}
        autoScan={autoScan}
        scanCount={scanCount}
      />

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onOpenSettings}>
          <Text style={styles.secondaryButtonText}>⚙</Text>
        </TouchableOpacity>

        {/* Main capture / auto-scan button */}
        <TouchableOpacity
          style={[styles.captureButton, autoScan && styles.captureButtonAutoScan]}
          onPress={autoScan ? toggleAutoScan : captureAndAnalyze}
          onLongPress={toggleAutoScan}
          disabled={isAnalyzing && !autoScan}
          activeOpacity={0.7}
        >
          <View style={styles.captureButtonInner}>
            {autoScan ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={[styles.captureButtonCenter, isAnalyzing && styles.captureButtonCenterActive]} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={toggleFacing}>
          <Text style={styles.secondaryButtonText}>⟲</Text>
        </TouchableOpacity>
      </View>

      {/* Auto scan toggle */}
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modeButton, autoScan && styles.modeButtonActive]}
          onPress={toggleAutoScan}
        >
          <Text style={[styles.modeButtonText, autoScan && styles.modeButtonTextActive]}>
            {autoScan ? '■ STOP' : '▶ CONTINUOUS'}
          </Text>
        </TouchableOpacity>
      </View>
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
    bottom: 80,
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
  captureButtonAutoScan: {
    borderColor: COLORS.danger,
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
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.danger,
    borderRadius: 4,
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
  modeBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modeButtonActive: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
  },
  modeButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  modeButtonTextActive: {
    color: COLORS.danger,
  },
});
