import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import LanguageToggle from "@/components/common/LanguageToggle";
import ComplaintCard from "@/components/official/ComplaintCard";
import HeroBanner from "@/components/official/HeroBanner";
import ProfileDropdown from "@/components/official/ProfileDropdown";
import { OfficialScreen } from "@/components/official/OfficialScreen";
import { COLORS, SHADOWS, TYPOGRAPHY } from "@/constants/theme";
import { categories } from "@/data/categories";
import { useOfficial } from "@/providers/official-provider";
import { useTranslation } from "@/providers/localization-provider";

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  all: { bg: "#EFF6FF", color: COLORS.primary },
  water: { bg: "#DBEAFE", color: "#2563EB" },
  garbage: { bg: "#DCFCE7", color: "#16A34A" },
  streetlights: { bg: "#FEF9C3", color: "#CA8A04" },
  road: { bg: "#DBEAFE", color: "#1D4ED8" },
  gutter: { bg: "#CFFAFE", color: "#0891B2" },
  animals: { bg: "#FFE4E6", color: "#E11D48" },
  traffic: { bg: "#FEE2E2", color: "#DC2626" },
  drainage: { bg: "#E0E7FF", color: "#4338CA" },
  tree: { bg: "#DCFCE7", color: "#15803D" },
  other: { bg: "#EDE9FE", color: "#7C3AED" },
};

