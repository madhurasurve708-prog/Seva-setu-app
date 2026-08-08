import { getDevModeSecret, getDevPhone, isDevOtpMode, requestDevOtp, verifyDevOtp } from '@/services/dev-otp';
import { getSupabaseClient, isCitizenAuthConfigured } from '@/services/supabase';

export { isCitizenAuthConfigured };

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export type CitizenApiProfile = {
  id: number;
  supabase_user_id: string;
  full_name: string;
  phone_number: string;
  ward_id: number;
  ward_number: number | null;
  locality: string;
  profile_photo_url?: string | null;
};

function getApiUrl() {
  if (!API_URL) throw new Error('Municipal server is not configured. Set EXPO_PUBLIC_API_URL.');
  return API_URL;
}

async function authHeaders(): Promise<Record<string, string>> {
  // In development mode, use a dev bypass token for real backend
  if (isDevOtpMode()) {
    const phone = getDevPhone();
    const secret = getDevModeSecret();
    if (!phone) throw new Error('Development mode requires phone number from OTP verification.');
    if (!secret) throw new Error('Development mode secret not configured. Set EXPO_PUBLIC_DEV_MODE_SECRET.');
    return { 
      'X-Dev-Mode': 'true',
      'X-Dev-Phone': phone,
      'X-Dev-Secret': secret,
      'Authorization': 'Bearer dev-bypass-token'
    };
  }
  
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail ?? 'The municipal server could not complete your request.');
  return payload as T;
}

export async function requestCitizenOtp(phone: string) {
  // Use dev OTP if development mode is enabled
  if (isDevOtpMode()) {
    return requestDevOtp(phone);
  }
  
  // Use Supabase OTP for production
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyCitizenOtp(phone: string, token: string) {
  // Use dev OTP if development mode is enabled
  if (isDevOtpMode()) {
    const result = await verifyDevOtp(phone, token);
    return result.session;
  }
  
  // Use Supabase OTP for production
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error || !data.session) throw new Error(error?.message ?? 'OTP verification failed.');
  return data.session;
}

export const getCitizenProfile = () => request<CitizenApiProfile>('/api/citizen/profile');

export type Category = { id: number; name: string };
export type CitizenApiComplaint = { id: number; category_id: number; title: string; description: string; manual_location?: string | null; image_url?: string | null; status: 'Pending' | 'In Progress' | 'Resolved'; created_at: string; updated_at: string };
export type CitizenApiAnnouncement = { id: number; title: string; description: string; priority: string; created_at: string; is_read?: boolean };

export const getCategories = () => request<Category[]>('/api/categories');

export async function createCitizenComplaint(input: { category: string; title: string; description: string; location: string }) {
  const categories = await getCategories();
  const aliases: Record<string, string> = { 'Street Light': 'Street Lights', 'Stray Animals': 'Animals' };
  const category = categories.find((item) => item.name === (aliases[input.category] ?? input.category));
  if (!category) throw new Error('The selected complaint category is unavailable. Please refresh and try again.');
  
  // In dev mode, backend will extract user_id from X-Dev-Phone header
  // In production, we send empty string and backend uses Supabase auth
  const supabaseUserId = '';
  
  return request<{ id: number; created_at: string; status: 'Pending' | 'In Progress' | 'Resolved' }>('/api/citizen/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabase_user_id: supabaseUserId,
      category_id: category.id,
      title: input.title,
      description: input.description,
      manual_location: input.location,
    }),
  });
}

export const getCitizenComplaints = () => request<CitizenApiComplaint[]>('/api/citizen/complaints');
export const getCitizenComplaintDetail = (complaintId: number) => request<CitizenApiComplaint & { notes: { author_role: string; author_name: string; note_text: string; created_at: string; image_url?: string | null }[] }>(`/api/citizen/complaints/${complaintId}`);
export const getCitizenAnnouncements = () => request<CitizenApiAnnouncement[]>('/api/citizen/announcements');

export async function uploadCitizenComplaintImage(complaintId: number, imageUri: string) {
  const filename = imageUri.split('/').pop() || 'complaint.jpg';
  const type = filename.endsWith('.png') ? 'image/png' : filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const form = new FormData();
  
  let fileData: any;
  if (imageUri.startsWith('data:') || imageUri.startsWith('blob:') || imageUri.startsWith('http')) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    // Validate size on frontend for web Blobs (5MB = 5,242,880 bytes)
    if (blob.size > 5242880) {
      throw new Error('Image size exceeds the maximum limit of 5 MB.');
    }
    fileData = blob;
  } else {
    fileData = { uri: imageUri, name: filename, type } as any;
  }
  
  form.append('image', fileData, filename);
  return request<CitizenApiComplaint>(`/api/citizen/complaints/${complaintId}/image`, { method: 'PUT', body: form });
}

export async function createCitizenProfile(input: { fullName: string; phoneNumber: string; wardNumber: number; locality: string }) {
  let userId: string;
  
  if (isDevOtpMode()) {
    // In dev mode, use a fake user ID based on phone number
    // Backend will use X-Dev-Phone header to identify the user
    userId = `dev-user-${input.phoneNumber}`;
  } else {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Your session has expired. Please sign in again.');
    userId = user.id;
  }
  
  return request<CitizenApiProfile>('/api/citizen/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabase_user_id: userId,
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      ward_number: input.wardNumber,
      locality: input.locality,
    }),
  });
}
