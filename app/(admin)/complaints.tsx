import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Alert, Modal, Pressable, ScrollView,
    StyleSheet, Text, TextInput, View, FlatList, Platform, useWindowDimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { categories } from '@/data/categories';
import type { Complaint } from '@/data/complaints';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

const STATUSES   = ['All', 'Pending', 'In Progress', 'Resolved'] as const;
const PRIORITIES = ['All', 'Emergency', 'High', 'Medium', 'Low'] as const;

function statusLabel(t: (key: string) => string, key: string): string {
  return ({ All: t('all'), Pending: t('pending'), 'In Progress': t('inProgress'), Resolved: t('resolved') } as Record<string, string>)[key] ?? key;
}

function priorityLabel(t: (key: string) => string, key: string): string {
  return ({ All: t('all'), Emergency: t('priorityEmergency'), High: t('priorityHigh'), Medium: t('priorityMedium'), Low: t('priorityLow') } as Record<string, string>)[key] ?? key;
}

const CAT_PAL: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }> = {
  water:        { color: '#2563EB', bg: '#DBEAFE', icon: 'water' },
  garbage:      { color: '#EA580C', bg: '#FFEDD5', icon: 'delete' },
  streetlights: { color: '#F59E0B', bg: '#FEF3C7', icon: 'lightbulb-on' },
  road:         { color: '#7C3AED', bg: '#EDE9FE', icon: 'road-variant' },
  gutter:       { color: '#0891B2', bg: '#CFFAFE', icon: 'waves' },
  animals:      { color: '#B45309', bg: '#FEF3C7', icon: 'paw' },
  traffic:      { color: '#DC2626', bg: '#FEE2E2', icon: 'traffic-light' },
  drainage:     { color: '#0F766E', bg: '#CCFBF1', icon: 'water-pump' },
  tree:         { color: '#16A34A', bg: '#DCFCE7', icon: 'tree' },
  other:        { color: '#475569', bg: '#F1F5F9', icon: 'dots-horizontal-circle' },
};

