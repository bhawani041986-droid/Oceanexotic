import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Polygon, Line, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useFlashDealTimer } from '@/hooks/useFlashDealTimer';
import { useTranslation } from '@/lib/i18n';
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
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const colors = useThemeColors();

  const isLightColor = (colorStr: string) => {
    if (!colorStr || !colorStr.startsWith("#")) return false;
    let cleanHex = colorStr.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map(c => c + c).join("");
    }
    if (cleanHex.length !== 6) return false;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  };

  const { timeLeft, timerStatus } = useFlashDealTimer();
  const router = useRouter();

  const { width } = Dimensions.get('window');
  const containerWidth = width;
  const angle = Math.atan2(280, containerWidth) * 180 / Math.PI;
  const rotationAngle = `${90 - angle}deg`;
  const diagonalLength = Math.sqrt(280 * 280 + containerWidth * containerWidth);

  const [activeIndex, setActiveIndex] = useState(0);

  if (!settings.flashDealActive) return null;

  const promoImageUrl = settings.customerAssets?.promo 
    ? settings.customerAssets.promo 
    : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80";

  const carouselData = settings.flashDealCarousel && settings.flashDealCarousel.length > 0
    ? settings.flashDealCarousel
    : [
        { image_url: promoImageUrl, product_link: "/" },
        { image_url: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80", product_link: "/" },
        { image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80", product_link: "/" }
      ];

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / 180);
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
          width: 28,
          height: diagonalLength,
          left: '50%',
          marginLeft: -14,
          top: (280 - diagonalLength) / 2,
          transform: [{ rotate: rotationAngle }],
          zIndex: 3,
        }}
        contentFit="fill"
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
              {settings.flashDealSector ? `${settings.flashDealSector.toUpperCase()} ${t('live') || 'LIVE'}` : (t('flash_product_live') || 'FLASH PRODUCT LIVE')}
            </Text>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            {settings.flashDealTitle || t('flash_deals') || 'FLASH DEALS.'}
          </Text>
          
          <Text style={[styles.timerStatus, { color: colors.textMuted }]}>
            {timerStatus === 'STARTS_IN' ? (t('starts_in') || 'STARTS IN') : (t('ends_in') || 'ENDS IN')}
          </Text>

          <View style={styles.timerRow}>
            {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
              <View key={i} style={[styles.timerBox, { borderColor: `${colors.primary}66` }]}>
                <Text style={[styles.timerVal, { color: colors.primary }]}>{val}</Text>
                <Text style={[styles.timerLabel, { color: colors.textMuted }]}>{i === 0 ? (t('hrs') || 'HRS') : i === 1 ? (t('min') || 'MIN') : (t('sec') || 'SEC')}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel B Content (Bottom-Right Carousel) */}
      <View style={styles.panelBContent} pointerEvents="box-none">
        <View style={{ width: 180, alignItems: 'flex-end', marginTop: 'auto', marginBottom: 2 }}>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={180}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{ gap: 10, paddingRight: 0 }}
          >
            {carouselData.map((item, idx) => (
              <View key={idx} style={{ width: 170, height: 100, justifyContent: 'flex-end' }}>
                <View style={[styles.carouselCardWrap, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                  <View style={styles.carouselCardInner}>
                    <Image source={{ uri: item.image_url }} style={[StyleSheet.absoluteFillObject, { opacity: 0.9 }]} contentFit="contain" />
                    
                    {/* Gradient Overlay for button contrast */}
                    <View style={styles.carouselGradient} />

                    <Pressable 
                      onPress={() => router.push(item.product_link as any)}
                      style={{ position: 'absolute', bottom: 6, alignSelf: 'center' }}
                    >
                      <View style={{ width: 90, height: 26, justifyContent: 'center', alignItems: 'center' }}>
                        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 90 26" preserveAspectRatio="none">
                          <Polygon points="6,0 90,0 90,20 84,26 0,26 0,6" fill={colors.primary} />
                        </Svg>
                        <Text style={[styles.btnText, { color: isLightColor(colors.primary) ? "#000000" : "#FFFFFF", fontSize: 7 }]}>{t('view_details') || "VIEW DETAILS"}</Text>
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
      <Svg width="24" height="24" style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }} pointerEvents="none">
        <Polygon points="0,0 24,0 0,24" fill={colors.bg} />
      </Svg>
      <Svg width="24" height="24" style={{ position: "absolute", bottom: 0, right: 0, zIndex: 10 }} pointerEvents="none">
        <Polygon points="24,24 0,24 24,0" fill={colors.bg} />
      </Svg>

      {/* High-Tech Chamfered Border Overlay */}
      <Svg style={StyleSheet.absoluteFill} width={containerWidth} height={280} pointerEvents="none">
        <Path 
          d={`M24,0 L${containerWidth},0 L${containerWidth},256 L${containerWidth - 24},280 L0,280 L0,24 Z`} 
          fill="none" 
          stroke={colors.border} 
          strokeWidth={1} 
        />
      </Svg>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    marginHorizontal: 0,
    marginVertical: 12,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
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
    padding: 12,
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
    width: 46,
    height: 46,
    backgroundColor: '#27272a',
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  timerVal: {
    fontSize: 13,
    fontFamily: 'Inter-Black',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 14,
  },
  timerLabel: {
    fontSize: 6,
    fontFamily: 'Inter-Black',
    textAlign: 'center',
    marginTop: 1,
    letterSpacing: 0.5,
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
