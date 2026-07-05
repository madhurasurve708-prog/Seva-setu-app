// app/(tabs)/index.tsx
//
// SEVA SETU — Login Selection Screen
// Top half: Shivaji Maharaj hero image + overlay + branding.
// Bottom half: white rounded sheet with four role-based login cards.

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  navyDeep: '#071D30',
  navy: '#0A2A43',
  blue: '#1E6FD9',
  skyBlue: '#4FA3E3',
  saffron: '#F2994A',
  bg: '#F5F7FA',
  card: '#FFFFFF',
  textDark: '#101826',
  textMuted: '#5B6472',
  border: '#E7ECF2',
  white: '#FFFFFF',
};

type RoleCard = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route:
    | '/citizen-login'
    | '/nagarsevak-login'
    | '/department-login'
    | '/admin-login';
  tint: string;
};

const ROLE_CARDS: RoleCard[] = [
  {
    key: 'citizen',
    title: 'Citizen Login',
    subtitle: 'Report an issue in your ward',
    icon: 'account',
    route: '/citizen-login',
    tint: COLORS.blue,
  },
  {
    key: 'nagarsevak',
    title: 'Nagarsevak Login',
    subtitle: 'Ward representative access',
    icon: 'office-building',
    route: '/nagarsevak-login',
    tint: COLORS.navy,
  },
  {
    key: 'department',
    title: 'Department Login',
    subtitle: 'Track & resolve complaints',
    icon: 'domain',
    route: '/department-login',
    tint: COLORS.saffron,
  },
  {
    key: 'admin',
    title: 'Main Admin Login',
    subtitle: 'Nagaradhyaksha control panel',
    icon: 'shield-crown',
    route: '/admin-login',
    tint: COLORS.navyDeep,
  },
];

function RoleLoginCard({ card }: { card: RoleCard }) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(card.route as any)}
        style={styles.card}
        android_ripple={{ color: '#EEF2F7' }}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${card.tint}1A` }]}>
          <MaterialCommunityIcons name={card.icon} size={26} color={card.tint} />
        </View>

        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={COLORS.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function LoginSelectionScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top half — hero */}
      <ImageBackground
        source={require('../../assets/images/shivaji.png')}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
        <SafeAreaView style={styles.heroContent}>
          <View style={styles.logoRing}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>SEVA SETU</Text>
          <Text style={styles.heroSubtitle}>Report. Send. Solve.</Text>
        </SafeAreaView>
      </ImageBackground>

      {/* Bottom half — role cards */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetHeading}>Continue as</Text>
        <Text style={styles.sheetSubheading}>
          Choose your role to sign in to Seva Setu
        </Text>

        <ScrollView
          style={{ marginTop: 18 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {ROLE_CARDS.map((card) => (
            <RoleLoginCard key={card.key} card={card} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.navyDeep,
  },
  hero: {
    height: '42%',
    width,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,29,48,0.6)',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 46,
    height: 46,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2.5,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  sheetHeading: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sheetSubheading: {
    marginTop: 4,
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0A2A43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
});
