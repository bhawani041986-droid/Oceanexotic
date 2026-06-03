import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useThemeColors } from "@/hooks/useThemeColors";

const NAV: { label: string; href: Href }[] = [
  { label: "Home", href: "/home" },
  { label: "Market", href: "/products" },
  { label: "Orders", href: "/orders" },
  { label: "Profile", href: "/profile" },
];

function pathActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabIcon({ label, color }: { label: string; color: string }) {
  if (label.toLowerCase() === "home") {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24">
        <Path 
          d="M3 9.5L12 2.5L21 9.5V20.5C21 21.3284 20.3284 22 19.5 22H4.5C3.67157 22 3 21.3284 3 20.5V9.5Z" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M9 22V13.5H15V22" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  }

  if (label.toLowerCase() === "market") {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24">
        <Path 
          d="M6 21H18C19.1046 21 20 20.1046 20 19V7.5C20 6.39543 19.1046 5.5 18 5.5H6C4.89543 5.5 4 6.39543 4 7.5V19C4 20.1046 4.89543 21 6 21Z" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M9 5.5C9 3.567 10.3431 2 12 2C13.6569 2 15 3.567 15 5.5" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  }

  if (label.toLowerCase() === "orders") {
    return (
      <Svg width="20" height="20" viewBox="0 0 24 24">
        <Path 
          d="M6 3.5H18C19.1046 3.5 20 4.39543 20 5.5V19.5C20 20.6046 19.1046 21.5 18 21.5H6C4.89543 21.5 4 20.6046 4 19.5V5.5C4 4.39543 4.89543 3.5 6 3.5Z" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M12 7.5V17.5M9.5 9.5C9.5 9.5 14 8.5 14 11.5C14 14.5 9.5 12.5 9.5 15.5C9.5 18.5 14.5 17.5 14.5 17.5" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  }

  return (
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Circle 
        cx="12" 
        cy="8" 
        r="4.5" 
        fill="none" 
        stroke={color} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />
      <Path 
        d="M4.5 20C4.5 15.8579 7.85786 14.5 12 14.5C16.1421 14.5 19.5 15.8579 19.5 20" 
        fill="none" 
        stroke={color} 
        strokeWidth="1.8" 
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

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 z-50 h-[68px] pb-3 pt-1 flex-row items-center justify-around"
      style={{
        backgroundColor: colors.isDark ? "#080C16FA" : "rgba(255, 255, 255, 0.98)", // solid deep glass to completely block text scrolling overlap
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
        const inactiveColor = colors.isDark ? "#7C8BA1" : "#94A3B8";

        return (
          <Pressable
            key={String(item.href)}
            onPress={() => router.push(item.href)}
            className="flex-1 items-center justify-center h-full relative"
          >
            {/* Horizontal glowing indicator directly above the active tab */}
            {active && (
              <View 
                style={{ 
                  position: "absolute",
                  top: -1,
                  width: 32,
                  height: 2.5,
                  backgroundColor: activeColor,
                  borderBottomLeftRadius: 1.5,
                  borderBottomRightRadius: 1.5,
                  shadowColor: activeColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 6,
                }}
              />
            )}

            <View className="items-center justify-center mt-1">
              <TabIcon label={item.label} color={active ? activeColor : inactiveColor} />
            </View>

            <Text
              className={cn(
                "text-[8px] font-black uppercase tracking-[0.08em] mt-1 text-center"
              )}
              style={{ color: active ? activeColor : inactiveColor }}
            >
              {item.label}
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
