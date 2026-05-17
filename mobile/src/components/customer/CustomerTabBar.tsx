import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

const NAV: { label: string; href: Href; color: string }[] = [
  { label: "Home", href: "/home", color: "#00D1FF" },
  { label: "Market", href: "/products", color: "#10B981" },
  { label: "Orders", href: "/orders", color: "#FACC15" },
  { label: "Profile", href: "/profile", color: "#EC4899" },
];

function pathActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCartStore((s) => s.itemCount());

  return (
    <View className="absolute bottom-4 left-4 right-4 z-50 h-12 flex-row items-center justify-around rounded-2xl border border-white/10 bg-card/95 px-2">
      {NAV.map((item) => {
        const active = pathActive(pathname, String(item.href));

        return (
          <Pressable
            key={String(item.href)}
            onPress={() => router.push(item.href)}
            className="flex-1 items-center py-1"
          >
            <View
              className={cn("mb-0.5 h-1 w-1 rounded-full", active ? "opacity-100" : "opacity-0")}
              style={{ backgroundColor: item.color }}
            />
            <Text
              className={cn(
                "text-[9px] font-black uppercase tracking-tighter",
                active ? "text-foreground" : "text-muted-foreground"
              )}
              style={active ? { color: item.color } : undefined}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
      {count > 0 ? (
        <View className="absolute -top-1 right-2 rounded-full bg-primary px-1.5 py-0.5">
          <Text className="text-[8px] font-black text-foreground">{count}</Text>
        </View>
      ) : null}
    </View>
  );
}
