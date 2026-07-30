import LanguageToggle from '@/components/common/LanguageToggle';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TAB_DEFS = [
  ['dashboard',     'home-variant-outline',    'dashboard'],
  ['complaints',    'clipboard-text-outline',  'complaintsTitle'],
  ['announcements', 'bullhorn-outline',        'noticesTab'],
  ['analytics',     'chart-bar',               'analytics'],
  ['profile',       'account-outline',         'profile'],
] as const;

type TabRoute = typeof TAB_DEFS[number][0];

export function DepartmentScreen({
  title,
  tab,
  back,
  children,
}: PropsWithChildren<{ title: string; tab?: string; back?: boolean }>) {
  const router = useRouter() as any;
  const { profile, complaints } = useDepartment();
  const { t } = useTranslation();

  const pendingCount = complaints.filter(
    (c) => c.assignedDepartment === profile?.department && c.status === 'Pending' && !c.is_deleted,
  ).length;

  return (
    <View style={styles.root}>
      {/* ── Top bar ── */}
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          {back && (
            <Pressable onPress={() => router.back()} style={styles.headButton} hitSlop={8}>
              <MaterialCommunityIcons name="arrow-left" size={23} color={COLORS.white} />
            </Pressable>
          )}
          <Text style={[styles.title, !back && styles.titleNoBack]} numberOfLines={1}>{title}</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push('/(dept)/notification')} style={styles.notifBtn}>
              <MaterialCommunityIcons name="bell-outline" size={19} color={COLORS.white} />
              {pendingCount > 0 && <View style={styles.notifDot} />}
            </Pressable>
            <LanguageToggle size={34} variant="dark" />
            <Pressable onPress={() => router.push('/(dept)/profile')} style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.avatarInitial ?? 'D'}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <View style={styles.body}>{children}</View>

      {/* ── Bottom nav (only when not a back-stack screen) ── */}
      {!back && (
        <SafeAreaView edges={['bottom']} style={styles.nav}>
          <View style={styles.navRow}>
            {TAB_DEFS.map(([route, icon, labelKey]) => {
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
                    {t(labelKey)}
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
    textAlign: 'left',
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  titleNoBack: {
    marginLeft: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  notifBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexShrink: 0,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
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
