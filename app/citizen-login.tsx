// app/citizen-login.tsx
//
// SEVA SETU — Citizen Login
// Step 1: Enter mobile number
// Step 2: Send OTP (loading transition)
// Step 3: Enter OTP
// Step 4: If new user — Full Name, Ward, Locality
//
// This screen is UI-only. Wire STEP 2/3 up to your FastAPI OTP endpoints,
// and replace MOCK_IS_NEW_USER with the real "user exists?" response.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
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
    View,
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
  danger: '#D64545',
};

// TODO: replace with the real lookup result from your backend after OTP verification
const MOCK_IS_NEW_USER = true;

type Step = 1 | 2 | 3 | 4;

export default function CitizenLoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [ward, setWard] = useState('');
  const [locality, setLocality] = useState('');

  const fade = useRef(new Animated.Value(1)).current;
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const animateStep = (next: Step) => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);
  const isOtpComplete = otp.every((d) => d.length === 1);

  const handleSendOtp = () => {
    if (!isMobileValid) return;
    setSendingOtp(true);
    // TODO: call your FastAPI endpoint, e.g. POST /auth/citizen/send-otp
    setTimeout(() => {
      setSendingOtp(false);
      animateStep(2);
      setTimeout(() => animateStep(3), 400);
    }, 900);
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = [...otp];
    digits[index] = value.replace(/[^0-9]/g, '').slice(-1);
    setOtp(digits);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!isOtpComplete) return;
    setVerifying(true);
    // TODO: call your FastAPI endpoint, e.g. POST /auth/citizen/verify-otp
    setTimeout(() => {
      setVerifying(false);
      if (MOCK_IS_NEW_USER) {
        animateStep(4);
      } else {
        Alert.alert('Welcome back', 'Login successful.');
      }
    }, 900);
  };

  const handleCompleteRegistration = () => {
    if (!fullName.trim() || !ward.trim() || !locality.trim()) return;
    // TODO: call your FastAPI endpoint, e.g. POST /auth/citizen/register
    Alert.alert('Welcome to Seva Setu', 'Your account has been created.');
  };

  const goBackStep = () => {
    if (step === 1) {
      router.back();
    } else if (step === 4) {
      animateStep(3);
    } else {
      animateStep(1);
      setOtp(['', '', '', '', '', '']);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Hero header */}
        <ImageBackground
          source={require('../assets/images/shivaji.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
          <SafeAreaView>
            <View style={styles.heroTopRow}>
              <Pressable onPress={goBackStep} style={styles.backBtn} hitSlop={10}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.white} />
              </Pressable>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.logoRing}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.heroTitle}>Citizen Login</Text>
              <Text style={styles.heroSubtitle}>Report. Send. Solve.</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Form sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <StepDots current={step} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <Animated.View style={{ opacity: fade }}>
              {step === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Enter your mobile number</Text>
                  <Text style={styles.stepHint}>
                    We'll send a one-time password to verify it's you.
                  </Text>

                  <View style={styles.inputRow}>
                    <MaterialCommunityIcons
                      name="cellphone"
                      size={20}
                      color={COLORS.textMuted}
                    />
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      value={mobile}
                      onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      placeholderTextColor="#A6ADB8"
                      keyboardType="number-pad"
                      maxLength={10}
                      style={styles.input}
                    />
                  </View>

                  <GradientButton
                    label={sendingOtp ? 'Sending OTP…' : 'Send OTP'}
                    disabled={!isMobileValid || sendingOtp}
                    loading={sendingOtp}
                    onPress={handleSendOtp}
                  />
                </View>
              )}

              {step === 2 && (
                <View style={styles.centerLoading}>
                  <ActivityIndicator size="large" color={COLORS.blue} />
                  <Text style={styles.stepHint}>Sending OTP to +91 {mobile}…</Text>
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text style={styles.stepTitle}>Enter OTP</Text>
                  <Text style={styles.stepHint}>
                    Sent to +91 {mobile.slice(0, 5)}••••• ·{' '}
                    <Text style={styles.linkText} onPress={() => animateStep(1)}>
                      Change number
                    </Text>
                  </Text>

                  <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(r) => {
                          if (r) otpRefs.current[i] = r;
                        }}
                        value={digit}
                        onChangeText={(v) => handleOtpChange(v, i)}
                        keyboardType="number-pad"
                        maxLength={1}
                        style={[
                          styles.otpBox,
                          digit ? styles.otpBoxFilled : undefined,
                        ]}
                      />
                    ))}
                  </View>

                  <Pressable onPress={handleSendOtp}>
                    <Text style={styles.resendText}>Didn't get it? Resend OTP</Text>
                  </Pressable>

                  <GradientButton
                    label={verifying ? 'Verifying…' : 'Verify & Continue'}
                    disabled={!isOtpComplete || verifying}
                    loading={verifying}
                    onPress={handleVerifyOtp}
                  />
                </View>
              )}

              {step === 4 && (
                <View>
                  <Text style={styles.stepTitle}>Tell us about yourself</Text>
                  <Text style={styles.stepHint}>
                    Just a few details to finish setting up your account.
                  </Text>

                  <LabeledInput
                    icon="account-outline"
                    placeholder="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  <LabeledInput
                    icon="map-marker-radius-outline"
                    placeholder="Ward (e.g. Ward No. 4)"
                    value={ward}
                    onChangeText={setWard}
                  />
                  <LabeledInput
                    icon="home-city-outline"
                    placeholder="Locality / Area"
                    value={locality}
                    onChangeText={setLocality}
                  />

                  <GradientButton
                    label="Complete Registration"
                    disabled={!fullName.trim() || !ward.trim() || !locality.trim()}
                    onPress={handleCompleteRegistration}
                  />
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function StepDots({ current }: { current: Step }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3, 4].map((n) => (
        <View
          key={n}
          style={[
            styles.dot,
            n === current && styles.dotActive,
            n < current && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

function LabeledInput({
  icon,
  ...props
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={styles.inputRow}>
      <MaterialCommunityIcons name={icon} size={20} color={COLORS.textMuted} />
      <TextInput
        placeholderTextColor="#A6ADB8"
        style={[styles.input, { marginLeft: 10 }]}
        {...props}
      />
    </View>
  );
}

function GradientButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ marginTop: 22 }}>
      <LinearGradient
        colors={disabled ? ['#C7CEDA', '#C7CEDA'] : [COLORS.navy, COLORS.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBtn}
      >
        {loading && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />}
        <Text style={styles.gradientBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.navyDeep },
  hero: { height: 220 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,29,48,0.62)',
  },
  heroTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center', marginTop: 6 },
  logoRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: { width: 38, height: 38 },
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
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 18,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 22 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: COLORS.blue, width: 20 },
  dotDone: { backgroundColor: COLORS.saffron },
  stepTitle: { fontSize: 19, fontWeight: '800', color: COLORS.textDark },
  stepHint: { marginTop: 6, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  linkText: { color: COLORS.blue, fontWeight: '700' },
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
  countryCode: {
    marginLeft: 8,
    marginRight: 6,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    marginLeft: 4,
  },
  centerLoading: { alignItems: 'center', paddingVertical: 40 },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  otpBoxFilled: {
    borderColor: COLORS.blue,
  },
  resendText: {
    marginTop: 16,
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
    textAlign: 'center',
  },
  gradientBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradientBtnText: {
    color: COLORS.white,
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
