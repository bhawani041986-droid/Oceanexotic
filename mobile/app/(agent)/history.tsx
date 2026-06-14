import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { History as HistoryIcon } from "lucide-react-native";

export default function AgentHistoryScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <HistoryIcon color={colors.textMuted} size={48} opacity={0.5} className="mb-4" />
      <Text className="text-lg font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
        Mission Archive
      </Text>
      <Text className="text-[10px] mt-2" style={{ color: colors.textMuted }}>
        No completed missions yet.
      </Text>
    </SafeAreaView>
  );
}
