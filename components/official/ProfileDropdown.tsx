import { useTranslation } from '@/providers/localization-provider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

interface ProfileDropdownProps {
  name: string;
  initial: string;
  language: string;
  roleLabel?: string;
  ward?: string;
  department?: string;
  onLogout: () => void;
}

export default function ProfileDropdown({ name, initial, language, roleLabel, onLogout }: ProfileDropdownProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleNavigate = (route: string) => {
    setOpen(false);
    router.push(route as any);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="w-10 h-10 rounded-full items-center justify-center shadow"
        style={{ backgroundColor: '#1E6FD9' }}
      >
        <Text className="text-white font-bold text-base">{initial}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/20" onPress={() => setOpen(false)}>
          <View style={styles.dropdownContainer}>
            <View className="px-4 py-3.5 border-b border-slate-100">
              <Text className="font-bold text-slate-800 text-base">{name}</Text>
              <Text className="text-xs text-slate-500 mt-0.5 font-medium">Malvan Municipal Council</Text>
            </View>

            {/* My Profile */}
            <Pressable
              onPress={() => handleNavigate('/(official)/profile')}
              className="flex-row items-center px-4 py-3 active:bg-slate-100"
            >
              <Ionicons name="person-outline" size={18} color="#475569" />
              <Text className="text-slate-700 ml-3 font-semibold">{t('myProfile')}</Text>
            </Pressable>

            {/* Settings */}
            <Pressable
              onPress={() => handleNavigate('/(official)/settings')}
              className="flex-row items-center px-4 py-3 active:bg-slate-100"
            >
              <Ionicons name="settings-outline" size={18} color="#475569" />
              <Text className="text-slate-700 ml-3 font-semibold">{t('settings')}</Text>
            </Pressable>

            {/* Change Password */}
            <Pressable
              onPress={() => handleNavigate('/(official)/settings/security')}
              className="flex-row items-center px-4 py-3 active:bg-slate-100"
            >
              <Ionicons name="lock-closed-outline" size={18} color="#475569" />
              <Text className="text-slate-700 ml-3 font-semibold">{t('changePassword')}</Text>
            </Pressable>

            {/* Dark Mode Switch */}
            <View className="flex-row items-center justify-between px-4 py-2">
              <Pressable
                onPress={() => handleNavigate('/(official)/settings/appearance')}
                className="flex-row items-center flex-1 py-1"
              >
                <Ionicons name="moon-outline" size={18} color="#475569" />
                <Text className="text-slate-700 ml-3 font-semibold">{t('darkMode')}</Text>
              </Pressable>
              <Switch
                value={darkMode}
                onValueChange={(val) => {
                  setDarkMode(val);
                }}
                trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
              />
            </View>

            {/* Language Selection */}
            <Pressable
              onPress={() => handleNavigate('/(official)/settings/preferences')}
              className="flex-row items-center justify-between px-4 py-3 border-t border-slate-100 active:bg-slate-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="language-outline" size={18} color="#475569" />
                <Text className="text-slate-700 ml-3 font-semibold">{t('language')}</Text>
              </View>
              <Text className="text-blue-600 font-bold text-sm">{language}</Text>
            </Pressable>

            {/* Logout */}
            <Pressable
              onPress={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex-row items-center px-4 py-3 border-t border-slate-100 active:bg-red-50"
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text className="text-red-600 ml-3 font-bold">{t('logout')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 4,
    shadowColor: '#071D30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E7ECF2',
  },
});