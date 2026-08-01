import LanguageToggle from '@/components/common/LanguageToggle';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TAB_DEFS = [
  ['dashboard',     'home-variant-outline',   'home-variant',    'dashboard'],
  ['complaints',    'clipboard-text-outline', 'clipboard-text',  'complaintsTitle'],
  ['announcements', 'bullhorn-outline',       'bullhorn',        'noticesTab'],
  ['analytics',     'chart-bar',              'chart-bar',       'analytics'],
  ['profile',       'account-outline',        'account',         'profile'],
] as const;

type TabRoute = typeof TAB_DEFS[number][0];

function TabButton({
  route,
  icon,
  iconActive,
  labelKey,
  active,
  onPress,
}: {
  route: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
  active: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 14, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
  };

  lift.value = withTiming(active ? -3 : 0, { duration: 200 });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: 'rgba(46,134,222,0.12)', borderless: true, radius: 26 }}
      style={styles.tabButton}
      hitSlop={4}
    >
      <Animated.View style={[styles.tabInner, animatedStyle]}>
        <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
          <MaterialCommunityIcons
            name={active ? iconActive : icon}
            size={18}
            color={active ? COLORS.white : COLORS.textMuted}
          />
        </View>
        <Text style={[styles.tabText, active && styles.tabActive]} numberOfLines={1}>
          {t(labelKey)}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function DepartmentScreen({
  title,
  tab,
  back,
  children,
}: PropsWithChildren<{ title: string; tab?: string; back?: boolean }>) {
  const router = useRouter() as any;
  const pathname = usePathname();
  const { profile, complaints } = useDepartment();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const pendingCount = complaints.filter(
    (c) => c.assignedDepartment === profile?.department && c.status === 'Pending' && !c.is_deleted,
  ).length;

  return (
    <View style={styles.root}>
      {/* ── Top bar ── */}
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          {back && (
            <Pressable
              onPress={() => {
                const cleanPath = pathname.replace(/\/$/, '');
                if (cleanPath.endsWith('/settings')) {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(dept)/profile');
                  }
                } else if (
                  cleanPath.endsWith('/help') ||
                  cleanPath.endsWith('/privacy-policy') ||
                  cleanPath.endsWith('/terms') ||
                  cleanPath.endsWith('/about')
                ) {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(dept)/settings');
                  }
                } else if (
                  cleanPath.endsWith('/complaint-details') ||
                  cleanPath.endsWith('/notification')
                ) {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(dept)/dashboard');
                  }
                } else {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(dept)/dashboard');
                  }
                }
              }}
              style={styles.headButton}
              hitSlop={8}
            >
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
      <View style={[styles.body, !back && { paddingBottom: 84 }]}>{children}</View>

      {/* ── Bottom nav (only when not a back-stack screen) ── */}
      {!back && (
        <View pointerEvents="box-none" style={[styles.navWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.navBar}>
            {TAB_DEFS.map(([route, icon, iconActive, labelKey]) => {
              const active = tab === route;
              return (
                <TabButton
                  key={route}
                  route={route}
                  icon={icon}
                  iconActive={iconActive}
                  labelKey={labelKey}
                  active={active}
                  onPress={() => {
                    if (!active) router.replace(`/(dept)/${route}` as never);
                  }}
                />
              );
            })}
          </View>
        </View>
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

  /* Bottom nav floating */
  navWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 99,
  },
  navBar: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...SHADOWS.xl,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrap: {
    width: 30,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.button,
  },
  tabText: {
    fontSize: 8.8,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  tabActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
