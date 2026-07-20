import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import GlassCard from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
  { code: 'Hindi',   label: 'हिन्दी (Hindi)' },
];

export default function PreferencesScreen() {
  const { profile, saveProfile } = useOfficial();
  const [selectedLang, setSelectedLang] = useState(profile.language);
  const [biometric, setBiometric] = useState(true);
  const [autoLogout, setAutoLogout] = useState(true);

  const handleLanguage = async (code: string) => {
    setSelectedLang(code);
    try {
      await saveProfile({ ...profile, language: code });
      Alert.alert('Language Updated', `Display language set to: ${code}`);
    } catch {
      Alert.alert('Error', 'Could not save language preference.');
    }
  };

  return (
    <OfficialScreen title="Preferences" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* Language */}
        <SectionHeader icon="translate" label="Select Language" />
        <GlassCard style={styles.card}>
          <Text style={styles.cardHint}>
            Choose your preferred display language for the Malvan municipal console.
          </Text>
          {LANGUAGES.map((lang) => {
            const active = selectedLang === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => void handleLanguage(lang.code)}
                style={[styles.radioRow, active && styles.radioRowActive]}
              >
                <MaterialCommunityIcons
                  name={active ? 'radiobox-marked' : 'radiobox-blank'}
                  size={20}
                  color={active ? COLORS.primary : COLORS.textPlaceholder}
                />
                <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>
                  {lang.label}
                </Text>
              </Pressable>
            );
          })}
        </GlassCard>

        {/* General */}
        <SectionHeader icon="tune-variant" label="General Settings" />
        <GlassCard style={styles.card}>
          <ToggleRow
            label="Biometric Authentication"
            sub="Use FaceID/Fingerprint to login quickly."
            value={biometric}
            onChange={() => setBiometric((v) => !v)}
          />
          <ToggleRow
            label="Auto Logout Session"
            sub="Log out after 30 minutes of inactivity."
            value={autoLogout}
            onChange={() => setAutoLogout((v) => !v)}
            isLast
          />
        </GlassCard>
      </ScrollView>
    </OfficialScreen>
  );
}

function SectionHeader({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={17} color={COLORS.accent} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  isLast,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: COLORS.accent, false: COLORS.border }}
        thumbColor={Platform.OS === 'android' ? COLORS.white : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  card: { padding: 14, marginBottom: 20 },
  cardHint: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    gap: 12,
  },
  radioRowActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  radioLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  radioLabelActive: { color: COLORS.primary, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  toggleSub: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, marginTop: 2 },
});
