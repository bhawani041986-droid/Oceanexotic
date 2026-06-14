import { Tabs } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Navigation, MessageSquare, User, History } from "lucide-react-native";
import { Platform } from "react-native";

export default function AgentLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "900",
          fontFamily: "Inter-Black",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Missions",
          tabBarIcon: ({ color, size }) => (
            <Navigation color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Comms",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MessageSquare color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <History color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Operator",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
