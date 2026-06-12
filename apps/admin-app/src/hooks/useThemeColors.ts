import { useSettingsStore } from "@/store/settingsStore";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  bgAlt: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  isDark: boolean;
}

export function useThemeColors(): ThemeColors {
  const theme = useSettingsStore((s) => s.theme) || "theme-ocean-neon";

  switch (theme) {
    case "theme-zomato-passion":
      return {
        primary: "#E23744",
        secondary: "#1C1C1C",
        accent: "#CB202D",
        bg: "#F8F8F8",
        bgAlt: "#FFFFFF",
        card: "#FFFFFF",
        text: "#1C1C1C",
        textMuted: "#4B5563",
        border: "rgba(0, 0, 0, 0.08)",
        isDark: false,
      };
    case "theme-sovereign-light":
    case "theme-light-sovereign":
      return {
        primary: "#7C3AED",
        secondary: "#2563EB",
        accent: "#6366F1",
        bg: "#FFFFFF",
        bgAlt: "#F8FAFC",
        card: "#FFFFFF",
        text: "#1C1C1C",
        textMuted: "#4B5563",
        border: "rgba(0, 0, 0, 0.08)",
        isDark: false,
      };
    case "theme-swiggy-burst":
    case "theme-swiggy-vibrant":
      return {
        primary: "#FC8019",
        secondary: "#282C3F",
        accent: "#FC8019",
        bg: "#FFFFFF",
        bgAlt: "#F8F8F8",
        card: "#FFFFFF",
        text: "#282C3F",
        textMuted: "#686B78",
        border: "rgba(0, 0, 0, 0.08)",
        isDark: false,
      };
    case "theme-sunrise-market":
      return {
        primary: "#F97316",
        secondary: "#22C55E",
        accent: "#EA580C",
        bg: "#0B1120",
        bgAlt: "#111827",
        card: "#172033",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-emerald-coast":
      return {
        primary: "#10B981",
        secondary: "#F59E0B",
        accent: "#059669",
        bg: "#051210",
        bgAlt: "#0B1F1C",
        card: "#112B26",
        text: "#D1FAE5",
        textMuted: "#6EE7B7",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-volcanic-grill":
    case "theme-sunset-energy":
      return {
        primary: "#EF4444",
        secondary: "#F59E0B",
        accent: "#991B1B",
        bg: "#18181B",
        bgAlt: "#27272A",
        card: "#3F3F46",
        text: "#FAFAF9",
        textMuted: "#A1A1AA",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-royal-pearl":
    case "theme-royal-purple":
      return {
        primary: "#7C3AED",
        secondary: "#FACC15",
        accent: "#C026D3",
        bg: "#0F071A",
        bgAlt: "#1A0B2E",
        card: "#240E3F",
        text: "#F3E8FF",
        textMuted: "#A78BFA",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-alibaba-prime":
    case "theme-alibaba-orange":
      return {
        primary: "#FF6600",
        secondary: "#064495",
        accent: "#FF6600",
        bg: "#0B1120",
        bgAlt: "#111827",
        card: "#172033",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-amazon-dark":
    case "theme-amazon-global":
      return {
        primary: "#FF9900",
        secondary: "#232F3E",
        accent: "#FF9900",
        bg: "#131921",
        bgAlt: "#232F3E",
        card: "#232F3E",
        text: "#FFFFFF",
        textMuted: "#CCCCCC",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-midnight-executive":
    case "theme-midnight-deep":
      return {
        primary: "#06B6D4",
        secondary: "#7C3AED",
        accent: "#0891B2",
        bg: "#020617",
        bgAlt: "#0F172A",
        card: "#1E293B",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-arctic-minimal":
      return {
        primary: "#60A5FA",
        secondary: "#2DD4BF",
        accent: "#38BDF8",
        bg: "#030712",
        bgAlt: "#0F172A",
        card: "#111827",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
    case "theme-ocean-neon":
    default:
      return {
        primary: "#7C3AED",
        secondary: "#06B6D4",
        accent: "#A78BFA",
        bg: "#020617",
        bgAlt: "#0F172A",
        card: "#0f172a",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.08)",
        isDark: true,
      };
  }
}
