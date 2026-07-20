import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function NagarsevakLoginScreen() {
  const router = useRouter();
  const { setAuthenticatedUser } = useOfficial();

  const [officialId, setOfficialId] = useState('');
  const [ward, setWard] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = officialId.trim().length > 0 && ward.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const normalizedOfficialId = officialId.trim();
      const normalizedWard = ward.trim();

      await setAuthenticatedUser({
        name: normalizedOfficialId,
        phone: '9420105073',
        email: `${normalizedOfficialId.toLowerCase().replace(/\s+/g, '')}@malvan.gov.in`,
        username: normalizedOfficialId.toLowerCase().replace(/\s+/g, '_'),
        password,
        employeeId: 'MMC-2026-N08',
        designation: 'Nagarsevak (Ward Representative)',
        ward: normalizedWard,
        locality: 'Dhuriwada',
        department: 'Sanitation & Health',
        role: 'nagarsevak',
        roleLabel: 'Nagarsevak',
        avatarInitial: normalizedOfficialId.charAt(0).toUpperCase() || 'N',
        language: 'English',
      });

      router.replace('/(official)/dashboard' as any);
    } catch (error) {
      console.error('Nagarsevak login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="account-tie-outline" size={28} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Nagarsevak Login</Text>
            <Text style={styles.subtitle}>Access the ward-level municipal dashboard.</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in to continue</Text>
            <Text style={styles.cardText}>Use your ward officer credentials to open the nagarsevak portal.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Official ID</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={officialId}
                onChangeText={setOfficialId}
                placeholder="Enter official ID"
                placeholderTextColor={COLORS.textPlaceholder}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ward</Text>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                value={ward}
                onChangeText={setWard}
                placeholder="Enter ward"
                placeholderTextColor={COLORS.textPlaceholder}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textPlaceholder}
                  style={[styles.input, styles.passwordInput]}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable onPress={handleLogin} disabled={!canSubmit || loading} style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  container: {
    flex: 1,
    marginTop: -12,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.card,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 6,
  },
  cardText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
  },
});
