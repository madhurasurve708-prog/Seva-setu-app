// app/(tabs)/splash.tsx
//
// SEVA SETU — Splash Screen
// Full-bleed Shivaji Maharaj hero image, dark overlay, logo mark, animated
// fade + settle-zoom entrance, then auto-navigates to the Login Selection
// screen (app/(tabs)/index.tsx).
//
// NOTE: This file lives inside the (tabs) route group as requested. If your
// (tabs)/_layout.tsx renders a visible tab bar, you'll likely want to hide it
// for "splash" (and "index") via screenOptions, or move splash/login outside
// the tabs group into the root stack — that's a navigation-structure decision
// for you to make in _layout.tsx, which this task intentionally leaves alone.

import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  navyDeep: '#071D30',
  navy: '#0A2A43',
  blue: '#1E6FD9',
  white: '#FFFFFF',
  whiteMuted: 'rgba(255,255,255,0.82)',
  saffron: '#F2994A',
};

const ANIMATION_DURATION = 1400; // fade + zoom
const HOLD_BEFORE_NAV = 700; // brief hold once settled
const TOTAL_SPLASH_TIME = ANIMATION_DURATION + HOLD_BEFORE_NAV;

export default function SplashScreen() {
  const router = useRouter();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1.12)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslate, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/');
    }, TOTAL_SPLASH_TIME);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity, transform: [{ scale }] },
        ]}
      >
        <ImageBackground
          source={require('../../assets/images/shivaji.png')}
          style={styles.bg}
          resizeMode="cover"
        >
          {/* Dark overlay for text legibility */}
          <View style={styles.overlayTop} />
          <View style={styles.overlayBottom} />

          <SafeAreaView style={styles.content}>
            <View style={styles.spacer} />

            <Animated.View
              style={[
                styles.centerBlock,
                {
                  opacity: logoOpacity,
                  transform: [{ translateY: logoTranslate }],
                },
              ]}
            >
              <View style={styles.logoRing}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>SEVA SETU</Text>
              <View style={styles.divider} />
              <Text style={styles.tagline}>Report. Send. Solve.</Text>
              <Text style={styles.subTagline}>
                Your voice, your action for a better Malvan.
              </Text>
            </Animated.View>

            <View style={styles.footer}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.footerText}>Setting things up…</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.navyDeep,
  },
  bg: {
    width,
    height,
  },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,29,48,0.55)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.55,
    backgroundColor: COLORS.navyDeep,
    opacity: 0.55,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 62,
    height: 62,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 3,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.saffron,
    marginTop: 10,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  subTagline: {
    marginTop: 8,
    fontSize: 13.5,
    color: COLORS.whiteMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  footerText: {
    marginTop: 10,
    fontSize: 12.5,
    color: COLORS.whiteMuted,
    letterSpacing: 0.5,
  },
});
