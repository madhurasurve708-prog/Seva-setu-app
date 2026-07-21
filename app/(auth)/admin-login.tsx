import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import CustomTextInput from '@/components/common/CustomTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { loginAdministrator, loginDemoAdministrator } from '@/services/auth';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { setAuthenticatedUser } = useOfficial();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDemo = !process.env.EXPO_PUBLIC_API_URL;
  const canSubmit = adminId.trim().length > 0 && password.length > 0;

  const fillDemo = () => {
    setAdminId('Mamta Waradkar');
    setPassword('123456');
    setError('');
  };

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const profile = isDemo
        ? loginDemoAdministrator(adminId.trim(), password)
        : await loginAdministrator(adminId.trim(), password);
      await setAuthenticatedUser(profile);
      router.replace('/(admin)/dashboard' as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AuthHero
          title="Nagaradhyaksha"
          subtitle="Malvan Municipal Council — Admin Portal"
          badge="RESTRICTED ACCESS"
          icon="shield-crown"
          showLogo
          onBack={() => router.back()}
          compact
        />

        <AuthSheet>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            overScrollMode="never"
          >
            {/* Heading */}
            <Animated.View entering={FadeInDown.duration(420).delay(60)}>
              <Text style={styles.screenTitle}>Restricted Portal</Text>
              <Text style={styles.screenHint}>
                नगराध्यक्ष पोर्टलमध्ये प्रवेश करण्यासाठी अधिकृत क्रेडेन्शियल वापरा.
              </Text>
            </Animated.View>

            {/* Demo credentials card */}
            {isDemo && (
              <Animated.View entering={FadeInDown.duration(420).delay(100)}>
                <Pressable onPress={fillDemo} style={styles.demoCard}>
                  <LinearGradient
                    colors={['rgba(124,58,237,0.08)', 'rgba(124,58,237,0.04)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.demoLeft}>
                    <MaterialCommunityIcons name="shield-crown-outline" size={20} color="#7C3AED" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.demoTitle}>Demo Credentials</Text>
                      <Text style={styles.demoLine}>Admin ID: <Text style={styles.demoBold}>Mamta Waradkar</Text></Text>
                      <Text style={styles.demoLine}>Password: <Text style={styles.demoBold}>123456</Text></Text>
                    </View>
                  </View>
                  <View style={styles.tapBadge}>
                    <Text style={styles.tapText}>Tap to fill</Text>
                  </View>
                </Pressable>
              </Animated.View>
            )}

            {/* Form */}
            <Animated.View entering={FadeInDown.duration(420).delay(140)} style={styles.formContainer}>
              <CustomTextInput
                icon="shield-account-outline"
                placeholder="Enter Admin ID"
                label="Admin ID"
                value={adminId}
                onChangeText={(v) => { setAdminId(v); setError(''); }}
                autoCapitalize="words"
              />
              <CustomTextInput
                icon="lock-outline"
                placeholder="Enter password"
                label="Password"
                secureTextEntry
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
              />
            </Animated.View>

            {error ? (
              <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                {error}
              </Animated.Text>
            ) : null}

            <Pressable style={styles.forgotBtn} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Animated.View entering={FadeInDown.duration(420).delay(200)}>
              <PrimaryButton
                label={loading ? 'Verifying…' : 'Login to Admin Portal'}
                disabled={!canSubmit || loading}
                loading={loading}
                onPress={handleLogin}
                style={styles.loginBtn}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(420).delay(240)} style={styles.securityBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.securityText}>Secured with 256-bit encryption</Text>
            </Animated.View>
          </ScrollView>
        </AuthSheet>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#081B2B' },

  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },

  screenTitle: { ...TYPOGRAPHY.h2, color: COLORS.primary },
  screenHint: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
    marginBottom: 20,
    color: COLORS.textMuted,
    lineHeight: 19,
  },

  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.25)',
    padding: 14,
    marginBottom: 20,
    overflow: 'hidden',
    gap: 10,
  },
  demoLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  demoTitle: { fontSize: 11, fontWeight: '800', color: '#7C3AED', letterSpacing: 0.6, marginBottom: 3 },
  demoLine: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, lineHeight: 18 },
  demoBold: { fontWeight: '800', color: COLORS.text },
  tapBadge: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tapText: { fontSize: 10, fontWeight: '800', color: '#7C3AED' },

  formContainer: { marginTop: 4 },

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
