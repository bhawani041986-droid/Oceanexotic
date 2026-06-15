import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, Dimensions } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface TickerMarqueeProps {
  items: string[];
}

export function TickerMarquee({ items }: TickerMarqueeProps) {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get("window").width;
  const animatedValue = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    if (!items || items.length === 0) return;

    const runMarquee = () => {
      animatedValue.setValue(screenWidth);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: -screenWidth - (items.length * 200),
          duration: Math.max(12000, items.length * 3500),
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    runMarquee();
  }, [items, screenWidth]);

  if (!items || items.length === 0) return null;

  return (
    <View 
      className="py-1 px-2 overflow-hidden flex flex-row items-center border-y"
      style={{ backgroundColor: colors.primary, borderColor: "rgba(0,0,0,0.1)", height: 26 }}
    >
      <Animated.View
        style={{
          transform: [{ translateX: animatedValue }],
          flexDirection: "row",
          alignItems: "center",
          gap: 30,
        }}
      >
        {items.map((item, i) => (
          <Text
            key={i}
            className="text-[8px] font-black uppercase tracking-[0.15em] italic text-slate-900"
            numberOfLines={1}
          >
            ⚪ {item}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}
