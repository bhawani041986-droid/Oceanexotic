import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";
import { cn } from "@/lib/utils";

export interface ButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "ghost";
}

export function Button({
  label,
  loading,
  disabled,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        "h-14 w-full items-center justify-center rounded-[16px] active:opacity-90",
        variant === "primary" && "bg-primary shadow-lg",
        variant === "ghost" && "bg-transparent",
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#F8FAFC" />
      ) : (
        <Text
          className={cn(
            "text-xs font-black tracking-[0.2em] uppercase",
            variant === "primary" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
