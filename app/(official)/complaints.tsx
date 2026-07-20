import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComplaintCard from '@/components/official/ComplaintCard';
import { COLORS, SHADOWS } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

export default function ComplaintsScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const { complaints } = useOfficial();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, searchQuery, selectedCategory, selectedStatus]);

  const handleBack = () => {
    router.push('/(official)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Ward complaints</Text>
            <Text style={styles.headerSubtitle}>Nagarsevak ward review</Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedStatus('All');
          }}
          style={styles.resetButton}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.searchCard}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search by ID, title, citizen or ward"
            placeholderTextColor={COLORS.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.chipWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <Pressable onPress={() => setSelectedCategory('all')} style={[styles.chip, selectedCategory === 'all' && styles.activeChip]}>
              <Text style={[styles.chipText, selectedCategory === 'all' && styles.activeChipText]}>All categories</Text>
            </Pressable>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable key={cat.id} onPress={() => setSelectedCategory(cat.id)} style={[styles.chip, isSelected && styles.activeChip]}>
                  <Text style={[styles.chipText, isSelected && styles.activeChipText]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.statusRow}>
          {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((status) => {
            const isSelected = selectedStatus === status;
            const count = status === 'All' ? complaints.length : complaints.filter((c) => c.status === status).length;
            return (
              <Pressable key={status} onPress={() => setSelectedStatus(status)} style={[styles.statusChip, isSelected && styles.statusChipActive]}>
                <Text style={[styles.statusText, isSelected && styles.statusTextActive]}>{status} ({count})</Text>
              </Pressable>
            );
          })}
        </View>

        {filteredComplaints.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={30} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No matching complaints</Text>
            <Text style={styles.emptyText}>Try adjusting the search text or the selected filters.</Text>
          </View>
        ) : (
          filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onView={() => router.push({ pathname: '/(official)/complaint-details', params: { id: complaint.id } } as any)}
              onNotes={() => router.push({ pathname: '/(official)/add-note', params: { id: complaint.id } } as any)}
              onEscalate={() => router.push({ pathname: '/(official)/escalate', params: { id: complaint.id } } as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginTop: 1 },
  resetButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border },
  resetText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  content: { padding: 16, paddingBottom: 40 },
  searchCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', ...SHADOWS.sm },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 2 },
  chipWrap: { marginTop: 12 },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  activeChipText: { color: COLORS.white },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 4 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border },
  statusChipActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  statusTextActive: { color: COLORS.primary },
  emptyCard: { marginTop: 18, backgroundColor: COLORS.card, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', ...SHADOWS.sm },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { marginTop: 6, fontSize: 13, fontWeight: '600', color: COLORS.textMuted, textAlign: 'center' },
});
