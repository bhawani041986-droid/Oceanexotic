import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { User, LogOut } from "lucide-react-native";

export default function SellerProfileScreen() {
  const colors = useThemeColors();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 p-6" style={{ backgroundColor: colors.bg }}>
      <Text className="text-2xl font-black italic uppercase tracking-tighter mb-8" style={{ color: colors.text }}>
        Store Owner
      </Text>
      
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <User color={colors.textMuted} size={48} />
        </View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          {user?.name || "Seller Name"}
        </Text>
        <Text className="text-sm uppercase tracking-widest mt-1" style={{ color: colors.primary }}>
          {user?.id || "SEL-001"}
        </Text>
      </View>

      <Pressable 
        onPress={handleLogout}
        className="w-full h-14 rounded-2xl flex-row items-center justify-center gap-3 border"
        style={{ borderColor: "rgba(239, 68, 68, 0.3)", backgroundColor: "rgba(239, 68, 68, 0.1)" }}
      >
        <LogOut color="#EF4444" size={20} />
        <Text className="text-xs font-black uppercase tracking-widest text-red-500">
          Close Storefront (Logout)
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
