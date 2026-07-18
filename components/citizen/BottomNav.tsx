// components/citizen/BottomNav.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
};

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home', route: '/dashboard' },
  { key: 'ward', label: 'Ward', icon: 'map-marker-outline', iconActive: 'map-marker', route: '/ward' },
  { key: 'complaints', label: 'Complaints', icon: 'clipboard-text-outline', iconActive: 'clipboard-text', route: '/my-complaints' },
  { key: 'report', label: 'Report', icon: 'clipboard-plus-outline', iconActive: 'clipboard-plus', route: '/report-complaint' },
  { key: 'announcements', label: 'News', icon: 'bullhorn-outline', iconActive: 'bullhorn', route: '/announcements' },
  { key: 'profile', label: 'Profile', icon: 'account-outline', iconActive: 'account', route: '/profile' },
];

function TabButton({ tab, active, onPress }: { tab: TabItem; active: boolean; onPress: () => void }) {
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
            name={active ? tab.iconActive : tab.icon}
            size={18}
            color={active ? COLORS.white : COLORS.textMuted}
          />
        </View>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const active = pathname === tab.route || pathname.startsWith(`${tab.route}/`);
          return (
            <TabButton
              key={tab.key}
              tab={tab}
              active={active}
              onPress={() => {
                if (!active) router.replace(tab.route as any);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  bar: {
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
  tabLabel: {
    fontSize: 8.8,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});