import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function NotificationsScreen() {
  const router = useRouter();
  
  const [complaintAlerts, setComplaintAlerts] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#0A2A43" />
        </Pressable>
        <View>
          <Text className="text-lg font-extrabold text-slate-800 leading-tight">Notifications</Text>
          <Text className="text-xs text-slate-400 font-bold">Manage push alerts, SMS and email settings</Text>
        </View>
      </View>

      <View className="p-4">
        {/* Toggle List Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Alert Preferences</Text>

          {/* New Complaint Assigned */}
          <View className="flex-row items-center justify-between py-3 border-b border-slate-50">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Grievance Assignments</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Receive instant alerts when a citizen files a complaint in your ward.</Text>
            </View>
            <Switch
              value={complaintAlerts}
              onValueChange={setComplaintAlerts}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          {/* Council Announcements */}
          <View className="flex-row items-center justify-between py-3 border-b border-slate-50 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Council Announcements</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Receive alerts when the Main Admin publishes notices.</Text>
            </View>
            <Switch
              value={announcementAlerts}
              onValueChange={setAnnouncementAlerts}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          {/* SMS Alerts */}
          <View className="flex-row items-center justify-between py-3 border-b border-slate-50 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">SMS Alert Broadcasts</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Receive standard text notifications for emergency alerts.</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          {/* Weekly Email summary */}
          <View className="flex-row items-center justify-between py-3 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Weekly Email Summary</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Receive a weekly digest summarizing ward resolution statistics.</Text>
            </View>
            <Switch
              value={emailDigest}
              onValueChange={setEmailDigest}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