const PRIO_S: Record<string, { bg: string; text: string; border: string }> = {
  Emergency: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  High:      { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  Medium:    { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  Low:       { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
};

const STAT_S: Record<string, { bg: string; text: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }> = {
  'Pending':     { bg: '#FFF8ED', text: '#D97706', icon: 'clock-outline' },
  'In Progress': { bg: '#EFF6FF', text: '#2563EB', icon: 'progress-wrench' },
  'Resolved':    { bg: '#ECFDF5', text: '#10B981', icon: 'check-circle-outline' },
};

export default function AdminComplaints() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ ward?: string; category?: string; department?: string; status?: string }>();
  const { complaints, updateComplaintStatus, softDeleteComplaint } = useOfficial();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width > 768;

  const [searchVal, setSearchVal] = useState('');
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState<string>(params.status ?? 'All');
  const [priority,  setPriority]  = useState<string>('All');
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [activeId,  setActiveId]  = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; type: 'note' | 'restrict' | 'block' | 'remove' } | null>(null);
  const [noteText,  setNoteText]  = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
    }, 180);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const ctxLabel =
    params.ward       ? `${t('ctxWardLabel')} ${params.ward}` :
    params.category   ? `${t('ctxCategoryLabel')} ${params.category}` :
    params.department ? `${t('ctxDeptLabel')} ${params.department}` : null;

  const filtered = useMemo(() =>
    complaints.filter((c) => {
      const q       = search.toLowerCase().trim();
      const mSearch = !q || `${c.id} ${c.title} ${c.citizenName} ${c.location}`.toLowerCase().includes(q);
      const mWard   = !params.ward       || c.ward.startsWith(params.ward);
      const mCat    = !params.category   || c.category === params.category;
      const mDept   = !params.department || c.assignedDepartment === params.department;
      const mStatus = status   === 'All' || c.status === status;
      const mPrio   = priority === 'All' || c.priority === priority;
      const mEscal  = !escalatedOnly     || c.is_escalated;
      return mSearch && mWard && mCat && mDept && mStatus && mPrio && mEscal;
    }),
  [complaints, params, search, status, priority, escalatedOnly]);

  const handleToggle = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const openModal = useCallback((id: string, type: 'note' | 'restrict' | 'block' | 'remove') => {
    setNoteText('');
    setNoteModal({ id, type });
    setActiveId(null);
  }, []);

  const handleStatusChange = useCallback(async (id: string, s: Complaint['status']) => {
    await updateComplaintStatus(id, s);
    setActiveId(null);
  }, [updateComplaintStatus]);

  const handleView = useCallback((id: string) => {
    router.push({ pathname: '/(official)/complaint-details', params: { id } } as any);
  }, [router]);

  const handleEscalate = useCallback((id: string) => {
    router.push({ pathname: '/(official)/escalate', params: { id } } as any);
  }, [router]);

  const submitModal = async () => {
    if (!noteModal) return;
    const { id, type } = noteModal;
    if (type === 'remove') {
      await softDeleteComplaint(id, 'Nagaradhyaksha', noteText || 'Removed by admin');
      Alert.alert(t('removedTitle'), t('complaintArchivedMsg'));
    } else if (type === 'note') {
      await updateComplaintStatus(id, complaints.find((c) => c.id === id)!.status, noteText);
      Alert.alert(t('noteAddedTitle'), t('noteSavedMsg'));
    } else {
      Alert.alert(type === 'block' ? t('userBlockedTitle') : t('userRestrictedTitle'),
        t('actionLoggedMsg'));
    }
    setNoteModal(null);
    setNoteText('');
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <Text style={s.screenTitle}>{t('complaintsTitle')}</Text>
          {ctxLabel && <View style={s.ctxBadge}><Text style={s.ctxBadgeText}>{ctxLabel}</Text></View>}
        </View>
        <View style={s.countBubble}><Text style={s.countBubbleText}>{filtered.length}</Text></View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index * 20, 200))}>
            <MemoizedPremiumCard
              t={t}
              complaint={item}
              expanded={activeId === item.id}
              onToggle={() => handleToggle(item.id)}
              onView={() => handleView(item.id)}
              onNote={() => openModal(item.id, 'note')}
              onEscalate={() => handleEscalate(item.id)}
              onArchive={() => openModal(item.id, 'remove')}
              onRestrict={() => openModal(item.id, 'restrict')}
              onBlock={() => openModal(item.id, 'block')}
              onStatusChange={(st) => handleStatusChange(item.id, st)}
            />
          </Animated.View>
        )}
        ListHeaderComponent={
          <>
            <View style={s.searchBar}>
              <MaterialCommunityIcons name="magnify" size={18} color={COLORS.textMuted} />
              <TextInput value={searchVal} onChangeText={setSearchVal}
                placeholder={t('searchComplaintsAdmin')}
                placeholderTextColor={COLORS.textPlaceholder} style={s.searchInput} />
              {searchVal.length > 0 && (
                <Pressable onPress={() => setSearchVal('')} hitSlop={8}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.textMuted} />
                </Pressable>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chipRow} style={s.chipScroll}>
              <FChip label={t('all')} active={!params.category} onPress={() => router.setParams({ category: undefined })} />
              {categories.filter((c) => c.id !== 'all').map((c) => (
                <FChip key={c.id} label={t(c.id)} active={params.category === c.id}
                  onPress={() => router.setParams({ category: c.id })} />
              ))}
            </ScrollView>

            <View style={s.filterRow}>
              {STATUSES.map((st) => (
                <Pressable key={st} onPress={() => setStatus(st)}
                  style={[s.filterChip, status === st && s.filterChipActive]}>
                  <Text style={[s.filterChipText, status === st && s.filterChipTextActive]}>{statusLabel(t, st)}</Text>
                </Pressable>
              ))}
              {/* Escalated toggle */}
              <Pressable
                onPress={() => setEscalatedOnly((v) => !v)}
                style={[s.filterChip, escalatedOnly && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
              >
                <MaterialCommunityIcons
                  name="arrow-up-bold-circle-outline"
                  size={12}
                  color={escalatedOnly ? '#DC2626' : COLORS.textMuted}
                />
                <Text style={[s.filterChipText, escalatedOnly && { color: '#DC2626', fontWeight: '800' }]}>
                  {t('escalated')}
                </Text>
              </Pressable>
            </View>

            <View style={[s.filterRow, { marginBottom: 14 }]}>
              {PRIORITIES.map((p) => (
                <Pressable key={p} onPress={() => setPriority(p)}
                  style={[s.filterChip, priority === p && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <Text style={[s.filterChipText, priority === p && { color: '#DC2626', fontWeight: '800' }]}>{priorityLabel(t, p)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="clipboard-search-outline" size={32} color={COLORS.textMuted} />
            <Text style={s.emptyTitle}>{t('noMatchingComplaintsAdmin')}</Text>
            <Text style={s.emptyText}>{t('adjustFiltersAdmin')}</Text>
          </View>
        }
        contentContainerStyle={[s.content, isDesktop && { maxWidth: 1000, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      <ActionModal t={t} visible={!!noteModal} type={noteModal?.type ?? 'note'}
        note={noteText} onChangeNote={setNoteText}
        onClose={() => setNoteModal(null)} onSubmit={submitModal} />
    </SafeAreaView>
  );
}

const MemoizedPremiumCard = React.memo(PremiumCard, (prevProps, nextProps) => {
  return (
    prevProps.expanded === nextProps.expanded &&
    prevProps.complaint.id === nextProps.complaint.id &&
    prevProps.complaint.status === nextProps.complaint.status &&
    prevProps.complaint.updatedAt === nextProps.complaint.updatedAt &&
    prevProps.complaint.notes.length === nextProps.complaint.notes.length
  );
});

function PremiumCard({ t, complaint: c, expanded, onToggle, onView, onNote, onEscalate, onArchive, onRestrict, onBlock, onStatusChange }: {
  t: (key: string) => string;
  complaint: Complaint; expanded: boolean; onToggle: () => void;
  onView: () => void; onNote: () => void; onEscalate: () => void;
  onArchive: () => void; onRestrict: () => void; onBlock: () => void;
  onStatusChange: (s: Complaint['status']) => void;
}) {
  const cat  = CAT_PAL[c.category]  ?? CAT_PAL.other;
  const prio = PRIO_S[c.priority]   ?? PRIO_S.Low;
  const stat = STAT_S[c.status]     ?? STAT_S['Pending'];
  const fmt  = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={cs.card}>
      <View style={[cs.accentBar, { backgroundColor: prio.text }]} />
      <Pressable onPress={onToggle} style={cs.cardHeader}>
        <View style={[cs.imgPlaceholder, { backgroundColor: cat.bg }]}>
          <MaterialCommunityIcons name={cat.icon} size={22} color={cat.color} />
          {c.images.length > 0 && (
            <View style={cs.imgBadge}><Text style={cs.imgBadgeText}>{c.images.length}</Text></View>
          )}
        </View>
        <View style={cs.headerInfo}>
          <View style={cs.headerTopRow}>
            <Text style={cs.complaintId}>{c.id}</Text>
            {c.is_escalated && (
              <View style={cs.escalBadge}>
                <MaterialCommunityIcons name="arrow-up-bold-circle" size={11} color="#DC2626" />
                <Text style={cs.escalText}>{t('escalated')}</Text>
              </View>
            )}
          </View>
          <Text style={cs.title} numberOfLines={1}>{c.title}</Text>
          <Text style={cs.loc} numberOfLines={1}>{c.location}</Text>
        </View>
        <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
      </Pressable>

      <View style={cs.badgesRow}>
        <View style={[cs.badge, { backgroundColor: prio.bg, borderColor: prio.border }]}>
          <Text style={[cs.badgeText, { color: prio.text }]}>{priorityLabel(t, c.priority)}</Text>
        </View>
        <View style={[cs.badge, { backgroundColor: stat.bg, borderColor: 'transparent' }]}>
          <MaterialCommunityIcons name={stat.icon} size={11} color={stat.text} />
          <Text style={[cs.badgeText, { color: stat.text }]}>{statusLabel(t, c.status)}</Text>
        </View>
        {c.assignedDepartment && (
          <View style={[cs.badge, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
            <Text style={[cs.badgeText, { color: '#7C3AED' }]} numberOfLines={1}>{c.assignedDepartment}</Text>
          </View>
        )}
      </View>

      <View style={cs.citizenRow}>
        <View style={cs.citizenAvatar}><Text style={cs.citizenAvatarText}>{c.citizenName.charAt(0)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={cs.citizenName}>{c.citizenName}</Text>
          <Text style={cs.citizenPhone}>{c.citizenPhone} · {c.ward}</Text>
        </View>
        <Text style={cs.dateText}>{fmt(c.createdAt)}</Text>
      </View>

      {expanded && (
        <Animated.View entering={FadeInDown.duration(220)} style={cs.panel}>
          <Text style={cs.panelLabel}>{t('descriptionLabel')}</Text>
          <Text style={cs.panelText}>{c.description}</Text>

          {c.notes.length > 0 && (
            <View>
              <Text style={cs.panelLabel}>{t('activityTimeline')}</Text>
              {c.notes.map((note, ni) => (
                <View key={note.id} style={cs.tlItem}>
                  <View style={cs.tlDot} />
                  {ni < c.notes.length - 1 && <View style={cs.tlLine} />}
                  <View style={cs.tlContent}>
                    <Text style={cs.tlAuthor}>{note.author}</Text>
                    <Text style={cs.tlText}>{note.text}</Text>
                    <Text style={cs.tlDate}>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={cs.panelLabel}>{t('changeStatus')}</Text>
          <View style={cs.statusRow}>
            {(['Pending', 'In Progress', 'Resolved'] as Complaint['status'][]).map((st) => {
              const ss = STAT_S[st]; const active = c.status === st;
              return (
                <Pressable key={st} onPress={() => onStatusChange(st)}
                  style={[cs.statusBtn, { backgroundColor: ss.bg, borderColor: active ? ss.text : 'transparent', borderWidth: active ? 2 : 1 }]}>
                  <MaterialCommunityIcons name={ss.icon} size={13} color={ss.text} />
                  <Text style={[cs.statusBtnText, { color: ss.text }]}>{statusLabel(t, st)}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={cs.actionGrid}>
            <ABtn icon="eye-outline"                    label={t('view')}        color="#2563EB" onPress={onView} />
            <ABtn icon="note-text-outline"              label={t('noteLabel')}   color="#EA580C" onPress={onNote} />
            <ABtn icon="arrow-up-bold-circle-outline"   label={t('escalateBtn')} color="#DC2626" onPress={onEscalate} />
            <ABtn icon="archive-outline"                label={t('archiveLabel')} color="#7C3AED" onPress={onArchive} />
          </View>

          <View style={cs.modRow}>
            <MBtn icon="account-clock-outline"  label={t('restrictShort')} onPress={onRestrict} />
            <MBtn icon="account-cancel-outline" label={t('blockShort')}    onPress={onBlock}    danger />
            <MBtn icon="delete-outline"         label={t('removeShort')}   onPress={onArchive}  danger />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function FChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ABtn({ icon, label, color, onPress }: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string; color: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[cs.aBtn, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}>
      <MaterialCommunityIcons name={icon} size={17} color={color} />
      <Text style={[cs.aBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function MBtn({ icon, label, onPress, danger }: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string; onPress: () => void; danger?: boolean;
}) {
  const c = danger ? '#DC2626' : '#64748B';
  return (
    <Pressable onPress={onPress} style={[cs.mBtn, { borderColor: `${c}30`, backgroundColor: `${c}08` }]}>
      <MaterialCommunityIcons name={icon} size={13} color={c} />
      <Text style={[cs.mBtnText, { color: c }]}>{label}</Text>
    </Pressable>
  );
}

function ActionModal({ t, visible, type, note, onChangeNote, onClose, onSubmit }: {
  t: (key: string) => string;
  visible: boolean; type: 'note' | 'restrict' | 'block' | 'remove';
  note: string; onChangeNote: (val: string) => void;
  onClose: () => void; onSubmit: () => void;
}) {
  const cfg = {
    note:     { title: t('addNoteTitle'),   placeholder: t('writeNotePlaceholder'),       icon: 'note-text-outline'     as const, color: '#EA580C' },
    restrict: { title: t('restrictUser'),   placeholder: t('restrictReasonPlaceholder'),  icon: 'account-clock-outline' as const, color: '#D97706' },
    block:    { title: t('blockUser'),      placeholder: t('blockReasonPlaceholder'),     icon: 'account-cancel-outline' as const, color: '#DC2626' },
    remove:   { title: t('removeComplaint'),placeholder: t('removeReasonPlaceholder'),    icon: 'delete-outline'        as const, color: '#DC2626' },
  }[type];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={ms.backdrop} onPress={onClose} />
      <Animated.View entering={FadeInUp.duration(280)} style={ms.sheet}>
        <View style={ms.handle} />
        <View style={ms.header}>
          <View style={[ms.iconCircle, { backgroundColor: `${cfg.color}15` }]}>
            <MaterialCommunityIcons name={cfg.icon} size={20} color={cfg.color} />
          </View>
          <Text style={ms.title}>{cfg.title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <MaterialCommunityIcons name="close" size={20} color={COLORS.textMuted} />
          </Pressable>
        </View>
        <TextInput value={note} onChangeText={onChangeNote} placeholder={cfg.placeholder}
          placeholderTextColor={COLORS.textPlaceholder} multiline
          style={ms.input} textAlignVertical="top" />
        <Pressable onPress={onSubmit} style={[ms.submitBtn, { backgroundColor: cfg.color }]}>
          <Text style={ms.submitText}>{t('confirmAction')}</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, ...SHADOWS.sm },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  screenTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  ctxBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  ctxBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  countBubble: { backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  countBubbleText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  content: { padding: 16, paddingBottom: 44, gap: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, ...SHADOWS.soft },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  chipScroll: { marginBottom: 10 },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  filterChipText: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted },
  filterChipTextActive: { color: COLORS.primary },
  emptyCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 8, ...SHADOWS.soft },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, textAlign: 'center' },
});

const cs = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 12, ...SHADOWS.soft },
  accentBar: { height: 3, width: '100%' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  imgPlaceholder: { width: 50, height: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  imgBadge: { position: 'absolute', bottom: -3, right: -3, backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1.5, borderColor: '#fff' },
  imgBadgeText: { fontSize: 8, fontWeight: '900', color: '#fff' },
  headerInfo: { flex: 1 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  complaintId: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted },
  escalBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  escalText: { fontSize: 9, fontWeight: '800', color: '#DC2626' },
  title: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  loc: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted, marginTop: 2 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  citizenRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#FAFBFC' },
  citizenAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  citizenAvatarText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  citizenName: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  citizenPhone: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },
  dateText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  panel: { padding: 14, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  panelLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  panelText: { fontSize: 13, fontWeight: '500', color: COLORS.text, lineHeight: 19 },
  tlItem: { flexDirection: 'row', gap: 10, paddingBottom: 12, position: 'relative' },
  tlDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: COLORS.primary, marginTop: 4, flexShrink: 0 },
  tlLine: { position: 'absolute', left: 4, top: 13, bottom: 0, width: 1, backgroundColor: COLORS.border },
  tlContent: { flex: 1, gap: 2 },
  tlAuthor: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  tlText: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, lineHeight: 17 },
  tlDate: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10 },
  statusBtnText: { fontSize: 10, fontWeight: '800' },
  actionGrid: { flexDirection: 'row', gap: 8 },
  aBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 4, borderWidth: 1 },
  aBtnText: { fontSize: 10, fontWeight: '800' },
  modRow: { flexDirection: 'row', gap: 6 },
  mBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  mBtnText: { fontSize: 9.5, fontWeight: '800' },
});

const ms = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, gap: 16, ...SHADOWS.xl },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.text },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, padding: 14, minHeight: 88, fontSize: 14, color: COLORS.text, backgroundColor: '#F8FAFC', lineHeight: 20 },
  submitBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
