import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import '../global.css';

import { CitizenProvider } from '@/providers/citizen-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CitizenProvider>
        <Stack screenOptions={{ headerShown: false, animationEnabled: false }}>
          {/* Splash loads first - no animation */}
          <Stack.Screen 
            name="(auth)/splash" 
            options={{ animationEnabled: false }}
          />
          {/* Then role selection */}
          <Stack.Screen 
            name="(auth)/role-selection" 
            options={{ animationEnabled: true }}
          />
          {/* Dashboard */}
          <Stack.Screen 
            name="dashboard" 
            options={{ animationEnabled: true }}
          />
        </Stack>
        <StatusBar style="auto" />
      </CitizenProvider>
    </ThemeProvider>
  );
}
