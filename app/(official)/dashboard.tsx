import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComplaintCard from '@/components/official/ComplaintCard';
import HeroBanner from '@/components/official/HeroBanner';
import ProfileDropdown from '@/components/official/ProfileDropdown';
import Sidebar from '@/components/official/Sidebar';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  all:          { bg: '#EFF6FF', color: COLORS.primary },
  water:        { bg: '#DBEAFE', color: '#2563EB' },
  garbage:      { bg: '#DCFCE7', color: '#16A34A' },
  streetlights: { bg: '#FEF9C3', color: '#CA8A04' },
  road:         { bg: '#DBEAFE', color: '#1D4ED8' },
  gutter:       { bg: '#CFFAFE', color: '#0891B2' },
  animals:      { bg: '#FFE4E6', color: '#E11D48' },
  traffic:      { bg: '#FEE2E2', color: '#DC2626' },
  drainage:     { bg: '#E0E7FF', color: '#4338CA' },
  tree:         { bg: '#DCFCE7', color: '#15803D' },
  other:        { bg: '#EDE9FE', color: '#7C3AED' },
};

const STAT_ITEMS = (
  pending: number,
  inProgress: number,
  resolved: number,
  escalated: number,
  todayUpdates: number,
  monthlyPerformance: number,
  avgResolutionTime: string,
) => [
  { label: 'Pending',              value: pending,                      color: '#F59E0B', icon: 'clock-outline' as const,          bg: '#FFF8ED' },
  { label: 'In Progress',          value: inProgress,                   color: '#2E86DE', icon: 'progress-wrench' as const,         bg: '#EFF6FF' },
  { label: 'Resolved',             value: resolved,                     color: '#10B981', icon: 'check-circle-outline' as const,    bg: '#ECFDF5' },
  { label: 'Escalated',            value: escalated,                    color: '#DC2626', icon: 'alert-circle-outline' as const,    bg: '#FEF2F2' },
  { label: "Today's Updates",      value: todayUpdates,                 color: '#7C3AED', icon: 'calendar-today' as const,          bg: '#F5F3FF' },
  { label: 'Monthly Performance',  value: `${monthlyPerformance}%`,     color: '#0F766E', icon: 'chart-donut' as const,             bg: '#F0FDFA' },
  { label: 'Avg. Resolution',      value: avgResolutionTime,            color: '#EA580C', icon: 'timer-outline' as const,           bg: '#FFF7ED' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, complaints, announcements, logout } = useOfficial();

  const total          = complaints.length;
  const pending        = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress     = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved       = complaints.filter((c) => c.status === 'Resolved').length;
  const escalated      = complaints.filter((c) => c.is_escalated).length;
  const todayUpdates   = complaints.filter((c) => {
    const u = new Date(c.updatedAt);
    const t = new Date();
    return u.getDate() === t.getDate() && u.getMonth() === t.getMonth() && u.getFullYear() === t.getFullYear();
  }).length;
  const monthlyPerf    = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgResTime     = total > 0 ? `${Math.max(1, Math.round((resolved + 1) / 2))}d` : '—';
  const successRate    = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const priorityComplaints = complaints
    .filter((c) => c.priority === 'Emergency' || c.priority === 'High')
    .slice(0, 3);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const goToComplaints = (categoryId?: string) => {
    router.push({
      pathname: '/(official)/complaints',
      params: categoryId && categoryId !== 'all' ? { category: categoryId } : {},
    } as any);
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Emergency': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'High':      return { bg: '#FFF7ED', text: '#EA580C' };
      case 'Pinned':    return { bg: '#EFF6FF', text: '#1E6FD9' };
      default:          return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const statItems = STAT_ITEMS(pending, inProgress, resolved, escalated, todayUpdates, monthlyPerf, avgResTime);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <View style={styles.brandWrap}>
          <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
            <Ionicons name="menu" size={22} color={COLORS.primary} />
          </Pressable>
          <Image
            source={require('@/assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>SEVA SETU</Text>
            <Text style={styles.headerSub}>Malvan Municipal Council</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/(official)/announcements')}
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
            <View style={styles.notifDot} />
          </Pressable>
          <ProfileDropdown
            name={profile.name}
            initial={profile.avatarInitial}
            language={profile.language}
            roleLabel={profile.roleLabel}
            ward={profile.ward}
            department={profile.department}
            onLogout={handleLogout}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* ── Hero Banner ── */}
        <HeroBanner
          name={profile.name}
          wardLabel={`${profile.ward} • ${profile.locality}`}
          designation="Nagarsevak (Ward Representative)"
          filedCount={total}
          resolvedCount={resolved}
          successRate={`${successRate}%`}
          onViewComplaints={() => goToComplaints()}
        />

        {/* ── Ward Overview ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Ward Overview"
            subtitle="Performance at a glance"
          />
          <View style={styles.statsGrid}>
            {statItems.map((item, idx) => (
              <Animated.View
                key={item.label}
                entering={FadeInDown.duration(380).delay(60 + idx * 50)}
                style={styles.statCardWrap}
              >
                <View style={[styles.statCard, { backgroundColor: item.bg }]}>
                  <View style={[styles.statIconCircle, { backgroundColor: `${item.color}20` }]}>
                    <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ── Complaint Categories ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Complaint Categories"
            actionLabel="View all"
            onAction={() => goToComplaints()}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((cat, idx) => (
              <Animated.View
                key={cat.id}
                entering={FadeInRight.duration(360).delay(40 + idx * 40)}
              >
                <Pressable
                  onPress={() => goToComplaints(cat.id)}
                  style={styles.categoryCard}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: CATEGORY_STYLE[cat.id]?.bg ?? '#F1F5F9' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={18}
                      color={CATEGORY_STYLE[cat.id]?.color ?? COLORS.primary}
                    />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {cat.label}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* ── Latest Announcements ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Latest Announcements"
            actionLabel="View all"
            onAction={() => router.push('/(official)/announcements')}
          />
          {announcements.slice(0, 2).map((a, idx) => {
            const c = getPriorityColor(a.priority);
            return (
              <Animated.View
                key={a.id}
                entering={FadeInDown.duration(360).delay(60 + idx * 60)}
              >
                <View style={styles.announcementCard}>
                  <View style={styles.announcementTopRow}>
                    <View style={[styles.badge, { backgroundColor: c.bg }]}>
                      <Text style={[styles.badgeText, { color: c.text }]}>{a.priority}</Text>
                    </View>
                    <Text style={styles.announcementDate}>{a.date}</Text>
                  </View>
                  <Text style={styles.announcementTitle}>{a.title}</Text>
                  <Text style={styles.announcementBody} numberOfLines={2}>
                    {a.body}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Priority Complaints ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Priority Complaints"
            subtitle="Emergency & High priority"
            actionLabel="View all"
            onAction={() => goToComplaints()}
          />
          {priorityComplaints.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="check-circle-outline" size={28} color={COLORS.success} />
              <Text style={styles.emptyTitle}>All clear!</Text>
              <Text style={styles.emptyText}>No urgent complaints pending right now.</Text>
            </View>
          ) : (
            priorityComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={() =>
                  router.push({
                    pathname: '/(official)/complaint-details',
                    params: { id: complaint.id },
                  } as any)
                }
                onNotes={() =>
                  router.push({
                    pathname: '/(official)/add-note',
                    params: { id: complaint.id },
                  } as any)
                }
                onEscalate={() =>
                  router.push({
                    pathname: '/(official)/escalate',
                    params: { id: complaint.id },
                  } as any)
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        wardComplaintsCount={pending + inProgress}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

/* ── Sub-components ── */

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.linkText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logo: { width: 30, height: 30, marginRight: 8 },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  /* Scroll content */
  content: { paddingBottom: 44 },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },

  /* Stats grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCardWrap: {
    width: '48%',
    flexGrow: 1,
  },
  statCard: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
    ...SHADOWS.soft,
  },
  statIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 4,
  },

  /* Category chips */
  categoryRow: { gap: 10, paddingRight: 4, paddingBottom: 2 },
  categoryCard: {
    width: 84,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  /* Announcements */
  announcementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.soft,
  },
  announcementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: '800' },
  announcementDate: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Empty state */
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    gap: 6,
    ...SHADOWS.soft,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
