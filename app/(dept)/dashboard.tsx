import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import GlassCard from '@/components/common/GlassCard';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { DEPT_META } from '@/data/department-routing';
import { useDepartment } from '@/providers/department-provider';

// All 10 municipal wards of Malvan
const ALL_WARDS = [
  'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5',
  'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10',
];

const STAT_COLORS = [
  { color: '#2563EB', bg: '#DBEAFE', icon: 'clipboard-text-outline' as const },
  { color: '#F59E0B', bg: '#FEF3C7', icon: 'clock-outline' as const },
  { color: '#7C3AED', bg: '#EDE9FE', icon: 'progress-wrench' as const },
  { color: '#10B981', bg: '#D1FAE5', icon: 'check-circle-outline' as const },
  { color: '#DC2626', bg: '#FEE2E2', icon: 'alert-outline' as const },
  { color: '#0EA5E9', bg: '#E0F2FE', icon: 'arrow-up-bold-outline' as const },
];

export default function DepartmentDashboard() {
  const router = useRouter();
  const { profile, complaints } = useDepartment();

  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  // All complaints assigned to this department
  const mine = useMemo(
    () => complaints.filter((c) => c.assignedDepartment === profile?.department && !c.is_deleted),
    [complaints, profile],
  );

  // Filtered by selected ward (null = all wards)
  const visible = useMemo(
    () => (selectedWard ? mine.filter((c) => c.ward === selectedWard) : mine),
    [mine, selectedWard],
  );

  const pending    = visible.filter((c) => c.status === 'Pending').length;
  const active     = visible.filter((c) => c.status === 'In Progress').length;
  const resolved   = visible.filter((c) => c.status === 'Resolved').length;
  const highPrio   = visible.filter((c) => c.priority === 'High' || c.priority === 'Emergency').length;
  const escalated  = visible.filter((c) => c.is_escalated).length;

  const stats = [
    ['Total',        visible.length, 0],
    ['Pending',      pending,        1],
    ['In Progress',  active,         2],
    ['Resolved',     resolved,       3],
    ['High Priority', highPrio,      4],
    ['Escalated',    escalated,      5],
  ] as const;

  const meta = DEPT_META[profile?.department ?? ''];
  const resolutionRate = visible.length > 0 ? Math.round((resolved / visible.length) * 100) : 0;

  const recentComplaints = visible
    .filter((c) => c.status !== 'Resolved')
    .slice(0, 4);

  return (
    <DepartmentScreen title="Dashboard" tab="dashboard">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* ── Hero card ── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <View style={[styles.hero, { backgroundColor: meta?.color ?? COLORS.primary }]}>
            <View style={styles.heroTop}>
              <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <MaterialCommunityIcons
                  name={(meta?.icon ?? 'office-building-outline') as any}
                  size={22}
                  color={COLORS.white}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroWelcome}>
                  Welcome back, {profile?.name?.split(' ')[0]}
                </Text>
                <Text style={styles.heroDept} numberOfLines={2}>
                  {profile?.department}
                </Text>
              </View>
            </View>
            <Text style={styles.heroSub}>All 10 wards · Department workspace</Text>
          </View>
        </Animated.View>

        {/* ── Stats grid ── */}
        <View style={styles.statsGrid}>
          {stats.map(([label, value, colorIdx], i) => {
            const s = STAT_COLORS[colorIdx as number];
            return (
              <Animated.View
                key={label}
                entering={FadeInDown.duration(340).delay(60 + i * 45)}
                style={styles.statWrap}
              >
                <GlassCard style={{ ...styles.statCard, backgroundColor: s.bg }}>
                  <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
                  <Text style={[styles.statNum, { color: s.color }]}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </GlassCard>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Ward filter cards ── */}
        <Text style={styles.sectionTitle}>Filter by Ward</Text>
        <Text style={styles.sectionSub}>
          Tap a ward to view its complaints. Tap again to clear.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wardRow}
        >
          {/* All wards chip */}
          <Pressable
            onPress={() => setSelectedWard(null)}
            style={[styles.wardChip, selectedWard === null && styles.wardChipActive]}
          >
            <MaterialCommunityIcons
              name="map-outline"
              size={14}
              color={selectedWard === null ? COLORS.white : COLORS.primary}
            />
            <Text style={[styles.wardChipText, selectedWard === null && styles.wardChipTextActive]}>
              All Wards
            </Text>
            <Text style={[styles.wardChipCount, selectedWard === null && styles.wardChipCountActive]}>
              {mine.length}
            </Text>
          </Pressable>

          {ALL_WARDS.map((ward, idx) => {
            const wardCount = mine.filter((c) => c.ward === ward).length;
            const isActive = selectedWard === ward;
            return (
              <Animated.View
                key={ward}
                entering={FadeInRight.duration(300).delay(50 + idx * 35)}
              >
                <Pressable
                  onPress={() => setSelectedWard(isActive ? null : ward)}
                  style={[styles.wardCard, isActive && styles.wardCardActive]}
                >
                  <View style={[styles.wardCardIcon, isActive && styles.wardCardIconActive]}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color={isActive ? COLORS.white : COLORS.primary}
                    />
                  </View>
                  <Text style={[styles.wardCardName, isActive && styles.wardCardNameActive]}>
                    {ward}
                  </Text>
                  <View style={[styles.wardCardBadge, isActive && styles.wardCardBadgeActive]}>
                    <Text style={[styles.wardCardBadgeText, isActive && styles.wardCardBadgeTextActive]}>
                      {wardCount}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* ── Resolution bar ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(200)}>
          <GlassCard style={styles.rateCard}>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>
                Resolution Rate{selectedWard ? ` · ${selectedWard}` : ' · All Wards'}
              </Text>
              <Text style={[styles.rateVal, { color: resolutionRate >= 70 ? COLORS.success : '#F59E0B' }]}>
                {resolutionRate}%
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${resolutionRate}%` as any,
                    backgroundColor: resolutionRate >= 70 ? COLORS.success : '#F59E0B',
                  },
                ]}
              />
            </View>
            <Text style={styles.rateSub}>
              {resolved} resolved out of {visible.length} total
            </Text>
          </GlassCard>
        </Animated.View>

        {/* ── Pending complaints ── */}
        <Text style={styles.sectionTitle}>
          Pending Complaints{selectedWard ? ` · ${selectedWard}` : ''}
        </Text>

        {recentComplaints.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(340).delay(240)} style={styles.emptyCard}>
            <MaterialCommunityIcons name="check-all" size={30} color={COLORS.success} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>
              No pending complaints{selectedWard ? ` in ${selectedWard}` : ''} right now.
            </Text>
          </Animated.View>
        ) : (
          recentComplaints.map((c, idx) => (
            <Animated.View
              key={c.id}
              entering={FadeInDown.duration(320).delay(240 + idx * 55)}
            >
              <Pressable
                onPress={() => router.push({ pathname: '/(dept)/complaint-details', params: { id: c.id } } as any)}
                style={({ pressed }) => [styles.complaintCard, pressed && { opacity: 0.88 }]}
              >
                <View style={[styles.priorityDot, {
                  backgroundColor:
                    c.priority === 'Emergency' ? '#DC2626' :
                    c.priority === 'High'      ? '#F59E0B' :
                    COLORS.primary,
                }]} />
                <View style={styles.complaintBody}>
                  <Text style={styles.complaintTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.complaintMeta}>{c.ward} · {c.category}</Text>
                </View>
                <View style={[styles.statusPill, {
                  backgroundColor:
                    c.status === 'Pending'     ? '#FFF8ED' :
                    c.status === 'In Progress' ? '#EFF6FF' : '#ECFDF5',
                }]}>
                  <Text style={[styles.statusPillText, {
                    color:
                      c.status === 'Pending'     ? '#F59E0B' :
                      c.status === 'In Progress' ? COLORS.primary : COLORS.success,
                  }]}>
                    {c.status}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))
        )}

        {/* ── Review all CTA ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(320)}>
          <Pressable
            onPress={() => router.push('/(dept)/complaints')}
            style={styles.reviewBtn}
          >
            <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={COLORS.white} />
            <Text style={styles.reviewBtnText}>Review All Complaints</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </DepartmentScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },

  /* Hero */
  hero: {
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.medium,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroWelcome: { color: COLORS.white, fontSize: 19, fontWeight: '800', lineHeight: 24 },
  heroDept: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '700', marginTop: 2, lineHeight: 17 },
  heroSub: { color: 'rgba(255,255,255,0.72)', fontSize: 11.5, fontWeight: '600' },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statWrap: { width: '31%', flexGrow: 1 },
  statCard: { padding: 12, gap: 5, borderRadius: 16 },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10.5, fontWeight: '700', color: COLORS.textMuted },

  /* Section headings */
  sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 14, color: COLORS.text, marginBottom: 2 },
  sectionSub: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, marginTop: -8 },

  /* Ward row */
  wardRow: { gap: 8, paddingBottom: 4, paddingRight: 4 },

  /* All wards chip */
  wardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  wardChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  wardChipText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  wardChipTextActive: { color: COLORS.white },
  wardChipCount: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    backgroundColor: '#E2EEFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  wardChipCountActive: { color: COLORS.primary, backgroundColor: 'rgba(255,255,255,0.25)' },

  /* Individual ward cards */
  wardCard: {
    width: 90,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 6,
    ...SHADOWS.soft,
  },
  wardCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  wardCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardCardIconActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  wardCardName: { fontSize: 12, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  wardCardNameActive: { color: COLORS.white },
  wardCardBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#E2EEFF',
  },
  wardCardBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  wardCardBadgeText: { fontSize: 11, fontWeight: '900', color: COLORS.primary },
  wardCardBadgeTextActive: { color: COLORS.white },

  /* Resolution rate */
  rateCard: { padding: 16 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rateLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, flex: 1 },
  rateVal: { fontSize: 16, fontWeight: '900' },
  progressBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  rateSub: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

  /* Complaints */
  complaintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  complaintBody: { flex: 1 },
  complaintTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  complaintMeta: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusPillText: { fontSize: 10.5, fontWeight: '800' },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, textAlign: 'center' },

  /* Review button */
  reviewBtn: {
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    ...SHADOWS.button,
    marginTop: 4,
  },
  reviewBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
