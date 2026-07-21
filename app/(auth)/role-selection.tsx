import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const { width } = Dimensions.get('window');
const gap = 12;
const cardWidth = (width - 48 - gap) / 2;

type RoleOption = {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  gradient: readonly [string, string];
  iconBg: string;
  iconColor: string;
};

const roles: RoleOption[] = [
  {
    title: 'Citizen Login',
    description: 'Report issues & track progress',
    icon: 'account-group-outline',
    route: '/(auth)/citizen-login',
    gradient: ['#FFFFFF', '#F8FAFC'] as const,
    iconBg: 'rgba(11, 79, 138, 0.08)',
    iconColor: '#0B4F8A',
  },
  {
    title: 'Nagarsevak Login',
    description: 'Representative governance portal',
    icon: 'account-tie-outline',
    route: '/(auth)/nagarsevak-login',
    gradient: ['#FFFFFF', '#F8FAFC'] as const,
    iconBg: 'rgba(16, 185, 129, 0.08)',
    iconColor: '#10B981',
  },
  {
    title: 'Department Login',
    description: 'Resolve assigned civic reports',
    icon: 'office-building-cog-outline',
    route: '/(auth)/department-login',
    gradient: ['#FFFFFF', '#F8FAFC'] as const,
    iconBg: 'rgba(245, 158, 11, 0.08)',
    iconColor: '#F59E0B',
  },
  {
    title: 'Admin Login',
    description: 'Municipal control & settings',
    icon: 'shield-crown-outline',
    route: '/(auth)/admin-login',
    gradient: ['#FFFFFF', '#F8FAFC'] as const,
    iconBg: 'rgba(239, 68, 68, 0.08)',
    iconColor: '#EF4444',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RoleGridCard({ role, index, onPress }: { role: RoleOption; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 14, stiffness: 350 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 350 });
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(500).delay(250 + index * 90)}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, animatedStyle]}
    >
      <LinearGradient colors={role.gradient} style={styles.cardGradient}>
        <View style={[styles.iconWrap, { backgroundColor: role.iconBg }]}>
          <MaterialCommunityIcons name={role.icon} size={28} color={role.iconColor} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {role.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {role.description}
        </Text>
        <View style={styles.arrowIcon}>
          <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.textMuted} />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <AuthHero title="Seva Setu" subtitle="Malvan Municipal Council" />

      <AuthSheet>
        <Animated.View entering={FadeInDown.duration(520).delay(150)} style={styles.welcomeCard}>
          <Text style={styles.heading}>Welcome to Malvan</Text>
          <Text style={styles.subheading}>Select your login profile to connect with municipal services.</Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <View style={styles.grid}>
            {roles.map((role, index) => (
              <RoleGridCard
                key={role.title}
                role={role}
                index={index}
                onPress={() => router.push(role.route as any)}
              />
            ))}
          </View>
        </ScrollView>
      </AuthSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.86)',
    ...SHADOWS.sm,
  },
  heading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  subheading: {
    ...TYPOGRAPHY.caption,
    marginTop: 3,
    color: COLORS.textMuted,
  },
  list: {
    paddingBottom: 34,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gap,
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    height: cardWidth * 1.08,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1.2,
    borderColor: 'rgba(226,232,240,0.9)',
    ...SHADOWS.card,
  },
  cardGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
  },
  cardDescription: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2,
    flex: 1,
  },
  arrowIcon: {
    alignSelf: 'flex-end',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
