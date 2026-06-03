import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useThemeColors();
  return (
    <View className="gap-1">
      <Text className="text-2xl font-black uppercase italic" style={{ color: colors.text }}>{title}</Text>
      <Text className="text-[10px] font-medium uppercase tracking-widest" style={{ color: colors.textMuted }}>
        {subtitle}
      </Text>
    </View>
  );
}
