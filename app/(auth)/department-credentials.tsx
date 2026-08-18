// app/(auth)/department-credentials.tsx
// STEP 2 — Department Credentials Login.
// Receives selected department name via route params and shows the login form.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageToggle from '../../components/common/LanguageToggle';
import { useState } from 'react';
import {
  Alert,
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
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS, SHADOWS } from '@/constants/theme';
import { DEPT_META } from '@/data/department-routing';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';
import { saveOfficialAccessToken } from '@/services/api-client';
import { DEPT_DEMO_CREDENTIALS } from '@/services/auth';
import { loginDepartment } from '@/services/official-api';

export default function DepartmentCredentialsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useDepartment();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  // dept is the selected department name passed from Step 1
  const { dept } = useLocalSearchParams<{ dept: string }>();
  const deptName = dept ?? '';

  const meta = DEPT_META[deptName];
  const demoCred = DEPT_DEMO_CREDENTIALS.find((c) => c.deptName === deptName);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let ok = true;
    setUsernameError('');
    setPasswordError('');
    if (!username.trim()) {
      setUsernameError(t('enterDeptId'));
      ok = false;
    }
    if (!password.trim()) {
      setPasswordError(t('enterPassword'));
      ok = false;
    }
    return ok;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const departmentKeys: Record<string, string> = {
        'पाणी पुरवठा विभाग': 'DEPT_PANI', 'स्वच्छता व घनकचरा विभाग': 'DEPT_SWACHHTA',
        'बांधकाम विभाग': 'DEPT_BANDHKAM', 'विद्युत विभाग': 'DEPT_VIDYUT',
        'आरोग्य विभाग': 'DEPT_AROGYA', 'उद्याने व बाग विभाग': 'DEPT_UDYAN',
      };


      const department = departmentKeys[deptName] ?? deptName;
      const { token, profile } = await loginDepartment(department, username.trim(), password);
      await saveOfficialAccessToken(token);
      await login(profile);
      router.replace('/(dept)/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('unableToSignIn');
      Alert.alert(t('loginFailed'), msg);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      {/* Selected department banner */}
      <Animated.View entering={FadeInDown.duration(360).delay(0)} style={[
        styles.deptBanner,
        { backgroundColor: meta?.bg ?? '#EFF6FF' },
      ]}>
        <View style={[styles.deptBannerIcon, { backgroundColor: `${meta?.color ?? COLORS.primary}18` }]}>
          <MaterialCommunityIcons
            name={(meta?.icon ?? 'office-building-outline') as any}
            size={24}
            color={meta?.color ?? COLORS.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.deptBannerLabel}>{t('selectedDept')}</Text>
          <Text style={[styles.deptBannerName, { color: meta?.color ?? COLORS.primary }]} numberOfLines={2}>
            {deptName}
          </Text>
          {meta?.english ? (
            <Text style={styles.deptBannerEnglish}>{meta.english}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/department-login');
            }
          }}
          style={styles.changeDeptBtn}
          hitSlop={8}
        >
          <Text style={[styles.changeDeptText, { color: meta?.color ?? COLORS.primary }]}>
            {t('change')}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Demo Credentials Pill */}
      {demoCred ? (
        <Animated.View entering={FadeInDown.duration(320).delay(80)}>
          <Pressable
            onPress={() => {
              setUsername(demoCred.username);
              setPassword(demoCred.password);
            }}
            style={styles.demoPill}
          >
            <MaterialCommunityIcons name="information-outline" size={18} color="#A66A00" style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoLabel}>Demo Credentials • Tap to fill</Text>
              <Text style={styles.demoValue}>
                ID: {demoCred.username}  |  Password: {demoCred.password}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}

      {/* Username field */}
      <Animated.View entering={FadeInDown.duration(320).delay(120)}>
        <Text style={styles.fieldLabel}>{t('departmentId')}</Text>
        <View style={[styles.inputRow, usernameError ? styles.inputError : null]}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={20}
            color={usernameError ? COLORS.danger : COLORS.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            value={username}
            onChangeText={(v) => { setUsername(v); setUsernameError(''); }}
            placeholder={t('usernamePlaceholder')}
            placeholderTextColor={COLORS.textPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            style={styles.inputText}
          />
        </View>
        {usernameError ? (
          <Text style={styles.errorText}>{usernameError}</Text>
        ) : null}
      </Animated.View>

      {/* Password field */}
      <Animated.View entering={FadeInDown.duration(320).delay(170)}>
        <Text style={styles.fieldLabel}>{t('password')}</Text>
        <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={passwordError ? COLORS.danger : COLORS.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            value={password}
            onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
            placeholder={t('enterPassword')}
            placeholderTextColor={COLORS.textPlaceholder}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            style={styles.inputText}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
      </Animated.View>

      {/* Login button */}
      <Animated.View entering={FadeInDown.duration(320).delay(220)} style={{ marginTop: 24 }}>
        <PrimaryButton
          label={loading ? t('signingIn') : t('login')}
          loading={loading}
          disabled={loading}
          onPress={handleLogin}
        />
      </Animated.View>
    </>
  );

  const onBackAction = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/department-login');
    }
  };

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
                onPress={onBackAction}
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
              <Text style={styles.desktopLeftTitle}>{t('departmentLogin')}</Text>
              <Text style={styles.desktopLeftSubtitle}>Malvan Municipal Council</Text>
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
              {formContent}
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
        compact
        title={t('departmentLogin')}
        subtitle="Malvan Municipal Council"
        showLogo={true}
        onBack={onBackAction}
      />

      <KeyboardAvoidingView
        style={[{ flex: 1 }, isDesktop && styles.desktopCenter]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AuthSheet
          style={isDesktop ? styles.desktopSheet : undefined}
          contentStyle={isDesktop ? styles.desktopFormContent : undefined}
        >
          {isDesktop ? (
            <View style={styles.content}>
              {formContent}
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
              overScrollMode="never"
            >
              {formContent}
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
  root: {
    flex: 1,
    backgroundColor: '#061422',
  },
  content: {
    paddingBottom: 40,
    gap: 4,
  },
  desktopPage: { backgroundColor: '#F3F7FB', paddingHorizontal: 24, paddingBottom: 24 },
  desktopCenter: { justifyContent: 'flex-start', paddingTop: 16, paddingBottom: 24 },
  desktopFormContent: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  desktopSheet: { maxWidth: 620, paddingHorizontal: 24 },

  /* Department banner */
  deptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
    ...SHADOWS.soft,
  },
  deptBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deptBannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  deptBannerName: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    marginTop: 2,
  },
  deptBannerEnglish: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  changeDeptBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    flexShrink: 0,
  },
  changeDeptText: {
    fontSize: 12,
    fontWeight: '800',
  },

  /* Demo pill */
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF8EB',
    borderWidth: 1,
    borderColor: '#F6E0B2',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 16,
  },
  demoLabel: { fontSize: 11.5, fontWeight: '800', color: '#A66A00' },
  demoValue: { fontSize: 12, fontWeight: '600', color: '#7D5A00', marginTop: 1 },

  /* Form fields */
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: 8,
    paddingLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 14,
    gap: 10,
    ...SHADOWS.soft,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: { flexShrink: 0 },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});
