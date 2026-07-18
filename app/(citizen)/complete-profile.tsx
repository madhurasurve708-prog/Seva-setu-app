import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import { CITIZEN_COLORS as C, LOCALITIES, WARDS } from '@/constants/citizen';
import { useCitizen } from '@/providers/citizen-provider';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import PrimaryButton from '@/components/common/PrimaryButton';
import CustomTextInput from '@/components/common/CustomTextInput';

export default function CompleteProfile() {
  const router = useRouter();
  const { saveProfile } = useCitizen();
  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [locality, setLocality] = useState('');

  const complete = async () => {
    if (!name.trim() || !ward || !locality) return;
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    await saveProfile({
      id: `cit_${Date.now()}`,
      firstName,
      lastName,
      fullName: name.trim(),
      mobile: '',
      ward,
      locality,
      name: name.trim(),
      phone: '',
    });
    router.replace('/dashboard');
  };

  const isFormValid = name.trim().length > 0 && ward && locality;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Modern Banner Header */}
      <View style={styles.hero}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.heroSafeArea}>
          <Animated.View entering={FadeInUp.duration(600)} style={styles.heroContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-check" size={28} color={COLORS.warning} />
            </View>
            <Text style={styles.heroTitle}>Complete Profile</Text>
            <Text style={styles.heroText}>
              Setting up your official ward and locality ensures your complaints are routed to the right desk.
            </Text>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* Input Sheet */}
      <ScrollView
        contentContainerStyle={styles.sheet}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <CustomTextInput
            icon="account-outline"
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          {/* Ward Selection */}
          <Text style={styles.label}>Select Ward</Text>
          <Text style={styles.subtextHint}>Select your registered municipal voting ward</Text>
          <View style={styles.optionsGrid}>
            {WARDS.map((value) => {
              const active = ward === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setWard(value);
                    setLocality('');
                  }}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                  ]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Locality Selection (Shown when ward is selected) */}
          {ward ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text style={styles.label}>Select Locality</Text>
              <Text style={styles.subtextHint}>Choose the specific neighborhood area</Text>
              <View style={styles.optionsGrid}>
                {LOCALITIES[ward].map((value) => {
                  const active = locality === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setLocality(value)}
                      style={[
                        styles.chip,
                        active && styles.chipActive,
                      ]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{value}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}

          <PrimaryButton
            label="Continue to Dashboard"
            disabled={!isFormValid}
            onPress={complete}
            style={styles.completeBtn}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    height: '30%',
    minHeight: 200,
    justifyContent: 'center',
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
  heroText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: '500',
  },
  sheet: {
    padding: 22,
    paddingBottom: 40,
  },
  label: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginTop: 18,
  },
  subtextHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    ...SHADOWS.soft,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  completeBtn: {
    marginTop: 32,
  },
});
