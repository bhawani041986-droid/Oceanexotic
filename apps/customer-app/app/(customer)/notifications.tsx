import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import i18n from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const currentLanguage = settings.language; // force re-render

  const mockNotifications = [
    {
      id: "1",
      title: "Order Dispatched",
      message: "Your order #ORD-892 is out for delivery with our fleet.",
      time: "2 mins ago",
      icon: "boat-outline",
      unread: true,
    },
    {
      id: "2",
      title: "Flash Deal Active",
      message: "Premium Bluefin Tuna is now 20% off for the next hour!",
      time: "1 hour ago",
      icon: "flash-outline",
      unread: false,
    },
    {
      id: "3",
      title: "Welcome to OceanExotic",
      message: "Thank you for joining the ultimate maritime marketplace.",
      time: "2 days ago",
      icon: "water-outline",
      unread: false,
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <Text
        className="text-2xl font-black uppercase mb-6"
        style={{ color: colors.text }}
      >
        {i18n.t('notifications')}
      </Text>

      <View className="gap-4">
        {mockNotifications.map((notif) => (
          <View
            key={notif.id}
            className="flex-row p-4 rounded-2xl border"
            style={{
              backgroundColor: notif.unread ? colors.primary + "10" : colors.card,
              borderColor: notif.unread ? colors.primary + "30" : colors.border,
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4 border"
              style={{
                backgroundColor: notif.unread ? colors.primary + "20" : colors.bgAlt,
                borderColor: notif.unread ? colors.primary + "40" : colors.border,
              }}
            >
              <Ionicons
                name={notif.icon as any}
                size={20}
                color={notif.unread ? colors.primary : colors.textMuted}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-1">
                <Text
                  className="text-sm font-bold uppercase tracking-wide flex-1 mr-2"
                  style={{ color: colors.text }}
                >
                  {notif.title}
                </Text>
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: colors.textMuted }}
                >
                  {notif.time}
                </Text>
              </View>
              <Text
                className="text-xs leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {notif.message}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
