import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import CustomTextInput from '@/components/common/CustomTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { ALL_DEPARTMENTS } from '@/data/complaints';
import { DEPT_META } from '@/data/department-routing';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';
import { DEPT_DEMO_CREDENTIALS, loginDemoDepartmentOfficer } from '@/services/auth';

export default function DepartmentLoginScreen() {
  const router = useRouter();
  const { login } = useDepartment();
  const { t } = useTranslation();

  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const credential = DEPT_DEMO_CREDENTIALS.find((c) => c.deptName === department);

  const selectDept = (name: string) => {
    setDepartment(name);
    setUsername('');
    setPassword('');
    setError('');
  };

  const fillDemo = () => {
    if (!credential) return;
    setUsername(credential.username);
    setPassword(credential.password);
    setError('');
  };

  const submit = async () => {
    if (!department || !username || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(loginDemoDepartmentOfficer(department, username, password));
      router.replace('/(dept)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unableToSignIn'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthHero
          title={t('departmentLogin')}
          subtitle="Malvan Municipal Council — Department Portal"
          badge={t('departmentAccess')}
          icon="office-building-outline"
          showLogo
          onBack={() => router.back()}
          compact
        />

        <AuthSheet>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* ── Section heading ── */}
            <Animated.View entering={FadeInDown.duration(350)}>
              <Text style={styles.heading}>{t('selectDepartment')}</Text>
              <Text style={styles.hint}>
                {t('departmentLoginHint')}
              </Text>
            </Animated.View>

            {/* ── Department list ── */}
            <View style={styles.deptList}>
              {ALL_DEPARTMENTS.map((name, idx) => {
                const selected = department === name;
                const meta = DEPT_META[name];
                return (
                  <Animated.View
                    key={name}
                    entering={FadeInDown.duration(300).delay(60 + idx * 40)}
                  >
                    <Pressable
                      onPress={() => selectDept(name)}
                      style={[styles.deptRow, selected && styles.deptRowSelected]}
                    >
                      <View style={[styles.deptIcon, { backgroundColor: meta?.bg ?? '#EAF3FF' }]}>
                        <MaterialCommunityIcons
                          name={(meta?.icon ?? 'office-building-outline') as any}
                          size={20}
                          color={meta?.color ?? COLORS.primary}
                        />
                      </View>
                      <View style={styles.deptText}>
                        <Text style={styles.deptName} numberOfLines={1}>{name}</Text>
                        <Text style={styles.deptEnglish} numberOfLines={1}>
                          {meta?.english ?? t('municipalDepartment')}
                        </Text>
                      </View>
                      {selected && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={COLORS.primary}
                        />
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            {/* ── Credentials (shown only after dept selected) ── */}
            {department && credential && (
              <Animated.View entering={FadeInDown.duration(280)} style={styles.credSection}>
                {/* Demo fill pill */}
                <Pressable onPress={fillDemo} style={styles.demoPill}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#A66A00" />
                  <View style={styles.demoTextBlock}>
                    <Text style={styles.demoLabel}>{t('demoCredentialsTapToFill')}</Text>
                    <Text style={styles.demoValue}>
                      {credential.username} / {credential.password}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#A66A00" />
                </Pressable>

                <CustomTextInput
                  icon="account-outline"
                  label={t('username')}
                  placeholder={t('usernamePlaceholder')}
                  value={username}
                  onChangeText={(v) => { setUsername(v); setError(''); }}
                  autoCapitalize="none"
                />

                <CustomTextInput
                  icon="lock-outline"
                  label={t('password')}
                  placeholder={t('enterPassword')}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  secureTextEntry
                />

                {error ? (
                  <View style={styles.errorRow}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={15} color={COLORS.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <PrimaryButton
                  label={loading ? t('signingIn') : t('login')}
                  loading={loading}
                  disabled={!username || !password || loading}
                  onPress={submit}
                  style={styles.loginBtn}
                />
              </Animated.View>
            )}
          </ScrollView>
        </AuthSheet>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081B2B',
  },
  content: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 36,
    gap: 0,
  },

  /* Headings */
  heading: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: 4,
  },
  hint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 14,
    lineHeight: 18,
  },

  /* Department list */
  deptList: {
    gap: 8,
    marginBottom: 4,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    ...SHADOWS.soft,
  },
  deptRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  deptIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deptText: {
    flex: 1,
  },
  deptName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 18,
  },
  deptEnglish: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },

  /* Credentials section */
  credSection: {
    marginTop: 18,
    gap: 0,
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
  demoTextBlock: {
    flex: 1,
  },
  demoLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#A66A00',
  },
  demoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D5A00',
    marginTop: 1,
  },

  /* Error */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },

  /* Login button */
  loginBtn: {
    marginTop: 14,
  },
});
