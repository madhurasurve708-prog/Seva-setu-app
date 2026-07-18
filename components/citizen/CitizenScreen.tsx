// components/citizen/CitizenScreen.tsx — फक्त हे बदल करा
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useCitizen } from '@/providers/citizen-provider';
import BottomNav from './BottomNav';

type CitizenScreenProps = PropsWithChildren<{
  title: string;
  showBack?: boolean;
  hideNav?: boolean;
  hideHeader?: boolean;
}>;

export function CitizenScreen({
  title,
  children,
  showBack = false,
  hideNav = false,
  hideHeader = false,
}: CitizenScreenProps) {
  const router = useRouter();
  const { profile } = useCitizen();

  return (
    <View style={styles.root}>
      {!hideHeader && (
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            {showBack ? (
              <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            <Pressable
              onPress={() => router.push('/profile')}
              style={({ pressed }) => [styles.avatar, pressed && styles.pressedScale] as any}
            >
              <Text style={styles.avatarText}>
                {(profile?.firstName || profile?.fullName || profile?.name)?.charAt(0).toUpperCase() || 'C'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {hideHeader && <SafeAreaView style={styles.safeTransparent} edges={['top']} />}

      <View style={styles.body}>{children}</View>

      {!hideNav && <BottomNav />}
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
    backgroundColor: '#0B4F8A',
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 58,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    ...SHADOWS.soft,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },
});