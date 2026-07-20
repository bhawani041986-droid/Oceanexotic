import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming 
} from "react-native-reanimated";

export function AnimatedHeaderUnderline({ width = 85, height = 3.5 }: { width?: number; height?: number }) {
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.7 + shimmerAnim.value * 0.3,
      transform: [
        { translateX: -15 + shimmerAnim.value * 30 }
      ]
    };
  });

  return (
    <View style={{ height, width, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 3, marginBottom: 2 }}>
      <Animated.View style={[{ flex: 1, width: '140%' }, animatedStyle]}>
        <LinearGradient
          colors={['#FF3E3E', '#FFD700', '#00F3FF', '#FF5E36']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Compact section header matching the Today's Catch arrangement:
 *  Row 1: [Title] [Subtitle pill]
 *  Row 2: Animated shimmer underline
 */
export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useThemeColors();
  return (
    <View style={{ alignSelf: 'flex-start' }}>
      {/* Row 1: title + subtitle pill inline */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          className="text-lg font-black uppercase italic tracking-tight"
          style={{ color: colors.primary }}
        >
          {title}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              color: colors.textMuted,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Row 2: Animated shimmer underline */}
      <AnimatedHeaderUnderline width={85} height={3.5} />
    </View>
  );
}
