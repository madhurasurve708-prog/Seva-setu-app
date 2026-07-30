import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminShell } from '@/components/admin/admin-shell';
import GlassCard from '@/components/common/GlassCard';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';
import { useTranslation } from '@/providers/localization-provider';

export default function PeopleScreen() {
  const { t } = useTranslation();
  const { complaints } = useOfficial();
  const [blocked,  setBlocked]  = useState<string[]>([]);
  const [search,   setSearch]   = useState('');

  const citizens = Array.from(
    new Map(
      complaints.map((c) => [
        c.citizenPhone,
        {
          name:       c.citizenName,
          phone:      c.citizenPhone,
          ward:       c.ward,
          complaints: complaints.filter((x) => x.citizenPhone === c.citizenPhone).length,
        },
      ]),
    ).values(),
  ).filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.ward.toLowerCase().includes(search.toLowerCase()),
  );

  const moderate = (phone: string, name: string) => {
    const isBlocked = blocked.includes(phone);
    const opts: Alert['alert'] extends (title: string, message: string, buttons: infer B) => void ? B : never = [
      {
        text: t('issueWarning'),
        onPress: () => Alert.alert(t('warningIssued'), t('conductWarningMsg').replace('{name}', name)),
      },
      {
        text: isBlocked ? t('unblockUser') : t('blockUser'),
        style: isBlocked ? 'default' : 'destructive',
        onPress: () =>
          setBlocked((prev) =>
            prev.includes(phone) ? prev.filter((x) => x !== phone) : [...prev, phone],
          ),
      },
      { text: t('cancel'), style: 'cancel' },
    ];

    if (Platform.OS === 'web') {
      const action = window.confirm(t('moderateConfirmMsg').replace('{name}', name));
      if (action) {
        setBlocked((prev) =>
          prev.includes(phone) ? prev.filter((x) => x !== phone) : [...prev, phone],
        );
      }
      return;
    }

    Alert.alert(t('moderateTitle').replace('{name}', name), t('chooseActionMsg'), opts);
  };

  return (
    <AdminShell title={t('citizens')} showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
      >
        {/* Summary banner */}
        <GlassCard style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={[styles.bannerStat, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.bannerVal, { color: COLORS.primary }]}>{citizens.length}</Text>
              <Text style={styles.bannerLbl}>{t('totalCitizens')}</Text>
            </View>
            <View style={[styles.bannerStat, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.bannerVal, { color: COLORS.danger }]}>{blocked.length}</Text>
              <Text style={styles.bannerLbl}>{t('blockedLabel')}</Text>
            </View>
          </View>
          <Text style={styles.bannerNote}>
            {t('moderationAuditNote')}
          </Text>
        </GlassCard>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchByNameWard')}
            placeholderTextColor={COLORS.textPlaceholder}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Citizens list */}
        {citizens.map((c, idx) => {
          const isBlocked = blocked.includes(c.phone);
          return (
            <Animated.View key={c.phone} entering={FadeInDown.duration(320).delay(idx * 35)}>
              <View style={[styles.card, isBlocked && styles.cardBlocked]}>
                <View style={[styles.avatar, isBlocked && styles.avatarBlocked]}>
                  <Text style={[styles.avatarText, isBlocked && { color: COLORS.danger }]}>
                    {c.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{c.name}</Text>
                  <Text style={styles.cardMeta}>
                    {c.ward} · {t('complaintsCountSuffix').replace('{count}', String(c.complaints)).replace('{plural}', c.complaints !== 1 ? 's' : '')}
                  </Text>
                  {isBlocked && (
                    <View style={styles.blockedPill}>
                      <MaterialCommunityIcons name="block-helper" size={10} color={COLORS.danger} />
                      <Text style={styles.blockedText}>{t('blockedLabel')}</Text>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => moderate(c.phone, c.name)}
                  style={styles.moreBtn}
                  hitSlop={6}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={20} color={COLORS.primary} />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44, gap: 10 },
  banner: { padding: 16 },
  bannerRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  bannerStat: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  bannerVal: { fontSize: 22, fontWeight: '900' },
  bannerLbl: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginTop: 3 },
  bannerNote: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, lineHeight: 17 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  cardBlocked: { borderColor: '#FECACA', backgroundColor: '#FFFAFA' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  avatarBlocked: { backgroundColor: '#FEF2F2' },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  cardName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  cardMeta: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  blockedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, alignSelf: 'flex-start', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  blockedText: { fontSize: 10, fontWeight: '800', color: COLORS.danger },
  moreBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
});
