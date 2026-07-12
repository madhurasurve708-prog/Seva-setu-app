export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export type CitizenProfile = {
  name: string;
  phone: string;
  ward: string;
  locality: string;
  address: string;
  photoUri?: string;
};

export type CitizenComplaint = {
  id: string;
  category: string;
  title: string;
  description: string;
  ward: string;
  locality: string;
  submittedAt: string;
  status: ComplaintStatus;
  photoUri?: string;
  assignedDepartment?: string;
};

export type CitizenPreferences = {
  theme: 'light' | 'dark' | 'system';
  complaintUpdates: boolean;
  announcements: boolean;
  smsAlerts: boolean;
};
