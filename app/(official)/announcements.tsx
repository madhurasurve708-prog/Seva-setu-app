import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useOfficial } from '@/providers/official-provider';

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { announcements } = useOfficial();

  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'Pinned': return { bg: '#EFF6FF', text: '#1E6FD9', icon: 'pin-sharp' as const };
      case 'Emergency': return { bg: '#FEF2F2', text: '#DC2626', icon: 'alert-circle-outline' as const };
      case 'High': return { bg: '#FFF7ED', text: '#EA580C', icon: 'warning-outline' as const };
      default: return { bg: '#F1F5F9', text: '#475569', icon: 'mail-outline' as const };
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#0A2A43" />
        </Pressable>
        <View>
          <Text className="text-lg font-extrabold text-slate-800 leading-tight">Municipal Announcements</Text>
          <Text className="text-xs text-slate-400 font-bold">Important alerts and notices from Main Admin</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {announcements.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm mt-8">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="megaphone-outline" size={32} color="#1E6FD9" />
            </View>
            <Text className="text-slate-800 font-extrabold text-base mb-1 text-center">
              No Announcements
            </Text>
            <Text className="text-slate-400 text-sm text-center leading-relaxed">
              There are no notices or updates published by the main administration at this time.
            </Text>
          </View>
        ) : (
          announcements.map((a) => {
            const style = getPriorityStyle(a.priority);
            return (
              <View key={a.id} className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-3">
                  <View
                    style={{
                      backgroundColor: style.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name={style.icon} size={12} color={style.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: style.text, fontSize: 11, fontWeight: '700' }}>
                      {a.priority}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-400 font-bold">{a.date}</Text>
                </View>

                <Text className="text-slate-800 font-extrabold text-base mb-2">{a.title}</Text>
                <Text className="text-slate-600 text-sm leading-relaxed">{a.body}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
