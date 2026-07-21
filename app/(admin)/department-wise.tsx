import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

interface DeptMeta {
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  bg: string;
  grad: readonly [string, string];
  head: string;
}

const DEPT_META: DeptMeta[] = [
  { name: 'Water Department',      icon: 'water-outline',          color: '#2563EB', bg: '#DBEAFE', grad: ['#EFF6FF', '#DBEAFE'], head: 'Sunil Kamble' },
  { name: 'Road Department',       icon: 'road-variant',           color: '#7C3AED', bg: '#EDE9FE', grad: ['#F5F3FF', '#EDE9FE'], head: 'Ravi Shirke' },
  { name: 'Electrical Department', icon: 'lightning-bolt-outline', color: '#F59E0B', bg: '#FEF3C7', grad: ['#FFFBEB', '#FEF3C7'], head: 'Anil Prabhu' },
  { name: 'Sanitation Department', icon: 'delete-sweep-outline',   color: '#10B981', bg: '#D1FAE5', grad: ['#ECFDF5', '#D1FAE5'], head: 'Priya Naik' },
  { name: 'Garden Department',     icon: 'tree-outline',           color: '#16A34A', bg: '#DCFCE7', grad: ['#F0FDF4', '#DCFCE7'], head: 'Seema More' },
  { name: 'Administration',        icon: 'office-building-outline', color: '#0B4F8A', bg: '#DBEAFE', grad: ['#EFF6FF', '#DBEAFE'], head: 'Mamta Waradkar' },
  { name: 'Public Works',          icon: 'hammer-wrench',          color: '#EA580C', bg: '#FFEDD5', grad: ['#FFF7ED', '#FFEDD5'], head: 'Dinesh Rao' },
  { name: 'Traffic Police',        icon: 'traffic-light',          color: '#DC2626', bg: '#FEE2E2', grad: ['#FEF2F2', '#FEE2E2'], head: 'Inspector Patil' },
];

export default function DepartmentWiseScreen() {
  const router = useRouter();
  const { complaints } = useOfficial();

  const deptData = useMemo(() =>
    DEPT_META.map((meta) => {
      const dc       = complaints.filter((c) => c.assignedDepartment === meta.name);
      const resolved = dc.filter((c) => c.status === 'Resolved').length;
      const pending  = dc.filter((c) => c.status === 'Pending').length;
      const escalated = dc.filter((c) => c.is_escalated).length;
      const rate     = dc.length > 0 ? Math.round((resolved / dc.length) * 100) : 0;
      return { ...meta, total: dc.length, resolved, pending, escalated, rate };
    }),
  [complaints]);

  const topDepts = [...deptData].sort((a, b) => b.rate - a.rate).slice(0, 3);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Department Wise</Text>
        <Text style={styles.headerSub}>Track resolution by municipal department</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        {/* Top performers */}
        <Animated.View entering={FadeInDown.duration(380).delay(0)}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.topRow}>
            {topDepts.map((d, idx) => (
              <Pressable
                key={d.name}
                onPress={() => router.push({ pathname: '/(admin)/complaints', params: { department: d.name } } as any)}
                style={({ pressed }) => [styles.topCard, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient colors={d.grad} style={styles.topCardGrad}>
                  {idx === 0 && (
                    <View style={styles.trophyBadge}>
                      <MaterialCommunityIcons name="trophy" size={11} color="#F59E0B" />
                      <Text style={styles.trophyText}>#1</Text>
                    </View>
                  )}
                  <MaterialCommunityIcons name={d.icon} size={24} color={d.color} />
                  <Text style={styles.topRate}>{d.rate}%</Text>
                  <Text style={styles.topName} numberOfLines={2}>{d.name.replace(' Department', '')}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>All Departments</Text>

        {deptData.map((dept, idx) => (
          <Animated.View key={dept.name} entering={FadeInDown.duration(360).delay(60 + idx * 45)}>
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaints', params: { department: dept.name } } as any)}
              style={({ pressed }) => [styles.deptCard, pressed && styles.cardPressed]}
            >
              <View style={styles.deptTop}>
                <View style={[styles.iconCircle, { backgroundColor: dept.bg }]}>
                  <MaterialCommunityIcons name={dept.icon} size={20} color={dept.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deptName}>{dept.name}</Text>
                  <Text style={styles.deptHead}>Head: {dept.head}</Text>
                </View>
                <View style={[styles.rateBadge, {
                  backgroundColor: dept.rate >= 70 ? '#ECFDF5' : dept.rate >= 40 ? '#FFF8ED' : '#FEF2F2',
                }]}>
                  <Text style={[styles.rateNum, {
                    color: dept.rate >= 70 ? '#10B981' : dept.rate >= 40 ? '#F59E0B' : '#EF4444',
                  }]}>
                    {dept.rate}%
                  </Text>
                  <Text style={styles.rateSub}>resolved</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
              </View>

              <View style={styles.statsRow}>
                <DeptStat label="Assigned" value={dept.total} color={COLORS.primary} />
                <DeptStat label="Resolved" value={dept.resolved} color="#10B981" />
                <DeptStat label="Pending" value={dept.pending} color="#F59E0B" />
                {dept.escalated > 0 && (
                  <DeptStat label="Escalated" value={dept.escalated} color="#DC2626" />
                )}
              </View>

              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: dept.total > 0 ? `${dept.rate}%` : '0%',
                      backgroundColor: dept.rate >= 70 ? '#10B981' : dept.rate >= 40 ? '#F59E0B' : '#EF4444',
                    },
                  ]}
                />
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DeptStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.deptStat}>
      <Text style={[styles.deptStatVal, { color }]}>{value}</Text>
      <Text style={styles.deptStatLabel}>{label}</Text>
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

  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 8 },

  topRow: { flexDirection: 'row', gap: 10 },
  topCard: { flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  topCardGrad: { padding: 14, alignItems: 'center', gap: 6, minHeight: 110 },
  trophyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  trophyText: { fontSize: 9, fontWeight: '900', color: '#F59E0B' },
  topRate: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  topName: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },

  deptCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.soft,
  },
  cardPressed: { opacity: 0.88 },

  deptTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  deptName: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  deptHead: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },
  rateBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  rateNum: { fontSize: 15, fontWeight: '900' },
  rateSub: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },

  statsRow: { flexDirection: 'row', gap: 8 },
  deptStat: { flex: 1, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, paddingVertical: 8 },
  deptStatVal: { fontSize: 16, fontWeight: '900' },
  deptStatLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, marginTop: 2 },

  barBg: { height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
