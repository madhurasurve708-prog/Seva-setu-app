import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getEscalationTargets, useOfficial } from '@/providers/official-provider';

export default function EscalateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, complaints, escalateComplaint } = useOfficial();

  const escalationTargets = getEscalationTargets(profile.role);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-slate-50">
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text className="text-slate-800 font-extrabold text-lg mt-4 mb-2">Complaint Not Found</Text>
        <Pressable onPress={() => router.back()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleEscalate = async () => {
    if (!selectedTarget) {
      Alert.alert('Selection Required', 'Please select an escalation target before submitting.');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please provide a justification for this escalation.');
      return;
    }

    setSaving(true);
    try {
      const target = escalationTargets.find((item) => item.id === selectedTarget);
      await escalateComplaint(complaint.id, target?.label ?? selectedTarget, reason.trim());
      Alert.alert('Escalated Successfully', `Grievance has been escalated to ${target?.label ?? selectedTarget}.`, [
        {
          text: 'OK',
          onPress: () => {
            router.replace({
              pathname: '/(official)/complaint-details',
              params: { id: complaint.id },
            } as any);
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to escalate grievance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F7FA' }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-100 shadow-sm justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <Ionicons name="arrow-back" size={24} color="#0A2A43" />
          </Pressable>
          <View>
            <Text className="text-lg font-extrabold text-slate-800 leading-tight">Escalate Grievance</Text>
            <Text className="text-xs text-slate-400 font-semibold">{complaint.id}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleEscalate}
          disabled={saving || !selectedTarget || !reason.trim()}
          className="bg-red-600 px-4 py-2 rounded-xl shadow-sm disabled:opacity-50"
        >
          <Text className="text-white font-bold text-xs">{saving ? 'Escalating...' : 'Confirm'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Selection list */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <Text className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-wider">Select Escalation Target</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Choose the next authority for this grievance. New roles can be added later through the shared escalation list.
          </Text>

          <View style={{ gap: 8 }}>
            {escalationTargets.map((target) => {
              const isSelected = selectedTarget === target.id;
              return (
                <Pressable
                  key={target.id}
                  onPress={() => setSelectedTarget(target.id)}
                  style={[
                    styles.deptRow,
                    isSelected && styles.activeDeptRow,
                  ]}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? '#1E6FD9' : '#A6ADB8'}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.deptText,
                        isSelected && styles.activeDeptText,
                      ]}
                    >
                      {target.label}
                    </Text>
                    <Text className="text-slate-400 text-[11px] mt-1">{target.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Remarks Form */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <Text className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-wider">Escalation Remarks</Text>
          <Text className="text-slate-400 text-xs mb-3">
            Explain the reasons for escalation (e.g. out of ward jurisdiction, requires expert workforce, budget issues, etc.)
          </Text>

          <TextInput
            placeholder="Type reason for escalation here..."
            placeholderTextColor="#A6ADB8"
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            style={styles.textArea}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
  },
  activeDeptRow: {
    borderColor: '#1E6FD9',
    backgroundColor: '#EFF6FF',
  },
  deptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B6472',
  },
  activeDeptText: {
    color: '#1E6FD9',
    fontWeight: '700',
  },
  textArea: {
    fontSize: 14,
    color: '#101826',
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F5F7FA',
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
