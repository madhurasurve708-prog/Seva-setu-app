// app/nagarsevak-login.tsx
//
// SEVA SETU — Nagarsevak Login
// Fields: Official ID, Password, Ward
// UI-only. Wire the "Login" button to your FastAPI auth endpoint.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

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

export default function NagarsevakLoginScreen() {
  const router = useRouter();
  const [officialId, setOfficialId] = useState('');
  const [ward, setWard] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const canSubmit = officialId.trim().length > 0 && ward.trim().length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!canSubmit) return;
    setLoading(true);
    // TODO: call your FastAPI endpoint, e.g. POST /auth/nagarsevak/login
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ImageBackground
          source={require('../assets/images/shivaji.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
          <SafeAreaView>
            <View style={styles.heroTopRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.white} />
              </Pressable>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.logoRing}>
                <MaterialCommunityIcons name="office-building" size={30} color={COLORS.navy} />
              </View>
              <Text style={styles.heroTitle}>Nagarsevak Login</Text>
              <Text style={styles.heroSubtitle}>Ward Representative Access</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Welcome back</Text>
            <Text style={styles.stepHint}>Sign in with your official ward credentials.</Text>

            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={COLORS.textMuted} />
              <TextInput
                value={officialId}
                onChangeText={setOfficialId}
                placeholder="Official ID"
                placeholderTextColor="#A6ADB8"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.textMuted} />
              <TextInput
                value={ward}
                onChangeText={setWard}
                placeholder="Ward (e.g. Ward No. 4)"
                placeholderTextColor="#A6ADB8"
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
                colors={!canSubmit ? ['#C7CEDA', '#C7CEDA'] : [COLORS.navy, COLORS.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {loading && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />}
                <Text style={styles.gradientBtnText}>{loading ? 'Signing in…' : 'Login'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.badgeRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.badgeText}>Access restricted to verified municipal officials</Text>
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
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,29,48,0.68)' },
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
  heroSubtitle: {
    marginTop: 4,
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  stepHint: { marginTop: 6, fontSize: 13, color: COLORS.textMuted, lineHeight: 18, marginBottom: 4 },
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
    marginTop: 16,
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
