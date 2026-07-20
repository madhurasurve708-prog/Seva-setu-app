import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComplaintCard from '@/components/official/ComplaintCard';
import HeroBanner from '@/components/official/HeroBanner';
import ProfileDropdown from '@/components/official/ProfileDropdown';
import Sidebar from '@/components/official/Sidebar';
import { COLORS, SHADOWS } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

const CATEGORY_ICON_STYLE: Record<string, { bg: string; color: string }> = {
  all: { bg: '#EFF6FF', color: COLORS.primary },
  water: { bg: '#DBEAFE', color: '#2563EB' },
  garbage: { bg: '#DCFCE7', color: '#16A34A' },
  streetlights: { bg: '#FEF9C3', color: '#CA8A04' },
  road: { bg: '#DBEAFE', color: '#1D4ED8' },
  gutter: { bg: '#CFFAFE', color: '#0891B2' },
  animals: { bg: '#FFE4E6', color: '#E11D48' },
  traffic: { bg: '#FEE2E2', color: '#DC2626' },
  drainage: { bg: '#E0E7FF', color: '#4338CA' },
  tree: { bg: '#DCFCE7', color: '#15803D' },
  other: { bg: '#EDE9FE', color: '#7C3AED' },
};

export default function DashboardScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, complaints, announcements, logout } = useOfficial();

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const escalated = complaints.filter((c) => c.is_escalated).length;
  const todayUpdates = complaints.filter((c) => {
    const updated = new Date(c.updatedAt);
    const today = new Date();
    return updated.getDate() === today.getDate() && updated.getMonth() === today.getMonth() && updated.getFullYear() === today.getFullYear();
  }).length;
  const monthlyPerformance = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgResolutionTime = total > 0 ? `${Math.max(1, Math.round((resolved + 1) / 2))} days` : '—';
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const priorityComplaints = complaints.filter((c) => c.priority === 'Emergency' || c.priority === 'High').slice(0, 4);

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

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case 'Pinned': return { bg: '#EFF6FF', text: '#1E6FD9' };
      case 'Emergency': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'High': return { bg: '#FFF7ED', text: '#EA580C' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerBar}>
        <View style={styles.brandWrap}>
          <Pressable onPress={() => setSidebarOpen(true)} style={styles.iconButton}>
            <Ionicons name="menu" size={24} color={COLORS.primary} />
          </Pressable>
          <Image source={require('@/assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.headerTitle}>SEVA SETU</Text>
            <Text style={styles.headerSubtitle}>Malvan Municipal Council</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/(official)/announcements')} style={styles.circleButton}>
            <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
            <View style={styles.unreadDot} />
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeroBanner
          name={profile.name}
          wardLabel={`${profile.ward} • ${profile.locality}`}
          designation={profile.designation}
          department={profile.department}
          filedCount={total}
          resolvedCount={resolved}
          successRate={`${successRate}%`}
          onViewComplaints={() => goToComplaints()}
        />

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Ward overview</Text>
            <Text style={styles.sectionCaption}>Nagarsevak performance at a glance</Text>
          </View>
          <View style={styles.statsGrid}>
            {[
              { label: 'Pending', value: pending, color: '#F59E0B' },
              { label: 'In Progress', value: inProgress, color: '#1E6FD9' },
              { label: 'Resolved', value: resolved, color: '#10B981' },
              { label: 'Escalated', value: escalated, color: '#DC2626' },
              { label: "Today's Updates", value: todayUpdates, color: '#7C3AED' },
              { label: 'Monthly Performance', value: `${monthlyPerformance}%`, color: '#0F766E' },
              { label: 'Avg. Resolution Time', value: avgResolutionTime, color: '#EA580C' },
            ].map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Complaint categories</Text>
            <Pressable onPress={() => goToComplaints()}>
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((cat) => (
              <Pressable key={cat.id} onPress={() => goToComplaints(cat.id)} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: CATEGORY_ICON_STYLE[cat.id]?.bg ?? '#F1F5F9' }]}>
                  <Ionicons name={cat.icon as any} size={18} color={CATEGORY_ICON_STYLE[cat.id]?.color ?? COLORS.primary} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Latest announcements</Text>
            <Pressable onPress={() => router.push('/(official)/announcements')}>
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          </View>
          {announcements.slice(0, 2).map((a) => {
            const badgeColor = getPriorityBadgeColor(a.priority);
            return (
              <View key={a.id} style={styles.announcementCard}>
                <View style={styles.announcementTopRow}>
                  <View style={[styles.badge, { backgroundColor: badgeColor.bg }]}>
                    <Text style={[styles.badgeText, { color: badgeColor.text }]}>{a.priority}</Text>
                  </View>
                  <Text style={styles.subtleText}>{a.date}</Text>
                </View>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Text style={styles.announcementBody} numberOfLines={2}>{a.body}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Priority complaints</Text>
            <Pressable onPress={() => goToComplaints()}>
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          </View>
          {priorityComplaints.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No urgent complaints are pending.</Text>
            </View>
          ) : (
            priorityComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={() => router.push({ pathname: '/(official)/complaint-details', params: { id: complaint.id } } as any)}
                onNotes={() => router.push({ pathname: '/(official)/add-note', params: { id: complaint.id } } as any)}
                onEscalate={() => router.push({ pathname: '/(official)/escalate', params: { id: complaint.id } } as any)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} wardComplaintsCount={pending + inProgress} onLogout={handleLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
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
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logo: { width: 32, height: 32, marginRight: 8 },
  headerTitle: { color: COLORS.primary, fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },
  headerSubtitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  unreadDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626', borderWidth: 1.5, borderColor: '#FFFFFF' },
  content: { paddingBottom: 40 },
  sectionBlock: { paddingHorizontal: 16, marginTop: 18 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  sectionCaption: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', ...SHADOWS.sm },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginTop: 4 },
  linkText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  categoryRow: { paddingRight: 16, gap: 10 },
  categoryCard: { width: 96, backgroundColor: COLORS.card, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', alignItems: 'center', ...SHADOWS.sm },
  categoryIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  announcementCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', ...SHADOWS.sm },
  announcementTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  subtleText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  announcementTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  announcementBody: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  emptyCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', alignItems: 'center' },
  emptyText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
});