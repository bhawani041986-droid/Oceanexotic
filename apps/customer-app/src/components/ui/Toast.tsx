import { useCallback, useState } from "react";
import { Text, View } from "react-native";
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

  const ToastHost = toast.visible ? (
    <View className="absolute bottom-8 left-6 right-6 z-50">
      <View
        className={cn(
          "rounded-2xl border px-4 py-3",
          toast.type === "success"
            ? "border-primary/30 bg-primary/20"
            : "border-danger/30 bg-danger/20"
        )}
      >
        <Text className="text-center text-xs font-bold text-foreground">{toast.message}</Text>
      </View>
    </View>
  ) : null;

  return { toast: show, ToastHost };
}
