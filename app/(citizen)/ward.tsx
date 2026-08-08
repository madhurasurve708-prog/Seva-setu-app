// app/(citizen)/ward.tsx
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { GlassCard } from '@/components/common/GlassCard';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

type Nagarsevak = {
  name: string;
};

const WARD_REPS: Record<string, [Nagarsevak, Nagarsevak]> = {
  'Ward 1': [
    { name: 'Shri. Rajesh Tendulkar' },
    { name: 'Smt. Vaishali Parab' },
  ],
  'Ward 2': [
    { name: 'Smt. Snehal Naik' },
    { name: 'Shri. Umesh Golekar' },
  ],
  'Ward 3': [
    { name: 'Shri. Sanjay Medhekar' },
    { name: 'Smt. Kavita Rane' },
  ],
  'Ward 4': [
    { name: 'Smt. Prachi Kumbhar' },
    { name: 'Shri. Dattatray Sawant' },
  ],
  'Ward 5': [
    { name: 'Shri. Vijay Wayarikar' },
    { name: 'Smt. Neha Gawade' },
  ],
  'Ward 6': [
    { name: 'Shri. Nitin Acharekar' },
    { name: 'Smt. Pooja Kadam' },
  ],
  'Ward 7': [
    { name: 'Smt. Rasika Devbagkar' },
    { name: 'Shri. Suresh Bandekar' },
  ],
  'Ward 8': [
    { name: 'Shri. Mahesh Kaleshwarkar' },
    { name: 'Smt. Trupti Fondekar' },
  ],
  'Ward 9': [
    { name: 'Smt. Anjali Dhuri' },
    { name: 'Shri. Prashant Katkar' },
  ],
  'Ward 10': [
    { name: 'Shri. Ramesh Sarjekotkar' },
    { name: 'Smt. Deepali Malvankar' },
  ],
};

export default function WardScreen() {
  const { profile, complaints } = useCitizen();
  const { t } = useTranslation();

  const currentWard = useMemo(() => profile?.ward, [profile]);
  const reps = useMemo(() => currentWard ? WARD_REPS[currentWard] : [], [currentWard]);

  const wardComplaints = useMemo(
    () => currentWard ? complaints.filter((c) => c.ward === currentWard) : [],
    [complaints, currentWard],
  );

  const counts = useMemo(() => {
    if (!currentWard) return { total: 0, resolved: 0, pct: 0 };
    const total = wardComplaints.length;
    const resolved = wardComplaints.filter((c) => c.status === 'Resolved').length;
    return {
      total,
      resolved,
      pct: total > 0 ? Math.round((resolved / total) * 100) : 100,
    };
  }, [wardComplaints, currentWard]);

  return (
    <CitizenScreen title={t('myWardInfo')}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {!currentWard ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-alert-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyStateTitle}>Ward Information Unavailable</Text>
            <Text style={styles.emptyStateText}>Please complete your profile to view ward information.</Text>
          </View>
        ) : (
          <>
        {/* ── Hero card ── */}
        <LinearGradient
          colors={['#0B4F8A', '#2E86DE']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroLabel}>{t('officialDemographicsLabel')}</Text>
              <Text style={styles.heroTitle}>{currentWard}</Text>
            </View>
            <View style={styles.heroIconBadge}>
              <MaterialCommunityIcons name="office-building-marker" size={40} color="rgba(255,255,255,0.22)" />
            </View>
          </View>

          <View style={styles.heroProgressTrack}>
            <View style={[styles.heroProgressFill, { width: `${counts.pct}%` as any }]} />
          </View>
          <Text style={styles.heroProgressLabel}>{counts.pct}{t('issuesResolvedLabel')}</Text>
        </LinearGradient>

        {/* ── Ward stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{counts.total}</Text>
            <Text style={styles.statLabel}>{t('pending2')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{counts.resolved}</Text>
            <Text style={styles.statLabel}>{t('resolved2')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{counts.pct}%</Text>
            <Text style={styles.statLabel}>{t('successRateShort')}</Text>
          </View>
        </View>

        {/* ── Representatives ── */}
        <Text style={styles.sectionLabel}>{t('wardRepsTitle')}</Text>

        {reps.map((rep, idx) => (
          <GlassCard
            key={rep.name}
            style={{ ...styles.repCard, ...(idx > 0 ? styles.repCardSpacing : {}) }}
          >
            <View style={styles.repHeaderRow}>
              <View style={styles.repAvatar}>
                <MaterialCommunityIcons name="account-tie" size={32} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.repName}>{rep.name}</Text>
              </View>
            </View>
          </GlassCard>
        ))}
        </>
        )}
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 110 },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },

  /* Hero gradient card */
  heroCard: {
    padding: 20,
    borderRadius: 24,
    ...SHADOWS.hero,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextCol: { flex: 1 },
  heroLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  heroIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 20,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#4FC3F7',
  },
  heroProgressLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    marginTop: 6,
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.soft,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },

  /* Section */
  sectionLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: 10,
    fontWeight: '800',
  },

  /* Rep cards */
  repCard: { padding: 16 },
  repCardSpacing: { marginTop: 14 },
  repHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(11, 79, 138, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.text,
  },
});
