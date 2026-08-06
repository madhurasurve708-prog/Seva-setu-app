import React from "react";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
    FadeIn,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export default function AnimatedLogo() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(800)} style={styles.container}>
      <Animated.View
        entering={ZoomIn.duration(900)}
        style={animatedStyle}
      >
        <Image
          source={require("../../assets/images/logo.webp")}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  logo: {
    width: 165,
    height: 165,
  },
});