// app/(auth)/department-login.tsx
// STEP 1 — Department Selection.
// User picks a department then navigates to department-credentials for login.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthHero, AuthSheet } from '@/components/common/AuthScaffold';
import { COLORS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { ALL_DEPARTMENTS } from '@/data/complaints';
import { DEPT_META } from '@/data/department-routing';
import { useTranslation } from '@/providers/localization-provider';

export default function DepartmentLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  const handleSelect = (deptName: string) => {
    router.push({
      pathname: '/(auth)/department-credentials',
      params: { dept: deptName },
    } as any);
  };

  return (
    <View style={[styles.root, isDesktop && styles.desktopPage]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <AuthHero
        compact
        title={t('departmentLogin')}
        subtitle="Malvan Municipal Council"
        badge={t('departmentAccess')}
        showLogo={true}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(auth)/role-selection');
          }
        }}
      />

      <View style={[{ flex: 1 }, isDesktop && styles.desktopCenter]}>
        <AuthSheet
          style={isDesktop ? styles.desktopSheet : undefined}
          contentStyle={isDesktop ? styles.desktopContent : undefined}
        >
          {isDesktop ? (
            <View style={styles.content}>
              <Animated.View entering={FadeInDown.duration(360).delay(0)}>
                <Text style={styles.heading}>{t('selectDepartment')}</Text>
                <Text style={styles.hint}>{t('departmentLoginHint')}</Text>
              </Animated.View>

              <View style={[styles.deptList, styles.deptListDesktop]}> 
                {ALL_DEPARTMENTS.map((name, idx) => {
                  const meta = DEPT_META[name];
                  return (
                    <Animated.View
                      key={name}
                      entering={FadeInDown.duration(320).delay(60 + idx * 45)}
                      style={styles.deptTile}
                    >
                      <Pressable
                        onPress={() => handleSelect(name)}
                        style={({ pressed }) => [
                          styles.deptRow,
                          pressed && styles.deptRowPressed,
                        ]}
                        android_ripple={{ color: 'rgba(11,79,138,0.08)' }}
                      >
                        <View style={[styles.deptIcon, { backgroundColor: meta?.bg ?? '#EAF3FF' }]}>
                          <MaterialCommunityIcons
                            name={(meta?.icon ?? 'office-building-outline') as any}
                            size={22}
                            color={meta?.color ?? COLORS.primary}
                          />
                        </View>

                        <View style={styles.deptTextCol}>
                          <Text style={styles.deptName} numberOfLines={2}>{name}</Text>
                          <Text style={styles.deptEnglish} numberOfLines={1}>
                            {meta?.english ?? t('municipalDepartment')}
                          </Text>
                        </View>

                        <View style={[styles.arrowCircle, { backgroundColor: meta?.bg ?? '#EAF3FF' }]}>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={18}
                            color={meta?.color ?? COLORS.primary}
                          />
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
              overScrollMode="never"
            >
              <Animated.View entering={FadeInDown.duration(360).delay(0)}>
                <Text style={styles.heading}>{t('selectDepartment')}</Text>
                <Text style={styles.hint}>{t('departmentLoginHint')}</Text>
              </Animated.View>

              <View style={styles.deptList}>
                {ALL_DEPARTMENTS.map((name, idx) => {
                  const meta = DEPT_META[name];
                  return (
                    <Animated.View
                      key={name}
                      entering={FadeInDown.duration(320).delay(60 + idx * 45)}
                    >
                      <Pressable
                        onPress={() => handleSelect(name)}
                        style={({ pressed }) => [
                          styles.deptRow,
                          pressed && styles.deptRowPressed,
                        ]}
                        android_ripple={{ color: 'rgba(11,79,138,0.08)' }}
                      >
                        <View style={[styles.deptIcon, { backgroundColor: meta?.bg ?? '#EAF3FF' }]}>
                          <MaterialCommunityIcons
                            name={(meta?.icon ?? 'office-building-outline') as any}
                            size={22}
                            color={meta?.color ?? COLORS.primary}
                          />
                        </View>

                        <View style={styles.deptTextCol}>
                          <Text style={styles.deptName} numberOfLines={2}>{name}</Text>
                          <Text style={styles.deptEnglish} numberOfLines={1}>
                            {meta?.english ?? t('municipalDepartment')}
                          </Text>
                        </View>

                        <View style={[styles.arrowCircle, { backgroundColor: meta?.bg ?? '#EAF3FF' }]}>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={18}
                            color={meta?.color ?? COLORS.primary}
                          />
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </AuthSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061422',
  },
  content: {
    paddingBottom: 32,
  },
  desktopPage: { backgroundColor: '#F3F7FB', paddingHorizontal: 24, paddingBottom: 24 },
  desktopCenter: { justifyContent: 'flex-start', paddingTop: 0, paddingBottom: 24 },
  desktopContent: { width: '100%', maxWidth: 980, alignSelf: 'center' },
  desktopSheet: { maxWidth: 980, alignSelf: 'center', paddingHorizontal: 26, marginTop: -42 },

  heading: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: 8,
  },
  hint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 18,
  },

  deptList: {
    gap: 10,
  },
  deptListDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: 18,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  deptTile: {
    width: '48%',
    minWidth: '48%',
    maxWidth: '48%',
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  deptRowPressed: {
    backgroundColor: '#F0F7FF',
    borderColor: COLORS.primary,
  },
  deptIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deptTextCol: {
    flex: 1,
  },
  deptName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 19,
  },
  deptEnglish: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});