import React, { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
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

export default function WardWiseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { complaints } = useOfficial();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width > 768;

  const wardData = useMemo(() =>
    WARDS.map((ward) => {
      const wc = complaints.filter((c) => c.ward.startsWith(ward));
      const resolved  = wc.filter((c) => c.status === 'Resolved').length;
      const pending   = wc.filter((c) => c.status === 'Pending').length;
      const emergency = wc.filter((c) => c.priority === 'Emergency').length;
      const rate      = wc.length > 0 ? Math.round((resolved / wc.length) * 100) : 0;
      const labelKey = WARD_LABEL_KEYS[ward];
      return { ward, label: labelKey ? t(labelKey) : ward, total: wc.length, resolved, pending, emergency, rate };
    }),
  [complaints, t]);

  const totalAll    = complaints.length;
  const resolvedAll = complaints.filter((c) => c.status === 'Resolved').length;
  const pendingAll  = complaints.filter((c) => c.status === 'Pending').length;
  const rateAll     = totalAll > 0 ? Math.round((resolvedAll / totalAll) * 100) : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('wardWiseLabel')}</Text>
        <Text style={styles.headerSub}>{t('allMunicipalWardsHeader').replace('{count}', String(WARDS.length))}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 24 }]} overScrollMode="never">
        {/* City summary */}
        <Animated.View entering={FadeInDown.duration(380).delay(0)}>
          <LinearGradient colors={['#0B4F8A', '#2E86DE']} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <SummaryItem label={t('totalLabel')} value={totalAll} light />
              <View style={styles.sumDivider} />
              <SummaryItem label={t('resolved')} value={resolvedAll} light />
              <View style={styles.sumDivider} />
              <SummaryItem label={t('pending')} value={pendingAll} light />
              <View style={styles.sumDivider} />
              <SummaryItem label={t('rateLabel')} value={`${rateAll}%`} light />
            </View>
            <Text style={styles.summaryLabel}>{t('cityWideOverviewAllWards')}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.sectionTitle}>{t('wardPerformance')}</Text>

        <View style={isDesktop ? styles.desktopGrid : undefined}>
          {wardData.map((item, idx) => (
            <Animated.View key={item.ward} entering={FadeInDown.duration(360).delay(60 + idx * 45)} style={isDesktop && { width: '49%', marginBottom: 12 }}>
              <Pressable
                onPress={() => router.push({ pathname: '/(admin)/complaints', params: { ward: item.ward } } as any)}
                style={({ pressed }) => [styles.wardCard, pressed && styles.cardPressed]}
              >
                {/* Ward header */}
                <View style={styles.wardTop}>
                  <View style={styles.wardBadge}>
                    <Text style={styles.wardNum}>{item.ward.split(' ')[1]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wardName}>{item.ward}</Text>
                    <Text style={styles.wardSub}>{item.label}</Text>
                  </View>
                  {item.emergency > 0 && (
                    <View style={styles.emergBadge}>
                      <MaterialCommunityIcons name="alert-circle" size={11} color="#DC2626" />
                      <Text style={styles.emergText}>{t('emergencyCountSuffix').replace('{count}', String(item.emergency))}</Text>
                    </View>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <StatPill label={t('totalLabel')} value={item.total} color={COLORS.primary} bg="#EFF6FF" />
                  <StatPill label={t('resolved')} value={item.resolved} color="#10B981" bg="#ECFDF5" />
                  <StatPill label={t('pending')} value={item.pending} color="#F59E0B" bg="#FFF8ED" />
                </View>

                {/* Resolution bar */}
                <View style={styles.barArea}>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.rate}%`,
                          backgroundColor: item.rate >= 70 ? '#10B981' : item.rate >= 40 ? '#F59E0B' : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.rate}% {t('resolved').toLowerCase()}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, light }: { label: string; value: number | string; light?: boolean }) {
  return (
    <View style={styles.sumItem}>
      <Text style={[styles.sumVal, light && { color: '#fff' }]}>{value}</Text>
      <Text style={[styles.sumLabel, light && { color: 'rgba(255,255,255,0.7)' }]}>{label}</Text>
    </View>
  );
}

function StatPill({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillVal, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
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

  summaryCard: {
    borderRadius: 20,
    padding: 18,
    gap: 10,
    ...SHADOWS.medium,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumItem: { flex: 1, alignItems: 'center' },
  sumVal: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  sumLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginTop: 2 },
  sumDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.65)', textAlign: 'center' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginTop: 4, marginBottom: -2 },

  wardCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.soft,
  },
  cardPressed: { opacity: 0.88 },

  wardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wardBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  wardNum: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  wardName: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  wardSub: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },
  emergBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  emergText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },

  statsRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  pillVal: { fontSize: 16, fontWeight: '900' },
  pillLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginTop: 2 },

  barArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, width: 72 },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
});
