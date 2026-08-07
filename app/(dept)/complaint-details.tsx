// @ts-nocheck
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { GlassCard } from '@/components/common/GlassCard';
import { COLORS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { useTranslation } from '@/providers/localization-provider';

const STATUS_LABEL = (t, status) => ({ Pending: t('pending'), 'In Progress': t('inProgress'), Resolved: t('resolved') }[status] ?? status);
const PRIORITY_LABEL = (t, p) => ({ Emergency: t('priorityEmergency'), High: t('priorityHigh'), Medium: t('priorityMedium'), Low: t('priorityLow') }[p] ?? p);
const wardDisplay = (t, ward) => (ward ?? '').replace(/^Ward\b/, t('ward2'));

export default function DepartmentComplaintDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, complaints, updateStatus, addNote, fetchNotes, escalateComplaint } = useDepartment();
  const complaint = complaints.find(c => c.id === id && c.assignedDepartment === profile?.department);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (complaint) {
      fetchNotes(complaint.id)
        .then((data) => {
          setNotes(data);
        })
        .catch((err) => {
          console.error("Failed to load timeline notes:", err);
        });
    }
  }, [complaint?.id, fetchNotes]);

  if (!complaint) {
    return (
      <DepartmentScreen title={t('complaintDetails')} back>
        <View style={styles.missing}>
          <Text>{t('complaintUnavailableDept')}</Text>
        </View>
      </DepartmentScreen>
    );
  }

  const change = async (status: 'Pending' | 'In Progress' | 'Resolved') => {
    try {
      await updateStatus(complaint.id, status, note || undefined);
      setNote('');
      const freshNotes = await fetchNotes(complaint.id).catch(() => []);
      setNotes(freshNotes);
      Alert.alert(t('updated') || 'Updated', `Status set to ${STATUS_LABEL(t, status)}.`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  return (
    <DepartmentScreen title={t('complaintDetails')} back>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{complaint.title}</Text>
            <Text style={styles.status}>{STATUS_LABEL(t, complaint.status)}</Text>
          </View>
          <Text style={styles.meta}>{complaint.id} · {PRIORITY_LABEL(t, complaint.priority)} {t('priority').toLowerCase()}</Text>
          <Text style={styles.desc}>{complaint.description}</Text>
        </GlassCard>

        <Text style={styles.heading}>{t('citizenInformation')}</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.line}>{complaint.citizenName}</Text>
          <Text style={styles.sub}>{complaint.citizenPhone}</Text>
          <Text style={styles.sub}>{wardDisplay(t, complaint.ward)}</Text>
          <Text style={styles.sub}>{t('complaintLocationLabel') || 'Complaint Location'}: {complaint.manualLocation || complaint.title}</Text>
          <Text style={styles.sub}>{t('localityLabel') || 'Locality'}: {complaint.locality || complaint.location}</Text>
        </GlassCard>

        <Text style={styles.heading}>{t('imagesLabel')}</Text>
        {complaint.images && complaint.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoContainer}
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
        <GlassCard style={styles.image}>
          <MaterialCommunityIcons name="image-plus" size={28} color={COLORS.primary} />
          <Text style={styles.sub}>{t('completionPhotoPlaceholder')}</Text>
        </GlassCard>

        <Text style={styles.heading}>{t('departmentActions')}</Text>
        <GlassCard style={styles.card}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('addDeptNotePlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            multiline
            style={styles.input}
          />
          <View style={styles.buttons}>
            {(['Pending', 'In Progress', 'Resolved'] as const).map(status => (
              <Pressable key={status} onPress={() => change(status)} style={styles.action}>
                <Text style={styles.actionText}>{STATUS_LABEL(t, status)}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={async () => {
              if (note.trim()) {
                try {
                  await addNote(complaint.id, note);
                  setNote('');
                  const freshNotes = await fetchNotes(complaint.id).catch(() => []);
                  setNotes(freshNotes);
                  Alert.alert('Success', 'Note added successfully.');
                } catch (err) {
                  Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add note.');
                }
              }
            }}
            style={styles.noteBtn}
          >
            <Text style={styles.noteText}>{t('addNoteBtn')}</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              if (!note.trim()) {
                Alert.alert(t('required') || 'Required', t('enterNoteEscalate') || 'Please enter the escalation reason in the note box first.');
                return;
              }
              try {
                await escalateComplaint(complaint.id, note.trim());
                setNote('');
                Alert.alert(t('escalatedTitle') || 'Escalated', t('escalatedMsg') || 'Grievance escalated successfully.');
                const freshNotes = await fetchNotes(complaint.id).catch(() => []);
                setNotes(freshNotes);
              } catch (err) {
                Alert.alert('Error', err instanceof Error ? err.message : 'Failed to escalate.');
              }
            }}
            style={styles.escalate}
          >
            <Text style={styles.escalateText}>{t('escalateToNagaradhyaksha')}</Text>
          </Pressable>
        </GlassCard>

        <Text style={styles.heading}>{t('timelineDeptNotes')}</Text>
        <GlassCard style={styles.card}>
          {notes.length ? notes.map(item => (
            <View key={item.id} style={styles.note}>
              <Text style={styles.line}>{item.author}</Text>
              <Text style={styles.sub}>{item.text}</Text>
            </View>
          )) : <Text style={styles.sub}>{t('noNotesYet')}</Text>}
        </GlassCard>
      </ScrollView>
    </DepartmentScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 25, gap: 11 },
  card: { padding: 15, gap: 8 },
  titleRow: { flexDirection: 'row', gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '900', color: COLORS.text },
  status: { fontSize: 11, fontWeight: '900', color: COLORS.success },
  meta: { fontSize: 11.5, fontWeight: '700', color: COLORS.primary },
  desc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },
  heading: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  line: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  image: { padding: 22, alignItems: 'center' },
  photoContainer: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  photo: { width: 120, height: 90, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 11, minHeight: 75, textAlignVertical: 'top', color: COLORS.text },
  buttons: { flexDirection: 'row', gap: 7 },
  action: { flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: '#EAF3FF', borderRadius: 10 },
  actionText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  noteBtn: { backgroundColor: COLORS.primary, borderRadius: 11, padding: 12, alignItems: 'center' },
  noteText: { color: COLORS.white, fontWeight: '800' },
  escalate: { borderWidth: 1, borderColor: '#FED7AA', borderRadius: 11, padding: 12, alignItems: 'center' },
  escalateText: { color: '#C2410C', fontWeight: '800' },
  note: { paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: '#EDF0F3' },
  missing: { padding: 25, alignItems: 'center' },
});
