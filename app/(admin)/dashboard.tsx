import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useOfficial } from '@/providers/official-provider';

// Explore destinations — each goes to its own dedicated screen, no more complaint-explorer
const EXPLORE_ITEMS = [
  {
    route: '/(admin)/ward-wise',
    icon: 'map-outline'       as const,
    label: 'Ward Wise',
    sub:   'All 10 municipal wards',
    color: '#2563EB',
    bg:    '#DBEAFE',
    grad:  ['#EFF6FF', '#DBEAFE'] as const,
  },
  {
    route: '/(admin)/category-wise',
    icon: 'layers-outline'    as const,
    label: 'Category Wise',
    sub:   'By issue type',
    color: '#EA580C',
    bg:    '#FFEDD5',
    grad:  ['#FFF7ED', '#FFEDD5'] as const,
  },
  {
    route: '/(admin)/department-wise',
    icon: 'domain'            as const,
    label: 'Department Wise',
    sub:   'Resolution by dept.',
    color: '#7C3AED',
    bg:    '#EDE9FE',
    grad:  ['#F5F3FF', '#EDE9FE'] as const,
  },
  {
    route: '/(admin)/best-wards',
    icon: 'trophy-outline'    as const,
    label: 'Best Wards',
    sub:   'Performance ranking',
    color: '#F59E0B',
    bg:    '#FEF3C7',
    grad:  ['#FFFBEB', '#FEF3C7'] as const,
  },
];

