import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

function TabIcon({
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
}

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

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
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
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          includeFontPadding: false,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
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
