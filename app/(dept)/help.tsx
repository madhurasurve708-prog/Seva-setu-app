import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

const FAQ_DEFS = [
  { qKey: 'deptFaq1Q', aKey: 'deptFaq1A', icon: 'clipboard-edit-outline' as const, color: COLORS.primary, bg: '#EFF6FF' },
  { qKey: 'deptFaq2Q', aKey: 'deptFaq2A', icon: 'filter-outline' as const, color: '#7C3AED', bg: '#F5F3FF' },
  { qKey: 'deptFaq3Q', aKey: 'deptFaq3A', icon: 'arrow-up-bold-circle-outline' as const, color: '#DC2626', bg: '#FEF2F2' },
  { qKey: 'deptFaq4Q', aKey: 'deptFaq4A', icon: 'map-outline' as const, color: '#0891B2', bg: '#CFFAFE' },
  { qKey: 'deptFaq5Q', aKey: 'deptFaq5A', icon: 'bullhorn-outline' as const, color: '#EA580C', bg: '#FFF7ED' },
  { qKey: 'deptFaq6Q', aKey: 'deptFaq6A', icon: 'logout' as const, color: '#16A34A', bg: '#DCFCE7' },
];

export default function DeptHelpScreen() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<number | null>(null);
  const FAQS = FAQ_DEFS.map((f) => ({ q: t(f.qKey), a: t(f.aKey), icon: f.icon, color: f.color, bg: f.bg }));

  return (
    <DepartmentScreen title={t('helpFAQs')} back>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        <Text style={styles.intro}>{t('tapToExpand')}</Text>
        {FAQS.map((faq, idx) => (
          <AccordionCard
            key={idx}
            faq={faq}
            isOpen={expanded === idx}
            onToggle={() => setExpanded((prev) => (prev === idx ? null : idx))}
          />
        ))}
      </ScrollView>
    </DepartmentScreen>
  );
}

type Faq = { q: string; a: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string; bg: string };

function AccordionCard({ faq, isOpen, onToggle }: { faq: Faq; isOpen: boolean; onToggle: () => void }) {
  const progress = useSharedValue(0);
  const handle = () => {
    progress.value = withTiming(isOpen ? 0 : 1, { duration: 220 });
    onToggle();
  };
  const answerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: progress.value * 200,
    overflow: 'hidden',
  }));
  return (
    <Pressable onPress={handle} style={({ pressed }) => [styles.card, pressed && { backgroundColor: '#F8FAFC' }]}>
      <View style={styles.questionRow}>
        <View style={[styles.iconCircle, { backgroundColor: faq.bg }]}>
          <MaterialCommunityIcons name={faq.icon} size={18} color={faq.color} />
        </View>
        <Text style={styles.questionText}>{faq.q}</Text>
        <MaterialCommunityIcons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
      </View>
      <Animated.View style={answerStyle}>
        <View style={styles.answerWrap}>
          <View style={[styles.answerAccent, { backgroundColor: faq.color }]} />
          <Text style={styles.answerText}>{faq.a}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44, gap: 10 },
  intro: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 2 },
  card: { backgroundColor: COLORS.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  questionText: { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.text, lineHeight: 18 },
  answerWrap: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  answerAccent: { width: 3, borderRadius: 2, flexShrink: 0, minHeight: 20 },
  answerText: { flex: 1, fontSize: 13, fontWeight: '500', color: COLORS.textMuted, lineHeight: 19 },
});
