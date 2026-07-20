import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function PrivacyScreen() {
  const router = useRouter();

  const [cameraPermission, setCameraPermission] = useState(true);
  const [galleryPermission, setGalleryPermission] = useState(true);
  const [locationPermission, setLocationPermission] = useState(true);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#0A2A43" />
        </Pressable>
        <View>
          <Text className="text-lg font-extrabold text-slate-800 leading-tight">Privacy & Permissions</Text>
          <Text className="text-xs text-slate-400 font-bold">Configure device access and security permissions</Text>
        </View>
      </View>

      <View className="p-4">
        {/* Hardware Toggles */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Device Permissions</Text>

          {/* Location */}
          <View className="flex-row items-center justify-between py-3 border-b border-slate-50">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Location Access</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Use GPS coordinates to determine complaint locations on maps.</Text>
            </View>
            <Switch
              value={locationPermission}
              onValueChange={setLocationPermission}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          {/* Camera */}
          <View className="flex-row items-center justify-between py-3 border-b border-slate-50 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Camera Access</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Allow camera capture to upload verification photos of resolved grievances.</Text>
            </View>
            <Switch
              value={cameraPermission}
              onValueChange={setCameraPermission}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>

          {/* Gallery */}
          <View className="flex-row items-center justify-between py-3 mt-2">
            <View className="flex-1 mr-4">
              <Text className="text-slate-800 font-bold text-sm">Photo Library Access</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Select existing photos from device gallery to attach to grievance updates.</Text>
            </View>
            <Switch
              value={galleryPermission}
              onValueChange={setGalleryPermission}
              trackColor={{ true: '#1E6FD9', false: '#CBD5E1' }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
