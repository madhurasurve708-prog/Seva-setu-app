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
    if (hour < 12) return { label: 'Good Morning', icon: 'sunny-outline' as const };
    if (hour < 17) return { label: 'Good Afternoon', icon: 'sunny' as const };
    return { label: 'Good Evening', icon: 'moon-outline' as const };
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
      {/* Hero image — full bleed, no clipping */}
      <View style={styles.bannerCard}>
        <ImageBackground
          source={require('@/assets/images/hero_banner.png')}
          style={styles.imageBackground}
          contentFit="cover"
          contentPosition="center"
        >
          {/* Dark gradient overlay — left-to-right + slight bottom fade */}
          <LinearGradient
            colors={[
              'rgba(5, 20, 35, 0.93)',
              'rgba(11, 79, 138, 0.72)',
              'rgba(16, 185, 129, 0.28)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Content sits on top of overlay */}
          <View style={styles.overlay}>
            <View style={styles.greetingRow}>
              <Ionicons name={greeting.icon} size={14} color="#4FC3F7" />
              <Text style={styles.greetingText}>{greeting.label},</Text>
            </View>

            <Text style={styles.nameText} numberOfLines={1}>
              {name}
            </Text>

            <Text style={styles.roleText}>
              {designation || 'Nagarsevak (Ward Representative)'}
            </Text>

            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Ionicons name="location-outline" size={12} color="#4FC3F7" />
                <Text style={styles.chipText}>{wardLabel}</Text>
              </View>
              {department ? (
                <View style={styles.chipSecondary}>
                  <Ionicons name="business-outline" size={12} color={COLORS.white} />
                  <Text style={styles.chipText}>{department}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Floating stats card — overlaps hero bottom */}
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
          <Text style={styles.statVal}>
            {typeof successRate === 'number' ? `${successRate}%` : successRate}
          </Text>
          <Text style={styles.statLbl}>Success</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 28,
  },
  bannerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.hero,
  },
  imageBackground: {
    width: '100%',
    height: 210,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
    justifyContent: 'flex-end',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  greetingText: {
    color: '#4FC3F7',
    fontSize: 13,
    fontWeight: '700',
  },
  nameText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  roleText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(79,195,247,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    marginTop: -22,
    marginHorizontal: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    flexDirection: 'row',
    paddingVertical: 16,
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
    marginTop: 3,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
});
