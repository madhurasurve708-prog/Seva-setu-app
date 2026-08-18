import React, { memo, useCallback } from 'react';
import SharedSettings from '@/components/common/SharedSettings';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

const DepartmentSettings = memo(function DepartmentSettings() {
  const router = useRouter();
  const { logout } = useDepartment();
  const { t } = useTranslation();

  const doLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  }, [logout, router]);

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(t('logoutDepartmentConfirmation'))) void doLogout();
      return;
    }
    Alert.alert(t('logout'), t('logoutDepartmentConfirmation'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => void doLogout() },
    ]);
  }, [doLogout, t]);

  const handleNavigate = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  return (
    <DepartmentScreen title={t('settings')} back>
      <SharedSettings
        helpRoute="/(dept)/help"
        privacyRoute="/(dept)/privacy-policy"
        termsRoute="/(dept)/terms"
        aboutRoute="/(dept)/about"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </DepartmentScreen>
  );
});

export default DepartmentSettings;