const STAT_ITEMS = (
  t: (key: string) => string,
  pending: number,
  inProgress: number,
  resolved: number,
  escalated: number,
  todayUpdates: number,
  monthlyPerformance: number,
  avgResolutionTime: string,
) => [
  {
    label: t("pending"),
    value: pending,
    color: "#F59E0B",
    icon: "clock-outline" as const,
    bg: "#FFF8ED",
  },
  {
    label: t("inProgress"),
    value: inProgress,
    color: "#2E86DE",
    icon: "progress-wrench" as const,
    bg: "#EFF6FF",
  },
  {
    label: t("resolved"),
    value: resolved,
    color: "#10B981",
    icon: "check-circle-outline" as const,
    bg: "#ECFDF5",
  },
  {
    label: t("escalated"),
    value: escalated,
    color: "#DC2626",
    icon: "alert-circle-outline" as const,
    bg: "#FEF2F2",
  },
  {
    label: t("todaysUpdates"),
    value: todayUpdates,
    color: "#7C3AED",
    icon: "calendar-today" as const,
    bg: "#F5F3FF",
  },
  {
    label: t("monthlyPerformance"),
    value: `${monthlyPerformance}%`,
    color: "#0F766E",
    icon: "chart-donut" as const,
    bg: "#F0FDFA",
  },
  {
    label: t("avgResolution"),
    value: avgResolutionTime,
    color: "#EA580C",
    icon: "timer-outline" as const,
    bg: "#FFF7ED",
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, complaints, announcements, logout } = useOfficial();
  const { t } = useTranslation();

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const inProgress = complaints.filter(
    (c) => c.status === "In Progress",
  ).length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const escalated = complaints.filter((c) => c.is_escalated).length;
  const todayUpdates = complaints.filter((c) => {
    const u = new Date(c.updatedAt);
    const t = new Date();
    return (
      u.getDate() === t.getDate() &&
      u.getMonth() === t.getMonth() &&
      u.getFullYear() === t.getFullYear()
    );
  }).length;
  const monthlyPerf = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgResTime =
    total > 0 ? `${Math.max(1, Math.round((resolved + 1) / 2))}d` : "—";
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const priorityComplaints = complaints
    .filter((c) => c.priority === "Emergency" || c.priority === "High")
    .slice(0, 3);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/role-selection" as any);
  };

  const goToComplaints = (categoryId?: string) => {
    router.push({
      pathname: "/(official)/complaints",
      params:
        categoryId && categoryId !== "all" ? { category: categoryId } : {},
    } as any);
  };

  const statItems = STAT_ITEMS(
    t,
    pending,
    inProgress,
    resolved,
    escalated,
    todayUpdates,
    monthlyPerf,
    avgResTime,
  );

  return (
    <OfficialScreen title={t("dashboard")} tab="dashboard" hideHeader={true}>
      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <View style={styles.brandWrap}>
          <Image
            source={require("@/assets/images/logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>{t("sevaSetuTitle")}</Text>
            <Text style={styles.headerSub}>{t("malvanMunicipal")}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push("/(official)/notification" as any)}
            style={styles.notifBtn}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={COLORS.primary}
            />
            <View style={styles.notifDot} />
          </Pressable>
          <LanguageToggle size={38} variant="light" />
          <ProfileDropdown
            name={profile.name}
            initial={profile.avatarInitial}
            language={profile.language}
            roleLabel={profile.roleLabel}
            ward={profile.ward}
            department={profile.department}
            onLogout={handleLogout}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
      >
        {/* ── Hero Banner ── */}
        <HeroBanner
          name={profile.name}
          wardLabel={`${profile.ward} • ${profile.locality}`}
          designation={t("nagarsevakDesignation")}
          filedCount={total}
          resolvedCount={resolved}
          successRate={`${successRate}%`}
          onViewComplaints={() => goToComplaints()}
        />

        {/* ── Ward Overview ── */}
        <View style={styles.section}>
          <SectionHeader
            title={t("wardOverview")}
            subtitle={t("performanceGlance")}
          />
          <View style={styles.statsGrid}>
            {statItems.map((item, idx) => (
              <Animated.View
                key={item.label}
                entering={FadeInDown.duration(380).delay(60 + idx * 50)}
                style={styles.statCardWrap}
              >
                <View style={[styles.statCard, { backgroundColor: item.bg }]}>
                  <View
                    style={[
                      styles.statIconCircle,
                      { backgroundColor: `${item.color}20` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={16}
                      color={item.color}
                    />
                  </View>
                  <Text style={[styles.statValue, { color: item.color }]}>
                    {item.value}
                  </Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ── Complaint Categories ── */}
        <View style={styles.section}>
          <SectionHeader
            title={t("complaintCategories")}
            actionLabel={t("viewAll")}
            onAction={() => goToComplaints()}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((cat, idx) => (
              <Animated.View
                key={cat.id}
                entering={FadeInRight.duration(360).delay(40 + idx * 40)}
              >
                <Pressable
                  onPress={() => goToComplaints(cat.id)}
                  style={styles.categoryCard}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          CATEGORY_STYLE[cat.id]?.bg ?? "#F1F5F9",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={18}
                      color={CATEGORY_STYLE[cat.id]?.color ?? COLORS.primary}
                    />
                  </View>
                  <Text style={styles.categoryLabel}>{t(cat.labelKey)}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* ── Active Notices ── */}
        <View style={styles.section}>
          <SectionHeader
            title={t("noticesTitle")}
            actionLabel={t("viewAll")}
            onAction={() => router.push("/(official)/announcements" as any)}
          />
          {announcements.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={28}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>{t("noNoticesYet")}</Text>
              <Text style={styles.emptyText}>{t("checkBackLater")}</Text>
            </View>
          ) : (
            announcements.slice(0, 2).map((item) => (
              <View key={item.id} style={styles.announcementCard}>
                <View style={styles.announcementTopRow}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          item.priority === "Emergency" ||
                          item.priority === "High"
                            ? "#FEF2F2"
                            : "#F0FDF4",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            item.priority === "Emergency" ||
                            item.priority === "High"
                              ? "#DC2626"
                              : "#16A34A",
                        },
                      ]}
                    >
                      {item.priority === "Emergency"
                        ? t("priorityEmergency")
                        : item.priority === "High"
                          ? t("priorityHigh")
                          : t("priorityNormal")}
                    </Text>
                  </View>
                  <Text style={styles.announcementDate}>
                    {new Date(item.createdAt).toLocaleDateString(
                      profile.language === "mr" ? "mr-IN" : "en-IN",
                      { month: "short", day: "numeric" },
                    )}
                  </Text>
                </View>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementBody}>{item.body}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Urgent Actions ── */}
        <View style={styles.section}>
          <SectionHeader
            title={t("urgentActions")}
            subtitle={t("highPriorityFocus")}
            actionLabel={t("viewAll")}
            onAction={() => goToComplaints()}
          />
          {priorityComplaints.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={28}
                color={COLORS.success}
              />
              <Text style={styles.emptyTitle}>{t("allClear")}</Text>
              <Text style={styles.emptyText}>{t("noUrgentComplaints")}</Text>
            </View>
          ) : (
            priorityComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={() =>
                  router.push({
                    pathname: "/(official)/complaint-details",
                    params: { id: complaint.id },
                  } as any)
                }
                onNotes={() =>
                  router.push({
                    pathname: "/(official)/add-note",
                    params: { id: complaint.id },
                  } as any)
                }
                onEscalate={() =>
                  router.push({
                    pathname: "/(official)/escalate",
                    params: { id: complaint.id },
                  } as any)
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </OfficialScreen>
  );
}

/* ── Sub-components ── */

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.linkText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Header */
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  brandWrap: { flexDirection: "row", alignItems: "center", flex: 1 },
  logo: { width: 30, height: 30, marginRight: 8 },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  /* Scroll content */
  content: { paddingBottom: 44 },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginTop: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 2,
  },

  /* Stats grid */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCardWrap: {
    width: "48%",
    flexGrow: 1,
  },
  statCard: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.7)",
    ...SHADOWS.soft,
  },
  statIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginTop: 4,
  },

  /* Category chips */
  categoryRow: { gap: 10, paddingRight: 4, paddingBottom: 2 },
  categoryCard: {
    width: 84,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    alignItems: "center",
    ...SHADOWS.soft,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },

  /* Announcements */
  announcementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    ...SHADOWS.soft,
  },
  announcementTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  announcementDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontWeight: "500",
  },

  /* Empty state */
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    gap: 6,
    ...SHADOWS.soft,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
