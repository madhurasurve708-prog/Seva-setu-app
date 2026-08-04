import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'seva-setu.official-access-token';
// const SESSION_KEY = '@seva-setu/official-access-token';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function apiUrl(path: string) {
  if (!BASE_URL) throw new ApiError('Municipal server is not configured. Set EXPO_PUBLIC_API_URL.', 0);
  return `${BASE_URL}${path}`;
}

// Platform-appropriate storage: SecureStore for native, AsyncStorage for web
const storage = Platform.OS === 'web' ? AsyncStorage : SecureStore;

export async function saveOfficialAccessToken(token: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(SESSION_KEY, token);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  }
}

export async function getOfficialAccessToken() {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(SESSION_KEY);
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearOfficialAccessToken() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(payload.detail ?? payload.message ?? `Request failed (${response.status}).`, response.status);
  return payload as T;
}
