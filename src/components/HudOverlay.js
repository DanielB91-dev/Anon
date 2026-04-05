import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HudOverlay({ description, isAnalyzing, timestamp }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (description) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [description]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top HUD bar */}
      <View style={styles.topBar}>
        <View style={styles.hudCorner}>
          <Text style={styles.hudLabel}>ANON v1.0</Text>
        </View>
        <Animated.View style={[styles.statusIndicator, { opacity: pulseAnim }]}>
          <View style={[styles.dot, isAnalyzing ? styles.dotActive : styles.dotIdle]} />
          <Text style={styles.statusText}>
            {isAnalyzing ? 'ANALYZING' : 'READY'}
          </Text>
        </Animated.View>
      </View>

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
        <Animated.View style={[styles.descriptionPanel, { opacity: fadeAnim }]}>
          <View style={styles.descriptionHeader}>
            <Text style={styles.descriptionLabel}>ANALYSIS</Text>
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
  statusText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
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
    bottom: 100,
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
