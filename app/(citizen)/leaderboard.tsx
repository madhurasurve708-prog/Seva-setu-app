import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { GlassCard } from '@/components/common/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

type WardRank = {
  rank: number;
  ward: string;
  repName: string;
  points: number;
  rate: string;
  status: 'Top' | 'Good' | 'Average';
};

const WARD_RANKS: WardRank[] = [
  { rank: 1, ward: 'Ward 3', repName: 'Shri. Sanjay Medhekar', points: 980, rate: '98.2%', status: 'Top' },
  { rank: 2, ward: 'Ward 5', repName: 'Shri. Vijay Wayarikar', points: 955, rate: '96.8%', status: 'Top' },
  { rank: 3, ward: 'Ward 8', repName: 'Shri. Mahesh Kaleshwarkar', points: 920, rate: '94.5%', status: 'Good' },
  { rank: 4, ward: 'Ward 1', repName: 'Shri. Rajesh Tendulkar', points: 890, rate: '92.1%', status: 'Good' },
  { rank: 5, ward: 'Ward 10', repName: 'Shri. Ramesh Sarjekotkar', points: 875, rate: '90.4%', status: 'Good' },
  { rank: 6, ward: 'Ward 2', repName: 'Smt. Snehal Naik', points: 840, rate: '88.5%', status: 'Average' },
  { rank: 7, ward: 'Ward 4', repName: 'Smt. Prachi Kumbhar', points: 820, rate: '86.1%', status: 'Average' },
  { rank: 8, ward: 'Ward 7', repName: 'Smt. Rasika Devbagkar', points: 790, rate: '84.0%', status: 'Average' },
  { rank: 9, ward: 'Ward 9', repName: 'Smt. Anjali Dhuri', points: 760, rate: '81.3%', status: 'Average' },
  { rank: 10, ward: 'Ward 6', repName: 'Shri. Nitin Acharekar', points: 710, rate: '77.8%', status: 'Average' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.medalCircle}>
        <MaterialCommunityIcons name="trophy" size={16} color={COLORS.white} />
      </LinearGradient>
    );
  }
  if (rank === 2) {
    return (
      <LinearGradient colors={['#94A3B8', '#64748B']} style={styles.medalCircle}>
        <MaterialCommunityIcons name="medal" size={16} color={COLORS.white} />
      </LinearGradient>
    );
  }
  if (rank === 3) {
    return (
      <LinearGradient colors={['#B45309', '#78350F']} style={styles.medalCircle}>
        <MaterialCommunityIcons name="medal-outline" size={16} color={COLORS.white} />
      </LinearGradient>
    );
  }
  return (
    <View style={styles.normalRankCircle}>
      <Text style={styles.normalRankText}>{rank}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  return (
    <CitizenScreen title="Ward Leaderboard">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Intro banner */}
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.introCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.introRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>Clean & Swift Ward rankings</Text>
              <Text style={styles.introBody}>
                Wards are ranked dynamically based on resolution rates, public cleanliness ratings, and feedback logs.
              </Text>
            </View>
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={48} color="rgba(79, 195, 247, 0.25)" />
          </View>
        </LinearGradient>

        {/* Header Row */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerLabel, { width: 50, textAlign: 'center' }]}>Rank</Text>
          <Text style={[styles.headerLabel, { flex: 1, paddingLeft: 8 }]}>Ward & Representative</Text>
          <Text style={[styles.headerLabel, { width: 80, textAlign: 'right' }]}>Res. Rate</Text>
        </View>

        {/* List of ranks */}
        <GlassCard style={styles.listCard}>
          {WARD_RANKS.map((item, idx) => {
            const isTop3 = item.rank <= 3;
            return (
              <View key={item.ward}>
                <View style={[styles.itemRow, isTop3 && styles.itemRowHighlight]}>
                  <View style={{ width: 50, alignItems: 'center' }}>
                    <RankBadge rank={item.rank} />
                  </View>

                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={styles.wardName}>{item.ward}</Text>
                    <Text style={styles.repName} numberOfLines={1}>{item.repName}</Text>
                  </View>

                  <View style={{ width: 80, alignItems: 'flex-end' }}>
                    <Text style={styles.rateText}>{item.rate}</Text>
                    <Text style={styles.pointsText}>{item.points} pts</Text>
                  </View>
                </View>
                {idx < WARD_RANKS.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </GlassCard>
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 110 },
  introCard: {
    padding: 18,
    borderRadius: 20,
    ...SHADOWS.hero,
    marginBottom: 20,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#4FC3F7',
  },
  introBody: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.76)',
    marginTop: 4,
    fontWeight: '500',
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  headerLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  itemRowHighlight: {
    backgroundColor: 'rgba(15, 23, 42, 0.01)',
  },
  medalCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  normalRankCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  normalRankText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  wardName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  repName: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  rateText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  pointsText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
