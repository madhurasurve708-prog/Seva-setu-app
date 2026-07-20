import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOWS } from '@/constants/theme';

interface HeroBannerProps {
  name: string;
  wardLabel: string;
  designation?: string;
  department?: string;
  onViewComplaints: () => void;
  filedCount?: number;
  resolvedCount?: number;
  successRate?: number | string;
}

export default function HeroBanner({
  name,
  wardLabel,
  designation,
  department,
  onViewComplaints,
  filedCount = 0,
  resolvedCount = 0,
  successRate = '0%',
}: HeroBannerProps) {
  const [currentDate, setCurrentDate] = useState('');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { label: 'Good Morning', icon: 'weather-sunset-up' as const };
    }
    if (hour < 17) {
      return { label: 'Good Afternoon', icon: 'weather-sunny' as const };
    }
    return { label: 'Good Evening', icon: 'weather-night' as const };
  }, []);

  useEffect(() => {
    const dateText = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    setCurrentDate(dateText);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/hero_banner.png')}
        style={styles.cardContainer}
        imageStyle={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(8, 27, 43, 0.92)', 'rgba(11, 79, 138, 0.70)', 'rgba(16, 185, 129, 0.36)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.overlay}>
          <View style={styles.greetingRow}>
            <Ionicons name={greeting.icon as any} size={15} color="#4FC3F7" />
            <Text style={styles.greetingText}>{greeting.label},</Text>
          </View>

          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.roleText}>{designation || 'Nagarsevak • Ward Representative'}</Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Ionicons name="map-marker" size={12} color="#4FC3F7" />
              <Text style={styles.chipText}>{wardLabel}</Text>
            </View>
            {department ? (
              <View style={styles.chipSecondary}>
                <Ionicons name="business-outline" size={12} color={COLORS.white} />
                <Text style={styles.chipSecondaryText}>{department}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
      </ImageBackground>

      <Pressable onPress={onViewComplaints} style={styles.statsCard}>
        <View style={styles.statColumn}>
          <Text style={styles.statVal}>{filedCount}</Text>
          <Text style={styles.statLbl}>Filed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statColumn}>
          <Text style={styles.statVal}>{resolvedCount}</Text>
          <Text style={styles.statLbl}>Resolved</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statColumn}>
          <Text style={styles.statVal}>{typeof successRate === 'number' ? `${successRate}%` : successRate}</Text>
          <Text style={styles.statLbl}>Success</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 24,
  },
  cardContainer: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  heroImage: {
    borderRadius: 24,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
    justifyContent: 'flex-end',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingText: {
    color: '#4FC3F7',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  nameText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    marginLeft: 4,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  chipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(79, 195, 247, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSecondaryText: {
    marginLeft: 4,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    marginTop: -20,
    marginHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.card,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLbl: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
});