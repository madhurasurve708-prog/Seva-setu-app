import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import GlassCard from '@/components/common/GlassCard';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { DEPT_META } from '@/data/department-routing';
import { useDepartment } from '@/providers/department-provider';

export default function DepartmentProfile() {
  const router = useRouter();
  const { profile, logout } = useDepartment();

  const meta = DEPT_META[profile?.department ?? ''];

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/department-login');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Sign out of Department Portal?')) {
        void doLogout();
      }
      return;
    }
    Alert.alert('Log out', 'Sign out of the Department Officer Portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  const infoRows: { label: string; value: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
    {
      label: 'Department',
      value: profile?.department ?? '—',
      icon: (meta?.icon ?? 'office-building-outline') as any,
    },
    { label: 'Role',        value: 'Department Officer',  icon: 'shield-account-outline' },
    { label: 'Phone',       value: profile?.phone ?? '—', icon: 'phone-outline' },
    { label: 'Email',       value: profile?.email ?? '—', icon: 'email-outline' },
    { label: 'Employee ID', value: profile?.employeeId ?? '—', icon: 'card-account-details-outline' },
  ];

  const menuItems: {
    label: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    onPress: () => void;
  }[] = [
    { label: 'Settings', icon: 'cog-outline',           onPress: () => router.push('/(dept)/settings') },
    { label: 'Help & FAQs', icon: 'help-circle-outline', onPress: () => router.push('/(dept)/help') },
    { label: 'Privacy Policy', icon: 'file-document-outline', onPress: () => router.push('/(official)/settings/privacy-policy') },
    { label: 'Terms & Conditions', icon: 'handshake-outline', onPress: () => router.push('/(official)/settings/terms') },
    { label: 'About Seva Setu', icon: 'information-outline',  onPress: () => router.push('/(official)/settings/about') },
  ];

  return (
    <DepartmentScreen title="My Profile" tab="profile">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* ── Avatar card ── */}
        <Animated.View entering={FadeInDown.duration(360)}>
          <GlassCard style={styles.heroCard}>
            <View style={[styles.avatarCircle, { backgroundColor: meta?.color ?? COLORS.primary }]}>
              <Text style={styles.avatarInitial}>
                {profile?.avatarInitial ?? '?'}
              </Text>
            </View>
            <Text style={styles.heroName}>{profile?.name ?? 'Officer'}</Text>
            <Text style={styles.heroRole}>Department Officer</Text>

            {/* Dept badge */}
            <View style={[styles.deptBadge, { backgroundColor: meta?.bg ?? '#EFF6FF' }]}>
              <MaterialCommunityIcons
                name={(meta?.icon ?? 'office-building-outline') as any}
                size={13}
                color={meta?.color ?? COLORS.primary}
              />
              <Text style={[styles.deptBadgeText, { color: meta?.color ?? COLORS.primary }]}>
                {meta?.english ?? profile?.department}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ── Info rows ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(60)}>
          <GlassCard style={styles.infoCard}>
            {infoRows.map((row, idx) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  idx === infoRows.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.infoIconCircle}>
                  <MaterialCommunityIcons name={row.icon} size={15} color={COLORS.primary} />
                </View>
                <View style={styles.infoBody}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* ── Menu ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(120)}>
          <GlassCard style={styles.menuCard}>
            {menuItems.map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.menuRow,
                  idx === menuItems.length - 1 && { borderBottomWidth: 0 },
                  pressed && styles.menuRowPressed,
                ]}
              >
                <View style={styles.menuIconCircle}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
              </Pressable>
            ))}
          </GlassCard>
        </Animated.View>

        {/* ── Logout ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(180)}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          >
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </DepartmentScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },

  /* Hero */
  heroCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...SHADOWS.medium,
  },
  avatarInitial: { color: COLORS.white, fontSize: 28, fontWeight: '900' },
  heroName: { fontSize: 19, fontWeight: '900', color: COLORS.text },
  heroRole: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 4,
  },
  deptBadgeText: { fontSize: 12, fontWeight: '800' },

  /* Info rows */
  infoCard: { padding: 4 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 10.5, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  infoValue: { fontSize: 13.5, fontWeight: '700', color: COLORS.text, marginTop: 2 },

  /* Menu */
  menuCard: { padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuRowPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },

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
    backgroundColor: 'rgba(239,68,68,0.07)',
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: COLORS.danger },
});
