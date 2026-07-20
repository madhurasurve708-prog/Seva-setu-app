import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function AddNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { complaints, addComplaintNote } = useOfficial();

  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <SafeAreaView style={styles.emptySafe} edges={['top']}>
        <View style={styles.emptyInner}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.emptyTitle}>Complaint Not Found</Text>
          <Pressable onPress={() => router.back()} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canSave = noteText.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!noteText.trim()) {
      Alert.alert('Empty Note', 'Please enter some text before saving.');
      return;
    }
    setSaving(true);
    try {
      await addComplaintNote(complaint.id, noteText.trim());
      Alert.alert('Saved', 'Note added to complaint timeline.', [
        {
          text: 'OK',
          onPress: () =>
            router.replace({
              pathname: '/(official)/complaint-details',
              params: { id: complaint.id },
            } as any),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Add Progress Note</Text>
            <Text style={styles.headerSub}>{complaint.id}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveHeaderBtn, !canSave && styles.saveHeaderBtnDisabled]}
        >
          <Text style={styles.saveHeaderBtnText}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* ── Complaint context ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(0)} style={styles.contextCard}>
          <View style={styles.contextIconCircle}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={16}
              color={COLORS.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contextTitle} numberOfLines={2}>
              {complaint.title}
            </Text>
            <Text style={styles.contextMeta}>
              {complaint.citizenName} · {complaint.location}
            </Text>
          </View>
        </Animated.View>

        {/* ── Note input ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(60)} style={styles.noteCard}>
          <View style={styles.noteLabelRow}>
            <MaterialCommunityIcons
              name="note-plus-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.noteLabel}>Progress Note</Text>
          </View>
          <Text style={styles.noteHint}>
            Write field observations, status updates or actions taken. This note will appear in the complaint timeline.
          </Text>
          <TextInput
            placeholder="Type your note here…"
            placeholderTextColor={COLORS.textPlaceholder}
            multiline
            value={noteText}
            onChangeText={setNoteText}
            style={styles.textArea}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.charCount}>{noteText.length} characters</Text>
        </Animated.View>

        {/* ── Save button ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(120)}>
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          >
            <MaterialCommunityIcons
              name="content-save-outline"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving…' : 'Save Note'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  emptySafe: { flex: 1, backgroundColor: COLORS.background },
  emptyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  emptyBtn: {
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
  saveHeaderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveHeaderBtnDisabled: { backgroundColor: '#CBD5E1' },
  saveHeaderBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },

  /* Body */
  body: { flex: 1, padding: 16, gap: 14 },

  /* Context card */
  contextCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  contextIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...SHADOWS.soft,
  },
  contextTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    lineHeight: 18,
  },
  contextMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 3,
  },

  /* Note card */
  noteCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.soft,
  },
  noteLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  noteLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  noteHint: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#F8FAFC',
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPlaceholder,
    textAlign: 'right',
    marginTop: 8,
  },

  /* Save button */
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.button,
  },
  saveBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
});
