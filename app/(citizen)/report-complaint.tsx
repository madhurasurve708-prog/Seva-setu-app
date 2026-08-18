// app/(citizen)/report-complaint.tsx
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import PrimaryButton from '@/components/common/PrimaryButton';
import CustomTextInput from '@/components/common/CustomTextInput';

type Category = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bg: string;
  iconColor: string;
};

const CATEGORIES: Category[] = [
  { label: 'Water', icon: 'water-outline', bg: '#E3F2FD', iconColor: '#0B4F8A' },
  { label: 'Garbage', icon: 'trash-can-outline', bg: '#E8F5E9', iconColor: '#10B981' },
  { label: 'Street Light', icon: 'lightbulb-outline', bg: '#FFF8E1', iconColor: '#F59E0B' },
  { label: 'Road', icon: 'road-variant', bg: '#EEEEEE', iconColor: '#64748B' },
  { label: 'Drainage', icon: 'waves', bg: '#F3E5F5', iconColor: '#8E24AA' },
  { label: 'Stray Animals', icon: 'paw-outline', bg: '#FFEBEE', iconColor: '#EF4444' },
  { label: 'Tree', icon: 'tree-outline', bg: '#E8F5E9', iconColor: '#2E86DE' },
  { label: 'Other', icon: 'map-marker-outline', bg: '#EDE7F6', iconColor: '#5E35B1' },
];

import React, { memo, useCallback } from 'react';

const ReportComplaint = memo(function ReportComplaint() {
  const router = useRouter();
  const { submitComplaint } = useCitizen();
  const { t } = useTranslation();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const pick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('permDenied'), t('permDeniedMsg'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      // Size check: limit to 5MB (approx 5,242,880 bytes)
      if (selectedAsset.fileSize && selectedAsset.fileSize > 5242880) {
        Alert.alert(t('fileTooLarge'), t('fileTooLargeMsg'));
        return;
      }
      setPhotoUri(selectedAsset.uri);
    }
  }, [t]);

  const submit = useCallback(async () => {
    if (!category || !location.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const complaint = await submitComplaint({
        category,
        title: location.trim(), // mapping location input to complaint title
        description: description.trim(),
        photoUri,
      });
      router.replace({
        pathname: '/(citizen)/complaint-success',
        params: { id: complaint.id },
      });
    } catch {
      setSubmitting(false);
      Alert.alert(t('submitError'), t('submitErrorMsg'));
    }
  }, [category, location, description, photoUri, submitComplaint, router, t]);

  const canSubmit = category && location.trim().length > 0 && description.trim().length > 0 && !submitting;

  return (
    <CitizenScreen title={t('reportComplaint')}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        <View style={styles.noteBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primaryLight} />
          <Text style={styles.noteText}>
            {t('autoAttachNote')}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>{t('selectCategory')}</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((c) => {
            const active = category === c.label;
            return (
              <Pressable
                key={c.label}
                onPress={() => setCategory(c.label)}
                style={[
                  styles.categoryCard,
                  { backgroundColor: active ? 'rgba(46, 134, 222, 0.05)' : COLORS.white },
                  active && { borderColor: COLORS.primaryLight },
                ]}
              >
                {active && (
                  <View style={[styles.checkBadge, { backgroundColor: COLORS.primaryLight }]}>
                    <MaterialCommunityIcons name="check" size={11} color={COLORS.white} />
                  </View>
                )}
                <View style={[styles.categoryIconBg, { backgroundColor: c.bg }]}>
                  <MaterialCommunityIcons name={c.icon} size={24} color={c.iconColor} />
                </View>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {t(({ Water: 'catWater', Garbage: 'catGarbage', 'Street Light': 'catStreetLight', Road: 'catRoad', Drainage: 'catDrainage', 'Stray Animals': 'catStrayAnimals', Tree: 'catTree', Other: 'catOther' } as Record<string, string>)[c.label])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.formGroup}>
          <CustomTextInput
            icon="map-marker-outline"
            label={t('locationLabel')}
            placeholder={t('locationPlaceholder')}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>{t('detailedDescription')}</Text>
          <View style={styles.descriptionContainer}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('descriptionPlaceholder')}
              placeholderTextColor="#A6ADB8"
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
          </View>
        </View>

        <Text style={styles.label}>{t('attachPhoto')}</Text>
        <Pressable onPress={pick} style={styles.photoContainer}>
          {photoUri ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <Pressable style={styles.removePhotoBtn} onPress={() => setPhotoUri(undefined)}>
                <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.white} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.cameraIconCircle}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={28} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.photoUploadText}>{t('uploadProofPhoto')}</Text>
              <Text style={styles.photoUploadSubtext}>{t('photoFormats')}</Text>
            </View>
          )}
        </Pressable>

        <PrimaryButton
          label={submitting ? t('submittingComplaint') : t('submitComplaint')}
          disabled={!canSubmit}
          loading={submitting}
          onPress={submit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </CitizenScreen>
  );
});

export default ReportComplaint;

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 130 },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF5FF',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#D0E7FF',
    marginBottom: 20,
  },
  noteText: { ...TYPOGRAPHY.captionBold, color: COLORS.primaryLight, flex: 1, lineHeight: 18 },
  sectionLabel: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginBottom: 14 },
  label: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginTop: 22, marginBottom: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryCard: {
    width: '48%', // changed to 2 columns to prevent layout distortion on smaller phones
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    ...SHADOWS.soft,
    marginBottom: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  categoryIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  formGroup: { marginTop: 10 },
  descriptionContainer: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionInput: { height: 110, fontSize: 15, color: COLORS.text, padding: 0 },
  photoContainer: {
    height: 144,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1.8,
    borderColor: COLORS.primaryLight,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  cameraIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(46, 134, 222, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoUploadText: { fontSize: 13.5, fontWeight: '800', color: COLORS.primary },
  photoUploadSubtext: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  imagePreviewWrapper: { width: '100%', height: '100%', position: 'relative' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removePhotoBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 2 },
  submitBtn: { marginTop: 30, backgroundColor: COLORS.primary },
});
