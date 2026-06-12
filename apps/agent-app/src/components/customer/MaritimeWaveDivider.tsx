import { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { Image } from "expo-image";
import { CATEGORIES } from "@/constants/categories";

const { width } = Dimensions.get("window");

function OceanStones() {
  // Pebbles resting along the absolute bottom floor
  const pebbles = [
    { x: 10, w: 24, h: 8, color: "#475569" },
    { x: 28, w: 16, h: 6, color: "#64748b" },
    { x: 80, w: 20, h: 7, color: "#334155" },
    { x: width / 3, w: 28, h: 9, color: "#4b5563" },
    { x: width / 2 - 60, w: 18, h: 6, color: "#374151" },
    { x: width / 2 + 10, w: 22, h: 8, color: "#475569" },
    { x: width - 110, w: 26, h: 8, color: "#334155" },
    { x: width - 50, w: 18, h: 6, color: "#64748b" },
    { x: width - 25, w: 22, h: 7, color: "#475569" },
  ];
  return (
    <>
      {pebbles.map((p, idx) => (
        <View
          key={idx}
          style={{
            position: "absolute",
            left: p.x,
            bottom: 0,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderTopLeftRadius: p.w / 2,
            borderTopRightRadius: p.w / 2,
            opacity: 0.85,
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.08)",
            zIndex: 10,
          }}
        />
      ))}
    </>
  );
}

function SwayingCoral({ x, y, size = 26, color = "#ff4d6d" }: { x: number; y: number; size?: number; color?: string }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1500 + Math.random() * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1500 + Math.random() * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => animValue.stopAnimation();
  }, []);

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "6deg"],
  });

  return (
    <Animated.View
      style={[
        styles.swayingCoralContainer,
        {
          left: x,
          top: y,
          transform: [
            { rotate: rotate },
          ],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path
          d="M16 30c0-4-3-6-3-10s2-5 1-8-2-3-2-5 1-2 2-2 2 2 2 4c0 3-1 4 0 6s4 1 4 4c0 3-1 5-1 8s-1 3-1 3"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Path
          d="M12 24c-2-2-4-2-4-5s1-4 0-6c1 0 2 1 2 3 0 2-1 3 0 5s2 1 2 3"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M18 22c2-2 3-3 3-5s-1-3 0-5c1 0 1.5 1 1.5 2.5 0 2-1.5 3 0 4.5"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

function Starfish({ x, y, size = 14, color = "#ff7b00" }: { x: number; y: number; size?: number; color?: string }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1200 + Math.random() * 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1200 + Math.random() * 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => animValue.stopAnimation();
  }, []);

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <Animated.View
      style={[
        styles.starfishContainer,
        {
          left: x,
          top: y,
          transform: [
            { scale: scale }
          ],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={color}
          stroke="#ffc300"
          strokeWidth="0.8"
        />
      </Svg>
    </Animated.View>
  );
}

function SeaSnail({ x, y, size = 15 }: { x: number; y: number; size?: number }) {
  return (
    <View style={{ position: "absolute", left: x, top: y, zIndex: 20 }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="10" cy="12" r="5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
        <Circle cx="10" cy="12" r="2.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        <Path d="M4 15c2-0.5 4-0.5 6-0.5h6c1.5 0 2 0.8 2 1.5s-0.8 1-2 1H6c-1.5 0-1.5 0-2-2z" fill="#fda4af" />
        <Line x1="15" y1="14" x2="17" y2="11" stroke="#fda4af" strokeWidth="1" />
        <Line x1="16" y1="14.5" x2="18" y2="11.5" stroke="#fda4af" strokeWidth="1" />
      </Svg>
    </View>
  );
}

function SwayingSeaweed({ x, y, size = 26, color = "#10b981" }: { x: number; y: number; size?: number; color?: string }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1800 + Math.random() * 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1800 + Math.random() * 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => animValue.stopAnimation();
  }, []);

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["-2deg", "8deg"],
  });

  return (
    <Animated.View
      style={[
        styles.swayingCoralContainer,
        {
          left: x,
          top: y,
          transform: [{ rotate: rotate }],
        },
      ]}
    >
      <Svg width={size} height={size + 10} viewBox="0 0 24 34">
        <Path
          d="M12 34c-4-6-2-12-4-18s4-8 2-14c4 6 2 12 4 18s-4 8-2 14z"
          fill={color}
          opacity="0.8"
        />
      </Svg>
    </Animated.View>
  );
}

function RestingCrab({ x, y }: { x: number; y: number }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800 + Math.random() * 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 800 + Math.random() * 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => animValue.stopAnimation();
  }, []);

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["-4deg", "4deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 20,
        transform: [{ rotate: rotate }],
      }}
    >
      <Text style={{ fontSize: 13 }}>🦀</Text>
    </Animated.View>
  );
}

