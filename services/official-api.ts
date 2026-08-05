import type { Complaint, ComplaintStatus, Priority } from '@/data/complaints';
import type { Announcement, OfficialProfile } from '@/providers/official-provider';
import { apiRequest } from '@/services/api-client';

type LoginResponse = { access_token: string; nagarsevak?: Record<string, unknown>; admin?: Record<string, unknown> };
type ApiComplaint = Record<string, unknown>;

const categoryIds: Record<string, Complaint['category']> = {
  Water: 'water', Garbage: 'garbage', 'Street Lights': 'streetlights', Road: 'road',
  Gutter: 'gutter', Animals: 'animals', Traffic: 'traffic', Drainage: 'drainage', Tree: 'tree', Other: 'other',
};

export function mapComplaint(item: ApiComplaint): Complaint {
  const status = item.status === 'Closed' ? 'Resolved' : item.status;
  return {
    id: String(item.id), title: String(item.title ?? item.category ?? 'Complaint'),
    description: String(item.description ?? ''), category: categoryIds[String(item.category)] ?? 'other',
    priority: (['Emergency', 'High', 'Medium', 'Low'].includes(String(item.priority)) ? item.priority : 'Medium') as Priority,
    status: (['Pending', 'In Progress', 'Resolved'].includes(String(status)) ? status : 'Pending') as ComplaintStatus,
    citizenName: String(item.citizen_name ?? ''), citizenPhone: String(item.citizen_phone_number ?? ''),
    ward: `Ward ${String(item.ward_number ?? '')}${item.ward_name ? ` - ${String(item.ward_name)}` : ''}`.trim(),
    location: String(item.manual_location ?? item.locality ?? ''),
    images: Array.isArray(item.images) ? item.images.map(String) : item.image_url ? [String(item.image_url)] : [],
    notes: [], createdAt: String(item.created_at ?? new Date().toISOString()), updatedAt: String(item.updated_at ?? item.created_at ?? new Date().toISOString()),
    assignedDepartment: typeof item.assigned_department === 'string'
      ? item.assigned_department
      : typeof item.department_name === 'string'
        ? item.department_name
        : undefined,
    is_escalated: Boolean(item.is_escalated),
  };
}

function mapAnnouncement(item: Record<string, unknown>): Announcement {
  return { id: String(item.id), title: String(item.title), body: String(item.description), date: new Date(String(item.created_at)).toLocaleDateString(), priority: item.priority === 'Emergency' || item.priority === 'High' ? item.priority : 'Normal' };
}

export type AnnouncementInput = {
  title: string;
  description: string;
  priority: string;
  target_type: string;
  target_ward_id?: number;
  target_department?: string;
};

export async function getDepartmentAnnouncements(token: string) {
  return (await apiRequest<Record<string, unknown>[]>('/api/department/announcements', {}, token)).map(mapAnnouncement);
}

