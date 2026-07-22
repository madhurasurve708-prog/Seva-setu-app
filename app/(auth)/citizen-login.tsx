import { AuthHero, AuthSheet, authStyles } from '@/components/common/AuthScaffold';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import type { CitizenProfile } from '@/types/citizen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    UIManager,
    View,
} from 'react-native';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Step = 1 | 2 | 3 | 4;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

const generateId = (): string => `cit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
};

const WARDS = Array.from({ length: 10 }, (_, index) => `Ward ${index + 1}`);

export default function CitizenLoginScreen() {
  const router = useRouter();
  const { saveProfile, getStoredProfile } = useCitizen();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [ward, setWard] = useState('');
  const [locality, setLocality] = useState('');

  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [nameError, setNameError] = useState('');
  const [wardError, setWardError] = useState('');
  const [localityError, setLocalityError] = useState('');

  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const otpRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  }, []);

  const isMobileValid = useMemo(() => /^[6-9]\d{9}$/.test(mobile), [mobile]);
  const isOtpComplete = useMemo(() => otp.every((d) => d.length === 1), [otp]);

  const animateToStep = useCallback((next: Step) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const playSuccessAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.04, duration: 160, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const handleSendOtp = useCallback(() => {
    if (!isMobileValid) {
      setMobileError(t('mobileError'));
      return;
    }
    setMobileError('');
    setSendingOtp(true);

    setTimeout(() => {
      setSendingOtp(false);
      animateToStep(2);
      setTimeout(() => {
        animateToStep(3);
        startCountdown();
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }, 350);
    }, 900);
  }, [isMobileValid, animateToStep, startCountdown, t]);

  const handleOtpChange = useCallback((value: string, index: number) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    if (!sanitized) {
      setOtp((prev) => {
        const copy = [...prev];
        copy[index] = '';
        return copy;
      });
      return;
    }

    if (sanitized.length > 1) {
      const chars = sanitized.slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      chars.forEach((c, i) => (next[i] = c));
      setOtp(next);
      const lastIndex = Math.min(chars.length - 1, OTP_LENGTH - 1);
      otpRefs.current[lastIndex]?.focus();
      return;
    }

    setOtp((prev) => {
      const copy = [...prev];
      copy[index] = sanitized.slice(-1);
      return copy;
    });

    if (index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        setOtp((prev) => {
          const copy = [...prev];
          copy[index - 1] = '';
          return copy;
        });
        otpRefs.current[index - 1]?.focus();
      }
    }
  }, [otp]);

  const checkUserExists = useCallback(async (mobileNumber: string) => {
    await new Promise((r) => setTimeout(r, 700));
    // For demo/design verification, if the number ends with 2, 4, 6, 8, 0, treat as existing user.
    const lastDigit = Number(mobileNumber.slice(-1));
    return lastDigit % 2 === 0;
  }, []);

  const handleVerifyOtp = useCallback(async () => {
    if (!isOtpComplete) {
      setOtpError(t('otpError'));
      return;
    }
    setOtpError('');
    setVerifying(true);

    setTimeout(async () => {
      setVerifying(false);
      playSuccessAnimation();
      setCheckingUser(true);
      const exists = await checkUserExists(mobile);
      setCheckingUser(false);

      if (exists) {
        const storedUser = await getStoredProfile(mobile);
        if (storedUser) {
          await saveProfile({ ...storedUser, mobile, phone: mobile });
          router.replace('/(citizen)/dashboard' as any);
        } else {
          animateToStep(4);
        }
      } else {
        animateToStep(4);
      }
    }, 900);
  }, [isOtpComplete, playSuccessAnimation, checkUserExists, mobile, animateToStep, router, saveProfile, getStoredProfile, t]);

  const handleResend = useCallback(() => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    startCountdown();
    setTimeout(() => otpRefs.current[0]?.focus(), 150);
  }, [canResend, startCountdown]);

  const validateRegistration = useCallback(() => {
    let ok = true;
    setNameError('');
    setWardError('');
    setLocalityError('');
    if (!fullName.trim()) {
      setNameError(t('nameError'));
      ok = false;
    }
    if (!ward.trim()) {
      setWardError(t('wardError'));
      ok = false;
    }
    if (!locality.trim()) {
      setLocalityError(t('localityError'));
      ok = false;
    }
    return ok;
  }, [fullName, ward, locality, t]);

  const handleCompleteRegistration = useCallback(async () => {
    if (!validateRegistration()) return;
    setRegistering(true);
    setTimeout(async () => {
      const { firstName, lastName } = splitName(fullName);
      const user: CitizenProfile = {
        id: generateId(),
        firstName,
        lastName,
        fullName: fullName.trim(),
        mobile,
        ward: ward.trim(),
        locality: locality.trim(),
        profileImage: '',
        name: fullName.trim(),
        phone: mobile,
        avatar: '',
      };
      await saveProfile(user);
      setRegistering(false);
      playSuccessAnimation();
      setTimeout(() => router.replace('/(citizen)/dashboard' as any), 450);
    }, 900);
  }, [validateRegistration, fullName, mobile, ward, locality, playSuccessAnimation, router, saveProfile]);

  const goBackStep = useCallback(() => {
    if (step === 1) {
      router.back();
    } else if (step === 4) {
      animateToStep(3);
    } else {
      animateToStep(1);
      setOtp(Array(OTP_LENGTH).fill(''));
    }
  }, [step, router, animateToStep]);

  return (
    <View style={authStyles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView style={authStyles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.select({ ios: 80, android: 100 })}>
        <AuthHero compact title={t('citizenLogin')} subtitle="Seva Setu - Malvan" showLogo={false} icon="account-circle-outline" onBack={goBackStep} />

        <AuthSheet>
          <View style={styles.dotsRow}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={[styles.dot, n === step && styles.dotActive, n < step && styles.dotDone]} />
            ))}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={authStyles.scrollContent} overScrollMode="never">
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>

              {step === 1 && (
                <View>
                  <Text style={authStyles.screenTitle}>{t('enterMobile')}</Text>
                  <Text style={authStyles.screenHint}>{t('mobileHint')}</Text>

                  <View style={[styles.phoneInputContainer, mobileError ? { borderColor: COLORS.danger } : null]}>
                    <MaterialCommunityIcons name="cellphone" size={20} color={mobileError ? COLORS.danger : COLORS.primaryLight} style={styles.phoneIcon} />
                    <View style={styles.indiaWrap}>
                      <Text style={styles.indiaCode}>+91</Text>
                    </View>
                    <View style={styles.divider} />
                    <TextInput
                      placeholder={t('mobilePlaceholder')}
                      placeholderTextColor={COLORS.textPlaceholder}
                      keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                      maxLength={10}
                      value={mobile}
                      onChangeText={(text) => {
                        const value = text.replace(/[^0-9]/g, '').slice(0, 10);
                        setMobile(value);
                        if (/^[6-9]\d{9}$/.test(value)) setMobileError('');
                      }}
                      style={styles.phoneInput}
                      returnKeyType="send"
                      onSubmitEditing={handleSendOtp}
                    />
                  </View>
                  {mobileError ? <Text style={authStyles.errorText}>{t('mobileError')}</Text> : null}

                  <View style={{ marginTop: 12 }}>
                    <Pressable
                      onPress={handleSendOtp}
                      disabled={!isMobileValid || sendingOtp}
                      style={({ pressed }) => [
                        styles.primaryBtnStyle,
                        { backgroundColor: !isMobileValid ? '#CBD5E1' : COLORS.primary },
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      {sendingOtp ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.primaryBtnText}>{t('sendOtp')}</Text>}
                    </Pressable>
                  </View>
                </View>
              )}

              {step === 2 && (
                <View style={styles.centerLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>{t('sendingOtp')} +91 {mobile}...</Text>
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text style={authStyles.screenTitle}>{t('enterOtp')}</Text>
                  <Text style={authStyles.screenHint}>
                    {t('otpSentTo')}{mobile.slice(0, 5)}xxxxx. <Text style={styles.linkText} onPress={() => animateToStep(1)}>{t('change')}</Text>
                  </Text>

                  <View style={styles.otpRow}>
                    {otp.map((d, i) => {
                      const isFocused = focusedIndex === i;
                      return (
                        <TextInput
                          key={i}
                          ref={(ref) => {
                            otpRefs.current[i] = ref;
                          }}
                          value={d}
                          onChangeText={(v) => handleOtpChange(v, i)}
                          onKeyPress={(e) => handleOtpKeyPress(e, i)}
                          onFocus={() => setFocusedIndex(i)}
                          onBlur={() => setFocusedIndex(null)}
                          keyboardType="numeric"
                          maxLength={1}
                          style={[
                            styles.otpBox,
                            d ? styles.otpBoxFilled : null,
                            isFocused && styles.otpBoxFocused,
                          ]}
                          textContentType="oneTimeCode"
                        />
                      );
                    })}
                  </View>
                  {otpError ? <Text style={authStyles.errorText}>{otpError}</Text> : null}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <Text style={styles.resendText}>{canResend ? t('canResendNow') : `${t('resendIn')}${countdown}s`}</Text>
                    <Pressable onPress={handleResend} disabled={!canResend} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                      <Text style={[styles.resendLink, !canResend ? { color: COLORS.textMuted } : null]}>{t('resendOtp')}</Text>
                    </Pressable>
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <Pressable
                      onPress={handleVerifyOtp}
                      disabled={!isOtpComplete || verifying}
                      style={({ pressed }) => [
                        styles.primaryBtnStyle,
                        { backgroundColor: !isOtpComplete ? '#CBD5E1' : COLORS.primary },
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      {verifying || checkingUser ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.primaryBtnText}>{t('verify')}</Text>}
                    </Pressable>
                  </View>
                </View>
              )}

              {step === 4 && (
                <View>
                  <Text style={authStyles.screenTitle}>{t('createCitizenProfile')}</Text>
                  <Text style={authStyles.screenHint}>{t('addressVerificationHint')}</Text>

                  <View style={authStyles.formContainer}>
                    {/* Name input */}
                    <Text style={styles.formInputLabel}>{t('nameLabel')}</Text>
                    <View style={[styles.formInputContainer, nameError ? { borderColor: COLORS.danger } : null]}>
                      <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.textMuted} style={styles.fieldIcon} />
                      <TextInput
                        placeholder={t('namePlaceholder')}
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={fullName}
                        onChangeText={(t) => {
                          setFullName(t);
                          if (t.trim()) setNameError('');
                        }}
                        style={styles.fieldInput}
                      />
                    </View>
                    {nameError ? <Text style={authStyles.errorText}>{nameError}</Text> : null}

                    {/* Ward Selector (Dropdown Replacement) */}
                    <Text style={styles.formInputLabel}>{t('selectWard')}</Text>
                    <Pressable
                      onPress={() => setShowWardModal(true)}
                      style={[styles.formInputContainer, wardError ? { borderColor: COLORS.danger } : null]}
                    >
                      <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={COLORS.textMuted} style={styles.fieldIcon} />
                      <Text style={[styles.fieldInputText, ward ? { color: COLORS.text } : null]}>
                        {ward || t('wardPickerHint')}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textMuted} />
                    </Pressable>
                    {wardError ? <Text style={authStyles.errorText}>{wardError}</Text> : null}

                    {/* Locality input */}
                    <Text style={styles.formInputLabel}>{t('localityStreetLandmark')}</Text>
                    <View style={[styles.formInputContainer, localityError ? { borderColor: COLORS.danger } : null]}>
                      <MaterialCommunityIcons name="home-city-outline" size={20} color={COLORS.textMuted} style={styles.fieldIcon} />
                      <TextInput
                        placeholder={t('localityExample')}
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={locality}
                        onChangeText={(t) => {
                          setLocality(t);
                          if (t.trim()) setLocalityError('');
                        }}
                        style={styles.fieldInput}
                      />
                    </View>
                    {localityError ? <Text style={authStyles.errorText}>{localityError}</Text> : null}
                  </View>

                  <View style={{ marginTop: 24 }}>
                    <Pressable
                      onPress={handleCompleteRegistration}
                      disabled={registering}
                      style={({ pressed }) => [
                        styles.primaryBtnStyle,
                        { backgroundColor: COLORS.primary },
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      {registering ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryBtnText}>{t('completeRegistration')}</Text>}
                    </Pressable>
                  </View>
                </View>
              )}

            </Animated.View>
          </ScrollView>
        </AuthSheet>
      </KeyboardAvoidingView>

      {/* Ward Dropdown Modal Bottom Sheet */}
      <Modal visible={showWardModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowWardModal(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('selectWard')}</Text>
            <Text style={styles.modalSubtitle}>{t('selectResidenceWard')}</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {WARDS.map((w) => {
                const selected = ward === w;
                return (
                  <Pressable
                    key={w}
                    onPress={() => {
                      setWard(w);
                      setWardError('');
                      setShowWardModal(false);
                    }}
                    style={[styles.modalItem, selected && styles.modalItemSelected]}
                  >
                    <Text style={[styles.modalItemText, selected && styles.modalItemTextSelected]}>{`${t('ward2')} ${w.replace(/^Ward\s*/, '')}`}</Text>
                    {selected && <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  dotDone: {
    backgroundColor: COLORS.secondary,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 56,
    paddingLeft: 14,
    paddingRight: 10,
    marginBottom: 8,
  },
  phoneIcon: {
    marginRight: 6,
  },
  indiaWrap: {
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  indiaCode: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 0,
  },
  centerLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    marginTop: 12,
    color: COLORS.textMuted,
  },
  linkText: {
    color: COLORS.secondary,
    fontWeight: '800',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
    gap: 6,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: 0,
  },
  otpBoxFilled: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  otpBoxFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  resendText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  resendLink: {
    color: COLORS.secondary,
    fontWeight: '800',
  },
  formInputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 14,
    marginBottom: 6,
    paddingLeft: 2,
  },
  formInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 0,
  },
  fieldInputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPlaceholder,
  },
  primaryBtnStyle: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    ...SHADOWS.button,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 26, 48, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D8E2EC',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 18,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  modalItemSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: 'rgba(11, 79, 138, 0.04)',
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
