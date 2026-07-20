import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComplaintCard from '@/components/official/ComplaintCard';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Resolved'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function ComplaintsScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { complaints } = useOfficial();

  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState<string>(initialCategory || 'all');
  const [status, setStatus]         = useState<StatusTab>('All');

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

  const reset = () => {
    setSearch('');
    setCategory('all');
    setStatus('All');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push('/(official)/dashboard')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Ward Complaints</Text>
            <Text style={styles.headerSub}>Nagarsevak ward review</Text>
          </View>
        </View>
        <Pressable onPress={reset} style={styles.resetBtn}>
          <MaterialCommunityIcons name="filter-remove-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
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
          {categories.map((cat) => {
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
          {STATUS_TABS.map((s) => {
            const active = status === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.statusTab, active && styles.statusTabActive]}
              >
                <Text style={[styles.statusTabText, active && styles.statusTabTextActive]}>
                  {s}{' '}
                  <Text style={[styles.statusCount, active && styles.statusCountActive]}>
                    ({counts[s]})
                  </Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Results ── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-search-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No matching complaints</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found
            </Text>
            {filtered.map((complaint) => (
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
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: { ...TYPOGRAPHY.h3, fontSize: 15, color: COLORS.text },
  headerSub: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },

  content: { padding: 16, paddingBottom: 44 },

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
});
