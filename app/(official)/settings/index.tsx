import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  route?: string;
  isRed?: boolean;
}

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { profile, logout, preferences, savePreferences } = useOfficial();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const SettingsRow = ({ icon, label, value, route, isRed = false }: SettingsRowProps) => {
    const handlePress = () => {
      if (route) {
        router.push(route as any);
      }
    };

    return (
      <Pressable onPress={handlePress} style={styles.row}>
        <View style={styles.rowLeft}>
          <View style={[styles.iconBg, { backgroundColor: isRed ? '#FEF2F2' : '#EFF6FF' }]}>
            <Ionicons name={icon} size={18} color={isRed ? '#DC2626' : '#1E6FD9'} />
          </View>
          <Text style={[styles.rowLabel, isRed && { color: '#DC2626', fontWeight: '700' }]}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
          {value ? <Text style={styles.rowValue}>{value}</Text> : <Ionicons name="chevron-forward" size={16} color="#94A3B8" />}
        </View>
      </Pressable>
    );
  };

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.push('/(official)/dashboard')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerAvatarInitial}>
          <Text style={styles.headerAvatarInitialText}>{profile.avatarInitial}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Preferences & notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Ionicons name="clipboard-pulse-outline" size={18} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Complaint updates</Text>
            </View>
            <Switch value={preferences.complaintUpdates} onValueChange={() => toggle('complaintUpdates')} trackColor={{ true: COLORS.accent, false: COLORS.border }} thumbColor={COLORS.white} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Ionicons name="bullhorn-outline" size={18} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Council announcements</Text>
            </View>
            <Switch value={preferences.announcements} onValueChange={() => toggle('announcements')} trackColor={{ true: COLORS.accent, false: COLORS.border }} thumbColor={COLORS.white} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Ionicons name="message-text-outline" size={18} color={COLORS.primary} />
              <Text style={styles.rowLabel}>SMS alerts</Text>
            </View>
            <Switch value={preferences.smsAlerts} onValueChange={() => toggle('smsAlerts')} trackColor={{ true: COLORS.accent, false: COLORS.border }} thumbColor={COLORS.white} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>App menu</Text>
        <View style={styles.card}>
          <SettingsRow icon="settings-outline" label="Preferences" route="/(official)/settings/preferences" />
          <SettingsRow icon="notifications-outline" label="Notifications" route="/(official)/settings/notifications" />
          <SettingsRow icon="eye-outline" label="Appearance" route="/(official)/settings/appearance" />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy & permissions" route="/(official)/settings/privacy" />
          <SettingsRow icon="lock-closed-outline" label="Security" route="/(official)/settings/security" />
        </View>

        <Text style={styles.sectionTitle}>Support & help</Text>
        <View style={styles.card}>
          <SettingsRow icon="help-circle-outline" label="Help & FAQs" route="/(official)/settings/faqs" />
          <SettingsRow icon="document-text-outline" label="Privacy policy" route="/(official)/settings/privacy-policy" />
          <SettingsRow icon="ribbon-outline" label="Terms & conditions" route="/(official)/settings/terms" />
          <SettingsRow icon="information-circle-outline" label="About Seva Setu" route="/(official)/settings/about" />
          <SettingsRow icon="phone-portrait-outline" label="App version" value="1.0.0" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBar: { height: 58, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, ...SHADOWS.sm },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  headerAvatarInitial: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F2994A', justifyContent: 'center', alignItems: 'center' },
  headerAvatarInitialText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  logoutBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 16, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18, ...SHADOWS.sm },
  logoutBtnText: { color: '#DC2626', fontWeight: '800', fontSize: 15, marginLeft: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginLeft: 4, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(226,232,240,0.95)', overflow: 'hidden', marginBottom: 12, ...SHADOWS.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginLeft: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 13, color: COLORS.textMuted, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  toggleTextWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
});
