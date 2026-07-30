// components/common/LanguageToggle.tsx
// Small icon button that opens a language picker (English / मराठी).
// Drop this next to a profile/avatar icon, or standalone in a header.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, SHADOWS } from '@/constants/theme';
import { useTranslation, type AppLanguage } from '@/providers/localization-provider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LanguageToggleProps {
  size?: number;
  /** 'light' = solid icon on a light/white header. 'dark' = white icon on a dark/gradient header. */
  variant?: 'light' | 'dark';
}

export default function LanguageToggle({ size = 36, variant = 'light' }: LanguageToggleProps) {
  const { t, language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const scale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const choose = async (next: AppLanguage) => {
    if (next !== language) {
      await setLanguage(next);
    }
    setOpen(false);
  };

  const isDark = variant === 'dark';

  return (
    <>
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={[
          styles.btn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : '#EFF6FF',
            borderColor: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(11, 79, 138, 0.15)',
          },
          btnAnimStyle,
        ]}
      >
        <MaterialCommunityIcons
          name="translate"
          size={Math.round(size * 0.5)}
          color={isDark ? COLORS.white : COLORS.primary}
        />
      </AnimatedPressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(120)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                  <MaterialCommunityIcons name="translate" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>{t('selectLanguage')}</Text>
              </View>

              {(['English', 'Marathi'] as const).map((opt) => {
                const active = language === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => choose(opt)}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {t(opt === 'English' ? 'languageEnglish' : 'languageMarathi')}
                    </Text>
                    {active && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.primary} />
                    )}
                  </Pressable>
                );
              })}
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,20,40,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    shadowColor: '#071D30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    ...SHADOWS.soft,
  },
  optionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  optionTextActive: {
    color: COLORS.primary,
  },
});
