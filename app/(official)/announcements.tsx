import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/common/GlassCard';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

const PRIORITY_STYLES: Record<string, {
  bg: string; text: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}> = {
  Emergency: { bg: '#FEF2F2', text: '#DC2626', icon: 'alert-octagon-outline' },
  High:      { bg: '#FFF7ED', text: '#EA580C', icon: 'alert-circle-outline'  },
  Pinned:    { bg: '#EFF6FF', text: '#1E6FD9', icon: 'pin-outline'           },
  Normal:    { bg: '#F1F5F9', text: '#475569', icon: 'bell-outline'           },
};

const TABS = ['All', 'Emergency', 'High', 'Pinned', 'Normal'] as const;
type Tab = typeof TABS[number];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { announcements } = useOfficial();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('All');

  const filtered = tab === 'All'
    ? announcements
    : announcements.filter((a) => a.priority === tab);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('announcementsTitle')}</Text>
          <Text style={styles.headerSub}>{t('municipalAlerts')}</Text>
        </View>
      </View>

      {/* Tab strip */}
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
            <Text style={styles.emptyTitle}>{t('noAnnouncementsTab')}</Text>
            <Text style={styles.emptyText}>
              {t('noNoticesTime').replace('{tab}', tab.toLowerCase())}
            </Text>
          </View>
        ) : (
          filtered.map((a, idx) => {
            const s = PRIORITY_STYLES[a.priority] ?? PRIORITY_STYLES.Normal;
            return (
              <Animated.View key={a.id} entering={FadeInLeft.duration(380).delay(idx * 70)}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.text },
  headerSub: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },

  tabsWrap: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: { gap: 8, paddingHorizontal: 16, paddingVertical: 10, paddingRight: 20 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 999, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.white },

  content: { padding: 18, paddingBottom: 44 },

  card: { padding: 16, marginBottom: 14 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: '800' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  annTitle: {
    fontSize: 15, fontWeight: '800', color: COLORS.text, lineHeight: 22,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  annBody: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, lineHeight: 20 },

  emptyCard: {
    marginTop: 40, backgroundColor: COLORS.card, borderRadius: 20,
    padding: 32, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  emptyText: {
    fontSize: 13, fontWeight: '600', color: COLORS.textMuted,
    textAlign: 'center', lineHeight: 20,
  },
});
