// app/(citizen)/complaint/[id].tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { STATUS_COLORS } from '@/constants/citizen';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { useCitizen } from '@/providers/citizen-provider';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../../constants/theme';
import GlassCard from '@/components/common/GlassCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ComplaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { complaints } = useCitizen();

  const c = complaints.find((x) => x.id === id);

  if (!c) {
    router.replace('/my-complaints');
    return null;
  }

  const statusColor = STATUS_COLORS[c.status] || COLORS.textMuted;
  const submittedDate = new Date(c.submittedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const steps = [
    { key: 'submitted', title: 'Complaint Registered', desc: 'Ticket logged successfully', active: true, done: true },
    {
      key: 'assigned',
      title: c.assignedDepartment ? c.assignedDepartment : 'Forwarded for Review',
      desc: c.status !== 'Pending' ? 'Department is review/investigation' : 'Awaiting department assignment',
      active: c.status === 'In Progress',
      done: c.status === 'In Progress' || c.status === 'Resolved',
    },
    {
      key: 'resolved',
      title: 'Resolved',
      desc: c.status === 'Resolved' ? 'Civic task marked completed' : 'Awaiting final resolution',
      active: c.status === 'Resolved',
      done: c.status === 'Resolved',
    },
  ];

  return (
    <CitizenScreen title="Complaint Details" showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.statusBanner, { backgroundColor: COLORS.primary }]}>
            <View>
              <Text style={styles.bannerLabel}>COMPLAINT ID</Text>
              <Text style={styles.bannerId}>{c.id}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}20`, borderColor: statusColor },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{c.status.toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>

        {c.photoUri && (
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.sectionWrapper}>
            <Text style={styles.sectionHeading}>Attached Proof Photo</Text>
            <View style={styles.imageCard}>
              <Image source={{ uri: c.photoUri }} style={styles.complaintImage} />
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Text style={styles.sectionHeading}>Complaint Information</Text>
          <GlassCard style={styles.detailsCard}>
            <DetailRow label="Category" value={c.category} icon="tag-outline" />
            <DetailRow label="Title" value={c.title} icon="format-title" />
            <DetailRow label="Description" value={c.description} icon="text-box-outline" isLongText />
            <View style={styles.row}>
              <DetailField label="Ward" value={c.ward} icon="map-marker-outline" />
              <DetailField label="Locality" value={c.locality} icon="home-city-outline" />
            </View>
            <DetailRow label="Submitted On" value={submittedDate} icon="calendar-clock" />
            {c.assignedDepartment && (
              <DetailRow label="Assigned Dept" value={c.assignedDepartment} icon="office-building" />
            )}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionHeading}>Resolution Timeline</Text>
          <GlassCard style={styles.timelineCard}>
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeftCol}>
                    <View
                      style={[
                        styles.timelineIndicator,
                        step.done ? styles.timelineIndicatorDone : null,
                        step.active ? styles.timelineIndicatorActive : null,
                      ]}
                    >
                      {step.done ? (
                        <MaterialCommunityIcons name="check" size={14} color={COLORS.white} />
                      ) : (
                        <View style={styles.timelineDotInner} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineConnector,
                          step.done && steps[idx + 1].done ? styles.timelineConnectorDone : null,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRightCol}>
                    <Text
                      style={[
                        styles.timelineStepTitle,
                        step.active ? styles.textActive : step.done ? styles.textDone : styles.textUpcoming,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={styles.timelineStepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </CitizenScreen>
  );
}

function DetailRow({ label, value, icon, isLongText }: { label: string; value: string; icon: string; isLongText?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.rowLabelGroup}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.textMuted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, isLongText && styles.longText]}>{value}</Text>
    </View>
  );
}

function DetailField({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.detailField}>
      <View style={styles.rowLabelGroup}>
        <MaterialCommunityIcons name={icon as any} size={16} color={COLORS.textMuted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 },
  statusBanner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
    marginBottom: 20,
  },
  bannerLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  bannerId: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: COLORS.white,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  sectionHeading: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginTop: 8, marginBottom: 12 },
  sectionWrapper: { marginBottom: 16 },
  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  complaintImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  detailsCard: { padding: 16, marginBottom: 20 },
  detailRow: { marginBottom: 16 },
  rowLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  detailValue: { fontSize: 15, fontWeight: '600', color: COLORS.text, paddingLeft: 24 },
  longText: { lineHeight: 22, fontWeight: '500', color: '#334155' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  detailField: { flex: 1 },
  timelineCard: { paddingHorizontal: 20, paddingVertical: 24 },
  timelineItem: { flexDirection: 'row', minHeight: 64 },
  timelineLeftCol: { width: 32, alignItems: 'center' },
  timelineIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineIndicatorDone: { backgroundColor: COLORS.secondary },
  timelineIndicatorActive: {
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  timelineDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textMuted },
  timelineConnector: {
    position: 'absolute',
    top: 22,
    bottom: -6,
    width: 2,
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  timelineConnectorDone: { backgroundColor: COLORS.secondary },
  timelineRightCol: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  timelineStepTitle: { fontSize: 14.5, fontWeight: '700' },
  timelineStepDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 3, fontWeight: '500' },
  textActive: { color: COLORS.accent },
  textDone: { color: COLORS.primary },
  textUpcoming: { color: COLORS.textMuted },
});