import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PriorityBadge from '@/components/official/PriorityBadge';
import StatusBadge from '@/components/official/StatusBadge';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function ComplaintDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, complaints, updateComplaintStatus, uploadComplaintImage } = useOfficial();

  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <SafeAreaView style={styles.emptySafeArea}>
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.emptyTitle}>Complaint not found</Text>
        <Text style={styles.emptyText}>The grievance reference ID does not exist.</Text>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleAddPhoto = async () => {
    const samplePhotos = [
      'https://picsum.photos/id/1018/600/400',
      'https://picsum.photos/id/1019/600/400',
      'https://picsum.photos/id/1020/600/400',
    ];
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    await uploadComplaintImage(complaint.id, randomPhoto);
    Alert.alert('Success', 'Additional verification photo uploaded successfully.');
  };

  const handleUpdateStatus = async (status: 'Pending' | 'In Progress' | 'Resolved', note?: string) => {
    await updateComplaintStatus(complaint.id, status, note);
    Alert.alert('Status updated', `Complaint status marked as ${status}`);
  };

  const timelineEvents = [
    {
      title: 'Complaint registered',
      description: `Filed by ${complaint.citizenName} from ${complaint.location}`,
      time: new Date(complaint.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      icon: 'file-tray-full-outline' as const,
      color: COLORS.primary,
    },
    ...(complaint.assignedDepartment ? [{ title: 'Assigned to department', description: `Routed to ${complaint.assignedDepartment}`, time: new Date(complaint.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), icon: 'business-outline' as const, color: '#7C3AED' }] : []),
    ...complaint.notes.map((n) => ({ title: 'Action taken', description: `${n.text} (By: ${n.author})`, time: new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), icon: 'chatbox-ellipses-outline' as const, color: '#EA580C' })),
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push('/(official)/complaints')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>{complaint.id}</Text>
            <Text style={styles.headerSubtitle}>{profile.name} • {profile.ward}</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{complaint.title}</Text>
          <Text style={styles.heroDescription}>{complaint.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.metaText}>Filed {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Citizen information</Text>
          <InfoRow label="Citizen name" value={complaint.citizenName} />
          <InfoRow label="Phone" value={complaint.citizenPhone} action={() => Alert.alert('Call citizen', `Calling ${complaint.citizenPhone}`)} />
          <InfoRow label="Ward" value={complaint.ward} />
          <InfoRow label="Locality" value={complaint.location} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeading}>Verification photos</Text>
            <Pressable onPress={handleAddPhoto} style={styles.inlineButton}>
              <Ionicons name="camera" size={14} color={COLORS.primary} />
              <Text style={styles.inlineButtonText}>Upload</Text>
            </Pressable>
          </View>
          {(!complaint.images || complaint.images.length === 0) ? (
            <View style={styles.emptyPhotoBox}>
              <Ionicons name="images-outline" size={24} color={COLORS.textMuted} />
              <Text style={styles.emptyPhotoText}>No photos attached yet.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {complaint.images.map((img, idx) => <Image key={idx} source={{ uri: img }} style={styles.attachedImage} contentFit="cover" />)}
            </ScrollView>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Update status</Text>
          <View style={styles.actionButtonRow}>
            <Pressable onPress={() => handleUpdateStatus('Pending', 'Re-assessed complaint.')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Pending</Text>
            </Pressable>
            <Pressable onPress={() => handleUpdateStatus('In Progress', 'Began resolution process.')} style={[styles.statusButton, styles.statusButtonActive]}>
              <Text style={[styles.statusButtonText, styles.statusButtonTextActive]}>In progress</Text>
            </Pressable>
            <Pressable onPress={() => handleUpdateStatus('Resolved', 'Grievance resolved fully.')} style={[styles.statusButton, styles.statusButtonSuccess]}>
              <Text style={[styles.statusButtonText, styles.statusButtonTextSuccess]}>Resolved</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeading}>Timeline</Text>
            <Pressable onPress={() => router.push({ pathname: '/(official)/add-note', params: { id: complaint.id } } as any)} style={styles.inlineButton}>
              <Ionicons name="add-circle" size={14} color="#EA580C" />
              <Text style={styles.inlineButtonTextAlt}>Add note</Text>
            </Pressable>
          </View>
          <View style={styles.timelineList}>
            {timelineEvents.map((ev, index) => {
              const isLast = index === timelineEvents.length - 1;
              return (
                <View key={index} style={styles.timelineRow}>
                  <View style={styles.timelineIconWrap}>
                    <View style={[styles.timelineIcon, { backgroundColor: `${ev.color}15` }]}>
                      <Ionicons name={ev.icon} size={14} color={ev.color} />
                    </View>
                    {!isLast ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{ev.title}</Text>
                    <Text style={styles.timelineDesc}>{ev.description}</Text>
                    <Text style={styles.timelineTime}>{ev.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable onPress={() => router.push({ pathname: '/(official)/escalate', params: { id: complaint.id } } as any)} style={styles.escalateButton}>
          <Text style={styles.escalateButtonText}>Escalate to {profile.roleLabel}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, action }: { label: string; value: string; action?: () => void }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {action ? (
        <Pressable onPress={action}>
          <Text style={styles.infoValueLink}>{value}</Text>
        </Pressable>
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  emptySafeArea: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center', padding: 24 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, ...SHADOWS.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  content: { padding: 16, paddingBottom: 44 },
  heroCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', ...SHADOWS.card },
  heroTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  heroDescription: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, marginTop: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  metaText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  card: { marginTop: 14, backgroundColor: COLORS.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(226,232,240,0.9)', ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeading: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'right' },
  infoValueLink: { fontSize: 13, fontWeight: '700', color: COLORS.primary, flex: 1, textAlign: 'right' },
  inlineButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#EFF6FF' },
  inlineButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  inlineButtonTextAlt: { fontSize: 12, fontWeight: '700', color: '#EA580C' },
  emptyPhotoBox: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingVertical: 18, alignItems: 'center', backgroundColor: '#F8FAFC' },
  emptyPhotoText: { marginTop: 6, fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  actionButtonRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statusButton: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#F8FAFC', paddingVertical: 10, alignItems: 'center' },
  statusButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  statusButtonSuccess: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  statusButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  statusButtonTextActive: { color: COLORS.primary },
  statusButtonTextSuccess: { color: '#047857' },
  attachedImage: { width: 120, height: 80, borderRadius: 12 },
  timelineList: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  timelineIconWrap: { alignItems: 'center' },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  timelineLine: { width: 2, height: 24, backgroundColor: '#E7ECF2', marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  timelineDesc: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, marginTop: 2, lineHeight: 18 },
  timelineTime: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginTop: 4 },
  escalateButton: { marginTop: 14, backgroundColor: '#DC2626', borderRadius: 18, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  escalateButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  primaryButton: { marginTop: 14, backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { marginTop: 6, fontSize: 13, fontWeight: '600', color: COLORS.textMuted, textAlign: 'center' },
});
