import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View, type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTranslation } from '@/providers/localization-provider';

interface CategoryCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  count: number;
  iconBg: string;
  iconColor: string;
  onPress?: () => void;
  width?: number | string;
}

export default function CategoryCard({
  icon,
  label,
  count,
  iconBg,
  iconColor,
  onPress,
  width,
}: CategoryCardProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Translate categories label dynamically if a translation key exists
  const translatedLabel = t(label.toLowerCase().replace(/\s+/g, '')) || label;

  const resolvedWidth = (width ?? '31%') as DimensionValue;

  return (
    <Pressable
      style={{ width: resolvedWidth, marginBottom: width ? 4 : 18 }}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: '#FFFFFF',
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#E2E8F0',

            shadowColor: '#1E3A8A',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.08,
            shadowRadius: 12,

            elevation: 4,

            alignItems: 'center',
            justifyContent: 'center',

            paddingVertical: 18,
            paddingHorizontal: 8,

            minHeight: 130,
          },
        ]}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: iconBg,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={26}
            color={iconColor}
          />
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: '#0F172A',
            textAlign: 'center',
            minHeight: 34,
          }}
        >
          {translatedLabel}
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: '600',
            color: '#64748B',
          }}
        >
          {count} {t('complaints')}
        </Text>
      </Animated.View>
    </Pressable>
  );
}