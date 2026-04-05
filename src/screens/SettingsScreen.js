import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { setApiKey, getApiKey } from '../services/vision';
import { COLORS } from '../constants/theme';

export default function SettingsScreen({ onClose }) {
  const [key, setKey] = useState(getApiKey() || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const trimmed = key.trim();
    if (trimmed) {
      await setApiKey(trimmed);
      setSaved(true);
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>ANTHROPIC API KEY</Text>
          <Text style={styles.hint}>
            Get your key at console.anthropic.com
          </Text>
          <TextInput
            style={styles.input}
            value={key}
            onChangeText={(text) => {
              setKey(text);
              setSaved(false);
            }}
            placeholder="sk-ant-..."
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonSuccess]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {saved ? '✓ SAVED' : 'SAVE'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>HOW IT WORKS</Text>
          <Text style={styles.infoText}>
            Point your camera at anything and tap the capture button. Anon sends
            a snapshot to Claude's Vision API and displays an AI-generated
            analysis overlaid on your camera feed — like a real-time HUD from the
            future.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    color: COLORS.primary,
    fontSize: 20,
    width: 30,
  },
  title: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 6,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonSuccess: {
    backgroundColor: 'rgba(0, 255, 100, 0.15)',
    borderColor: '#00ff64',
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 24,
  },
  infoTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
