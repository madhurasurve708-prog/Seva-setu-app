import { useColorScheme as _useColorScheme } from 'react-native';

/**
 * Custom hook wrapping React Native's useColorScheme.
 * Returns 'light' | 'dark' | null.
 */
export function useColorScheme(): NonNullable<ReturnType<typeof _useColorScheme>> {
  return _useColorScheme() ?? 'light';
}
