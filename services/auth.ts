import type { OfficialProfile } from '@/providers/official-provider';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class AuthenticationError extends Error {}

const DEMO_ADMIN_ID = 'mamta waradkar';
const DEMO_ADMIN_PASSWORD = '123456';

export function loginDemoAdministrator(identifier: string, password: string): OfficialProfile {
  if (identifier.trim().toLowerCase() !== DEMO_ADMIN_ID || password !== DEMO_ADMIN_PASSWORD) {
    throw new AuthenticationError('Invalid Admin ID or password.');
  }

  const displayName = 'Mamta Waradkar';
  return {
    name: displayName,
    phone: '',
    email: '',
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
    throw new AuthenticationError('The municipal server address is not configured. Set EXPO_PUBLIC_API_URL and try again.');
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
    throw new AuthenticationError('The server returned an incomplete administrator profile.');
  }

  return {
    name: user.name,
    phone: user.phone ?? user.mobileNumber ?? '',
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
