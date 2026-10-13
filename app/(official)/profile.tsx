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

import CustomTextInput from '@/components/common/CustomTextInput';
import { GlassCard } from '@/components/common/GlassCard';
import PrimaryButton from '@/components/common/PrimaryButton';
import { OfficialScreen } from '@/components/official/OfficialScreen';
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

  // Inline editing state for phone/email
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email);
    setLanguage(profile.language);
  }, [profile]);

  const handleSaveField = async (field: 'phone' | 'email', value: string) => {
    setSaving(true);
    try {
      const updated: OfficialProfile = {
        ...profile,
        [field]: value.trim(),
      };
      await saveProfile(updated);
      Alert.alert('Success', `${field === 'phone' ? 'Phone number' : 'Email address'} updated successfully.`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update field.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation', 'Phone number is required.');
      return;
    }
    if (password.trim()) {
      Alert.alert('Security', 'Please change your password from the Security Settings page to verify your identity.');
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
        avatarInitial: name.trim().charAt(0).toUpperCase() || 'U',
      };
      await saveProfile(updated);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
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
    <OfficialScreen title="My Profile" tab="profile" hideHeader={true}>
      {/* Header — matches CitizenScreen header exactly */}
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerBtn} />
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
          </View>
        </View>
      </View>

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
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
          />

          {isPhoneEditing ? (
            <View style={styles.editInputContainer}>
              <CustomTextInput
                icon="phone-outline"
                label="Phone Number"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(txt) => {
                  setPhone(txt);
                  setPhoneError('');
                }}
                error={phoneError}
              />
              <View style={styles.editActionsRow}>
                <Pressable
                  onPress={() => {
                    if (!/^[6-9]\d{9}$/.test(phone)) {
                      setPhoneError('Please enter a valid 10-digit phone number.');
                      return;
                    }
                    setPhoneError('');
                    setIsPhoneEditing(false);
                    handleSaveField('phone', phone);
                  }}
                  style={[styles.miniBtn, styles.miniBtnSave]}
                >
                  <Text style={styles.miniBtnText}>Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setPhone(profile.phone);
                    setPhoneError('');
                    setIsPhoneEditing(false);
                  }}
                  style={[styles.miniBtn, styles.miniBtnCancel]}
                >
                  <Text style={styles.miniBtnTextCancel}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.fieldViewRow}>
              <View style={styles.fieldViewLeft}>
                <MaterialCommunityIcons name="phone-outline" size={20} color={COLORS.textMuted} />
                <View style={styles.fieldViewTextCol}>
                  <Text style={styles.fieldViewLabel}>Phone Number</Text>
                  <Text style={styles.fieldViewValue}>{phone || 'Not registered'}</Text>
                </View>
              </View>
              <Pressable onPress={() => setIsPhoneEditing(true)} style={styles.editIconBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
              </Pressable>
            </View>
          )}

          {isEmailEditing ? (
            <View style={styles.editInputContainer}>
              <CustomTextInput
                icon="email-outline"
                label="Email Address (Optional)"
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(txt) => {
                  setEmail(txt);
                  setEmailError('');
                }}
                error={emailError}
              />
              <View style={styles.editActionsRow}>
                <Pressable
                  onPress={() => {
                    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setEmailError('Please enter a valid email address.');
                      return;
                    }
                    setEmailError('');
                    setIsEmailEditing(false);
                    handleSaveField('email', email);
                  }}
                  style={[styles.miniBtn, styles.miniBtnSave]}
                >
                  <Text style={styles.miniBtnText}>Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEmail(profile.email);
                    setEmailError('');
                    setIsEmailEditing(false);
                  }}
                  style={[styles.miniBtn, styles.miniBtnCancel]}
                >
                  <Text style={styles.miniBtnTextCancel}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.fieldViewRow}>
              <View style={styles.fieldViewLeft}>
                <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textMuted} />
                <View style={styles.fieldViewTextCol}>
                  <Text style={styles.fieldViewLabel}>Email Address (Optional)</Text>
                  <Text style={styles.fieldViewValue}>{email || 'Not registered'}</Text>
                </View>
              </View>
              <Pressable onPress={() => setIsEmailEditing(true)} style={styles.editIconBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
              </Pressable>
            </View>
          )}

          <CustomTextInput
            icon="lock-outline"
            label="Change Password (Optional)"
            placeholder="Enter new password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </GlassCard>

        {/* Read-only workspace information */}
        <Text style={styles.sectionHeader}>Workspace Information</Text>
        <GlassCard style={styles.roCard}>
          <View style={styles.roGroup}>
            <View style={styles.roLabelRow}>
              <MaterialCommunityIcons name="badge-account-horizontal-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.roLabel}>Employee / Official ID</Text>
            </View>
            <View style={styles.roField}>
              <Text style={styles.roValue}>{profile.employeeId}</Text>
              <MaterialCommunityIcons name="lock" size={14} color="#94A3B8" />
            </View>
          </View>

          <View style={styles.roGroup}>
            <View style={styles.roLabelRow}>
              <MaterialCommunityIcons name="account-cog-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.roLabel}>Designation / Role</Text>
            </View>
            <View style={styles.roField}>
              <Text style={styles.roValue}>{profile.designation}</Text>
              <MaterialCommunityIcons name="lock" size={14} color="#94A3B8" />
            </View>
          </View>

          <View style={styles.roGroup}>
            <View style={styles.roLabelRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.roLabel}>Assigned Ward</Text>
            </View>
            <View style={styles.roField}>
              <Text style={styles.roValue}>{profile.ward}</Text>
              <MaterialCommunityIcons name="lock" size={14} color="#94A3B8" />
            </View>
          </View>

          {profile.department ? (
            <View style={styles.roGroup}>
              <View style={styles.roLabelRow}>
                <MaterialCommunityIcons name="office-building" size={15} color={COLORS.textMuted} />
                <Text style={styles.roLabel}>Assigned Department</Text>
              </View>
              <View style={styles.roField}>
                <Text style={styles.roValue}>{profile.department}</Text>
                <MaterialCommunityIcons name="lock" size={14} color="#94A3B8" />
              </View>
            </View>
          ) : null}
        </GlassCard>

        {/* Action Buttons */}
        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            label={saving ? 'Saving...' : 'Save Profile Changes'}
            onPress={handleSave}
            disabled={saving}
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
            <Text style={styles.logoutText}>{loggingOut ? 'Logging out...' : 'Log Out of Portal'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </OfficialScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 18,
  },

  /* Header */
  headerWrap: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // Manual safe area spacer to avoid double wrapping in stacks
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

  /* Avatar Upload */
  avatarSection: {
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  avatarPressable: {
    position: 'relative',
    ...SHADOWS.medium,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarInitials: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarLabel: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '700',
  },

  /* Form */
  formCard: {
    padding: 16,
    gap: 14,
  },

  /* Read-only info */
  sectionHeader: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: -4,
    marginLeft: 2,
  },
  roCard: {
    padding: 16,
    gap: 14,
  },
  roGroup: {
    gap: 6,
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
  fieldViewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldViewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldViewTextCol: {
    flex: 1,
  },
  fieldViewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  fieldViewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editInputContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  editActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  miniBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtnSave: {
    backgroundColor: COLORS.primary,
  },
  miniBtnCancel: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  miniBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  miniBtnTextCancel: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
  },
});
