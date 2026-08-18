// app/(auth)/admin-login.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageToggle from '../../components/common/LanguageToggle';
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

  const desktopFormCard = (
    <View style={styles.desktopCardInner}>
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
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Left Side: 45% Width */}
        <View style={styles.desktopLeft}>
          <ImageBackground
            source={require('../../assets/images/hero_banner.webp')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          >
            {/* Cinematic dark-blue gradient overlay */}
            <LinearGradient
              colors={[
                'rgba(5, 18, 35, 0.85)',
                'rgba(8, 55, 110, 0.72)',
                'rgba(5, 18, 35, 0.92)',
              ]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Left Header - Back button & LanguageToggle */}
            <View style={styles.desktopLeftHeader}>
              <Pressable
                onPress={() => router.back()}
                style={styles.desktopBackBtn}
                hitSlop={12}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
              </Pressable>
              <LanguageToggle size={40} variant="dark" />
            </View>

            {/* Branding / Text overlay */}
            <View style={styles.desktopLeftContent}>
              <View style={styles.desktopLogoWrap}>
                <Image
                  source={require('../../assets/images/logo.webp')}
                  style={styles.desktopLogo}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.desktopLeftTitle}>{t('nagaradhyaksha')}</Text>
              <Text style={styles.desktopLeftSubtitle}>Malvan Municipal Council — Admin Portal</Text>
              <Text style={styles.desktopLeftSlogan}>&quot;आपला मालवण, आपली जबाबदारी&quot;</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Right Side: 55% Width */}
        <View style={styles.desktopRight}>
          <KeyboardAvoidingView
            style={styles.desktopRightContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.desktopCardWrapper}>
              {desktopFormCard}
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }

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
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    height: (Platform.OS === 'web' ? '100vh' : '100%') as any,
    backgroundColor: '#F8FAFC',
  },
  desktopLeft: {
    width: '45%',
    height: '100%',
    position: 'relative',
  },
  desktopLeftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    zIndex: 10,
  },
  desktopBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopLeftContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 64,
  },
  desktopLogoWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
    borderRadius: 28,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      } as any
    })
  },
  desktopLogo: {
    width: 80,
    height: 80,
  },
  desktopLeftTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  desktopLeftSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  desktopLeftSlogan: {
    fontSize: 15,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    fontWeight: '500',
  },
  desktopRight: {
    width: '55%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  desktopRightContainer: {
    width: '100%',
    maxWidth: 480,
    justifyContent: 'center',
  },
  desktopCardWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 40,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  desktopCardInner: {
    width: '100%',
  },
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