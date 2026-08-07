// app/(auth)/role-selection.tsx
// Role / Login selection screen.
// Visual reference: 2-column card grid below a welcome card,
// inside a white rounded sheet overlapping the dark hero section.
import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

// ── Dimensions ────────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const SIDE_PAD  = 20;   // horizontal padding on each side of the sheet
const COL_GAP   = 12;   // gap between the two columns
const CARD_W    = (width - SIDE_PAD * 2 - COL_GAP) / 2;

// ── Types ─────────────────────────────────────────────────────────────────────
type RoleOption = {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  iconBg: string;
  iconColor: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DesktopRoleLanding({ roles, onSelect, heroHeight }: { roles: RoleOption[]; onSelect: (route: string) => void; heroHeight: number }) {
  return (
    <View style={desktop.root}>
      <View style={[desktop.hero, { height: heroHeight }]}>
        <ImageBackground source={require('@/assets/images/hero_banner.webp')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center">
          <LinearGradient colors={['rgba(4,29,54,0.82)', 'rgba(10,75,140,0.74)', 'rgba(4,29,54,0.90)']} locations={[0, .52, 1]} style={StyleSheet.absoluteFill} />
        </ImageBackground>
        <View style={desktop.heroNav}><Text style={desktop.heroNavText}>MALVAN MUNICIPAL COUNCIL</Text><LanguageToggle size={40} variant="dark" /></View>
        <View style={desktop.heroContent}>
          <View style={desktop.logoRing}><Image source={require('@/assets/images/logo.webp')} style={desktop.logo} contentFit="contain" /></View>
          <Text style={desktop.title}>Seva Setu</Text>
          <Text style={desktop.subtitle}>Malvan Municipal Council</Text>
          <Text style={desktop.tagline}>Digital civic services for every citizen</Text>
        </View>
      </View>

      <View style={desktop.page}>
        <View style={desktop.panel}>
          <View style={desktop.welcome}><Text style={desktop.welcomeTitle}>Welcome to Malvan</Text><Text style={desktop.welcomeText}>Select your login profile to access municipal services.</Text></View>
          <View style={desktop.grid}>{roles.map((role) => (
            <Pressable key={role.route} onPress={() => onSelect(role.route)} style={({ pressed }) => [desktop.card, pressed && desktop.cardPressed]}>
              <View style={[desktop.icon, { backgroundColor: role.iconBg }]}><MaterialCommunityIcons name={role.icon} size={27} color={role.iconColor} /></View>
              <View style={desktop.cardCopy}><Text style={desktop.cardTitle}>{role.title}</Text><Text style={desktop.cardText}>{role.description}</Text></View>
              <View style={[desktop.arrow, { borderColor: `${role.iconColor}45` }]}><MaterialCommunityIcons name="arrow-right" size={18} color={role.iconColor} /></View>
            </Pressable>
          ))}</View>
        </View>
      </View>
    </View>
  );
}

// ── RoleCard — single vertical card matching the reference image ──────────────
function RoleCard({
  role,
  index,
  onPress,
  width,
  isDesktop,
}: {
  role: RoleOption;
  index: number;
  onPress: () => void;
  width: number;
  isDesktop: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(460).delay(180 + index * 75)}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 360 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 360 });
      }}
      android_ripple={{ color: 'rgba(15,23,42,0.06)', borderless: false }}
      style={[styles.card, { width }, isDesktop && styles.cardDesktop, animStyle]}
    >
      {/* ── Icon box ── */}
      <View style={[styles.iconWrap, { backgroundColor: role.iconBg }]}>
        <MaterialCommunityIcons name={role.icon} size={22} color={role.iconColor} />
      </View>

      {/* ── Title ── */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {role.title}
      </Text>

      {/* ── Description — flex:1 pushes arrow row to bottom ── */}
      <Text style={styles.cardDesc} numberOfLines={3}>
        {role.description}
      </Text>

      {/* ── Arrow circle — bottom-right ── */}
      <View style={styles.arrowRow}>
        <View style={[styles.arrowCircle, { borderColor: `${role.iconColor}40` }]}>
          <MaterialCommunityIcons name="arrow-right" size={14} color={role.iconColor} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const cardWidth = isDesktop ? 460 : CARD_W;

  const roles: RoleOption[] = [
    {
      title: t('roleCitizen'),
      description: t('roleCitizenDesc'),
      icon: 'account-group-outline',
      route: '/citizen-login',
      iconBg: 'rgba(11, 79, 138, 0.10)',
      iconColor: '#0B4F8A',
    },
    {
      title: t('roleNagarsevak'),
      description: t('roleNagarsevakDesc'),
      icon: 'account-tie-outline',
      route: '/nagarsevak-login',
      iconBg: 'rgba(16, 185, 129, 0.10)',
      iconColor: '#10B981',
    },
    {
      title: t('roleDepartment'),
      description: t('roleDepartmentDesc'),
      icon: 'office-building-cog-outline',
      route: '/department-login',
      iconBg: 'rgba(245, 158, 11, 0.10)',
      iconColor: '#F59E0B',
    },
    {
      title: t('roleAdmin'),
      description: t('roleAdminDesc'),
      icon: 'shield-crown-outline',
      route: '/admin-login',
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#EF4444',
    },
  ];

  if (isDesktop) {
    return <DesktopRoleLanding roles={roles} onSelect={(route) => router.push(route as any)} heroHeight={Math.max(300, Math.min(390, Math.round(height * 0.38)))} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Hero: background image + logo + title + subtitle + slogan ── */}
      <AuthHero title="Seva Setu" subtitle="Malvan Municipal Council" />

      {/* ── White rounded sheet overlapping the hero bottom ── */}
      <AuthSheet>
        {/* Welcome card */}
        <Animated.View
          entering={FadeInDown.duration(480).delay(120)}
          style={[styles.welcomeCard, isDesktop && styles.welcomeCardDesktop]}
        >
          <Text style={[styles.welcomeTitle, isDesktop && styles.welcomeTitleDesktop]}>{t('welcomeMalvan')}</Text>
          <Text style={[styles.welcomeSub, isDesktop && styles.welcomeSubDesktop]}>{t('roleSelectHint')}</Text>
        </Animated.View>

        {/* 2×2 card grid — scrollable only when screen is too short */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          contentContainerStyle={[styles.gridWrap, isDesktop && styles.gridWrapDesktop]}
        >
          <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
            {roles.map((role, idx) => (
              <RoleCard
                key={role.route}
                role={role}
                index={idx}
                width={cardWidth}
                isDesktop={isDesktop}
                onPress={() => router.push(role.route as any)}
              />
            ))}
          </View>
        </ScrollView>
      </AuthSheet>
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
  gridWrapDesktop: { alignItems: 'center', paddingBottom: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
  },
  gridDesktop: { width: 932, gap: 12 },

  // ── Individual card ───────────────────────────────────────────────────────
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
  logoRing: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', ...SHADOWS.xl },
  logo: { width: 57, height: 57 }, title: { marginTop: 12, color: COLORS.white, fontSize: 38, lineHeight: 46, fontWeight: '900', letterSpacing: .3 }, subtitle: { color: 'rgba(255,255,255,0.94)', fontSize: 16, fontWeight: '700', marginTop: 2 }, tagline: { color: '#8ED4FF', fontSize: 13, fontWeight: '700', marginTop: 6 },
  page: { flex: 1, marginTop: -42, paddingHorizontal: 28, paddingBottom: 28, alignItems: 'center' },
  panel: { width: '100%', maxWidth: 1120, backgroundColor: COLORS.white, borderRadius: 24, padding: 26, borderWidth: 1, borderColor: '#DCE8F2', ...SHADOWS.xl },
  welcome: { alignItems: 'center', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E8F0F6', marginBottom: 20 }, welcomeTitle: { color: COLORS.primary, fontSize: 22, fontWeight: '900' }, welcomeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card: { width: '48.9%' as any, minHeight: 148, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#DCE8F2', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 15, ...SHADOWS.soft }, cardPressed: { transform: [{ scale: .985 }], backgroundColor: '#F5FAFF', borderColor: '#A9CAE8' },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1 }, cardTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' }, cardText: { color: COLORS.textMuted, fontSize: 12.5, fontWeight: '600', lineHeight: 18, marginTop: 5 }, arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: '#F8FBFE' },
});
