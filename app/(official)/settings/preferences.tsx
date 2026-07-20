import { View, Text, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useOfficial } from '@/providers/official-provider';

export default function PreferencesScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useOfficial();
  const [selectedLanguage, setSelectedLanguage] = useState(profile.language);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    try {
      await saveProfile({
        ...profile,
        language: lang,
      });
      Alert.alert('Language Updated', `Application language set to: ${lang}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#0A2A43" />
        </Pressable>
        <View>
          <Text className="text-lg font-extrabold text-slate-800 leading-tight">Preferences</Text>
          <Text className="text-xs text-slate-400 font-bold">Configure language and general settings</Text>
        </View>
      </View>

      <View className="p-4">
        {/* Language Selection Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <Text className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-wider">Select Language</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Select your preferred display language for Malvan municipal console.
          </Text>

          <View style={{ gap: 8 }}>
            {[
              { code: 'English', label: 'English' },
              { code: 'Marathi', label: 'मराठी (Marathi)' },
              { code: 'Hindi', label: 'हिन्दी (Hindi)' },
            ].map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                  style={[
                    styles.radioRow,
                    isSelected && styles.activeRadioRow,
                  ]}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? '#1E6FD9' : '#A6ADB8'}
                  />
                  <Text
                    style={[
                      styles.radioText,
                      isSelected && styles.activeRadioText,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* General Toggles */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">General settings</Text>

          <View className="flex-row items-center justify-between py-2 border-b border-slate-50">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Biometric Authentication</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Use FaceID/Fingerprint to login swiftly.</Text>
            </View>
            <Switch
              value={biometricLogin}
              onValueChange={setBiometricLogin}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          <View className="flex-row items-center justify-between py-2 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Auto Logout Session</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Automatically log out after 30 minutes of inactivity.</Text>
            </View>
            <Switch
              value={sessionTimeout}
              onValueChange={setSessionTimeout}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
  },
  activeRadioRow: {
    borderColor: '#1E6FD9',
    backgroundColor: '#EFF6FF',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B6472',
    marginLeft: 10,
  },
  activeRadioText: {
    color: '#1E6FD9',
    fontWeight: '700',
  },
});
