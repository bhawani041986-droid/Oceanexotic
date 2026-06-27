import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useThemeColors } from "@/hooks/useThemeColors";
import { t } from "@/lib/i18n";

const NAV: { label: string; href: Href }[] = [
  { label: "Home", href: "/home" },
  { label: "Market", href: "/products" },
  { label: "Chat", href: "/chat" },
  { label: "Orders", href: "/orders" },
  { label: "Profile", href: "/profile" },
];

function pathActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getRgba(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function TabIcon({ label, active, activeColor }: { label: string; active: boolean; activeColor: string }) {
  const inactiveColor = "#64748B"; // Slate-500
  const activeTeal = "#0D9488"; // Teal-600

  if (label.toLowerCase() === "home") {
    const houseColor = active ? activeColor : inactiveColor;
    const houseFill = active ? getRgba(activeColor, 0.05) : "none";
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M3 10.2L12 3.2L21 10.2V20.2C21 20.7523 20.5523 21.2 20 21.2H4C3.44772 21.2 3 20.7523 3 20.2V10.2Z" 
          stroke={houseColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill={houseFill}
        />
        <Path 
          d="M10 21.2V15.2H14V21.2" 
          stroke={houseColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  }

  if (label.toLowerCase() === "market") {
    const basketColor = active ? activeColor : inactiveColor;
    const wheelColor = active ? activeColor : activeTeal;
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M3 3H5L6.6 13.4C6.7 14.1 7.3 14.6 8 14.6H17.2C17.9 14.6 18.5 14.1 18.6 13.4L20 6H6" 
          stroke={basketColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Circle 
          cx="9" 
          cy="19" 
          r="1.8" 
          stroke={wheelColor} 
          strokeWidth="2.2" 
          fill={active ? activeColor : "none"} 
        />
        <Circle 
          cx="17" 
          cy="19" 
          r="1.8" 
          stroke={wheelColor} 
          strokeWidth="2.2" 
          fill={active ? activeColor : "none"} 
        />
      </Svg>
    );
  }

  if (label.toLowerCase() === "chat") {
    const bubbleColor = active ? activeColor : inactiveColor;
    const dotsColor = active ? activeColor : activeTeal;
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M20 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8V19.5L12 16H20C21.1 16 22 15.1 22 14V6C22 4.9 21.1 4 20 4Z" 
          stroke={bubbleColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Circle cx="9" cy="10" r="1.2" fill={dotsColor} />
        <Circle cx="12" cy="10" r="1.2" fill={dotsColor} />
        <Circle cx="15" cy="10" r="1.2" fill={dotsColor} />
      </Svg>
    );
  }

  if (label.toLowerCase() === "orders") {
    const boardColor = active ? activeColor : inactiveColor;
    const rupeeColor = active ? activeColor : activeTeal;
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M16 4H18C19.1 4 20 4.9 20 6V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V6C4 4.9 4.9 4 6 4H8" 
          stroke={boardColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V6H9V5Z" 
          stroke={boardColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill={active ? activeColor : "none"}
        />
        <Path 
          d="M9.5 9.5H14.5M9.5 12H13.5M9.5 9.5C13 9.5 13.5 14.5 9.5 14.5H11.5M10.5 14.5L14 18.5" 
          stroke={rupeeColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  }

  // Profile (default)
  const profileColor = active ? activeColor : inactiveColor;
  const headFill = active ? getRgba(activeColor, 0.15) : "#E0F2FE";
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle 
        cx="12" 
        cy="8" 
        r="4" 
        stroke={profileColor} 
        strokeWidth="2" 
        fill={headFill}
      />
      <Path 
        d="M5 20C5 16.1 8.1 14 12 14C15.9 14 19 16.1 19 20" 
        stroke={profileColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </Svg>
  );
}

export function CustomerTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCartStore((s) => s.itemCount());
  const colors = useThemeColors();
  const language = useSettingsStore((s) => s.language);

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 z-50 flex-row items-center justify-around"
      style={{
        height: 87,
        paddingBottom: 31,  // 12 + 19 = 31 (keep visual padding + fill gap)
        paddingTop: 4,
        backgroundColor: colors.isDark ? "#080C16FA" : "rgba(255, 255, 255, 0.98)",
        borderTopWidth: 1.5,
        borderTopColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: colors.isDark ? 0.7 : 0.08,
        shadowRadius: 15,
        elevation: 10,
      }}
    >
      {NAV.map((item) => {
        const active = pathActive(pathname, String(item.href));
        const activeColor = colors.primary;
        const inactiveColor = colors.isDark ? "#7C8BA1" : "#64748B"; // Match slate-500 in light mode

        return (
          <Pressable
            key={String(item.href)}
            onPress={() => router.push(item.href)}
            className="flex-1 items-center justify-center h-full relative"
          >
            {/* Glowing top line indicator for active tab */}
            {active && (
              <View 
                style={{ 
                  position: "absolute",
                  top: 0,
                  width: 44,
                  height: 3.5,
                  backgroundColor: activeColor,
                  borderRadius: 2,
                  shadowColor: activeColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.6,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              />
            )}

            {/* Circular highlight wash behind the icon */}
            <View 
              className="items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: active ? getRgba(activeColor, 0.05) : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <TabIcon label={item.label} active={active} activeColor={activeColor} />
            </View>

            <Text
              className={cn(
                "text-[8px] font-black uppercase tracking-[0.08em] mt-0.5 text-center"
              )}
              style={{ color: active ? activeColor : inactiveColor }}
            >
              {t(item.label.toLowerCase())}
            </Text>
          </Pressable>
        );
      })}
      {count > 0 ? (
        <View 
          style={{
            position: "absolute",
            top: 6,
            right: "32%",
            backgroundColor: "#FF3B30",
            borderRadius: 8,
            minWidth: 14,
            height: 14,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 3,
            shadowColor: "#FF3B30",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.5,
            shadowRadius: 2,
            elevation: 3,
            zIndex: 100,
          }}
        >
          <Text className="text-[7.5px] font-black text-white">{count}</Text>
        </View>
      ) : null}
    </View>
  );
}
