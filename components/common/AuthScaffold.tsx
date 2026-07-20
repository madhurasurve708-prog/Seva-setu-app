// components/common/AuthScaffold.tsx
import React, { type ReactNode } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, SHADOWS, TYPOGRAPHY, RADIUS } from '../../constants/theme';

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

export function AuthHero({
  title,
  subtitle,
  showLogo = true,
  icon,
  onBack,
  compact = false,
  badge,
}: AuthHeroProps) {
  return (
    <View style={[styles.hero, compact && styles.heroCompact]}>
      <ImageBackground
        source={require('../../assets/images/shivaji.png')}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
        resizeMode="contain"
      >
        <LinearGradient
          colors={[
            'rgba(8, 27, 43, 0.85)',
            'rgba(11, 79, 138, 0.70)',
            'rgba(8, 27, 43, 0.95)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroSubjectGuard} />
        <View style={styles.heroTopRow}>
          {onBack ? (
            <Pressable
              android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
              onPress={onBack}
              style={styles.backButton}
              hitSlop={12}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>

        <Animated.View entering={FadeIn.duration(500)} style={styles.heroContent}>
          <Animated.View entering={FadeInUp.duration(650).delay(80)} style={styles.logoWrap}>
            {showLogo ? (
              <Image source={require('../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
            ) : (
              <MaterialCommunityIcons name={icon ?? 'shield-check'} size={30} color={COLORS.primary} />
            )}
          </Animated.View>
          <Animated.Text entering={FadeInDown.duration(650).delay(120)} style={styles.heroTitle}>
            {title}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(650).delay(180)} style={styles.heroSubtitle}>
            {subtitle}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(650).delay(210)} style={styles.heroSlogan}>
            &quot;आपला मालवण, आपली जबाबदारी&quot;
          </Animated.Text>
          {badge ? (
            <Animated.View entering={FadeInDown.duration(650).delay(230)} style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{badge}</Text>
            </Animated.View>
          ) : null}
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

export function AuthSheet({ children, style, contentStyle }: AuthSheetProps) {
  return (
    <Animated.View entering={FadeInDown.duration(650).delay(180)} style={[styles.sheet, style]}>
      <View style={styles.sheetHandle} />
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </Animated.View>
  );
}

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

  const onPressIn = () => {
    scale.value = withSpring(0.975, { damping: 16, stiffness: 320 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 16, stiffness: 320 });
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(480).delay(delay)}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
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

export const authStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  screenHint: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
    marginBottom: 20,
    color: COLORS.textMuted,
  },
  formContainer: {
    marginTop: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    ...TYPOGRAPHY.caption,
    marginLeft: 6,
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: -8,
    marginBottom: 12,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  hero: {
    height: 370,
    minHeight: 350,
    backgroundColor: '#081B2B',
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.hero,
  },
  heroCompact: {
    height: 320,
    minHeight: 300,
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  heroImageStyle: {
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    opacity: 0.28,
    alignSelf: 'center',
  },
  heroSubjectGuard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 24, 45, 0.08)',
  },
  heroTopRow: {
    minHeight: 58,
    paddingTop: Platform.OS === 'android' ? 34 : 48,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 42,
    height: 42,
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...SHADOWS.medium,
  },
  logo: {
    width: 46,
    height: 46,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSlogan: {
    color: '#4FC3F7',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.6,
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
  sheet: {
    flex: 1,
    marginTop: -26,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D8E2EC',
    marginBottom: 18,
  },
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
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
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