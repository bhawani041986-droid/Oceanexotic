import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { assetUrl } from "@/config/assets";

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-4 pb-28 pt-2">
        <Text className="text-2xl font-black uppercase italic text-foreground">Mission Registry</Text>
        <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {items.length} line items
        </Text>

        {items.length === 0 ? (
          <View className="my-16 items-center">
            <Text className="text-xs font-black uppercase text-muted-foreground">Cart is empty</Text>
            <Button label="SHOP HARVEST" onPress={() => router.push("/products")} className="mt-6" />
          </View>
        ) : (
          <>
            {items.map((item) => {
              const img =
                item.image?.startsWith("http")
                  ? item.image
                  : item.image
                    ? assetUrl(item.image)
                    : undefined;
              return (
                <View
                  key={item.id}
                  className="mt-4 flex-row gap-3 rounded-2xl border border-white/10 bg-card p-3"
                >
                  {img ? (
                    <Image source={{ uri: img }} className="h-20 w-20 rounded-xl" contentFit="cover" />
                  ) : (
                    <View className="h-20 w-20 items-center justify-center rounded-xl bg-secondary">
                      <Text className="text-2xl">🐟</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-black text-foreground" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text className="mt-1 text-lg font-black italic text-primary">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-3">
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 items-center justify-center rounded-lg bg-secondary"
                      >
                        <Text className="font-bold text-foreground">−</Text>
                      </Pressable>
                      <Text className="text-sm font-black text-foreground">{item.quantity}</Text>
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 items-center justify-center rounded-lg bg-secondary"
                      >
                        <Text className="font-bold text-foreground">+</Text>
                      </Pressable>
                      <Pressable onPress={() => removeItem(item.id)} className="ml-auto">
                        <Text className="text-[10px] font-bold text-danger">Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            {(() => {
              const subtotal = getTotal();
              const tax = subtotal * 0.05;
              const grandTotal = subtotal + tax;
              return (
                <View className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 p-5 gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-[10px] font-black uppercase text-muted-foreground">Subtotal</Text>
                    <Text className="text-[11px] font-bold text-foreground">₹{subtotal.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between border-b border-white/5 pb-2">
                    <Text className="text-[10px] font-black uppercase text-muted-foreground">Regulatory Tax (5%)</Text>
                    <Text className="text-[11px] font-bold text-primary">₹{tax.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between pt-1">
                    <Text className="text-[11px] font-black uppercase text-foreground">Total Settlement</Text>
                    <Text className="text-2xl font-black italic text-foreground">₹{grandTotal.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })()}

            <Button
              label="PROCEED TO CHECKOUT"
              onPress={() => router.push("/checkout" as never)}
              className="mt-4"
            />
            <Button label="CLEAR CART" variant="ghost" onPress={clearCart} className="mt-3" />
          </>
        )}
      </ScrollView>
    </View>
  );
}
