import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, StatusBar } from 'react-native';
import { CITIZEN_COLORS as C } from '@/constants/citizen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import PrimaryButton from '@/components/common/PrimaryButton';
import GlassCard from '@/components/common/GlassCard';
import { useTranslation } from '@/providers/localization-provider';

export default function ComplaintSuccess() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Pulsing Check Circle */}
      <Animated.View entering={ZoomIn.duration(600)} style={styles.circle}>
        <MaterialCommunityIcons name="check" size={54} color={COLORS.white} />
      </Animated.View>

      <Animated.Text entering={FadeInUp.duration(500).delay(200)} style={styles.title}>
        {t('complaintRegistered')}
      </Animated.Text>
      <Animated.Text entering={FadeInUp.duration(500).delay(350)} style={styles.subtitle}>
        {t('complaintRegisteredDesc')}
      </Animated.Text>

      {/* ID Detail Card */}
      <Animated.View entering={FadeInUp.duration(600).delay(500)} style={styles.cardContainer}>
        <GlassCard style={styles.card}>
          <Text style={styles.cardLabel}>{t('officialComplaintId')}</Text>
          <Text style={styles.complaintId}>{id}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{t('initialStatus')}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t('pendingAction')}</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).delay(650)} style={styles.btnWrapper}>
        <PrimaryButton
          label={t('backToDashboard')}
          onPress={() => router.replace('/(citizen)/dashboard')}
          style={styles.button}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    lineHeight: 20,
    color: COLORS.textMuted,
    marginTop: 10,
    paddingHorizontal: 12,
    marginBottom: 30,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 36,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  complaintId: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  statusLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.warning,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.warning,
    letterSpacing: 0.5,
  },
  btnWrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
