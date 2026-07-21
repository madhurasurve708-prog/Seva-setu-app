/**
 * CANONICAL CATEGORY → DEPARTMENT ROUTING MAP
 *
 * Every complaint category maps to exactly ONE department.
 * This is the single source of truth used by:
 *   - Citizen complaint submission (auto-assigns department)
 *   - Department Officer portal (filters by their department)
 *   - Nagarsevak escalation (pre-selects the correct target)
 *   - Admin complaint explorer (groups by department)
 *
 * The citizen NEVER selects a department manually.
 */

import {
  DEPT_BANDHKAM,
  DEPT_PANI,
  DEPT_SWACHHATA,
  DEPT_VIDYUT,
  DEPT_UDYANE,
  DEPT_AROGYA,
} from './complaints';
import type { CategoryId } from './complaints';

export const CATEGORY_TO_DEPT: Record<CategoryId, string> = {
  // बांधकाम विभाग — roads, drainage infrastructure, gutters
  road:         DEPT_BANDHKAM,
  drainage:     DEPT_BANDHKAM,
  gutter:       DEPT_BANDHKAM,
  traffic:      DEPT_BANDHKAM,

  // पाणी पुरवठा विभाग — all water supply issues
  water:        DEPT_PANI,

  // स्वच्छता व घनकचरा व्यवस्थापन विभाग — garbage, sanitation
  garbage:      DEPT_SWACHHATA,

  // विद्युत व रस्ते दिवे विभाग — street lights, electrical
  streetlights: DEPT_VIDYUT,

  // उद्याने व पर्यावरण विभाग — trees, parks, environment
  tree:         DEPT_UDYANE,

  // सार्वजनिक आरोग्य विभाग — animals, public health, other civic issues
  animals:      DEPT_AROGYA,
  other:        DEPT_AROGYA,
};

/** Returns the department responsible for a given complaint category. */
export function getDepartmentForCategory(category: CategoryId): string {
  return CATEGORY_TO_DEPT[category];
}

/** Returns all categories handled by a given department. */
export function getCategoriesForDepartment(dept: string): CategoryId[] {
  return (Object.entries(CATEGORY_TO_DEPT) as [CategoryId, string][])
    .filter(([, d]) => d === dept)
    .map(([cat]) => cat);
}

/** Display metadata for each department. */
export const DEPT_META: Record<string, {
  marathi: string;
  english: string;
  icon: string;
  color: string;
  bg: string;
  accentGrad: readonly [string, string];
}> = {
  [DEPT_BANDHKAM]: {
    marathi: 'बांधकाम विभाग',
    english: 'Public Works',
    icon: 'road-variant',
    color: '#7C3AED',
    bg: '#EDE9FE',
    accentGrad: ['#7C3AED', '#9333EA'],
  },
  [DEPT_PANI]: {
    marathi: 'पाणी पुरवठा विभाग',
    english: 'Water Supply',
    icon: 'water-outline',
    color: '#2563EB',
    bg: '#DBEAFE',
    accentGrad: ['#2563EB', '#3B82F6'],
  },
  [DEPT_SWACHHATA]: {
    marathi: 'स्वच्छता व घनकचरा व्यवस्थापन',
    english: 'Solid Waste & Sanitation',
    icon: 'delete-sweep-outline',
    color: '#10B981',
    bg: '#D1FAE5',
    accentGrad: ['#10B981', '#059669'],
  },
  [DEPT_VIDYUT]: {
    marathi: 'विद्युत व रस्ते दिवे विभाग',
    english: 'Electrical & Street Lights',
    icon: 'lightning-bolt-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
    accentGrad: ['#F59E0B', '#D97706'],
  },
  [DEPT_UDYANE]: {
    marathi: 'उद्याने व पर्यावरण विभाग',
    english: 'Parks & Environment',
    icon: 'tree-outline',
    color: '#16A34A',
    bg: '#DCFCE7',
    accentGrad: ['#16A34A', '#15803D'],
  },
  [DEPT_AROGYA]: {
    marathi: 'सार्वजनिक आरोग्य विभाग',
    english: 'Public Health',
    icon: 'medical-bag',
    color: '#DC2626',
    bg: '#FEE2E2',
    accentGrad: ['#DC2626', '#B91C1C'],
  },
};
