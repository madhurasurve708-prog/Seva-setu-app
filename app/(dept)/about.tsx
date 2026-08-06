// app/(dept)/about.tsx
// About Us page for the Department portal.
// Same content and layout as the official/citizen about pages.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { GlassCard } from '@/components/common/GlassCard';
import { DepartmentScreen } from '@/components/dept/department-screen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

const FOUNDER_EN = {
  founderTitle: 'Founder',
  coFounderTitle: 'Co-Founder',
  founderBio:
    'Madhura leads the vision and development of Seva Setu, overseeing product strategy, backend development, project management, and collaboration with municipal authorities to build an efficient digital civic platform.',
  coFounderBio:
    'As Co-Founder, leads the UI/UX design, frontend development, and branding of Seva Setu, ensuring the platform delivers a seamless, user-friendly, and accessible experience for every citizen.',
};

const FOUNDER_MR = {
  founderTitle: 'संस्थापक',
  coFounderTitle: 'सह-संस्थापक',
  founderBio:
    'माधुरा सेवा सेतूची दृष्टी आणि विकास यांचे नेतृत्व करते, उत्पादन धोरण, बॅकएंड विकास, प्रकल्प व्यवस्थापन आणि नगरपालिका अधिकाऱ्यांशी सहकार्य यांवर देखरेख करते.',
  coFounderBio:
    'सह-संस्थापक म्हणून, सेवा सेतूची UI/UX डिझाइन, फ्रंटएंड विकास आणि ब्रँडिंगचे नेतृत्व करते.',
};

type TeamMember = { name: string; titleKey: string; bioKey: string; photo: number };

const TEAM: TeamMember[] = [
  { name: 'Madhura Surve',  titleKey: 'founderTitle',   bioKey: 'founderBio',   photo: require('../../assets/images/madhura.webp') },
  { name: 'Apurva Sawant',  titleKey: 'coFounderTitle', bioKey: 'coFounderBio', photo: require('../../assets/images/apurva.webp')   },
];

export default function DeptAboutScreen() {
  const { t, language } = useTranslation();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const local = language === 'Marathi' ? FOUNDER_MR : FOUNDER_EN;

  return (
    <DepartmentScreen title={t('aboutSevaSetu')} back>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} overScrollMode="never">
        <Animated.View entering={hydrated ? ZoomIn.duration(600) : undefined} style={styles.logoFrame}>
          <View style={styles.innerLogoRing}>
            <Image source={require('../../assets/images/logo.webp')} style={styles.logoImage} contentFit="contain" />
          </View>
        </Animated.View>

        <Animated.Text entering={hydrated ? FadeInUp.duration(500).delay(160) : undefined} style={styles.title}>
          सेवा सेतू
        </Animated.Text>
        <Animated.Text entering={hydrated ? FadeInUp.duration(500).delay(240) : undefined} style={styles.version}>
          {t('officialGovernancePortal')}
        </Animated.Text>

        <Animated.View entering={hydrated ? FadeInUp.duration(600).delay(320) : undefined} style={styles.infoWrapper}>
          <GlassCard style={styles.card}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="bridge" size={22} color={COLORS.accent} />
              <Text style={styles.cardHeading}>{t('connectingMalvan')}</Text>
            </View>
            <Text style={styles.cardText}>{t('connectingMalvanBody1')}</Text>
            <Text style={styles.cardText}>{t('connectingMalvanBody2')}</Text>
          </GlassCard>

          <GlassCard style={{ ...styles.card, ...styles.supportCard }}>
            <View style={styles.headingRow}>
              <MaterialCommunityIcons name="shield-star-outline" size={22} color={COLORS.secondary} />
              <Text style={styles.cardHeading}>{t('officialRecognition')}</Text>
            </View>
            <Text style={styles.cardText}>{t('officialRecognitionBody')}</Text>
          </GlassCard>
        </Animated.View>

        <View style={styles.teamSectionHeader}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
          <Text style={styles.teamSectionTitle}>{t('meetOurTeam')}</Text>
        </View>
        <Text style={styles.teamSectionSub}>{t('meetOurTeamSub')}</Text>

        <View style={styles.teamContainer}>
          {TEAM.map((member, idx) => (
            <Animated.View
              key={member.name}
              entering={hydrated ? FadeInDown.duration(500).delay(440 + idx * 120) : undefined}
              style={styles.teamMemberWrapper}
            >
              <GlassCard style={styles.teamMemberCard}>
                <View style={styles.teamPhotoRing}>
                  <Image source={member.photo} style={styles.teamPhoto} contentFit="cover" />
                </View>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamTitle}>{local[member.titleKey as keyof typeof local]}</Text>
                <Text style={styles.teamBio}>{local[member.bioKey as keyof typeof local]}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.footerText}>{t('footerCopyright')}</Text>
      </ScrollView>
    </DepartmentScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, alignItems: 'center', paddingBottom: 44 },
  logoFrame: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    borderWidth: 1.5, borderColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 20, ...SHADOWS.soft,
  },
  innerLogoRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.white, justifyContent: 'center',
    alignItems: 'center', ...SHADOWS.soft,
  },
  logoImage: { width: 56, height: 56 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary, marginTop: 18, letterSpacing: 1.5 },
  version: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 2 },
  infoWrapper: { width: '100%', marginVertical: 24, gap: 16 },
  card: { padding: 18 },
  supportCard: { borderColor: 'rgba(16, 185, 129, 0.2)' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardHeading: { fontSize: 16, fontWeight: '800', color: COLORS.primary, flex: 1 },
  cardText: { fontSize: 13.5, color: COLORS.textMuted, lineHeight: 20, fontWeight: '500', marginBottom: 6 },
  teamSectionHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  teamSectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  teamSectionSub: { width: '100%', fontSize: 12.5, color: COLORS.textMuted, fontWeight: '500', lineHeight: 18, marginBottom: 20 },
  teamContainer: { width: '100%', gap: 16, marginBottom: 24 },
  teamMemberWrapper: { width: '100%' },
  teamMemberCard: { padding: 18, alignItems: 'center' },
  teamPhotoRing: {
    width: 100, height: 100, borderRadius: 50, padding: 3,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1.5, borderColor: 'rgba(37, 99, 235, 0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  teamPhoto: { width: '100%', height: '100%', borderRadius: 48 },
  teamName: { fontSize: 16, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  teamTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accent, textAlign: 'center', marginBottom: 12 },
  teamBio: { fontSize: 12.5, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19, fontWeight: '500' },
  footerText: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, fontWeight: '600' },
});
