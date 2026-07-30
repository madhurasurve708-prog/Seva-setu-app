import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import GlassCard from '@/components/common/GlassCard';
import { COLORS, SHADOWS } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

export default function AdminAnalyticsScreen() {
  const { t } = useTranslation();
  const { complaints } = useOfficial();

  const total      = complaints.length;
  const resolved   = complaints.filter((c) => c.status === 'Resolved').length;
  const pending    = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const escalated  = complaints.filter((c) => c.is_escalated).length;
  const rate       = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const STAT_ITEMS = [
    { key: 'total',      label: t('totalLabel'),  value: total,      color: COLORS.primary, icon: 'clipboard-list-outline' as const, bg: '#EFF6FF' },
    { key: 'resolved',   label: t('resolved'),    value: resolved,   color: '#10B981',      icon: 'check-circle-outline'   as const, bg: '#ECFDF5' },
    { key: 'pending',    label: t('pending'),     value: pending,    color: '#F59E0B',      icon: 'clock-outline'           as const, bg: '#FFF8ED' },
    { key: 'inProgress', label: t('inProgress'),  value: inProgress, color: '#2563EB',      icon: 'progress-wrench'         as const, bg: '#EFF6FF' },
    { key: 'escalated',  label: t('escalated'),   value: escalated,  color: '#DC2626',      icon: 'alert-octagon-outline'   as const, bg: '#FEF2F2' },
    { key: 'successRate',label: t('successRate'), value: `${rate}%`, color: '#7C3AED',      icon: 'chart-donut'             as const, bg: '#F5F3FF' },
  ];

  return (
    <AdminShell title={t('analytics')} showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* Stats */}
        <View style={styles.statsGrid}>
          {STAT_ITEMS.map((s, idx) => (
            <Animated.View key={s.key} entering={FadeInDown.duration(360).delay(idx * 55)} style={styles.statWrap}>
              <View style={[styles.statCard, { backgroundColor: s.bg, borderColor: `${s.color}22` }]}>
                <View style={[styles.statIcon, { backgroundColor: `${s.color}18` }]}>
                  <MaterialCommunityIcons name={s.icon} size={16} color={s.color} />
                </View>
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Resolution bar */}
        <GlassCard style={styles.rateCard}>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>{t('cityWideResolutionRate')}</Text>
            <Text style={[styles.rateVal, { color: rate >= 70 ? COLORS.success : '#F59E0B' }]}>{rate}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${rate}%`, backgroundColor: rate >= 70 ? COLORS.success : '#F59E0B' }]} />
          </View>
          <Text style={styles.rateSub}>
            {t('resolvedOfTotalComplaints').replace('{resolved}', String(resolved)).replace('{total}', String(total))}
          </Text>
        </GlassCard>

        {/* Category bars */}
        <Text style={styles.sectionTitle}>{t('categoryBreakdown')}</Text>
        <GlassCard style={styles.catCard}>
          {categories.filter((c) => c.id !== 'all').map((cat, idx) => {
            const count = complaints.filter((c) => c.category === cat.id).length;
            const pct   = total > 0 ? Math.max(3, Math.round((count / total) * 100)) : 0;
            const isLast = idx === categories.length - 2;
            return (
              <View key={cat.id} style={[styles.catRow, isLast && { borderBottomWidth: 0 }]}>
                <Text style={styles.catLabel} numberOfLines={1}>{t(cat.id)}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.catCount}>{count}</Text>
              </View>
            );
          })}
        </GlassCard>

        <GlassCard style={styles.comingSoon}>
          <MaterialCommunityIcons name="chart-timeline-variant-shimmer" size={26} color={COLORS.accent} />
          <Text style={styles.comingSoonTitle}>{t('trendChartsComingSoon')}</Text>
          <Text style={styles.comingSoonText}>{t('trendChartsDesc')}</Text>
        </GlassCard>
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44, gap: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statWrap: { width: '48%', flexGrow: 1 },
  statCard: { borderRadius: 18, padding: 14, borderWidth: 1, ...SHADOWS.soft },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLbl: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted, marginTop: 4 },
  rateCard: { padding: 16 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rateLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  rateVal: { fontSize: 16, fontWeight: '900' },
  progressBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  rateSub: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: -4 },
  catCard: { padding: 0, overflow: 'hidden' },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10 },
  catLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, width: 90 },
  barBg: { flex: 1, height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.primaryLight },
  catCount: { fontSize: 12, fontWeight: '800', color: COLORS.primary, width: 24, textAlign: 'right' },
  comingSoon: { padding: 22, alignItems: 'center', gap: 8 },
  comingSoonTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  comingSoonText: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
});
