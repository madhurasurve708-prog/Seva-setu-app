import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DepartmentScreen } from '@/components/dept/department-screen';
import GlassCard from '@/components/common/GlassCard';
import { COLORS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';

const wardDisplay = (t: (key: string) => string, ward: string) => (ward ?? '').replace(/^Ward\b/, t('ward2'));

export default function DepartmentAnalytics() {
  const { t } = useTranslation();
  const { profile, complaints } = useDepartment();
  const mine = complaints.filter(c => c.assignedDepartment === profile?.department && !c.is_deleted);
  const resolved = mine.filter(c => c.status === 'Resolved').length;
  const wards = Array.from(new Set(mine.map(c => c.ward)));
  const categories = Array.from(new Set(mine.map(c => c.category)));

  const cards = [
    ['pending',     t('pending'),           mine.filter(c => c.status === 'Pending').length],
    ['resolved',    t('resolved'),          resolved],
    ['avgRes',      t('avgResolution'),     '2.4 days'],
    ['performance', t('performanceLabel'),  mine.length ? `${Math.round(resolved / mine.length * 100)}%` : '0%'],
  ] as const;

  return (
    <DepartmentScreen title={t('deptAnalyticsTitle')} tab="analytics">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.scope}>{t('deptOnlyReporting')}</Text>

        <View style={styles.grid}>
          {cards.map(([key, label, value]) => (
            <GlassCard key={key} style={styles.stat}>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.label}>{label}</Text>
            </GlassCard>
          ))}
        </View>

        <Text style={styles.title}>{t('monthlyPerformanceLabel')}</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.row}>July 2026</Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${mine.length ? Math.round(resolved / mine.length * 100) : 0}%` }]} />
          </View>
          <Text style={styles.sub}>
            {t('resolvedFromTotalComplaints').replace('{resolved}', String(resolved)).replace('{total}', String(mine.length))}
          </Text>
        </GlassCard>

        <Text style={styles.title}>{t('wardWise')}</Text>
        <GlassCard style={styles.card}>
          {wards.map(ward => (
            <View key={ward} style={styles.line}>
              <Text style={styles.row}>{wardDisplay(t, ward)}</Text>
              <Text style={styles.count}>{mine.filter(c => c.ward === ward).length}</Text>
            </View>
          ))}
        </GlassCard>

        <Text style={styles.title}>{t('categoryWise')}</Text>
        <GlassCard style={styles.card}>
          {categories.map(category => (
            <View key={category} style={styles.line}>
              <Text style={styles.row}>{t(category)}</Text>
              <Text style={styles.count}>{mine.filter(c => c.category === category).length}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </DepartmentScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 24, gap: 12 },
  scope: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '47%', flexGrow: 1, padding: 15 },
  value: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  label: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', marginTop: 3 },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginTop: 6 },
  card: { padding: 15, gap: 11 },
  row: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textMuted },
  bar: { height: 10, backgroundColor: '#E5EAF0', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 5 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  count: { fontWeight: '900', color: COLORS.primary },
});
