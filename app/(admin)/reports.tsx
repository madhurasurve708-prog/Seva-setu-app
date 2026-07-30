import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

const REPORT_TYPES = [
  { id: 'ward',       titleKey: 'reportWardPerformanceTitle', descKey: 'reportWardPerformanceDesc', icon: 'map-outline'             as const, color: '#2563EB', bg: '#DBEAFE' },
  { id: 'dept',       titleKey: 'reportDeptPerformanceTitle', descKey: 'reportDeptPerformanceDesc', icon: 'domain'                  as const, color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'escalation', titleKey: 'reportEscalationRegisterTitle', descKey: 'reportEscalationRegisterDesc', icon: 'arrow-up-bold-circle-outline' as const, color: '#DC2626', bg: '#FEF2F2' },
  { id: 'monthly',    titleKey: 'reportMonthlyRegisterTitle', descKey: 'reportMonthlyRegisterDesc', icon: 'clipboard-text-outline'  as const, color: '#10B981', bg: '#ECFDF5' },
  { id: 'citizen',    titleKey: 'reportCitizenSummaryTitle',  descKey: 'reportCitizenSummaryDesc',  icon: 'account-group-outline'   as const, color: '#EA580C', bg: '#FFEDD5' },
  { id: 'resolved',   titleKey: 'reportResolvedLogTitle',     descKey: 'reportResolvedLogDesc',     icon: 'check-all'               as const, color: '#0F766E', bg: '#F0FDFA' },
];

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { complaints } = useOfficial();

  const generate = (title: string) =>
    Alert.alert(
      t('reportQueuedTitle'),
      t('reportQueuedMsg').replace('{title}', title),
    );

  return (
    <AdminShell title={t('reports')} showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <Text style={styles.hint}>
          {t('generateExportsHint')}
        </Text>

        {REPORT_TYPES.map((r, idx) => (
          <Animated.View key={r.id} entering={FadeInDown.duration(340).delay(idx * 50)}>
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: r.bg }]}>
                <MaterialCommunityIcons name={r.icon} size={20} color={r.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t(r.titleKey)}</Text>
                <Text style={styles.cardDesc}>{t(r.descKey)}</Text>
                {r.id === 'monthly' && (
                  <Text style={styles.countPill}>{t('recordsSuffix').replace('{count}', String(complaints.length))}</Text>
                )}
              </View>
              <Pressable
                onPress={() => generate(t(r.titleKey))}
                style={({ pressed }) => [styles.genBtn, { backgroundColor: r.bg }, pressed && { opacity: 0.85 }]}
              >
                <MaterialCommunityIcons name="download-outline" size={14} color={r.color} />
                <Text style={[styles.genBtnText, { color: r.color }]}>{t('exportLabel')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44, gap: 12 },
  hint: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4, paddingHorizontal: 2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  iconCircle: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
  cardDesc: { fontSize: 11.5, fontWeight: '500', color: COLORS.textMuted, lineHeight: 16 },
  countPill: { fontSize: 10, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  genBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, flexShrink: 0 },
  genBtnText: { fontSize: 11, fontWeight: '800' },
});
