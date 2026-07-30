// components/official/OfficialScreen.tsx
// Shared screen wrapper for ALL official portal roles (Nagarsevak, Department Officer, Nagaradhyaksha).
// Mirrors CitizenScreen exactly — same header height, same primary bar, same avatar style.
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, SHADOWS } from "@/constants/theme";
import { useOfficial } from "@/providers/official-provider";

type OfficialScreenProps = PropsWithChildren<{
  title: string;
  showBack?: boolean;
  /** Override the back destination (defaults to router.back()) */
  backHref?: string;
  hideHeader?: boolean;
  /** Right-side action button */
  rightAction?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
  };
}>;

export function OfficialScreen({
  title,
  children,
  showBack = false,
  backHref,
  hideHeader = false,
  rightAction,
}: OfficialScreenProps) {
  const router = useRouter();
  const { profile } = useOfficial();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref as any);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.root}>
      {!hideHeader && (
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.header}>
            {showBack ? (
              <Pressable
                onPress={handleBack}
                hitSlop={12}
                style={styles.headerBtn}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.white}
                />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}

            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>

            {rightAction ? (
              <Pressable
                onPress={rightAction.onPress}
                style={styles.headerBtn}
                hitSlop={12}
              >
                <MaterialCommunityIcons
                  name={rightAction.icon}
                  size={22}
                  color={COLORS.white}
                />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push("/(official)/profile")}
                style={({ pressed }) =>
                  [styles.avatar, pressed && styles.pressedScale] as any
                }
              >
                <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      )}

      {hideHeader && (
        <SafeAreaView style={styles.safeTransparent} edges={["top"]} />
      )}

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safe: {
    backgroundColor: COLORS.primary,
  },
  safeTransparent: {
    backgroundColor: COLORS.primary,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 58,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    ...SHADOWS.soft,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },
});
