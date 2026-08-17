import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';
import '../global.css';
import { CitizenProvider } from '@/providers/citizen-provider';
import { DepartmentProvider } from '@/providers/department-provider';
import { LocalizationProvider } from '@/providers/localization-provider';
import { OfficialProvider } from '@/providers/official-provider';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/** A recoverable fallback for a route render failure. */
export function ErrorBoundary({ retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.errorScreen}>
      <Text style={styles.errorTitle}>Unable to open this screen</Text>
      <Text style={styles.errorText}>Please try again. Your account and saved work are safe.</Text>
      <Pressable onPress={retry} style={styles.retryButton} accessibilityRole="button">
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}
export default function RootLayout() {
  const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F8FAFC', card: '#FFFFFF' } };

  useEffect(() => {
    // Proactively ping the backend root to start container spin-up (pre-warming)
    const apiurl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
    if (apiurl) {
      fetch(apiurl).catch((err) => {
        console.log('Pre-warming fetch failed (expected if backend was cold):', err);
      });
    }
  }, []);

  return <NavigationThemeProvider value={theme}><LocalizationProvider><CitizenProvider><OfficialProvider><DepartmentProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}><Stack.Screen name="(auth)" options={{ animation: 'none' }} /><Stack.Screen name="(citizen)" /><Stack.Screen name="(official)" /><Stack.Screen name="(admin)" /><Stack.Screen name="(dept)" /></Stack><StatusBar style="dark" /></DepartmentProvider></OfficialProvider></CitizenProvider></LocalizationProvider></NavigationThemeProvider>;
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  errorTitle: { color: '#102A43', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  errorText: { color: '#52606D', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  retryButton: { marginTop: 20, backgroundColor: '#0B4F8A', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
