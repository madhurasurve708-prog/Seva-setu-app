import { View, Text, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useOfficial } from '@/providers/official-provider';

export default function AddNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { complaints, addComplaintNote } = useOfficial();

  const [noteText, setNoteText] = useState('');
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

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Empty Note', 'Please enter some text before saving.');
      return;
    }

    setSaving(true);
    try {
      await addComplaintNote(complaint.id, noteText.trim());
      Alert.alert('Note Saved', 'Grievance activity note appended successfully.', [
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
      Alert.alert('Error', 'Failed to save note. Please try again.');
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
            <Text className="text-lg font-extrabold text-slate-800 leading-tight">Add Progress Note</Text>
            <Text className="text-xs text-slate-400 font-semibold">{complaint.id}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleSaveNote}
          disabled={saving || !noteText.trim()}
          className="bg-blue-600 px-4 py-2 rounded-xl shadow-sm disabled:opacity-50"
        >
          <Text className="text-white font-bold text-xs">{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <View className="p-4 flex-1">
        <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex-1 mb-4">
          <Text className="text-slate-800 font-bold mb-2">Complaint: {complaint.title}</Text>
          <Text className="text-slate-400 text-xs mb-4 leading-relaxed">
            Write down any notes, field observations, or updates regarding the status of this complaint. These will be appended to the official history timeline.
          </Text>

          <TextInput
            placeholder="Type your notes here..."
            placeholderTextColor="#A6ADB8"
            multiline
            textAlignVertical="top"
            value={noteText}
            onChangeText={setNoteText}
            style={styles.textArea}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#101826',
    borderWidth: 1,
    borderColor: '#E7ECF2',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F5F7FA',
  },
});
