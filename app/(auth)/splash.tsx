// app/(auth)/splash.tsx
import { useTranslation } from "@/providers/localization-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const SPLASH_DURATION = 6000;

export default function SplashScreen() {
  const { t } = useTranslation();
  const screenOpacity = useSharedValue(0);
  const bgScale = useSharedValue(1);
  const gradientOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(15);
  const titleOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const skipOpacity = useSharedValue(0);

  const [skipVisible, setSkipVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    screenOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.in(Easing.ease),
    });

    bgScale.value = withTiming(1.05, {
      duration: SPLASH_DURATION,
      easing: Easing.inOut(Easing.ease),
    });

    gradientOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) })
    );

    logoScale.value = withDelay(
      700,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.2)) })
    );
    logoOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    glowOpacity.value = withDelay(
      1600,
      withSequence(
        withTiming(0.6, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) })
      )
    );

    titleTranslateY.value = withDelay(
      1200,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
    );
    titleOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
    );

    sloganOpacity.value = withDelay(
      2000,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) })
    );

    progressWidth.value = withDelay(
      1000,
      withTiming(1, {
        duration: SPLASH_DURATION - 1000,
        easing: Easing.inOut(Easing.ease),
      })
    );

    const skipTimer = setTimeout(() => {
      setSkipVisible(true);
      skipOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    }, 2000);

    const navTimer = setTimeout(() => {
      try {
        router.replace("/(auth)/role-selection");
      } catch (e) {
        console.error("Navigation error:", e);
      }
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(navTimer);
    };
  }, [mounted]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const sloganAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(progressWidth.value, [0, 1], [0, width * 0.65]),
  }));

  const skipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skipOpacity.value,
  }));

  const handleSkip = () => {
    try {
      router.replace("/(auth)/role-selection");
    } catch (e) {
      console.error("Skip navigation error:", e);
    }
  };

  return (
    <Animated.View style={[styles.root, screenAnimatedStyle]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[StyleSheet.absoluteFill, bgAnimatedStyle]}>
        <ImageBackground
          source={require("../../assets/images/shivaji.png")}
          style={styles.bgImage}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}>
        <LinearGradient
          colors={[
            "rgba(4,15,35,0.0)",
            "rgba(4,15,35,0.45)",
            "rgba(4,15,35,0.75)",
            "rgba(2,8,20,0.95)",
            "#020814",
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {skipVisible && (
        <Animated.View style={[styles.skipContainer, skipAnimatedStyle]}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>{t('splashSkip')}</Text>
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.bottomContent}>
        <View style={styles.logoWrapper}>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.glowRing, glowAnimatedStyle]}
          />
          <Animated.Image
            source={require("../../assets/images/logo.jpeg")}
            style={[styles.logo, logoAnimatedStyle]}
            resizeMode="contain"
          />
        </View>

        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          {t('appName')}
        </Animated.Text>

        <Animated.Text style={[styles.slogan, sloganAnimatedStyle]}>
          {t('splashSlogan')}
        </Animated.Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020814" },
  bgImage: { flex: 1, width: "100%", height: "100%" },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
  },
  skipContainer: { position: "absolute", top: 60, right: 20, zIndex: 100 },
  skipButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(4, 15, 35, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  skipText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", letterSpacing: 0.5 },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: { width: 72, height: 72 },
  glowRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(100, 180, 255, 0.18)",
    alignSelf: "center",
    top: -4,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1.8,
    textAlign: "center",
    marginBottom: 8,
  },
  slogan: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 30,
  },
  progressTrack: {
    width: width * 0.65,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#4A9EFF",
    shadowColor: "#4A9EFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
});
