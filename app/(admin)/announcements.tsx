import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';
import { useRouter } from 'expo-router';
import {
    Alert, Pressable, ScrollView, StyleSheet,
    Text, TextInput, View,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';

// ── Audience hierarchy ────────────────────────────────────────────────────────
type AudienceGroup = {
  groupKey: string;
  label: string;
  subLabel: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  bg: string;
  children?: string[];
};

function buildAudienceGroups(t: (key: string) => string): AudienceGroup[] {
  const wardCitizens = Array.from({ length: 10 }, (_, i) => `${t('ward2')} ${i + 1} ${t('citizens')}`);
  const nsWards = Array.from({ length: 10 }, (_, i) => `${t('nagarsevak')} ${t('ward2')} ${i + 1}`);
  return [
    { groupKey: 'everyone', label: t('audienceEveryone'), subLabel: '', icon: 'earth', color: '#0B4F8A', bg: '#DBEAFE' },
    { groupKey: 'all-citizens', label: t('audienceAllCitizens'), subLabel: t('citizens'), icon: 'account-group-outline', color: '#2563EB', bg: '#EFF6FF',
      children: wardCitizens },
    { groupKey: 'ward-citizens', label: t('audienceWardCitizens'), subLabel: t('wardWiseLabel'), icon: 'map-marker-multiple-outline', color: '#EA580C', bg: '#FFEDD5',
      children: wardCitizens },
    { groupKey: 'all-nagarsevaks', label: t('audienceAllNagarsevaks'), subLabel: t('nagarsevaks'), icon: 'badge-account-outline', color: '#7C3AED', bg: '#EDE9FE',
      children: nsWards },
    { groupKey: 'departments', label: t('audienceAllDepartments'), subLabel: t('departments'), icon: 'domain', color: '#0F766E', bg: '#CCFBF1',
      children: [t('deptWaterDept'), t('deptRoadDept'), t('deptElectricalDept'), t('deptSanitationDept'),
                 t('deptGardenDept'), t('deptAdministration'), t('deptPublicWorks'), t('deptTrafficPolice')] },
  ];
}

const PRIORITY_OPTS = [
  { key: 'Normal',    icon: 'information-outline'    as const, color: '#475569', bg: '#F1F5F9' },
  { key: 'High',      icon: 'alert-outline'          as const, color: '#EA580C', bg: '#FFF7ED' },
  { key: 'Emergency', icon: 'alert-octagon-outline'  as const, color: '#DC2626', bg: '#FEF2F2' },
  { key: 'Pinned',    icon: 'pin-outline'            as const, color: '#2563EB', bg: '#EFF6FF' },
];

const PRIORITY_CARD: Record<string, { bg: string; text: string }> = {
  Emergency: { bg: '#FEF2F2', text: '#DC2626' },
  High:      { bg: '#FFF7ED', text: '#EA580C' },
  Pinned:    { bg: '#EFF6FF', text: '#1E6FD9' },
  Normal:    { bg: '#F1F5F9', text: '#475569' },
};

function priorityLabel(t: (key: string) => string, key: string): string {
  return ({ All: t('all'), Normal: t('priorityNormal'), High: t('priorityHigh'), Emergency: t('priorityEmergency'), Pinned: t('priorityPinned') } as Record<string, string>)[key] ?? key;
}

const AdminAnnouncements = memo(function AdminAnnouncements() {
  const { t } = useTranslation();
  const { announcements, publishAnnouncement } = useOfficial();
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShowList(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const AUDIENCE_GROUPS = useMemo(() => buildAudienceGroups(t), [t]);

  const [tab, setTab] = useState<'compose' | 'published'>('compose');
  const [title,     setTitle]     = useState('');
  const [message,   setMessage]   = useState('');
  const [priority,  setPriority]  = useState('Normal');
  const [audience,  setAudience]  = useState('everyone');
  const [subTarget, setSubTarget] = useState<string | null>(null);
  const [preview,   setPreview]   = useState(false);
  const [publishedFilter, setPublishedFilter] = useState('All');

  const FILTER_OPTS = [
    { key: 'All', icon: 'view-grid-outline' as const, color: COLORS.primary, bg: '#EFF6FF' },
    ...PRIORITY_OPTS,
  ];
  const filteredAnnouncements = publishedFilter === 'All'
    ? announcements
    : announcements.filter((a) => a.priority === publishedFilter);

  const selectedGroup = AUDIENCE_GROUPS.find((g) => g.groupKey === audience);
  const hasChildren   = (selectedGroup?.children?.length ?? 0) > 0;
  const audienceLabel = subTarget ?? selectedGroup?.label ?? t('audienceEveryone');

  const canSend = title.trim().length > 0 && message.trim().length > 0;

  const send = async () => {
    if (!canSend) {
      Alert.alert(t('missingInfo'), t('fillTitleMessage'));
      return;
    }
    const targetTypes: Record<string, string> = { everyone: 'everyone', 'all-citizens': 'all_citizens', 'ward-citizens': 'ward_citizens', 'all-nagarsevaks': 'all_nagarsevaks', departments: 'all_department_officers' };
    const wardMatch = subTarget?.match(/(\d+)/);
    try {
      await publishAnnouncement({ title: title.trim(), description: message.trim(), priority: priority === 'Normal' ? 'Medium' : priority === 'Pinned' ? 'Low' : priority, target_type: targetTypes[audience] ?? 'everyone', ...(audience === 'ward-citizens' && wardMatch ? { target_ward_id: Number(wardMatch[1]) } : {}) });
      setTitle(''); setMessage(''); setPreview(false);
      Alert.alert(t('success'), t('announcementReadyTitle'));
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('announcementReadyTitle'));
    }
    Alert.alert(
      t('announcementReadyTitle'),
      `"${title}" · ${priorityLabel(t, priority)}\n${t('toLabel')} ${audienceLabel}\n\n${t('dispatchNote')}`,
      [{ text: 'OK', onPress: () => { setTitle(''); setMessage(''); setPreview(false); } }],
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>{t('announcementsScreen')}</Text>
        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab('compose')} style={[styles.tab, tab === 'compose' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'compose' && styles.tabTextActive]}>{t('composeTab')}</Text>
          </Pressable>
          <Pressable onPress={() => setTab('published')} style={[styles.tab, tab === 'published' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'published' && styles.tabTextActive]}>
              {t('publishedTab')} ({announcements.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {tab === 'compose' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
        >
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('announcementTitle')}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('announcementTitlePlaceholder')}
              placeholderTextColor={COLORS.textPlaceholder}
              style={styles.textField}
            />
          </View>

          {/* Message */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('messageBody')}</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={t('messageBodyPlaceholder')}
              multiline
              placeholderTextColor={COLORS.textPlaceholder}
              style={[styles.textField, styles.textArea]}
              textAlignVertical="top"
            />
          </View>

          {/* Priority */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('priorityLevel')}</Text>
            <View style={styles.prioRow}>
              {PRIORITY_OPTS.map((p) => {
                const active = priority === p.key;
                const prioLabel = priorityLabel(t, p.key);
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPriority(p.key)}
                    style={[styles.prioChip, active && { backgroundColor: p.bg, borderColor: p.color }]}
                  >
                    <MaterialCommunityIcons name={p.icon} size={14} color={active ? p.color : COLORS.textMuted} />
                    <Text style={[styles.prioText, active && { color: p.color, fontWeight: '800' }]}>{prioLabel}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Audience — group level */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('targetAudience')}</Text>
            <View style={styles.audienceGrid}>
              {AUDIENCE_GROUPS.map((g) => {
                const active = audience === g.groupKey;
                return (
                  <Pressable
                    key={g.groupKey}
                    onPress={() => { setAudience(g.groupKey); setSubTarget(null); }}
                    style={[styles.audienceCard, active && { borderColor: g.color, backgroundColor: g.bg }]}
                  >
                    <MaterialCommunityIcons name={g.icon} size={18} color={active ? g.color : COLORS.textMuted} />
                    <Text style={[styles.audienceLabel, active && { color: g.color, fontWeight: '800' }]} numberOfLines={2}>
                      {g.label}
                    </Text>
                    {active && <View style={[styles.audienceActiveDot, { backgroundColor: g.color }]} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Audience sub-selector (ward / individual nagarsevak / department) */}
          {hasChildren && (
            <Animated.View entering={FadeInDown.duration(280)} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {t('specificLabel')} {selectedGroup?.subLabel} ({t('optionalLabel')})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subChipRow}>
                <Pressable
                  onPress={() => setSubTarget(null)}
                  style={[styles.subChip, !subTarget && styles.subChipActive]}
                >
                  <Text style={[styles.subChipText, !subTarget && styles.subChipTextActive]}>{t('all')}</Text>
                </Pressable>
                {selectedGroup!.children!.map((child) => (
                  <Pressable
                    key={child}
                    onPress={() => setSubTarget(subTarget === child ? null : child)}
                    style={[styles.subChip, subTarget === child && styles.subChipActive]}
                  >
                    <Text style={[styles.subChipText, subTarget === child && styles.subChipTextActive]}>{child}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Future-ready: scheduling & attachments placeholders */}
          <View style={styles.futureRow}>
            <Pressable style={styles.futureBtn}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.futureBtnText}>{t('scheduleComingSoon')}</Text>
            </Pressable>
            <Pressable style={styles.futureBtn}>
              <MaterialCommunityIcons name="paperclip" size={16} color={COLORS.textMuted} />
              <Text style={styles.futureBtnText}>{t('attachFile')}</Text>
            </Pressable>
          </View>

          {/* Preview card */}
          {preview && title.trim() && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <MaterialCommunityIcons name="eye-outline" size={14} color={COLORS.primary} />
                <Text style={styles.previewHeading}>{t('previewLabel')}</Text>
              </View>
              <View style={[styles.previewBadge, { backgroundColor: PRIORITY_CARD[priority]?.bg ?? '#F1F5F9' }]}>
                <Text style={[styles.previewBadgeText, { color: PRIORITY_CARD[priority]?.text ?? '#475569' }]}>{priorityLabel(t, priority)}</Text>
              </View>
              <Text style={styles.previewTitle}>{title}</Text>
              <Text style={styles.previewBody}>{message || `(${t('noMessagePlaceholder')})`}</Text>
              <Text style={styles.previewAudience}>→ {audienceLabel}</Text>
            </Animated.View>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setPreview(!preview)}
              style={[styles.previewToggleBtn, preview && { borderColor: COLORS.primary }]}
            >
              <MaterialCommunityIcons
                name={preview ? 'eye-off-outline' : 'eye-outline'}
                size={16}
                color={preview ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.previewToggleText, preview && { color: COLORS.primary }]}>
                {preview ? t('hidePreview') : t('previewLabel')}
              </Text>
            </Pressable>

            <Pressable
              onPress={send}
              disabled={!canSend}
              style={[styles.sendBtn, !canSend && { opacity: 0.5 }]}
            >
              <LinearGradient colors={['#0B4F8A', '#2E86DE']} style={styles.sendBtnGrad}>
                <MaterialCommunityIcons name="send-outline" size={17} color="#fff" />
                <Text style={styles.sendBtnText}>{t('sendAnnouncement')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        /* Published list */
        <View style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pubFilterRow} style={styles.pubFilterScroll}>
            {FILTER_OPTS.map((f) => {
              const active = publishedFilter === f.key;
              const count = f.key === 'All' ? announcements.length : announcements.filter((a) => a.priority === f.key).length;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setPublishedFilter(f.key)}
                  style={[styles.pubFilterChip, active && { backgroundColor: f.color, borderColor: f.color }]}
                >
                  <MaterialCommunityIcons name={f.icon} size={13} color={active ? '#fff' : f.color} />
                  <Text style={[styles.pubFilterChipText, { color: active ? '#fff' : f.color }]}>
                    {priorityLabel(t, f.key)}
                  </Text>
                  <View style={[styles.pubFilterCount, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <Text style={[styles.pubFilterCountText, active && { color: '#fff' }]}>{count}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {showList ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
              {filteredAnnouncements.length === 0 ? (
                <View style={styles.emptyCard}>
                  <MaterialCommunityIcons name="bullhorn-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>
                    {publishedFilter === 'All' ? t('noAnnouncementsYet') : t('noMatchingAnnouncements').replace('{priority}', priorityLabel(t, publishedFilter))}
                  </Text>
                </View>
              ) : (
                filteredAnnouncements.map((a, idx) => {
                  const s = PRIORITY_CARD[a.priority] ?? PRIORITY_CARD.Normal;
                  return (
                    <Animated.View key={a.id} entering={FadeInLeft.duration(360).delay(idx * 60)}>
                      <View style={styles.annCard}>
                        <View style={[styles.annAccent, { backgroundColor: s.text }]} />
                        <View style={styles.annBody}>
                          <View style={styles.annTop}>
                            <View style={[styles.badge, { backgroundColor: s.bg }]}>
                              <Text style={[styles.badgeText, { color: s.text }]}>{priorityLabel(t, a.priority)}</Text>
                            </View>
                            <Text style={styles.annDate}>{a.date}</Text>
                          </View>
                          <Text style={styles.annTitle}>{a.title}</Text>
                          <Text style={styles.annText}>{a.body}</Text>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })
              )}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.emptyTitle}>Loading...</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
});

export default AdminAnnouncements;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 0,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, ...SHADOWS.sm,
  },
  screenTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 12 },
  tabRow: { flexDirection: 'row', gap: 0 },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },

  content: { padding: 16, paddingBottom: 44, gap: 16 },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: COLORS.text, letterSpacing: 0.3 },
  textField: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
    color: COLORS.text, backgroundColor: '#F8FAFC',
  },
  textArea: { minHeight: 100, lineHeight: 20 },

  prioRow: { flexDirection: 'row', gap: 8 },
  prioChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 12, backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  prioText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },

  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  audienceCard: {
    width: '47%', flexGrow: 1,
    borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.card, padding: 14, alignItems: 'center', gap: 6,
    position: 'relative', ...SHADOWS.soft,
  },
  audienceLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },
  audienceActiveDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
  },

  subChipRow: { gap: 8, paddingBottom: 4 },
  subChip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border,
  },
  subChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  subChipText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  subChipTextActive: { color: '#fff' },

  futureRow: { flexDirection: 'row', gap: 10 },
  futureBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
    backgroundColor: '#FAFBFC',
  },
  futureBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

  previewCard: {
    backgroundColor: '#F0F7FF', borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1.5, borderColor: '#BFDBFE',
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewHeading: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  previewBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { fontSize: 10, fontWeight: '800' },
  previewTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  previewBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  previewAudience: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  previewToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  previewToggleText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  sendBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', ...SHADOWS.button },
  sendBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  sendBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  /* Published list */
  annCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...SHADOWS.soft,
  },
  annAccent: { width: 4 },
  annBody: { flex: 1, padding: 14, gap: 8 },
  annTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  annDate: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  annTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  annText: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, lineHeight: 17 },

  emptyCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 32, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },

  /* Published filter chips */
  pubFilterScroll: { backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pubFilterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  pubFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: COLORS.border,
  },
  pubFilterChipText: { fontSize: 12, fontWeight: '700' },
  pubFilterCount: {
    minWidth: 18, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  pubFilterCountText: { fontSize: 10, fontWeight: '900', color: COLORS.textMuted },
});
