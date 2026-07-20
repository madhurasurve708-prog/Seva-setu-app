import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: number;
  accentColor?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
}

export default function StatCard({
  label,
  value,
  accentColor = '#2563EB',
  icon,
  onPress,
}: StatCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={{ flexBasis: '47%', flexGrow: 1 }}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            padding: 18,
            borderWidth: 1,
            borderColor: '#E2E8F0',

            shadowColor: '#1E3A8A',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 14,

            elevation: 5,
          },
        ]}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#64748B',
              }}
            >
              {label}
            </Text>

            <Text
              style={{
                fontSize: 34,
                fontWeight: '800',
                color: accentColor,
                marginTop: 10,
              }}
            >
              {value}
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                color: '#94A3B8',
                fontWeight: '500',
              }}
            >
              Updated Today
            </Text>
          </View>

          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: `${accentColor}15`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={icon}
              size={24}
              color={accentColor}
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
