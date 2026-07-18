import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import GlassCard from '@/components/common/GlassCard';

export default function TermsConditionsScreen() {
  return (
    <CitizenScreen title="Terms & Conditions" showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.lastUpdated}>Effective Date: July 2026</Text>

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
