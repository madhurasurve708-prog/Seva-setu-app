import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { OfficialScreen } from '@/components/official/OfficialScreen';
import { COLORS } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';

export default function OfficialNotificationScreen() {
  const { t } = useTranslation();

  return (
    <OfficialScreen title={t('notifications')} showBack>
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons name="bell-outline" size={30} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>{t('noNotificationsYet')}</Text>
        <Text style={styles.emptyText}>{t('noNotificationsDesc')}</Text>
      </View>
    </OfficialScreen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },
});