function RubyDiamondSprinkle({ x, y, size = 10, isRuby = true }: { x: number; y: number; size?: number; isRuby?: boolean }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000 + Math.random() * 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1000 + Math.random() * 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => animValue.stopAnimation();
  }, []);

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 25,
        transform: [{ scale: scale }],
        opacity: opacity,
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {isRuby ? (
          <Path
            d="M12 2 L22 12 L12 22 L2 12 Z"
            fill="#ef4444"
            stroke="#f87171"
            strokeWidth="1.5"
          />
        ) : (
          <Path
            d="M6 2 L18 2 L22 8 L12 22 L2 8 Z"
            fill="#38bdf8"
            stroke="#e0f2fe"
            strokeWidth="1.2"
          />
        )}
      </Svg>
    </Animated.View>
  );
}

function FloatingBubble({ index }: { index: number }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const startX = 30 + (index * (width - 60)) / 6;
  const size = 3 + (index % 3) * 2;
  
  useEffect(() => {
    const delay = index * 600;
    const startAnimation = () => {
      animValue.setValue(0);
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 3500 + (index * 800),
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    const timer = setTimeout(startAnimation, delay);
    return () => {
      clearTimeout(timer);
      animValue.stopAnimation();
    };
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [48, -12],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startX, startX + 4, startX, startX - 4, startX],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.6, 0.6, 0],
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          opacity: opacity,
          transform: [
            { translateX: translateX },
            { translateY: translateY }
          ],
        },
      ]}
    />
  );
}

function SwimmingFish({ fish, index }: { fish: any; index: number }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const swimY = 1 + (index * 7) % 16; 
  const duration = 15000 + (index * 2500);

  useEffect(() => {
    // Distribute fish starts across space using clean timing delays
    const delay = index * 2400;
    const startAnimation = () => {
      animValue.setValue(0);
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    const timer = setTimeout(startAnimation, delay);
    return () => {
      clearTimeout(timer);
      animValue.stopAnimation();
    };
  }, []);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [width + 60, -60],
  });

  const rotate = animValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["0deg", "4deg", "0deg", "-4deg", "0deg"],
  });

  const scale = 0.6 + (index * 0.06);

  return (
    <Animated.View
      style={[
        styles.swimmingFishContainer,
        {
          transform: [
            { translateX: translateX },
            { translateY: swimY },
            { scale: scale },
            { rotate: rotate }
          ],
        },
      ]}
    >
      <Image
        source={fish.image}
        style={{ width: 34, height: 34 }}
        contentFit="contain"
      />
    </Animated.View>
  );
}

