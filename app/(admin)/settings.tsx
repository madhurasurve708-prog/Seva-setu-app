import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert, Platform, Pressable, ScrollView,
    StyleSheet, Switch, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GlassCard from '@/components/common/GlassCard';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function AdminSettings() {
  const router = useRouter();
  const { preferences, savePreferences, logout } = useOfficial();

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    void savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Logout?')) void doLogout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* Appearance */}
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

        {/* Notifications */}
        <Section title="Notifications" icon="bell-outline">
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

        {/* Support */}
        <Section title="Support & Info" icon="help-circle-outline">
          <NavRow label="Help & FAQs"        icon="frequently-asked-questions"  route="/(official)/settings/faqs" />
          <NavRow label="Privacy Policy"     icon="file-document-outline"       route="/(official)/settings/privacy-policy" />
          <NavRow label="Terms & Conditions" icon="handshake-outline"           route="/(official)/settings/terms" />
          <NavRow label="About Seva Setu"    icon="information-outline"         route="/(official)/settings/about" />
          <NavRow label="App Version"        icon="cellphone"                   value="1.0.0" />
        </Section>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.88 }]}
        >
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Reusable sub-components ────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={16} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <GlassCard style={styles.card}>{children}</GlassCard>
    </View>
  );
}

function ToggleRow({
  label, icon, value, onChange,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: boolean;
  onChange: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialCommunityIcons name={icon} size={16} color={COLORS.primaryLight} />
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
  label, icon, value, route,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value?: string;
  route?: string;
}) {
  const router = useRouter();
  const handlePress = () => {
    if (route) router.push(route as any);
  };
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialCommunityIcons name={icon} size={16} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <View>
        {value ? (
          <Text style={styles.rowValue}>{value}</Text>
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },

  content: { padding: 18, paddingBottom: 44 },

  sectionContainer: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    marginBottom: 8, paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

  card: { padding: 0, overflow: 'hidden' },

  segmentedControl: {
    flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12,
    padding: 4, margin: 10, gap: 4,
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.white, ...SHADOWS.soft },
  segmentText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  segmentTextActive: { color: COLORS.accent, fontWeight: '700' },

  row: {
    minHeight: 54, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  rowText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  rowValue: { fontSize: 13, color: COLORS.textMuted, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, minHeight: 52, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: COLORS.danger },
});
