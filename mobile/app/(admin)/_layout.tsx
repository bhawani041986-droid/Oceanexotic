import { Tabs } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ShieldAlert, MessageSquare, User, Activity } from "lucide-react-native";
import { Platform } from "react-native";

export default function AdminLayout() {
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
          title: "Command",
          tabBarIcon: ({ color, size }) => (
            <ShieldAlert color={color} size={size} strokeWidth={2.5} />
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
        name="metrics"
        options={{
          title: "Metrics",
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
