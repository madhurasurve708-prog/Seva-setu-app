import React from "react";
import { StyleSheet } from "react-native";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children: React.ReactNode;
};

export default function GradientOverlay({ children }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/images/shivaji.webp")}
      style={styles.background}
      contentFit="cover"
    >
      <LinearGradient
        colors={[
          "rgba(7,24,46,0.65)",
          "rgba(10,35,66,0.82)",
          "rgba(4,14,28,0.92)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});