// app/(citizen)/profile.tsx
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import CustomTextInput from '@/components/common/CustomTextInput';
import GlassCard from '@/components/common/GlassCard';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useCitizen } from '@/providers/citizen-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
};

export default function Profile() {
  const router = useRouter();
  const { profile, saveProfile, logout } = useCitizen();
  const [fullName, setFullName] = useState(profile?.fullName || profile?.name || '');
  const [mobile, setMobile] = useState(profile?.mobile || profile?.phone || '');
  const [locality, setLocality] = useState(profile?.locality || '');
  const [photoUri, setPhotoUri] = useState(profile?.profileImage || profile?.avatar);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || profile.name || '');
    setMobile(profile.mobile || profile.phone || '');
    setLocality(profile.locality || '');
    setPhotoUri(profile.profileImage || profile.avatar);
  }, [profile]);

  const displayFirstName = useMemo(() => {
    if (profile?.firstName) return profile.firstName;
    if (fullName) return fullName.split(' ')[0];
    return 'Citizen';
  }, [profile, fullName]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required.');
      return;
    }
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.replace(/[^0-9]/g, ''))) {
      Alert.alert('Error', 'Valid 10-digit mobile number is required.');
      return;
    }
    if (!locality.trim()) {
      Alert.alert('Error', 'Locality is required.');
      return;
    }

    setSaving(true);
    try {
      const { firstName, lastName } = splitName(fullName);
      await saveProfile({
        ...profile,
        fullName: fullName.trim(),
        firstName,
        lastName,
        mobile: mobile.trim(),
        locality: locality.trim(),
        profileImage: photoUri,
        name: fullName.trim(),
        phone: mobile.trim(),
        avatar: photoUri,
      });
      setSaving(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch {
      setSaving(false);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const doLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    try {
      if (typeof router.canDismiss === 'function' && router.canDismiss()) {
        router.dismissAll();
      }
    } catch {
      // nothing to dismiss, ignore
    }
    router.replace('/(auth)/role-selection');
    setLoggingOut(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to logout?') : true;
      if (confirmed) {
        void doLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void doLogout();
        },
      },
    ]);
  };

  const menuItems: {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    value?: string;
  }[] = [
      { label: 'Settings', icon: 'cog-outline', onPress: () => router.push('/(citizen)/settings') },
      { label: 'Help & FAQs', icon: 'help-circle-outline', onPress: () => router.push('/(citizen)/help') },
      { label: 'Privacy Policy', icon: 'file-document-outline', onPress: () => router.push('/(citizen)/privacy-policy') },
      { label: 'Terms & Conditions', icon: 'handshake-outline', onPress: () => router.push('/(citizen)/terms-conditions') },
      { label: 'About Seva Setu', icon: 'information-outline', onPress: () => router.push('/(citizen)/about') },
      { label: 'App Version', icon: 'cellphone', onPress: () => { }, value: '1.0.0' },
    ];

  return (
    <CitizenScreen title="My Profile">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        <View style={styles.avatarSection}>
          <Pressable onPress={pickPhoto} style={styles.avatarPressable}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {displayFirstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
            </View>
          </Pressable>
          <Text style={styles.avatarLabel}>Tap to change profile picture</Text>
        </View>

        <GlassCard style={styles.formCard}>
          <CustomTextInput
            icon="account-outline"
            label="Full Name"
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
          />

          <CustomTextInput
            icon="phone-outline"
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />

          <CustomTextInput
            icon="home-outline"
            label="Locality / Area / Street"
            placeholder="e.g. Wayari Bazaar"
            value={locality}
            onChangeText={setLocality}
          />

          <Text style={styles.readOnlyHeading}>Official Demographics</Text>
          <Text style={styles.readOnlySubtext}>
            Ward info is attached from your municipal registrations record.
          </Text>

          <View style={styles.row}>
            <View style={styles.readOnlyContainer}>
              <View style={styles.rowLabelGroup}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.readOnlyLabel}>WARD</Text>
              </View>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{profile?.ward || 'General'}</Text>
                <MaterialCommunityIcons name="lock-outline" size={14} color={COLORS.textMuted} />
              </View>
            </View>

            <View style={styles.readOnlyContainer}>
              <View style={styles.rowLabelGroup}>
                <MaterialCommunityIcons name="home-city-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.readOnlyLabel}>MUNICIPALITY</Text>
              </View>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>Malvan</Text>
                <MaterialCommunityIcons name="lock-outline" size={14} color={COLORS.textMuted} />
              </View>
            </View>
          </View>
        </GlassCard>

        <PrimaryButton
          label={saving ? 'Saving changes…' : 'Save Changes'}
          loading={saving}
          onPress={handleSave}
          style={styles.saveBtn}
        />

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed, loggingOut && styles.logoutButtonDisabled]}
        >
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutButtonText}>{loggingOut ? 'Logging out…' : 'Logout'}</Text>
        </Pressable>

        <Text style={styles.menuHeading}>App Menu</Text>
        <GlassCard style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                idx === menuItems.length - 1 && styles.menuRowLast,
                pressed && styles.menuRowPressed,
              ]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconCircle}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              {item.value ? (
                <Text style={styles.menuValue}>{item.value}</Text>
              ) : (
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
              )}
            </Pressable>
          ))}
        </GlassCard>
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 120 },
  avatarSection: { alignItems: 'center', marginVertical: 18 },
  avatarPressable: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.medium,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 48 },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: COLORS.white, fontWeight: '800', fontSize: 34 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primaryLight,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  avatarLabel: { fontSize: 12.5, color: COLORS.accent, fontWeight: '700', marginTop: 8 },
  formCard: { padding: 16, marginBottom: 20 },
  readOnlyHeading: { ...TYPOGRAPHY.captionBold, color: COLORS.primary, marginTop: 14 },
  readOnlySubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 10 },
  readOnlyContainer: { flex: 1 },
  rowLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  readOnlyLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  readOnlyField: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyValue: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  saveBtn: { width: '100%', marginBottom: 14 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginBottom: 28,
  },
  logoutButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
  menuHeading: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginBottom: 12 },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuRowPressed: { backgroundColor: 'rgba(15, 23, 42, 0.03)' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  menuValue: { fontSize: 14, color: COLORS.textMuted, fontWeight: '700' },
});
