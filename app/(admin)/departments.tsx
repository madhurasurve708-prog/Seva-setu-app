import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdminShell } from '@/components/admin/admin-shell';
import { useOfficial } from '@/providers/official-provider';
const departments = ['Water Department', 'Road Department', 'Electrical Department', 'Sanitation Department', 'Garden Department', 'Administration'];
export default function DepartmentsScreen() { const { complaints } = useOfficial(); const router = useRouter(); return <AdminShell title="Departments"><ScrollView contentContainerStyle={{ padding: 16 }}>{departments.map(department => { const total = complaints.filter(c => c.assignedDepartment === department).length; return <Pressable key={department} onPress={() => router.push({ pathname: '/(admin)/complaints', params: { department } } as any)} className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 flex-row items-center"><View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center"><Ionicons name="business-outline" size={22} color="#1E6FD9" /></View><View className="ml-3 flex-1"><Text className="font-bold text-slate-800">{department}</Text><Text className="text-xs text-slate-500 mt-1">{total} assigned complaints</Text></View><Ionicons name="chevron-forward" size={20} color="#94A3B8" /></Pressable>; })}</ScrollView></AdminShell>; }
