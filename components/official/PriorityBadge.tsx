import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import type { Priority } from '@/data/complaints';
import { useTranslation } from '@/providers/localization-provider';

const PRIORITY_CONFIG = {
  Emergency: {
    bg: Colors.priority.emergency,
    text: '#FFFFFF',
    icon: 'alert-circle',
    labelKey: 'priorityEmergency',
  },
  High: {
    bg: Colors.priority.high,
    text: '#FFFFFF',
    icon: 'arrow-up-bold-circle',
    labelKey: 'priorityHigh',
  },
  Medium: {
    bg: Colors.priority.medium,
    text: '#FFFFFF',
    icon: 'minus-circle',
    labelKey: 'priorityMedium',
  },
  Low: {
    bg: Colors.priority.low,
    text: '#FFFFFF',
    icon: 'arrow-down-bold-circle',
    labelKey: 'priorityLow',
  },
  Normal: {
    bg: '#475569',
    text: '#FFFFFF',
    icon: 'information-outline',
    labelKey: 'priorityNormal',
  },
  Pinned: {
    bg: '#1E6FD9',
    text: '#FFFFFF',
    icon: 'pin',
    labelKey: 'priorityPinned',
  },
} as const;

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  const { t } = useTranslation();
  const config = (PRIORITY_CONFIG as Record<string, { bg: string; text: string; icon: any; labelKey: string }>)[priority] ?? PRIORITY_CONFIG.Low;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: config.bg,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
      }}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.text}
      />

      <Text
        style={{
          marginLeft: 5,
          color: config.text,
          fontSize: 12,
          fontWeight: '700',
        }}
      >
        {t(config.labelKey)}
      </Text>
    </View>
  );
}