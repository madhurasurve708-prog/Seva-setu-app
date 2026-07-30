import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#071A2D' : '#F8FAFC' },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="citizen-login" />
      <Stack.Screen name="nagarsevak-login" />
      <Stack.Screen name="department-login" />
      <Stack.Screen name="department-credentials" />
      <Stack.Screen name="admin-login" />
    </Stack>
  );
}