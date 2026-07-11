import React, { useEffect } from "react";
import { View } from "react-native";
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
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      className="w-64 h-1 bg-white/20 rounded-full overflow-hidden"
    >
      <Animated.View
        className="h-full bg-green-500 rounded-full"
        style={animatedStyle}
      />
    </View>
  );
}