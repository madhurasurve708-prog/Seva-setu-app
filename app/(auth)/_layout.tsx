import { Stack } from 'expo-router';


export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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