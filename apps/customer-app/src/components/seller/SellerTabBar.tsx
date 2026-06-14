import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { cn } from "@/lib/utils";

const NAV: { label: string; href: Href }[] = [
  { label: "Dashboard", href: "/(seller)/dashboard" as any },
  { label: "Inventory", href: "/(seller)/inventory" as any },
  { label: "Orders", href: "/(seller)/orders" as any },
  { label: "Profile", href: "/(seller)/profile" as any },
];

function pathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabIcon({ label, color }: { label: string; color: string }) {
  const normalizedLabel = label.toLowerCase();
  
  if (normalizedLabel === "dashboard") {
    // LayoutDashboard
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 3h7v9H3z" />
        <Path d="M14 3h7v5h-7z" />
        <Path d="M14 12h7v9h-7z" />
        <Path d="M3 16h7v5H3z" />
      </Svg>
    );
  }

  if (normalizedLabel === "inventory") {
    // Anchor/Box icon
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2L2 7l10 5 10-5-10-5z" />
        <Path d="M2 17l10 5 10-5" />
        <Path d="M2 12l10 5 10-5" />
      </Svg>
    );
  }

  if (normalizedLabel === "orders") {
    // Receipt/List icon
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </Svg>
    );
  }

  // Profile / User
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function SellerTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const primaryColor = "#7C3AED"; // purple accent
  const borderColor = "rgba(124, 58, 237, 0.25)";
  const activeColor = primaryColor;
  const inactiveColor = "rgba(255, 255, 255, 0.4)";

  return (
    <View 
      className="absolute bottom-4 left-4 right-4 z-50 h-[58px] flex-row items-center justify-around px-4"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderWidth: 1.5,
        borderColor: borderColor,
        borderRadius: 20,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      {NAV.map((item) => {
        const active = pathActive(pathname, String(item.href));

        return (
          <Pressable
            key={String(item.href)}
            onPress={() => router.push(item.href)}
            className="flex-grow items-center justify-center h-full relative"
          >
            {active && (
              <View 
                style={{ 
                  position: "absolute",
                  top: 0,
                  width: 24,
                  height: 3,
                  backgroundColor: activeColor,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
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
              className="text-[7px] font-black uppercase tracking-[0.15em] mt-1 text-center"
              style={{ color: active ? activeColor : inactiveColor }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
