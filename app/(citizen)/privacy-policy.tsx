import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import GlassCard from '@/components/common/GlassCard';

export default function PrivacyPolicyScreen() {
  return (
    <CitizenScreen title="Privacy Policy" showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.lastUpdated}>Last Updated: July 2026</Text>

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
            Your complaint details, including your general ward and location description, are shared directly with the ward's assigned sanitation, water, road, or electricity department officers to help them resolve issues.
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
      </ScrollView>
    </CitizenScreen>
  );
}

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
