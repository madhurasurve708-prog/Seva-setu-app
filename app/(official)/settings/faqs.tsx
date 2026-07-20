import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS, SHADOWS } from '@/constants/theme';

const FAQS = [
  {
    q: 'How do I change the status of a complaint?',
    a: 'Open any complaint from your Dashboard or Complaints screen. In the details view, tap the appropriate status button (Pending / In Progress / Resolved) and add an optional note describing the update.',
    icon: 'clipboard-edit-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
  },
  {
    q: 'When should I escalate a complaint?',
    a: 'If a civic issue requires resources or permissions beyond your ward authority — such as pipeline repairs or road construction — tap "Escalate Complaint", choose the target department, and provide a reason.',
    icon: 'arrow-up-bold-circle-outline' as const,
    color: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    q: 'Can citizens see the notes I add?',
    a: 'Yes. All notes added by representatives are attached to the public complaint audit trail and are visible to the reporting citizen on their Seva Setu app.',
    icon: 'eye-outline' as const,
    color: '#0891B2',
    bg: '#CFFAFE',
  },
  {
    q: 'How do I change my assigned ward details?',
    a: 'Ward, Locality, and Department are loaded from your municipal registry record. If they are incorrect, contact the Main Council Admin desk to update your registry.',
    icon: 'map-marker-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    q: 'How do I add a verification photo to a complaint?',
    a: 'Open the complaint details screen and tap "Upload" in the Attached Photos section. You can upload a photo from your camera or gallery as proof of resolution.',
    icon: 'camera-outline' as const,
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  {
    q: 'What happens after I escalate a complaint?',
    a: 'The complaint priority is automatically set to Emergency and routed to the selected department or Main Admin. The escalation is recorded in the complaint timeline.',
    icon: 'information-outline' as const,
    color: '#EA580C',
    bg: '#FFF7ED',
  },
];

export default function SettingsFaqsScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (idx: number) =>
    setExpanded((prev) => (prev === idx ? null : idx));

  return (
    <OfficialScreen title="Help & FAQs" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <Text style={styles.intro}>Tap any question to expand the answer.</Text>

        {FAQS.map((faq, idx) => (
          <AccordionCard
            key={idx}
            faq={faq}
            isOpen={expanded === idx}
            onToggle={() => toggle(idx)}
          />
        ))}
      </ScrollView>
    </OfficialScreen>
  );
}

function AccordionCard({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof FAQS)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const progress = useSharedValue(0);

  const handleToggle = () => {
    progress.value = withTiming(isOpen ? 0 : 1, { duration: 240 });
    onToggle();
  };

  const answerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: progress.value * 220,
    overflow: 'hidden',
  }));

  return (
    <Pressable
      onPress={handleToggle}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.questionRow}>
        <View style={[styles.iconCircle, { backgroundColor: faq.bg }]}>
          <MaterialCommunityIcons name={faq.icon} size={18} color={faq.color} />
        </View>
        <Text style={styles.questionText}>{faq.q}</Text>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textMuted}
        />
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
  content: { padding: 18, paddingBottom: 44, gap: 12 },
  intro: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.soft,
  },
  cardPressed: {
    backgroundColor: 'rgba(11,79,138,0.03)',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 19,
  },
  answerWrap: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  answerAccent: {
    width: 3,
    borderRadius: 2,
    flexShrink: 0,
    minHeight: 20,
  },
  answerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
