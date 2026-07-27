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
      <Stack.Screen name="complaints" />
      <Stack.Screen name="complaint-details" />
      <Stack.Screen name="add-note" />
      <Stack.Screen name="escalate" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="analytics" />
      {/* settings index + all sub-pages registered explicitly */}
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/faqs" />
      <Stack.Screen name="settings/privacy-policy" />
      <Stack.Screen name="settings/terms" />
      <Stack.Screen name="settings/about" />
      <Stack.Screen name="settings/appearance" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/preferences" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/security" />
    </Stack>
  );
}
