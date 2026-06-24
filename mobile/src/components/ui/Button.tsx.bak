import { useState } from "react";
import { Pressable, Text, ActivityIndicator, PressableProps, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import { useThemeColors } from "@/hooks/useThemeColors";

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
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const w = layout.width;
  const h = layout.height;
  const b = 14; // Bevel corner offset matching web

  const colors = useThemeColors();
  const primaryBgColor = colors.primary;

  const pathD = w && h ? `M${b},0 L${w},0 L${w},${h - b} L${w - b},${h} L0,${h} L0,${b} Z` : "";

  return (
    <Pressable
      disabled={isDisabled}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      className={cn(
        "h-14 w-full items-center justify-center active:opacity-90 relative overflow-hidden",
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {/* Dynamic Svg Beveled Corner Background */}
      {w > 0 && h > 0 ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Path
            d={pathD}
            fill={variant === "primary" ? primaryBgColor : "rgba(2, 6, 23, 0.4)"}
            stroke={variant === "ghost" ? "rgba(255, 255, 255, 0.15)" : "transparent"}
            strokeWidth="1.5"
          />
        </Svg>
      ) : null}

      {loading ? (
        <ActivityIndicator color="#F8FAFC" />
      ) : (
        <Text
          className={cn(
            "text-xs font-black tracking-[0.2em] uppercase relative z-10",
            variant === "primary" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
