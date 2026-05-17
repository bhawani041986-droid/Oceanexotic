import { View, Text } from "react-native";

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="gap-1">
      <Text className="text-2xl font-black uppercase italic text-foreground">{title}</Text>
      <Text className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {subtitle}
      </Text>
    </View>
  );
}
