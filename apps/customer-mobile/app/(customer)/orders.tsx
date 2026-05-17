import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { orderService, type CustomerOrder } from "@/services/orderService";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    <View className="flex-1 bg-background">
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
            tintColor="#7C3AED"
          />
        }
      >
        <Text className="text-2xl font-black uppercase italic text-foreground">Order History</Text>
        <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Tracking {orders.length} active & past commissions
        </Text>

        {loading ? (
          <View className="my-16 items-center">
            <ActivityIndicator color="#7C3AED" size="large" />
            <Text className="mt-4 text-[10px] font-black uppercase text-muted-foreground">
              Synchronizing ledger…
            </Text>
          </View>
        ) : orders.length > 0 ? (
          <View className="mt-6 gap-3">
            {orders.map((order) => (
              <View key={order.id} className="overflow-hidden rounded-2xl border border-white/10 bg-card p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-black uppercase italic text-foreground">{order.id}</Text>
                    <View
                      className={cn(
                        "mt-1 self-start rounded-full px-2 py-0.5",
                        order.status === "DELIVERED" ? "bg-emerald-500/20" : "bg-primary/20"
                      )}
                    >
                      <Text className="text-[8px] font-black uppercase text-foreground">{order.status}</Text>
                    </View>
                    <Text className="mt-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {order.date} • {order.items} items
                    </Text>
                  </View>
                  <Text className="text-xl font-black italic text-foreground">
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
                    className="flex-1 border border-white/10 h-10 rounded-xl"
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
          <View className="my-16 items-center rounded-2xl border border-dashed border-white/10 p-8">
            <Text className="text-xs font-black uppercase text-muted-foreground">No commissions yet</Text>
            <Button label="BROWSE HARVEST" onPress={() => router.push("/products")} className="mt-6" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
