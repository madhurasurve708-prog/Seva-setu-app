// app/(auth)/role-selection.tsx
// Role / Login selection screen.
// Visual reference: 2-column card grid below a welcome card,
// inside a white rounded sheet overlapping the dark hero section.
import { useTranslation } from '@/providers/localization-provider';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

// ── Dimensions ────────────────────────────────────────────────────────────────
const SIDE_PAD = 20; // horizontal padding on each side of the sheet
const COL_GAP = 12; // gap between the two columns

const HERO_IMAGE = require('@/assets/images/hero_banner.webp');
const LOGO_IMAGE = require('@/assets/images/logo.webp');

const HERO_IMAGE_PROPS = Platform.OS === 'web' ? ({ fetchpriority: 'high' } as any) : {};

const ROLE_ICONS = {
  citizen: '👥',
  nagarsevak: '🧑‍💼',
  department: '🏢',
  admin: '🛡️',
} as const;

type RoleOption = {
  title: string;
  description: string;
  iconKey: keyof typeof ROLE_ICONS;
  route: string;
  iconBg: string;
  iconColor: string;
};

const DesktopRoleLanding = memo(function DesktopRoleLanding({ roles, onSelect, heroHeight }: { roles: RoleOption[]; onSelect: (route: string) => void; heroHeight: number }) {
  return (
    <View style={desktop.root}>
      <View style={[desktop.hero, { height: heroHeight }]}> 
        <Image
          source={HERO_IMAGE}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          priority="high"
          responsivePolicy="static"
          accessibilityLabel="Malvan Municipal Council hero banner"
          alt="Hero banner for Seva Setu landing page"
          {...HERO_IMAGE_PROPS}
        />
        <View style={desktop.heroOverlay} />
        <View style={desktop.heroNav}>
          <Text style={desktop.heroNavText}>MALVAN MUNICIPAL COUNCIL</Text>
          <View style={desktop.langToggle}>
            <Text style={desktop.langToggleText}>EN • मराठी</Text>
          </View>
        </View>

        <View style={desktop.heroContent}>
          <View style={desktop.logoRing}>
            <Image source={LOGO_IMAGE} style={desktop.logo} contentFit="contain" accessibilityLabel="Seva Setu logo" alt="Seva Setu logo" priority="high" />
          </View>
          <Text style={desktop.title}>Seva Setu</Text>
          <Text style={desktop.subtitle}>Malvan Municipal Council</Text>
          <Text style={desktop.tagline}>Digital civic services for every citizen</Text>
        </View>
      </View>

      <View style={desktop.page}>
        <View style={desktop.panel}>
          <View style={desktop.welcome}>
            <Text style={desktop.welcomeTitle}>Welcome to Malvan</Text>
            <Text style={desktop.welcomeText}>Select your login profile to access municipal services.</Text>
          </View>
          <View style={desktop.grid}>
            {roles.map((role) => (
              <Pressable key={role.route} onPress={() => onSelect(role.route)} style={({ pressed }) => [desktop.card, pressed && desktop.cardPressed]}>
                <View style={[desktop.icon, { backgroundColor: role.iconBg }]}> 
                  <Text style={[desktop.iconEmoji, { color: role.iconColor }]}>{ROLE_ICONS[role.iconKey]}</Text>
                </View>
                <View style={desktop.cardCopy}>
                  <Text style={desktop.cardTitle}>{role.title}</Text>
                  <Text style={desktop.cardText}>{role.description}</Text>
                </View>
                <View style={[desktop.arrow, { borderColor: `${role.iconColor}45` }]}>
                  <Text style={[desktop.arrowText, { color: role.iconColor }]}>→</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
});

const RoleCard = memo(function RoleCard({
  role,
  onSelect,
  width,
  isDesktop,
}: {
  role: RoleOption;
  onSelect: (route: string) => void;
  width: number;
  isDesktop: boolean;
}) {
  return (
    <Pressable
      onPress={() => onSelect(role.route)}
      android_ripple={{ color: 'rgba(15,23,42,0.06)', borderless: false }}
      style={({ pressed }) => [styles.card, { width }, isDesktop && styles.cardDesktop, pressed && styles.cardPressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: role.iconBg }]}> 
        <Text style={[styles.iconEmoji, { color: role.iconColor }]}>{ROLE_ICONS[role.iconKey]}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {role.title}
      </Text>

      <Text style={styles.cardDesc} numberOfLines={3}>
        {role.description}
      </Text>

      <View style={styles.arrowRow}>
        <View style={[styles.arrowCircle, { borderColor: `${role.iconColor}40` }]}>
          <Text style={[styles.arrowSymbol, { color: role.iconColor }]}>→</Text>
        </View>
      </View>
    </Pressable>
  );
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  // Compute this from the live viewport. The previous module-level value and
  // desktop grid styles made compact screens inherit a 932px-wide grid.
  const cardWidth = isDesktop ? 460 : Math.max(0, Math.floor((width - SIDE_PAD * 2 - COL_GAP) / 2));

  const roles = useMemo<RoleOption[]>(
    () => [
      {
        title: t('roleCitizen'),
        description: t('roleCitizenDesc'),
        iconKey: 'citizen',
        route: '/citizen-login',
        iconBg: 'rgba(11, 79, 138, 0.10)',
        iconColor: '#0B4F8A',
      },
      {
        title: t('roleNagarsevak'),
        description: t('roleNagarsevakDesc'),
        iconKey: 'nagarsevak',
        route: '/nagarsevak-login',
        iconBg: 'rgba(16, 185, 129, 0.10)',
        iconColor: '#10B981',
      },
      {
        title: t('roleDepartment'),
        description: t('roleDepartmentDesc'),
        iconKey: 'department',
        route: '/department-login',
        iconBg: 'rgba(245, 158, 11, 0.10)',
        iconColor: '#F59E0B',
      },
      {
        title: t('roleAdmin'),
        description: t('roleAdminDesc'),
        iconKey: 'admin',
        route: '/admin-login',
        iconBg: 'rgba(239, 68, 68, 0.10)',
        iconColor: '#EF4444',
      },
    ],
    [t],
  );

  const navigateTo = useCallback(
    (route: string) => router.push(route as any),
    [router],
  );

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Role Selection | Seva Setu';
    }
  }, []);

  if (isDesktop) {
    return <DesktopRoleLanding roles={roles} onSelect={navigateTo} heroHeight={Math.max(300, Math.min(390, Math.round(height * 0.38)))} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.hero}>
        <Image
          source={HERO_IMAGE}
          style={styles.heroImage}
          contentFit="cover"
          priority="high"
          cachePolicy="memory-disk"
          responsivePolicy="static"
          accessibilityLabel="Malvan Municipal Council hero banner"
          alt="Hero banner for Seva Setu landing page"
          {...HERO_IMAGE_PROPS}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroInner}>
          <Image source={LOGO_IMAGE} style={styles.heroLogo} contentFit="contain" accessibilityLabel="Seva Setu logo" alt="Seva Setu logo" priority="high" cachePolicy="memory-disk" />
          <Text style={styles.heroTitle}>Seva Setu</Text>
          <Text style={styles.heroSubtitle}>Malvan Municipal Council</Text>
          <Text style={styles.heroTagline}>Digital civic services for every citizen</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>{t('welcomeMalvan')}</Text>
          <Text style={styles.welcomeSub}>{t('roleSelectHint')}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          contentContainerStyle={styles.gridWrap}
          removeClippedSubviews={Platform.OS !== 'web'}
        >
          <View style={styles.grid}>
            {roles.map((role) => (
              <RoleCard
                key={role.route}
                role={role}
                onSelect={navigateTo}
                width={cardWidth}
                isDesktop={isDesktop}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061422', // matches hero dark background
  },

  // ── Welcome card ─────────────────────────────────────────────────────────
  welcomeCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(220,230,240,0.8)',
    ...SHADOWS.soft,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 3,
  },
  welcomeSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  welcomeCardDesktop: { alignItems: 'center', paddingVertical: 16, marginBottom: 14, borderRadius: 18 },
  welcomeTitleDesktop: { fontSize: 21, textAlign: 'center', marginBottom: 5 },
  welcomeSubDesktop: { fontSize: 13.5, textAlign: 'center' },

  // ── Grid wrapper ──────────────────────────────────────────────────────────
  gridWrap: {
    paddingBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
  },
  gridDesktop: { width: 932, gap: 12 },

  // ── Individual card ───────────────────────────────────────────────────────
  hero: {
    height: 320,
    backgroundColor: '#061422',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 29, 54, 0.78)',
  },
  heroInner: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLogo: {
    width: 64,
    height: 64,
    marginBottom: 14,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.25,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
  },
  heroTagline: {
    color: '#8ED4FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -42,
    minHeight: 420,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  card: {
    minHeight: 128,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(220,230,240,0.8)',
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    ...SHADOWS.soft,
  },
  cardDesktop: { minHeight: 148, padding: 18, borderRadius: 18, ...SHADOWS.card },

  // Icon rounded-square
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: 20,
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Bold title — max 2 lines, never clips
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 3,
  },

  // Muted description — flex:1 fills remaining space and pushes arrow down
  cardDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 15,
    flex: 1,
  },

  // Arrow row — aligns circle to the right
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    backgroundColor: 'rgba(15,23,42,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const desktop = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F8FC' },
  hero: { minHeight: 300, overflow: 'hidden', justifyContent: 'center' },
  heroNav: { position: 'absolute', top: 22, left: 0, right: 0, zIndex: 2, width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroNavText: { color: 'rgba(255,255,255,0.84)', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  heroContent: { alignItems: 'center', justifyContent: 'center', paddingTop: 24 },
  langToggle: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)' },
  langToggleText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  logoRing: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', ...SHADOWS.xl },
  logo: { width: 57, height: 57 }, title: { marginTop: 12, color: COLORS.white, fontSize: 38, lineHeight: 46, fontWeight: '900', letterSpacing: .3 }, subtitle: { color: 'rgba(255,255,255,0.94)', fontSize: 16, fontWeight: '700', marginTop: 2 }, tagline: { color: '#8ED4FF', fontSize: 13, fontWeight: '700', marginTop: 6 },
  page: { flex: 1, marginTop: -42, paddingHorizontal: 28, paddingBottom: 28, alignItems: 'center' },
  panel: { width: '100%', maxWidth: 1120, backgroundColor: COLORS.white, borderRadius: 24, padding: 26, borderWidth: 1, borderColor: '#DCE8F2', ...SHADOWS.xl },
  welcome: { alignItems: 'center', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E8F0F6', marginBottom: 20 }, welcomeTitle: { color: COLORS.primary, fontSize: 22, fontWeight: '900' }, welcomeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card: { width: '48.9%' as any, minHeight: 148, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#DCE8F2', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 15, ...SHADOWS.soft }, cardPressed: { transform: [{ scale: .985 }], backgroundColor: '#F5FAFF', borderColor: '#A9CAE8' },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1 }, cardTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' }, cardText: { color: COLORS.textMuted, fontSize: 12.5, fontWeight: '600', lineHeight: 18, marginTop: 5 }, arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: '#F8FBFE' },
  iconEmoji: { fontSize: 20 },
  arrowText: { fontSize: 14, fontWeight: '700' },
});
