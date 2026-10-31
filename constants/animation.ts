export const ANIMATION_DURATION = {
  instant: 80,
  quick: 120,
  normal: 250,
  slow: 400,
} as const;

export const ANIMATION_EASING = {
  springDamping: 14,
  springStiffness: 150,
} as const;

export type AnimationDuration = typeof ANIMATION_DURATION;
