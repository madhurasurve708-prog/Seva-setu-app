// app/(citizen)/ward.tsx
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import GlassCard from '@/components/common/GlassCard';
import { useCitizen } from '@/providers/citizen-provider';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

type Nagarsevak = {
  name: string;
  phone: string;
  address: string;
  party: string;
};

const WARD_REPS: Record<string, [Nagarsevak, Nagarsevak]> = {
  'Ward 1': [
    { name: 'Shri. Rajesh Tendulkar', phone: '9422070001', address: 'Bazaar Road, Malvan', party: 'Independent' },
    { name: 'Smt. Vaishali Parab', phone: '9422070011', address: 'Bazaar Road, Malvan', party: 'Independent' },
  ],
  'Ward 2': [
    { name: 'Smt. Snehal Naik', phone: '9422071112', address: 'Dandi Beach Area, Malvan', party: 'SHS' },
    { name: 'Shri. Umesh Golekar', phone: '9422071122', address: 'Dandi Beach Area, Malvan', party: 'SHS' },
  ],
  'Ward 3': [
    { name: 'Shri. Sanjay Medhekar', phone: '9422072223', address: 'Medha, Near Datta Mandir, Malvan', party: 'BJP' },
    { name: 'Smt. Kavita Rane', phone: '9422072233', address: 'Medha, Near Datta Mandir, Malvan', party: 'BJP' },
  ],
  'Ward 4': [
    { name: 'Smt. Prachi Kumbhar', phone: '9422073334', address: 'Kumbharmath Road, Malvan', party: 'SHS' },
    { name: 'Shri. Dattatray Sawant', phone: '9422073344', address: 'Kumbharmath Road, Malvan', party: 'SHS' },
  ],
  'Ward 5': [
    { name: 'Shri. Vijay Wayarikar', phone: '9422074445', address: 'Wayari Bazaar, Malvan', party: 'BJP' },
    { name: 'Smt. Neha Gawade', phone: '9422074455', address: 'Wayari Bazaar, Malvan', party: 'BJP' },
  ],
  'Ward 6': [
    { name: 'Shri. Nitin Acharekar', phone: '9422075556', address: 'Achara Road Junction, Malvan', party: 'INC' },
    { name: 'Smt. Pooja Kadam', phone: '9422075566', address: 'Achara Road Junction, Malvan', party: 'INC' },
  ],
  'Ward 7': [
    { name: 'Smt. Rasika Devbagkar', phone: '9422076667', address: 'Devbag Beach Road, Malvan', party: 'Independent' },
    { name: 'Shri. Suresh Bandekar', phone: '9422076677', address: 'Devbag Beach Road, Malvan', party: 'Independent' },
  ],
  'Ward 8': [
    { name: 'Shri. Mahesh Kaleshwarkar', phone: '9422077778', address: 'Kaleshwar Mandir Ward, Malvan', party: 'BJP' },
    { name: 'Smt. Trupti Fondekar', phone: '9422077788', address: 'Kaleshwar Mandir Ward, Malvan', party: 'BJP' },
  ],
  'Ward 9': [
    { name: 'Smt. Anjali Dhuri', phone: '9422078889', address: 'Dhuriwada, Malvan', party: 'INC' },
    { name: 'Shri. Prashant Katkar', phone: '9422078899', address: 'Dhuriwada, Malvan', party: 'INC' },
  ],
  'Ward 10': [
    { name: 'Shri. Ramesh Sarjekotkar', phone: '9422079990', address: 'Sarjekot Port Road, Malvan', party: 'BJP' },
    { name: 'Smt. Deepali Malvankar', phone: '9422079900', address: 'Sarjekot Port Road, Malvan', party: 'BJP' },
  ],
};

export default function WardScreen() {
  const { profile, complaints } = useCitizen();
  const { t } = useTranslation();

  const currentWard = useMemo(() => profile?.ward || 'Ward 3', [profile]);
  const reps = useMemo(() => WARD_REPS[currentWard] || WARD_REPS['Ward 3'], [currentWard]);

  const wardComplaints = useMemo(
    () => complaints.filter((c) => c.ward === currentWard),
    [complaints, currentWard],
  );

  const counts = useMemo(() => {
    const total = wardComplaints.length;
    const resolved = wardComplaints.filter((c) => c.status === 'Resolved').length;
    return {
      total,
      resolved,
      pct: total > 0 ? Math.round((resolved / total) * 100) : 100,
    };
  }, [wardComplaints]);

  return (
    <CitizenScreen title={t('myWardInfo')}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
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
              <Text style={styles.heroSub}>{profile?.locality || 'Malvan Municipal area'}</Text>
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
                <View style={styles.repPartyBadge}>
                  <Text style={styles.repPartyText}>{rep.party}</Text>
                </View>
              </View>
            </View>

            <View style={styles.repInfoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.repInfoText}>{rep.address}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 110 },

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
    marginBottom: 10,
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
  repPartyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  repPartyText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  repInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repInfoText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    flex: 1,
  },
});
