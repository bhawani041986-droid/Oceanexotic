import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { orderService, type CustomerOrder } from "@/services/orderService";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { SectionTitle } from "@/components/customer/SectionTitle";
import { ChamferedBox } from "@/components/ui/ChamferedBox";

export default function OrdersScreen() {
  const { t } = useTranslation();

  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const currentLanguage = useSettingsStore((s) => s.language); // force re-render
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
                <SectionTitle 
          title={t('order_history') || "Order History"} 
          subtitle={orders.length === 1 ? "Showing 1 order" : `Showing ${orders.length} orders`} 
        />

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
              <ChamferedBox
                key={order.id}
                fillColor={colors.card}
                strokeColor={colors.border}
                bevelSize={14}
                className="mb-3"
              >
                <View className="p-5">
                  <View className="flex-row items-center justify-between border-b pb-3 mb-3" style={{ borderBottomColor: colors.border }}>
                    <View>
                      <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                        Order ID
                      </Text>
                      <Text className="text-base font-black uppercase italic" style={{ color: colors.text }}>
                        {order.id}
                      </Text>
                    </View>
                    
                    {/* Status Badge */}
                    <View
                      className="rounded px-2.5 py-1"
                      style={{
                        backgroundColor: order.status === "DELIVERED" ? "rgba(16, 185, 129, 0.12)" : colors.primary + "1A"
                      }}
                    >
                      <Text 
                        className="text-[9px] font-black uppercase tracking-wider" 
                        style={{ color: order.status === "DELIVERED" ? "#10B981" : colors.primary }}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-[9px] font-black uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Placed On
                      </Text>
                      <Text className="text-xs font-bold" style={{ color: colors.text, marginTop: 1 }}>
                        {order.date}
                      </Text>
                      <Text className="text-[9px] font-black uppercase tracking-wider mt-1.5" style={{ color: colors.textMuted }}>
                        Items Quantity
                      </Text>
                      <Text className="text-xs font-bold" style={{ color: colors.text, marginTop: 1 }}>
                        {order.items} items
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-[9px] font-black uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Total Amount
                      </Text>
                      <Text className="text-2xl font-black italic mt-0.5" style={{ color: colors.text }}>
                        ₹{Number(order.total).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-5 flex-row gap-3">
                    <Button
                      label="VIEW DETAILS"
                      variant="ghost"
                      onPress={() =>
                        router.push({ pathname: "/orders/[id]", params: { id: order.id } } as never)
                      }
                      className="flex-1 h-10"
                    />
                    {!["DELIVERED", "CANCELLED"].includes(order.status?.toUpperCase() ?? "") && (
                      <Button
                        label="TRACK LIVE"
                        onPress={() =>
                          router.push({ pathname: "/orders/[id]/tracking", params: { id: order.id } } as never)
                        }
                        className="flex-1 h-10"
                      />
                    )}
                  </View>
                </View>
              </ChamferedBox>
            ))}
          </View>
        ) : (
          <View 
            className="my-16 items-center rounded-none border border-dashed p-8 relative overflow-hidden"
            style={{ borderColor: colors.border }}
          >
            <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 12,0 0,12" fill={colors.bg} /></Svg>
            <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="12,12 0,12 12,0" fill={colors.bg} /></Svg>
            <Text className="text-xs font-black uppercase" style={{ color: colors.textMuted }}>No commissions yet</Text>
            <Button label="BROWSE HARVEST" onPress={() => router.push("/products")} className="mt-6" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

