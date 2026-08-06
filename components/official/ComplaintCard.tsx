import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/color';
import type { Complaint } from '@/data/complaints';
import { useTranslation } from '@/providers/localization-provider';

import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

interface ComplaintCardProps {
  complaint: Complaint;
  onView?: () => void;
  onNotes?: () => void;
  onEscalate?: () => void;
}

function ComplaintCard({
  complaint,
  onView,
  onNotes,
  onEscalate,
}: ComplaintCardProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const category = CATEGORY_MAP[complaint.category];

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onView?.();
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: Colors.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 18,
            marginBottom: 18,

            shadowColor: '#1E3A8A',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 5,
          },
        ]}
      >
        {/* Header */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              marginRight: 10,
            }}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: category.bg,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 14,
              }}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={26}
                color={category.color}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: Colors.textPrimary,
                  fontSize: 17,
                  fontWeight: '700',
                }}
              >
                {complaint.title}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  color: Colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {complaint.id}
              </Text>
            </View>
          </View>

          <PriorityBadge priority={complaint.priority} />
        </View>

        {/* Citizen */}

        <View style={{ marginTop: 18 }}>
          <Row
            icon="account-outline"
            text={complaint.citizenName}
          />

          <Row
            icon="map-marker-outline"
            text={complaint.location}
          />

          <Row
            icon="home-city-outline"
            text={complaint.ward}
          />

          <Row
            icon="clock-outline"
            text={formatDate(complaint.createdAt)}
          />
        </View>

        {/* Status */}

        <View
          style={{
            flexDirection: 'row',
            marginTop: 18,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <StatusBadge status={complaint.status} />

          <Text
            style={{
              color: Colors.textSecondary,
              fontSize: 12,
            }}
          >
            {t('updatedOn')} {formatDate(complaint.updatedAt)}
          </Text>
        </View>

        {/* Divider */}

        <View
          style={{
            height: 1,
            backgroundColor: Colors.border,
            marginVertical: 18,
          }}
        />

        {/* Buttons */}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <ActionButton
            icon="eye-outline"
            title={t('view')}
            color={Colors.primary}
            onPress={onView}
          />

          <ActionButton
            icon="document-text-outline"
            title={t('notes')}
            color="#EA580C"
            onPress={onNotes}
          />

          <ActionButton
            icon="arrow-up-circle-outline"
            title={t('escalateBtn')}
            color="#DC2626"
            onPress={onEscalate}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}
const CATEGORY_MAP = {
  water: {
    icon: 'water',
    bg: '#DBEAFE',
    color: '#2563EB',
  },
  garbage: {
    icon: 'delete',
    bg: '#DCFCE7',
    color: '#16A34A',
  },
  streetlights: {
    icon: 'lightbulb-on',
    bg: '#FEF3C7',
    color: '#CA8A04',
  },
  road: {
    icon: 'road-variant',
    bg: '#DBEAFE',
    color: '#1D4ED8',
  },
  gutter: {
    icon: 'wave-arrow-down',
    bg: '#CFFAFE',
    color: '#0891B2',
  },
  animals: {
    icon: 'paw',
    bg: '#FFE4E6',
    color: '#E11D48',
  },
  traffic: {
    icon: 'traffic-light',
    bg: '#FEE2E2',
    color: '#DC2626',
  },
  drainage: {
    icon: 'pipe',
    bg: '#E0E7FF',
    color: '#4338CA',
  },
  tree: {
    icon: 'tree',
    bg: '#DCFCE7',
    color: '#15803D',
  },
  other: {
    icon: 'shape',
    bg: '#EDE9FE',
    color: '#7C3AED',
  },
} as const;

function Row({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  text: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={Colors.textSecondary}
      />

      <Text
        style={{
          marginLeft: 10,
          color: Colors.textSecondary,
          fontSize: 13,
          flex: 1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  title,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: `${color}12`,
        borderRadius: 16,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${color}30`,
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={color}
      />

      <Text
        style={{
          marginTop: 6,
          fontSize: 12,
          fontWeight: '700',
          color,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function formatDate(date: string) {
  const value = new Date(date);

  return value.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default memo(ComplaintCard);
