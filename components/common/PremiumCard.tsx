import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, RADIUS, GRADIENTS } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PremiumCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'glass' | 'filled' | 'elevated' | 'outline';
  gradient?: keyof typeof GRADIENTS | string[];
  delay?: number;
  disabled?: boolean;
  testID?: string;
};

export const PremiumCard = React.memo(
  ({
    children,
    style,
    onPress,
    variant = 'glass',
    gradient,
    delay = 0,
    disabled = false,
    testID,
  }: PremiumCardProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
      if (!disabled && onPress) {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }
    };

    const onPressOut = () => {
      scale.value = withSpring(1, { damping: 16, stiffness: 320 });
    };

    const variantStyle = useMemo(() => {
      switch (variant) {
        case 'glass':
          return styles.glassVariant;
        case 'filled':
          return styles.filledVariant;
        case 'elevated':
          return styles.elevatedVariant;
        case 'outline':
          return styles.outlineVariant;
        default:
          return styles.glassVariant;
      }
    }, [variant]);

    const gradientColors = useMemo(() => {
      if (!gradient) return GRADIENTS.glass;
      if (typeof gradient === 'string' && gradient in GRADIENTS) {
        return GRADIENTS[gradient as keyof typeof GRADIENTS];
      }
      if (Array.isArray(gradient)) return gradient;
      return GRADIENTS.glass;
    }, [gradient]);

    const CardWrapper = onPress ? AnimatedPressable : Animated.View;

    return (
      <CardWrapper
        entering={FadeInDown.duration(400).delay(delay)}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || !onPress}
        android_ripple={
          onPress && !disabled
            ? { color: 'rgba(11, 79, 138, 0.1)', borderless: false }
            : undefined
        }
        style={[styles.container, variantStyle, animatedStyle, style]}
        testID={testID}
      >
        <LinearGradient colors={gradientColors as any} style={styles.gradient}>
          <View style={styles.glassStroke} />
          {children}
        </LinearGradient>
      </CardWrapper>
    );
  }
);

PremiumCard.displayName = 'PremiumCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  gradient: {
    flex: 1,
  },
  glassVariant: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  filledVariant: {
    backgroundColor: COLORS.surface,
  },
  elevatedVariant: {
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  outlineVariant: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  glassStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});