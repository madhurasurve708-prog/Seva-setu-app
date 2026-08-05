/**
 * Application Configuration
 * 
 * Development mode settings for testing and development purposes.
 * These flags should be set via environment variables.
 * 
 * SECURITY: Development mode is protected by multiple layers:
 * 1. Frontend environment variable (EXPO_PUBLIC_DEV_MODE)
 * 2. Backend environment variable (ALLOW_DEV_MODE) - must match
 * 3. Backend origin validation (only allowed from specific domains)
 * 4. Backend IP whitelist (optional additional layer)
 */

export const appConfig = {
  /**
   * Development mode for citizen OTP
   * When enabled, skips Supabase OTP verification and accepts any 6-digit OTP
   * Set via EXPO_PUBLIC_DEV_MODE=true in .env
   * 
   * SECURITY: This is only the first layer. The backend must also have
   * ALLOW_DEV_MODE=true environment variable set, otherwise requests will be rejected.
   */
  devMode: process.env.EXPO_PUBLIC_DEV_MODE === 'true',
  
  /**
   * Check if development mode is enabled
   */
  isDevMode: (): boolean => {
    return process.env.EXPO_PUBLIC_DEV_MODE === 'true';
  },
  
  /**
   * Get the development mode secret token
   * This must match the backend's DEV_MODE_SECRET to allow dev mode
   * If not set, dev mode will not work even if other flags are enabled
   */
  devModeSecret: process.env.EXPO_PUBLIC_DEV_MODE_SECRET || '',
  
  /**
   * Check if development mode is fully configured with secret
   */
  isDevModeFullyConfigured: (): boolean => {
    return process.env.EXPO_PUBLIC_DEV_MODE === 'true' && 
           !!process.env.EXPO_PUBLIC_DEV_MODE_SECRET;
  }
};