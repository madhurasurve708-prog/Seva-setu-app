import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { GlassCard } from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';

const NOTIFICATION_ITEMS = [
  {
    key: 'complaints',
    label: 'Grievance Assignments',
    sub: 'Alert when a citizen files a complaint in your ward.',
    icon: 'clipboard-alert-outline' as const,
    defaultValue: true,
  },
  {
    key: 'announcements',
    label: 'Council Announcements',
    sub: 'Alert when Main Admin publishes a notice.',
    icon: 'bullhorn-outline' as const,
    defaultValue: true,
  },
  {
    key: 'sms',
    label: 'SMS Alert Broadcasts',
    sub: 'Text notifications for emergency alerts.',
    icon: 'message-text-outline' as const,
    defaultValue: true,
  },
  {
    key: 'email',
    label: 'Weekly Email Summary',
    sub: 'Digest of ward resolution statistics every week.',
    icon: 'email-outline' as const,
    defaultValue: false,
  },
];

export default function NotificationsScreen() {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_ITEMS.map((i) => [i.key, i.defaultValue])),
  );

  const toggle = (key: string) =>
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <OfficialScreen title="Notifications" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="bell-badge-outline" size={17} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>Alert Preferences</Text>
        </View>
        <GlassCard style={styles.card}>
          {NOTIFICATION_ITEMS.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.row,
                idx === NOTIFICATION_ITEMS.length - 1 && { borderBottomWidth: 0 },
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
