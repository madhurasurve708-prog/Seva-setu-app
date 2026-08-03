import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassCard } from '@/components/common/GlassCard';
import PrimaryButton from '@/components/common/PrimaryButton';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

export default function SecurityScreen() {
  const { profile, saveProfile } = useOfficial();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = current.length > 0 && next.length >= 6 && confirm.length > 0 && !saving;

  const handleSave = async () => {
    if (current !== profile.password) {
      Alert.alert('Incorrect Password', 'The current password you entered is wrong.');
      return;
    }
    if (next.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ ...profile, password: next });
      Alert.alert('Success', 'Password updated successfully.');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <OfficialScreen title="Security" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconCircle}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.infoText}>
            Use a strong password with letters, numbers, and symbols. Never share it with anyone.
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="lock-reset" size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Change Password</Text>
          </View>

          <PasswordField
            label="Current Password"
            placeholder="Enter your current password"
            value={current}
            onChangeText={setCurrent}
            show={showCurrent}
            onToggleShow={() => setShowCurrent((v) => !v)}
          />
          <PasswordField
            label="New Password"
            placeholder="Minimum 6 characters"
            value={next}
            onChangeText={setNext}
            show={showNext}
            onToggleShow={() => setShowNext((v) => !v)}
          />
          <PasswordField
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirm}
            onChangeText={setConfirm}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            isLast
          />
        </GlassCard>

        {/* Strength hints */}
        {next.length > 0 && (
          <View style={styles.strengthRow}>
            <StrengthDot active={next.length >= 6} color={COLORS.success} label="6+ chars" />
            <StrengthDot active={/[A-Z]/.test(next)} color="#7C3AED" label="Uppercase" />
            <StrengthDot active={/[0-9]/.test(next)} color="#EA580C" label="Number" />
            <StrengthDot active={/[^A-Za-z0-9]/.test(next)} color={COLORS.primary} label="Symbol" />
          </View>
        )}

        <PrimaryButton
          label={saving ? 'Updating…' : 'Update Password'}
          loading={saving}
          onPress={handleSave}
          disabled={!canSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </OfficialScreen>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  show,
  onToggleShow,
  isLast,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.fieldWrap, isLast && { marginBottom: 0 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={!show}
          style={styles.input}
          autoCapitalize="none"
        />
        <Pressable onPress={onToggleShow} hitSlop={8}>
          <MaterialCommunityIcons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={COLORS.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

function StrengthDot({
  active,
  color,
  label,
}: {
  active: boolean;
  color: string;
  label: string;
}) {
  return (
    <View style={styles.strengthItem}>
      <View style={[styles.strengthDot, { backgroundColor: active ? color : COLORS.border }]} />
      <Text style={[styles.strengthLabel, active && { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44, gap: 14 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...SHADOWS.soft,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    lineHeight: 18,
  },

  card: { padding: 16 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.text },

  strengthRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 4 },
  strengthItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strengthDot: { width: 8, height: 8, borderRadius: 4 },
  strengthLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },

  saveBtn: { width: '100%' },
});
