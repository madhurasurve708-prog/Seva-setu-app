import { View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useOfficial } from '@/providers/official-provider';

export default function SecurityScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useOfficial();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Validation Error', 'Please type your current password.');
      return;
    }

    if (currentPassword !== profile.password) {
      Alert.alert('Validation Error', 'The current password typed is incorrect.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password confirmation does not match.');
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        ...profile,
        password: newPassword,
      });
      Alert.alert('Success', 'Security password updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <Ionicons name="arrow-back" size={24} color="#0A2A43" />
          </Pressable>
          <View>
            <Text className="text-lg font-extrabold text-slate-800 leading-tight">Security</Text>
            <Text className="text-xs text-slate-400 font-bold">Update passcodes and password controls</Text>
          </View>
        </View>

        <Pressable
          onPress={handleUpdatePassword}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="bg-blue-600 px-4 py-2 rounded-xl shadow-sm disabled:opacity-50"
        >
          <Text className="text-white font-bold text-xs">{saving ? 'Updating...' : 'Save'}</Text>
        </Pressable>
      </View>

      <View className="p-4">
        {/* Form Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Change Password</Text>

          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#5B6472" />
            <TextInput
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="key-outline" size={18} color="#5B6472" />
            <TextInput
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min 6 characters"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="checkmark-done" size={18} color="#5B6472" />
            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Retype password"
              placeholderTextColor="#A6ADB8"
              style={styles.input}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#101826',
    marginLeft: 8,
  },
});