export function MaritimeWaveDivider() {
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(wave1Anim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(wave2Anim, {
        toValue: 1,
        duration: 13000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      wave1Anim.stopAnimation();
      wave2Anim.stopAnimation();
    };
  }, []);

  const wave1TranslateX = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const wave2TranslateX = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  const wavePath = `M 0 20 C 150 5, 300 35, 450 20 C 600 5, 750 35, 900 20 C 1050 5, 1200 35, 1350 20 L 1350 50 L 0 50 Z`;
  const finFish = CATEGORIES.slice(0, 5);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#001833", "#003b73", "#001833"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ocean Pebbles Bed */}
      <OceanStones />

      {/* Swaying Corals */}
      <SwayingCoral x={12} y={20} size={24} color="#f43f5e" />
      <SwayingCoral x={width / 2 - 40} y={22} size={22} color="#a855f7" />
      <SwayingCoral x={width - 34} y={19} size={25} color="#ec4899" />
      <SwayingCoral x={width - 90} y={21} size={20} color="#06b6d4" />
      <SwayingCoral x={45} y={24} size={18} color="#00ffcc" />
      <SwayingCoral x={width / 4 - 20} y={21} size={23} color="#fda4af" />
      <SwayingCoral x={width / 4 + 60} y={23} size={21} color="#facc15" />
      <SwayingCoral x={width * 0.75 - 50} y={22} size={24} color="#a855f7" />
      <SwayingCoral x={width * 0.75 + 30} y={20} size={20} color="#06b6d4" />
      <SwayingCoral x={width - 150} y={23} size={22} color="#10b981" />
      {/* 10 More Corals */}
      <SwayingCoral x={30} y={22} size={20} color="#fb7185" />
      <SwayingCoral x={85} y={23} size={19} color="#f472b6" />
      <SwayingCoral x={width / 4 + 20} y={20} size={22} color="#c084fc" />
      <SwayingCoral x={width / 2 - 120} y={21} size={24} color="#38bdf8" />
      <SwayingCoral x={width / 2 + 35} y={22} size={21} color="#fbbf24" />
      <SwayingCoral x={width * 0.65} y={20} size={23} color="#f43f5e" />
      <SwayingCoral x={width * 0.7} y={23} size={19} color="#2dd4bf" />
      <SwayingCoral x={width - 190} y={21} size={21} color="#fb7185" />
      <SwayingCoral x={width - 110} y={22} size={25} color="#c084fc" />
      <SwayingCoral x={width - 60} y={20} size={18} color="#34d399" />
      {/* Additional Corals in Blank/Sparse Spaces */}
      <SwayingCoral x={width * 0.15} y={21} size={22} color="#f43f5e" />
      <SwayingCoral x={width * 0.38} y={23} size={20} color="#a855f7" />
      <SwayingCoral x={width * 0.55} y={19} size={25} color="#ec4899" />
      <SwayingCoral x={width * 0.82} y={21} size={21} color="#06b6d4" />
      <SwayingCoral x={155} y={22} size={19} color="#00ffcc" />
      <SwayingCoral x={width / 2 - 80} y={20} size={23} color="#fda4af" />
      <SwayingCoral x={width / 2 + 130} y={22} size={22} color="#facc15" />
      <SwayingCoral x={width * 0.88} y={20} size={20} color="#a855f7" />

      {/* Swaying Seaweeds */}
      <SwayingSeaweed x={width / 3 + 20} y={12} size={24} color="#059669" />
      <SwayingSeaweed x={width / 2 + 100} y={10} size={28} color="#10b981" />
      <SwayingSeaweed x={100} y={14} size={22} color="#34d399" />
      <SwayingSeaweed x={width - 200} y={11} size={26} color="#059669" />

      {/* Resting Starfish */}
      <Starfish x={55} y={32} size={13} color="#f97316" />
      <Starfish x={width / 2 + 60} y={33} size={11} color="#eab308" />
      <Starfish x={width - 60} y={31} size={12} color="#f43f5e" />
      <Starfish x={width / 3 - 50} y={32} size={12} color="#ec4899" />
      <Starfish x={width * 0.75 - 10} y={31} size={13} color="#eab308" />
      <Starfish x={width - 120} y={33} size={11} color="#3b82f6" />
      {/* 6 More Stars */}
      <Starfish x={20} y={33} size={10} color="#ec4899" />
      <Starfish x={width / 4 + 100} y={32} size={12} color="#f59e0b" />
      <Starfish x={width / 2 - 10} y={31} size={11} color="#ef4444" />
      <Starfish x={width / 2 + 130} y={32} size={13} color="#10b981" />
      <Starfish x={width * 0.7} y={33} size={12} color="#06b6d4" />
      <Starfish x={width - 160} y={32} size={11} color="#a855f7" />

      {/* Slowly crawling Snails */}
      <SeaSnail x={95} y={30} size={15} />
      <SeaSnail x={width / 2 - 110} y={31} size={14} />
      {/* 6 More Snails */}
      <SeaSnail x={25} y={32} size={13} />
      <SeaSnail x={width / 4 + 80} y={31} size={14} />
      <SeaSnail x={width / 2 + 50} y={32} size={15} />
      <SeaSnail x={width * 0.65 - 10} y={30} size={13} />
      <SeaSnail x={width - 175} y={32} size={14} />
      <SeaSnail x={width - 80} y={31} size={15} />

      {/* Diamond/Ruby Sprinkling */}
      <RubyDiamondSprinkle x={35} y={32} size={10} isRuby={true} />
      <RubyDiamondSprinkle x={width / 4 + 40} y={33} size={8} isRuby={false} />
      <RubyDiamondSprinkle x={width / 2 - 80} y={31} size={9} isRuby={true} />
      <RubyDiamondSprinkle x={width / 2 + 120} y={34} size={11} isRuby={false} />
      <RubyDiamondSprinkle x={width * 0.75 + 10} y={32} size={9} isRuby={true} />
      <RubyDiamondSprinkle x={width - 75} y={33} size={10} isRuby={false} />
      <RubyDiamondSprinkle x={width - 22} y={31} size={8} isRuby={true} />
      <RubyDiamondSprinkle x={120} y={33} size={10} isRuby={false} />
      <RubyDiamondSprinkle x={width / 2 - 20} y={32} size={9} isRuby={true} />
      <RubyDiamondSprinkle x={width * 0.75 - 70} y={33} size={8} isRuby={false} />

      {/* Animated Resting Crabs */}
      <RestingCrab x={width / 4 + 10} y={26} />
      <RestingCrab x={width * 0.75 - 90} y={27} />

      {/* Swimming Category Fish Assets */}
      {finFish.map((fish, idx) => (
        <SwimmingFish key={fish.slug} fish={fish} index={idx} />
      ))}

      {/* Wave Layer 1 */}
      <Animated.View
        style={[
          styles.waveLayer1,
          {
            transform: [{ translateX: wave1TranslateX }],
          },
        ]}
      >
        <Svg width={width * 3} height="40" viewBox={`0 0 ${width * 3} 40`}>
          <Path d={wavePath} fill="#00d4ff" />
        </Svg>
      </Animated.View>

      {/* Wave Layer 2 */}
      <Animated.View
        style={[
          styles.waveLayer2,
          {
            transform: [{ translateX: wave2TranslateX }],
          },
        ]}
      >
        <Svg width={width * 3} height="40" viewBox={`0 0 ${width * 3} 40`}>
          <Path d={wavePath} fill="#00f3ff" />
        </Svg>
      </Animated.View>

      {/* Animated Rising Oxygen Bubbles */}
      {[...Array(12)].map((_, i) => (
        <FloatingBubble key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    overflow: "hidden",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(207, 189, 255, 0.3)",
    position: "relative",
    backgroundColor: "#001833",
  },
  swimmingFishContainer: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 30,
  },
  swayingCoralContainer: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 20,
  },
  starfishContainer: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 20,
  },
  waveLayer1: {
    position: "absolute",
    bottom: 0,
    height: 40,
    opacity: 0.25,
    zIndex: 20,
    width: width * 3,
  },
  waveLayer2: {
    position: "absolute",
    bottom: 0,
    height: 40,
    opacity: 0.15,
    zIndex: 10,
    width: width * 3,
  },
  bubble: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 40,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
});
