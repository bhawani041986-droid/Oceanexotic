import { Tabs } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Store, MessageSquare, User, Package } from "lucide-react-native";
import { Platform } from "react-native";

export default function SellerLayout() {
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
          title: "Store",
          tabBarIcon: ({ color, size }) => (
            <Store color={color} size={size} strokeWidth={2.5} />
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
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
