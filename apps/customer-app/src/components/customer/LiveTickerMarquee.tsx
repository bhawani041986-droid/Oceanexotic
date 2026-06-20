import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing, Dimensions } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

const MESSAGES = [
  "🔥 USE CODE WELCOME10 FOR 10% OFF!",
  "🔥 USE CODE OCEAN20 FOR 20% OFF! (Min ₹2000)",
  "🔥 USE CODE SAKUFRESH50 FOR ₹50 OFF! (Min ₹500)",
  "🔥 USE CODE ADMIRALVIP FOR ₹500 OFF! (Min ₹5000)",
  "⚡ FLASH DEAL: Tiger Prawns from Havelock just arrived",
  "🚢 NEW ARRIVAL: Fresh catch from 'Andaman Queen' docking in 20m",
  "🔥 TRENDING: Red Snapper demand is high today",
  "🛡️ QUALITY: Freshness guaranteed for all seafood",
  "⚓ STORE UPDATE: Port Blair hub is fully stocked",
];

export function LiveTickerMarquee() {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get("window").width;
  const animatedValue = useRef(new Animated.Value(screenWidth)).current;
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (contentWidth === 0) return;

    const speed = 40; // pixels per second
    const distance = screenWidth + contentWidth;
    const duration = (distance / speed) * 1000;

    const loop = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: -contentWidth,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animatedValue.setValue(screenWidth);
    loop.start();

    return () => loop.stop();
  }, [screenWidth, contentWidth, animatedValue]);

  return (
    <View
      className="h-8 flex-row items-center overflow-hidden border-y"
      style={{
        backgroundColor: colors.primary,
        borderColor: `${colors.text}1A`,
      }}
    >
      <Animated.View
        onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        style={{
          transform: [{ translateX: animatedValue }],
          flexDirection: "row",
          alignItems: "center",
          gap: 40,
        }}
      >
        {[...MESSAGES, ...MESSAGES].map((msg, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <View className="w-1 h-1 rounded-full bg-white opacity-80" />
            <Text
              className="text-[10px] font-black uppercase tracking-[0.2em] italic"
              style={{ color: colors.bg }}
            >
              {msg}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
