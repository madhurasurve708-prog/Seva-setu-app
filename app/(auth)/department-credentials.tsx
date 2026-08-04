// app/(auth)/department-credentials.tsx
// STEP 2 — Department Credentials Login.
// Receives selected department name via route params and shows the login form.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { DEPT_META } from '@/data/department-routing';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';
import { loginDepartment } from '@/services/official-api';
import { saveOfficialAccessToken } from '@/services/api-client';

export default function DepartmentCredentialsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useDepartment();

  // dept is the selected department name passed from Step 1
  const { dept } = useLocalSearchParams<{ dept: string }>();
  const deptName = dept ?? '';

  const meta = DEPT_META[deptName];

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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <AuthHero
        compact
        title={t('departmentLogin')}
        subtitle="Malvan Municipal Council"
        showLogo={true}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(auth)/department-login');
          }
        }}
      />

      <AuthSheet>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            overScrollMode="never"
          >
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
          </ScrollView>
        </KeyboardAvoidingView>
      </AuthSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061422',
  },
  content: {
    paddingBottom: 40,
    gap: 4,
  },

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
