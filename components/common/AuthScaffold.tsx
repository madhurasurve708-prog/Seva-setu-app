// components/common/AuthScaffold.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactNode } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import LanguageToggle from './LanguageToggle';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type AuthHeroProps = {
  title: string;
  subtitle: string;
  showLogo?: boolean;
  icon?: IconName;
  onBack?: () => void;
  compact?: boolean;
  badge?: string;
};

type LoginOptionCardProps = {
  title: string;
  subtitle: string;
  icon: IconName;
  accentColor?: string;
  delay?: number;
  onPress: () => void;
};

type AuthSheetProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

// ─────────────────────────────────────────────────────────────────────────────
// AuthHero — dark cinematic hero with background image, logo, title, slogan
// ─────────────────────────────────────────────────────────────────────────────
export function AuthHero({
  title,
  subtitle,
  showLogo = true,
  icon,
  onBack,
  compact = false,
  badge,
}: AuthHeroProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const desktopHeroHeight = compact ? 160 : Math.round(Math.min(200, Math.max(160, height * 0.22)));

  return (
    <View
      style={[
        styles.hero,
        compact && styles.heroCompact,
        isDesktop && styles.heroDesktop,
        isDesktop && compact && styles.heroCompactDesktop,
        isDesktop && { height: desktopHeroHeight, minHeight: desktopHeroHeight },
      ]}
    >
      <ImageBackground
        source={require('../../assets/images/hero_banner.webp')}
        style={[StyleSheet.absoluteFill, { opacity: 0.45 }]}
        contentFit="cover"
      >
        {/* Cinematic dark-blue gradient overlay */}
        <LinearGradient
          colors={[
            'rgba(5, 18, 35, 0.78)',
            'rgba(8, 55, 110, 0.65)',
            'rgba(5, 18, 35, 0.88)',
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Safe-area spacer + optional back button */}
        <View style={[styles.heroTopRow, isDesktop && styles.heroTopRowDesktop, { paddingTop: insets.top + (isDesktop ? 20 : 10) }]}>
          {onBack ? (
            <Pressable
              android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
              onPress={onBack}
              style={styles.backButton}
              hitSlop={12}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.white} />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <View style={{ flex: 1 }} />
          <LanguageToggle size={isDesktop ? 40 : 36} variant="dark" />
        </View>

        {/* Logo · Title · Subtitle · Slogan — all centered */}
        <Animated.View entering={FadeIn.duration(500)} style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
          <Animated.View
            entering={FadeInUp.duration(600).delay(60)}
            style={styles.logoWrap}
          >
            {showLogo ? (
              <Image
                source={require('../../assets/images/logo.webp')}
                style={styles.logo}
                contentFit="contain"
              />
            ) : (
              <MaterialCommunityIcons
                name={icon ?? 'shield-check'}
                size={32}
                color={COLORS.primary}
              />
            )}
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.duration(600).delay(100)}
            style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}
          >
            {title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.duration(600).delay(150)}
            style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}
          >
            {subtitle}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.duration(600).delay(190)}
            style={styles.heroSlogan}
          >
            &quot;आपला मालवण, आपली जबाबदारी&quot;
          </Animated.Text>

          {badge ? (
            <Animated.View
              entering={FadeInDown.duration(600).delay(220)}
              style={styles.heroBadge}
            >
              <Text style={styles.heroBadgeText}>{badge}</Text>
            </Animated.View>
          ) : null}
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthSheet — white rounded panel that overlaps the bottom of the hero
// ─────────────────────────────────────────────────────────────────────────────
export function AuthSheet({ children, style, contentStyle }: AuthSheetProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(160)}
      style={[styles.sheet, isDesktop && styles.sheetDesktop, style]}
    >
      {/* Drag handle */}
      <View style={styles.sheetHandle} />
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LoginOptionCard — horizontal list-style card (used on individual login pages)
// ─────────────────────────────────────────────────────────────────────────────
export function LoginOptionCard({
  title,
  subtitle,
  icon,
  accentColor = COLORS.secondary,
  delay = 0,
  onPress,
}: LoginOptionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(480).delay(delay)}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.975, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      android_ripple={{ color: 'rgba(46, 134, 222, 0.12)' }}
      style={[styles.loginCard, animatedStyle]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.96)', 'rgba(255,255,255,0.82)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glassStroke} />
      <LinearGradient
        colors={[`${accentColor}24`, `${COLORS.accent}12`]}
        style={styles.optionIconWrap}
      >
        <MaterialCommunityIcons name={icon} size={25} color={accentColor} />
      </LinearGradient>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.optionSubtitle} numberOfLines={2}>{subtitle}</Text>
      </View>
      <View style={styles.optionArrow}>
        <MaterialCommunityIcons name="arrow-right" size={19} color={COLORS.primary} />
      </View>
    </AnimatedPressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared auth-screen utility styles (used by individual login screens)
// ─────────────────────────────────────────────────────────────────────────────
export const authStyles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: COLORS.background },
  keyboard:      { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  screenTitle:   { ...TYPOGRAPHY.h2, color: COLORS.primary },
  screenHint:    { ...TYPOGRAPHY.caption, marginTop: 6, marginBottom: 20, color: COLORS.textMuted },
  formContainer: { marginTop: 4 },
  forgotBtn:     { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText:    { fontSize: 13, color: COLORS.secondary, fontWeight: '700' },
  actionBtn:     { marginTop: 4 },
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  securityText:  { ...TYPOGRAPHY.caption, marginLeft: 6, color: COLORS.textMuted },
  errorText:     { fontSize: 12, color: COLORS.danger, marginTop: -8, marginBottom: 12, fontWeight: '600' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Private styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    height: 300,
    minHeight: 260,
    backgroundColor: '#061422',
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.hero,
  },
  heroCompact: {
    height: 260,
    minHeight: 230,
  },
  // Desktop keeps the visual identity without pushing the form below the fold.
  heroDesktop: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 4 },
  heroCompactDesktop: {},

  heroImageStyle: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },

  // Status-bar spacer row — paddingTop set inline from safe-area insets
  heroTopRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTopRowDesktop: { width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 32 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: { width: 36, height: 36 },

  // Logo + text block — centered in remaining space
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  heroContentDesktop: { paddingBottom: 6, paddingTop: 4 },

  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    ...SHADOWS.medium,
  },
  logo: { width: 52, height: 52 },

  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  heroTitleDesktop: {
    fontSize: 28,
    lineHeight: 34,
  },
  heroSubtitle: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitleDesktop: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroSlogan: {
    color: '#4FC3F7',
    fontSize: 13.5,
    fontStyle: 'italic',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.4,
  },
  heroBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(79,195,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.45)',
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // ── White sheet ───────────────────────────────────────────────────────────
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetDesktop: { flex: 0, width: '100%', maxWidth: 640, alignSelf: 'center', marginTop: -40, marginBottom: 24, minHeight: 0, borderRadius: 24, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20, borderWidth: 1, borderColor: 'rgba(226,232,240,0.95)', ...SHADOWS.xl },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#C8D6E0',
    marginBottom: 16,
  },

  // ── LoginOptionCard (horizontal, used on individual portal login pages) ──
  loginCard: {
    minHeight: 86,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    ...SHADOWS.medium,
  },
  glassStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(46, 134, 222, 0.08)',
  },
  optionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: '800',
  },
  optionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  optionArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(11, 79, 138, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
