import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTranslation } from '@/providers/localization-provider';
import { useOfficial } from '@/providers/official-provider';

const SIDEBAR_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  wardComplaintsCount: number;
  onLogout: () => void;
}

interface NavItem {
  key: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: boolean;
}

const OFFICIAL_NAV_ITEMS: NavItem[] = [
  {
    key: 'overview',
    labelKey: 'dashboard',
    icon: 'grid-outline',
    route: '/(official)/dashboard',
  },
  {
    key: 'complaints',
    labelKey: 'wardComplaints',
    icon: 'document-text-outline',
    route: '/(official)/complaints',
    badge: true,
  },
  {
    key: 'analytics',
    labelKey: 'analytics',
    icon: 'stats-chart-outline',
    route: '/(official)/analytics',
  },
  {
    key: 'profile',
    labelKey: 'myProfile',
    icon: 'person-circle-outline',
    route: '/(official)/profile',
  },
  {
    key: 'settings',
    labelKey: 'settings',
    icon: 'settings-outline',
    route: '/(official)/settings',
  },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    key: 'overview',
    labelKey: 'dashboard',
    icon: 'grid-outline',
    route: '/(admin)/dashboard',
  },
  {
    key: 'complaints',
    labelKey: 'totalComplaints',
    icon: 'document-text-outline',
    route: '/(admin)/complaints',
    badge: true,
  },
  {
    key: 'ward-explorer',
    labelKey: 'wardWise',
    icon: 'map-outline',
    route: '/(admin)/complaint-explorer?mode=ward',
  },
  {
    key: 'dept-explorer',
    labelKey: 'departmentWise',
    icon: 'business-outline',
    route: '/(admin)/complaint-explorer?mode=department',
  },
  {
    key: 'announcements',
    labelKey: 'announcements',
    icon: 'megaphone-outline',
    route: '/(admin)/announcements',
  },
  {
    key: 'reports',
    labelKey: 'reports',
    icon: 'bar-chart-outline',
    route: '/(admin)/reports',
  },
  {
    key: 'analytics',
    labelKey: 'analytics',
    icon: 'stats-chart-outline',
    route: '/(admin)/analytics',
  },
  {
    key: 'users',
    labelKey: 'citizens',
    icon: 'people-outline',
    route: '/(admin)/people',
  },
  {
    key: 'settings',
    labelKey: 'settings',
    icon: 'settings-outline',
    route: '/(official)/settings',
  },
];

export default function Sidebar({ visible, onClose, wardComplaintsCount, onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useOfficial();
  const { t } = useTranslation();

  const isAdmin = profile.role === 'nagaradhyaksha' || profile.role === 'main-admin';
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : OFFICIAL_NAV_ITEMS;

  // Determine active item key based on route path
  const getActiveKey = () => {
    if (isAdmin) {
      if (pathname.includes('/dashboard')) return 'overview';
      if (pathname.includes('/complaints')) return 'complaints';
      if (pathname.includes('mode=ward')) return 'ward-explorer';
      if (pathname.includes('mode=department')) return 'dept-explorer';
      if (pathname.includes('/announcements')) return 'announcements';
      if (pathname.includes('/reports')) return 'reports';
      if (pathname.includes('/analytics')) return 'analytics';
      if (pathname.includes('/people')) return 'users';
      if (pathname.includes('/settings')) return 'settings';
      return 'overview';
    } else {
      if (pathname.includes('/dashboard')) return 'overview';
      if (pathname.includes('/complaints')) return 'complaints';
      if (pathname.includes('/analytics')) return 'analytics';
      if (pathname.includes('/profile')) return 'profile';
      if (pathname.includes('/settings')) return 'settings';
      return 'overview';
    }
  };

  const activeKey = getActiveKey();

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, {
        duration: 260,
      });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, {
        duration: 180,
      });
    }
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleNavigation = (item: NavItem) => {
    onClose();
    if (item.route.includes('?')) {
      // Handle routes with params
      const [path, query] = item.route.split('?');
      const params = Object.fromEntries(new URLSearchParams(query).entries());
      router.push({ pathname: path, params } as any);
    } else {
      router.push(item.route as any);
    }
  };

  const displayRoleLabel = isAdmin ? t('nagaradhyaksha') : t('nagarsevak');

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={styles.outerContainer}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sidebar Panel */}
      <Animated.View style={[panelStyle, styles.sidebarPanel]}>
        {/* Profile Info Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
          </View>

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.ward}>{displayRoleLabel} • {profile.ward}</Text>
          <Text style={styles.dept}>{profile.department}</Text>
        </View>

        {/* Navigation List */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {navItems.map((item) => {
            const active = item.key === activeKey;

            return (
              <Pressable
                key={item.key}
                onPress={() => handleNavigation(item)}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: active ? '#EFF6FF' : 'transparent',
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor: active ? '#1E6FD9' : '#F1F5F9',
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={active ? '#FFFFFF' : '#475569'} />
                </View>

                <Text
                  style={[
                    styles.navLabel,
                    {
                      fontWeight: active ? '700' : '600',
                      color: active ? '#1E6FD9' : '#101826',
                    },
                  ]}
                >
                  {t(item.labelKey)}
                </Text>

                {item.badge && wardComplaintsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{wardComplaintsCount}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Logout Section */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              onClose();
              onLogout();
            }}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 48, 0.45)',
  },
  sidebarPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    paddingTop: 54,
    paddingHorizontal: 20,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#071D30',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 4, height: 0 },
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECF2',
    paddingBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#1E6FD9',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E6FD9',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2A43',
    textAlign: 'center',
  },
  ward: {
    fontSize: 12,
    color: '#5B6472',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  dept: {
    fontSize: 11,
    color: '#1E6FD9',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  badge: {
    backgroundColor: '#D64545',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E7ECF2',
    paddingTop: 14,
    paddingBottom: 24,
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});