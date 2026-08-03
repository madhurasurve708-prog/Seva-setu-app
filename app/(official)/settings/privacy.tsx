import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { GlassCard } from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';

const PERMISSIONS = [
  {
    key: 'location',
    label: 'Location Access',
    sub: 'Use GPS to determine complaint locations on maps.',
    icon: 'map-marker-outline' as const,
    defaultValue: true,
  },
  {
    key: 'camera',
    label: 'Camera Access',
    sub: 'Capture photos to upload as verification for resolved grievances.',
    icon: 'camera-outline' as const,
    defaultValue: true,
  },
  {
    key: 'gallery',
    label: 'Photo Library',
    sub: 'Select existing photos from device gallery to attach to updates.',
    icon: 'image-outline' as const,
    defaultValue: true,
  },
];

export default function PrivacyScreen() {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS.map((p) => [p.key, p.defaultValue])),
  );

  const toggle = (key: string) =>
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <OfficialScreen title="Privacy & Permissions" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shield-check-outline" size={17} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Device Permissions</Text>
        </View>
        <GlassCard style={styles.card}>
          {PERMISSIONS.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.row,
                idx === PERMISSIONS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={17}
                    color={COLORS.primaryLight}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
              </View>
              <Switch
                value={values[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ true: COLORS.accent, false: COLORS.border }}
                thumbColor={Platform.OS === 'android' ? COLORS.white : undefined}
              />
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </OfficialScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  rowSub: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted, marginTop: 2, lineHeight: 16 },
});
