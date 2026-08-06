// app/(auth)/admin-login.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import CustomTextInput from '@/components/common/CustomTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS, TYPOGRAPHY } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';
import { useOfficial } from '@/providers/official-provider';
import { saveOfficialAccessToken } from '@/services/api-client';
import { loginMainAdmin } from '@/services/official-api';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { setAuthenticatedUser } = useOfficial();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = adminId.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const { token, profile } = await loginMainAdmin(adminId.trim(), password);
      await saveOfficialAccessToken(token);
      await setAuthenticatedUser(profile);
      router.replace('/(admin)/dashboard' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unableToSignIn'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, isDesktop && styles.desktopPage]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AuthHero
        title={t('nagaradhyaksha')}
        subtitle="Malvan Municipal Council — Admin Portal"
        badge={t('restrictedAccess')}
        icon="shield-crown"
        showLogo
        onBack={() => router.back()}
        compact
      />

      <KeyboardAvoidingView
        style={[{ flex: 1 }, isDesktop && styles.desktopCenter]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AuthSheet
          style={isDesktop ? styles.desktopSheet : undefined}
          contentStyle={isDesktop ? styles.desktopFormContent : undefined}
        >
          {isDesktop ? (
            <View style={[styles.scrollContent, styles.desktopScrollContent]}>
              <Animated.View entering={FadeInDown.duration(420).delay(60)}>
                <Text style={styles.screenTitle}>{t('restrictedPortal')}</Text>
                <Text style={styles.screenHint}>{t('adminLoginHint')}</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(420).delay(140)} style={[styles.formContainer, styles.desktopFormCard]}>
                <CustomTextInput
                  icon="shield-account-outline"
                  placeholder={t('adminIdPlaceholder')}
                  label={t('adminId')}
                  value={adminId}
                  onChangeText={(v) => {
                    setAdminId(v);
                    setError('');
                  }}
                  autoCapitalize="words"
                />
                <CustomTextInput
                  icon="lock-outline"
                  placeholder={t('enterPassword')}
                  label={t('password')}
                  secureTextEntry
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError('');
                  }}
                />
              </Animated.View>

              {error ? (
                <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                  {error}
                </Animated.Text>
              ) : null}

              <Pressable style={styles.forgotBtn} hitSlop={8}>
                <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
              </Pressable>

              <Animated.View entering={FadeInDown.duration(420).delay(200)}>
                <PrimaryButton
                  label={loading ? t('verifying') : t('loginToAdminPortal')}
                  disabled={!canSubmit || loading}
                  loading={loading}
                  onPress={handleLogin}
                  style={styles.loginBtn}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(420).delay(240)} style={styles.securityBadge}>
                <MaterialCommunityIcons name="shield-lock-outline" size={15} color={COLORS.textMuted} />
                <Text style={styles.securityText}>{t('secureEncryption')}</Text>
              </Animated.View>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              overScrollMode="never"
            >
              <Animated.View entering={FadeInDown.duration(420).delay(60)}>
                <Text style={styles.screenTitle}>{t('restrictedPortal')}</Text>
                <Text style={styles.screenHint}>{t('adminLoginHint')}</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(420).delay(140)} style={styles.formContainer}>
                <CustomTextInput
                  icon="shield-account-outline"
                  placeholder={t('adminIdPlaceholder')}
                  label={t('adminId')}
                  value={adminId}
                  onChangeText={(v) => {
                    setAdminId(v);
                    setError('');
                  }}
                  autoCapitalize="words"
                />
                <CustomTextInput
                  icon="lock-outline"
                  placeholder={t('enterPassword')}
                  label={t('password')}
                  secureTextEntry
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError('');
                  }}
                />
              </Animated.View>

              {error ? (
                <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                  {error}
                </Animated.Text>
              ) : null}

              <Pressable style={styles.forgotBtn} hitSlop={8}>
                <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
              </Pressable>

              <Animated.View entering={FadeInDown.duration(420).delay(200)}>
                <PrimaryButton
                  label={loading ? t('verifying') : t('loginToAdminPortal')}
                  disabled={!canSubmit || loading}
                  loading={loading}
                  onPress={handleLogin}
                  style={styles.loginBtn}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(420).delay(240)} style={styles.securityBadge}>
                <MaterialCommunityIcons name="shield-lock-outline" size={15} color={COLORS.textMuted} />
                <Text style={styles.securityText}>{t('secureEncryption')}</Text>
              </Animated.View>
            </ScrollView>
          )}
        </AuthSheet>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#081B2B' },
  desktopPage: { backgroundColor: '#F3F7FB', paddingHorizontal: 24, paddingBottom: 24 },
  desktopCenter: { justifyContent: 'flex-start', paddingTop: 16, paddingBottom: 24 },

  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  desktopScrollContent: { paddingHorizontal: 8, paddingTop: 4, paddingBottom: 20 },
  desktopFormContent: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  desktopSheet: { maxWidth: 620, paddingHorizontal: 24 },

  screenTitle: { ...TYPOGRAPHY.h2, color: COLORS.primary },
  screenHint: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
    marginBottom: 20,
    color: COLORS.textMuted,
    lineHeight: 19,
  },

  formContainer: { marginTop: 4 },
  desktopFormCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 3,
  },

  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 12,
  },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText: { fontSize: 13, color: COLORS.secondary, fontWeight: '700' },

  loginBtn: { backgroundColor: COLORS.primary },

  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  securityText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
});