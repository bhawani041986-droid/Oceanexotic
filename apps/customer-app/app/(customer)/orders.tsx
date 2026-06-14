import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { orderService, type CustomerOrder } from "@/services/orderService";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import i18n from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const { settings } = useSettingsStore();
  const currentLanguage = settings.language; // force re-render
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  const load = async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const data = await orderService.getCustomerOrders(user.id);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    load();
  }, [isHydrated, user?.id]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-28 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <Text className="text-2xl font-black uppercase italic" style={{ color: colors.text }}>{i18n.t('order_history')}</Text>
        <Text 
          className="mt-1 text-[10px] font-black uppercase tracking-widest" 
          style={{ color: colors.textMuted }}
        >
          Tracking {orders.length} active & past commissions
        </Text>

        {loading ? (
          <View className="my-16 items-center">
            <ActivityIndicator color={colors.primary} size="large" />
            <Text className="mt-4 text-[10px] font-black uppercase" style={{ color: colors.textMuted }}>
              Synchronizing ledger…
            </Text>
          </View>
        ) : orders.length > 0 ? (
          <View className="mt-6 gap-3">
            {orders.map((order) => (
              <View 
                key={order.id} 
                className="overflow-hidden rounded-2xl border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-black uppercase italic" style={{ color: colors.text }}>{order.id}</Text>
                    <View
                      className={cn(
                        "mt-1 self-start rounded-full px-2 py-0.5",
                        order.status === "DELIVERED" ? "bg-emerald-500/20" : "bg-primary/20"
                      )}
                    >
                      <Text className="text-[8px] font-black uppercase" style={{ color: colors.text }}>{order.status}</Text>
                    </View>
                    <Text 
                      className="mt-2 text-[9px] font-black uppercase tracking-widest" 
                      style={{ color: colors.textMuted }}
                    >
                      {order.date} • {order.items} items
                    </Text>
                  </View>
                  <Text className="text-xl font-black italic" style={{ color: colors.text }}>
                    ₹{Number(order.total).toLocaleString()}
                  </Text>
                </View>
                <View className="mt-4 flex-row gap-2">
                  <Button
                    label="VIEW DETAILS"
                    variant="ghost"
                    onPress={() =>
                      router.push({ pathname: "/orders/[id]", params: { id: order.id } } as never)
                    }
                    className="flex-1 h-10 rounded-xl"
                    style={{ borderColor: colors.border, borderWidth: 1 }}
                  />
                  {order.status === "IN TRANSIT" && (
                    <Button
                      label="TRACK"
                      onPress={() =>
                        router.push({ pathname: "/orders/[id]/tracking", params: { id: order.id } } as never)
                      }
                      className="flex-1 h-10 rounded-xl"
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View 
            className="my-16 items-center rounded-2xl border border-dashed p-8"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs font-black uppercase" style={{ color: colors.textMuted }}>No commissions yet</Text>
            <Button label="BROWSE HARVEST" onPress={() => router.push("/products")} className="mt-6" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
