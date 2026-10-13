import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { GlassCard } from '@/components/common/GlassCard';
import { useTranslation } from '@/providers/localization-provider';

const TermsConditionsScreen = memo(function TermsConditionsScreen() {
  const { t, language } = useTranslation();
  const isMr = language === 'Marathi';

  return (
    <CitizenScreen title={t('termsConditions')} showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.lastUpdated}>{isMr ? 'प्रभावी तारीख: जुलै २०२६' : 'Effective Date: July 2026'}</Text>

        {isMr ? (
          <>
            <Text style={styles.introText}>
              सेवा सेतू मोबाईल अॅप्लिकेशन इन्स्टॉल करून आणि वापरून, तुम्ही मालवण नगरपरिषदेने निश्चित केलेल्या अटी आणि मार्गदर्शक तत्त्वांचे पालन करण्यास संमती देता.
            </Text>

            <Text style={styles.sectionTitle}>१. अॅप्लिकेशनचा स्वीकार्य वापर</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                सेवा सेतूची रचना मालवणच्या नागरिकांना स्थानिक नागरी समस्या (जसे की पाणी गळती, गटार तुंबणे, पथदिवे बंद असणे इ.) नगरपरिषदेकडे नोंदवण्यासाठी सक्षम करण्यासाठी केली गेली आहे. जाहिरात, राजकीय हेतू किंवा व्यावसायिक प्रसिद्धीसाठी या पोर्टलचा गैरवापर करण्यास सक्त मनाई आहे.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>२. तक्रार नोंदवण्याचे मार्गदर्शक तत्त्व</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• अचूक स्थान माहिती</Text>
              <Text style={styles.bulletBody}>
                नागरिकांनी वैध स्थान वर्णन/खुणेची माहिती प्रविष्ट करणे आवश्यक आहे जेणेकरून पालिका अधिकारी त्या जागेचा शोध घेऊन पाहणी करू शकतील.
              </Text>

              <Text style={styles.bulletTitle}>• चुकीच्या तक्रारींबद्दल इशारा</Text>
              <Text style={styles.bulletBody}>
                हेतूपूर्वक खोट्या तक्रारी दाखल करणे, बनावट फोटो अपलोड करणे किंवा एकाच तक्रारीची वारंवार पुनरावृत्ती करणे हा नागरी गुन्हा आहे. सतत खोट्या तक्रारी दाखल केल्यास खाते तात्पुरते किंवा कायमचे निलंबित केले जाऊ शकते.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>३. मीडिया अपलोड करण्याची जबाबदारी</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                नागरी समस्येचा पुरावा म्हणून फोटो जोडताना, फोटोमध्ये केवळ तीच भौतिक समस्या (उदा. कचऱ्याचा ढीग, रस्त्याचे नुकसान) दिसत असल्याची खात्री केली पाहिजे. चुकीचा मजकूर, वैयक्तिक चेहरे किंवा असंबद्ध मीडिया अपलोड करू नका.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>४. वापरकर्त्याची जबाबदारी आणि खाते</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                तुमचा मोबाईल नंबर सुरक्षित ठेवण्यासाठी तुम्ही स्वतः जबाबदार आहात. तुमच्या प्रमाणीकृत सत्रांतर्गत दाखल केलेल्या सर्व तक्रारी तुमच्या नागरी नोंदी मानल्या जातील. नावे आणि वॉर्डची माहिती नेहमी अचूक ठेवा.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>५. बदल</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                शहर सेवा सुधारण्यासाठी मालवण नगरपरिषदेकडे या अटी आणि पोर्टलच्या वैशिष्ट्यांमध्ये कोणत्याही वेळी बदल करण्याचा अधिकार राखीव आहे. अॅपचा तुमचा पुढील वापर म्हणजे नवीन मार्गदर्शक तत्त्वांचा स्वीकार मानला जाईल.
              </Text>
            </GlassCard>
          </>
        ) : (
          <>
            <Text style={styles.introText}>
              By installing and using the Seva Setu mobile application, you agree to comply with the terms and guidelines set by the Malvan Municipal Council.
            </Text>

            <Text style={styles.sectionTitle}>1. Acceptable Application Usage</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                Seva Setu is designed to empower citizens of Malvan to report local civic issues (such as water leakage, drainage blockages, street light failure, etc.) to the municipal council. Any misuse of this portal for advertising, political purposes, or commercial promotion is strictly prohibited.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>2. Complaint Submission Guidelines</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• Location Accuracy</Text>
              <Text style={styles.bulletBody}>
                Citizens must enter a valid location description/landmark so that municipal officers can locate and inspect the site.
              </Text>

              <Text style={styles.bulletTitle}>• Warning Against False Reporting</Text>
              <Text style={styles.bulletBody}>
                Lodging intentionally fake complaints, uploading mock images, or spamming identical reports is a public offense. Persistent false reporting may lead to temporary or permanent account suspension.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>3. Media Upload Responsibility</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                When attaching photos as proof of a civic issue, you must ensure the photo only shows the physical issue (e.g. garbage pile, road damage). Do not upload photos displaying inappropriate content, private faces, or unrelated personal media.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>4. User Responsibility & Account</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                You are responsible for keeping your mobile number access secure. All complaints lodged under your authenticated session are considered your civic submissions. Ensure that names and ward info are kept correct.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>5. Modifications</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.paragraph}>
                Malvan Municipal Council reserves the right to modify these terms and portal features at any time to improve city services. Your continued use of the app constitutes acceptance of any updated guidelines.
              </Text>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </CitizenScreen>
  );
});

export default TermsConditionsScreen;

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 },
  lastUpdated: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 10,
    fontWeight: '700',
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginTop: 18,
    marginBottom: 10,
    fontWeight: '800',
  },
  card: { padding: 16, marginBottom: 4 },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 3,
  },
  bulletBody: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
});
