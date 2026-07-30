import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import type { ComplaintStatus } from '@/data/complaints';
import { useTranslation } from '@/providers/localization-provider';

const STATUS_CONFIG = {
  Pending: {
    bg: '#FEF3C7',
    text: '#B45309',
    icon: 'clock-outline',
    labelKey: 'pending',
  },
  'In Progress': {
    bg: '#DBEAFE',
    text: Colors.status.inProgress,
    icon: 'progress-clock',
    labelKey: 'inProgress',
  },
  Resolved: {
    bg: '#DCFCE7',
    text: Colors.status.resolved,
    icon: 'check-circle',
    labelKey: 'resolved',
  },
} as const;

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];

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