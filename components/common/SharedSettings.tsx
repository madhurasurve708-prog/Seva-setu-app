/**
 * SharedSettings — single shared settings component used by all four portals.
 *
 * Renders:
 *  • Appearance (theme segmented control)
 *  • Language selector (English / मराठी)
 *  • Notifications toggles (portal-specific toggles passed in via props)
 *  • Support & Help links — Privacy Policy, Terms & Conditions, About Seva Setu
 *  • Role-specific help link supplied by caller
 *  • Logout button
 *
 * Each portal wraps this in its own shell component and provides the
 * `toggleRows`, `onNavigate`, and `onLogout` props.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GlassCard } from '@/components/common/GlassCard';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useTranslation, type AppLanguage } from '@/providers/localization-provider';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToggleRowConfig {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: boolean;
  onChange: () => void;
}

export interface NavRowConfig {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route?: string;
  value?: string;
}

export interface SharedSettingsProps {
  /** Theme preference — passed down from portal-level context */
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (mode: 'light' | 'dark' | 'system') => void;
  /** Toggle rows (notifications etc.) — portal-specific */
  toggleRows?: ToggleRowConfig[];
  /** Extra nav rows before the standard support section */
  extraNavRows?: NavRowConfig[];
  /** Route for the role-specific Help & FAQs page */
  helpRoute: string;
  /** Routes for shared pages — default to official settings subpages */
  privacyRoute?: string;
  termsRoute?: string;
  aboutRoute?: string;
  /** Logout handler */
  onLogout: () => void;
  /** Called when a nav row with a route is pressed */
  onNavigate: (route: string) => void;
  /** App version string */
  appVersion?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SharedSettings({
  theme,
  onThemeChange,
  toggleRows = [],
  extraNavRows = [],
  helpRoute,
  privacyRoute = '/(official)/settings/privacy-policy',
  termsRoute = '/(official)/settings/terms',
  aboutRoute = '/(official)/settings/about',
  onLogout,
  onNavigate,
  appVersion = '1.0.0',
}: SharedSettingsProps) {
  const { t, language, setLanguage } = useTranslation();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      overScrollMode="never"
    >
      {/* ── Appearance ── */}
      <Section title={t('appearance')} icon="eye-outline">
        <View style={styles.segmentedControl}>
          {(['light', 'dark', 'system'] as const).map((mode) => {
            const active = theme === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => onThemeChange(mode)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {t(`theme${mode[0].toUpperCase() + mode.slice(1)}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* ── Language ── */}
      <Section title={t('language')} icon="translate">
        <View style={styles.langRow}>
          <LangOption
            label={t('languageEnglish')}
            active={language === 'English'}
            onPress={() => void setLanguage('English' as AppLanguage)}
          />
          <LangOption
            label={t('languageMarathi')}
            active={language === 'Marathi'}
            onPress={() => void setLanguage('Marathi' as AppLanguage)}
          />
        </View>
      </Section>

      {/* ── Notifications ── */}
      {toggleRows.length > 0 && (
        <Section title={t('notifications')} icon="bell-outline">
          {toggleRows.map((row) => (
            <ToggleRow
              key={row.key}
              label={row.label}
              icon={row.icon}
              value={row.value}
              onChange={row.onChange}
            />
          ))}
        </Section>
      )}

      {/* ── Extra portal-specific nav rows ── */}
      {extraNavRows.length > 0 && (
        <Section title={t('preferences')} icon="tune-variant">
          {extraNavRows.map((row) => (
            <NavRow
              key={row.key}
              label={row.label}
              icon={row.icon}
              value={row.value}
              onPress={row.route ? () => onNavigate(row.route!) : undefined}
            />
          ))}
        </Section>
      )}

      {/* ── Support & Help ── */}
      <Section title={t('supportHelp')} icon="help-circle-outline">
        <NavRow
          label={t('helpFAQs')}
          icon="frequently-asked-questions"
          onPress={() => onNavigate(helpRoute)}
        />
        <NavRow
          label={t('privacyPolicy')}
          icon="file-document-outline"
          onPress={() => onNavigate(privacyRoute)}
        />
        <NavRow
          label={t('termsConditions')}
          icon="handshake-outline"
          onPress={() => onNavigate(termsRoute)}
        />
        <NavRow
          label={t('aboutSevaSetu')}
          icon="information-outline"
          onPress={() => onNavigate(aboutRoute)}
        />
        <NavRow
          label={t('appVersion')}
          icon="cellphone"
          value={appVersion}
        />
      </Section>

      {/* ── Logout ── */}
      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
      >
        <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={16} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <GlassCard style={styles.card}>{children}</GlassCard>
    </View>
  );
}

function ToggleRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialCommunityIcons name={icon} size={16} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: COLORS.accent, false: COLORS.border }}
        thumbColor={Platform.OS === 'android' ? COLORS.white : undefined}
      />
    </View>
  );
}

function NavRow({
  label,
  icon,
  value,
  onPress,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <MaterialCommunityIcons name={icon} size={16} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      {value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : onPress ? (
        <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
      ) : null}
    </Pressable>
  );
}

function LangOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.langOption, active && styles.langOptionActive]}
    >
      {active && (
        <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.primary} />
      )}
      <Text style={[styles.langOptionText, active && styles.langOptionTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 44 },

  sectionContainer: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

  card: { padding: 0, overflow: 'hidden' },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    margin: 10,
    gap: 4,
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.white, ...SHADOWS.soft },
  segmentText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  segmentTextActive: { color: COLORS.accent, fontWeight: '700' },

  langRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  langOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  langOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  langOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  langOptionTextActive: {
    color: COLORS.primary,
  },

  row: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowPressed: { backgroundColor: 'rgba(15,23,42,0.03)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  rowValue: { fontSize: 13, color: COLORS.textMuted, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: COLORS.danger },
});
