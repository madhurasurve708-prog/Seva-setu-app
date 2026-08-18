import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs, usePathname, useRouter } from 'expo-router';
import { memo, useEffect, useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

const ADMIN_MENU = [
  { label: 'Dashboard', route: '/(admin)/dashboard', icon: 'view-dashboard-outline' as const },
  { label: 'Ward Wise', route: '/(admin)/ward-wise', icon: 'map-outline' as const },
  { label: 'Complaints', route: '/(admin)/complaints', icon: 'clipboard-text-outline' as const },
  { label: 'Announcements', route: '/(admin)/announcements', icon: 'bullhorn-outline' as const },
  { label: 'Users', route: '/(admin)/people', icon: 'account-group-outline' as const },
  { label: 'Reports', route: '/(admin)/reports', icon: 'chart-box-outline' as const },
  { label: 'Settings', route: '/(admin)/settings', icon: 'cog-outline' as const },
];

const AdminDesktopSidebar = memo(function AdminDesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, profile } = useOfficial();
  return (
    <View style={desktopStyles.sidebar}>
      <View style={desktopStyles.brand}><MaterialCommunityIcons name="office-building-marker-outline" size={26} color={COLORS.primary} /><View><Text style={desktopStyles.brandTitle}>Seva Setu</Text><Text style={desktopStyles.brandSub}>MALVAN MUNICIPAL COUNCIL</Text></View></View>
      <Text style={desktopStyles.menuTitle}>ADMINISTRATION</Text>
      <View style={{ gap: 5 }}>{ADMIN_MENU.map((item) => {
        const active = pathname.endsWith(`/${item.route.split('/').pop()}`);
        return <Pressable key={item.route} onPress={() => !active && router.replace(item.route as any)} style={[desktopStyles.item, active && desktopStyles.itemActive]}><MaterialCommunityIcons name={item.icon} size={20} color={active ? COLORS.white : COLORS.textMuted} /><Text style={[desktopStyles.itemText, active && desktopStyles.itemTextActive]}>{item.label}</Text></Pressable>;
      })}</View>
      <View style={desktopStyles.profile}><View style={desktopStyles.avatar}><Text style={desktopStyles.avatarText}>{profile.avatarInitial}</Text></View><View style={{ flex: 1 }}><Text style={desktopStyles.profileName} numberOfLines={1}>{profile.name}</Text><Text style={desktopStyles.profileRole}>Municipal Administrator</Text></View></View>
      <Pressable onPress={() => { void logout().then(() => router.replace('/(auth)/role-selection' as any)); }} style={desktopStyles.logout}><MaterialCommunityIcons name="logout" size={19} color={COLORS.danger} /><Text style={desktopStyles.logoutText}>Logout</Text></Pressable>
    </View>
  );
});

const TabIcon = memo(function TabIcon({
  name,
  color,
  focused,
  badge,
}: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={tabStyles.iconWrap}>
      <MaterialCommunityIcons name={name} size={22} color={color} />
      {badge != null && badge > 0 ? (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
});

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '900' },
});

export default function AdminLayout() {
  const { t } = useTranslation();
  const { ready, isAuthenticated, profile, complaints, loadComplaints } = useOfficial();

  useEffect(() => {
    if (isAuthenticated && ['nagaradhyaksha', 'main-admin'].includes(profile.role)) {
      void loadComplaints().catch(() => {});
    }
  }, [isAuthenticated, profile.role, loadComplaints]);
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width > 768;
  const pendingCount = useMemo(() => complaints.filter((c) => c.status === 'Pending').length, [complaints]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !['nagaradhyaksha', 'main-admin'].includes(profile.role)) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  return (
    <Tabs
      tabBar={isDesktop ? () => <AdminDesktopSidebar /> : undefined}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
        tabBarStyle: isDesktop ? {
          display: 'none',
          flexDirection: 'column',
          borderRightWidth: 1,
          borderRightColor: COLORS.border,
          borderTopWidth: 0,
          backgroundColor: COLORS.card,
          paddingTop: 40,
          paddingBottom: 20,
          justifyContent: 'flex-start',
        } : {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 6,
          ...SHADOWS.sm,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: isDesktop ? {
          fontSize: 13,
          fontWeight: '700',
          marginLeft: 8,
          includeFontPadding: false,
        } : {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          includeFontPadding: false,
        },
        tabBarItemStyle: isDesktop ? {
          width: '100%',
          maxHeight: 52,
          paddingVertical: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        } : {
          paddingVertical: 2,
        },
        sceneStyle: isDesktop ? { paddingLeft: 272, backgroundColor: COLORS.background } : { backgroundColor: COLORS.background },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'view-dashboard' : 'view-dashboard-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ward-wise"
        options={{
          title: t('wardWiseLabel'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          title: t('complaintsTitle'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
              color={color}
              focused={focused}
              badge={pendingCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: t('tabAnnounce'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bullhorn' : 'bullhorn-outline'} color={color} focused={focused} />
          ),
        }}
      />
      {/* "More" tab — profile acts as the hub */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('moreLabel'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'dots-grid' : 'dots-horizontal-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden screens — reachable from navigation, not shown in tab bar */}
      <Tabs.Screen name="category-wise"   options={{ href: null }} />
      <Tabs.Screen name="department-wise" options={{ href: null }} />
      <Tabs.Screen name="best-wards"      options={{ href: null }} />
      <Tabs.Screen name="analytics"       options={{ href: null }} />
      <Tabs.Screen name="reports"         options={{ href: null }} />
      <Tabs.Screen name="departments"     options={{ href: null }} />
      <Tabs.Screen name="people"          options={{ href: null }} />
      <Tabs.Screen name="settings"        options={{ href: null }} />
      <Tabs.Screen name="complaint-explorer" options={{ href: null }} />
      <Tabs.Screen name="about"              options={{ href: null }} />
      <Tabs.Screen name="notification"       options={{ href: null }} />
    </Tabs>
  );
}

const desktopStyles = StyleSheet.create({
  sidebar: { width: 272, position: 'absolute', top: 0, bottom: 0, left: 0, padding: 22, paddingBottom: 26, backgroundColor: COLORS.card, borderRightWidth: 1, borderRightColor: COLORS.border, zIndex: 20, ...SHADOWS.sm },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 23, borderBottomWidth: 1, borderBottomColor: COLORS.border }, brandTitle: { color: COLORS.primary, fontSize: 19, fontWeight: '900' }, brandSub: { color: COLORS.textMuted, fontSize: 8.5, fontWeight: '800', letterSpacing: .55, marginTop: 2 },
  menuTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 24, marginBottom: 11 }, item: { height: 46, borderRadius: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, itemActive: { backgroundColor: COLORS.primary, ...SHADOWS.button }, itemText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' }, itemTextActive: { color: COLORS.white, fontWeight: '800' },
  profile: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }, avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.warning }, avatarText: { color: COLORS.white, fontWeight: '900' }, profileName: { color: COLORS.text, fontSize: 12, fontWeight: '800' }, profileRole: { color: COLORS.textMuted, fontSize: 9.5, fontWeight: '600', marginTop: 2 },
  logout: { height: 44, marginTop: 10, borderRadius: 11, backgroundColor: '#FEF2F2', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }, logoutText: { color: COLORS.danger, fontWeight: '800', fontSize: 13 },
});
