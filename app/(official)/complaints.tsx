import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    Platform,
    useWindowDimensions,
    View,
} from 'react-native';

import ComplaintCard from '@/components/official/ComplaintCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

const STATUS_TABS = ['Pending', 'In Progress', 'Resolved'] as const;
type StatusTab = 'All' | (typeof STATUS_TABS)[number];

export default function ComplaintsScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { complaints, complaintsError, complaintsLoading, loadComplaints } = useOfficial();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const statusTabs: readonly StatusTab[] = isDesktop ? STATUS_TABS : ['All', ...STATUS_TABS];
  // The category source also includes an "all" entry. The explicit category
  // control below owns that option, so omit the duplicate on desktop only.
  const visibleCategories = isDesktop
    ? categories.filter((item) => item.id !== 'all' && item.label.toLowerCase() !== 'all')
    : categories;

  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState<string>(initialCategory || 'all');
  const [status, setStatus]         = useState<StatusTab>('All');

  useEffect(() => { void loadComplaints().catch(() => {}); }, [loadComplaints]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return complaints.filter((c) => {
      const matchSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      const matchCat    = category === 'all' || c.category === category;
      const matchStatus = status === 'All' || c.status === status;
      return matchSearch && matchCat && matchStatus;
    });
  }, [complaints, search, category, status]);

  const counts = useMemo(() => ({
    All:         complaints.length,
    Pending:     complaints.filter((c) => c.status === 'Pending').length,
    'In Progress': complaints.filter((c) => c.status === 'In Progress').length,
    Resolved:    complaints.filter((c) => c.status === 'Resolved').length,
  }), [complaints]);

  return (
    <OfficialScreen title="Ward Complaints" tab="complaints" hideHeader={true}>
      {/* ── Header ── */}
      {!isDesktop && <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={{ marginLeft: 4 }}>
            <Text style={styles.headerTitle}>Ward Complaints</Text>
            <Text style={styles.headerSub}>Nagarsevak ward review</Text>
          </View>
        </View>
      </View>}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, isDesktop && styles.desktopContent]}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        {complaintsLoading && <Text style={styles.headerSub}>Loading complaints…</Text>}
        {complaintsError && <Text style={styles.headerSub}>{complaintsError}</Text>}
        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search by ID, title, citizen or location…"
            placeholderTextColor={COLORS.textPlaceholder}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>

        {/* ── Category filter ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          <Pressable
            onPress={() => setCategory('all')}
            style={[styles.chip, category === 'all' && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === 'all' && styles.chipTextActive]}>
              All
            </Text>
          </Pressable>
          {visibleCategories.map((cat) => {
            const active = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Status tabs ── */}
        <View style={styles.statusRow}>
          {statusTabs.map((item) => {
            const active = status === item;
            return (
              <Pressable
                key={item}
                onPress={() => setStatus(isDesktop ? (active ? 'All' : item) : item)}
                style={[styles.statusTab, active && styles.statusTabActive]}
              >
                <Text style={[styles.statusTabText, active && styles.statusTabTextActive]}>
                  {item === 'All' ? 'All' : item}
                  {' · '}
                  <Text style={[styles.statusCount, active && styles.statusCountActive]}>
                    {counts[item]}
                  </Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.resultCount}>
          Showing {filtered.length} complaint{filtered.length === 1 ? '' : 's'}
        </Text>

        <View style={[styles.complaintGrid, isDesktop && styles.complaintGridDesktop]}>{filtered.map((complaint) => (
          <View key={complaint.id} style={isDesktop ? styles.complaintCell : undefined}><ComplaintCard
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
          /></View>
        ))}</View>

        {filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="search" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Complaints Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search query or filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </OfficialScreen>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },

  /* Content */
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  desktopContent: { width: '100%', maxWidth: 1320, alignSelf: 'center', paddingHorizontal: 32, paddingTop: 28 },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },

  chipScroll: { marginBottom: 10 },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white },

  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusTabActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  statusTabText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  statusTabTextActive: { color: COLORS.primary },
  statusCount: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  statusCountActive: { color: COLORS.primary },

  resultCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 10,
    marginLeft: 2,
  },

  emptyCard: {
    marginTop: 24,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    gap: 8,
    ...SHADOWS.soft,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  complaintGrid: { width: '100%' },
  complaintGridDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  complaintCell: { width: 'calc(50% - 9px)' as any },
});
