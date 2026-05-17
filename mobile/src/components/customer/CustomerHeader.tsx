import { useState } from "react";
import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

interface CustomerHeaderProps {
  showSearch?: boolean;
}

const MenuIcon = () => (
  <View className="h-5 w-5 justify-between py-1">
    <View className="h-[2px] w-full bg-primary" />
    <View className="h-[2px] w-4/5 bg-primary" />
    <View className="h-[2px] w-full bg-primary" />
  </View>
);

export function CustomerHeader({ showSearch = true }: CustomerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onSearch = () => {
    router.push({
      pathname: "/products",
      params: search.trim() ? { search: search.trim() } : {},
    });
  };

  const navigateTo = (href: string) => {
    setIsMenuOpen(false);
    router.push(href as any);
  };

  return (
    <SafeAreaView edges={["top"]} className="border-b border-white/10 bg-background/95">
      <View className="px-3 pb-2 pt-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 max-w-[75%]">
            <Pressable 
              onPress={() => setIsMenuOpen(true)} 
              className="p-1 rounded-lg border border-white/5 bg-white/5 active:bg-white/10"
            >
              <MenuIcon />
            </Pressable>
            <Pressable onPress={() => router.push("/home")} className="flex-1">
              <Logo size="sm" />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push("/cart")}
              className="relative rounded-full border border-primary/30 bg-primary/10 px-3 py-2"
            >
              <Text className="text-[10px] font-black text-primary">CART</Text>
              {cartCount > 0 ? (
                <View className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-primary px-1">
                  <Text className="text-center text-[8px] font-black text-foreground">{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => router.push("/profile")}
              className="h-9 max-w-[72px] rounded-full border border-white/10 bg-card px-2 justify-center"
            >
              <Text className="text-[8px] font-black uppercase text-foreground" numberOfLines={1}>
                {user?.name?.split(" ")[0] ?? "You"}
              </Text>
            </Pressable>
          </View>
        </View>

        {showSearch && pathname !== "/login" ? (
          <View className="mt-2">
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSearch}
              placeholder="Search harvests..."
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
              className="h-10 rounded-xl border border-white/10 bg-card/80 px-4 text-xs text-foreground"
            />
            <Text className="mt-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              Port Blair • Live Harbor Sync
            </Text>
          </View>
        ) : null}

        <View className="mt-2 flex-row gap-3">
          {[
            { label: "Home", href: "/home" },
            { label: "Market", href: "/products" },
            { label: "Orders", href: "/orders" },
          ].map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Pressable key={item.href} onPress={() => router.push(item.href as never)}>
                <Text
                  className={cn(
                    "text-[9px] font-black uppercase tracking-wider",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Slide-out Left Navigation Drawer */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View className="flex-1 flex-row">
          <Pressable 
            className="absolute inset-0 bg-black/60" 
            onPress={() => setIsMenuOpen(false)} 
          />
          <View className="w-[280px] h-full bg-[#080d19] border-r border-white/10 p-5 pt-12 gap-6 relative shadow-2xl justify-between">
            <View className="gap-6">
              <View className="flex-row items-center justify-between">
                <Logo size="sm" />
                <Pressable 
                  onPress={() => setIsMenuOpen(false)} 
                  className="h-6 w-6 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/10"
                >
                  <Text className="text-[10px] font-black text-muted-foreground">✕</Text>
                </Pressable>
              </View>

              <View className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-emerald-500" />
                <View className="flex-1">
                  <Text className="text-[8px] font-black uppercase text-primary tracking-widest">Active Sovereign Node</Text>
                  <Text className="text-[10px] font-bold text-foreground" numberOfLines={1}>{user?.email ?? "Guest Mode"}</Text>
                </View>
              </View>

              <View className="gap-2">
                {[
                  { label: "Home Base", href: "/home" },
                  { label: "Harbor Market", href: "/products" },
                  { label: "Mission Orders", href: "/orders" },
                  { label: "Sovereign Profile", href: "/profile" },
                  { label: "Active Cart", href: "/cart" }
                ].map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Pressable 
                      key={item.href} 
                      onPress={() => navigateTo(item.href)} 
                      className={cn(
                        "flex-row items-center px-4 py-3 rounded-xl border",
                        active 
                          ? "bg-primary/10 border-primary/20" 
                          : "bg-white/5 border-white/5 active:bg-white/10"
                      )}
                    >
                      <Text className={cn(
                        "text-xs font-black uppercase tracking-wider",
                        active ? "text-primary" : "text-foreground"
                      )}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-2 pb-6">
              <Pressable 
                onPress={() => {
                  setIsMenuOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/10 items-center active:bg-red-500/20"
              >
                <Text className="text-xs font-black uppercase tracking-widest text-red-400">Terminate Access</Text>
              </Pressable>
              <Text className="text-[7px] font-black text-center text-muted-foreground uppercase tracking-widest">OceanExotic Mobile Security Protocol v1.4</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

