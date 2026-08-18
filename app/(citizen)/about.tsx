// app/(citizen)/about.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useState, useMemo } from 'react';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { GlassCard } from '@/components/common/GlassCard';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from '@/providers/localization-provider';

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  photo: any;
};

const TEAM_EN: TeamMember[] = [
  {
    name: 'Madhura Surve',
    title: 'Founder',
    bio: 'Madhura leads the vision and development of Seva Setu, overseeing product strategy, backend development, project management, and collaboration with municipal authorities to build an efficient digital civic platform.',
    photo: require('../../assets/images/madhura.webp'),
  },
  {
    name: 'Apurva Sawant',
    title: 'Co-Founder',
    bio: 'As Co-Founder, leads the UI/UX design, frontend development, and branding of Seva Setu, ensuring the platform delivers a seamless, user-friendly, and accessible experience for every citizen.',
    photo: require('../../assets/images/apurva.webp'),
  },
];

const TEAM_MR: TeamMember[] = [
  {
    name: 'मधुरा सुर्वे',
    title: 'संस्थापक',
    bio: 'मधुरा सेवा सेतूच्या ध्येयाचे आणि विकासाचे नेतृत्व करतात. त्या उत्पादन धोरण, बॅकएंड विकास, प्रकल्प व्यवस्थापन आणि कार्यक्षम नागरी व्यासपीठ तयार करण्यासाठी नगरपालिका अधिकाऱ्यांसोबतच्या समन्वयाची धुरा सांभाळतात.',
    photo: require('../../assets/images/madhura.webp'),
  },
  {
    name: 'अपूर्वा सावंत',
    title: 'सह-संस्थापक',
    bio: 'सह-संस्थापक म्हणून, अपूर्वा सेवा सेतूचे युझर इंटरफेस (UI/UX) डिझाईन, फ्रंटएंड विकास आणि ब्रँडिंगचे नेतृत्व करतात, ज्यामुळे प्रत्येक नागरिकाला वापरण्यास सोपा आणि सुलभ अनुभव मिळेल.',
    photo: require('../../assets/images/apurva.webp'),
  },
];

import React, { memo } from 'react';

const About = memo(function About() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { t, language } = useTranslation();

  const team = useMemo(() => (language === 'Marathi' ? TEAM_MR : TEAM_EN), [language]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <CitizenScreen title={t('aboutApp')} showBack hideNav>
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
              source={require('../../assets/images/logo.webp')}
              style={styles.logoImage}
              contentFit="contain"
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
          {t('citizenGrievanceNode')}
        </Animated.Text>

        {/* Info Cards */}
        <Animated.View 
          entering={isHydrated ? FadeInUp.duration(600).delay(400) : undefined} 
          style={styles.infoWrapper}
        >
          <GlassCard style={styles.card}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="bridge" size={24} color={COLORS.accent} />
              <Text style={styles.cardHeading}>{t('connectingMalvanCitizen')}</Text>
            </View>
            <Text style={styles.cardText}>
              {t('connectingMalvanCitizenBody')}
            </Text>
          </GlassCard>

          <GlassCard style={StyleSheet.flatten([styles.card, styles.supportCard])}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="shield-check" size={22} color={COLORS.secondary} />
              <Text style={styles.cardHeading}>{t('officialCouncilNode')}</Text>
            </View>
            <Text style={styles.cardText}>
              {t('officialCouncilNodeBody')}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Team Section Header */}
        <View style={styles.teamSectionHeader}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
          <Text style={styles.teamSectionTitle}>{t('meetOurTeam')}</Text>
        </View>

        <Text style={styles.teamSectionSub}>
          {t('meetOurTeamSub')}
        </Text>

        {/* Team Members */}
        <View style={styles.teamContainer}>
          {team.map((member, idx) => (
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
                    contentFit="cover" 
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
          {t('footerCopyright')}
        </Text>
      </ScrollView>
    </CitizenScreen>
  );
});

export default About;

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
