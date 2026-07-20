import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdminShell } from '@/components/admin/admin-shell';
import { categories } from '@/data/categories';
import { useOfficial } from '@/providers/official-provider';

const departments = ['Water Department', 'Road Department', 'Electrical Department', 'Sanitation Department', 'Garden Department', 'Administration'];
export default function ComplaintExplorer() { const router = useRouter(); const { mode = 'ward' } = useLocalSearchParams<{ mode?: string }>(); const { complaints } = useOfficial();
  const items = mode === 'category' ? categories.filter(c => c.id !== 'all').map(c => ({ label: c.label, value: c.id, count: complaints.filter(x => x.category === c.id).length })) : mode === 'department' ? departments.map(department => ({ label: department, value: department, count: complaints.filter(x => x.assignedDepartment === department).length })) : Array.from({ length: 10 }, (_, index) => ({ label: `Ward ${index + 1}`, value: `Ward ${index + 1}`, count: complaints.filter(x => x.ward.startsWith(`Ward ${index + 1}`)).length }));
  const title = mode === 'category' ? 'Category Wise' : mode === 'department' ? 'Department Wise' : 'Ward Wise';
  return <AdminShell title={title}><ScrollView contentContainerStyle={{ padding: 16 }}><Text className="text-sm text-slate-500 mb-4">Select a {mode} to view every matching complaint.</Text>{items.map(item => <Pressable key={item.value} onPress={() => router.push({ pathname: '/(admin)/complaints', params: { [mode]: item.value } } as any)} className="bg-white border border-slate-100 rounded-2xl p-4 mb-3 flex-row items-center"><View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center"><Ionicons name={mode === 'ward' ? 'location-outline' : mode === 'category' ? 'layers-outline' : 'business-outline'} size={21} color="#1E6FD9" /></View><View className="ml-3 flex-1"><Text className="font-bold text-slate-800">{item.label}</Text><Text className="text-xs text-slate-400 mt-1">{item.count} complaints</Text></View><Ionicons name="chevron-forward" size={20} color="#94A3B8" /></Pressable>)}</ScrollView></AdminShell>; }
