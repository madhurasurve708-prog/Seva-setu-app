import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function LoadingBar() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 2200,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View
        style={[styles.bar, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 256,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 9999,
  },
});