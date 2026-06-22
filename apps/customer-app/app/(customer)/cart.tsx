import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/hooks/useThemeColors";
import { assetUrl } from "@/config/assets";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { checkoutService } from "@/services/checkoutService";
import api from "@/services/api";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settingsStore";

const staticFallback = [
  { id: 'ADD-001', name: 'Fish Fry Masala', price: 60, image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=200&q=80', description: 'Traditional island spice mix for crispy fish fry.' },
  { id: 'ADD-002', name: 'Fish Curry Masala', price: 80, image_url: 'https://images.unsplash.com/photo-1512223792601-592a9809eed4?auto=format&fit=crop&w=200&q=80', description: 'Rich spices curated for authentic Andaman fish curries.' },
  { id: 'ADD-003', name: 'Garlic Butter Sauce', price: 120, image_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=200&q=80', description: 'Rich buttery sauce infused with garlic and local herbs.' },
  { id: 'ADD-004', name: 'Lemon & Herbs Pack', price: 30, image_url: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=200&q=80', description: 'Fresh lemons' }
];

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal, clearCart, toggleMarination } = useCartStore();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const currentLanguage = useSettingsStore((s) => s.language); // force re-render
  const [addons, setAddons] = useState<any[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(true);

  // Coupon State
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number, type: string, value: number} | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAddons = async () => {
      setLoadingAddons(true);
      try {
        let area = "";
        if (user?.id) {
          try {
            const addresses = await checkoutService.fetchAddresses(user.id);
            const defaultAddr = addresses.find((a: any) => a.is_default || a.primary) || addresses[0];
            if (defaultAddr) {
              area = defaultAddr.jetty || "";
            }
          } catch (addrErr) {
            console.error("Error fetching addresses for addons:", addrErr);
          }
        }
        const { data } = await api.get(`/addons/list?area=${encodeURIComponent(area)}`);
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            setAddons(data);
          } else {
            setAddons(staticFallback);
          }
        }
      } catch (err) {
        console.error("Error fetching dynamic addons:", err);
        if (active) {
          setAddons(staticFallback);
        }
      } finally {
        if (active) {
          setLoadingAddons(false);
        }
      }
    };

    const fetchCoupons = async () => {
      try {
        const { data } = await api.get("/system/coupons");
        if (active && data.status === "success" && data.content) {
          const valid = data.content.filter((c: any) => c.status === "ACTIVE");
          setActiveCoupons(valid);
        }
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };

    fetchAddons();
    fetchCoupons();
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView contentContainerClassName="px-4 pb-28 pt-2">
        <Text className="text-2xl font-black uppercase italic" style={{ color: colors.text }}>{t('active_cart') || "Active Cart"}</Text>
        <Text 
          className="mt-1 text-[10px] font-black uppercase tracking-widest" 
          style={{ color: colors.textMuted }}
        >
          {items.length} line items
        </Text>

        {items.length === 0 ? (
          <View className="my-16 items-center">
            <Text className="text-xs font-black uppercase" style={{ color: colors.textMuted }}>{t('empty_cart')}</Text>
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
              const hasPremium = item.sellerId !== 'ADDON';
              return (
                <View
                  key={item.id}
                  className="mt-4 gap-3 rounded-none border p-3 relative overflow-hidden"
                  style={{ borderColor: colors.border, backgroundColor: colors.card }}
                >
                  <Svg width={12} height={12} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                    <Polygon points="0,0 12,0 0,12" fill={colors.bg} />
                    <Path d="M12,0 L0,12" stroke={colors.border} strokeWidth={1} />
                  </Svg>
                  <Svg width={12} height={12} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                    <Polygon points="12,12 0,12 12,0" fill={colors.bg} />
                    <Path d="M0,12 L12,0" stroke={colors.border} strokeWidth={1} />
                  </Svg>
                  <View className="flex-row gap-3">
                    {img ? (
                      <View className="h-20 w-20 relative overflow-hidden">
                        <Image source={{ uri: img }} className="h-full w-full rounded-none" contentFit="cover" />
                        <Svg width={8} height={8} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                          <Polygon points="0,0 8,0 0,8" fill={colors.card} />
                        </Svg>
                        <Svg width={8} height={8} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                          <Polygon points="8,8 0,8 8,0" fill={colors.card} />
                        </Svg>
                      </View>
                    ) : (
                      <View className="h-20 w-20 items-center justify-center rounded-none relative overflow-hidden" style={{ backgroundColor: colors.bgAlt }}>
                        <Text className="text-2xl">🐟</Text>
                        <Svg width={8} height={8} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                          <Polygon points="0,0 8,0 0,8" fill={colors.card} />
                        </Svg>
                        <Svg width={8} height={8} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                          <Polygon points="8,8 0,8 8,0" fill={colors.card} />
                        </Svg>
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-black" style={{ color: colors.text }} numberOfLines={2}>
                        {item.name}
                      </Text>
                      
                      {hasPremium && (
                        <View className="mt-1.5 flex-row items-center gap-2">
                          <Pressable 
                            onPress={() => toggleMarination(item.id)}
                            className="px-2.5 py-1 rounded-none border relative overflow-hidden"
                            style={{ 
                              borderColor: item.isMarinated ? colors.primary : colors.border,
                              backgroundColor: item.isMarinated ? colors.primary + '1F' : 'transparent'
                            }}
                          >
                            <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                              <Polygon points="0,0 4,0 0,4" fill={colors.card} />
                            </Svg>
                            <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                              <Polygon points="4,4 0,4 4,0" fill={colors.card} />
                            </Svg>
                            <Text className="text-[9px] font-black uppercase relative z-10" style={{ color: item.isMarinated ? colors.primary : colors.textMuted }}>
                              🌶️ {item.isMarinated ? 'Marinated' : 'Add Marinade (+₹150)'}
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      <Text className="mt-2 text-lg font-black italic" style={{ color: colors.primary }}>
                        ₹{((item.price + (item.isMarinated ? 150 : 0)) * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3 border-t pt-2" style={{ borderTopColor: colors.border + '22' }}>
                    <Pressable
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 items-center justify-center rounded-none relative overflow-hidden"
                      style={{ backgroundColor: colors.bgAlt }}
                    >
                      <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.card} /></Svg>
                      <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.card} /></Svg>
                      <Text className="font-bold relative z-10" style={{ color: colors.text }}>−</Text>
                    </Pressable>
                    <Text className="text-sm font-black" style={{ color: colors.text }}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 items-center justify-center rounded-none relative overflow-hidden"
                      style={{ backgroundColor: colors.bgAlt }}
                    >
                      <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.card} /></Svg>
                      <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.card} /></Svg>
                      <Text className="font-bold relative z-10" style={{ color: colors.text }}>+</Text>
                    </Pressable>
                    <Pressable onPress={() => removeItem(item.id)} className="ml-auto">
                      <Text className="text-[10px] font-bold text-danger">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* RECOMMENDED ADD-ONS HORIZONTAL SHELF */}
            {addons.length > 0 && (
              <View className="mt-8">
                <Text className="text-sm font-black uppercase italic" style={{ color: colors.text }}>Complete Your BBQ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row gap-3">
                  {addons.map((addon) => {
                    const alreadyInCart = items.some(i => i.id === addon.id);
                    const addonImg = addon.image_url || addon.image || 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=200&q=80';
                    const addonDesc = addon.description || addon.desc || addon.type || '';
                    return (
                      <View 
                        key={addon.id} 
                        className="w-32 rounded-none border p-2 mr-3 relative overflow-hidden"
                        style={{ borderColor: colors.border, backgroundColor: colors.card }}
                      >
                        <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 6,0 0,6" fill={colors.bg} /></Svg>
                        <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="6,6 0,6 6,0" fill={colors.bg} /></Svg>
                        <View className="h-16 w-full relative overflow-hidden">
                          <Image source={{ uri: addonImg }} className="h-full w-full rounded-none" contentFit="cover" />
                          <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.card} /></Svg>
                          <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.card} /></Svg>
                        </View>
                        <Text className="mt-1 text-[10px] font-black uppercase" style={{ color: colors.text }} numberOfLines={1}>
                          {addon.name}
                        </Text>
                        <Text className="text-[8px]" style={{ color: colors.textMuted }} numberOfLines={1}>
                          {addonDesc}
                        </Text>
                        <View className="mt-2 flex-row items-center justify-between">
                          <Text className="text-[10px] font-bold" style={{ color: colors.text }}>₹{addon.price}</Text>
                          <Pressable 
                            disabled={alreadyInCart}
                            onPress={() => {
                              useCartStore.getState().addItem({
                                id: addon.id,
                                name: addon.name,
                                price: Number(addon.price),
                                quantity: 1,
                                image: addonImg,
                                sellerId: 'ADDON'
                              });
                            }}
                            className="px-2 py-0.5 rounded-none relative overflow-hidden"
                            style={{ backgroundColor: alreadyInCart ? colors.border : colors.primary }}
                          >
                            <Svg width={4} height={4} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 4,0 0,4" fill={colors.card} /></Svg>
                            <Svg width={4} height={4} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="4,4 0,4 4,0" fill={colors.card} /></Svg>
                            <Text className="text-[8px] font-black uppercase relative z-10" style={{ color: alreadyInCart ? colors.textMuted : colors.bg }}>
                              {alreadyInCart ? 'ADDED' : 'ADD'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* COUPONS SECTION */}
            <View className="mt-8">
               <Text className="text-sm font-black uppercase italic mb-3" style={{ color: colors.text }}>Promo Codes</Text>
               
               {activeCoupons.length > 0 && (
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row gap-3">
                   {activeCoupons.map(coupon => (
                     <Pressable 
                        key={coupon.id} 
                        onPress={() => {
                          setCouponCodeInput(coupon.code);
                          setCouponError("");
                        }}
                        className="rounded-none border p-3 min-w-[140px] mr-3 relative overflow-hidden"
                        style={{ borderColor: `${colors.border}`, backgroundColor: colors.card }}
                     >
                       <Svg width={8} height={8} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}><Polygon points="0,0 8,0 0,8" fill={colors.bg} /></Svg>
                       <Svg width={8} height={8} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}><Polygon points="8,8 0,8 8,0" fill={colors.bg} /></Svg>
                       <Text className="text-xs font-black uppercase" style={{ color: colors.primary }}>{coupon.code}</Text>
                       <Text className="text-[10px] font-bold mt-1" style={{ color: colors.text }}>
                         {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                       </Text>
                       {coupon.min_purchase > 0 && (
                         <Text className="text-[8px] mt-1" style={{ color: colors.textMuted }}>Min ₹{coupon.min_purchase}</Text>
                       )}
                     </Pressable>
                   ))}
                 </ScrollView>
               )}

               {appliedCoupon ? (
                 <View className="flex-row items-center justify-between p-3 rounded-none border-2 bg-emerald-500/10 border-emerald-500/30 relative overflow-hidden">
                    <Svg width={8} height={8} style={{ position: 'absolute', top: -2, left: -2, zIndex: 10 }}><Polygon points="0,0 8,0 0,8" fill={colors.bg} /></Svg>
                    <Svg width={8} height={8} style={{ position: 'absolute', bottom: -2, right: -2, zIndex: 10 }}><Polygon points="8,8 0,8 8,0" fill={colors.bg} /></Svg>
                    <View className="flex-row items-center gap-2">
                       <Text className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{appliedCoupon.code} APPLIED</Text>
                    </View>
                    <Pressable onPress={() => {
                       setAppliedCoupon(null);
                       setCouponCodeInput("");
                    }}>
                       <Text className="text-[10px] font-bold text-danger">REMOVE</Text>
                    </Pressable>
                 </View>
               ) : (
                 <View className="flex-row gap-2 relative">
                    <View className="flex-1 relative overflow-hidden">
                      <TextInput 
                        value={couponCodeInput}
                        onChangeText={(t: string) => setCouponCodeInput(t.toUpperCase())}
                        placeholder="ENTER CODE"
                        placeholderTextColor={colors.textMuted}
                        className="h-full rounded-none border px-4 py-2 text-xs font-black uppercase tracking-widest"
                        style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
                      />
                      <Svg width={6} height={6} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}><Polygon points="0,0 6,0 0,6" fill={colors.bg} /></Svg>
                      <Svg width={6} height={6} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}><Polygon points="6,6 0,6 6,0" fill={colors.bg} /></Svg>
                    </View>
                    <Pressable 
                      onPress={() => {
                        setIsApplyingCoupon(true);
                        setCouponError("");
                        const found = activeCoupons.find(c => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase());
                        if (!found) {
                          setCouponError("Invalid code");
                          setIsApplyingCoupon(false);
                          return;
                        }
                        const sub = getTotal();
                        if (found.min_purchase && sub < found.min_purchase) {
                          setCouponError(`Min purchase ₹${found.min_purchase}`);
                          setIsApplyingCoupon(false);
                          return;
                        }
                        let discount = found.type === "PERCENTAGE" ? (sub * found.value) / 100 : found.value;
                        if (found.max_discount && discount > found.max_discount) discount = found.max_discount;
                        setAppliedCoupon({ code: found.code, discountAmount: discount, type: found.type, value: found.value });
                        setIsApplyingCoupon(false);
                      }}
                      className="rounded-none px-6 py-2 items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: couponCodeInput.trim() ? colors.primary : colors.border }}
                    >
                       <Svg width={6} height={6} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}><Polygon points="0,0 6,0 0,6" fill={colors.bg} /></Svg>
                       <Svg width={6} height={6} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }}><Polygon points="6,6 0,6 6,0" fill={colors.bg} /></Svg>
                       <Text className="text-[10px] font-black uppercase tracking-widest relative z-10" style={{ color: couponCodeInput.trim() ? colors.bg : colors.textMuted }}>
                         {isApplyingCoupon ? "..." : "APPLY"}
                       </Text>
                    </Pressable>
                    {couponError ? <Text className="absolute -bottom-5 left-1 text-[8px] font-bold text-danger uppercase">{couponError}</Text> : null}
                 </View>
               )}
            </View>

            {(() => {
              const subtotal = getTotal();
              const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
              const tax = (subtotal - discount) * 0.05;
              const grandTotal = Math.max(0, subtotal - discount + tax);
              return (
                <View 
                  className="mt-6 rounded-none border p-5 gap-2 relative overflow-hidden"
                  style={{ 
                    borderColor: colors.primary + "33", 
                    backgroundColor: colors.primary + "1A" 
                  }}
                >
                  <Svg width={16} height={16} style={{ position: 'absolute', top: -1, left: -1, zIndex: 10 }}>
                    <Polygon points="0,0 16,0 0,16" fill={colors.bg} />
                    <Path d="M16,0 L0,16" stroke={colors.primary + "33"} strokeWidth={1} />
                  </Svg>
                  <Svg width={16} height={16} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 10 }}>
                    <Polygon points="16,16 0,16 16,0" fill={colors.bg} />
                    <Path d="M0,16 L16,0" stroke={colors.primary + "33"} strokeWidth={1} />
                  </Svg>
                  <View className="flex-row justify-between">
                    <Text className="text-[10px] font-black uppercase" style={{ color: colors.textMuted }}>Subtotal</Text>
                    <Text className="text-[11px] font-bold" style={{ color: colors.text }}>₹{subtotal.toLocaleString()}</Text>
                  </View>
                  {appliedCoupon && (
                    <View className="flex-row justify-between">
                      <Text className="text-[10px] font-black uppercase text-emerald-500">Discount ({appliedCoupon.code})</Text>
                      <Text className="text-[11px] font-bold text-emerald-500">-₹{discount.toLocaleString()}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between border-b pb-2" style={{ borderBottomColor: colors.border }}>
                    <Text className="text-[10px] font-black uppercase" style={{ color: colors.textMuted }}>Regulatory Tax (5%)</Text>
                    <Text className="text-[11px] font-bold" style={{ color: colors.primary }}>₹{tax.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between pt-1">
                    <Text className="text-[11px] font-black uppercase" style={{ color: colors.text }}>{t('total')}</Text>
                    <Text className="text-2xl font-black italic" style={{ color: colors.text }}>₹{grandTotal.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })()}

            <Button
              label={t('checkout').toUpperCase()}
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

