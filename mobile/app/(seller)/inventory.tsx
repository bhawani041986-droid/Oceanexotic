import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Package } from "lucide-react-native";

export default function SellerInventoryScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
      <Package color={colors.textMuted} size={48} opacity={0.5} className="mb-4" />
      <Text className="text-lg font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
        Inventory Vault
      </Text>
    </SafeAreaView>
  );
}
