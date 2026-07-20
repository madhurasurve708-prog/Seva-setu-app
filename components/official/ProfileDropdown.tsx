import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

interface ProfileDropdownProps {
  name: string;
  initial: string;
  language: string;
  roleLabel?: string;
  ward?: string;
  department?: string;
  onLogout: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProfileDropdown({
  name,
  initial,
  roleLabel,
  ward,
  onLogout,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const scale = useSharedValue(1);
  const avatarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleNavigate = (route: string) => {
    setOpen(false);
    router.push(route as any);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  const MENU_ITEMS: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    route: string;
    color: string;
    bg: string;
  }[] = [
    {
      icon: 'account-circle-outline',
      label: t('myProfile'),
      route: '/(official)/profile',
      color: COLORS.primary,
      bg: '#EFF6FF',
    },
    {
      icon: 'bell-outline',
      label: 'Notifications',
      route: '/(official)/settings/notifications',
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
  ];

  return (
    <View>
      {/* Avatar trigger */}
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        onPress={() => setOpen(true)}
        style={[styles.avatarBtn, avatarAnimStyle]}
      >
        <Text style={styles.avatarText}>{initial}</Text>
      </AnimatedPressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(120)}
              style={styles.dropdown}
            >
              {/* Profile header */}
              <View style={styles.dropdownHeader}>
                <View style={styles.dropdownAvatar}>
                  <Text style={styles.dropdownAvatarText}>{initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownName} numberOfLines={1}>{name}</Text>
                  <Text style={styles.dropdownRole} numberOfLines={1}>
                    {roleLabel ?? 'Nagarsevak'}{ward ? ` · ${ward}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Menu items */}
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.route}
                  onPress={() => handleNavigate(item.route)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && styles.menuRowPressed,
                  ]}
                >
                  <View style={[styles.menuIconCircle, { backgroundColor: item.bg }]}>
                    <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.textMuted} />
                </Pressable>
              ))}

              <View style={styles.divider} />

              {/* Logout */}
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.menuRow,
                  styles.menuRowLast,
                  pressed && styles.menuRowPressedDanger,
                ]}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#FEF2F2' }]}>
                  <MaterialCommunityIcons name="logout" size={18} color={COLORS.danger} />
                </View>
                <Text style={[styles.menuLabel, { color: COLORS.danger }]}>{t('logout')}</Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    ...SHADOWS.soft,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 17,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,20,40,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 62,
    paddingRight: 14,
  },

  dropdown: {
    width: 284,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    overflow: 'hidden',
    shadowColor: '#071D30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },

  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dropdownAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(46,134,222,0.2)',
  },
  dropdownAvatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 18,
  },
  dropdownName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  dropdownRole: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuRowPressed: {
    backgroundColor: 'rgba(11,79,138,0.05)',
  },
  menuRowPressedDanger: {
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});
