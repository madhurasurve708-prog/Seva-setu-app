import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function OfficialLayout() {
  const { ready, isAuthenticated, profile } = useOfficial();

  if (!ready) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!isAuthenticated || profile.role !== 'nagarsevak') {
    return <Redirect href="/(auth)/role-selection" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
