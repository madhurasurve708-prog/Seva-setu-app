// app/(citizen)/about.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import GlassCard from '@/components/common/GlassCard';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  photo: any;
};

const TEAM: TeamMember[] = [
  {
    name: 'Madhura Surve',
    title: 'Founder',
    bio: 'Madhura leads the vision and development of Seva Setu, overseeing product strategy, backend development, project management, and collaboration with municipal authorities to build an efficient digital civic platform.',
    photo: require('../../assets/images/madhura.jpeg'),
  },
  {
    name: 'Apurva Sawant',
    title: 'Co-Founder',
    bio: 'As Co-Founder, leads the UI/UX design, frontend development, and branding of Seva Setu, ensuring the platform delivers a seamless, user-friendly, and accessible experience for every citizen.',
    photo: require('../../assets/images/apurva.png'),
  },
];

export default function About() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <CitizenScreen title="About Seva Setu" showBack hideNav>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Logo Section */}
        <Animated.View 
          entering={isHydrated ? ZoomIn.duration(600) : undefined} 
          style={styles.logoFrame}
        >
          <View style={styles.innerLogoRing}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title & Version */}
        <Animated.Text 
          entering={isHydrated ? FadeInUp.duration(500).delay(200) : undefined} 
          style={styles.title}
        >
          सेवा सेतू
        </Animated.Text>

        <Animated.Text 
          entering={isHydrated ? FadeInUp.duration(500).delay(300) : undefined} 
          style={styles.version}
        >
          Citizen Grievance Resolution Node • v1.0.0
        </Animated.Text>

        {/* Info Cards */}
        <Animated.View 
          entering={isHydrated ? FadeInUp.duration(600).delay(400) : undefined} 
          style={styles.infoWrapper}
        >
          <GlassCard style={styles.card}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="bridge" size={24} color={COLORS.accent} />
              <Text style={styles.cardHeading}>Connecting Malvan</Text>
            </View>
            <Text style={styles.cardText}>
              Seva Setu serves as the official communication bridge between Malvan citizens and the Municipal Administration. By reporting localized ward issues, citizens empower the municipality to act swiftly and maintain local infrastructure with absolute transparency.
            </Text>
          </GlassCard>

          <GlassCard style={StyleSheet.flatten([styles.card, styles.supportCard])}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="shield-check" size={22} color={COLORS.secondary} />
              <Text style={styles.cardHeading}>Official Council Node</Text>
            </View>
            <Text style={styles.cardText}>
              All complaints, data, and tracking are directly synchronized with the Malvan Municipal Council desks. Access is governed under official public data protection norms.
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Team Section Header */}
        <View style={styles.teamSectionHeader}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
          <Text style={styles.teamSectionTitle}>Meet Our Team</Text>
        </View>

        <Text style={styles.teamSectionSub}>
          The people behind Seva Setu, working to make Malvan's civic services simpler and faster.
        </Text>

        {/* Team Members */}
        <View style={styles.teamContainer}>
          {TEAM.map((member, idx) => (
            <Animated.View
              key={member.name}
              entering={isHydrated ? FadeInDown.duration(500).delay(500 + idx * 120) : undefined}
              style={styles.teamMemberWrapper}
            >
              <GlassCard style={styles.teamMemberCard}>
                {/* Team Photo */}
                <View style={styles.teamPhotoRing}>
                  <Image 
                    source={member.photo} 
                    style={styles.teamPhoto} 
                    resizeMode="cover" 
                  />
                </View>

                {/* Team Info */}
                <Text style={styles.teamName}>
                  {member.name}
                </Text>

                <Text style={styles.teamTitle}>
                  {member.title}
                </Text>

                {/* Team Bio */}
                <Text style={styles.teamBio}>
                  {member.bio}
                </Text>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          © 2026 Malvan Municipal Council • Government of Maharashtra
        </Text>
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, alignItems: 'center', paddingBottom: 40 },
  logoFrame: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.soft,
  },
  innerLogoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  logoImage: { width: 56, height: 56 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary, marginTop: 18, letterSpacing: 1.5 },
  version: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, textAlign: 'center', marginTop: 6 },
  infoWrapper: { width: '100%', marginVertical: 24, gap: 16 },
  card: { padding: 18 },
  supportCard: { borderColor: 'rgba(16, 185, 129, 0.2)' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardHeading: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  cardText: { fontSize: 13.5, color: COLORS.textMuted, lineHeight: 20, fontWeight: '500' },

  teamSectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  teamSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  teamSectionSub: {
    width: '100%',
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 20,
  },
  teamContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  teamMemberWrapper: {
    width: '100%',
  },
  teamMemberCard: {
    padding: 18,
    alignItems: 'center',
  },
  teamPhotoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  teamPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  teamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 12,
  },
  teamBio: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '500',
  },

  footerText: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 24, fontWeight: '600' },
});
