import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

const WARDS = Array.from({ length: 10 }, (_, i) => `Ward ${i + 1}`);

const WARD_LABEL_KEYS: Record<string, string> = {
  'Ward 1': 'wardNameMalvanTown',
  'Ward 2': 'wardNameMalvanBazaar',
  'Ward 3': 'wardNameMalvanBeach',
  'Ward 4': 'wardNameDevbag',
  'Ward 5': 'wardNameAchara',
  'Ward 6': 'wardNameKumbharmath',
  'Ward 7': 'wardNameDhuriwada',
  'Ward 8': 'wardNameTondavali',
  'Ward 9': 'wardNameSaraswatiNagar',
  'Ward 10': 'wardNameBhagawati',
};

const MEDAL_COLORS = ['#F59E0B', '#94A3B8', '#B45309'];

export default function BestWardsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { complaints } = useOfficial();
  const MEDAL_LABELS = [t('goldLabel'), t('silverLabel'), t('bronzeLabel')];

  const ranked = useMemo(() => {
    const data = WARDS.map((ward) => {
      const wc       = complaints.filter((c) => c.ward.startsWith(ward));
      const resolved = wc.filter((c) => c.status === 'Resolved').length;
      const pending  = wc.filter((c) => c.status === 'Pending').length;
      const emergency = wc.filter((c) => c.priority === 'Emergency').length;
      const rate     = wc.length > 0 ? Math.round((resolved / wc.length) * 100) : 0;
      // Score: resolution rate weighted, minus emergency penalty
      const score    = rate - emergency * 5 + (wc.length > 0 ? 10 : 0);
      const labelKey = WARD_LABEL_KEYS[ward];
      return { ward, label: labelKey ? t(labelKey) : ward, total: wc.length, resolved, pending, emergency, rate, score };
    });
    return data.sort((a, b) => b.score - a.score);
  }, [complaints, t]);

  const top3    = ranked.slice(0, 3);
  const rest    = ranked.slice(3);
  const cityAvg = Math.round(ranked.reduce((s, w) => s + w.rate, 0) / ranked.length);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('bestWards')}</Text>
        <Text style={styles.headerSub}>{t('rankedByPerformance')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        {/* City average banner */}
        <Animated.View entering={FadeInDown.duration(380).delay(0)}>
          <LinearGradient colors={['#0B4F8A', '#1A6BB5']} style={styles.avgBanner}>
            <MaterialCommunityIcons name="city-variant-outline" size={28} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={styles.avgLabel}>{t('cityAvgResolutionRate')}</Text>
              <Text style={styles.avgVal}>{cityAvg}%</Text>
            </View>
            <View style={styles.avgBadge}>
              <Text style={styles.avgBadgeText}>Malvan</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Podium */}
        <Text style={styles.sectionTitle}>{t('top3PerformingWards')}</Text>
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.podium}>
          {/* Silver — 2nd */}
          <PodiumCard item={top3[1]} rank={2} medalLabels={MEDAL_LABELS} onPress={() => router.push({ pathname: '/(admin)/ward-wise' } as any)} />
          {/* Gold — 1st */}
          <PodiumCard item={top3[0]} rank={1} featured medalLabels={MEDAL_LABELS} onPress={() => router.push({ pathname: '/(admin)/ward-wise' } as any)} />
          {/* Bronze — 3rd */}
          <PodiumCard item={top3[2]} rank={3} medalLabels={MEDAL_LABELS} onPress={() => router.push({ pathname: '/(admin)/ward-wise' } as any)} />
        </Animated.View>

        {/* Ranked list */}
        <Text style={styles.sectionTitle}>{t('fullWardRankings')}</Text>
        {ranked.map((item, idx) => (
          <Animated.View key={item.ward} entering={FadeInDown.duration(360).delay(80 + idx * 40)}>
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaints', params: { ward: item.ward } } as any)}
              style={({ pressed }) => [styles.rankCard, pressed && styles.cardPressed]}
            >
              {/* Rank number */}
              <View style={[
                styles.rankBadge,
                idx < 3 && { backgroundColor: MEDAL_COLORS[idx] + '22', borderColor: MEDAL_COLORS[idx] + '66' },
              ]}>
                {idx < 3 ? (
                  <MaterialCommunityIcons name="medal" size={16} color={MEDAL_COLORS[idx]} />
                ) : (
                  <Text style={styles.rankNum}>#{idx + 1}</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.rankWardName}>{item.ward}</Text>
                <Text style={styles.rankWardLabel}>{item.label}</Text>
              </View>

              {/* Rate */}
              <View style={[
                styles.rateCircle,
                {
                  borderColor: item.rate >= 70 ? '#10B981' : item.rate >= 40 ? '#F59E0B' : '#EF4444',
                  backgroundColor: item.rate >= 70 ? '#ECFDF5' : item.rate >= 40 ? '#FFF8ED' : '#FEF2F2',
                },
              ]}>
                <Text style={[
                  styles.rateCircleVal,
                  { color: item.rate >= 70 ? '#10B981' : item.rate >= 40 ? '#F59E0B' : '#EF4444' },
                ]}>
                  {item.rate}%
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.miniStats}>
                <MiniStat label={t('totalLabel')} value={item.total} />
                <MiniStat label={t('doneLabel')} value={item.resolved} color="#10B981" />
                <MiniStat label={t('openLabel')} value={item.pending} color="#F59E0B" />
              </View>

              <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.textMuted} />
            </Pressable>
          </Animated.View>
        ))}

        {/* Improvement needed */}
        <Animated.View entering={FadeInDown.duration(360).delay(500)}>
          <View style={styles.needsImprovCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#EA580C" />
            <View style={{ flex: 1 }}>
              <Text style={styles.needsTitle}>{t('needsAttention')}</Text>
              <Text style={styles.needsText}>
                {t('wardsBelowThresholdMsg')
                  .replace('{count}', String(ranked.filter((w) => w.rate < 40).length))
                  .replace('{plural}', ranked.filter((w) => w.rate < 40).length !== 1 ? 's' : '')}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PodiumCard({
  item,
  rank,
  featured,
  medalLabels,
  onPress,
}: {
  item?: { ward: string; label: string; rate: number; total: number };
  rank: number;
  featured?: boolean;
  medalLabels: string[];
  onPress: () => void;
}) {
  if (!item) return <View style={styles.podiumEmpty} />;
  const medalColor = MEDAL_COLORS[rank - 1];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.podiumCard, featured && styles.podiumCardFeatured, pressed && { opacity: 0.85 }]}
    >
      <LinearGradient
        colors={featured ? ['#0B4F8A', '#2E86DE'] : ['#F8FAFC', '#F1F5F9']}
        style={styles.podiumCardGrad}
      >
        <MaterialCommunityIcons name="medal" size={featured ? 26 : 22} color={medalColor} />
        <Text style={[styles.podiumRateText, { color: featured ? '#fff' : COLORS.text }]}>{item.rate}%</Text>
        <Text style={[styles.podiumWardName, { color: featured ? 'rgba(255,255,255,0.9)' : COLORS.textMuted }]} numberOfLines={1}>
          {item.ward}
        </Text>
        <Text style={[styles.podiumMedal, { color: medalColor }]}>{medalLabels[rank - 1]}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatVal, { color: color ?? COLORS.textMuted }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  headerSub: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },

  content: { padding: 16, paddingBottom: 44, gap: 12 },

  avgBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...SHADOWS.medium,
  },
  avgLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  avgVal: { fontSize: 32, fontWeight: '900', color: '#fff' },
  avgBadge: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  avgBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 4 },

  podium: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  podiumEmpty: { flex: 1 },
  podiumCard: { flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  podiumCardFeatured: { ...SHADOWS.medium },
  podiumCardGrad: { padding: 14, alignItems: 'center', gap: 5, minHeight: 120 },
  podiumRateText: { fontSize: 22, fontWeight: '900' },
  podiumWardName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  podiumMedal: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  rankCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...SHADOWS.soft,
  },
  cardPressed: { opacity: 0.88 },

  rankBadge: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
  },
  rankNum: { fontSize: 12, fontWeight: '900', color: COLORS.textMuted },
  rankWardName: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  rankWardLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },

  rateCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  rateCircleVal: { fontSize: 12, fontWeight: '900' },

  miniStats: { flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  miniStat: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  miniStatVal: { fontSize: 11, fontWeight: '800' },
  miniStatLabel: { fontSize: 9, fontWeight: '600', color: COLORS.textMuted },

  needsImprovCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 14,
  },
  needsTitle: { fontSize: 13, fontWeight: '800', color: '#EA580C' },
  needsText: { fontSize: 12, fontWeight: '500', color: '#92400E', lineHeight: 17 },
});
