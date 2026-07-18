import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import GlassCard from '@/components/common/GlassCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: 'How do I file a new complaint?',
    answer: 'Go to the report tab in bottom navigation, select the relevant category, type the manual location/landmark details, upload a photo of the issue (optional), and tap "Submit". It will immediately be assigned to the respective department.',
  },
  {
    question: 'How long does it take to resolve a complaint?',
    answer: 'Resolution time varies by department and severity. Sanitation and garbage clearance typically take 24-48 hours. Street lights and water issues are resolved within 2-3 business days. Roads and drainage may take longer depending on technical scope.',
  },
  {
    question: 'Can I track the status of my complaint?',
    answer: 'Yes! Head to the "Complaints" tab in the bottom bar to view all filed complaints. Tapping on a complaint card shows a real-time tracking timeline (Pending → In Progress → Resolved).',
  },
  {
    question: 'What if my complaint is closed without resolution?',
    answer: 'If you are dissatisfied, you can contact the support helpline directly or report it again. False closures can also be discussed at the monthly citizen grievance camp in the council hall.',
  },
  {
    question: 'Is my personal data shared publicly?',
    answer: 'No, your data is securely stored. Your name and phone number are only visible to the resolving officers and ward administrators to verify location details if needed.',
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={[styles.faqRow, expanded && styles.faqRowExpanded]}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.primary}
        />
      </View>
      {expanded && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

export default function HelpScreen() {
  const handleCall = () => {
    Linking.openURL('tel:02365-252018').catch(() => {});
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@malvanmunicipal.in').catch(() => {});
  };

  return (
    <CitizenScreen title="Help & Support" showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <GlassCard style={styles.faqCard}>
          {FAQS.map((faq, idx) => (
            <View key={faq.question}>
              <FAQAccordion item={faq} />
              {idx < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </GlassCard>

        <Text style={styles.sectionTitle}>How to Report & Track</Text>
        <GlassCard style={styles.guideCard}>
          <View style={styles.guideStep}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>Select Category</Text>
              <Text style={styles.stepBody}>Choose between Water, Drainage, Lights, Garbage, etc.</Text>
            </View>
          </View>
          <View style={styles.guideStep}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>Provide Location & Description</Text>
              <Text style={styles.stepBody}>Mention landmark or flat number, and write clear details.</Text>
            </View>
          </View>
          <View style={styles.guideStep}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>Monitor Updates</Text>
              <Text style={styles.stepBody}>Receive notification alerts as officers updates resolve the issue.</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Contact Municipal Council</Text>
        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactIntro}>
            If you need direct assistance regarding ward issues or general municipal services, please reach out below.
          </Text>

          <Pressable onPress={handleCall} style={({ pressed }) => [styles.contactButton, pressed && { opacity: 0.9 }]}>
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.white} />
            <Text style={styles.contactBtnText}>Call Support: 02365-252018</Text>
          </Pressable>

          <Pressable onPress={handleEmail} style={({ pressed }) => [styles.contactButton, styles.emailBtn, pressed && { opacity: 0.9 }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.contactBtnText, { color: COLORS.primary }]}>Email: support@malvanmunicipal.in</Text>
          </Pressable>
        </GlassCard>

        <Text style={styles.footerNote}>Malvan Municipal Council Seva Setu Portal v1.0.0</Text>
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginTop: 18,
    marginBottom: 10,
    fontWeight: '800',
  },
  faqCard: { padding: 0, overflow: 'hidden' },
  faqRow: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  faqRowExpanded: {
    backgroundColor: '#F8FAFC',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  faqAnswer: {
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  guideCard: { padding: 16 },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepBody: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
    fontWeight: '500',
  },
  contactCard: { padding: 16 },
  contactIntro: {
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  contactButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  emailBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  contactBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 30,
    fontWeight: '500',
  },
});
