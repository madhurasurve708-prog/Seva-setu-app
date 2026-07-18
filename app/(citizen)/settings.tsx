// app/(citizen)/settings.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View, Platform } from 'react-native';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { useCitizen } from '@/providers/citizen-provider';
import { COLORS, SHADOWS } from '../../constants/theme';
import GlassCard from '@/components/common/GlassCard';

export default function Settings() {
  const { preferences, savePreferences } = useCitizen();

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <CitizenScreen title="Settings" showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Section title="Appearance" icon="eye-outline">
          <View style={styles.segmentedControl}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const active = preferences.theme === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => savePreferences({ ...preferences, theme: mode })}
                  style={[styles.segment, active && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Preferences & Notifications" icon="bell-outline">
          <ToggleRow
            label="Complaint updates"
            value={preferences.complaintUpdates}
            onChange={() => toggle('complaintUpdates')}
            icon="clipboard-pulse-outline"
          />
          <ToggleRow
            label="Council announcements"
            value={preferences.announcements}
            onChange={() => toggle('announcements')}
            icon="bullhorn-outline"
          />
          <ToggleRow
            label="SMS alerts"
            value={preferences.smsAlerts}
            onChange={() => toggle('smsAlerts')}
            icon="message-text-outline"
          />
        </Section>

        <Section title="Privacy & Permissions" icon="shield-check-outline">
          <ActionRow label="Camera Access" icon="camera-outline" />
          <ActionRow label="Photo Gallery" icon="image-outline" />
          <ActionRow label="Location Services" icon="map-marker-radius-outline" />
        </Section>

        <Section title="Security" icon="lock-open-outline">
          <ActionRow label="Update Mobile Number" icon="cellphone-cog" />
          <ActionRow label="Log out from all devices" icon="logout-variant" isDestructive />
        </Section>

        <Section title="Support & Help" icon="help-circle-outline">
          <ActionRow label="Council Grievance Help Center" icon="information-outline" />
          <ActionRow label="Contact Municipality Office" icon="phone-classic" />
          <ActionRow label="Report technical bug" icon="bug-outline" />
        </Section>
      </ScrollView>
    </CitizenScreen>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <GlassCard style={styles.card}>{children}</GlassCard>
    </View>
  );
}

function ToggleRow({ label, value, onChange, icon }: { label: string; value: boolean; onChange: () => void; icon: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeftCol}>
        <View style={styles.rowIconCircle}>
          <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
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

function ActionRow({
  label,
  value,
  icon,
  hideChevron,
  isDestructive,
}: {
  label: string;
  value?: string;
  icon: string;
  hideChevron?: boolean;
  isDestructive?: boolean;
}) {
  const triggerAlert = () => {
    if (value) return;
    Alert.alert(label, 'This preference flow is handled on the native device settings.');
  };

  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={triggerAlert}>
      <View style={styles.rowLeftCol}>
        <View style={[styles.rowIconCircle, isDestructive && styles.destructiveIconCircle]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={isDestructive ? COLORS.danger : COLORS.primaryLight}
          />
        </View>
        <Text style={[styles.rowText, isDestructive && styles.destructiveText]}>{label}</Text>
      </View>
      <View style={styles.rowRightCol}>
        {value ? (
          <Text style={styles.rowValue}>{value}</Text>
        ) : !hideChevron ? (
          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 },
  sectionContainer: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 14.5, fontWeight: '800', color: COLORS.primary },
  card: { padding: 0, overflow: 'hidden' },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, margin: 10, gap: 4 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.white, ...SHADOWS.soft },
  segmentText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  segmentTextActive: { color: COLORS.accent, fontWeight: '700' },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowPressed: { backgroundColor: 'rgba(15, 23, 42, 0.03)' },
  rowLeftCol: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIconCircle: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  destructiveIconCircle: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  rowText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  destructiveText: { color: COLORS.danger },
  rowRightCol: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, color: COLORS.textMuted, fontWeight: '700' },
});