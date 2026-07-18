import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useCitizen } from '@/providers/citizen-provider';
import { COLORS } from '@/constants/theme';

export default function CitizenLayout() {
  const { ready, profile } = useCitizen();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return <Redirect href="/role-selection" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
