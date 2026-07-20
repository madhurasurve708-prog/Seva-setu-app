import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import GlassCard from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS, SHADOWS } from '@/constants/theme';

export default function AppearanceScreen() {
  const [activeTheme, setActiveTheme] = useState<'Light' | 'Dark' | 'System'>('Light');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const THEMES = [
    { key: 'Light', icon: 'weather-sunny' as const },
    { key: 'Dark',  icon: 'weather-night' as const },
    { key: 'System', icon: 'cog-outline' as const },
  ] as const;

  return (
    <OfficialScreen title="Appearance" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* Theme selection */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="palette-outline" size={17} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Select Theme</Text>
        </View>
        <GlassCard style={styles.card}>
          <View style={styles.themeRow}>
            {THEMES.map(({ key, icon }) => {
              const active = activeTheme === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setActiveTheme(key as any)}
                  style={[styles.themeBox, active && styles.themeBoxActive]}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={22}
                    color={active ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {/* Accessibility */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="eye-settings-outline" size={17} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Accessibility</Text>
        </View>
        <GlassCard style={styles.card}>
          <ToggleRow
            label="High Contrast Mode"
            sub="Increases text contrast for better legibility."
            value={highContrast}
            onChange={() => setHighContrast((v) => !v)}
          />
          <ToggleRow
            label="Reduce Motion"
            sub="Disables slide-in animations and transitions."
            value={reduceMotion}
            onChange={() => setReduceMotion((v) => !v)}
            isLast
          />
        </GlassCard>
      </ScrollView>
    </OfficialScreen>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  isLast,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: COLORS.accent, false: COLORS.border }}
        thumbColor={Platform.OS === 'android' ? COLORS.white : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  card: { padding: 14, marginBottom: 20 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  themeBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
    ...SHADOWS.soft,
  },
  themeLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  themeLabelActive: { color: COLORS.primary },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  toggleSub: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, marginTop: 2 },
});
