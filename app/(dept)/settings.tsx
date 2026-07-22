import SharedSettings from '@/components/common/SharedSettings';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { useDepartment } from '@/providers/department-provider';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

// Department portal uses the shared settings component.
// Notifications are basic toggles; the role-specific help page
// is the dept-specific FAQ at /(dept)/help.

export default function DepartmentSettings() {
  const router = useRouter();
  const { logout } = useDepartment();

  // Department provider does not yet have a preferences sub-object,
  // so we keep it lightweight (no notification toggles for now).
  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/department-login' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Logout from Department Portal?')) void doLogout();
      return;
    }
    Alert.alert('Logout', 'Sign out of the Department Officer Portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <DepartmentScreen title="Settings" back>
      <SharedSettings
        theme="light"
        onThemeChange={() => {}}
        helpRoute="/(dept)/help"
        privacyRoute="/(official)/settings/privacy-policy"
        termsRoute="/(official)/settings/terms"
        aboutRoute="/(official)/settings/about"
        onNavigate={(route) => router.push(route as any)}
        onLogout={handleLogout}
      />
    </DepartmentScreen>
  );
}
