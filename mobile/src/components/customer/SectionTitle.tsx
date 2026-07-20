import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function AnimatedHeaderUnderline({
  width = 75,
  height = 3,
}: {
  width?: number;
  height?: number;
}) {
  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + shimmerAnim.value * 0.3,
    transform: [{ translateX: -15 + shimmerAnim.value * 30 }],
  }));

  return (
    <View
      style={{
        height,
        width,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.08)",
        marginTop: 3,
        marginBottom: 2,
      }}
    >
      <Animated.View style={[{ flex: 1, width: "140%" }, animatedStyle]}>
        <LinearGradient
          colors={["#FF3E3E", "#FFD700", "#00F3FF", "#FF5E36"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Compact section header — exact same layout as Today's Catch:
 *   Row 1 (single line): [Title] [Subtitle pill]
 *   Row 2: Animated shimmer underline
 */
export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={{ flexDirection: "column", alignSelf: "flex-start" }}>
      {/* Single line: title + pill — exactly like Today's Catch */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flexWrap: "nowrap",
        }}
      >
        <Text
          className="text-lg font-black uppercase italic tracking-tight"
          style={{ color: colors.primary }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {/* Pill badge — mirrors Today's Catch emerald pill exactly, using amber tones */}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: "rgba(255, 176, 59, 0.12)",
            borderWidth: 1,
            borderColor: "rgba(255, 176, 59, 0.30)",
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "#FFB03B",
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Shimmer underline — same dimensions as Today's Catch */}
      <AnimatedHeaderUnderline width={75} height={3} />
    </View>
  );
}
