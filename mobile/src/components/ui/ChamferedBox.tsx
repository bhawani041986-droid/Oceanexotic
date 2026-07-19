import React, { useState } from "react";
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Defs } from "react-native-svg";
import { cn } from "@/lib/utils";

export interface ChamferedBoxProps extends ViewProps {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  bevelSize?: number;
  /** When true, the fill is transparent — only the stroke (border) is drawn */
  borderOnly?: boolean;
  /** Optional neon glow color applied as shadow/elevation */
  glowColor?: string;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
  /** Pass SVG <LinearGradient> elements here to use them in fillColor="url(#myGrad)" */
  gradientDefs?: React.ReactNode;
}

export function ChamferedBox({
  fillColor = "rgba(2, 6, 23, 0.4)",
  strokeColor = "rgba(255, 255, 255, 0.15)",
  strokeWidth = 1,
  bevelSize = 14,
  borderOnly = false,
  glowColor,
  contentClassName,
  contentStyle,
  gradientDefs,
  children,
  className,
  style,
  ...props
}: ChamferedBoxProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const w = layout.width;
  const h = layout.height;
  const b = bevelSize;

  // The path starts at top-left (shifted right by bevel), goes to top-right,
  // down to bottom-right (shifted up by bevel), left to bottom-left, up to top-left.
  const pathD =
    w > 0 && h > 0
      ? `M${b},0 L${w},0 L${w},${h - b} L${w - b},${h} L0,${h} L0,${b} Z`
      : "";

  const resolvedFill = borderOnly ? "transparent" : fillColor;

  const glowStyle = glowColor
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 6,
      }
    : {};

  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (
          Math.abs(width - layout.width) > 1 ||
          Math.abs(height - layout.height) > 1
        ) {
          setLayout({ width, height });
        }
      }}
      className={cn("relative overflow-hidden", className)}
      style={[{ flexShrink: 1 }, style, glowStyle]}
      {...props}
    >
      {/* Background and Border layer */}
      {w > 0 && h > 0 ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          {gradientDefs ? <Defs>{gradientDefs}</Defs> : null}
          <Path
            d={pathD}
            fill={resolvedFill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Svg>
      ) : null}

      {/* Content layer */}
      <View
        className={cn("relative z-10 w-full flex-shrink", contentClassName)}
        style={contentStyle}
      >
        {children}
      </View>
    </View>
  );
}

