import React, { useState, memo, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { GlassCard } from '@/components/common/GlassCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '@/providers/localization-provider';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS_EN: FAQItem[] = [
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

const FAQS_MR: FAQItem[] = [
  {
    question: 'मी नवीन तक्रार कशी नोंदवू?',
    answer: 'खालील नेव्हिगेशनमधील रिपोर्ट टॅबवर जा, संबंधित श्रेणी निवडा, ठिकाण/खूण किंवा तपशील टाइप करा, समस्येचा फोटो अपलोड करा (पर्यायी), आणि "सबमिट करा" वर टॅप करा. ती लगेचच संबंधित विभागाकडे पाठवली जाईल.',
  },
  {
    question: 'तक्रार सोडवण्यासाठी किती वेळ लागतो?',
    answer: 'निराकरणाचा वेळ विभाग आणि समस्येच्या तीव्रतेनुसार बदलतो. स्वच्छता आणि कचरा उचलण्यासाठी साधारण २४-४८ तास लागतात. पथदिवे आणि पाणी पुरवठा समस्या २-३ व्यावसायिक दिवसांत सुटतात. तांत्रिक व्याप्तीनुसार रस्ते आणि सांडपाणी समस्यांना जास्त वेळ लागू शकतो.',
  },
  {
    question: 'मी माझ्या तक्रारीच्या स्थितीचा मागोवा (ट्रॅक) घेऊ शकतो का?',
    answer: 'होय! दाखल केलेल्या सर्व तक्रारी पाहण्यासाठी खालील बारमधील "तक्रारी" टॅबवर जा. तक्रार कार्डवर टॅप केल्यास रिअल-टाइम ट्रॅकिंग टाइमलाइन (प्रलंबित → प्रगतीपथावर → निकाली) दिसते.',
  },
  {
    question: 'माझी तक्रार न सुटता बंद झाली तर काय करावे?',
    answer: 'आपण समाधानी नसल्यास, आपण थेट हेल्पलाईनवर संपर्क करू शकता किंवा पुन्हा तक्रार करू शकता. चुकीच्या पद्धतीने बंद केलेल्या तक्रारींबद्दल दरमहा नगरपरिषदेच्या सभागृहात आयोजित होणाऱ्या नागरी तक्रार शिबिरात चर्चा केली जाऊ शकते.',
  },
  {
    question: 'माझी वैयक्तिक माहिती जाहीरपणे सामायिक केली जाते का?',
    answer: 'नाही, तुमचा डेटा सुरक्षितपणे साठवला जातो. आवश्यकतेनुसार ठिकाणाच्या तपशीलाची पडताळणी करण्यासाठी तुमचे नाव आणि फोन नंबर केवळ निराकरण अधिकारी आणि वॉर्ड प्रशासकांनाच दृश्यमान असतो.',
  },
];

const FAQAccordion = memo(function FAQAccordion({ item }: { item: FAQItem }) {
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
          size={20}
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
});

const HelpScreen = memo(function HelpScreen() {
  const { t, language } = useTranslation();
  
  const faqs = useMemo(() => (language === 'Marathi' ? FAQS_MR : FAQS_EN), [language]);

  const handleCall = useCallback(() => {
    Linking.openURL('tel:02365-252018').catch(() => {});
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL('mailto:support@malvanmunicipal.in').catch(() => {});
  }, []);

  return (
    <CitizenScreen title={t('helpSupport')} showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.sectionTitle}>{t('frequentlyAsked')}</Text>
        <GlassCard style={styles.faqCard}>
          {faqs.map((faq, idx) => (
            <View key={faq.question}>
              <FAQAccordion item={faq} />
              {idx < faqs.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </GlassCard>

        <Text style={styles.sectionTitle}>{t('howToReportTrack')}</Text>
        <GlassCard style={styles.guideCard}>
          <View style={styles.guideStep}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{language === 'Marathi' ? 'श्रेणी निवडा' : 'Select Category'}</Text>
              <Text style={styles.stepBody}>{language === 'Marathi' ? 'पाणी, सांडपाणी, पथदिवे, कचरा इत्यादींपैकी निवडा.' : 'Choose between Water, Drainage, Lights, Garbage, etc.'}</Text>
            </View>
          </View>
          <View style={styles.guideStep}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{language === 'Marathi' ? 'ठिकाण आणि वर्णन द्या' : 'Provide Location & Description'}</Text>
              <Text style={styles.stepBody}>{language === 'Marathi' ? 'जवळची खूण जोडा आणि विशिष्ट समस्येचे वर्णन करा.' : 'Mention landmark or flat number, and write clear details.'}</Text>
            </View>
          </View>
          <View style={styles.guideStep}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{language === 'Marathi' ? 'रिअल-टाइम प्रगती ट्रॅक करा' : 'Track Real-Time Progress'}</Text>
              <Text style={styles.stepBody}>{language === 'Marathi' ? 'माझ्या तक्रारी अंतर्गत नगर अधिकाऱ्यांकडून मिळणारे अद्यतन पहा.' : 'Receive notification alerts as officers updates resolve the issue.'}</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>{t('contactMunicipalCouncil')}</Text>
        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactIntro}>
            {t('contactIntro')}
          </Text>

          <Pressable onPress={handleCall} style={({ pressed }) => [styles.contactButton, pressed && { opacity: 0.9 }]}>
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.white} />
            <Text style={styles.contactBtnText}>{t('callSupport')}</Text>
          </Pressable>

          <Pressable onPress={handleEmail} style={({ pressed }) => [styles.contactButton, styles.emailBtn, pressed && { opacity: 0.9 }]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.contactBtnText, { color: COLORS.primary }]}>{t('emailSupport')}</Text>
          </Pressable>
        </GlassCard>

        <Text style={styles.footerNote}>{t('portalFooter')}</Text>
      </ScrollView>
    </CitizenScreen>
  );
});

export default HelpScreen;

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
