import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

const FAQS = [
  {
    qKey: 'officialFaq1Q',
    aKey: 'officialFaq1A',
    icon: 'clipboard-edit-outline' as const,
    color: COLORS.primary,
    bg: '#EFF6FF',
  },
  {
    qKey: 'officialFaq2Q',
    aKey: 'officialFaq2A',
    icon: 'arrow-up-bold-circle-outline' as const,
    color: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    qKey: 'officialFaq3Q',
    aKey: 'officialFaq3A',
    icon: 'eye-outline' as const,
    color: '#0891B2',
    bg: '#CFFAFE',
  },
  {
    qKey: 'officialFaq4Q',
    aKey: 'officialFaq4A',
    icon: 'map-marker-outline' as const,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    qKey: 'officialFaq5Q',
    aKey: 'officialFaq5A',
    icon: 'camera-outline' as const,
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  {
    qKey: 'officialFaq6Q',
    aKey: 'officialFaq6A',
    icon: 'information-outline' as const,
    color: '#EA580C',
    bg: '#FFF7ED',
  },
];

export default function SettingsFaqsScreen() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (idx: number) =>
    setExpanded((prev) => (prev === idx ? null : idx));

  return (
    <OfficialScreen title={t('helpFaqs')} showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        <Text style={styles.intro}>{t('tapToExpand')}</Text>

        {FAQS.map((faq, idx) => (
          <AccordionCard
            key={idx}
            faq={faq}
            isOpen={expanded === idx}
            onToggle={() => toggle(idx)}
            t={t}
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
  t,
}: {
  faq: (typeof FAQS)[0];
  isOpen: boolean;
  onToggle: () => void;
  t: (key: string) => string;
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
        <Text style={styles.questionText}>{t(faq.qKey)}</Text>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textMuted}
        />
      </View>

      <Animated.View style={answerStyle}>
        <View style={styles.answerWrap}>
          <View style={[styles.answerAccent, { backgroundColor: faq.color }]} />
          <Text style={styles.answerText}>{t(faq.aKey)}</Text>
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
