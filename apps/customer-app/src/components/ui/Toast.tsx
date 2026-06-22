import { useCallback, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    visible: false,
  });

  const show = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  }, []);

  // 10px bevel triangle color matching the toast type
  const bevelColor = toast.type === "success" ? "rgba(0,240,120,0.08)" : "rgba(240,60,60,0.08)";

  const ToastHost = toast.visible ? (
    <View className="absolute bottom-8 left-6 right-6 z-50">
      <View
        className={cn(
          "rounded-none border px-4 py-3 relative overflow-hidden",
          toast.type === "success"
            ? "border-primary/30 bg-primary/20"
            : "border-danger/30 bg-danger/20"
        )}
      >
        <Text className="text-center text-xs font-bold text-foreground">{toast.message}</Text>
        {/* Cut-corner bevel overlays */}
        <Svg width={10} height={10} style={[StyleSheet.absoluteFill, { width: 10, height: 10, top: -1, left: -1 }]}>
          <Path d="M0,0 L10,0 L0,10 Z" fill={bevelColor} />
        </Svg>
        <Svg width={10} height={10} style={{ position: 'absolute', bottom: -1, right: -1 }}>
          <Path d="M10,10 L0,10 L10,0 Z" fill={bevelColor} />
        </Svg>
      </View>
    </View>
  ) : null;

  return { toast: show, ToastHost };
}
