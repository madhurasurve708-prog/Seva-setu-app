import {
    DEPT_AROGYA,
    DEPT_BANDHKAM,
    DEPT_PANI,
    DEPT_SWACHHATA,
    DEPT_UDYANE,
    DEPT_VIDYUT,
} from '@/data/complaints';
import type { OfficialProfile } from '@/providers/official-provider';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class AuthenticationError extends Error {}

// ─── Nagaradhyaksha (Admin) ──────────────────────────────────────────────────
const DEMO_ADMIN_ID = 'mamta waradkar';
const DEMO_ADMIN_PASSWORD = '123456';

export function loginDemoAdministrator(identifier: string, password: string): OfficialProfile {
  if (identifier.trim().toLowerCase() !== DEMO_ADMIN_ID || password !== DEMO_ADMIN_PASSWORD) {
    throw new AuthenticationError('Invalid Admin ID or password.');
  }
  const displayName = 'Mamta Waradkar';
  return {
    name: displayName,
    phone: '9420100001',
    email: 'mamta.waradkar@malvan.gov.in',
    username: 'mamta.waradkar',
    employeeId: 'DEMO-ADMIN',
    designation: 'Nagaradhyaksha',
    ward: 'All Wards',
    locality: 'Malvan Municipal Council',
    department: 'Administration',
    role: 'nagaradhyaksha',
    roleLabel: 'Nagaradhyaksha',
    avatarInitial: displayName.charAt(0).toUpperCase(),
    language: 'English',
  };
}

export async function loginAdministrator(identifier: string, password: string): Promise<OfficialProfile> {
  if (!API_URL) {
    throw new AuthenticationError('Municipal server not configured. Set EXPO_PUBLIC_API_URL.');
  }
  const response = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AuthenticationError(payload.message ?? 'Unable to sign in. Please verify your credentials.');
  }
  const user = payload.user ?? payload.profile ?? payload;
  if (!user?.name || !user?.employeeId) {
    throw new AuthenticationError('Server returned an incomplete administrator profile.');
  }
  return {
    name: user.name,
    phone: user.phone ?? '',
    email: user.email ?? '',
    username: user.username ?? identifier,
    employeeId: user.employeeId,
    designation: user.designation ?? 'Nagaradhyaksha',
    ward: user.wardAccess ?? 'All Wards',
    locality: user.municipality ?? '',
    department: user.department ?? 'Administration',
    role: 'nagaradhyaksha',
    roleLabel: user.roleLabel ?? 'Nagaradhyaksha',
    avatarUri: user.avatarUri,
    avatarInitial: user.name.charAt(0).toUpperCase(),
    language: user.language ?? 'English',
  };
}

// ─── Department Officers — Demo Credentials ──────────────────────────────────
export interface DeptDemoCredential {
  deptName: string;
  username: string;
  password: string;
  officerName: string;
  phone: string;
  email: string;
  designation: string;
  employeeId: string;
}

export const DEPT_DEMO_CREDENTIALS: DeptDemoCredential[] = [
  {
    deptName: DEPT_BANDHKAM,
    username: 'bandhkaam',
    password: 'dept@123',
    officerName: 'Ramesh Sawant',
    phone: '9420100101',
    email: 'ramesh.sawant@malvan.gov.in',
    designation: 'Junior Engineer',
    employeeId: 'MMC-2026-D01',
  },
  {
    deptName: DEPT_PANI,
    username: 'water',
    password: 'dept@123',
    officerName: 'Ajay More',
    phone: '9420100102',
    email: 'ajay.more@malvan.gov.in',
    designation: 'Water Works Engineer',
    employeeId: 'MMC-2026-D02',
  },
  {
    deptName: DEPT_SWACHHATA,
    username: 'garbage',
    password: 'dept@123',
    officerName: 'Sneha Jadhav',
    phone: '9420100103',
    email: 'sneha.jadhav@malvan.gov.in',
    designation: 'Sanitation Inspector',
    employeeId: 'MMC-2026-D03',
  },
  {
    deptName: DEPT_VIDYUT,
    username: 'electric',
    password: 'dept@123',
    officerName: 'Vijaya Patil',
    phone: '9420100104',
    email: 'vijaya.patil@malvan.gov.in',
    designation: 'Electrical Supervisor',
    employeeId: 'MMC-2026-D04',
  },
  {
    deptName: DEPT_UDYANE,
    username: 'environment',
    password: 'dept@123',
    officerName: 'Pooja Naik',
    phone: '9420100105',
    email: 'pooja.naik@malvan.gov.in',
    designation: 'Garden Superintendent',
    employeeId: 'MMC-2026-D05',
  },
  {
    deptName: DEPT_AROGYA,
    username: 'health',
    password: 'dept@123',
    officerName: 'Dr. Vilas Palan',
    phone: '9420100106',
    email: 'vilas.palan@malvan.gov.in',
    designation: 'Health Officer',
    employeeId: 'MMC-2026-D06',
  },
];

export function loginDemoDepartmentOfficer(
  deptName: string,
  username: string,
  password: string,
): OfficialProfile {
  const cred = DEPT_DEMO_CREDENTIALS.find(
    (c) => c.deptName === deptName,
  );
  if (!cred) {
    throw new AuthenticationError('Department not found.');
  }
  if (username.trim().toLowerCase() !== cred.username || password !== cred.password) {
    throw new AuthenticationError('Invalid username or password.');
  }
  return {
    name: cred.officerName,
    phone: cred.phone,
    email: cred.email,
    username: cred.username,
    employeeId: cred.employeeId,
    designation: cred.designation,
    ward: 'All Wards',
    locality: 'Malvan Municipal Council',
    department: cred.deptName,
    role: 'department-officer',
    roleLabel: 'Department Officer',
    avatarInitial: cred.officerName.charAt(0).toUpperCase(),
    language: 'English',
  };
}