export async function createMainAdminAnnouncement(input: AnnouncementInput, token: string) {
  return apiRequest<Record<string, unknown>>('/api/main-admin/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }, token);
}

export async function loginNagarsevak(name: string, wardNumber: number, password: string) {
  const response = await apiRequest<LoginResponse>('/api/nagarsevak/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, ward_number: wardNumber, password }) });
  const user = response.nagarsevak ?? {};
  const profile: OfficialProfile = { name: String(user.name ?? name), phone: String(user.phone_number ?? ''), email: '', username: name, employeeId: `NAG-${String(user.id ?? '')}`, designation: 'Nagarsevak (Ward Representative)', ward: `Ward ${String(user.ward_number ?? wardNumber)}`, locality: String(user.ward_name ?? ''), department: '', role: 'nagarsevak', roleLabel: 'Nagarsevak', avatarUri: typeof user.profile_photo_url === 'string' ? user.profile_photo_url : undefined, avatarInitial: String(user.name ?? name).charAt(0).toUpperCase(), language: 'English' };
  return { token: response.access_token, profile };
}

export async function loginMainAdmin(name: string, password: string) {
  const response = await apiRequest<LoginResponse>('/api/main-admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, password }) });
  const user = response.admin ?? {};
  const profile: OfficialProfile = { name: String(user.name ?? name), phone: '', email: '', username: name, employeeId: `ADMIN-${String(user.id ?? '')}`, designation: 'Main Admin', ward: 'All Wards', locality: 'Malvan Municipal Council', department: 'Administration', role: 'main-admin', roleLabel: 'Main Admin', avatarInitial: String(user.name ?? name).charAt(0).toUpperCase(), language: 'English' };
  return { token: response.access_token, profile };
}

export async function loginDepartment(department: string, name: string, password: string) {
  const response = await apiRequest<{ access_token: string; department: string; department_name: string; display_name: string }>('/api/department/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department, name, password }) });
  const profile: OfficialProfile = { name: response.display_name || name, phone: '', email: '', username: name, employeeId: `DEPT-${response.department}`, designation: 'Department Officer', ward: 'All Wards', locality: 'Malvan Municipal Council', department: response.department_name, role: 'department-officer', roleLabel: 'Department Officer', avatarInitial: (response.display_name || name).charAt(0).toUpperCase(), language: 'English' };
  return { token: response.access_token, profile };
}

export async function getDepartmentComplaints(token: string) {
  return (await apiRequest<ApiComplaint[]>('/api/department/complaints', {}, token)).map(mapComplaint);
}

export async function updateDepartmentComplaintStatus(id: string, status: ComplaintStatus, token: string) {
  await apiRequest(`/api/department/complaints/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }, token);
}

export async function addDepartmentComplaintNote(id: string, noteText: string, token: string) {
  await apiRequest(`/api/department/complaints/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note_text: noteText }) }, token);
}

export async function getOfficialComplaints(role: OfficialProfile['role'], token: string) {
  if (role === 'nagarsevak') return (await apiRequest<ApiComplaint[]>('/api/nagarsevak/complaints', {}, token)).map(mapComplaint);
  if (role === 'main-admin') return (await apiRequest<{ complaints: ApiComplaint[] }>('/api/main-admin/complaints', {}, token)).complaints.map(mapComplaint);
  if (role === 'department-officer') return getDepartmentComplaints(token);
  return [];
}

export async function getOfficialAnnouncements(role: OfficialProfile['role'], token: string) {
  if (role === 'nagarsevak') return (await apiRequest<Record<string, unknown>[]>('/api/nagarsevak/announcements', {}, token)).map(mapAnnouncement);
  if (role === 'main-admin') return (await apiRequest<{ announcements: Record<string, unknown>[] }>('/api/main-admin/announcements', {}, token)).announcements.map(mapAnnouncement);
  if (role === 'department-officer') return getDepartmentAnnouncements(token);
  return [];
}

export async function updateOfficialComplaintStatus(role: OfficialProfile['role'], id: string, status: ComplaintStatus, token: string) {
  if (role === 'department-officer') {
    await updateDepartmentComplaintStatus(id, status, token);
    return;
  }
  const path = role === 'nagarsevak' ? `/api/nagarsevak/complaints/${id}/status` : `/api/main-admin/complaints/${id}/status`;
  await apiRequest(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }, token);
}

export async function addOfficialComplaintNote(role: OfficialProfile['role'], id: string, noteText: string, token: string) {
  if (role === 'department-officer') {
    await addDepartmentComplaintNote(id, noteText, token);
    return;
  }
  const form = new FormData();
  form.append('note_text', noteText);
  await apiRequest(`/api/${role === 'main-admin' ? 'main-admin' : 'nagarsevak'}/complaints/${id}/notes`, { method: 'POST', body: form }, token);
}

export async function escalateOfficialComplaint(role: OfficialProfile['role'], id: string, reason: string, target: string, token: string) {
  const escalation_target = target.toLowerCase().includes('main') ? 'Main Admin' : 'Department';
  const path = role === 'department-officer'
    ? `/api/department/complaints/${id}/escalate`
    : `/api/nagarsevak/complaints/${id}/escalate`;
  await apiRequest(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ escalation_target, escalation_note: reason }) }, token);
}

export async function getNagarsevakComplaintTimeline(id: string, token: string) {
  return apiRequest<Record<string, unknown>[]>(`/api/complaints/${id}/timeline`, {}, token);
}

export async function getDepartmentComplaintTimeline(id: string, token: string) {
  return apiRequest<Record<string, unknown>[]>(`/api/department/complaints/${id}/timeline`, {}, token);
}

export async function getMainAdminComplaintDetail(id: string, token: string) {
  return apiRequest<Record<string, unknown>>(`/api/main-admin/complaints/${id}`, {}, token);
}
