import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

import GlassCard from '@/components/common/GlassCard';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

// Priority display config — mirrors official portal style
const PRIORITY_STYLES: Record<string, {
  bg: string;
  text: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}> = {
  Emergency: { bg: '#FEF2F2', text: '#DC2626', icon: 'alert-octagon-outline' },
  High:      { bg: '#FFF7ED', text: '#EA580C', icon: 'alert-circle-outline' },
  Pinned:    { bg: '#EFF6FF', text: '#1E6FD9', icon: 'pin-outline' },
  Normal:    { bg: '#F1F5F9', text: '#475569', icon: 'bell-outline' },
};

const TABS = ['All', 'Emergency', 'High', 'Pinned', 'Normal'] as const;
type Tab = typeof TABS[number];

export default function DepartmentAnnouncements() {
  const { announcements } = useOfficial();
  const [tab, setTab] = useState<Tab>('All');

  const filtered = tab === 'All'
    ? announcements
    : announcements.filter((a) => a.priority === tab);

  return (
    <DepartmentScreen title="Announcements" tab="announcements">
      {/* ── Read-only notice banner ── */}
      <View style={styles.infoBanner}>
        <MaterialCommunityIcons name="information-outline" size={15} color="#1E6FD9" />
        <Text style={styles.infoText}>
          Notices published by Main Admin (Nagaradhyaksha) · Read-only
        </Text>
      </View>

      {/* ── Priority tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabsWrap}
      >
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="bell-off-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No announcements</Text>
            <Text style={styles.emptyText}>
              No {tab.toLowerCase()} notices have been published yet.
            </Text>
          </View>
        ) : (
          filtered.map((a, idx) => {
            const s = PRIORITY_STYLES[a.priority] ?? PRIORITY_STYLES.Normal;
            return (
              <Animated.View key={a.id} entering={FadeInLeft.duration(360).delay(idx * 65)}>
                <GlassCard style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <MaterialCommunityIcons name={s.icon} size={11} color={s.text} />
                      <Text style={[styles.badgeText, { color: s.text }]}>{a.priority}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <MaterialCommunityIcons name="calendar-outline" size={11} color={COLORS.textMuted} />
                      <Text style={styles.dateText}>{a.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.annTitle}>{a.title}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.annBody}>{a.body}</Text>
                </GlassCard>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </DepartmentScreen>
  );
}

const styles = StyleSheet.create({
  /* Info banner */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E6FD9',
    lineHeight: 17,
  },

  /* Tabs */
  tabsWrap: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: { gap: 8, paddingHorizontal: 16, paddingVertical: 10, paddingRight: 20 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.white },

  /* Content */
  content: { padding: 16, paddingBottom: 44 },

  /* Announcement cards */
  card: { padding: 16, marginBottom: 12 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  annTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  annBody: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, lineHeight: 20 },

  /* Empty state */
  emptyCard: {
    marginTop: 40,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
