import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { memo, type PropsWithChildren } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOWS } from '@/constants/theme';

export type DesktopPortalItem = {
  label: string;
  route: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

type Props = PropsWithChildren<{
  title: string;
  items: DesktopPortalItem[];
  initial: string;
  subtitle?: string;
  onLogout?: () => void;
}>;

/** Web-only portal chrome. Callers keep their existing mobile markup unchanged. */
function DesktopPortal({ title, items, initial, subtitle = 'Malvan Municipal Council', onLogout, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <Image source={require('@/assets/images/logo.webp')} style={styles.logo} contentFit="contain" />
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Seva Setu</Text>
            <Text style={styles.brandSub} numberOfLines={1}>{subtitle}</Text>
          </View>
        </View>

        <Text style={styles.menuLabel}>PORTAL MENU</Text>
        <View style={styles.menu}>
          {items.map((item) => {
            const routeName = item.route.split('/').filter(Boolean).at(-1);
            const active = routeName != null && (pathname === `/${routeName}` || pathname.endsWith(`/${routeName}`));
            return (
              <Pressable key={item.route} onPress={() => !active && router.replace(item.route as never)}
                style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && styles.pressed]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={active ? COLORS.white : COLORS.textMuted} />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {onLogout && (
          <Pressable onPress={onLogout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.main}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>{title}</Text>
            <Text style={styles.pageSub}>Municipal service management portal</Text>
          </View>
          <View style={styles.account}><Text style={styles.accountText}>{initial}</Text></View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

export default memo(DesktopPortal);

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.background },
  sidebar: { width: 272, backgroundColor: COLORS.card, borderRightWidth: 1, borderRightColor: COLORS.border, padding: 22, paddingBottom: 28, ...SHADOWS.sm },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo: { width: 40, height: 40 }, brandCopy: { flex: 1 }, brandTitle: { color: COLORS.primary, fontWeight: '900', fontSize: 19 }, brandSub: { color: COLORS.textMuted, fontWeight: '600', fontSize: 10, marginTop: 2 },
  menuLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 24, marginBottom: 10 }, menu: { gap: 5 },
  navItem: { minHeight: 46, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12 }, navItemActive: { backgroundColor: COLORS.primary, ...SHADOWS.button }, navLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' }, navLabelActive: { color: COLORS.white, fontWeight: '800' }, pressed: { opacity: 0.82 },
  logout: { marginTop: 'auto', minHeight: 46, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, backgroundColor: '#FEF2F2' }, logoutText: { color: COLORS.danger, fontSize: 14, fontWeight: '800' },
  main: { flex: 1, minWidth: 0, backgroundColor: COLORS.background }, header: { minHeight: 76, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, ...SHADOWS.sm }, pageTitle: { color: COLORS.text, fontSize: 20, fontWeight: '900' }, pageSub: { color: COLORS.textMuted, marginTop: 3, fontSize: 12, fontWeight: '600' }, account: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.warning }, accountText: { color: COLORS.white, fontSize: 14, fontWeight: '900' },
  content: { flex: 1, width: '100%', maxWidth: 1440, alignSelf: 'center' },
});
