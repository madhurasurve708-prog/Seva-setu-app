import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import AnimatedLogo from "@/components/common/AnimatedLogo";
import LoadingBar from "@/components/common/LoadingBar";

export default function SplashScreen() {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Background animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 3500 }),
        withTiming(1, { duration: 3500 })
      ),
      -1,
      false
    );

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/role-selection");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backgroundStyle]}
        >
          <ImageBackground
            source={require("../../assets/images/shivaji.png")}
            style={styles.background}
            resizeMode="cover"
          />
        </Animated.View>

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.70)",
            "rgba(0,0,0,0.60)",
            "rgba(0,0,0,0.85)",
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          <AnimatedLogo />

          <Animated.Text
            entering={FadeInDown.duration(700).delay(250)}
            style={styles.title}
          >
            सेवा सेतू
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.duration(700).delay(450)}
            style={styles.subtitle}
          >
            Citizen Complaint Management System
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.duration(700).delay(650)}
            style={styles.location}
          >
            Malvan Municipal Council
          </Animated.Text>

          <View style={{ height: 35 }} />

          <LoadingBar />
        </View>

        <Animated.Text
          entering={FadeIn.duration(700).delay(900)}
          style={styles.footer}
        >
          Empowering Citizens • Strengthening Governance
        </Animated.Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  background: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    marginTop: 18,
    fontSize: 38,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#EAEAEA",
    textAlign: "center",
  },

  location: {
    marginTop: 8,
    fontSize: 14,
    color: "#BDBDBD",
    letterSpacing: 0.5,
  },

  footer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    color: "#BDBDBD",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});