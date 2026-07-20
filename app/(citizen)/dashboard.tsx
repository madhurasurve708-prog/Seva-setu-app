// app/(citizen)/dashboard.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  View,
  Linking,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { ANNOUNCEMENTS, CATEGORIES, STATUS_COLORS } from '@/constants/citizen';
import { CitizenScreen } from '@/components/citizen/CitizenScreen';
import { useCitizen } from '@/providers/citizen-provider';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const STAT_CARD_W = (width - 18 * 2 - 10) / 2;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: 'weather-sunset-up' as const };
  if (hour < 17) return { text: 'Good Afternoon', icon: 'weather-sunny' as const };
  return { text: 'Good Evening', icon: 'weather-night' as const };
}

export default function Dashboard() {
  const router = useRouter();
  const { complaints, profile } = useCitizen();

  const greeting = useMemo(() => getGreeting(), []);

  const displayFirstName = useMemo(() => {
    if (profile?.firstName) return profile.firstName;
    if (profile?.fullName) return profile.fullName.split(' ')[0];
    return 'Citizen';
  }, [profile]);

  const avatarInitial = useMemo(
    () => (displayFirstName ? displayFirstName.charAt(0).toUpperCase() : 'C'),
    [displayFirstName],
  );

  const wardLocalityText = useMemo(() => {
    const ward = profile?.ward || 'General Ward';
    const locality = profile?.locality || 'Malvan';
    return `${ward} • ${locality}`;
  }, [profile]);

  const counts = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((x) => x.status === 'Pending').length,
      progress: complaints.filter((x) => x.status === 'In Progress').length,
      resolved: complaints.filter((x) => x.status === 'Resolved').length,
    }),
    [complaints],
  );

  const resolvedPct = counts.total > 0 ? Math.round((counts.resolved / counts.total) * 100) : 0;

  const dateStr = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(),
      ),
    [],
  );

  const recentComplaints = useMemo(() => complaints.slice(0, 3), [complaints]);

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  return (
    <CitizenScreen title="Seva Setu" hideHeader>
      {/* ---------------- BRANDED HEADER ---------------- */}
      <View style={styles.brandedHeader}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/images/logo.jpeg')} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerTitle}>SEVA SETU</Text>
            <Text style={styles.headerSubtitle}>Malvan Municipal Council</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/(citizen)/profile')} style={styles.headerAvatarWrap}>
          {profile?.avatar || profile?.profileImage ? (
            <Image source={{ uri: profile.avatar || profile.profileImage }} style={styles.headerAvatarImg} />
          ) : (
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarTxt}>{avatarInitial}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* ---------------- HERO BANNER ---------------- */}
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={require('../../assets/images/hero_banner.png')}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
            resizeMode="cover"
          >
            {/* Dark Blue Overlay */}
            <LinearGradient
              colors={['rgba(8, 27, 43, 0.88)', 'rgba(11, 79, 138, 0.68)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <Animated.View entering={FadeInUp.duration(500).delay(60)} style={styles.heroContent}>
              <View style={styles.greetRow}>
                <MaterialCommunityIcons name={greeting.icon} size={15} color="#4FC3F7" />
                <Text style={styles.greetText}>{greeting.text},</Text>
              </View>
              <Text style={styles.heroName} numberOfLines={1}>
                {displayFirstName}
              </Text>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroWardChip}>
                  <MaterialCommunityIcons name="map-marker" size={11} color="#4FC3F7" />
                  <Text style={styles.heroWardText}>{wardLocalityText}</Text>
                </View>
              </View>
              <Text style={styles.heroDate}>{dateStr}</Text>
            </Animated.View>
          </ImageBackground>
        </View>

        {/* ---------------- STATS FLOAT CARD ---------------- */}
        <Animated.View entering={FadeInUp.duration(500).delay(140)} style={styles.statsCardWrapper}>
          <View style={styles.statsCardInner}>
            <View style={styles.heroStatBlock}>
              <Text style={styles.heroStatValue}>{counts.total}</Text>
              <Text style={styles.heroStatLabel}>Filed</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatBlock}>
              <Text style={styles.heroStatValue}>{counts.resolved}</Text>
              <Text style={styles.heroStatLabel}>Resolved</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatBlock}>
              <Text style={styles.heroStatValue}>{resolvedPct}%</Text>
              <Text style={styles.heroStatLabel}>Success rate</Text>
            </View>
          </View>
        </Animated.View>

        {/* ---------------- STATS ---------------- */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Complaint statistics</Text>
          <View style={styles.statsGrid}>
            {[
              {
                label: 'Pending',
                sub: 'Awaiting action',
                value: counts.pending,
                colors: ['#FFF3E0', '#FFE0B2'] as const,
                iconColor: '#F59E0B',
                icon: 'clock-outline' as const,
              },
              {
                label: 'In progress',
                sub: 'Being resolved',
                value: counts.progress,
                colors: ['#E3F2FD', '#BBDEFB'] as const,
                iconColor: '#2E86DE',
                icon: 'progress-wrench' as const,
              },
              {
                label: 'Resolved',
                sub: 'Task completed',
                value: counts.resolved,
                colors: ['#E8F5E9', '#C8E6C9'] as const,
                iconColor: '#10B981',
                icon: 'check-circle-outline' as const,
              },
              {
                label: 'Success rate',
                sub: 'Overall record',
                value: `${resolvedPct}%`,
                colors: ['#EDE7F6', '#D1C4E9'] as const,
                iconColor: '#7C4DFF',
                icon: 'chart-donut' as const,
              },
            ].map((item, idx) => (
              <Animated.View
                key={item.label}
                entering={FadeInDown.duration(400).delay(80 + idx * 60)}
                style={styles.statCardWrap}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <View style={styles.statIconCircle}>
                    <MaterialCommunityIcons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <Text style={[styles.statValue, { color: item.iconColor }]}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statSub}>{item.sub}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ---------------- RECENT COMPLAINTS ---------------- */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Recent complaints</Text>
            {complaints.length > 0 && (
              <Pressable onPress={() => router.push('/(citizen)/my-complaints')} hitSlop={8}>
                <Text style={styles.viewMoreLink}>View all</Text>
              </Pressable>
            )}
          </View>

          {recentComplaints.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={26} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No complaints filed yet</Text>
            </View>
          ) : (
            recentComplaints.map((c, idx) => {
              const matched = CATEGORIES.find((cat) => cat.label === c.category);
              const icon = matched ? matched.icon : 'alert-circle-outline';
              const statusColor = STATUS_COLORS[c.status] || COLORS.textMuted;
              const dateFmt = new Date(c.submittedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              });
              return (
                <Animated.View key={c.id} entering={FadeInRight.duration(400).delay(120 + idx * 70)}>
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: '/(citizen)/complaint/[id]', params: { id: c.id } })
                    }
                    style={({ pressed }) => [styles.complaintCard, pressed && { opacity: 0.9 }]}
                  >
                    <View style={styles.complaintIconCircle}>
                      <MaterialCommunityIcons name={icon} size={19} color={COLORS.primaryLight} />
                    </View>
                    <View style={styles.complaintBody}>
                      <Text style={styles.complaintTitle} numberOfLines={1}>{c.title}</Text>
                      <View style={styles.complaintMetaRow}>
                        <Text style={styles.complaintCategory}>{c.category}</Text>
                        <Text style={styles.complaintDot}>•</Text>
                        <Text style={styles.complaintDate}>{dateFmt}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusChip,
                        { backgroundColor: `${statusColor}16`, borderColor: statusColor },
                      ]}
                    >
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusChipText, { color: statusColor }]}>{c.status}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          )}
        </View>

        {/* ---------------- WARD INFO ---------------- */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Ward information</Text>
          <LinearGradient
            colors={['#0B4F8A', '#1A6BB5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wardCard}
          >
            <View style={styles.wardTopRow}>
              <View style={styles.wardIconCircle}>
                <MaterialCommunityIcons name="office-building-marker-outline" size={22} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.wardName}>{profile?.ward || 'General Ward'}</Text>
                <Text style={styles.wardLocality}>
                  {profile?.locality || 'Malvan'}, Malvan Municipal Council
                </Text>
              </View>
            </View>
            <View style={styles.wardStatsRow}>
              <View style={styles.wardStatItem}>
                <MaterialCommunityIcons name="account-tie-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={styles.wardStatText}>Nagarsevak Office</Text>
              </View>
              <View style={styles.wardStatDividerV} />
              <View style={styles.wardStatItem}>
                <MaterialCommunityIcons name="account-group-outline" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={styles.wardStatText}>~12,400 residents</Text>
              </View>
            </View>
            <View style={styles.wardProgressTrack}>
              <View style={[styles.wardProgressFill, { width: `${resolvedPct}%` }]} />
            </View>
            <Text style={styles.wardProgressLabel}>{resolvedPct}% of ward issues resolved</Text>
          </LinearGradient>
        </View>

        {/* ---------------- ANNOUNCEMENTS ---------------- */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Latest announcements</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.announceScroll}
          >
            {ANNOUNCEMENTS.slice(0, 4).map((a, idx) => (
              <Animated.View key={a.id} entering={FadeInRight.duration(400).delay(idx * 70)}>
                <Pressable
                  onPress={() => router.push('/(citizen)/announcements')}
                  style={({ pressed }) => [styles.announceCard, pressed && { opacity: 0.92 }]}
                >
                  <LinearGradient
                    colors={a.priority ? ['#FFF3E0', '#FFE0B2'] : ['#E3F2FD', '#BBDEFB']}
                    style={styles.announceBadgeRow}
                  >
                    <MaterialCommunityIcons
                      name={a.priority ? 'pin' : 'bullhorn-outline'}
                      size={12}
                      color={a.priority ? '#F59E0B' : '#2E86DE'}
                    />
                    <Text style={[styles.announceBadgeText, { color: a.priority ? '#F59E0B' : '#2E86DE' }]}>
                      {a.priority || 'Notice'}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.announceTitle} numberOfLines={2}>{a.title}</Text>
                  <Text style={styles.announceBody} numberOfLines={3}>{a.body}</Text>
                  <Text style={styles.announceDate}>{a.date}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* ---------------- EMERGENCY CONTACTS ---------------- */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Emergency contacts</Text>
          <View style={styles.emergencyGrid}>
            {[
              { label: 'Police', phone: '112', icon: 'shield-outline', colors: ['#E3F2FD', '#BBDEFB'], iconColor: '#2E86DE' },
              { label: 'Fire', phone: '101', icon: 'fire', colors: ['#FFEBEE', '#FFCDD2'], iconColor: '#EF4444' },
              { label: 'Hospital', phone: '108', icon: 'hospital-box-outline', colors: ['#E8F5E9', '#C8E6C9'], iconColor: '#10B981' },
              { label: 'Municipality', phone: '02365-252018', icon: 'phone-classic', colors: ['#EDE7F6', '#D1C4E9'], iconColor: '#7C4DFF' },
            ].map((item, idx) => (
              <Animated.View
                key={item.label}
                entering={FadeInDown.duration(400).delay(80 + idx * 50)}
                style={styles.emergencyCardWrap}
              >
                <Pressable
                  onPress={() => handleCall(item.phone)}
                  style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
                >
                  <LinearGradient
                    colors={item.colors as any}
                    style={styles.emergencyCard}
                  >
                    <View style={styles.emergencyIconCircle}>
                      <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                    </View>
                    <Text style={styles.emergencyLabel}>{item.label}</Text>
                    <Text style={[styles.emergencyPhone, { color: item.iconColor }]}>{item.phone}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </CitizenScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 130,
  },

  // Branded Header Styles
  brandedHeader: {
    height: 64,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    marginTop: Platform.OS === 'android' ? 32 : 0, // safe area spacing on android
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 38,
    height: 38,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  headerAvatarWrap: {
    borderRadius: 18,
  },
  headerAvatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 79, 138, 0.15)',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarTxt: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },

  // Hero Wrapper Styles
  heroWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.hero,
  },
  heroBanner: {
    width: '100%',
    height: 160,
  },
  heroBannerImage: {
    borderRadius: 24,
  },
  heroContent: {
    flex: 1,
    padding: 18,
    paddingBottom: 34,
    justifyContent: 'center',
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetText: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  heroMetaRow: {
    marginTop: 8,
  },
  heroWardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroWardText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  heroDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 8,
  },

  // Stats Floating Card Styles
  statsCardWrapper: {
    marginHorizontal: 16,
    marginTop: -26,
    zIndex: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...SHADOWS.md,
  },
  statsCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  heroStatBlock: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  heroStatLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },

  // Sections
  sectionBlock: {
    paddingHorizontal: 18,
    marginTop: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontSize: 15.5,
    marginBottom: 12,
  },
  viewMoreLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.accent,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCardWrap: {
    width: STAT_CARD_W,
  },
  statCard: {
    borderRadius: 20,
    padding: 14,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
    marginTop: 6,
  },
  statSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  // Recent complaints
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  complaintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 10,
    gap: 12,
    ...SHADOWS.soft,
  },
  complaintIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(46,134,222,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintBody: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.text,
  },
  complaintMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  complaintCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  complaintDot: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  complaintDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 9,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // Ward card
  wardCard: {
    borderRadius: 22,
    padding: 18,
    ...SHADOWS.medium,
  },
  wardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wardIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardName: {
    color: COLORS.white,
    fontSize: 16.5,
    fontWeight: '900',
  },
  wardLocality: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  wardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  wardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  wardStatText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10.5,
    fontWeight: '600',
  },
  wardStatDividerV: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  wardProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 16,
    overflow: 'hidden',
  },
  wardProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4FC3F7',
  },
  wardProgressLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 8,
  },

  // Announcements
  announceScroll: {
    gap: 12,
    paddingRight: 6,
  },
  announceCard: {
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    ...SHADOWS.soft,
  },
  announceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  announceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  announceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 18,
  },
  announceBody: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 16,
    fontWeight: '500',
  },
  announceDate: {
    fontSize: 10,
    color: COLORS.textPlaceholder,
    marginTop: 10,
    fontWeight: '600',
  },

  // Emergency
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emergencyCardWrap: {
    width: STAT_CARD_W,
  },
  emergencyCard: {
    borderRadius: 20,
    padding: 14,
    alignItems: 'flex-start',
  },
  emergencyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emergencyLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  emergencyPhone: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
});
