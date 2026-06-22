import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { LinearGradient } from "expo-linear-gradient";

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useThemeColors();
  return (
    <View className="gap-1">
      <View>
        <Text className="text-2xl font-black uppercase italic" style={{ color: colors.text }}>{title}</Text>
        <View className="mt-1.5 mb-1" style={{ height: 2, width: 64, borderRadius: 999, overflow: 'hidden' }}>
          <LinearGradient
            colors={[colors.text, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
      <Text className="text-[10px] font-medium uppercase tracking-widest" style={{ color: colors.textMuted }}>
        {subtitle}
      </Text>
    </View>
  );
}
