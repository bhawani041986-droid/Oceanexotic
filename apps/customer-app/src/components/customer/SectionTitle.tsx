import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { LinearGradient } from "expo-linear-gradient";

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useThemeColors();
  return (
    <View className="gap-1">
      <View>
        <Text className="text-lg font-black uppercase tracking-tight" style={{ color: colors.primary }}>
          {title}
        </Text>
        <View className="mt-1.5 mb-2" style={{ height: 3, width: 80, borderRadius: 999, overflow: 'hidden' }}>
          <LinearGradient
            colors={[colors.primary, '#00F3FF', '#FF5E36']} // Theme Primary -> Neon Cyan -> Neon Coral
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      <Text className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
        {subtitle}
      </Text>
    </View>
  );
}
