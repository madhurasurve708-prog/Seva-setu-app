import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import SharedSettings from '@/components/common/SharedSettings';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';
import React, { memo, useCallback } from 'react';

const CitizenSettingsScreen = memo(function CitizenSettingsScreen() {
  const router = useRouter();
  const { preferences, savePreferences, logout } = useCitizen();
  const { t } = useTranslation();

  const toggle = useCallback((key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    savePreferences({ ...preferences, [key]: !preferences[key] });
  }, [preferences, savePreferences]);

  const doLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  }, [logout, router]);

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(t('logoutCitizenConfirmation'))) void doLogout();
      return;
    }
    Alert.alert(t('logout'), t('logoutConfirmation'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => void doLogout() },
    ]);
  }, [doLogout, t]);

  const handleNavigate = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  return (
    <CitizenScreen title={t('settings')} showBack hideNav>
      <SharedSettings
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
        helpRoute="/(citizen)/help"
        privacyRoute="/(citizen)/privacy-policy"
        termsRoute="/(citizen)/terms-conditions"
        aboutRoute="/(citizen)/about"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </CitizenScreen>
  );
});

export default CitizenSettingsScreen;
