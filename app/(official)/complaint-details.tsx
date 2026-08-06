import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import PriorityBadge from '@/components/official/PriorityBadge';
import StatusBadge from '@/components/official/StatusBadge';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function ComplaintDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, complaints, updateComplaintStatus, uploadComplaintImage, fetchNotes } = useOfficial();
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const complaint = complaints.find((c) => c.id === id);

  useEffect(() => {
    if (complaint) {
      fetchNotes(complaint.id)
        .then((data) => {
          setNotes(data);
        })
        .catch((err) => {
          console.error("Failed to load timeline notes:", err);
        })
        .finally(() => {
          setLoadingNotes(false);
        });
    }
  }, [complaint?.id, fetchNotes]);

  if (!complaint) {
    return (
      <SafeAreaView style={styles.emptySafe} edges={['top']}>
        <View style={styles.emptyInner}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="alert-circle-outline" size={36} color={COLORS.danger} />
          </View>
          <Text style={styles.emptyTitle}>Complaint not found</Text>
          <Text style={styles.emptyText}>
            The grievance reference ID does not exist in this ward.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddPhoto = async () => {
    const samples = [
      'https://picsum.photos/id/1018/600/400',
      'https://picsum.photos/id/1019/600/400',
      'https://picsum.photos/id/1020/600/400',
    ];
    const uri = samples[Math.floor(Math.random() * samples.length)];
    await uploadComplaintImage(complaint.id, uri);
    Alert.alert('Success', 'Verification photo uploaded.');
  };

  const handleStatus = async (
    status: 'Pending' | 'In Progress' | 'Resolved',
    note: string,
  ) => {
    await updateComplaintStatus(complaint.id, status, note);
    const freshNotes = await fetchNotes(complaint.id).catch(() => []);
    setNotes(freshNotes);
    Alert.alert('Updated', `Status set to ${status}.`);
  };

  const timelineEvents = [
    {
      title: 'Complaint registered',
      description: `Filed by ${complaint.citizenName} from ${complaint.location}`,
      time: fmtDateTime(complaint.createdAt),
      icon: 'file-document-outline' as const,
      color: COLORS.primary,
    },
    ...(complaint.assignedDepartment
      ? [
          {
            title: 'Assigned to department',
            description: `Routed to ${complaint.assignedDepartment}`,
            time: fmtDateTime(complaint.createdAt),
            icon: 'domain' as const,
            color: '#7C3AED',
          },
        ]
      : []),
    ...notes.map((n) => ({
      title: 'Action taken',
      description: `${n.text} — ${n.author}`,
      time: fmtDateTime(n.createdAt),
      icon: 'comment-text-outline' as const,
      color: '#EA580C',
    })),
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {complaint.id}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {profile.name} · {profile.ward}
            </Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* ── Section 1: Complaint Summary ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(0)} style={styles.card}>
          <SectionLabel icon="clipboard-text-outline" label="Complaint Summary" />
          <Text style={styles.summaryTitle}>{complaint.title}</Text>
          <Text style={styles.summaryDesc}>{complaint.description}</Text>
          <View style={styles.metaRow}>
            <MetaChip
              icon="calendar-outline"
              text={`Filed ${fmtDate(complaint.createdAt)}`}
            />
            <MetaChip
              icon="refresh-outline"
              text={`Updated ${fmtDate(complaint.updatedAt)}`}
            />
          </View>
        </Animated.View>

        {/* ── Section 2: Citizen Information ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(60)} style={styles.card}>
          <SectionLabel icon="account-outline" label="Citizen Information" />
          <InfoRow label="Citizen Name" value={complaint.citizenName} />
          <InfoRow
            label="Phone"
            value={complaint.citizenPhone}
            isLink
            onPress={() =>
              Alert.alert('Call Citizen', `Calling ${complaint.citizenPhone}`)
            }
          />
          <InfoRow label="Ward" value={complaint.ward} />
          <InfoRow label="Complaint Location" value={complaint.manualLocation || complaint.title || 'N/A'} />
          <InfoRow label="Locality" value={complaint.locality || complaint.location || 'N/A'} isLast />
        </Animated.View>

        {/* ── Section 3: Complaint Details ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(120)} style={styles.card}>
          <SectionLabel icon="information-outline" label="Complaint Details" />
          <InfoRow label="Category" value={complaint.category} />
          <InfoRow label="Priority" value={complaint.priority} />
          <InfoRow label="Status" value={complaint.status} />
          <InfoRow
            label="Assigned Dept."
            value={complaint.assignedDepartment || 'Unassigned'}
            isLast
          />
        </Animated.View>

        {/* ── Section 4: Attached Photos ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(180)} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <SectionLabel icon="image-multiple-outline" label="Attached Photos" noMargin />
            <Pressable onPress={handleAddPhoto} style={styles.inlineBtn}>
              <Ionicons name="camera" size={13} color={COLORS.primary} />
              <Text style={styles.inlineBtnText}>Upload</Text>
            </Pressable>
          </View>
          {(!complaint.images || complaint.images.length === 0) ? (
            <View style={styles.emptyPhotos}>
              <MaterialCommunityIcons
                name="image-off-outline"
                size={24}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyPhotosText}>No photos attached yet.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingTop: 4 }}
            >
              {complaint.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={styles.photo}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* ── Section 5: Timeline ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(240)} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <SectionLabel icon="timeline-outline" label="Timeline" noMargin />
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(official)/add-note',
                  params: { id: complaint.id },
                } as any)
              }
              style={[styles.inlineBtn, { backgroundColor: '#FFF7ED' }]}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={13} color="#EA580C" />
              <Text style={[styles.inlineBtnText, { color: '#EA580C' }]}>Add note</Text>
            </Pressable>
          </View>
          <View style={styles.timelineList}>
            {timelineEvents.map((ev, idx) => {
              const isLast = idx === timelineEvents.length - 1;
              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineIconCircle,
                        { backgroundColor: `${ev.color}18` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={ev.icon}
                        size={14}
                        color={ev.color}
                      />
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineTitle}>{ev.title}</Text>
                    <Text style={styles.timelineDesc}>{ev.description}</Text>
                    <Text style={styles.timelineTime}>{ev.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Section 6: Notes ── */}
        {notes.length > 0 && (
          <Animated.View entering={FadeInDown.duration(340).delay(300)} style={styles.card}>
            <SectionLabel icon="note-text-outline" label="Notes" />
            {notes.map((n, idx) => (
              <View
                key={n.id}
                style={[
                  styles.noteRow,
                  idx === notes.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.noteIconCircle}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={14}
                    color={COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteAuthor}>{n.author}</Text>
                  <Text style={styles.noteText}>{n.text}</Text>
                  <Text style={styles.noteTime}>{fmtDateTime(n.createdAt)}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Section 7: Actions ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(360)} style={styles.card}>
          <SectionLabel icon="cog-outline" label="Actions" />
          <View style={styles.actionRow}>
            <ActionBtn
              label="Pending"
              color="#F59E0B"
              bg="#FFF8ED"
              border="#FDE68A"
              onPress={() => handleStatus('Pending', 'Re-assessed complaint.')}
            />
            <ActionBtn
              label="In Progress"
              color={COLORS.primary}
              bg="#EFF6FF"
              border="#BFDBFE"
              onPress={() => handleStatus('In Progress', 'Began resolution process.')}
            />
            <ActionBtn
              label="Resolved"
              color={COLORS.success}
              bg="#ECFDF5"
              border="#A7F3D0"
              onPress={() => handleStatus('Resolved', 'Grievance resolved fully.')}
            />
          </View>
        </Animated.View>

        {/* ── Escalate CTA ── */}
        <Animated.View entering={FadeInDown.duration(340).delay(420)}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(official)/escalate',
                params: { id: complaint.id },
              } as any)
            }
            style={styles.escalateBtn}
          >
            <MaterialCommunityIcons
              name="arrow-up-bold-circle-outline"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.escalateBtnText}>Escalate Complaint</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ── */

function SectionLabel({
  icon,
  label,
  noMargin,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  noMargin?: boolean;
}) {
  return (
    <View style={[sectionLabelStyles.row, !noMargin && sectionLabelStyles.mb]}>
      <View style={sectionLabelStyles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={14} color={COLORS.primary} />
      </View>
      <Text style={sectionLabelStyles.text}>{label}</Text>
    </View>
  );
}

const sectionLabelStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mb: { marginBottom: 14 },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
});

function InfoRow({
  label,
  value,
  isLink,
  isLast,
  onPress,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const textStyle = isLink ? styles.infoValueLink : styles.infoValue;
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isLink && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={textStyle}>{value}</Text>
        </Pressable>
      ) : (
        <Text style={textStyle} numberOfLines={2}>{value}</Text>
      )}
    </View>
  );
}

