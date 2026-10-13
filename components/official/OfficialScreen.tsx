// components/official/OfficialScreen.tsx
// Shared screen wrapper for ALL official portal roles (Nagarsevak, Department Officer, Nagaradhyaksha).
// Mirrors CitizenScreen exactly — same header height, same primary bar, same avatar style.
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { PropsWithChildren } from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, SHADOWS } from "@/constants/theme";
import { useOfficial } from "@/providers/official-provider";
import { useTranslation } from "@/providers/localization-provider";
import DesktopPortal from '@/components/common/DesktopPortal';

type OfficialScreenProps = PropsWithChildren<{
  title: string;
  showBack?: boolean;
  /** Override the back destination (defaults to router.back()) */
  backHref?: string;
  hideHeader?: boolean;
  /** Right-side action button */
  rightAction?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
  };
  tab?: string;
  hideNav?: boolean;
}>;

const TAB_DEFS = [
  ['dashboard',     'home-variant-outline',   'home-variant',    'dashboard',       '/(official)/dashboard'],
  ['complaints',    'clipboard-text-outline', 'clipboard-text',  'complaintsTitle', '/(official)/complaints'],
  ['analytics',     'chart-bar',              'chart-bar',       'analytics',       '/(official)/analytics'],
  ['profile',       'account-circle-outline', 'account-circle',  'myProfile',       '/(official)/profile'],
  ['settings',      'cog-outline',            'cog',             'settings',        '/(official)/settings'],
] as const;

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

export function OfficialScreen({
  title,
  children,
  showBack = false,
  backHref,
  hideHeader = false,
  rightAction,
  tab,
  hideNav = false,
}: OfficialScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, logout } = useOfficial();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  const handleBack = () => {
    if (backHref) {
      router.push(backHref as any);
    } else {
      router.back();
    }
  };

  const showBottomNav = !showBack && !hideNav;

  if (isDesktop) {
    return (
      <DesktopPortal title={title} initial={profile.avatarInitial} onLogout={() => { void logout().then(() => router.replace('/(auth)/role-selection' as any)); }}
        items={[
          { label: 'Dashboard', route: '/(official)/dashboard', icon: 'view-dashboard-outline' },
          { label: 'Complaints', route: '/(official)/complaints', icon: 'clipboard-text-outline' },
          { label: 'Announcements', route: '/(official)/announcements', icon: 'bullhorn-outline' },
          { label: 'Reports', route: '/(official)/analytics', icon: 'chart-bar' },
          { label: 'Settings', route: '/(official)/settings', icon: 'cog-outline' },
          { label: 'Profile', route: '/(official)/profile', icon: 'account-outline' },
        ]}>
        {children}
      </DesktopPortal>
    );
  }

  return (
    <View style={styles.root}>
      {!hideHeader && (
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.header}>
            {showBack ? (
              <Pressable
                onPress={handleBack}
                hitSlop={12}
                style={styles.headerBtn}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.white}
                />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}

            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>

            {rightAction ? (
              <Pressable
                onPress={rightAction.onPress}
                style={styles.headerBtn}
                hitSlop={12}
              >
                <MaterialCommunityIcons
                  name={rightAction.icon}
                  size={22}
                  color={COLORS.white}
                />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push("/(official)/profile")}
                style={({ pressed }) =>
                  [styles.avatar, pressed && styles.pressedScale] as any
                }
              >
                <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      )}

      {hideHeader && (
        <SafeAreaView style={styles.safeTransparent} edges={["top"]} />
      )}

      <View style={[styles.body, showBottomNav && { paddingBottom: 84 }]}>{children}</View>

      {/* ── Bottom nav (only when not a back-stack screen) ── */}
      {showBottomNav && (
        <View pointerEvents="box-none" style={[styles.navWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.navBar}>
            {TAB_DEFS.map(([routeKey, icon, iconActive, labelKey, fullRoute]) => {
              const active = tab === routeKey;
              return (
                <TabButton
                  key={routeKey}
                  route={fullRoute}
                  icon={icon}
                  iconActive={iconActive}
                  labelKey={labelKey}
                  active={active}
                  onPress={() => {
                    if (!active) router.replace(fullRoute as any);
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
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safe: {
    backgroundColor: COLORS.primary,
  },
  safeTransparent: {
    backgroundColor: COLORS.primary,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 58,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    ...SHADOWS.soft,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },

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
