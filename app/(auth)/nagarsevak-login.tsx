// app/(auth)/nagarsevak-login.tsx
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
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import LanguageToggle from '@/components/common/LanguageToggle';
import { AuthHero } from '@/components/common/AuthScaffold';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';
import { loginNagarsevak } from '@/services/official-api';
import { saveOfficialAccessToken } from '@/services/api-client';

export default function NagarsevakLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAuthenticatedUser } = useOfficial();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  const [officialId, setOfficialId] = useState('');
  const [ward, setWard] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = officialId.trim().length > 0 && ward.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const normalizedOfficialId = officialId.trim();
      const wardNumber = Number(ward.replace(/\D/g, ''));
      if (!wardNumber) throw new Error('Enter a valid ward number.');
      const { token, profile } = await loginNagarsevak(normalizedOfficialId, wardNumber, password);
      await saveOfficialAccessToken(token);
      await setAuthenticatedUser(profile);

      router.replace('/(official)/dashboard' as any);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const formCard = (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>
      <Text style={styles.cardTitle}>{t('signInToContinue')}</Text>
      <Text style={styles.cardText}>{t('nagarsevakLoginHint')}</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('officialId')}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={officialId}
          onChangeText={setOfficialId}
          placeholder={t('officialIdPlaceholder')}
          placeholderTextColor={COLORS.textPlaceholder}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('wardLabel2')}</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          value={ward}
          onChangeText={setWard}
          placeholder={t('enterWard')}
          placeholderTextColor={COLORS.textPlaceholder}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('passwordLabel')}</Text>
        <View style={styles.passwordRow}>
          <TextInput
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder={t('passwordPlaceholder')}
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
          <Text style={styles.buttonText}>{t('login')}</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.safeAreaDesktop]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {isDesktop ? (
        <AuthHero
          compact
          title={t('nagarsevakLogin')}
          subtitle="Malvan Municipal Council"
          showLogo
          onBack={() => router.back()}
        />
      ) : (
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={[styles.header, { paddingTop: insets.top + 14 }]}
        >
          <View style={[styles.headerContent, isDesktop && styles.headerContentDesktop]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.white} />
          </Pressable>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="account-tie-outline" size={28} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('nagarsevakLogin')}</Text>
            <Text style={styles.subtitle}>{t('nagarsevakLoginSubtitle')}</Text>
          </View>
          <LanguageToggle size={38} variant="dark" />
        </View>
        </LinearGradient>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, isDesktop && styles.containerDesktop]}
      >
        {isDesktop ? (
          <View style={[styles.scrollContent, styles.scrollContentDesktop]}>
            {formCard}
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {formCard}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeAreaDesktop: { backgroundColor: '#F3F7FB' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerDesktop: { minHeight: 276, paddingBottom: 72 },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerContentDesktop: { width: '100%', maxWidth: 980, alignSelf: 'center' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
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
  containerDesktop: { backgroundColor: '#F5F8FC', justifyContent: 'center', marginTop: 0 },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  scrollContentDesktop: { width: '100%', maxWidth: 580, alignSelf: 'center', paddingTop: 0, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.card,
  },
  cardDesktop: { marginTop: 0, borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(226,232,240,0.95)', ...SHADOWS.xl },
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
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '600', marginTop: 12, textAlign: 'center' },
});