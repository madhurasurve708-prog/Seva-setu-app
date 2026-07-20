import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import GlassCard from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';

const SECTIONS = [
  {
    number: '01',
    title: 'Acceptable Portal Use',
    icon: 'check-circle-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
    paragraphs: [
      'Access to this portal is restricted to authorized municipal representatives and ward officers of the Malvan Municipal Council.',
      'Officers must use this portal solely for monitoring complaints, documenting resolution progress, uploading proof, and escalating issues to the respective departments.',
    ],
  },
  {
    number: '02',
    title: 'Administrative Accountability',
    icon: 'shield-account-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
    paragraphs: [
      "All status edits, notes, and photos added through an officer's account are considered formal municipal records.",
      'Officers are responsible for ensuring the absolute accuracy and integrity of all data submitted through their profiles.',
    ],
  },
  {
    number: '03',
    title: 'Security & Compliance',
    icon: 'lock-outline' as const,
    color: '#DC2626',
    bg: '#FEF2F2',
    paragraphs: [
      'Unauthorized sharing of login credentials, municipal logs, or citizen identity profiles is strictly prohibited and subject to administrative disciplinary actions by the Council.',
    ],
  },
];

export default function SettingsTermsScreen() {
  return (
    <OfficialScreen title="Terms & Conditions" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <View style={styles.datePill}>
          <MaterialCommunityIcons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.dateText}>Last Updated: July 2026</Text>
        </View>

        {SECTIONS.map((s) => (
          <GlassCard key={s.number} style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, { backgroundColor: s.bg }]}>
                <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionNum}>{s.number}</Text>
                <Text style={[styles.sectionTitle, { color: s.color }]}>{s.title}</Text>
              </View>
            </View>
            <View style={[styles.sectionDivider, { backgroundColor: s.color }]} />
            {s.paragraphs.map((p, idx) => (
              <Text key={idx} style={styles.bodyText}>{p}</Text>
            ))}
          </GlassCard>
        ))}
      </ScrollView>
    </OfficialScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44, gap: 14 },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  dateText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  card: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionNum: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  sectionDivider: { height: 2, borderRadius: 1, marginBottom: 12, opacity: 0.2 },
  bodyText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
});
