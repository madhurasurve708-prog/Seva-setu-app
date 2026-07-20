import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import GlassCard from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, logout, preferences, savePreferences } = useOfficial();

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    void savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you want to logout?')
          : true;
      if (ok) void doLogout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <OfficialScreen title="Settings" showBack backHref="/(official)/dashboard">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* ── Appearance ── */}
        <Section title="Appearance" icon="eye-outline">
          <View style={styles.segmentedControl}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const active = preferences.theme === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => void savePreferences({ ...preferences, theme: mode })}
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

        {/* ── Preferences & Notifications ── */}
        <Section title="Preferences & Notifications" icon="bell-outline">
          <ToggleRow
            label="Complaint updates"
            icon="clipboard-pulse-outline"
            value={preferences.complaintUpdates}
            onChange={() => toggle('complaintUpdates')}
          />
          <ToggleRow
            label="Council announcements"
            icon="bullhorn-outline"
            value={preferences.announcements}
            onChange={() => toggle('announcements')}
          />
          <ToggleRow
            label="SMS alerts"
            icon="message-text-outline"
            value={preferences.smsAlerts}
            onChange={() => toggle('smsAlerts')}
          />
        </Section>

        {/* ── App Menu ── */}
        <Section title="App Menu" icon="menu">
          <NavRow
            label="Preferences"
            icon="tune-variant"
            route="/(official)/settings/preferences"
          />
          <NavRow
            label="Notifications"
            icon="bell-badge-outline"
            route="/(official)/settings/notifications"
          />
          <NavRow
            label="Appearance"
            icon="palette-outline"
            route="/(official)/settings/appearance"
          />
          <NavRow
            label="Privacy & Permissions"
            icon="shield-check-outline"
            route="/(official)/settings/privacy"
          />
          <NavRow
            label="Security"
            icon="lock-outline"
            route="/(official)/settings/security"
          />
        </Section>

        {/* ── Support & Help ── */}
        <Section title="Support & Help" icon="help-circle-outline">
          <NavRow
            label="Help & FAQs"
            icon="frequently-asked-questions"
            route="/(official)/settings/faqs"
          />
          <NavRow
            label="Privacy Policy"
            icon="file-document-outline"
            route="/(official)/settings/privacy-policy"
          />
          <NavRow
            label="Terms & Conditions"
            icon="handshake-outline"
            route="/(official)/settings/terms"
          />
          <NavRow
            label="About Seva Setu"
            icon="information-outline"
            route="/(official)/settings/about"
          />
          <NavRow
            label="App Version"
            icon="cellphone"
            value="1.0.0"
          />
        </Section>

        {/* ── Logout ── */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        >
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </OfficialScreen>
  );
}

/* ── Reusable sub-components — identical pattern to citizen/settings.tsx ── */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={17} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <GlassCard style={styles.card}>{children}</GlassCard>
    </View>
  );
}

function ToggleRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconCircle}>
          <MaterialCommunityIcons name={icon} size={17} color={COLORS.primaryLight} />
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

function NavRow({
  label,
  icon,
  value,
  route,
  isDestructive,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value?: string;
  route?: string;
  isDestructive?: boolean;
}) {
  const router = useRouter();

  const handlePress = () => {
    if (route) router.push(route as any);
    else if (!value) Alert.alert(label, 'This preference is managed in device settings.');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconCircle, isDestructive && styles.destructiveIcon]}>
          <MaterialCommunityIcons
            name={icon}
            size={17}
            color={isDestructive ? COLORS.danger : COLORS.primaryLight}
          />
        </View>
        <Text style={[styles.rowText, isDestructive && styles.destructiveText]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={styles.rowValue}>{value}</Text>
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44 },

  sectionContainer: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  card: { padding: 0, overflow: 'hidden' },

  /* Segmented control */
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    margin: 10,
    gap: 4,
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.white, ...SHADOWS.soft },
  segmentText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  segmentTextActive: { color: COLORS.accent, fontWeight: '700' },

  /* Rows */
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveIcon: { backgroundColor: 'rgba(239,68,68,0.10)' },
  rowText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  destructiveText: { color: COLORS.danger },
  rowValue: { fontSize: 14, color: COLORS.textMuted, fontWeight: '700' },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    marginTop: 4,
  },
  logoutBtnPressed: { opacity: 0.88 },
  logoutText: { fontSize: 15, fontWeight: '800', color: COLORS.danger },
});
