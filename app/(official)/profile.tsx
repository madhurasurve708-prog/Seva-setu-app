import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfficialProfile, useOfficial } from '@/providers/official-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useOfficial();

  // Local form state initialized from context profile
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [username, setUsername] = useState(profile.username);
  const [password, setPassword] = useState(profile.password || '');
  const [employeeId, setEmployeeId] = useState(profile.employeeId);
  const [designation, setDesignation] = useState(profile.designation);
  const [ward, setWard] = useState(profile.ward);
  const [locality, setLocality] = useState(profile.locality);
  const [department, setDepartment] = useState(profile.department);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
    setUsername(profile.username);
    setPassword(profile.password || '');
    setEmployeeId(profile.employeeId);
    setDesignation(profile.designation);
    setWard(profile.ward);
    setLocality(profile.locality);
    setDepartment(profile.department);
  }, [profile]);

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone Number is required.');
      return;
    }

    setSaving(true);
    try {
      const updatedProfile: OfficialProfile = {
        name: name.trim(),
        phone: phone.trim(),
        email: profile.email,
        username: username.trim(),
        password: password.trim() || profile.password,
        employeeId: employeeId.trim(),
        designation: designation.trim(),
        ward: ward.trim(),
        locality: locality.trim(),
        department: department.trim(),
        role: profile.role,
        roleLabel: profile.roleLabel,
        avatarInitial: name.trim().charAt(0).toUpperCase() || 'U',
        language: profile.language,
      };

      await saveProfile(updatedProfile);
      Alert.alert('Success', 'Profile changes saved successfully.', [
        {
          text: 'OK',
          onPress: () => router.push('/(official)/dashboard'),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/(official)/dashboard');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header matching Screenshot 2 design */}
      <View style={styles.headerBar}>
        <Pressable onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerAvatarInitial}>
          <Text style={styles.headerAvatarInitialText}>{profile.avatarInitial}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Profile Avatar section */}
        <View className="items-center mb-6 mt-4">
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>{profile.avatarInitial}</Text>
            <Pressable
              onPress={() => Alert.alert('Photo Upload', 'Photo picker will open in a future update.')}
              style={styles.cameraIconBadge}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Pressable onPress={() => Alert.alert('Photo Upload', 'Photo picker will open in a future update.')}>
            <Text className="text-blue-500 font-bold text-xs mt-3">Tap to change profile picture</Text>
          </Pressable>
        </View>

        {/* Input Form Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          {/* Full Name */}
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color="#5B6472" />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* Mobile Number */}
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color="#5B6472" />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Mobile Number"
              placeholderTextColor="#A6ADB8"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          {/* Locality */}
          <Text style={styles.fieldLabel}>Locality / Area / Street</Text>
          <View style={styles.inputRow}>
            <Ionicons name="home-outline" size={18} color="#5B6472" />
            <TextInput
              value={locality}
              onChangeText={setLocality}
              placeholder="Locality"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* Official Demographics Divider */}
          <View className="mt-4 mb-2">
            <Text style={styles.subHeading}>Official Demographics</Text>
            <Text className="text-slate-400 text-[10px] font-bold leading-normal">
              Ward info is attached from your municipal registrations record.
            </Text>
          </View>

          {/* Username */}
          <Text style={styles.fieldLabel}>Username</Text>
          <View style={styles.inputRow}>
            <Ionicons name="at-outline" size={18} color="#5B6472" />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#A6ADB8"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <Text style={styles.fieldLabel}>Change Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#5B6472" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor="#A6ADB8"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Employee ID */}
          <Text style={styles.fieldLabel}>Employee ID</Text>
          <View style={styles.inputRow}>
            <Ionicons name="card-outline" size={18} color="#5B6472" />
            <TextInput
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="Employee ID"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* Designation */}
          <Text style={styles.fieldLabel}>Designation</Text>
          <View style={styles.inputRow}>
            <Ionicons name="ribbon-outline" size={18} color="#5B6472" />
            <TextInput
              value={designation}
              onChangeText={setDesignation}
              placeholder="Designation"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* Ward */}
          <Text style={styles.fieldLabel}>Assigned Ward</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={18} color="#5B6472" />
            <TextInput
              value={ward}
              onChangeText={setWard}
              placeholder="Assigned Ward"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* Department */}
          <Text style={styles.fieldLabel}>Department</Text>
          <View style={styles.inputRow}>
            <Ionicons name="briefcase-outline" size={18} color="#5B6472" />
            <TextInput
              value={department}
              onChangeText={setDepartment}
              placeholder="Department"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSaveChanges}
          disabled={saving}
          style={styles.saveBtn}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    height: 56,
    backgroundColor: '#0A2A43',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#071D30',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerAvatarInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2994A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarInitialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  largeAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#3085F3',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#0A2A43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  largeAvatarText: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3085F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E6FD9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#101826',
    marginLeft: 10,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1E6FD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#1E6FD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
