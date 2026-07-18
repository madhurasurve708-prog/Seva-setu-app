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

export default function NagarsevakLoginScreen() {
  const router = useRouter();
  const [officialId, setOfficialId] = useState('');
  const [ward, setWard] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = officialId.trim().length > 0 && ward.trim().length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Login simulation
    }, 900);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Premium Hero - Shivaji illustration framed and not cut off */}
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
                    <MaterialCommunityIcons name="office-building" size={26} color={COLORS.primary} />
                  </View>
                  <Text style={styles.heroTitle}>Nagarsevak</Text>
                  <Text style={styles.heroSubtitle}>Representative Access</Text>
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
            <Text style={styles.stepTitle}>Ward Administration</Text>
            <Text style={styles.stepHint}>
              Access credentials are restricted to active ward counselors.
            </Text>

            <View style={styles.formContainer}>
              <CustomTextInput
                icon="card-account-details-outline"
                placeholder="Enter Official ID"
                label="Official ID"
                value={officialId}
                onChangeText={setOfficialId}
                autoCapitalize="none"
              />

              <CustomTextInput
                icon="map-marker-outline"
                placeholder="e.g. Ward No. 4"
                label="Assigned Ward"
                value={ward}
                onChangeText={setWard}
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

            <View style={styles.securityBadge}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.securityText}>Verified government node login</Text>
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
