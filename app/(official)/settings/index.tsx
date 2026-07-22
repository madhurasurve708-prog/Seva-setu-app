import SharedSettings from '@/components/common/SharedSettings';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { useOfficial } from '@/providers/official-provider';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

export default function OfficialSettingsScreen() {
  const router = useRouter();
  const { preferences, savePreferences, logout } = useOfficial();

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    void savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Logout?')) void doLogout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <OfficialScreen title="Settings" showBack>
      <SharedSettings
        theme={preferences.theme}
        onThemeChange={(mode) => void savePreferences({ ...preferences, theme: mode })}
        toggleRows={[
          {
            key: 'complaintUpdates',
            label: 'Complaint updates',
            icon: 'clipboard-pulse-outline',
            value: preferences.complaintUpdates,
            onChange: () => toggle('complaintUpdates'),
          },
          {
            key: 'announcements',
            label: 'Council announcements',
            icon: 'bullhorn-outline',
            value: preferences.announcements,
            onChange: () => toggle('announcements'),
          },
          {
            key: 'smsAlerts',
            label: 'SMS alerts',
            icon: 'message-text-outline',
            value: preferences.smsAlerts,
            onChange: () => toggle('smsAlerts'),
          },
        ]}
        helpRoute="/(official)/settings/faqs"
        privacyRoute="/(official)/settings/privacy-policy"
        termsRoute="/(official)/settings/terms"
        aboutRoute="/(official)/settings/about"
        onNavigate={(route) => router.push(route as any)}
        onLogout={handleLogout}
      />
    </OfficialScreen>
  );
}
