import SharedSettings from '@/components/common/SharedSettings';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { useTranslation } from '@/providers/localization-provider';
import { useOfficial } from '@/providers/official-provider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminSettings() {
  const router = useRouter();
  const { preferences, savePreferences, logout } = useOfficial();
  const { t } = useTranslation();

  const toggle = (key: 'complaintUpdates' | 'announcements' | 'smsAlerts') => {
    void savePreferences({ ...preferences, [key]: !preferences[key] });
  };

  const doLogout = async () => {
    await logout();
    router.replace('/(auth)/role-selection' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(t('logoutConfirmation'))) void doLogout();
      return;
    }
    Alert.alert(t('logout'), t('logoutConfirmation'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <SharedSettings
        toggleRows={[
          {
            key: 'complaintUpdates',
            label: t('complaintUpdates'),
            icon: 'clipboard-pulse-outline',
            value: preferences.complaintUpdates,
            onChange: () => toggle('complaintUpdates'),
          },
          {
            key: 'announcements',
            label: t('councilAnnouncements'),
            icon: 'bullhorn-outline',
            value: preferences.announcements,
            onChange: () => toggle('announcements'),
          },
          {
            key: 'smsAlerts',
            label: t('smsAlerts'),
            icon: 'message-text-outline',
            value: preferences.smsAlerts,
            onChange: () => toggle('smsAlerts'),
          },
        ]}
        helpRoute="/(official)/settings/faqs"
        privacyRoute="/(official)/settings/privacy-policy"
        termsRoute="/(official)/settings/terms"
        aboutRoute="/(admin)/about"
        onNavigate={(route) => router.push(route as any)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
});
