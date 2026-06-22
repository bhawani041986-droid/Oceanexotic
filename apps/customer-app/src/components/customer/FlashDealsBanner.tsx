import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Polygon, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useFlashDealTimer } from '@/hooks/useFlashDealTimer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

const FloatingIcon = ({ Icon, top, left, color, delay, size, rotate = '0deg' }: any) => {
  const y = useSharedValue(0);
  
  useEffect(() => {
    setTimeout(() => {
      y.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000 + delay * 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000 + delay * 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay * 500);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate }]
  }));

  return (
    <Animated.View style={[{ position: 'absolute', top, left, opacity: 0.5 }, animatedStyle]}>
      <MaterialCommunityIcons name={Icon} size={size} color={color} />
    </Animated.View>
  );
};

export function FlashDealsBanner() {
  const settings = useSettingsStore();
  const colors = useThemeColors();
  const { timeLeft } = useFlashDealTimer();
  const router = useRouter();

  if (!settings.flashDealActive) return null;

  const promoImageUrl = settings.customerAssets?.promo 
    ? settings.customerAssets.promo 
    : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80";

  const productLink = "/";

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.bgAlt }]}>
      
      {/* 1. BACKGROUND IMAGE (Panel B Cover) */}
      <Image 
        source={{ uri: promoImageUrl }} 
        style={StyleSheet.absoluteFill} 
        contentFit="cover" 
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      {/* 2. PANEL A (Top-Left Diagonal Mask) */}
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Polygon points="0,0 100,0 0,100" fill={colors.bgAlt} />
      </Svg>

      {/* 3. NEON OAR DIVIDER (The Diagonal Cut Line) */}
      <Svg style={[StyleSheet.absoluteFill, { zIndex: 3 }]} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Line 
           x1="100" y1="0" x2="0" y2="100" 
           stroke={colors.primary} 
           strokeWidth="2" 
           vectorEffect="non-scaling-stroke" 
        />
        {/* Subtle white core for neon effect */}
        <Line 
           x1="100" y1="0" x2="0" y2="100" 
           stroke="#ffffff" 
           strokeWidth="0.5" 
           strokeOpacity="0.5"
           vectorEffect="non-scaling-stroke" 
        />
      </Svg>

      {/* Oar Handle (Top Right) */}
      <View style={[
        styles.oarHandle, 
        { backgroundColor: colors.primary, shadowColor: colors.primary, elevation: 10 }
      ]} />

      {/* Oar Blade (Bottom Left) */}
      <View style={[
        styles.oarBlade, 
        { backgroundColor: colors.primary, shadowColor: colors.primary, elevation: 15 }
      ]} />

      {/* 4. CONTENT WRAPPERS */}

      {/* Panel A Content (Top-Left) */}
      <View style={styles.panelAContent} pointerEvents="box-none">
        {/* Festive Floating Icons */}
        <FloatingIcon Icon="party-popper" top="5%" left="70%" color="#ef4444" delay={0} size={24} />
        <FloatingIcon Icon="gift" top="25%" left="50%" color={colors.primary} delay={1} size={20} />
        <FloatingIcon Icon="crown" top="45%" left="30%" color={colors.primary} delay={2} size={30} rotate="-15deg" />
        <FloatingIcon Icon="star-four-points" top="65%" left="10%" color={colors.text} delay={3} size={16} />
        <FloatingIcon Icon="timer-outline" top="15%" left="40%" color="#22c55e" delay={0.5} size={18} />
        <FloatingIcon Icon="rocket-launch" top="40%" left="65%" color="#ef4444" delay={1.5} size={22} />

        {/* Text Engine */}
        <View style={{ maxWidth: '80%' }}>
          <View style={styles.liveBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={12} color={colors.primary} />
            <Text style={[styles.liveText, { color: colors.primary }]}>
              FLASH PRODUCT LIVE
            </Text>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            FLASH DEALS.
          </Text>
          
          <Text style={[styles.timerStatus, { color: colors.textMuted }]}>
            ENDS IN
          </Text>

          <View style={styles.timerRow}>
            {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
              <View key={i} style={[styles.timerBox, { borderColor: `${colors.primary}33` }]}>
                <Text style={[styles.timerVal, { color: colors.primary }]}>{val}</Text>
                <Text style={styles.timerLabel}>{i === 0 ? 'HRS' : i === 1 ? 'MIN' : 'SEC'}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel B Content (Bottom-Right) */}
      <View style={styles.panelBContent} pointerEvents="box-none">
        <Pressable 
           onPress={() => router.push(productLink as any)}
           style={{ alignSelf: 'flex-end', marginTop: 'auto' }}
        >
          {/* Custom Cut-Corner SVG Button */}
          <View style={{ width: 140, height: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Svg style={StyleSheet.absoluteFill} viewBox="0 0 140 44" preserveAspectRatio="none">
              <Polygon points="8,0 140,0 140,36 132,44 0,44 0,8" fill={colors.primary} />
            </Svg>
            <Text style={styles.btnText}>VIEW DETAILS</Text>
          </View>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  oarHandle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomLeftRadius: 24,
    zIndex: 4,
  },
  oarBlade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 48,
    height: 48,
    borderTopRightRadius: 48,
    zIndex: 4,
  },
  panelAContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    zIndex: 5,
  },
  panelBContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    zIndex: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  liveText: {
    fontSize: 8,
    fontFamily: 'Inter-Black',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Black',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: 8,
  },
  timerStatus: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  timerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timerBox: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 45,
    alignItems: 'center',
  },
  timerVal: {
    fontSize: 18,
    fontFamily: 'Inter-Black',
    fontStyle: 'italic',
  },
  timerLabel: {
    fontSize: 8,
    fontFamily: 'Inter-Black',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    letterSpacing: 1,
  },
  btnText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Inter-Black',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});
