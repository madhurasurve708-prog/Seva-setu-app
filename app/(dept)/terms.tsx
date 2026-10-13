import React, { memo, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/common/GlassCard';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

const SECTION_DEFS = [
  {
    number: '01',
    titleKey: 'deptTermsSec1Title',
    icon: 'check-circle-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
    paraKeys: ['deptTermsSec1Para1', 'deptTermsSec1Para2'],
  },
  {
    number: '02',
    titleKey: 'deptTermsSec2Title',
    icon: 'shield-account-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
    paraKeys: ['deptTermsSec2Para1', 'deptTermsSec2Para2'],
  },
  {
    number: '03',
    titleKey: 'deptTermsSec3Title',
    icon: 'lock-outline' as const,
    color: '#DC2626',
    bg: '#FEF2F2',
    paraKeys: ['deptTermsSec3Para1'],
  },
];

const DeptTermsScreen = memo(function DeptTermsScreen() {
  const { t } = useTranslation();

  const SECTIONS = useMemo(() => {
    return SECTION_DEFS.map((s) => ({
      number: s.number,
      title: t(s.titleKey),
      icon: s.icon,
      color: s.color,
      bg: s.bg,
      paragraphs: s.paraKeys.map((k) => t(k)),
    }));
  }, [t]);

  return (
    <DepartmentScreen title={t('termsConditions')} back>
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
          </GlassCard>
        ))}
      </ScrollView>
    </DepartmentScreen>
  );
});

export default DeptTermsScreen;

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
