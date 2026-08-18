// @ts-nocheck
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { GlassCard } from '@/components/common/GlassCard';
import { COLORS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';

const STATUS_LABEL = (t, status) => ({ All: t('all'), Pending: t('pending'), 'In Progress': t('inProgress'), Resolved: t('resolved') }[status] ?? status);
const PRIORITY_LABEL = (t, p) => ({ Emergency: t('priorityEmergency'), High: t('priorityHigh'), Medium: t('priorityMedium'), Low: t('priorityLow') }[p] ?? p);
const wardDisplay = (t, ward) => (ward ?? '').replace(/^Ward\b/, t('ward2'));

const DepartmentComplaints = memo(function DepartmentComplaints() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, complaints, complaintsError, complaintsLoading, loadComplaints } = useDepartment();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    void loadComplaints().catch(() => {});
    const frame = requestAnimationFrame(() => {
      setShowList(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [loadComplaints]);

  const mine = useMemo(
    () => complaints.filter(c =>
      c.assignedDepartment === profile?.department &&
      !c.is_deleted &&
      (status === 'All' || c.status === status) &&
      `${c.title} ${c.ward} ${c.category}`.toLowerCase().includes(query.toLowerCase())
    ),
    [complaints, profile, query, status],
  );

  const handlePressStatus = useCallback((item: string) => {
    setStatus(item);
  }, []);

  const handlePressComplaint = useCallback((cId: any) => {
    router.push({ pathname: '/(dept)/complaint-details', params: { id: cId } });
  }, [router]);

  return (
    <DepartmentScreen title={t('deptComplaintsTitle')} tab="complaints">
      <ScrollView contentContainerStyle={styles.content}>
        {complaintsLoading && <Text style={styles.scope}>Loading complaints…</Text>}
        {complaintsError && <Text style={styles.scope}>{complaintsError}</Text>}
        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} />
          <TextInput
            placeholder={t('searchDeptComplaints')}
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {['All', 'Pending', 'In Progress', 'Resolved'].map(item => (
            <Pressable key={item} onPress={() => handlePressStatus(item)} style={[styles.filter, status === item && styles.filterActive]}>
              <Text style={[styles.filterText, status === item && styles.filterTextActive]}>{STATUS_LABEL(t, item)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.scope}>
          {t('complaintsCountSuffix').replace('{count}', String(mine.length)).replace('{plural}', mine.length === 1 ? '' : 's')} · {profile?.department} · {t('deptComplaintsScope')}
        </Text>

        {showList ? (
          mine.map(c => (
            <Pressable key={c.id} onPress={() => handlePressComplaint(c.id)}>
              <GlassCard style={styles.complaint}>
                <View style={styles.top}>
                  <Text style={styles.complaintTitle}>{c.title}</Text>
                  <Text style={[styles.priority, { color: c.priority === 'Emergency' ? '#DC2626' : c.priority === 'High' ? '#F59E0B' : COLORS.primary }]}>
                    {PRIORITY_LABEL(t, c.priority)}
                  </Text>
                </View>
                <Text style={styles.meta}>{wardDisplay(t, c.ward)} · {t(c.category)}</Text>
                <Text numberOfLines={2} style={styles.description}>{c.description}</Text>
                <View style={styles.bottom}>
                  <Text style={styles.id}>{c.id}</Text>
                  <Text style={styles.status}>{STATUS_LABEL(t, c.status)}</Text>
                </View>
              </GlassCard>
            </Pressable>
          ))
        ) : (
          <Text style={styles.empty}>Loading list...</Text>
        )}

        {showList && !mine.length && <Text style={styles.empty}>{t('noDeptComplaints')}</Text>}
      </ScrollView>
    </DepartmentScreen>
  );
});

export default DepartmentComplaints;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 24, gap: 11 },
  search: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 8 },
  input: { flex: 1, color: COLORS.text, fontSize: 13 },
  filters: { gap: 8 },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#EDF1F5' },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  filterTextActive: { color: COLORS.white },
  scope: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  complaint: { padding: 14, gap: 7 },
  top: { flexDirection: 'row', gap: 8 },
  complaintTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: COLORS.text },
  priority: { fontSize: 11, fontWeight: '900' },
  meta: { fontSize: 11.5, color: COLORS.primary, fontWeight: '700' },
  description: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEF1F4', paddingTop: 9 },
  id: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  status: { fontSize: 11, fontWeight: '800', color: COLORS.success },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 30 },
});
