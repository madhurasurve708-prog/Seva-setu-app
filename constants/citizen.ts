import type { ComplaintStatus } from '@/types/citizen';
import { COLORS } from './theme';

export const CITIZEN_COLORS = {
  navy: COLORS.primaryLight,
  navyDeep: COLORS.primary,
  blue: COLORS.accent,
  saffron: COLORS.warning,
  bg: COLORS.background,
  card: COLORS.card,
  text: COLORS.text,
  muted: COLORS.textMuted,
  border: COLORS.border,
  success: COLORS.success,
  danger: COLORS.danger,
  white: COLORS.white,
} as const;

export const WARDS = Array.from({ length: 10 }, (_, index) => `Ward ${index + 1}`);

export const LOCALITIES: Record<string, string[]> = {
  'Ward 1': ['Malvan Bazaar', 'Rock Garden'], 'Ward 2': ['Dandi Beach', 'Chivla Beach'],
  'Ward 3': ['Medha', 'Bharad'], 'Ward 4': ['Kumbharmath', 'Sarayekot'],
  'Ward 5': ['Wayari', 'Tarkarli'], 'Ward 6': ['Kumbharjuve', 'Achara Road'],
  'Ward 7': ['Devbag', 'Kolamb'], 'Ward 8': ['Kaleshwar', 'Pirawadi'],
  'Ward 9': ['Anganewadi', 'Dhuriwada'], 'Ward 10': ['Rameshwar', 'Sarjekot'],
};

export const CATEGORIES = [
  { label: 'Water Supply', icon: 'water-outline' }, { label: 'Garbage', icon: 'delete-outline' },
  { label: 'Street Light', icon: 'lightbulb-outline' }, { label: 'Road Damage', icon: 'road-variant' },
  { label: 'Drainage', icon: 'pipe' }, { label: 'Public Toilet', icon: 'toilet' },
  { label: 'Animal Issues', icon: 'paw-outline' }, { label: 'Traffic', icon: 'traffic-light-outline' },
  { label: 'Other', icon: 'map-marker-outline' },
] as const;

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  Pending: COLORS.warning,
  'In Progress': COLORS.accent,
  Resolved: COLORS.success,
  Rejected: COLORS.danger,
};

export const ANNOUNCEMENTS = [
  { id: '1', title: 'Monsoon drainage cleaning drive', date: '12 July 2026', priority: 'Pinned', body: 'Ward-wise drain cleaning is in progress this week. Please keep access clear.' },
  { id: '2', title: 'Water supply maintenance notice', date: '10 July 2026', body: 'Scheduled maintenance may affect supply between 10 AM and 1 PM.' },
  { id: '3', title: 'Citizen grievance camp', date: '08 July 2026', body: 'Meet municipal officers at the council hall this Saturday.' },
];
