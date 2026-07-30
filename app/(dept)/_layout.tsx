import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useDepartment } from '@/providers/department-provider';
import { usePanelBackHandler } from '@/hooks/usePanelBackHandler';

function DepartmentRoutes() {
  const { ready, isAuthenticated, profile } = useDepartment();
  const colorScheme = useColorScheme();

  // Custom hook to handle Android hardware back press navigation and double-press to exit
  usePanelBackHandler('dept');

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated || profile?.role !== 'department-officer') {
    return <Redirect href="/(auth)/role-selection" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#071A2D' : '#F8FAFC' },
      }}
    />
  );
}

export default function DepartmentLayout() {
  return <DepartmentRoutes />;
}
