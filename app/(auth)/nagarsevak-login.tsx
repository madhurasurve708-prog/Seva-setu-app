// app/(auth)/nagarsevak-login.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, ImageBackground } from 'expo-image';
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

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim());
  const canSubmit = name.trim().length > 0 && isMobileValid && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    try {
      const normalizedName = name.trim();
      // Note: Backend currently expects (name, wardNumber, password).
      // Mobile number authentication is frontend UI only in Step 1.
      // Calling loginNagarsevak with the available credentials as required by the existing service.
      const { token, profile } = await loginNagarsevak(normalizedName, 0, password);
      await saveOfficialAccessToken(token);
      await setAuthenticatedUser(profile);

      router.replace('/(official)/dashboard' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unableToSignIn'));
    } finally {
      setLoading(false);
    }
  };

  const formCard = (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>
      <Text style={styles.cardTitle}>{t('signInToContinue')}</Text>
      <Text style={styles.cardText}>{t('nagarsevakLoginHint')}</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('nagarsevakNameLabel')}</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError('');
          }}
          placeholder={t('nagarsevakNamePlaceholder')}
          placeholderTextColor={COLORS.textPlaceholder}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('registeredMobileNumber')}</Text>
        <TextInput
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={10}
          value={mobileNumber}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
            setMobileNumber(cleaned);
            if (mobileError && /^[6-9]\d{9}$/.test(cleaned)) {
              setMobileError('');
            }
            if (error) setError('');
          }}
          onBlur={() => {
            if (mobileNumber.length > 0 && !/^[6-9]\d{9}$/.test(mobileNumber)) {
              setMobileError(t('mobileError'));
            } else {
              setMobileError('');
            }
          }}
          placeholder={t('registeredMobilePlaceholder')}
          placeholderTextColor={COLORS.textPlaceholder}
          style={[styles.input, mobileError ? styles.inputError : null]}
        />
        {mobileError ? <Text style={styles.fieldErrorText}>{mobileError}</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('passwordLabel')}</Text>
        <View style={styles.passwordRow}>
          <TextInput
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) setError('');
            }}
            placeholder={t('passwordPlaceholder')}
            placeholderTextColor={COLORS.textPlaceholder}
            style={[styles.input, styles.passwordInput]}
          />
          <Pressable
            onPress={() => setShowPassword((value) => !value)}
            style={styles.eyeButton}
            hitSlop={8}
            accessibilityLabel={showPassword ? t('hidePassword') : t('showPassword')}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/(auth)/nagarsevak-forgot-password' as any)}
        style={styles.forgotBtn}
        hitSlop={8}
      >
        <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
      </Pressable>

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
              <Text style={styles.desktopLeftTitle}>{t('nagarsevakLogin')}</Text>
              <Text style={styles.desktopLeftSubtitle}>{t('malvanMunicipal')}</Text>
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
              {formCard}
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDesktop && styles.safeAreaDesktop]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {isDesktop ? (
        <AuthHero
          compact
          title={t('nagarsevakLogin')}
          subtitle={t('malvanMunicipal')}
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
  inputError: {
    borderColor: COLORS.danger,
  },
  fieldErrorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  button: {
    marginTop: 4,
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