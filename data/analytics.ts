import { complaints } from './complaints';

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

export function getDashboardStats(): DashboardStats {
  return {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };
}

// Placeholder for the Monthly Analytics screen (a later sprint) —
// present now so getDashboardStats() has a real home instead of living in a component.
export interface MonthlyTrendPoint {
  month: string;
  count: number;
}

export const monthlyTrend: MonthlyTrendPoint[] = [
  { month: 'Mar', count: 20 },
  { month: 'Apr', count: 35 },
  { month: 'May', count: 40 },
  { month: 'Jun', count: 55 },
  { month: 'Jul', count: 80 },
];