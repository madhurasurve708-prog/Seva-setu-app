import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import SharedSettings from '@/components/common/SharedSettings';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

export default function CitizenSettingsScreen() {
  const router = useRouter();
  const { preferences, savePreferences, logout } = useCitizen();
  const { t } = useTranslation();

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(t('logoutCitizenConfirmation'))) void doLogout();
      return;
    }
    Alert.alert(t('logout'), t('logoutConfirmation'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <CitizenScreen title={t('settings')} showBack hideNav>
      <SharedSettings
        theme={preferences.theme}
        onThemeChange={(mode) => savePreferences({ ...preferences, theme: mode })}
        toggleRows={[
          {
            key: 'complaintUpdates',
            label: t('complaintUpdates'),
            icon: 'clipboard-pulse-outline',
            value: preferences.complaintUpdates,
            onChange: () => toggle('complaintUpdates'),
          },
          {
            key: 'announcements',
            label: t('councilAnnouncements'),
            icon: 'bullhorn-outline',
            value: preferences.announcements,
            onChange: () => toggle('announcements'),
          },
          {
            key: 'smsAlerts',
            label: t('smsAlerts'),
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
    </CitizenScreen>
  );
}
