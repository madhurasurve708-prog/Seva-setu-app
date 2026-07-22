import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import { COLORS, SHADOWS } from '@/constants/theme';
import { ALL_DEPARTMENTS } from '@/data/complaints';
import { DEPT_META } from '@/data/department-routing';
import { useOfficial } from '@/providers/official-provider';

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

        {ALL_DEPARTMENTS.map((name, idx) => {
          const meta     = DEPT_META[name];
          const total    = complaints.filter((c) => c.assignedDepartment === name).length;
          const resolved = complaints.filter((c) => c.assignedDepartment === name && c.status === 'Resolved').length;
          const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;
          const icon     = (meta?.icon ?? 'office-building-outline') as React.ComponentProps<typeof MaterialCommunityIcons>['name'];
          const color    = meta?.color ?? COLORS.primary;
          const bg       = meta?.bg    ?? '#EFF6FF';

          return (
            <Animated.View key={name} entering={FadeInDown.duration(340).delay(idx * 50)}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/(admin)/complaints', params: { department: name } } as any)
                }
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={[styles.iconCircle, { backgroundColor: bg }]}>
                  <MaterialCommunityIcons name={icon} size={22} color={color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.deptName}>{name}</Text>
                  <Text style={styles.deptEnglish}>{meta?.english ?? ''}</Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>{total} assigned</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.statsText}>{resolved} resolved</Text>
                  </View>

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
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.card, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft,
  },
  cardPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  iconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deptName: { fontSize: 13.5, fontWeight: '800', color: COLORS.text, marginBottom: 1 },
  deptEnglish: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statsText: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted },
  dot: { fontSize: 11, color: COLORS.textMuted },
  progressBg: { height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 3 },
  rateBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginLeft: 4 },
  rateText: { fontSize: 11, fontWeight: '800' },
});
