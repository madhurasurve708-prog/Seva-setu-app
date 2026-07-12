// app/admin-login.tsx
//
// SEVA SETU — Main Admin Login (Nagaradhyaksha)
// Fields: Admin ID, Password
// UI-only — wire "Login" to your FastAPI auth endpoint.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  navyDeep: '#071D30',
  navy: '#0A2A43',
  blue: '#1E6FD9',
  saffron: '#F2994A',
  bg: '#F5F7FA',
  card: '#FFFFFF',
  textDark: '#101826',
  textMuted: '#5B6472',
  border: '#E7ECF2',
  white: '#FFFFFF',
};

export default function AdminLoginScreen() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = adminId.trim().length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!canSubmit) return;
    setLoading(true);
    // TODO: call your FastAPI endpoint, e.g. POST /auth/admin/login
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ImageBackground
          source={require('../../assets/images/shivaji.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <View style={styles.heroOverlayDeep} />
          <SafeAreaView>
            <View style={styles.heroTopRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.white} />
              </Pressable>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.logoRing}>
                <MaterialCommunityIcons name="shield-crown-outline" size={32} color={COLORS.navyDeep} />
              </View>
              <Text style={styles.heroTitle}>Main Admin Login</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>NAGARADHYAKSHA</Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Restricted access</Text>
            <Text style={styles.stepHint}>
              This portal is for the Main Administrator of Seva Setu only.
            </Text>

            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="account-key-outline" size={20} color={COLORS.textMuted} />
              <TextInput
                value={adminId}
                onChangeText={setAdminId}
                placeholder="Admin ID"
                placeholderTextColor="#A6ADB8"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textMuted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#A6ADB8"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </Pressable>
            </View>

            <Pressable style={{ alignSelf: 'flex-end', marginTop: 10 }}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </Pressable>

            <Pressable onPress={handleLogin} disabled={!canSubmit} style={{ marginTop: 22 }}>
              <LinearGradient
                colors={!canSubmit ? ['#C7CEDA', '#C7CEDA'] : [COLORS.navyDeep, COLORS.navy]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {loading && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />}
                <Text style={styles.gradientBtnText}>{loading ? 'Verifying…' : 'Login'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.badgeRow}>
              <MaterialCommunityIcons name="shield-lock-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.badgeText}>All access attempts are logged</Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.navyDeep },
  hero: { height: 210 },
  heroOverlayDeep: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,29,48,0.78)' },
  heroTopRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 6 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center', marginTop: 4 },
  logoRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(242,153,74,0.2)',
    borderWidth: 1,
    borderColor: COLORS.saffron,
  },
  roleBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.saffron,
    letterSpacing: 1.4,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -22,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 18,
    marginTop: -8,
  },
  stepTitle: { fontSize: 19, fontWeight: '800', color: COLORS.textDark },
  stepHint: { marginTop: 6, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  linkText: { color: COLORS.blue, fontWeight: '600', fontSize: 12.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginTop: 18,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.textDark, marginLeft: 10 },
  gradientBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradientBtnText: { color: COLORS.white, fontSize: 15.5, fontWeight: '700', letterSpacing: 0.3 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 30,
  },
  badgeText: { marginLeft: 6, fontSize: 11.5, color: COLORS.textMuted },
});