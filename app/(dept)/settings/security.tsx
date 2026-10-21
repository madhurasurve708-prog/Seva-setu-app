import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassCard } from '@/components/common/GlassCard';
import PrimaryButton from '@/components/common/PrimaryButton';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';
import { useDepartment } from '@/providers/department-provider';

export default function DepartmentSecurityScreen() {
  const router = useRouter();
  const { profile, changePassword, logout } = useDepartment();
  const { t } = useTranslation();

  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = next.length >= 8 && confirm.length > 0 && !saving;

  const handleSave = async () => {
    if (next.length < 8) {
      Alert.alert(t('weakPassword'), t('weakPasswordMessage'));
      return;
    }
    if (next !== confirm) {
      Alert.alert(t('passwordMismatch'), t('passwordMismatchMessage'));
      return;
    }
    setSaving(true);
    try {
      await changePassword(next);
      
      // Clear fields immediately on success
      setNext('');
      setConfirm('');
      
      const redirectRoute = '/(auth)/department-login';

      // Success handler must clear auth state and navigate to login ONLY after backend confirms success
      Alert.alert(
        t('success') || 'Success',
        t('passwordUpdatedReLogin'),
        [
          {
            text: t('ok') || 'OK',
            onPress: async () => {
              await logout();
              router.replace(redirectRoute as any);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      Alert.alert(t('error'), err instanceof Error ? err.message : t('passwordUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DepartmentScreen title={t('securityTitle') || t('security')} back>
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
            {t('securityHint')}
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="lock-reset" size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{t('changePassword')}</Text>
          </View>

          <PasswordField
            label={t('newPassword')}
            placeholder={t('passwordMinimumPlaceholder')}
            value={next}
            onChangeText={setNext}
            show={showNext}
            onToggleShow={() => setShowNext((v) => !v)}
          />
          <PasswordField
            label={t('confirmNewPassword')}
            placeholder={t('confirmPasswordPlaceholder')}
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
            <StrengthDot active={next.length >= 8} color={COLORS.success} label={t('charactersSixPlus')} />
            <StrengthDot active={/[A-Z]/.test(next)} color="#7C3AED" label={t('uppercase')} />
            <StrengthDot active={/[0-9]/.test(next)} color="#EA580C" label={t('number')} />
            <StrengthDot active={/[^A-Za-z0-9]/.test(next)} color={COLORS.primary} label={t('symbol')} />
          </View>
        )}

        <PrimaryButton
          label={saving ? t('saving') : t('updatePassword')}
          loading={saving}
          onPress={handleSave}
          disabled={!canSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </DepartmentScreen>
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