function MetaChip({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={12} color={COLORS.textMuted} />
      <Text style={styles.metaChipText}>{text}</Text>
    </View>
  );
}

function ActionBtn({
  label,
  color,
  bg,
  border,
  onPress,
}: {
  label: string;
  color: string;
  bg: string;
  border: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionBtn, { backgroundColor: bg, borderColor: border }]}
    >
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

/* ── Helpers ── */

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  emptySafe: { flex: 1, backgroundColor: COLORS.background },
  emptyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  /* Header */
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: { ...TYPOGRAPHY.h3, fontSize: 14, color: COLORS.text },
  headerSub: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 0 },

  /* Scroll */
  content: { padding: 16, paddingBottom: 44, gap: 12 },

  /* Section cards */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.soft,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  /* Summary */
  summaryTitle: { ...TYPOGRAPHY.h3, fontSize: 16, color: COLORS.text, marginBottom: 8 },
  summaryDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaChipText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  infoLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, flexShrink: 0 },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  infoValueLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'right',
  },

  /* Photos */
  emptyPhotos: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  emptyPhotosText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  photo: { width: 130, height: 90, borderRadius: 12 },

  /* Inline button */
  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  inlineBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* Timeline */
  timelineList: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 28 },
  timelineIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: '#E7ECF2',
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 1,
  },
  timelineBody: { flex: 1, paddingTop: 4, paddingBottom: 14 },
  timelineTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  timelineDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPlaceholder,
    marginTop: 4,
  },

  /* Notes */
  noteRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  noteIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noteAuthor: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  noteText: { fontSize: 13, fontWeight: '500', color: COLORS.text, marginTop: 2, lineHeight: 18 },
  noteTime: { fontSize: 11, fontWeight: '600', color: COLORS.textPlaceholder, marginTop: 4 },

  /* Actions */
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 12, fontWeight: '800' },

  /* Escalate CTA */
  escalateBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.button,
  },
  escalateBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
});
