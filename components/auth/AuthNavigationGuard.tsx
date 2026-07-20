import { useNavigation, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useCitizen } from '@/providers/citizen-provider';
import { navigateToRoleSelection } from '@/lib/citizen-logout';

export function AuthNavigationGuard() {
  const { ready, profile } = useCitizen();
  const segments = useSegments();
  const navigation = useNavigation();

  useEffect(() => {
    if (!ready) return;

    const inCitizenGroup = segments[0] === '(citizen)';

    if (!profile && inCitizenGroup) {
      navigateToRoleSelection(navigation as never);
    }
  }, [ready, profile, segments, navigation]);

  return null;
}
