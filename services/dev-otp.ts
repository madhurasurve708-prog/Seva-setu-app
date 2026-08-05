/**
 * Development/Fake OTP Service
 * 
 * This service provides a fake OTP implementation for development/testing purposes.
 * It should only be used when EXPO_PUBLIC_DEV_MODE=true is set in the environment.
 * 
 * When enabled:
 * - Skips Supabase OTP sending (SMS verification bypass only)
 * - Accepts any 6-digit OTP for verification
 * - All other API calls go to the real backend
 * 
 * SECURITY LAYERS:
 * 1. Frontend env var: EXPO_PUBLIC_DEV_MODE=true
 * 2. Frontend secret: EXPO_PUBLIC_DEV_MODE_SECRET must match backend
 * 3. Backend env var: ALLOW_DEV_MODE=true must be set on backend
 * 4. Backend validation: Backend validates the secret token
 * 
 * IMPORTANT: This only bypasses SMS verification. The real backend is still used
 * for all other operations (profile, complaints, uploads, etc.)
 */

import { appConfig } from '@/config/app-config';

// Store the current user's phone number for backend authentication in dev mode
let currentDevPhone: string | null = null;

/**
 * Get the current development user's phone number
 * Used for authenticating with the real backend in dev mode
 */
export function getDevPhone(): string | null {
  return currentDevPhone;
}

/**
 * Get the development mode secret token
 * This must match the backend's DEV_MODE_SECRET
 */
export function getDevModeSecret(): string {
  return appConfig.devModeSecret;
}

/**
 * Set the current development user's phone number
 */
export function setDevPhone(phone: string): void {
  currentDevPhone = phone;
}

/**
 * Clear the current development user's phone number
 */
export function clearDevPhone(): void {
  currentDevPhone = null;
}

/**
 * Simulates sending OTP (development mode)
 * In development mode, this does nothing but succeeds
 * The real backend will be contacted for all other operations
 */
export async function requestDevOtp(phone: string): Promise<void> {
  if (!appConfig.isDevMode()) {
    throw new Error('Development mode is not enabled. Set EXPO_PUBLIC_DEV_MODE=true to use fake OTP.');
  }
  
  if (!appConfig.devModeSecret) {
    throw new Error('Development mode secret not configured. Set EXPO_PUBLIC_DEV_MODE_SECRET to use fake OTP.');
  }
  
  // Store the phone number for backend authentication
  setDevPhone(phone);
  
  // In development mode, we don't actually send an OTP via SMS
  // Just simulate a successful request
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Simulates OTP verification (development mode)
 * In development mode, accepts any 6-digit OTP
 * After verification, the real backend is used for all API calls
 */
export async function verifyDevOtp(phone: string, token: string): Promise<{ session: any }> {
  if (!appConfig.isDevMode()) {
    throw new Error('Development mode is not enabled. Set EXPO_PUBLIC_DEV_MODE=true to use fake OTP.');
  }
  
  if (!appConfig.devModeSecret) {
    throw new Error('Development mode secret not configured. Set EXPO_PUBLIC_DEV_MODE_SECRET to use fake OTP.');
  }
  
  // Validate that the token is a 6-digit number
  if (!/^\d{6}$/.test(token)) {
    throw new Error('Invalid OTP. Please enter a 6-digit number.');
  }
  
  // Update the stored phone number for backend authentication
  setDevPhone(phone);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return a fake session object
  // This mimics the structure returned by Supabase
  // The real backend will use X-Dev-Phone header for authentication
  return {
    session: {
      access_token: 'dev-fake-token',
      refresh_token: 'dev-fake-refresh-token',
      user: {
        id: `dev-user-${phone}`,
        phone: phone,
      }
    }
  };
}

/**
 * Check if development OTP mode is enabled
 */
export function isDevOtpMode(): boolean {
  return appConfig.isDevMode();
}