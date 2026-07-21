import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

const DEPT_META = [
  { id: 'Water Department',      icon: 'water-pump'              as const, color: '#2563EB', bg: '#DBEAFE' },
  { id: 'Road Department',       icon: 'road-variant'            as const, color: '#1D4ED8', bg: '#EFF6FF' },
  { id: 'Electrical Department', icon: 'lightbulb-on'            as const, color: '#CA8A04', bg: '#FEF9C3' },
  { id: 'Sanitation Department', icon: 'medical-bag'             as const, color: '#0F766E', bg: '#F0FDFA' },
  { id: 'Garden Department',     icon: 'tree'                    as const, color: '#16A34A', bg: '#DCFCE7' },
  { id: 'Administration',        icon: 'office-building-outline' as const, color: '#7C3AED', bg: '#EDE9FE' },
];

export default function DepartmentsScreen() {
  const router = useRouter();
  const { complaints } = useOfficial();

  return (
    <AdminShell title="Departments" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <Text style={styles.hint}>
          Tap a department to view all its assigned complaints.
        </Text>

        {DEPT_META.map((dept, idx) => {
          const total    = complaints.filter((c) => c.assignedDepartment === dept.id).length;
          const resolved = complaints.filter((c) => c.assignedDepartment === dept.id && c.status === 'Resolved').length;
          const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;

          return (
            <Animated.View key={dept.id} entering={FadeInDown.duration(340).delay(idx * 50)}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/(admin)/complaints', params: { department: dept.id } } as any)
                }
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                {/* Icon */}
                <View style={[styles.iconCircle, { backgroundColor: dept.bg }]}>
                  <MaterialCommunityIcons name={dept.icon} size={22} color={dept.color} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.deptName}>{dept.id}</Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>{total} assigned</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.statsText}>{resolved} resolved</Text>
                  </View>

                  {/* Progress bar */}
                  {total > 0 && (
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${rate}%`,
                            backgroundColor: rate >= 70 ? COLORS.success : '#F59E0B',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* Rate badge */}
                {total > 0 && (
                  <View style={[styles.rateBadge, { backgroundColor: rate >= 70 ? '#DCFCE7' : '#FFF8ED' }]}>
                    <Text style={[styles.rateText, { color: rate >= 70 ? '#16A34A' : '#CA8A04' }]}>
                      {rate}%
                    </Text>
                  </View>
                )}

                <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44, gap: 10 },
  hint: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4, paddingHorizontal: 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  cardPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  iconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deptName: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statsText: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted },
  dot: { fontSize: 11, color: COLORS.textMuted },
  progressBg: { height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 3 },
  rateBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginLeft: 4 },
  rateText: { fontSize: 11, fontWeight: '800' },
});
