import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

const CATEGORY_COLORS: Record<string, { color: string; bg: string; grad: readonly [string, string] }> = {
  water:        { color: '#2563EB', bg: '#DBEAFE', grad: ['#EFF6FF', '#DBEAFE'] },
  garbage:      { color: '#EA580C', bg: '#FFEDD5', grad: ['#FFF7ED', '#FFEDD5'] },
  streetlights: { color: '#F59E0B', bg: '#FEF3C7', grad: ['#FFFBEB', '#FEF3C7'] },
  road:         { color: '#7C3AED', bg: '#EDE9FE', grad: ['#F5F3FF', '#EDE9FE'] },
  gutter:       { color: '#0891B2', bg: '#CFFAFE', grad: ['#ECFEFF', '#CFFAFE'] },
  animals:      { color: '#B45309', bg: '#FEF3C7', grad: ['#FFFBEB', '#FEF3C7'] },
  traffic:      { color: '#DC2626', bg: '#FEE2E2', grad: ['#FEF2F2', '#FEE2E2'] },
  drainage:     { color: '#0F766E', bg: '#CCFBF1', grad: ['#F0FDFA', '#CCFBF1'] },
  tree:         { color: '#16A34A', bg: '#DCFCE7', grad: ['#F0FDF4', '#DCFCE7'] },
  other:        { color: '#475569', bg: '#F1F5F9', grad: ['#F8FAFC', '#F1F5F9'] },
};

export default function CategoryWiseScreen() {
  const router = useRouter();
  const { complaints } = useOfficial();

  const catData = useMemo(() =>
    categories
      .filter((c) => c.id !== 'all')
      .map((cat) => {
        const cc       = complaints.filter((c) => c.category === cat.id);
        const resolved = cc.filter((c) => c.status === 'Resolved').length;
        const pending  = cc.filter((c) => c.status === 'Pending').length;
        const emergency = cc.filter((c) => c.priority === 'Emergency').length;
        const rate     = cc.length > 0 ? Math.round((resolved / cc.length) * 100) : 0;
        const palette  = CATEGORY_COLORS[cat.id] ?? CATEGORY_COLORS.other;
        return { ...cat, total: cc.length, resolved, pending, emergency, rate, ...palette };
      })
      .sort((a, b) => b.total - a.total),
  [complaints]);

  const maxCount = Math.max(...catData.map((c) => c.total), 1);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Category Wise</Text>
        <Text style={styles.headerSub}>Complaints grouped by issue type</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        {/* Distribution bar chart */}
        <Animated.View entering={FadeInDown.duration(380).delay(0)}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Distribution Overview</Text>
            {catData.map((item, idx) => (
              <View key={item.id} style={styles.chartRow}>
                <MaterialCommunityIcons name={item.icon as any} size={14} color={item.color} style={{ width: 18 }} />
                <Text style={styles.chartLabel} numberOfLines={1}>{item.label}</Text>
                <View style={styles.chartBarBg}>
                  <Animated.View
                    entering={FadeInDown.duration(500).delay(100 + idx * 50)}
                    style={[
                      styles.chartBarFill,
                      { width: `${(item.total / maxCount) * 100}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
                <Text style={[styles.chartCount, { color: item.color }]}>{item.total}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>All Categories</Text>

        {catData.map((item, idx) => (
          <Animated.View key={item.id} entering={FadeInDown.duration(360).delay(60 + idx * 45)}>
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaints', params: { category: item.id } } as any)}
              style={({ pressed }) => [styles.catCard, pressed && styles.cardPressed]}
            >
              <LinearGradient colors={item.grad} style={styles.catCardGrad}>
                <View style={styles.catTop}>
                  <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catName}>{item.label}</Text>
                    <Text style={styles.catCount}>{item.total} complaint{item.total !== 1 ? 's' : ''}</Text>
                  </View>
                  {item.emergency > 0 && (
                    <View style={styles.emergBadge}>
                      <MaterialCommunityIcons name="alert-circle" size={11} color="#DC2626" />
                      <Text style={styles.emergText}>{item.emergency}</Text>
                    </View>
                  )}
                  <View style={[styles.rateBadge, { backgroundColor: item.bg }]}>
                    <Text style={[styles.rateText, { color: item.color }]}>{item.rate}%</Text>
                    <Text style={styles.rateSub}>resolved</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
                </View>

                {/* Mini stats */}
                <View style={styles.miniRow}>
                  <MiniStat label="Resolved" value={item.resolved} color="#10B981" />
                  <MiniStat label="Pending" value={item.pending} color="#F59E0B" />
                  <MiniStat label="In Progress" value={item.total - item.resolved - item.pending} color="#2563EB" />
                </View>

                {/* Bar */}
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
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniVal, { color }]}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
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

  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOWS.soft,
  },
  chartTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text, width: 72 },
  chartBarBg: { flex: 1, height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  chartBarFill: { height: '100%', borderRadius: 4 },
  chartCount: { fontSize: 11, fontWeight: '800', width: 20, textAlign: 'right' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginTop: 4, marginBottom: -2 },

  catCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  cardPressed: { opacity: 0.88 },
  catCardGrad: { padding: 16, gap: 12 },

  catTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  catCount: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },
  emergBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  emergText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  rateBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  rateText: { fontSize: 15, fontWeight: '900' },
  rateSub: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },

  miniRow: { flexDirection: 'row', gap: 8 },
  miniStat: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 10, paddingVertical: 7 },
  miniVal: { fontSize: 16, fontWeight: '900' },
  miniLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, marginTop: 1 },

  barBg: { height: 5, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
