import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

const REPORT_TYPES = [
  { title: 'Ward Performance Report',      desc: 'Ward-wise resolution rates and pending complaint workloads.',    icon: 'map-outline'             as const, color: '#2563EB', bg: '#DBEAFE' },
  { title: 'Department Performance',       desc: 'Assignment and resolution trends by municipal department.',     icon: 'domain'                  as const, color: '#7C3AED', bg: '#EDE9FE' },
  { title: 'Escalation Register',          desc: 'Full escalation history with action owners and timestamps.',    icon: 'arrow-up-bold-circle-outline' as const, color: '#DC2626', bg: '#FEF2F2' },
  { title: 'Monthly Complaint Register',   desc: 'All complaint records in the current dataset.',                icon: 'clipboard-text-outline'  as const, color: '#10B981', bg: '#ECFDF5' },
  { title: 'Citizen Grievance Summary',    desc: 'Top complainants, ward distribution and resolution averages.', icon: 'account-group-outline'   as const, color: '#EA580C', bg: '#FFEDD5' },
  { title: 'Resolved Complaints Log',      desc: 'Closed complaints with resolution notes and officer details.', icon: 'check-all'               as const, color: '#0F766E', bg: '#F0FDFA' },
];

export default function ReportsScreen() {
  const { complaints } = useOfficial();

  const generate = (title: string) =>
    Alert.alert(
      'Report Queued',
      `"${title}" will be available to download once the municipal reporting endpoint is connected.`,
    );

  return (
    <AdminShell title="Reports" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <Text style={styles.hint}>
          Generate exports using current complaint filters and municipal administrator permissions.
        </Text>

        {REPORT_TYPES.map((r, idx) => (
          <Animated.View key={r.title} entering={FadeInDown.duration(340).delay(idx * 50)}>
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: r.bg }]}>
                <MaterialCommunityIcons name={r.icon} size={20} color={r.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{r.title}</Text>
                <Text style={styles.cardDesc}>{r.desc}</Text>
                {r.title.includes('Monthly') && (
                  <Text style={styles.countPill}>{complaints.length} records</Text>
                )}
              </View>
              <Pressable
                onPress={() => generate(r.title)}
                style={({ pressed }) => [styles.genBtn, { backgroundColor: r.bg }, pressed && { opacity: 0.85 }]}
              >
                <MaterialCommunityIcons name="download-outline" size={14} color={r.color} />
                <Text style={[styles.genBtnText, { color: r.color }]}>Export</Text>
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
