import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/constants/theme';
import { DepartmentProvider, useDepartment } from '@/providers/department-provider';
function DepartmentRoutes() { const { ready, isAuthenticated, profile } = useDepartment(); if (!ready) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={COLORS.primary}/></View>; if (!isAuthenticated || profile?.role !== 'department-officer') return <Redirect href="/(auth)/department-login"/>; return <Stack screenOptions={{headerShown:false}}/>; }
export default function DepartmentLayout() { return <DepartmentProvider><DepartmentRoutes/></DepartmentProvider>; }
