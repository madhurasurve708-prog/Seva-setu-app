// app/(auth)/role-selection.tsx
// Role / Login selection screen.
// Visual reference: 2-column card grid below a welcome card,
// inside a white rounded sheet overlapping the dark hero section.
import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import { useTranslation } from '@/providers/localization-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

// ── Dimensions ────────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const SIDE_PAD  = 20;   // horizontal padding on each side of the sheet
const COL_GAP   = 12;   // gap between the two columns
const CARD_W    = (width - SIDE_PAD * 2 - COL_GAP) / 2;

// ── Types ─────────────────────────────────────────────────────────────────────
type RoleOption = {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  iconBg: string;
  iconColor: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── RoleCard — single vertical card matching the reference image ──────────────
function RoleCard({
  role,
  index,
  onPress,
}: {
  role: RoleOption;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(460).delay(180 + index * 75)}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 360 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 360 });
      }}
      android_ripple={{ color: 'rgba(15,23,42,0.06)', borderless: false }}
      style={[styles.card, animStyle]}
    >
      {/* ── Icon box ── */}
      <View style={[styles.iconWrap, { backgroundColor: role.iconBg }]}>
        <MaterialCommunityIcons name={role.icon} size={22} color={role.iconColor} />
      </View>

      {/* ── Title ── */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {role.title}
      </Text>

      {/* ── Description — flex:1 pushes arrow row to bottom ── */}
      <Text style={styles.cardDesc} numberOfLines={3}>
        {role.description}
      </Text>

      {/* ── Arrow circle — bottom-right ── */}
      <View style={styles.arrowRow}>
        <View style={[styles.arrowCircle, { borderColor: `${role.iconColor}40` }]}>
          <MaterialCommunityIcons name="arrow-right" size={14} color={role.iconColor} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const roles: RoleOption[] = [
    {
      title: t('roleCitizen'),
      description: t('roleCitizenDesc'),
      icon: 'account-group-outline',
      route: '/citizen-login',
      iconBg: 'rgba(11, 79, 138, 0.10)',
      iconColor: '#0B4F8A',
    },
    {
      title: t('roleNagarsevak'),
      description: t('roleNagarsevakDesc'),
      icon: 'account-tie-outline',
      route: '/nagarsevak-login',
      iconBg: 'rgba(16, 185, 129, 0.10)',
      iconColor: '#10B981',
    },
    {
      title: t('roleDepartment'),
      description: t('roleDepartmentDesc'),
      icon: 'office-building-cog-outline',
      route: '/department-login',
      iconBg: 'rgba(245, 158, 11, 0.10)',
      iconColor: '#F59E0B',
    },
    {
      title: t('roleAdmin'),
      description: t('roleAdminDesc'),
      icon: 'shield-crown-outline',
      route: '/admin-login',
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#EF4444',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Hero: background image + logo + title + subtitle + slogan ── */}
      <AuthHero title="Seva Setu" subtitle="Malvan Municipal Council" />

      {/* ── White rounded sheet overlapping the hero bottom ── */}
      <AuthSheet>
        {/* Welcome card */}
        <Animated.View
          entering={FadeInDown.duration(480).delay(120)}
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeTitle}>{t('welcomeMalvan')}</Text>
          <Text style={styles.welcomeSub}>{t('roleSelectHint')}</Text>
        </Animated.View>

        {/* 2×2 card grid — scrollable only when screen is too short */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
          contentContainerStyle={styles.gridWrap}
        >
          <View style={styles.grid}>
            {roles.map((role, idx) => (
              <RoleCard
                key={role.route}
                role={role}
                index={idx}
                onPress={() => router.push(role.route as any)}
              />
            ))}
          </View>
        </ScrollView>
      </AuthSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061422', // matches hero dark background
  },

  // ── Welcome card ─────────────────────────────────────────────────────────
  welcomeCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(220,230,240,0.8)',
    ...SHADOWS.soft,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 3,
  },
  welcomeSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 17,
  },

  // ── Grid wrapper ──────────────────────────────────────────────────────────
  gridWrap: {
    paddingBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
  },

  // ── Individual card ───────────────────────────────────────────────────────
  card: {
    width: CARD_W,
    minHeight: 128,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(220,230,240,0.8)',
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    ...SHADOWS.soft,
  },

  // Icon rounded-square
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  // Bold title — max 2 lines, never clips
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 3,
  },

  // Muted description — flex:1 fills remaining space and pushes arrow down
  cardDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 15,
    flex: 1,
  },

  // Arrow row — aligns circle to the right
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    backgroundColor: 'rgba(15,23,42,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});