export type Priority = 'Emergency' | 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';
export type CategoryId =
  | 'water' | 'garbage' | 'streetlights' | 'road' | 'gutter'
  | 'animals' | 'traffic' | 'drainage' | 'tree' | 'other';

export interface ComplaintNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  priority: Priority;
  status: ComplaintStatus;
  citizenName: string;
  citizenPhone: string;
  ward: string;
  location: string;
  images: string[];
  notes: ComplaintNote[];
  createdAt: string;
  updatedAt: string;
  assignedDepartment?: string;
  assignedOfficer?: string;
  is_deleted?: boolean;
  deleted_by?: string;
  deleted_at?: string;
  delete_reason?: string;
  is_escalated?: boolean;
  escalated_to?: string;
}

// Shaped to match the future FastAPI /complaints response 1:1 —
// swapping this array for a fetch() result should require no component changes.
export const complaints: Complaint[] = [
  {
    id: 'CMP-2025-1289',
    title: 'Water Pipeline Burst',
    description: 'Main water pipeline burst near the junction, water wasting continuously. Immediate action required.',
    category: 'water',
    priority: 'Emergency',
    status: 'Pending',
    citizenName: 'Rohit Naik',
    citizenPhone: '+91 98765 43210',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Devbag, Malvan',
    images: [],
    notes: [],
    createdAt: '2026-07-15T09:15:00.000Z',
    updatedAt: '2026-07-15T09:25:00.000Z',
  },
  {
    id: 'CMP-2025-1288',
    title: 'Garbage Overflow',
    description: 'Garbage bins overflowing near the market for the past 3 days, causing a health hazard.',
    category: 'garbage',
    priority: 'High',
    status: 'Pending',
    citizenName: 'Sunita Patil',
    citizenPhone: '+91 98234 11223',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Malvan Market Area',
    images: [],
    notes: [],
    createdAt: '2026-07-15T08:45:00.000Z',
    updatedAt: '2026-07-15T08:45:00.000Z',
  },
  {
    id: 'CMP-2025-1287',
    title: 'Street Light Not Working',
    description: 'Street light near the bus stop has not been working for over a week.',
    category: 'streetlights',
    priority: 'Low',
    status: 'Resolved',
    citizenName: 'Prakash More',
    citizenPhone: '+91 99876 55210',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Achara Road, Malvan',
    images: [],
    notes: [],
    createdAt: '2026-07-14T10:00:00.000Z',
    updatedAt: '2026-07-15T11:00:00.000Z',
    assignedDepartment: 'Electrical',
    assignedOfficer: 'Vijaya Patil',
  },
  {
    id: 'CMP-2025-1286',
    title: 'Drain Blockage',
    description: 'Drainage line blocked near residential lane, water logging on the road.',
    category: 'drainage',
    priority: 'High',
    status: 'In Progress',
    citizenName: 'Meena Sawant',
    citizenPhone: '+91 97845 22110',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Kumbharmath, Malvan',
    images: [],
    notes: [],
    createdAt: '2026-07-13T07:30:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z',
    assignedDepartment: 'Public Works',
  },
  {
    id: 'CMP-2025-1285',
    title: 'Road Damage',
    description: 'Large pothole formed after recent rains, risky for two-wheelers.',
    category: 'road',
    priority: 'Medium',
    status: 'Pending',
    citizenName: 'Anil Gawde',
    citizenPhone: '+91 96543 78901',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Malvan Bypass Road',
    images: [],
    notes: [],
    createdAt: '2026-07-12T12:00:00.000Z',
    updatedAt: '2026-07-12T12:00:00.000Z',
  },
  {
    id: 'CMP-2025-1284',
    title: 'Stray Dogs Menace',
    description: 'Group of stray dogs near the bazaar chasing pedestrians in the evening.',
    category: 'animals',
    priority: 'Medium',
    status: 'Pending',
    citizenName: 'Sneha Kadam',
    citizenPhone: '+91 95678 12340',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Bazaar Peth, Malvan',
    images: [],
    notes: [],
    createdAt: '2026-07-11T18:20:00.000Z',
    updatedAt: '2026-07-11T18:20:00.000Z',
  },
  {
    id: 'CMP-2025-1283',
    title: 'Traffic Signal Malfunction',
    description: 'Signal stuck on red at the main chowk causing traffic pile-up during peak hours.',
    category: 'traffic',
    priority: 'High',
    status: 'In Progress',
    citizenName: 'Vikas Rane',
    citizenPhone: '+91 94567 89012',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Main Chowk, Malvan',
    images: [],
    notes: [],
    createdAt: '2026-07-10T08:00:00.000Z',
    updatedAt: '2026-07-14T10:30:00.000Z',
    assignedDepartment: 'Traffic Police',
  },
  {
    id: 'CMP-2025-1282',
    title: 'Blocked Gutter Near School',
    description: 'Gutter blocked with debris right outside the primary school gate.',
    category: 'gutter',
    priority: 'Medium',
    status: 'Resolved',
    citizenName: 'Pooja Desai',
    citizenPhone: '+91 93456 70123',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Shivaji Nagar, Malvan',
    images: [],
    notes: [],
    createdAt: '2026-07-09T09:00:00.000Z',
    updatedAt: '2026-07-11T09:00:00.000Z',
  },
  {
    id: 'CMP-2025-1281',
    title: 'Tree Branch Fallen on Road',
    description: 'Large branch fell after last night\u2019s storm, partially blocking the road.',
    category: 'tree',
    priority: 'Emergency',
    status: 'Pending',
    citizenName: 'Ramesh Bhosale',
    citizenPhone: '+91 92345 60912',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Tondavali Road',
    images: [],
    notes: [],
    createdAt: '2026-07-16T06:10:00.000Z',
    updatedAt: '2026-07-16T06:10:00.000Z',
  },
  {
    id: 'CMP-2025-1280',
    title: 'Illegal Dumping Near Beach',
    description: 'Construction waste being dumped illegally near the beach access road.',
    category: 'other',
    priority: 'Low',
    status: 'Pending',
    citizenName: 'Kiran Parab',
    citizenPhone: '+91 91234 50981',
    ward: 'Ward 3 - Malvan Beach',
    location: 'Malvan Beach Road',
    images: [],
    notes: [],
    createdAt: '2026-07-08T15:40:00.000Z',
    updatedAt: '2026-07-08T15:40:00.000Z',
  },
];