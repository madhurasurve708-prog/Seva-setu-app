import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function AppearanceScreen() {
  const router = useRouter();

  const [activeTheme, setActiveTheme] = useState<'Light' | 'Dark' | 'System'>('Light');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#0A2A43" />
        </Pressable>
        <View>
          <Text className="text-lg font-extrabold text-slate-800 leading-tight">Appearance</Text>
          <Text className="text-xs text-slate-400 font-bold">Customize color themes and accessibility options</Text>
        </View>
      </View>

      <View className="p-4">
        {/* Theme Selection */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <Text className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-wider">Select Theme</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Toggle between light mode, dark mode, or follow system default settings.
          </Text>

          <View className="flex-row gap-3">
            {(['Light', 'Dark', 'System'] as const).map((t) => {
              const isSelected = activeTheme === t;
              let icon: 'sunny-outline' | 'moon-outline' | 'settings-outline' = 'sunny-outline';
              if (t === 'Dark') icon = 'moon-outline';
              if (t === 'System') icon = 'settings-outline';

              return (
                <Pressable
                  key={t}
                  onPress={() => setActiveTheme(t)}
                  style={[
                    styles.themeBox,
                    isSelected && styles.activeThemeBox,
                  ]}
                  className="flex-1 active:scale-95"
                >
                  <Ionicons name={icon} size={22} color={isSelected ? '#1E6FD9' : '#5B6472'} />
                  <Text
                    style={[
                      styles.themeText,
                      isSelected && styles.activeThemeText,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Accessibility Features */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Accessibility</Text>

          {/* High Contrast */}
          <View className="flex-row items-center justify-between py-2 border-b border-slate-50">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">High Contrast Mode</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Increases text contrast for better legibility.</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          {/* Reduce Motion */}
          <View className="flex-row items-center justify-between py-2 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Reduce Motion</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Disables slide-in animations and transitions.</Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  themeBox: {
    borderWidth: 1,
    borderColor: '#E7ECF2',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeThemeBox: {
    borderColor: '#1E6FD9',
    backgroundColor: '#EFF6FF',
  },
  themeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B6472',
    marginTop: 6,
  },
  activeThemeText: {
    color: '#1E6FD9',
  },
});
