// components/citizen/citizen-logout.ts
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { router } from 'expo-router';

export async function clearCitizenSession(logout: () => Promise<void>) {
  await logout();
}

export function navigateToRoleSelection(navigation?: NavigationProp<ParamListBase>) {
  if (navigation) {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'role-selection' }],
      }),
    );
    return;
  }

  try {
    if (typeof router.canDismiss === 'function' && router.canDismiss()) {
      router.dismissAll();
    }
  } catch {
    // dismissAll may fail when there is nothing to dismiss
  }

  router.replace('/role-selection');
}

export async function performCitizenLogout(
  logout: () => Promise<void>,
  navigation?: NavigationProp<ParamListBase>,
) {
  await clearCitizenSession(logout);
  navigateToRoleSelection(navigation);
}

export function confirmCitizenLogout(
  logout: () => Promise<void>,
  navigation?: NavigationProp<ParamListBase>,
) {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void performCitizenLogout(logout, navigation);
        },
      },
    ],
    { cancelable: true },
  );
}