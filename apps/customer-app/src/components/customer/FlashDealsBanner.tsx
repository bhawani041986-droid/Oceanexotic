import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Polygon, Line, Path } from 'react-native-svg';
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

  const { width } = Dimensions.get('window');
  const containerWidth = width - 32;
  const angle = Math.atan2(280, containerWidth) * 180 / Math.PI;
  const rotationAngle = `-${90 - angle}deg`;

  if (!settings.flashDealActive) return null;

  const promoImageUrl = settings.customerAssets?.promo 
    ? settings.customerAssets.promo 
    : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80";

  const [activeIndex, setActiveIndex] = useState(0);

  const carouselData = settings.flashDealCarousel && settings.flashDealCarousel.length > 0
    ? settings.flashDealCarousel
    : [
        { image_url: promoImageUrl, product_link: "/" },
        { image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2", product_link: "/" }
      ];

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / 160);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.bgAlt }]}>
      
      {/* 1. Base Dark Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#020617' }]} />

      <Image 
        source={{ uri: carouselData[0].image_url }} 
        style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      {/* 2. PANEL A (Top-Left Diagonal Mask) */}
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Polygon points="0,0 100,0 0,100" fill={colors.bgAlt} />
      </Svg>

      {/* 3. PADDLE DIVIDER */}
      <Image 
        source={require('../../../assets/paddle.png')} 
        style={{
          position: 'absolute',
          width: 32,
          height: 380,
          left: '50%',
          marginLeft: -16,
          top: (280 - 380) / 2,
          transform: [{ rotate: rotationAngle }],
          zIndex: 3,
        }}
        contentFit="contain"
      />

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
                {/* Cut-corner bevel overlays on timer box */}
                <Svg width={6} height={6} style={{ position: 'absolute', top: -1, left: -1, zIndex: 5 }}>
                  <Path d="M0,0 L6,0 L0,6 Z" fill={'rgba(0,0,0,0.5)'} />
                  <Path d="M6,0 L0,6" stroke={`${colors.primary}55`} strokeWidth={0.8} />
                </Svg>
                <Svg width={6} height={6} style={{ position: 'absolute', bottom: -1, right: -1, zIndex: 5 }}>
                  <Path d="M6,6 L0,6 L6,0 Z" fill={'rgba(0,0,0,0.5)'} />
                  <Path d="M0,6 L6,0" stroke={`${colors.primary}55`} strokeWidth={0.8} />
                </Svg>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel B Content (Bottom-Right Carousel) */}
      <View style={styles.panelBContent} pointerEvents="box-none">
        <View style={{ width: 160, alignItems: 'flex-end', marginTop: 'auto', marginBottom: 10 }}>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={160}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{ gap: 10, paddingRight: 0 }}
          >
            {carouselData.map((item, idx) => (
              <View key={idx} style={{ width: 150, height: 90, justifyContent: 'flex-end' }}>
                <View style={[styles.carouselCardWrap, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                  <View style={styles.carouselCardInner}>
                    <Image source={{ uri: item.image_url }} style={[StyleSheet.absoluteFillObject, { opacity: 0.9 }]} contentFit="cover" />
                    
                    {/* Gradient Overlay for button contrast */}
                    <View style={styles.carouselGradient} />

                    <Pressable 
                      onPress={() => router.push(item.product_link as any)}
                      style={{ position: 'absolute', bottom: 6, alignSelf: 'center' }}
                    >
                      <View style={{ width: 90, height: 26, justifyContent: 'center', alignItems: 'center' }}>
                        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 90 26" preserveAspectRatio="none">
                          <Polygon points="6,0 90,0 90,20 84,26 0,26 0,6" fill="#FFFFFF" />
                        </Svg>
                        <Text style={[styles.btnText, { color: colors.primary, fontSize: 7 }]}>VIEW DETAILS</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Fish Neon Glow Navigation Indicators */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, justifyContent: 'center', width: '100%' }}>
            {carouselData.map((_, idx) => (
              <MaterialCommunityIcons 
                key={idx} 
                name="fish" 
                size={14} 
                color={idx === activeIndex ? colors.primary : 'rgba(255,255,255,0.4)'} 
                style={idx === activeIndex ? { shadowColor: colors.primary, shadowOffset: { width:0, height:0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4 } : {}}
              />
            ))}
          </View>

        </View>
      </View>

      {/* High-Tech Beveled Corner Overlays for Visual Parity */}
      <Svg width="24" height="24" style={{ position: "absolute", top: -1, left: -1, zIndex: 10 }}>
        <Polygon points="0,0 24,0 0,24" fill={colors.bg} />
        <Line x1="24" y1="0" x2="0" y2="24" stroke={colors.border} strokeWidth={1.5} />
      </Svg>
      <Svg width="24" height="24" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 10 }}>
        <Polygon points="24,24 0,24 24,0" fill={colors.bg} />
        <Line x1="0" y1="24" x2="24" y2="0" stroke={colors.border} strokeWidth={1.5} />
      </Svg>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 0,
    borderWidth: 1,
    minWidth: 38,
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  timerVal: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
    fontStyle: 'italic',
  },
  timerLabel: {
    fontSize: 7,
    fontFamily: 'Inter-Black',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    letterSpacing: 1,
  },
  btnText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Inter-Black',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  carouselCardWrap: {
    width: '100%' as any,
    height: '100%' as any,
    padding: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  carouselCardInner: {
    width: '100%' as any,
    height: '100%' as any,
    backgroundColor: '#000',
    overflow: 'hidden' as const,
  },
  carouselGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  }
});
