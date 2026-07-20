import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import GlassCard from '@/components/common/GlassCard';
import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';

export default function SettingsAboutScreen() {
  return (
    <OfficialScreen title="About Seva Setu" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>सेवा सेतू</Text>
          <Text style={styles.appVersion}>Official Governance Portal · v1.0.0</Text>
        </View>

        <GlassCard style={styles.card}>
          <SectionHeading icon="connection" label="Connecting Malvan" />
          <Text style={styles.bodyText}>
            Seva Setu is the official digital bridge linking the citizens of Malvan with their elected ward representatives (Nagarsevaks) and municipal administration officers.
          </Text>
          <Text style={styles.bodyText}>
            By leveraging local ward demographics and real-time grievance logs, the portal ensures administrative accountability, public transparency, and accelerated resolution times for civic tasks.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <SectionHeading icon="shield-star-outline" label="Official Recognition" />
          <Text style={styles.bodyText}>
            This application node is synchronized directly with the desks of the Malvan Municipal Council. All activities, grievance reports, and performance parameters are securely logged under public administrative monitoring norms.
          </Text>
        </GlassCard>
      </ScrollView>
    </OfficialScreen>
  );
}

function SectionHeading({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.headingRow}>
      <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
      <Text style={styles.headingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44, gap: 14 },
  logoSection: { alignItems: 'center', paddingVertical: 24 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 14 },
  appName: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  appVersion: { fontSize: 13, color: COLORS.textMuted, fontWeight: '700', marginTop: 6 },
  card: { padding: 16 },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  headingText: { fontSize: 13, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.3 },
  bodyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
});
