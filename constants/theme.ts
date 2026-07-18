import { Platform } from 'react-native';

type ShadowStyle =
  | {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation?: never;
    }
  | {
      elevation: number;
      shadowColor?: never;
      shadowOffset?: never;
      shadowOpacity?: never;
      shadowRadius?: never;
    };

export const COLORS = {
  primary: '#0B4F8A',
  primaryLight: '#2E86DE',
  secondary: '#2E86DE',
  accent: '#4FC3F7',
  warning: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textSecondary: '#475569',
  textPlaceholder: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  warningAmber: '#F59E0B',
  white: '#FFFFFF',
  overlay: 'rgba(5, 33, 62, 0.56)',
  glassBackground: 'rgba(255, 255, 255, 0.86)',
} as const;

export const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.background,
    tint: COLORS.primaryLight,
    icon: COLORS.textMuted,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.primaryLight,
  },
  dark: {
    text: '#F8FAFC',
    background: '#071A2D',
    tint: COLORS.accent,
    icon: '#A8B3C2',
    tabIconDefault: '#A8B3C2',
    tabIconSelected: COLORS.accent,
  },
} as const;

const shadowIOS = (
  shadowColor: string,
  shadowOpacity: number,
  shadowRadius: number,
  height: number,
): ShadowStyle => ({
  shadowColor,
  shadowOffset: { width: 0, height },
  shadowOpacity,
  shadowRadius,
});

const shadowAndroid = (elevation: number): ShadowStyle => ({
  elevation,
});

export const SHADOWS = {
  soft: Platform.select<ShadowStyle>({
    ios: shadowIOS('#0B4F8A', 0.08, 18, 8),
    android: shadowAndroid(4),
    default: shadowIOS('#0B4F8A', 0.08, 18, 8),
  }) as ShadowStyle,
  sm: Platform.select<ShadowStyle>({
    ios: shadowIOS('#0B4F8A', 0.06, 10, 4),
    android: shadowAndroid(2),
    default: shadowIOS('#0B4F8A', 0.06, 10, 4),
  }) as ShadowStyle,
  md: Platform.select<ShadowStyle>({
    ios: shadowIOS('#0B4F8A', 0.1, 20, 10),
    android: shadowAndroid(6),
    default: shadowIOS('#0B4F8A', 0.1, 20, 10),
  }) as ShadowStyle,
  medium: Platform.select<ShadowStyle>({
    ios: shadowIOS('#0B4F8A', 0.13, 28, 14),
    android: shadowAndroid(8),
    default: shadowIOS('#0B4F8A', 0.13, 28, 14),
  }) as ShadowStyle,
  card: Platform.select<ShadowStyle>({
    ios: shadowIOS('#0B4F8A', 0.07, 14, 6),
    android: shadowAndroid(3),
    default: shadowIOS('#0B4F8A', 0.07, 14, 6),
  }) as ShadowStyle,
  lg: Platform.select<ShadowStyle>({
    ios: shadowIOS('#0B4F8A', 0.16, 32, 18),
    android: shadowAndroid(12),
    default: shadowIOS('#0B4F8A', 0.16, 32, 18),
  }) as ShadowStyle,
  xl: Platform.select<ShadowStyle>({
    ios: shadowIOS('#05213E', 0.2, 36, 22),
    android: shadowAndroid(16),
    default: shadowIOS('#05213E', 0.2, 36, 22),
  }) as ShadowStyle,
  hero: Platform.select<ShadowStyle>({
    ios: shadowIOS('#05213E', 0.22, 30, 16),
    android: shadowAndroid(10),
    default: shadowIOS('#05213E', 0.22, 30, 16),
  }) as ShadowStyle,
  button: Platform.select<ShadowStyle>({
    ios: shadowIOS('#2E86DE', 0.24, 18, 10),
    android: shadowAndroid(5),
    default: shadowIOS('#2E86DE', 0.24, 18, 10),
  }) as ShadowStyle,
} as const;

export const TYPOGRAPHY = {
  h1: { fontSize: 30, fontWeight: '900' as const, lineHeight: 38, color: COLORS.text },
  h2: { fontSize: 23, fontWeight: '800' as const, lineHeight: 30, color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '800' as const, lineHeight: 24, color: COLORS.text },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, color: COLORS.text },
  bodyBold: { fontSize: 15, fontWeight: '700' as const, lineHeight: 22, color: COLORS.text },
  caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 19, color: COLORS.textMuted },
  captionBold: { fontSize: 13, fontWeight: '700' as const, lineHeight: 19, color: COLORS.text },
  button: { fontSize: 15, fontWeight: '800' as const, lineHeight: 20, color: COLORS.white },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 18, color: COLORS.text },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const GRADIENTS = {
  primary: ['#0B4F8A', '#1A6BB5'],
  secondary: ['#2E86DE', '#1A6BB5'],
  accent: ['#4FC3F7', '#29B6F6'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  premium: ['#0B4F8A', '#2E86DE'],
  glass: ['rgba(255,255,255,0.96)', 'rgba(255,255,255,0.82)'],
} as const;
