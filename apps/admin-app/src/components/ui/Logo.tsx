import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Easing, type ViewStyle } from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Rect,
  Text as SvgText,
  G,
} from "react-native-svg";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import { useThemeColors } from "@/hooks/useThemeColors";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 196, height: 49 },
  md: { width: 248, height: 62 },
  lg: { width: 308, height: 77 },
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
  style?: ViewStyle;
}

/** Animated OceanExotic mark — powered by standard core Animated for bulletproof 100% native platform support */
export function Logo({ size = "md", className, style }: LogoProps) {
  const uid = useMemo(() => `logo${Math.random().toString(36).slice(2, 9)}`, []);
  const dims = SIZES[size];
  const colors = useThemeColors();
  const textFill = "#F8FAFC";

  const primaryFill = colors.primary;
  const accentCyan = colors.secondary;
  const accentPink = colors.accent;

  // Core Animated Loop Values
  const dashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1.35)).current;

  useEffect(() => {
    // 1. Traveling Border Animation
    Animated.loop(
      Animated.timing(dashAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // 2. Pulsing Fish Mark Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.43,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      dashAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, []);

  // Map animated progress to dash offset (Perimeter length is exactly 1030)
  const strokeDashoffset = dashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1030, 0],
  });

  return (
    <View className={cn("overflow-hidden", className)} style={[{ width: dims.width, height: dims.height }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="xMinYMid meet">
        <Defs>
          <LinearGradient id={`neonGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={accentCyan} />
            <Stop offset="50%" stopColor={accentPink} />
            <Stop offset="100%" stopColor="#FACC15" />
          </LinearGradient>
          <LinearGradient id={`eyeGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor={accentCyan} />
          </LinearGradient>
        </Defs>

        {/* Fish Mark Group - Pulsating and Center-aligned to logo text */}
        <AnimatedG
          x={45}
          y={45}
          scale={pulseAnim}
          originX={50}
          originY={50}
        >
          {/* Neon Glow Aura behind the fish */}
          <Path
            fill="none"
            stroke={accentCyan}
            strokeWidth={5}
            opacity={0.25}
            d="M50 20 C35 20 20 30 15 50 L5 30 L5 70 L15 50 C20 70 35 80 50 80 C70 80 85 70 90 50 C85 30 70 20 50 20 Z"
          />
          {/* Primary Solid Fish Body */}
          <Path
            fill={primaryFill}
            d="M50 20 C35 20 20 30 15 50 L5 30 L5 70 L15 50 C20 70 35 80 50 80 C70 80 85 70 90 50 C85 30 70 20 50 20 Z M50 20 C55 10 65 5 75 5 C65 5 55 10 50 20 Z M50 80 C55 90 65 95 75 95 C65 95 55 90 50 80 Z"
          />
          {/* Direct overlay of fish details in theme background color to render perfectly on native platforms */}
          <SvgText
            x="50"
            y="58"
            textAnchor="middle"
            fill={colors.bg}
            fontSize="24"
            fontWeight="900"
            fontStyle="italic"
          >
            OX
          </SvgText>
          <Path d="M38 44 L15 44" stroke={colors.bg} strokeWidth={2.5} />
          <Path d="M62 58 L88 58" stroke={colors.bg} strokeWidth={2.5} />
          <Circle cx="82" cy="48" r="4" fill={colors.bg} />
          <Circle cx="82" cy="48" r="3" fill={`url(#eyeGrad-${uid})`} />
        </AnimatedG>

        {/* Brand Text & Traveling Neon Box Group */}
        <G transform="translate(141, 100)">
          {/* Layer 1: Moving Volumetric Neon Glow Path underneath */}
          <AnimatedPath
            d="M0, -45 L420, -45 L420, 50 L0, 50 L0, -45"
            fill="none"
            stroke={accentCyan}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray="160 870"
            strokeDashoffset={strokeDashoffset}
            opacity={0.3}
          />
          {/* Layer 2: Moving Volumetric Coral Glow Path underneath */}
          <AnimatedPath
            d="M0, -45 L420, -45 L420, 50 L0, 50 L0, -45"
            fill="none"
            stroke={accentPink}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="160 870"
            strokeDashoffset={strokeDashoffset}
            opacity={0.2}
          />
          {/* Layer 3: Primary Neon Traveling Light Stroke */}
          <AnimatedPath
            d="M0, -45 L420, -45 L420, 50 L0, 50 L0, -45"
            fill="none"
            stroke={`url(#neonGrad-${uid})`}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="160 870"
            strokeDashoffset={strokeDashoffset}
            opacity={0.9}
          />
          
          <SvgText
            fill={textFill}
            x="0"
            y="0"
            fontSize="58"
            fontWeight="900"
            fontStyle="italic"
          >
            OceanExotic
          </SvgText>
          <G transform="translate(0, 38)">
            <Rect fill={primaryFill} x="0" y="-8" width="50" height="5" rx="2.5" />
            <SvgText fill={primaryFill} x="65" y="0" fontSize="24" fontWeight="900" fontStyle="italic">
              GLOBAL
            </SvgText>
          </G>
        </G>
      </Svg>
    </View>
  );
}
