import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { cn } from "@/lib/utils";
import { useAgentStore, MOODS } from "@/store/agentStore";

const NAV: { label: string; href: Href }[] = [
  { label: "Missions", href: "/(agent)/dashboard" as any },
  { label: "Live Trace", href: "/(agent)/tracking" as any },
  { label: "History", href: "/(agent)/history" as any },
  { label: "Profile", href: "/(agent)/profile" as any },
];

function pathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabIcon({ label, color }: { label: string; color: string }) {
  const normalizedLabel = label.toLowerCase();
  
  if (normalizedLabel === "missions") {
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

  if (normalizedLabel === "live trace") {
    // Navigation/Compass Icon
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 11l19-9-9 19-2-8-8-2z" />
      </Svg>
    );
  }

  if (normalizedLabel === "history") {
    // History clock
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <Path d="M3 3v5h5" />
        <Path d="M12 7v5l4 2" />
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

export function AgentTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentMood = useAgentStore((s) => s.currentMood);
  const mood = MOODS[currentMood];
  
  // Custom HUD styling for Sentinel theme: clip-path shape emulation or futuristic look
  const isLight = currentMood === "DAYLIGHT";

  return (
    <View 
      className="absolute bottom-4 left-4 right-4 z-50 h-[58px] flex-row items-center justify-around px-4"
      style={{
        backgroundColor: isLight ? "#F8FAFCFD" : "rgba(15, 23, 42, 0.95)",
        borderWidth: 1.5,
        borderColor: mood.border,
        borderRadius: 20,
        shadowColor: mood.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isLight ? 0.08 : 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      {NAV.map((item) => {
        const active = pathActive(pathname, String(item.href));
        const activeColor = mood.primary;
        const inactiveColor = isLight ? "#94A3B8" : "rgba(255, 255, 255, 0.4)";

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
              className={cn(
                "text-[7px] font-black uppercase tracking-[0.15em] mt-1 text-center"
              )}
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
