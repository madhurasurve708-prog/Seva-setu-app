export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export interface CitizenProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  mobile: string;
  ward: string;
  locality: string;
  profileImage?: string;
  // Aliases for backwards compatibility
  name: string;
  phone: string;
  avatar?: string;
}

export interface CitizenComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  ward: string;
  locality: string;
  status: ComplaintStatus;
  submittedAt: string;
  resolvedAt?: string;
  assignedDepartment?: string;
  images?: string[];
  photoUri?: string; // added to match the image picker field
}

export interface CitizenPreferences {
  theme: 'light' | 'dark' | 'system';
  complaintUpdates: boolean;
  announcements: boolean;
  smsAlerts: boolean;
}

