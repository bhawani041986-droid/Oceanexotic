import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Store } from "lucide-react-native";

export default function SellerDashboardScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
      <Store color={colors.primary} size={64} opacity={0.8} className="mb-6" />
      <Text className="text-3xl font-black uppercase tracking-tighter italic text-center mb-2" style={{ color: colors.text }}>
        Storefront HQ
      </Text>
      <Text className="text-xs font-bold tracking-widest text-center uppercase" style={{ color: colors.textMuted }}>
        Seller Dashboard under construction
      </Text>
    </SafeAreaView>
  );
}
