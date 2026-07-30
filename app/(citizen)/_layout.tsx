import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { useCitizen } from '@/providers/citizen-provider';
import { COLORS } from '@/constants/theme';
import { usePanelBackHandler } from '@/hooks/usePanelBackHandler';

export default function CitizenLayout() {
  const { ready, profile } = useCitizen();
  const colorScheme = useColorScheme();
  
  // Custom hook to handle Android hardware back press navigation and double-press to exit
  usePanelBackHandler('citizen');

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#071A2D' : '#F8FAFC' },
      }}
    />
  );
}
