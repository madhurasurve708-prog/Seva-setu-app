import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { GlassCard } from '@/components/common/GlassCard';
import { useTranslation } from '@/providers/localization-provider';

const PrivacyPolicyScreen = memo(function PrivacyPolicyScreen() {
  const { t, language } = useTranslation();
  const isMr = language === 'Marathi';

  return (
    <CitizenScreen title={t('privacyPolicy')} showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.lastUpdated}>{isMr ? 'अंतिम अद्यतन: जुलै २०२६' : 'Last Updated: July 2026'}</Text>

        {isMr ? (
          <>
            <Text style={styles.introText}>
              मालवण नगरपरिषद सेवा सेतू मोबाईल अॅप्लिकेशन चालवते. हे गोपनीयता धोरण तुम्हाला आमच्या नागरी तक्रार सेवांचा वापर करताना तुमच्या वैयक्तिक डेटाचे संकलन, वापर आणि संरक्षणाबाबतच्या आमच्या अधिकृत धोरणांची माहिती देते.
            </Text>

            <Text style={styles.sectionTitle}>१. आम्ही गोळा करत असलेली माहिती</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• वापरकर्ता खाते आणि मोबाईल नंबर</Text>
              <Text style={styles.bulletBody}>
                नोंदणी करताना, आम्ही तुमचे पूर्ण नाव, वॉर्ड आणि परिसराची माहिती गोळा करतो. सुरक्षित लॉगिनसाठी वन-टाइम पासवर्ड (OTP) पाठवण्यासाठी आम्ही तुमच्या मोबाईल नंबरचा वापर करतो.
              </Text>
              
              <Text style={styles.bulletTitle}>• तक्रार अहवाल आणि लोकसंख्याशास्त्र</Text>
              <Text style={styles.bulletBody}>
                अधिकारी योग्य पत्त्यावर पाठवण्यासाठी, तुमच्या तक्रारी आपोआप तुमच्या वॉर्ड आणि परिसराचे तपशील घेतात. तुमच्याद्वारे प्रदान केलेले स्थान / खुणेचे वर्णन सार्वजनिक कार्य नोंदीचा भाग म्हणून साठवले जाते.
              </Text>

              <Text style={styles.bulletTitle}>• फोटो आणि मीडिया परवानग्या</Text>
              <Text style={styles.bulletBody}>
                तुम्ही नागरी समस्येचा पुराव्याचा फोटो अपलोड करणे निवडल्यास, तो फोटो आमच्या सर्व्हरवर सुरक्षितपणे पाठवला जातो. तुम्ही स्पष्टपणे परवानगी दिल्याशिवाय आम्ही तुमच्या डिव्हाइस मीडिया लायब्ररीमध्ये प्रवेश करत नाही.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>२. आम्ही तुमचा डेटा कसा वापरतो</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• अंतर्गत सेवा निराकरण</Text>
              <Text style={styles.bulletBody}>
                तुमच्या तक्रारीचे तपशील, तुमच्या वॉर्ड आणि स्थानाच्या वर्णनासह, थेट वॉर्डातील नियुक्त स्वच्छता, पाणी, रस्ता किंवा वीज विभागाच्या अधिकाऱ्यांशी सामायिक केले जातात जेणेकरून त्यांना समस्या सोडवण्यास मदत होईल.
              </Text>

              <Text style={styles.bulletTitle}>• नागरी स्थिती अद्यतने</Text>
              <Text style={styles.bulletBody}>
                जेव्हा संबंधित विभाग तुमच्या तक्रारीची स्थिती अद्ययावत करतो, तेव्हा स्वयंचलित प्रगती अद्यतने पाठवण्यासाठी (उदा. एसएमएस किंवा अॅप सूचनेद्वारे) आम्ही तुमच्या मोबाईल नंबरचा वापर करतो.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>३. डेटा सुरक्षा आणि स्टोरेज</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• कूटबद्ध (Encrypted) प्रक्रिया</Text>
              <Text style={styles.bulletBody}>
                सर्व नागरिक डेटा HTTPS द्वारे सुरक्षितपणे प्रसारित केला जातो आणि राज्य सार्वजनिक सेवा मार्गदर्शक तत्त्वांच्या अंतर्गत व्यवस्थापित सुरक्षित क्लाउड सर्व्हरवर संग्रहित केला जातो.
              </Text>

              <Text style={styles.bulletTitle}>• कोणतीही व्यावसायिक विक्री नाही</Text>
              <Text style={styles.bulletBody}>
                आम्ही कोणत्याही तृतीय-पक्ष व्यावसायिक संस्थांना नागरिकांची वैयक्तिक माहिती विकत नाही, भाड्याने देत नाही किंवा व्यापार करत नाही. सर्व डेटा केवळ नागरी तक्रार निवारणासाठी वापरला जातो.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>४. आमच्याशी संपर्क साधा</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletBody}>
                या धोरणाबद्दल प्रश्नांसाठी किंवा खाते हटवण्याची विनंती करण्यासाठी, कृपया मालवण नगरपरिषदेच्या मुख्यालयातील आमच्या प्रशासकीय डेटा डेस्कशी संपर्क साधा किंवा आम्हाला support@malvanmunicipal.in वर ईमेल करा.
              </Text>
            </GlassCard>
          </>
        ) : (
          <>
            <Text style={styles.introText}>
              Malvan Municipal Council operates the Seva Setu mobile application. This Privacy Policy informs you of our official policies regarding the collection, usage, and protection of personal data when you use our civic-complaint services.
            </Text>

            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• User Account & Mobile Number</Text>
              <Text style={styles.bulletBody}>
                When registering, we collect your Full Name, Ward, and Locality. We use your mobile number to send secure one-time passwords (OTP) for secure login.
              </Text>
              
              <Text style={styles.bulletTitle}>• Complaint Reports & Demographics</Text>
              <Text style={styles.bulletBody}>
                To dispatch officers to the correct address, your complaints automatically inherit your ward and locality details. Location / Landmark descriptions provided by you are stored as part of the public work log.
              </Text>

              <Text style={styles.bulletTitle}>• Photos & Media Permissions</Text>
              <Text style={styles.bulletBody}>
                If you choose to upload a proof photo of a civic issue, the photo is securely sent to our servers. We only access your device media library if you explicitly grant permission.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• Internal Service Resolution</Text>
              <Text style={styles.bulletBody}>
                Your complaint details, including your general ward and location description, are shared directly with the ward’s assigned sanitation, water, road, or electricity department officers to help them resolve issues.
              </Text>

              <Text style={styles.bulletTitle}>• Citizen Status Updates</Text>
              <Text style={styles.bulletBody}>
                We use your mobile number to send automated progress updates (e.g. via SMS or App notification) when the resolving department updates the status of your complaint.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>3. Data Security & Storage</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletTitle}>• Encrypted Processing</Text>
              <Text style={styles.bulletBody}>
                All citizen data is transmitted securely via HTTPS and stored on secure cloud servers managed under state public service guidelines.
              </Text>

              <Text style={styles.bulletTitle}>• No Commercial Sharing</Text>
              <Text style={styles.bulletBody}>
                We do not sell, rent, or trade citizen personal information to any third-party commercial organizations. All data is exclusively handled for civic grievance resolution.
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>4. Contact Us</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.bulletBody}>
                For questions about this policy or to request account deletion, please contact our administrative data desk at the Malvan Municipal Council headquarters, or email us at support@malvanmunicipal.in.
              </Text>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </CitizenScreen>
  );
});

export default PrivacyPolicyScreen;

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
    marginBottom: 14,
    fontWeight: '500',
  },
});
