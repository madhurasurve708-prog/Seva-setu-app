import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomTextInput from '@/components/common/CustomTextInput';
import GlassCard from '@/components/common/GlassCard';
import PrimaryButton from '@/components/common/PrimaryButton';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { OfficialProfile, useOfficial } from '@/providers/official-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile, logout } = useOfficial();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState(profile.language);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email);
    setLanguage(profile.language);
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation', 'Phone number is required.');
      return;
    }

    setSaving(true);
    try {
      const updated: OfficialProfile = {
        ...profile,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        language: language.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
        avatarInitial: name.trim().charAt(0).toUpperCase() || 'U',
      };
      await saveProfile(updated);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const doLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // ignore
    }
    router.replace('/(auth)/role-selection');
    setLoggingOut(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you want to logout?')
          : true;
      if (ok) void doLogout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Header — matches CitizenScreen header exactly */}
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
          </Pressable>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <Pressable
            onPress={() =>
              Alert.alert('Photo Upload', 'Photo picker will be available after backend integration.')
            }
            style={styles.avatarPressable}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{profile.avatarInitial}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
            </View>
          </Pressable>
          <Text style={styles.avatarLabel}>Tap to change profile picture</Text>
        </View>

        {/* Editable fields card */}
        <GlassCard style={styles.formCard}>
          <CustomTextInput
            icon="account-outline"
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <CustomTextInput
            icon="phone-outline"
            label="Phone Number"
            placeholder="e.g. 9420105073"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />

          <CustomTextInput
            icon="email-outline"
            label="Email Address"
            placeholder="e.g. name@malvan.gov.in"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <CustomTextInput
            icon="translate"
            label="Language"
            placeholder="e.g. English / मराठी"
            value={language}
            onChangeText={setLanguage}
          />

          <CustomTextInput
            icon="lock-outline"
            label="Change Password"
            placeholder="Enter new password (optional)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </GlassCard>

        {/* Read-only demographics */}
        <GlassCard style={styles.demoCard}>
          <Text style={styles.demoHeading}>Official Demographics</Text>
          <Text style={styles.demoSubtext}>
            Role and ward info is attached from your municipal registration record.
          </Text>

          <View style={styles.demoGrid}>
            <ReadOnlyField
              icon="map-marker-outline"
              label="WARD"
              value={profile.ward || 'Ward 2'}
            />
            <ReadOnlyField
              icon="shield-account-outline"
              label="ROLE"
              value="Nagarsevak (Ward Representative)"
            />
          </View>

          <View style={styles.demoGrid}>
            <ReadOnlyField
              icon="home-city-outline"
              label="MUNICIPALITY"
              value="Malvan"
            />
            <ReadOnlyField
              icon="map-marker-radius-outline"
              label="LOCALITY"
              value={profile.locality || 'Malvan Bazaar'}
            />
          </View>
        </GlassCard>

        <PrimaryButton
          label={saving ? 'Saving…' : 'Save Changes'}
          loading={saving}
          onPress={handleSave}
          style={styles.saveBtn}
        />

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutPressed,
            loggingOut && styles.logoutDisabled,
          ]}
        >
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>
            {loggingOut ? 'Logging out…' : 'Logout'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ReadOnlyField({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.roContainer}>
      <View style={styles.roLabelRow}>
        <MaterialCommunityIcons name={icon} size={13} color={COLORS.textMuted} />
        <Text style={styles.roLabel}>{label}</Text>
      </View>
      <View style={styles.roField}>
        <Text style={styles.roValue} numberOfLines={1}>{value}</Text>
        <MaterialCommunityIcons name="lock-outline" size={13} color={COLORS.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeHeader: {
    backgroundColor: COLORS.primary,
  },
  header: {
    height: 58,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    ...SHADOWS.soft,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 50,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarPressable: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    ...SHADOWS.medium,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 38,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primaryLight,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  avatarLabel: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '700',
    marginTop: 10,
  },

  // Form card
  formCard: {
    padding: 16,
    marginBottom: 14,
  },

  // Demographics card
  demoCard: {
    padding: 16,
    marginBottom: 20,
  },
  demoHeading: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  demoSubtext: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 14,
  },
  demoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  roContainer: {
    flex: 1,
  },
  roLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  roLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  roField: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginRight: 4,
  },

  // Buttons
  saveBtn: {
    width: '100%',
    marginBottom: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    marginBottom: 16,
  },
  logoutPressed: {
    opacity: 0.88,
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
});
