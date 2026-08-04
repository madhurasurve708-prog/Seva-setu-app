import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isCitizenAuthConfigured = Boolean(url && anonKey);

// Lazy initialization - client is created only when first needed
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getStorageAdapter() {
  // Use SecureStore for native platforms, AsyncStorage for web
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }
  
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

function createSupabaseClient() {
  if (!isCitizenAuthConfigured) {
    throw new Error('Citizen authentication is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(url!, anonKey!, {
      auth: {
        storage: getStorageAdapter(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  
  return supabaseClient;
}

export function getSupabaseClient() {
  return createSupabaseClient();
}
