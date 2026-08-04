// app/(citizen)/announcements.tsx
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { GlassCard } from '@/components/common/GlassCard';
import { getCitizenAnnouncements, type CitizenApiAnnouncement } from '@/services/citizen-api';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export default function Announcements() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<CitizenApiAnnouncement[]>([]);

  useEffect(() => { void getCitizenAnnouncements().then(setAnnouncements).catch(() => setAnnouncements([])); }, []);

  return (
    <CitizenScreen title={t('announcementsTitle')}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.sectionTitle}>{t('municipalNotifications')}</Text>

        {announcements.map((a, idx) => (
          <Animated.View key={a.id} entering={FadeInLeft.duration(400).delay(idx * 80)}>
            <GlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                {a.priority ? (
                  <View style={styles.pinnedBadge}>
                    <MaterialCommunityIcons name="pin" size={11} color={COLORS.warning} />
                  <Text style={styles.pinnedText}>{a.priority}</Text>
                  </View>
                ) : (
                  <View style={styles.infoBadge}>
                    <MaterialCommunityIcons name="bell-ring-outline" size={11} color={COLORS.accent} />
                    <Text style={styles.infoBadgeText}>{t('noticeLabel')}</Text>
                  </View>
                )}
                <View style={styles.dateBadge}>
                  <MaterialCommunityIcons name="calendar" size={11} color={COLORS.textMuted} />
                  <Text style={styles.dateText}>{new Date(a.created_at).toLocaleDateString()}</Text>
                </View>
              </View>

              <Text style={styles.title}>{a.title}</Text>
              <View style={styles.divider} />
              <Text style={styles.body}>{a.description}</Text>
            </GlassCard>
          </Animated.View>
        ))}
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 120 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginBottom: 16 },
  card: { padding: 16, marginBottom: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.warning,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  pinnedText: { color: COLORS.warning, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.2 },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  infoBadgeText: { color: COLORS.accent, fontSize: 10.5, fontWeight: '800' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11.5, color: COLORS.textMuted, fontWeight: '600' },
  title: { ...TYPOGRAPHY.bodyBold, color: COLORS.primary, fontSize: 15.5, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  body: { fontSize: 13, color: COLORS.textMuted, lineHeight: 19, fontWeight: '500' },
});
