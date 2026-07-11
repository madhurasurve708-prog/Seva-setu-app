import React from "react";
import Animated, {
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";
import { Image, StyleSheet } from "react-native";

export default function AnimatedLogo() {
  return (
    <Animated.View
      entering={FadeIn.duration(900)}
      style={styles.container}
    >
      <Animated.View entering={ZoomIn.duration(900)}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
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
    width: 170,
    height: 170,
  },
});