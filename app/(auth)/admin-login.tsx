import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import PrimaryButton from '@/components/common/PrimaryButton';
import CustomTextInput from '@/components/common/CustomTextInput';
import { useOfficial } from '@/providers/official-provider';
import { loginAdministrator, loginDemoAdministrator } from '@/services/auth';

export default function AdminLoginScreen() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthenticatedUser } = useOfficial();

  const canSubmit = adminId.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const profile = process.env.EXPO_PUBLIC_API_URL
        ? await loginAdministrator(adminId.trim(), password)
        : loginDemoAdministrator(adminId.trim(), password);
      await setAuthenticatedUser(profile);
      router.replace('/(admin)/dashboard' as any);
    } catch (error) {
      Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Unable to sign in.');
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
        {/* Premium Framed Hero - Prevents Illustration Cutoff */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.heroSafeArea}>
            <View style={styles.heroTopRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
              </Pressable>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.heroHeaderWrapper}>
                <View style={styles.shivajiFrame}>
                  <Image
                    source={require('../../assets/images/shivaji.png')}
                    style={styles.shivajiImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.headerTextCol}>
                  <View style={styles.logoRing}>
                    <MaterialCommunityIcons name="shield-crown" size={26} color={COLORS.primary} />
                  </View>
                  <Text style={styles.heroTitle}>Admin Login</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>NAGARADHYAKSHA</Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Form Sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            overScrollMode="never"
          >
            <Text style={styles.stepTitle}>Restricted portal</Text>
            <Text style={styles.stepHint}>
              {process.env.EXPO_PUBLIC_API_URL
                ? 'This portal is for the Main Administrator of Seva Setu only.'
                : 'Demo mode: use Admin ID Mamta Waradkar and password 123456.'}
            </Text>

            <View style={styles.formContainer}>
              <CustomTextInput
                icon="account-key-outline"
                placeholder="Enter Admin ID"
                label="Admin ID"
                value={adminId}
                onChangeText={setAdminId}
                autoCapitalize="none"
              />

              <CustomTextInput
                icon="lock-outline"
                placeholder="Enter password"
                label="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable style={styles.forgotBtn} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <PrimaryButton
              label={loading ? 'Verifying…' : 'Login'}
              disabled={!canSubmit || loading}
              loading={loading}
              onPress={handleLogin}
              style={styles.actionBtn}
            />

            <View style={styles.securityBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.securityText}>Secured with 256-bit encryption</Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  heroContainer: {
    height: '35%',
    minHeight: 220,
  },
  heroSafeArea: {
    flex: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  shivajiFrame: {
    width: 90,
    height: 110,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shivajiImage: {
    width: '100%',
    height: '100%',
  },
  headerTextCol: {
    flex: 1,
    paddingLeft: 18,
    alignItems: 'flex-start',
  },
  logoRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...SHADOWS.soft,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  roleBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.warning,
    letterSpacing: 1.2,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  stepTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  stepHint: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
    lineHeight: 19,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  formContainer: {
    marginVertical: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  actionBtn: {
    marginTop: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    ...TYPOGRAPHY.caption,
    marginLeft: 6,
    color: COLORS.textMuted,
  },
});
