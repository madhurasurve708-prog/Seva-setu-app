import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { getEscalationTargets, useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

const DEPT_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'public-works':  'road-variant',
  'water-supply':  'water-pump',
  'solid-waste':   'delete-variant',
  'sanitation':    'medical-bag',
  'drainage':      'pipe',
  'main-admin':    'shield-crown-outline',
};

const DEPT_COLORS: Record<string, { color: string; bg: string }> = {
  'public-works':  { color: '#1D4ED8', bg: '#DBEAFE' },
  'water-supply':  { color: '#0891B2', bg: '#CFFAFE' },
  'solid-waste':   { color: '#16A34A', bg: '#DCFCE7' },
  'sanitation':    { color: '#0F766E', bg: '#F0FDFA' },
  'drainage':      { color: '#4338CA', bg: '#E0E7FF' },
  'main-admin':    { color: COLORS.primary, bg: '#EFF6FF' },
};

export default function EscalateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, complaints, escalateComplaint } = useOfficial();
  const { t } = useTranslation();

  const targets = getEscalationTargets(profile.role);
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <SafeAreaView style={styles.emptySafe} edges={['top']}>
        <View style={styles.emptyInner}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.emptyTitle}>{t('complaintNotFound')}</Text>
          <Pressable onPress={() => router.back()} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>{t('back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = selected && reason.trim().length > 0 && !saving;

  const handleEscalate = async () => {
    if (!selected) {
      Alert.alert(t('required'), t('escalationTargetRequired'));
      return;
    }
    if (!reason.trim()) {
      Alert.alert(t('required'), t('escalationReasonRequired'));
      return;
    }

    setSaving(true);
    try {
      const target = targets.find((t) => t.id === selected);
      await escalateComplaint(complaint.id, target?.label ?? selected, reason.trim());
      Alert.alert(
        t('escalatedTitle'),
        t('complaintEscalatedTo').replace('{target}', target?.label ?? selected),
        [
          {
            text: t('ok'),
            onPress: () =>
              router.replace({
                pathname: '/(official)/complaint-details',
                params: { id: complaint.id },
              } as any),
          },
        ],
      );
    } catch {
      Alert.alert(t('error'), t('escalateFailed'));
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
            <Text style={styles.headerTitle}>{t('escalateComplaintTitle')}</Text>
            <Text style={styles.headerSub}>{complaint.id}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleEscalate}
          disabled={!canSubmit}
          style={[styles.confirmBtn, !canSubmit && styles.confirmBtnDisabled]}
        >
          <Text style={styles.confirmBtnText}>
            {saving ? 'Escalating…' : 'Confirm'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* ── Complaint context pill ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(0)} style={styles.contextPill}>
          <MaterialCommunityIcons
            name="clipboard-alert-outline"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.contextText} numberOfLines={2}>
            {complaint.title}
          </Text>
        </Animated.View>

        {/* ── Select Department ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(60)} style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons
              name="arrow-up-bold-circle-outline"
              size={16}
              color={COLORS.danger}
            />
            <Text style={styles.cardTitle}>{t('selectEscalationTarget')}</Text>
          </View>
          <Text style={styles.cardSubtext}>
            {t('escalationTargetHint')}
          </Text>

          <View style={styles.targetList}>
            {targets.map((target, idx) => {
              const isSelected = selected === target.id;
              const icon = DEPT_ICONS[target.id] ?? 'domain';
              const colors = DEPT_COLORS[target.id] ?? { color: COLORS.primary, bg: '#EFF6FF' };

              return (
                <Animated.View
                  key={target.id}
                  entering={FadeInDown.duration(300).delay(80 + idx * 50)}
                >
                  <Pressable
                    onPress={() => setSelected(target.id)}
                    style={[
                      styles.targetRow,
                      isSelected && styles.targetRowActive,
                    ]}
                  >
                    {/* Dept icon */}
                    <View
                      style={[
                        styles.targetIcon,
                        {
                          backgroundColor: isSelected
                            ? colors.color
                            : colors.bg,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={icon}
                        size={18}
                        color={isSelected ? COLORS.white : colors.color}
                      />
                    </View>

                    {/* Label + description */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.targetLabel,
                          isSelected && { color: colors.color },
                        ]}
                      >
                        {target.label}
                      </Text>
                      <Text style={styles.targetDesc}>{target.description}</Text>
                    </View>

                    {/* Radio */}
                    <MaterialCommunityIcons
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={20}
                      color={isSelected ? colors.color : COLORS.textPlaceholder}
                    />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Reason / Remarks ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(160)} style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons
              name="comment-text-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.cardTitle}>{t('escalationRemarks')}</Text>
          </View>
          <Text style={styles.cardSubtext}>
            {t('escalationRemarksHint')}</Text>
          <TextInput
            placeholder={t('escalationReasonPlaceholder')}
            placeholderTextColor={COLORS.textPlaceholder}
            multiline
            numberOfLines={5}
            value={reason}
            onChangeText={setReason}
            style={styles.textArea}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{reason.length} {t('characters')}</Text>
        </Animated.View>

        {/* ── Submit button ── */}
        <Animated.View entering={FadeInDown.duration(320).delay(220)}>
          <Pressable
            onPress={handleEscalate}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          >
            <MaterialCommunityIcons
              name="arrow-up-bold-circle-outline"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.submitBtnText}>
              {saving ? t('escalating') : t('escalateComplaintTitle')}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
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
  confirmBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  confirmBtnDisabled: { backgroundColor: '#CBD5E1' },
  confirmBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },

  /* Scroll */
  content: { padding: 16, paddingBottom: 44, gap: 14 },

  /* Context pill */
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  contextText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Cards */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.soft,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  cardSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },

  /* Target list */
  targetList: { gap: 10 },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  targetRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  targetDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  /* Text area */
  textArea: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    minHeight: 110,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
    lineHeight: 20,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPlaceholder,
    textAlign: 'right',
    marginTop: 6,
  },

  /* Submit */
  submitBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.button,
  },
  submitBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
  submitBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
});
