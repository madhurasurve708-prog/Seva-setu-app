/**
 * Centralized color tokens for the Seva Setu design system.
 * NOTE: constants/theme.ts still holds Expo's default template values
 * and has not been touched. Once the full Seva Setu theme is finalized,
 * migrate these tokens into theme.ts and update consumers accordingly.
 */
export const Colors = {
  primary: '#2563EB',
  secondary: '#16A34A',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  priority: {
    emergency: '#DC2626',
    high: '#F97316',
    medium: '#2563EB',
    low: '#16A34A',
  },
  status: {
    pending: '#F59E0B',
    inProgress: '#2563EB',
    resolved: '#16A34A',
  },
} as const;