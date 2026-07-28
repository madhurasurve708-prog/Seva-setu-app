import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Alert, Platform, Pressable, ScrollView,
    StyleSheet, Text, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import GlassCard from '@/components/common/GlassCard';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function AdminProfile() {
  const router = useRouter();
  const { profile, logout } = useOfficial();

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

  const INFO_ROWS = [
    { icon: 'phone-outline'           as const, label: 'Mobile Number', value: profile.phone },
    { icon: 'account-outline'         as const, label: 'Username',       value: profile.username },
    { icon: 'office-building-outline' as const, label: 'Department',     value: profile.department },
    { icon: 'badge-account-outline'   as const, label: 'Designation',    value: profile.designation },
    { icon: 'map-marker-outline'      as const, label: 'Ward Access',    value: profile.ward },
    { icon: 'email-outline'           as const, label: 'Email',          value: profile.email },
  ];

  // Admin tools — complaint-explorer removed, replaced by dedicated screens
  const ADMIN_TOOLS = [
    { icon: 'map-outline'              as const, label: 'Ward Wise',       route: '/(admin)/ward-wise'       },
    { icon: 'layers-outline'           as const, label: 'Category Wise',   route: '/(admin)/category-wise'   },
    { icon: 'domain'                   as const, label: 'Department Wise', route: '/(admin)/department-wise' },
    { icon: 'trophy-outline'           as const, label: 'Best Wards',      route: '/(admin)/best-wards'      },
    { icon: 'chart-bar'                as const, label: 'Reports',         route: '/(admin)/reports'         },
    { icon: 'chart-donut'              as const, label: 'Analytics',       route: '/(admin)/analytics'       },
    { icon: 'shield-account-outline'   as const, label: 'Departments',     route: '/(admin)/departments'     },
    { icon: 'account-group-outline'    as const, label: 'Citizens',        route: '/(admin)/people'          },
    { icon: 'information-outline'     as const, label: 'About Seva Setu',  route: '/(admin)/about'           },
    { icon: 'cog-outline'              as const, label: 'Settings',        route: '/(admin)/settings'        },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header — no back button since this is a tab screen */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* ── Profile hero card ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(0)}>
          <LinearGradient colors={['#0B4F8A', '#2E86DE']} style={styles.profileHero}>
            <View style={styles.heroCircle} />
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{profile.avatarInitial}</Text>
            </View>
            <Text style={styles.heroName}>{profile.name}</Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name="shield-crown-outline" size={12} color="#4FC3F7" />
              <Text style={styles.roleText}>{profile.roleLabel}</Text>
            </View>
            <Text style={styles.heroOrg}>{profile.locality || 'Malvan Municipal Council'}</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Info card ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(60)}>
          <GlassCard style={styles.infoCard}>
            {INFO_ROWS.map((row, idx) => (
              <View
                key={row.label}
                style={[styles.infoRow, idx === INFO_ROWS.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.infoLeft}>
                  <View style={styles.infoIcon}>
                    <MaterialCommunityIcons name={row.icon} size={14} color={COLORS.primary} />
                  </View>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>{row.value || '—'}</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* ── Edit profile ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(100)}>
          <Pressable
            onPress={() => router.push('/(official)/profile' as any)}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.88 }]}
          >
            <LinearGradient colors={['#0B4F8A', '#2E86DE']} style={styles.editBtnGrad}>
              <MaterialCommunityIcons name="account-edit-outline" size={18} color="#fff" />
              <Text style={styles.editBtnText}>Edit Profile &amp; Change Password</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── Admin tools ── */}
        <Animated.View entering={FadeInDown.duration(360).delay(140)}>
          <Text style={styles.toolsHeading}>Admin Tools</Text>
          <GlassCard style={styles.toolsCard}>
            {ADMIN_TOOLS.map((tool, idx) => (
              <Pressable
                key={tool.label}
                onPress={() => router.push(tool.route as any)}
                style={({ pressed }) => [
                  styles.toolRow,
                  idx === ADMIN_TOOLS.length - 1 && { borderBottomWidth: 0 },
                  pressed && styles.toolRowPressed,
                ]}
              >
                <View style={styles.toolIcon}>
                  <MaterialCommunityIcons name={tool.icon} size={17} color={COLORS.primary} />
                </View>
                <Text style={styles.toolLabel}>{tool.label}</Text>
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
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },

  content: { padding: 16, paddingBottom: 44, gap: 14 },

  /* Profile hero */
  profileHero: {
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 6,
    overflow: 'hidden', ...SHADOWS.medium,
  },
  heroCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 4, ...SHADOWS.medium,
  },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '900' },
  heroName: { fontSize: 20, fontWeight: '900', color: '#fff' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(79,195,247,0.18)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.35)',
  },
  roleText: { fontSize: 11, fontWeight: '800', color: '#4FC3F7' },
  heroOrg: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

  /* Info card */
  infoCard: { padding: 0, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, flex: 1, textAlign: 'right' },

  /* Edit btn */
  editBtn: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.button },
  editBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  editBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  /* Tools */
  toolsHeading: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: -2 },
  toolsCard: { padding: 0, overflow: 'hidden' },
  toolRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  toolRowPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  toolIcon: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  toolLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, minHeight: 52, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: COLORS.danger },
});
