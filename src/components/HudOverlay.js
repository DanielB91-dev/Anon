import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HudOverlay({
  description,
  isAnalyzing,
  timestamp,
  autoScan,
  scanCount,
}) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const glitchAnim = useRef(new Animated.Value(0)).current;
  const [glitchText, setGlitchText] = useState(false);

  // Pulsing status indicator
  useEffect(() => {
    if (isAnalyzing || autoScan) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAnalyzing, autoScan]);

  // Animated scan line sweeping down the screen
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Glitch effect when new description arrives
  useEffect(() => {
    if (description) {
      setGlitchText(true);
      glitchAnim.setValue(1);

      Animated.sequence([
        Animated.timing(glitchAnim, { toValue: 0.7, duration: 50, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 0.8, duration: 30, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 1, duration: 30, useNativeDriver: true }),
      ]).start(() => setGlitchText(false));

      slideAnim.setValue(10);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [description, scanCount]);

  const statusLabel = autoScan
    ? 'SCANNING'
    : isAnalyzing
    ? 'PROCESSING'
    : 'STANDBY';

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, SCREEN_HEIGHT + 2],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Moving scan line */}
      <Animated.View
        style={[
          styles.movingScanLine,
          { transform: [{ translateY: scanLineTranslate }] },
        ]}
      />

      {/* Static scan lines */}
      <View style={styles.scanLines}>
        {[...Array(60)].map((_, i) => (
          <View key={i} style={styles.scanLine} />
        ))}
      </View>

      {/* Top HUD bar */}
      <View style={styles.topBar}>
        <View style={styles.hudCorner}>
          <Text style={styles.hudLabel}>ANON v1.0</Text>
          <Text style={styles.hudSublabel}>MIND'S EYE ACTIVE</Text>
        </View>
        <View style={styles.statusGroup}>
          <Animated.View style={[styles.statusIndicator, { opacity: pulseAnim }]}>
            <View style={[
              styles.dot,
              autoScan ? styles.dotScanning : isAnalyzing ? styles.dotActive : styles.dotIdle,
            ]} />
            <Text style={[styles.statusText, autoScan && styles.statusTextScanning]}>
              {statusLabel}
            </Text>
          </Animated.View>
          {scanCount > 0 && (
            <Text style={styles.scanCounterText}>FRAMES: {scanCount}</Text>
          )}
        </View>
      </View>

      {/* Crosshair */}
      <View style={styles.crosshair}>
        <View style={[styles.crosshairLine, styles.crosshairH]} />
        <View style={[styles.crosshairLine, styles.crosshairV]} />
        <View style={styles.crosshairCenter} />
        {/* Crosshair corner marks */}
        <View style={[styles.crosshairMark, { top: -12, left: -1 }]} />
        <View style={[styles.crosshairMark, { bottom: -12, left: -1 }]} />
        <View style={[styles.crosshairMarkH, { left: -12, top: -1 }]} />
        <View style={[styles.crosshairMarkH, { right: -12, top: -1 }]} />
      </View>

      {/* Corner brackets */}
      <View style={[styles.bracket, styles.bracketTL]} />
      <View style={[styles.bracket, styles.bracketTR]} />
      <View style={[styles.bracket, styles.bracketBL]} />
      <View style={[styles.bracket, styles.bracketBR]} />

      {/* Edge data strips */}
      <View style={styles.leftStrip}>
        <Text style={styles.stripText}>LAT 53.3498</Text>
        <Text style={styles.stripText}>LON -6.2603</Text>
        <Text style={styles.stripText}>ALT 12.4M</Text>
      </View>

      <View style={styles.rightStrip}>
        <Text style={styles.stripText}>REC ●</Text>
        <Text style={styles.stripText}>1080P</Text>
        <Text style={styles.stripText}>30FPS</Text>
      </View>

      {/* Description panel */}
      {description && (
        <Animated.View style={[
          styles.descriptionPanel,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          <View style={styles.descriptionHeader}>
            <View style={styles.descriptionLabelRow}>
              <View style={[styles.descriptionDot, autoScan && styles.descriptionDotLive]} />
              <Text style={styles.descriptionLabel}>
                {autoScan ? 'LIVE FEED' : 'ANALYSIS'}
              </Text>
            </View>
            {timestamp && (
              <Text style={styles.timestamp}>{timestamp}</Text>
            )}
          </View>
          <Animated.View style={{ opacity: glitchAnim }}>
            <Text style={[
              styles.descriptionText,
              glitchText && styles.descriptionTextGlitch,
            ]}>
              {description}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const BRACKET_SIZE = 50;
const BRACKET_THICKNESS = 2;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  movingScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  scanLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    opacity: 0.04,
  },
  scanLine: {
    height: 1,
    backgroundColor: COLORS.primary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  hudCorner: {
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: COLORS.primary,
    paddingLeft: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  hudLabel: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  hudSublabel: {
    color: COLORS.primaryDim,
    fontSize: 8,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: 2,
  },
  statusGroup: {
    alignItems: 'flex-end',
    gap: 4,
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
  scanCounterText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 50,
    height: 50,
    marginLeft: -25,
    marginTop: -25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairLine: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    opacity: 0.4,
  },
  crosshairH: {
    width: 50,
    height: 1,
  },
  crosshairV: {
    width: 1,
    height: 50,
  },
  crosshairCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    opacity: 0.4,
  },
  crosshairMark: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  crosshairMarkH: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
  },
  bracketTL: {
    top: 110,
    left: 25,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  bracketTR: {
    top: 110,
    right: 25,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  bracketBL: {
    bottom: 180,
    left: 25,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  bracketBR: {
    bottom: 180,
    right: 25,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderColor: COLORS.border,
  },
  leftStrip: {
    position: 'absolute',
    left: 12,
    top: '45%',
    gap: 4,
  },
  rightStrip: {
    position: 'absolute',
    right: 12,
    top: '45%',
    alignItems: 'flex-end',
    gap: 4,
  },
  stripText: {
    color: COLORS.primary,
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
    opacity: 0.3,
  },
  descriptionPanel: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(5, 5, 15, 0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
    padding: 14,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.1)',
    paddingBottom: 6,
  },
  descriptionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  descriptionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  descriptionDotLive: {
    backgroundColor: '#00ff64',
  },
  descriptionLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  descriptionText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'monospace',
  },
  descriptionTextGlitch: {
    color: '#88ffff',
  },
});
