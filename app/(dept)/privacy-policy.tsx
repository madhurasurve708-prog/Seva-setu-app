// app/(dept)/privacy-policy.tsx
// Privacy Policy for the Department portal.
// Uses DepartmentScreen so it stays inside (dept) route group
// and does NOT trigger the OfficialProvider auth guard.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/common/GlassCard';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

const SECTION_DEFS = [
  {
    number: '01',
    titleKey: 'deptPrivacySec1Title',
    icon: 'account-tie-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
    paraKeys: ['deptPrivacySec1Para1', 'deptPrivacySec1Para2'],
    contact: null as string | null,
  },
  {
    number: '02',
    titleKey: 'deptPrivacySec2Title',
    icon: 'database-lock-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
    paraKeys: ['deptPrivacySec2Para1', 'deptPrivacySec2Para2'],
    contact: null as string | null,
  },
  {
    number: '03',
    titleKey: 'deptPrivacySec3Title',
    icon: 'email-outline' as const,
    color: '#0891B2',
    bg: '#CFFAFE',
    paraKeys: ['deptPrivacySec3Para1'],
    contact: 'support@malvanmunicipal.in',
  },
];

export default function DeptPrivacyPolicyScreen() {
  const { t } = useTranslation();
  const SECTIONS = SECTION_DEFS.map((s) => ({
    number: s.number,
    title: t(s.titleKey),
    icon: s.icon,
    color: s.color,
    bg: s.bg,
    paragraphs: s.paraKeys.map((k) => t(k)),
    contact: s.contact,
  }));

  return (
    <DepartmentScreen title={t('privacyPolicy')} back>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <View style={styles.datePill}>
          <MaterialCommunityIcons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.dateText}>{t('deptPrivacyLastUpdated')}</Text>
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
    </DepartmentScreen>
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
