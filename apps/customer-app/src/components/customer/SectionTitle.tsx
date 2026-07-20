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
    <View style={{ height, width, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 3, marginBottom: 3 }}>
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

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useThemeColors();
  return (
    <View className="gap-0.5">
      <Text className="text-lg font-black uppercase tracking-tight italic" style={{ color: colors.primary }}>
        {title}
      </Text>
      <AnimatedHeaderUnderline width={85} height={3.5} />
      <Text className="text-[9.5px] font-extrabold uppercase tracking-widest mt-0.5" style={{ color: colors.textMuted }}>
        {subtitle}
      </Text>
    </View>
  );
}
