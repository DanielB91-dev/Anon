import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HudOverlay({
  description,
  isAnalyzing,
  timestamp,
  autoScan,
  scanInterval,
  scanCount,
}) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (description) {
      slideAnim.setValue(20);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [description, scanCount]);

  const statusLabel = autoScan
    ? `SCANNING [${scanInterval}]`
    : isAnalyzing
    ? 'ANALYZING'
    : 'READY';

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top HUD bar */}
      <View style={styles.topBar}>
        <View style={styles.hudCorner}>
          <Text style={styles.hudLabel}>ANON v1.0</Text>
        </View>
        <Animated.View style={[styles.statusIndicator, { opacity: pulseAnim }]}>
          <View style={[
            styles.dot,
            autoScan ? styles.dotScanning : isAnalyzing ? styles.dotActive : styles.dotIdle,
          ]} />
          <Text style={[styles.statusText, autoScan && styles.statusTextScanning]}>
            {statusLabel}
          </Text>
        </Animated.View>
      </View>

      {/* Scan counter in auto mode */}
      {autoScan && scanCount > 0 && (
        <View style={styles.scanCounter}>
          <Text style={styles.scanCounterText}>SCANS: {scanCount}</Text>
        </View>
      )}

      {/* Scan lines effect */}
      <View style={styles.scanLines}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.scanLine} />
        ))}
      </View>

      {/* Crosshair */}
      <View style={styles.crosshair}>
        <View style={[styles.crosshairLine, styles.crosshairH]} />
        <View style={[styles.crosshairLine, styles.crosshairV]} />
        <View style={styles.crosshairCenter} />
      </View>

      {/* Corner brackets */}
      <View style={[styles.bracket, styles.bracketTL]} />
      <View style={[styles.bracket, styles.bracketTR]} />
      <View style={[styles.bracket, styles.bracketBL]} />
      <View style={[styles.bracket, styles.bracketBR]} />

      {/* Description panel */}
      {description && (
        <Animated.View style={[
          styles.descriptionPanel,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          <View style={styles.descriptionHeader}>
            <Text style={styles.descriptionLabel}>
              {autoScan ? 'LIVE ANALYSIS' : 'ANALYSIS'}
            </Text>
            {timestamp && (
              <Text style={styles.timestamp}>{timestamp}</Text>
            )}
          </View>
          <Text style={styles.descriptionText}>{description}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const BRACKET_SIZE = 40;
const BRACKET_THICKNESS = 2;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  hudCorner: {
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: COLORS.primary,
    paddingLeft: 8,
    paddingTop: 4,
  },
  hudLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  dotIdle: {
    backgroundColor: COLORS.textSecondary,
  },
  dotScanning: {
    backgroundColor: '#00ff64',
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  statusTextScanning: {
    color: '#00ff64',
  },
  scanCounter: {
    position: 'absolute',
    top: 95,
    right: 20,
  },
  scanCounterText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  scanLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    opacity: 0.08,
  },
  scanLine: {
    height: 1,
    backgroundColor: COLORS.primary,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairLine: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  crosshairH: {
    width: 40,
    height: 1,
  },
  crosshairV: {
    width: 1,
    height: 40,
  },
  crosshairCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.primary,
    opacity: 0.5,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
  },
  bracketTL: {
    top: 120,
    left: 30,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  bracketTR: {
    top: 120,
    right: 30,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  bracketBL: {
    bottom: 200,
    left: 30,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  bracketBR: {
    bottom: 200,
    right: 30,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  descriptionPanel: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 16,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  descriptionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
