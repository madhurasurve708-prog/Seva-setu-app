import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PropsWithChildren, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileDropdown from '@/components/official/ProfileDropdown';
import Sidebar from '@/components/official/Sidebar';

import { useTranslation } from '@/providers/localization-provider';
import { useOfficial } from '@/providers/official-provider';

export function AdminShell({ title, children }: PropsWithChildren<{ title: string }>) {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, complaints, logout } = useOfficial();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pending = complaints.filter((c) => c.status === 'Pending').length;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Dynamic unified header layout */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => setSidebarOpen(true)} className="p-2 -ml-2 mr-2">
            <Ionicons name="menu" size={26} color="#0A2A43" />
          </Pressable>
          <Image
            source={require('@/assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View className="ml-2">
            <Text className="text-sm font-extrabold text-blue-900 leading-tight tracking-wider uppercase">
              SEVA SETU
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {profile.locality || 'Malvan Municipal Council'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Pressable onPress={() => router.push('/(admin)/announcements' as any)} className="p-2 mr-2 bg-slate-50 rounded-full relative">
            <Ionicons name="notifications-outline" size={20} color="#0A2A43" />
            <View style={styles.unreadDot} />
          </Pressable>

          <ProfileDropdown
            name={profile.name}
            initial={profile.avatarInitial}
            language={profile.language}
            onLogout={handleLogout}
          />
        </View>
      </View>

      {/* Children Content */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Shared Sidebar Component */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        wardComplaintsCount={pending}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 32,
    height: 32,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
