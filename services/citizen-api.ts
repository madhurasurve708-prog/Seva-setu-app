import { getSupabaseClient, isCitizenAuthConfigured } from '@/services/supabase';

export { isCitizenAuthConfigured };

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export type CitizenApiProfile = {
  id: number;
  supabase_user_id: string;
  full_name: string;
  phone_number: string;
  ward_id: number;
  locality: string;
  profile_photo_url?: string | null;
};

function getApiUrl() {
  if (!API_URL) throw new Error('Municipal server is not configured. Set EXPO_PUBLIC_API_URL.');
  return API_URL;
}

async function authHeaders() {
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
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyCitizenOtp(phone: string, token: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error || !data.session) throw new Error(error?.message ?? 'OTP verification failed.');
  return data.session;
}

export const getCitizenProfile = () => request<CitizenApiProfile>('/api/citizen/profile');

export type Category = { id: number; name: string };

export const getCategories = () => request<Category[]>('/api/categories');

export async function createCitizenComplaint(input: { category: string; title: string; description: string; location: string }) {
  const categories = await getCategories();
  const aliases: Record<string, string> = { 'Street Light': 'Street Lights', 'Stray Animals': 'Animals' };
  const category = categories.find((item) => item.name === (aliases[input.category] ?? input.category));
  if (!category) throw new Error('The selected complaint category is unavailable. Please refresh and try again.');
  return request<{ id: number; created_at: string; status: 'Pending' | 'In Progress' | 'Resolved' }>('/api/citizen/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabase_user_id: '',
      category_id: category.id,
      title: input.title,
      description: input.description,
      manual_location: input.location,
    }),
  });
}

export async function createCitizenProfile(input: { fullName: string; phoneNumber: string; wardNumber: number; locality: string }) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Your session has expired. Please sign in again.');
  return request<CitizenApiProfile>('/api/citizen/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabase_user_id: user.id,
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      ward_number: input.wardNumber,
      locality: input.locality,
    }),
  });
}
