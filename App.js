import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCameraPermissions } from 'expo-camera';
import CameraScreen from './src/screens/CameraScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [screen, setScreen] = useState('camera'); // 'camera' | 'settings'

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  // Permission denied — show request screen
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.logo}>ANON</Text>
          <Text style={styles.tagline}>See the world differently.</Text>

          <View style={styles.divider} />

          <Text style={styles.permissionText}>
            Anon needs camera access to analyze the world around you in
            real-time, like the Mind's Eye from the film.
          </Text>

          <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.grantButtonText}>ENABLE CAMERA</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  // Main app
  return (
    <View style={styles.container}>
      {screen === 'camera' ? (
        <CameraScreen onOpenSettings={() => setScreen('settings')} />
      ) : (
        <SettingsScreen onClose={() => setScreen('camera')} />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logo: {
    color: COLORS.primary,
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 12,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 32,
  },
  permissionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 32,
  },
  grantButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  grantButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});
