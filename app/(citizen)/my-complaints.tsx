// app/(citizen)/my-complaints.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { memo, useState, useEffect } from 'react';
import { CATEGORIES, STATUS_COLORS } from '@/constants/citizen';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '@/components/common/GlassCard';
import PrimaryButton from '@/components/common/PrimaryButton';

const MyComplaints = memo(function MyComplaints() {
  const router = useRouter();
  const { complaints, complaintsError, complaintsLoading, loadComplaints } = useCitizen();
  const { t } = useTranslation();
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    void loadComplaints().catch(() => {});
    const frame = requestAnimationFrame(() => {
      setShowList(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [loadComplaints]);

  return (
    <CitizenScreen title={t('myComplaints')}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {complaintsLoading && <Text style={styles.listHeading}>Loading complaints…</Text>}
        {complaintsError && <Text style={styles.emptyText}>{complaintsError}</Text>}
        {!showList ? (
          <Text style={styles.listHeading}>Loading...</Text>
        ) : complaints.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="folder-open-outline" size={48} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>{t('noComplaintsSubmitted')}</Text>
            <Text style={styles.emptyText}>
              {t('noComplaintsDesc')}
            </Text>
            <PrimaryButton
              label={t('reportFirstIssue')}
              onPress={() => router.push('/(citizen)/report-complaint')}
              style={styles.emptyBtn}
            />
          </Animated.View>
        ) : (
          <View>
            <Text style={styles.listHeading}>{t('activeGrievances')}</Text>
            {complaints.map((c, idx) => {
              const matchedCategory = CATEGORIES.find((cat) => cat.label === c.category);
              const categoryIcon = matchedCategory ? matchedCategory.icon : 'alert-circle-outline';
              const statusColor = STATUS_COLORS[c.status] || COLORS.textMuted;

              const formattedDate = new Date(c.submittedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <Animated.View key={c.id} entering={FadeInRight.duration(400).delay(idx * 80)}>
                  <Pressable
                    style={({ pressed }) => [styles.cardPress, pressed && styles.cardPressed]}
                    onPress={() =>
                      router.push({
                        pathname: '/(citizen)/complaint/[id]',
                        params: { id: c.id },
                      })
                    }
                  >
                    <GlassCard style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.idBadge}>
                          <Text style={styles.idText}>{c.id}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: `${statusColor}10`, borderColor: statusColor },
                          ]}
                        >
                          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {t(({ Pending: 'pending', 'In Progress': 'inProgress', Resolved: 'resolved', Escalated: 'escalated' } as Record<string, string>)[c.status] || c.status).toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardInfo}>
                        <View style={styles.categoryIconCircle}>
                          <MaterialCommunityIcons name={categoryIcon} size={20} color={COLORS.accent} />
                        </View>
                        <View style={styles.titleColumn}>
                          <Text style={styles.categoryLabel}>{t(({ Water: 'catWater', Garbage: 'catGarbage', 'Street Light': 'catStreetLight', Road: 'catRoad', Drainage: 'catDrainage', 'Stray Animals': 'catStrayAnimals', Tree: 'catTree', Other: 'catOther' } as Record<string, string>)[c.category] || c.category)}</Text>
                          <Text style={styles.complaintTitle} numberOfLines={1}>
                            {c.title}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.dateMeta}>
                          <MaterialCommunityIcons name="calendar" size={12} color={COLORS.textMuted} />
                          <Text style={styles.dateText}>{formattedDate}</Text>
                        </View>
                        <View style={styles.actionLink}>
                          <Text style={styles.actionLinkText}>{t('detailsLink')}</Text>
                          <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.accent} />
                        </View>
                      </View>
                    </GlassCard>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </CitizenScreen>
  );
});

export default MyComplaints;

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 16 },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.primary, textAlign: 'center' },
  emptyText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyBtn: { width: '100%', maxWidth: 260 },
  listHeading: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginBottom: 16 },
  cardPress: { marginBottom: 14 },
  cardPressed: { opacity: 0.95, transform: [{ scale: 0.98 }] },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  idText: { fontSize: 12, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  cardInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: { flex: 1 },
  categoryLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  complaintTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  actionLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionLinkText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
});
