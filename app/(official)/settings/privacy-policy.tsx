import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import GlassCard from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';

const SECTIONS = [
  {
    number: '01',
    title: 'Privacy for Municipal Representatives',
    icon: 'account-tie-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
    paragraphs: [
      'All municipal representatives, including Nagarsevaks and administrative department officers, are governed by public service privacy guidelines.',
      'Your representative profile, email ID, assigned ward, and related details are visible internally and synchronized directly with the Malvan Municipal Council desks.',
    ],
    contact: null as string | null,
  },
  {
    number: '02',
    title: 'Data Protection & Activity Logs',
    icon: 'database-lock-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
    paragraphs: [
      'To maintain accountability and administrative audit trails, all status changes, notes, images, and escalation requests are securely logged with details of the performing officer.',
      'This data is stored encrypted under the official Council public governance database rules and is strictly shared only with authorized council leaders.',
    ],
    contact: null as string | null,
  },
  {
    number: '03',
    title: 'Contact Information',
    icon: 'email-outline' as const,
    color: '#0891B2',
    bg: '#CFFAFE',
    paragraphs: [
      'For inquiries regarding municipal privacy guidelines or administrative account management, please reach out to the Council administrative data desk.',
    ],
    contact: 'support@malvanmunicipal.in',
  },
];

export default function SettingsPrivacyPolicyScreen() {
  return (
    <OfficialScreen title="Privacy Policy" showBack>
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
            {s.contact ? (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${s.contact}`).catch(() => {})}
                style={styles.contactRow}
              >
                <MaterialCommunityIcons name="email-outline" size={14} color={s.color} />
                <Text style={[styles.contactText, { color: s.color }]}>{s.contact}</Text>
              </Pressable>
            ) : null}
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactText: { fontSize: 13, fontWeight: '700' },
});
