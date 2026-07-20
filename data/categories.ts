import { complaints, type CategoryId } from './complaints';

export interface CategoryItem {
  id: CategoryId | 'all';
  label: string;
  icon: string; // MaterialCommunityIcons glyph name
}

export const categories: CategoryItem[] = [
  { id: 'all', label: 'All', icon: 'view-grid' },
  { id: 'water', label: 'Water', icon: 'water' },
  { id: 'garbage', label: 'Garbage', icon: 'delete' },
  { id: 'streetlights', label: 'Street Lights', icon: 'lightbulb-on' },
  { id: 'road', label: 'Road', icon: 'road-variant' },
  { id: 'gutter', label: 'Gutter', icon: 'waves' },
  { id: 'animals', label: 'Animals', icon: 'paw' },
  { id: 'traffic', label: 'Traffic', icon: 'traffic-light' },
  { id: 'drainage', label: 'Drainage', icon: 'water-pump' },
  { id: 'tree', label: 'Tree', icon: 'tree' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal-circle' },
];

export function getCategoryCount(categoryId: CategoryItem['id']): number {
  if (categoryId === 'all') return complaints.length;
  return complaints.filter((c) => c.category === categoryId).length;
}