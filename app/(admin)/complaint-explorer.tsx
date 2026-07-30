import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import { COLORS, SHADOWS } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

export default function ComplaintExplorer() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode = 'ward' } = useLocalSearchParams<{ mode?: string }>();
  const { complaints } = useOfficial();

  const DEPARTMENTS = [
    t('deptWaterDept'), t('deptRoadDept'), t('deptElectricalDept'),
    t('deptSanitationDept'), t('deptGardenDept'), t('deptAdministration'),
  ];

  const MODE_META: Record<string, { title: string; noun: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; bg: string }> = {
    ward:       { title: t('wardWiseLabel'),       noun: t('ward2'),     icon: 'map-marker-outline',  color: '#2563EB', bg: '#DBEAFE' },
    category:   { title: t('categoryWiseLabel'),   noun: t('category'),  icon: 'layers-outline',      color: '#EA580C', bg: '#FFEDD5' },
    department: { title: t('departmentWiseLabel'), noun: t('department'),icon: 'domain',              color: '#7C3AED', bg: '#EDE9FE' },
  };
  const meta = MODE_META[mode] ?? MODE_META.ward;

  const items =
    mode === 'category'
      ? categories
          .filter((c) => c.id !== 'all')
          .map((c) => ({ label: t(c.id), value: c.id, count: complaints.filter((x) => x.category === c.id).length }))
      : mode === 'department'
      ? DEPARTMENTS.map((d) => ({ label: d, value: d, count: complaints.filter((x) => x.assignedDepartment === d).length }))
      : Array.from({ length: 10 }, (_, i) => ({
          label: `${t('ward2')} ${i + 1}`,
          value: `Ward ${i + 1}`,
          count: complaints.filter((x) => x.ward.startsWith(`Ward ${i + 1}`)).length,
        }));

  return (
    <AdminShell title={meta.title} showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <Text style={styles.hint}>
          {t('tapModeHint').replace('{mode}', meta.noun)}
        </Text>

        {items.map((item, idx) => (
          <Animated.View key={item.value} entering={FadeInDown.duration(340).delay(idx * 40)}>
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaints', params: { [mode]: item.value } } as any)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
                <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardCount}>
                  {t('complaintsCountSuffix').replace('{count}', String(item.count)).replace('{plural}', item.count !== 1 ? 's' : '')}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44, gap: 10 },
  hint: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4, paddingHorizontal: 2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  cardPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  iconCircle: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  cardCount: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
});
