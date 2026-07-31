import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export function usePanelBackHandler(panelName: 'citizen' | 'official' | 'dept') {
  const router = useRouter();
  const pathname = usePathname();
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // Define dashboard path for the panel
      const dashboardPath = `/${panelName}/dashboard`;
      
      const currentPath = pathname;

      // If we are on the dashboard
      if (currentPath === dashboardPath || currentPath === `/${panelName}` || currentPath === `/${panelName}/`) {
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          BackHandler.exitApp();
          return true; // handled
        } else {
          lastBackPressTime.current = now;
          ToastAndroid.show('Press back again to exit.', ToastAndroid.SHORT);
          return true; // handled
        }
      }

      // If we are on a main tab / top-level screen of the panel (other than dashboard)
      const mainScreens = {
        citizen: [
          '/(citizen)/ward',
          '/(citizen)/my-complaints',
          '/(citizen)/report-complaint',
          '/(citizen)/announcements',
          '/(citizen)/profile',
        ],
        official: [
          '/(official)/complaints',
          '/(official)/analytics',
          '/(official)/profile',
          '/(official)/settings',
        ],
        dept: [
          '/(dept)/complaints',
          '/(dept)/announcements',
          '/(dept)/analytics',
          '/(dept)/profile',
        ],
      };

      const panelMainScreens = mainScreens[panelName] || [];

      // Check direct match or with slash
      const isMainScreen = panelMainScreens.some(screen => 
        currentPath === screen || 
        currentPath.replace(/^\//, '') === screen.replace(/^\//, '').replace(/^\(([^)]+)\)\//, '')
      );

      if (isMainScreen || panelMainScreens.includes(currentPath)) {
        // Return to Dashboard
        router.replace(dashboardPath as any);
        return true; // handled
      }

      // If we are on a subpage, try to go back
      if (router.canGoBack()) {
        router.back();
        return true; // handled
      }

      // Fallback: If can't go back, check specific subpages
      if (panelName === 'dept') {
        const cleanPath = currentPath.replace(/\/$/, '');
        if (cleanPath.endsWith('/settings')) {
          router.replace('/(dept)/profile');
          return true; // handled
        }
        if (
          cleanPath.endsWith('/help') ||
          cleanPath.endsWith('/privacy-policy') ||
          cleanPath.endsWith('/terms') ||
          cleanPath.endsWith('/about')
        ) {
          router.replace('/(dept)/settings');
          return true; // handled
        }
      }

      // Fallback: If can't go back, go to Dashboard
      router.replace(dashboardPath as any);
      return true; // handled
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      subscription.remove();
    };
  }, [pathname, router, panelName]);
}