const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
  Emergency: { bg: '#FEF2F2', text: '#DC2626' },
  High:      { bg: '#FFF7ED', text: '#EA580C' },
  Pinned:    { bg: '#EFF6FF', text: '#1E6FD9' },
  Normal:    { bg: '#F1F5F9', text: '#475569' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, complaints, announcements } = useOfficial();

  const total       = complaints.length;
  const pending     = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress  = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved    = complaints.filter((c) => c.status === 'Resolved').length;
  const escalated   = complaints.filter((c) => c.is_escalated).length;
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const STAT_CARDS = [
    { label: 'Pending',     value: pending,    color: '#F59E0B', icon: 'clock-alert-outline'  as const, grad: ['#FFF8ED','#FEF3C7'] as const },
    { label: 'In Progress', value: inProgress, color: '#2563EB', icon: 'progress-wrench'       as const, grad: ['#EFF6FF','#DBEAFE'] as const },
    { label: 'Resolved',    value: resolved,   color: '#10B981', icon: 'check-circle-outline'  as const, grad: ['#ECFDF5','#D1FAE5'] as const },
    { label: 'Escalated',   value: escalated,  color: '#DC2626', icon: 'alert-octagon-outline' as const, grad: ['#FEF2F2','#FEE2E2'] as const },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={require('@/assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.brandTitle}>SEVA SETU</Text>
            <Text style={styles.brandSub}>Malvan Municipal Council</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/(admin)/announcements' as any)}
            style={styles.headerBtn}
          >
            <MaterialCommunityIcons name="bell-outline" size={18} color={COLORS.primary} />
            {pending > 0 && <View style={styles.notifDot} />}
          </Pressable>
          <Pressable
            onPress={() => router.push('/(admin)/profile' as any)}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* ── Premium Hero Banner ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <LinearGradient colors={['#0B4F8A', '#1A6BB5', '#2E86DE']} style={styles.heroBanner}>
            {/* Background decorative circles */}
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />

            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <View style={styles.heroBadge}>
                  <MaterialCommunityIcons name="shield-crown-outline" size={12} color="#4FC3F7" />
                  <Text style={styles.heroBadgeText}>NAGARADHYAKSHA</Text>
                </View>
                <Text style={styles.heroGreeting}>नमस्कार,</Text>
                <Text style={styles.heroName} numberOfLines={1}>{profile.name}</Text>
                <Text style={styles.heroSub}>Malvan Municipal Council — All Wards</Text>
              </View>
              <View style={styles.heroRight}>
                <View style={styles.heroRateCircle}>
                  <Text style={styles.heroRateVal}>{successRate}%</Text>
                  <Text style={styles.heroRateLabel}>Success</Text>
                </View>
              </View>
            </View>

            {/* Quick stats strip */}
            <View style={styles.heroStrip}>
              <HeroStat label="Total" value={total} />
              <View style={styles.stripDivider} />
              <HeroStat label="Resolved" value={resolved} highlight />
              <View style={styles.stripDivider} />
              <HeroStat label="Pending" value={pending} warn />
              <View style={styles.stripDivider} />
              <HeroStat label="Escalated" value={escalated} danger />
            </View>

            <Pressable
              onPress={() => router.push('/(admin)/complaints' as any)}
              style={styles.heroViewAllBtn}
            >
              <Text style={styles.heroViewAllText}>View All Complaints</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color="#4FC3F7" />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ── Stats grid ── */}
        <View style={styles.section}>
          <SectionHeader title="Live City Stats" subtitle="Real-time municipal overview" />
          <View style={styles.statsGrid}>
            {STAT_CARDS.map((s, idx) => (
              <Animated.View
                key={s.label}
                entering={FadeInDown.duration(360).delay(80 + idx * 55)}
                style={styles.statWrap}
              >
                <Pressable onPress={() => router.push({ pathname: '/(admin)/complaints', params: { status: s.label === 'Pending' ? 'Pending' : s.label === 'In Progress' ? 'In Progress' : s.label === 'Resolved' ? 'Resolved' : undefined } } as any)}>
                  <LinearGradient colors={s.grad} style={[styles.statCard, { borderColor: `${s.color}22` }]}>
                    <View style={[styles.statIcon, { backgroundColor: `${s.color}18` }]}>
                      <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
                    </View>
                    <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLbl}>{s.label}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ── Explore section (replaces old complaint-explorer) ── */}
        <View style={styles.section}>
          <SectionHeader title="Explore Complaints" subtitle="Drill into city-wide data" />
          <View style={styles.exploreGrid}>
            {EXPLORE_ITEMS.map((item, idx) => (
              <Animated.View
                key={item.route}
                entering={FadeInRight.duration(340).delay(80 + idx * 60)}
                style={styles.exploreWrap}
              >
                <Pressable
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => [styles.exploreCard, pressed && { opacity: 0.88 }]}
                >
                  <LinearGradient colors={item.grad} style={styles.exploreCardGrad}>
                    <View style={[styles.exploreIcon, { backgroundColor: item.bg }]}>
                      <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                    </View>
                    <Text style={styles.exploreLabel}>{item.label}</Text>
                    <Text style={styles.exploreSub}>{item.sub}</Text>
                    <View style={[styles.exploreCta, { borderColor: `${item.color}30` }]}>
                      <Text style={[styles.exploreCtaText, { color: item.color }]}>View</Text>
                      <MaterialCommunityIcons name="arrow-right" size={11} color={item.color} />
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ── Latest Announcements ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Latest Announcements"
            actionLabel="View All"
            onAction={() => router.push('/(admin)/announcements' as any)}
          />
          {announcements.slice(0, 2).map((a, idx) => {
            const pc = PRIORITY_STYLE[a.priority] ?? PRIORITY_STYLE.Normal;
            return (
              <Animated.View key={a.id} entering={FadeInDown.duration(340).delay(80 + idx * 60)}>
                <View style={styles.annCard}>
                  <View style={[styles.annAccent, { backgroundColor: pc.text }]} />
                  <View style={styles.annInner}>
                    <View style={styles.annTopRow}>
                      <View style={[styles.annBadge, { backgroundColor: pc.bg }]}>
                        <Text style={[styles.annBadgeText, { color: pc.text }]}>{a.priority}</Text>
                      </View>
                      <Text style={styles.annDate}>{a.date}</Text>
                    </View>
                    <Text style={styles.annTitle}>{a.title}</Text>
                    <Text style={styles.annBody} numberOfLines={2}>{a.body}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Quick Actions ── */}
        <View style={[styles.section, { marginBottom: 28 }]}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.quickGrid}>
            <QuickAction icon="chart-bar"               label="Reports"     color="#2563EB" bg="#EFF6FF" onPress={() => router.push('/(admin)/reports'      as any)} />
            <QuickAction icon="chart-donut"             label="Analytics"   color="#7C3AED" bg="#EDE9FE" onPress={() => router.push('/(admin)/analytics'    as any)} />
            <QuickAction icon="domain"                  label="Departments" color="#0F766E" bg="#CCFBF1" onPress={() => router.push('/(admin)/departments'  as any)} />
            <QuickAction icon="account-group-outline"   label="Citizens"    color="#EA580C" bg="#FFEDD5" onPress={() => router.push('/(admin)/people'       as any)} />
            <QuickAction icon="cog-outline"             label="Settings"    color="#475569" bg="#F1F5F9" onPress={() => router.push('/(admin)/settings'     as any)} />
            <QuickAction icon="trophy-outline"          label="Best Wards"  color="#F59E0B" bg="#FEF3C7" onPress={() => router.push('/(admin)/best-wards'  as any)} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function HeroStat({ label, value, highlight, warn, danger }: {
  label: string; value: number;
  highlight?: boolean; warn?: boolean; danger?: boolean;
}) {
  const color = highlight ? '#4ADE80' : warn ? '#FCD34D' : danger ? '#FCA5A5' : 'rgba(255,255,255,0.85)';
  return (
    <View style={styles.heroStat}>
      <Text style={[styles.heroStatVal, { color }]}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle, actionLabel, onAction }: {
  title: string; subtitle?: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.linkText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function QuickAction({ icon, label, color, bg, onPress }: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string; color: string; bg: string; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.quickIcon, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logo: { width: 32, height: 32, borderRadius: 8 },
  brandTitle: { fontSize: 14, fontWeight: '900', color: COLORS.primary, letterSpacing: 0.8 },
  brandSub: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: COLORS.danger, borderWidth: 1.5, borderColor: COLORS.white,
  },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(124,58,237,0.3)',
  },
  avatarText: { fontSize: 14, fontWeight: '900', color: '#fff' },

  content: { paddingBottom: 44 },

  /* Hero */
  heroBanner: {
    margin: 16, borderRadius: 24, padding: 20,
    overflow: 'hidden', ...SHADOWS.medium,
  },
  heroCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -30,
  },
  heroCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: 10, left: -20,
  },
  heroContent: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  heroLeft: { flex: 1, gap: 4 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', backgroundColor: 'rgba(79,195,247,0.18)',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.35)', marginBottom: 4,
  },
  heroBadgeText: { fontSize: 9, fontWeight: '900', color: '#4FC3F7', letterSpacing: 0.8 },
  heroGreeting: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  heroName: { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroSub: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  heroRight: { marginLeft: 12 },
  heroRateCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroRateVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  heroRateLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.65)' },

  heroStrip: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 12, justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 18, fontWeight: '900' },
  heroStatLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  stripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  heroViewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroViewAllText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 15, color: COLORS.text },
  sectionSub: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, marginTop: 2 },
  linkText: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 2 },

  /* Stats grid */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statWrap: { width: '48%', flexGrow: 1 },
  statCard: { borderRadius: 18, padding: 14, borderWidth: 1, ...SHADOWS.soft },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statVal: { fontSize: 26, fontWeight: '900' },
  statLbl: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted, marginTop: 4 },

  /* Explore grid */
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  exploreWrap: { width: '48%', flexGrow: 1 },
  exploreCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.soft },
  exploreCardGrad: { padding: 14, gap: 6 },
  exploreIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  exploreLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  exploreSub: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },
  exploreCta: {
    flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start',
    marginTop: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  exploreCtaText: { fontSize: 10, fontWeight: '800' },

  /* Announcements */
  annCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
    marginBottom: 10, ...SHADOWS.soft,
  },
  annAccent: { width: 4 },
  annInner: { flex: 1, padding: 14, gap: 6 },
  annTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  annBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  annBadgeText: { fontSize: 10, fontWeight: '800' },
  annDate: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  annTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  annBody: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, lineHeight: 17 },

  /* Quick actions */
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: '30%', flexGrow: 1, alignItems: 'center', gap: 8, paddingVertical: 14,
    backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
});
