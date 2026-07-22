import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS } from '@/constants/theme';

const FAQS = [
  {
    q: 'How do I update the status of a complaint?',
    a: 'Open the complaint from your Complaints tab. Use the action buttons (Pending / In Progress / Resolved) to update the status. You can also add a department note before saving.',
    icon: 'clipboard-edit-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
  },
  {
    q: 'Which complaints are assigned to my department?',
    a: 'Only complaints whose category maps to your department will appear in your Complaints tab. The category–department mapping is set by the Main Admin.',
    icon: 'filter-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    q: 'How do I escalate a complaint to the Nagaradhyaksha?',
    a: 'Open the complaint details and tap "Escalate to Nagaradhyaksha" at the bottom. This marks the complaint as Escalated and routes it to the main admin for review.',
    icon: 'arrow-up-bold-circle-outline' as const,
    color: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    q: 'Can I see complaints from all wards?',
    a: 'Yes. Department Officers have access to complaints from all 10 municipal wards that belong to your department. Use the ward filter cards on the Dashboard to focus on a specific ward.',
    icon: 'map-outline' as const,
    color: '#0891B2',
    bg: '#CFFAFE',
  },
  {
    q: 'Why can\'t I create announcements?',
    a: 'Announcements are published only by the Main Admin (Nagaradhyaksha). Your Announcements tab shows the latest notices from admin so you stay informed.',
    icon: 'bullhorn-outline' as const,
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  {
    q: 'How do I logout?',
    a: 'Go to Profile and tap the Logout button at the bottom, or go to Settings and tap Logout. You will be returned to the Department Login screen.',
    icon: 'logout' as const,
    color: '#16A34A',
    bg: '#DCFCE7',
  },
];

export default function DeptHelpScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <DepartmentScreen title="Help & FAQs" back>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        <Text style={styles.intro}>Tap any question to expand the answer.</Text>
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

function AccordionCard({ faq, isOpen, onToggle }: { faq: typeof FAQS[0]; isOpen: boolean; onToggle: () => void }) {
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
