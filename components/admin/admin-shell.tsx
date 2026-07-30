// components/admin/admin-shell.tsx
// Shared header wrapper for admin push-stack screens (non-tab screens).
// Provides a back button, brand header, and bell — no sidebar.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

type Props = PropsWithChildren<{
  title: string;
  /** Show back arrow instead of logo row. Default true for push-stack screens. */
  showBack?: boolean;
  /** Custom back destination. Defaults to router.back(). */
  backHref?: string;
  /** Right-side extra action */
  rightAction?: {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    onPress: () => void;
  };
}>;

export function AdminShell({ title, children, showBack = true, backHref, rightAction }: Props) {
  const router = useRouter();
  const { complaints } = useOfficial();

  const pending = complaints.filter((c) => c.status === 'Pending').length;

  const handleBack = () => {
    if (backHref) {
      router.push(backHref as any);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showBack ? (
            <Pressable onPress={handleBack} style={styles.iconBtn} hitSlop={8}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.primary} />
            </Pressable>
          ) : (
            <Image
              source={require('@/assets/images/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {rightAction ? (
            <Pressable onPress={rightAction.onPress} style={styles.iconBtn} hitSlop={8}>
              <MaterialCommunityIcons name={rightAction.icon} size={20} color={COLORS.primary} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/(admin)/notification' as any)}
              style={styles.notifBtn}
            >
              <MaterialCommunityIcons name="bell-outline" size={18} color={COLORS.primary} />
              {pending > 0 && <View style={styles.notifDot} />}
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 28, height: 28 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },

  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  body: { flex: 1 },
});
