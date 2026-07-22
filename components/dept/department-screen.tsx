import { COLORS, SHADOWS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = [
  ['dashboard',     'home-variant-outline',    'Dashboard'],
  ['complaints',    'clipboard-text-outline',  'Complaints'],
  ['announcements', 'bullhorn-outline',        'Notices'],
  ['analytics',     'chart-bar',               'Analytics'],
  ['profile',       'account-outline',         'Profile'],
] as const;

type TabRoute = typeof TABS[number][0];

export function DepartmentScreen({
  title,
  tab,
  back,
  children,
}: PropsWithChildren<{ title: string; tab?: string; back?: boolean }>) {
  const router = useRouter() as any;
  const { profile } = useDepartment();

  return (
    <View style={styles.root}>
      {/* ── Top bar ── */}
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          {back ? (
            <Pressable onPress={() => router.back()} style={styles.headButton} hitSlop={8}>
              <MaterialCommunityIcons name="arrow-left" size={23} color={COLORS.white} />
            </Pressable>
          ) : (
            <View style={styles.headButton} />
          )}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Pressable onPress={() => router.push('/(dept)/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.avatarInitial ?? 'D'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <View style={styles.body}>{children}</View>

      {/* ── Bottom nav (only when not a back-stack screen) ── */}
      {!back && (
        <SafeAreaView edges={['bottom']} style={styles.nav}>
          <View style={styles.navRow}>
            {TABS.map(([route, icon, label]) => {
              const active = tab === route;
              return (
                <Pressable
                  key={route}
                  onPress={() => router.replace(`/(dept)/${route}` as never)}
                  style={styles.tab}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={22}
                    color={active ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text
                    style={[styles.tabText, active && styles.tabActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  safe: { backgroundColor: COLORS.primary },
  header: {
    height: 58,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
  },
  headButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

  /* Body */
  body: { flex: 1 },

  /* Bottom nav */
  nav: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.sm,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  tabText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  tabActive: { color: COLORS.primary, fontWeight: '800' },
});
