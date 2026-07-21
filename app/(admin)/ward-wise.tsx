import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

const WARDS = Array.from({ length: 10 }, (_, i) => `Ward ${i + 1}`);

const WARD_LABELS: Record<string, string> = {
  'Ward 1': 'Malvan Town',
  'Ward 2': 'Malvan Bazaar',
  'Ward 3': 'Malvan Beach',
  'Ward 4': 'Devbag',
  'Ward 5': 'Achara',
  'Ward 6': 'Kumbharmath',
  'Ward 7': 'Dhuriwada',
  'Ward 8': 'Tondavali',
  'Ward 9': 'Saraswati Nagar',
  'Ward 10': 'Bhagawati',
};

export default function WardWiseScreen() {
  const router = useRouter();
  const { complaints } = useOfficial();

  const wardData = useMemo(() =>
    WARDS.map((ward) => {
      const wc = complaints.filter((c) => c.ward.startsWith(ward));
      const resolved  = wc.filter((c) => c.status === 'Resolved').length;
      const pending   = wc.filter((c) => c.status === 'Pending').length;
      const emergency = wc.filter((c) => c.priority === 'Emergency').length;
      const rate      = wc.length > 0 ? Math.round((resolved / wc.length) * 100) : 0;
      return { ward, label: WARD_LABELS[ward] ?? ward, total: wc.length, resolved, pending, emergency, rate };
    }),
  [complaints]);

  const totalAll    = complaints.length;
  const resolvedAll = complaints.filter((c) => c.status === 'Resolved').length;
  const pendingAll  = complaints.filter((c) => c.status === 'Pending').length;
  const rateAll     = totalAll > 0 ? Math.round((resolvedAll / totalAll) * 100) : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ward Wise</Text>
        <Text style={styles.headerSub}>All {WARDS.length} Municipal Wards</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        {/* City summary */}
        <Animated.View entering={FadeInDown.duration(380).delay(0)}>
          <LinearGradient colors={['#0B4F8A', '#2E86DE']} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <SummaryItem label="Total" value={totalAll} light />
              <View style={styles.sumDivider} />
              <SummaryItem label="Resolved" value={resolvedAll} light />
              <View style={styles.sumDivider} />
              <SummaryItem label="Pending" value={pendingAll} light />
              <View style={styles.sumDivider} />
              <SummaryItem label="Rate" value={`${rateAll}%`} light />
            </View>
            <Text style={styles.summaryLabel}>City-wide overview — all wards combined</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.sectionTitle}>Ward Performance</Text>

        {wardData.map((item, idx) => (
          <Animated.View key={item.ward} entering={FadeInDown.duration(360).delay(60 + idx * 45)}>
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
                    <Text style={styles.emergText}>{item.emergency} emergency</Text>
                  </View>
                )}
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <StatPill label="Total" value={item.total} color={COLORS.primary} bg="#EFF6FF" />
                <StatPill label="Resolved" value={item.resolved} color="#10B981" bg="#ECFDF5" />
                <StatPill label="Pending" value={item.pending} color="#F59E0B" bg="#FFF8ED" />
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
                <Text style={styles.barLabel}>{item.rate}% resolved</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
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
});
