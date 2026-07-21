import { COLORS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function OfficialLayout() {
  const { ready, isAuthenticated, profile } = useOfficial();

  if (!ready) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  // Allow all official roles: nagarsevak, department-officer, nagaradhyaksha, main-admin
  const OFFICIAL_ROLES = ['nagarsevak', 'department-officer', 'nagaradhyaksha', 'main-admin'];
  if (!isAuthenticated || !OFFICIAL_ROLES.includes(profile.role)) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
