import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import '../global.css';

import { CitizenProvider } from '@/providers/citizen-provider';
import { OfficialProvider } from '@/providers/official-provider';
import { DepartmentProvider } from '@/providers/department-provider';
import { LocalizationProvider } from '@/providers/localization-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const customDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#F8FAFC',
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#071A2D',
    },
  };

  const theme = colorScheme === 'dark' ? customDarkTheme : customDefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <LocalizationProvider>
        <CitizenProvider>
          <OfficialProvider>
            <DepartmentProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === 'dark' ? '#071A2D' : '#F8FAFC' } }}>
              <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
              <Stack.Screen name="(citizen)" />
              <Stack.Screen name="(official)" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="(dept)" />
            </Stack>
            </DepartmentProvider>
            <StatusBar style="auto" />
          </OfficialProvider>
        </CitizenProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
