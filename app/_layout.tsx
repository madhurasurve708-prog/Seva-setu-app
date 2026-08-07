import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';
import '../global.css';
import { CitizenProvider } from '@/providers/citizen-provider';
import { DepartmentProvider } from '@/providers/department-provider';
import { LocalizationProvider } from '@/providers/localization-provider';
import { OfficialProvider } from '@/providers/official-provider';
export default function RootLayout() {
  const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F8FAFC', card: '#FFFFFF' } };
  return <NavigationThemeProvider value={theme}><LocalizationProvider><CitizenProvider><OfficialProvider><DepartmentProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}><Stack.Screen name="(auth)" options={{ animation: 'none' }} /><Stack.Screen name="(citizen)" /><Stack.Screen name="(official)" /><Stack.Screen name="(admin)" /><Stack.Screen name="(dept)" /></Stack><StatusBar style="dark" /></DepartmentProvider></OfficialProvider></CitizenProvider></LocalizationProvider></NavigationThemeProvider>;
}