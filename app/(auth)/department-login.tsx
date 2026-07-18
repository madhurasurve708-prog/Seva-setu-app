import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import PrimaryButton from '@/components/common/PrimaryButton';
import CustomTextInput from '@/components/common/CustomTextInput';

type DeptOption = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const DEPARTMENTS: DeptOption[] = [
  { key: 'water', label: 'Water Supply', icon: 'water-outline' },
  { key: 'road', label: 'Road Damage', icon: 'road-variant' },
  { key: 'garbage', label: 'Sanitation', icon: 'delete-outline' },
  { key: 'other', label: 'Other Depts', icon: 'dots-horizontal-circle-outline' },
];

export default function DepartmentLoginScreen() {
  const router = useRouter();
  const [department, setDepartment] = useState<string>('water');
  const [departmentId, setDepartmentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = departmentId.trim().length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Login API simulation
    }, 900);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Premium Hero with Responsive Framed Shivaji Asset */}
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
                    <MaterialCommunityIcons name="domain" size={26} color={COLORS.warning} />
                  </View>
                  <Text style={styles.heroTitle}>Dept Login</Text>
                  <Text style={styles.heroSubtitle}>Grievance Resolution</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Dynamic bottom sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            overScrollMode="never"
          >
            <Text style={styles.stepTitle}>Select your department</Text>
            <Text style={styles.stepHint}>
              Choose the municipal desk you represent to check assigned tasks.
            </Text>

            <View style={styles.deptRow}>
              {DEPARTMENTS.map((d) => {
                const active = department === d.key;
                return (
                  <Pressable
                    key={d.key}
                    onPress={() => setDepartment(d.key)}
                    style={[
                      styles.deptChip,
                      active && styles.deptChipActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={d.icon}
                      size={18}
                      color={active ? COLORS.white : COLORS.accent}
                    />
                    <Text style={[styles.deptChipText, active && styles.deptChipTextActive]}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.formContainer}>
              <CustomTextInput
                icon="card-account-details-outline"
                placeholder="Enter Department ID"
                label="Department ID"
                value={departmentId}
                onChangeText={setDepartmentId}
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
              label={loading ? 'Signing in…' : 'Login'}
              disabled={!canSubmit || loading}
              loading={loading}
              onPress={handleLogin}
              style={styles.actionBtn}
            />
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
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginTop: 2,
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
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  stepHint: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  deptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  deptChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    ...SHADOWS.soft,
  },
  deptChipText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  deptChipTextActive: {
    color: COLORS.white,
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
});
