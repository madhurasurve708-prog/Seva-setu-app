import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'seva-setu.official-access-token';
// const SESSION_KEY = '@seva-setu/official-access-token';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const GET_CACHE_TTL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 12_000;

type CachedResponse = {
  expiresAt: number;
  payload: unknown;
};

// This cache deliberately stays small and in-memory. It makes repeated screen
// visits instant without persisting potentially stale municipal data on disk.
const responseCache = new Map<string, CachedResponse>();
const inFlightRequests = new Map<string, Promise<unknown>>();

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
  clearApiResponseCache();
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

/** Clears cached GET data after sign-out, a mutation, or an explicit refresh. */
export function clearApiResponseCache(pathPrefix?: string) {
  if (!pathPrefix) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (key.startsWith(`${pathPrefix}|`)) responseCache.delete(key);
  }
}

function requestCacheKey(path: string, token?: string | null) {
  // The token keeps responses from different signed-in users isolated.
  return `${path}|${token ?? 'anonymous'}`;
}

export function extractErrorMessage(payload: unknown, status: number): string {
  if (!payload || typeof payload !== 'object') {
    return status >= 500
      ? 'Municipal server error. Please try again later.'
      : `Request failed (${status}).`;
  }

  const record = payload as Record<string, unknown>;

  // 1. If detail is a plain string
  if (typeof record.detail === 'string' && record.detail.trim().length > 0) {
    if (status >= 500) {
      return 'Municipal server error. Please try again later.';
    }
    return record.detail.trim();
  }

  // 2. If detail is an array (e.g. FastAPI / Pydantic 422 validation errors)
  if (Array.isArray(record.detail) && record.detail.length > 0) {
    const messages = record.detail
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const dict = item as Record<string, unknown>;
          const msg = typeof dict.msg === 'string' ? dict.msg.trim() : typeof dict.message === 'string' ? dict.message.trim() : '';
          const loc = Array.isArray(dict.loc)
            ? dict.loc.filter((p) => p !== 'body').join('.')
            : '';
          if (loc && msg) {
            return `${loc}: ${msg}`;
          }
          if (msg) return msg;
        }
        return '';
      })
      .filter((s) => s.length > 0);

    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  // 3. If detail is an object with msg / message
  if (record.detail && typeof record.detail === 'object') {
    const detailObj = record.detail as Record<string, unknown>;
    const msg = typeof detailObj.msg === 'string' ? detailObj.msg.trim() : typeof detailObj.message === 'string' ? detailObj.message.trim() : '';
    if (msg) return msg;
  }

  // 4. If message is a string
  if (typeof record.message === 'string' && record.message.trim().length > 0) {
    if (status >= 500) {
      return 'Municipal server error. Please try again later.';
    }
    return record.message.trim();
  }

  // 5. Friendly fallbacks by HTTP status code
  if (status === 400) return 'Invalid request. Please verify entered data.';
  if (status === 401) return 'Invalid credentials. Please check your details and try again.';
  if (status === 403) return 'Access denied. Account may be inactive or restricted.';
  if (status === 404) return 'Requested service was not found.';
  if (status === 422) return 'Invalid request data. Please check the entered fields.';
  if (status >= 500) return 'Municipal server error. Please try again later.';

  return `Request failed (${status}).`;
}

async function performRequest<T>(path: string, options: RequestInit, token?: string | null): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(extractErrorMessage(payload, response.status), response.status);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError' && !options.signal?.aborted) {
      throw new ApiError('The request timed out. Please try again.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  if (method !== 'GET') {
    // A successful or failed mutation can affect any dashboard/list response.
    clearApiResponseCache();
    return performRequest<T>(path, options, token);
  }

  const key = requestCacheKey(path, token);
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.payload as T;
  if (cached) responseCache.delete(key);

  const pending = inFlightRequests.get(key);
  if (pending) return pending as Promise<T>;

  const request = performRequest<T>(path, options, token)
    .then((payload) => {
      responseCache.set(key, { payload, expiresAt: Date.now() + GET_CACHE_TTL_MS });
      return payload;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}
