import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComplaintCard from '@/components/official/ComplaintCard';
import HeroBanner from '@/components/official/HeroBanner';
import ProfileDropdown from '@/components/official/ProfileDropdown';
import Sidebar from '@/components/official/Sidebar';
import StatCard from '@/components/official/StatCard';

import { useTranslation } from '@/providers/localization-provider';
import { useOfficial } from '@/providers/official-provider';

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, complaints, announcements, logout } = useOfficial();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Statistics calculation based on actual state
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const escalated = complaints.filter((c) =>
    c.priority === 'Emergency' || c.notes.some(n => /escalated/i.test(n.text))
  ).length;
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const recentComplaints = complaints.slice(0, 3);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Exact Official Header layout */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => setSidebarOpen(true)} className="p-2 -ml-2 mr-2">
            <Ionicons name="menu" size={26} color="#0A2A43" />
          </Pressable>
          <Image
            source={require('@/assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View className="ml-2">
            <Text className="text-sm font-extrabold text-blue-900 leading-tight tracking-wider uppercase">
              SEVA SETU
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Malvan Municipal Council
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Pressable onPress={() => router.push('/(admin)/announcements')} className="p-2 mr-2 bg-slate-50 rounded-full relative">
            <Ionicons name="notifications-outline" size={20} color="#0A2A43" />
            <View style={styles.unreadDot} />
          </Pressable>

          <ProfileDropdown
            name={profile.name}
            initial={profile.avatarInitial}
            language={profile.language}
            onLogout={handleLogout}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Exact Official HeroBanner, custom content for Mamta Waradkar */}
        <HeroBanner
          name={profile.name}
          wardLabel={`${t('nagaradhyaksha')} • ${t('all')}`}
          filedCount={total}
          resolvedCount={resolved}
          successRate={`${successRate}%`}
          onViewComplaints={() => router.push('/(admin)/complaints' as any)}
        />

        {/* Complaint Statistics Grid */}
        <View className="px-4">
          <Text className="text-base font-extrabold text-slate-800 mb-3 tracking-wide">
            {t('totalComplaints')}
          </Text>

          <View style={styles.gridContainer}>
            <StatCard
              label={t('pending')}
              value={pending}
              accentColor="#F2994A"
              icon="time-outline"
            />
            <StatCard
              label={t('inProgress')}
              value={inProgress}
              accentColor="#1E6FD9"
              icon="sync"
            />
            <StatCard
              label={t('resolved')}
              value={resolved}
              accentColor="#1C9B62"
              icon="checkmark"
            />
            <StatCard
              label={t('escalated')}
              value={escalated}
              accentColor="#DC2626"
              icon="arrow-up-circle-outline"
            />
          </View>
        </View>

        {/* Complaint Explorer Section */}
        <View className="px-4 mt-6">
          <Text className="text-base font-extrabold text-slate-800 mb-3 tracking-wide">
            {t('complaintExplorer')}
          </Text>

          <View style={{ gap: 12 }}>
            {/* Ward Wise */}
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaint-explorer', params: { mode: 'ward' } } as any)}
              className="flex-row items-center bg-white rounded-3xl p-4 border border-slate-100 shadow-sm"
            >
              <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center">
                <Ionicons name="map-outline" size={22} color="#1E6FD9" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-extrabold text-slate-800 text-sm">{t('wardWise')}</Text>
                <Text className="text-xs text-slate-400 font-semibold mt-0.5">Explore complaints by municipal ward</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>

            {/* Category Wise */}
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaint-explorer', params: { mode: 'category' } } as any)}
              className="flex-row items-center bg-white rounded-3xl p-4 border border-slate-100 shadow-sm"
            >
              <View className="w-12 h-12 rounded-2xl bg-orange-50 items-center justify-center">
                <Ionicons name="layers-outline" size={22} color="#EA580C" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-extrabold text-slate-800 text-sm">{t('categoryWise')}</Text>
                <Text className="text-xs text-slate-400 font-semibold mt-0.5">Filter grievances by type of issue</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>

            {/* Department Wise */}
            <Pressable
              onPress={() => router.push({ pathname: '/(admin)/complaint-explorer', params: { mode: 'department' } } as any)}
              className="flex-row items-center bg-white rounded-3xl p-4 border border-slate-100 shadow-sm"
            >
              <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center">
                <Ionicons name="business-outline" size={22} color="#7C3AED" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-extrabold text-slate-800 text-sm">{t('departmentWise')}</Text>
                <Text className="text-xs text-slate-400 font-semibold mt-0.5">Track resolution by active department</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>
          </View>
        </View>

        {/* Recent Complaints */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-slate-800 tracking-wide">
              {t('priorityComplaints')}
            </Text>
            <Pressable onPress={() => router.push('/(admin)/complaints' as any)}>
              <Text className="text-sm font-bold text-blue-600">{t('viewAll')}</Text>
            </Pressable>
          </View>

          <View style={{ gap: 14 }}>
            {recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={() => router.push({
                  pathname: '/(official)/complaint-details',
                  params: { id: complaint.id }
                } as any)}
                onNotes={() => router.push({
                  pathname: '/(official)/add-note',
                  params: { id: complaint.id }
                } as any)}
                onEscalate={() => router.push({
                  pathname: '/(official)/escalate',
                  params: { id: complaint.id }
                } as any)}
              />
            ))}
          </View>
        </View>

        {/* Announcements section */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-slate-800 tracking-wide">
              {t('latestAnnouncements')}
            </Text>
            <Pressable onPress={() => router.push('/(admin)/announcements' as any)}>
              <Text className="text-sm font-bold text-blue-600">{t('viewAll')}</Text>
            </Pressable>
          </View>

          {announcements.slice(0, 2).map((a) => (
            <View key={a.id} className="bg-white border border-slate-100 rounded-3xl p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <View className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                  <Text className="text-blue-600 text-[10px] font-bold">{a.priority}</Text>
                </View>
                <Text className="text-[10px] text-slate-400 font-bold">{a.date}</Text>
              </View>
              <Text className="text-slate-800 font-bold text-sm mb-1">{a.title}</Text>
              <Text className="text-slate-500 text-xs leading-normal" numberOfLines={2}>{a.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sidebar navigation */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        wardComplaintsCount={pending}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 32,
    height: 32,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
