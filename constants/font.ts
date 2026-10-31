export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 32,
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
} as const;

export type FontSize = typeof FONT_SIZES;
export type FontWeight = typeof FONT_WEIGHTS;
