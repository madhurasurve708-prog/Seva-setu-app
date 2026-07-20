import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StatCard from '@/components/official/StatCard';
import { Colors } from '@/constants/color';
import { getDashboardStats } from '@/data/analytics';
import { useOfficial } from '@/providers/official-provider';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { profile } = useOfficial();
  const stats = getDashboardStats();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }} edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800">Monthly Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        <Text className="text-slate-400 text-xs mb-4">{profile.ward} • {profile.locality}</Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard label="Total Complaints" value={stats.total} accentColor={Colors.primary} icon="list-outline" />
          <StatCard label="Pending" value={stats.pending} accentColor="#CA8A04" icon="time-outline" />
          <StatCard label="In Progress" value={stats.inProgress} accentColor={Colors.primary} icon="sync-outline" />
          <StatCard label="Resolved" value={stats.resolved} accentColor={Colors.secondary} icon="checkmark-circle-outline" />
        </View>

        <View className="bg-white rounded-2xl p-6 items-center mb-8">
          <Ionicons name="bar-chart-outline" size={28} color={Colors.primary} />
          <Text className="text-slate-700 font-semibold mt-3 mb-1 text-center">
            Trend charts & category breakdown
          </Text>
          <Text className="text-slate-400 text-sm text-center">
            Detailed monthly charts are arriving in a later sprint.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}