import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHomeData } from '@/hooks/useHomeData';
import { RECIPES_DB } from '@/constants/recipes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.42;

// Premium stylized outline fish SVG decorator
const FishDecoratorSVG = ({ style, color }: { style?: any; color: string }) => (
  <Svg width="120" height="80" viewBox="0 0 120 80" style={style} fill="none">
    <Path
      d="M10 40 C 30 20, 70 20, 90 40 C 95 45, 105 55, 110 50 L 115 65 L 100 55 C 95 50, 90 45, 85 43 C 65 30, 25 30, 10 40 Z"
      stroke={color}
      strokeWidth="1.2"
      strokeDasharray="4,4"
      opacity="0.18"
    />
    <Circle cx="25" cy="38" r="2" fill={color} opacity="0.25" />
    <Path
      d="M85 43 C 78 40, 70 41, 65 43"
      stroke={color}
      strokeWidth="1"
      opacity="0.12"
    />
  </Svg>
);

// High-fidelity background telemetry grid
const CyberFishGrid = () => {
  const colors = useThemeColors();
  return (
    <View style={StyleSheet.absoluteFillObject} className="pointer-events-none opacity-40">
      {/* Wave Grid */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Path d="M0,100 Q100,50 200,100 T400,100 T600,100 T800,100" stroke={colors.primary} strokeWidth="1" opacity="0.08" fill="none" />
        <Path d="M0,250 Q120,200 240,250 T480,250 T720,250" stroke={colors.primary} strokeWidth="0.8" opacity="0.05" fill="none" />
        <Path d="M0,450 Q80,480 160,450 T320,450 T480,450 T640,450 T800,450" stroke={colors.primary} strokeWidth="1.2" opacity="0.06" fill="none" />
      </Svg>
      
      {/* Decorative Cyber Fish Outlines */}
      <FishDecoratorSVG style={{ position: 'absolute', top: 140, right: -20, transform: [{ rotate: '-15deg' }] }} color={colors.primary} />
      <FishDecoratorSVG style={{ position: 'absolute', top: 420, left: -30, transform: [{ rotate: '20deg' }, { scaleX: -1 }] }} color={colors.primary} />
      <FishDecoratorSVG style={{ position: 'absolute', top: 680, right: -10, transform: [{ rotate: '5deg' }] }} color={colors.primary} />
    </View>
  );
};

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { data: cms } = useHomeData();
  const [activeImg, setActiveImg] = React.useState(0);

  const recipe = useMemo(() => {
    // Try to find in local recipes database first
    const foundLocal = RECIPES_DB.find(r => r.id === id);
    if (foundLocal) {
      return {
        id: foundLocal.id,
        title: foundLocal.title,
        image_url: foundLocal.image,
        metadata: JSON.stringify({ difficulty: foundLocal.difficulty, time: foundLocal.time }),
        ingredients: foundLocal.ingredients,
        steps: foundLocal.steps,
        gallery: [foundLocal.image]
      } as any;
    }

    // Fallback to CMS dynamic recipes
    let found = cms?.data?.find(c => c.id?.toString() === id);
    if (!found) {
      // Fallback dummy for design checking
      found = {
        id: id || '1',
        title: 'Pan-Seared King Salmon',
        image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80',
        metadata: JSON.stringify({ difficulty: 'Medium', time: '25m' }),
        ingredients: [
          "2 King Salmon fillets (6 oz each)",
          "1 tbsp Extra virgin olive oil",
          "2 tbsp Grass-fed unsalted butter",
          "3 cloves Fresh garlic, smashed",
          "Fresh organic thyme sprigs",
          "Flaky sea salt & coarse black pepper",
          "Fresh organic lemon wedges"
        ],
        steps: [
          "Remove salmon from refrigerator 15 minutes before cooking. Pat completely dry with paper towels.",
          "Season generously with sea salt and black pepper just before cooking.",
          "Heat oil in a heavy-bottomed skillet (cast iron preferred) over medium-high heat until shimmering.",
          "Place salmon skin-side down. Press firmly with a spatula for 10 seconds to prevent curling.",
          "Cook undisturbed for 4-5 minutes until skin is crispy and fish is mostly cooked through.",
          "Flip the salmon. Add butter, garlic, and thyme to the pan. Baste the fish with the melting butter for 1-2 minutes.",
          "Remove from heat and let rest for 3 minutes before serving with fresh lemon."
        ],
        gallery: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80']
      } as any;
    } else {
      const metaVal = found.metadata ? (typeof found.metadata === 'string' ? JSON.parse(found.metadata) : found.metadata) : {};
      found = {
        ...found,
        ingredients: metaVal.ingredients || [
          "500g Fresh Catch fish",
          "2 tbsp Local spice blend",
          "2 tbsp Cooking oil",
          "Salt to taste"
        ],
        steps: metaVal.steps || [
          "Clean the fish thoroughly.",
          "Marinate with salt, turmeric, and spice blend.",
          "Shallow fry or grill until cooked through."
        ],
        gallery: metaVal.gallery || [found.image_url || found.image]
      } as any;
    }
    return found;
  }, [cms, id]);

  const meta = useMemo(() => {
    if (!recipe?.metadata) return { difficulty: 'Medium', time: '25m' };
    try {
      return typeof recipe.metadata === 'string' ? JSON.parse(recipe.metadata) : recipe.metadata;
    } catch (e) {
      return { difficulty: 'Medium', time: '25m' };
    }
  }, [recipe]);

  const ingredients = recipe.ingredients;
  const steps = recipe.steps;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Dynamic Telemetry Cyber Background */}
      <CyberFishGrid />

      <ScrollView 
        className="flex-1" 
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
      >
        {/* Immersive Header Image / Gallery */}
        <View style={{ height: HEADER_HEIGHT }} className="relative w-full bg-black">
          {recipe.gallery && recipe.gallery.length > 1 ? (
            <View className="w-full h-full relative">
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const idx = Math.round(x / Dimensions.get('window').width);
                  setActiveImg(idx);
                }}
                scrollEventThrottle={16}
                className="w-full h-full"
              >
                {recipe.gallery.map((imgUrl: string, idx: number) => (
                  <Image 
                    key={idx}
                    source={{ uri: imgUrl }} 
                    style={{ width: Dimensions.get('window').width, height: '100%' }}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
              
              {/* Pagination Dots */}
              <View className="absolute bottom-16 left-0 right-0 flex-row justify-center gap-1.5 z-20">
                {recipe.gallery.map((_: any, idx: number) => (
                  <View 
                    key={idx} 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: idx === activeImg ? colors.primary : 'rgba(255,255,255,0.4)' }}
                  />
                ))}
              </View>
            </View>
          ) : (
            <Image 
              source={{ uri: recipe.image_url || recipe.image }} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          )}

          <LinearGradient 
            colors={['rgba(8,13,25,0.8)', 'transparent', colors.bg]} 
            locations={[0, 0.45, 1]}
            className="absolute inset-0 pointer-events-none z-10"
          />
          
          {/* Header Controls */}
          <View 
            className="absolute left-0 right-0 flex-row justify-between items-center px-4"
            style={{ top: Math.max(insets.top, 20) }}
          >
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center bg-black/50 border border-white/10 backdrop-blur-md"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
            </Pressable>
            <View className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md flex-row items-center gap-1.5">
              <MaterialCommunityIcons name="chef-hat" size={12} color={colors.primary} />
              <Text className="text-[9px] font-black text-white uppercase tracking-widest">Recipe Active</Text>
            </View>
          </View>

          {/* Title Area */}
          <View className="absolute bottom-6 left-5 right-5 space-y-3">
            <View className="flex-row items-center gap-2 flex-wrap">
              <View className="flex-row items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-md">
                <MaterialCommunityIcons name="fire" size={12} color={colors.primary} />
                <Text className="text-[9px] font-black text-white uppercase tracking-widest">{meta.difficulty || 'Expert'}</Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-md">
                <MaterialCommunityIcons name="clock-outline" size={12} color="white" />
                <Text className="text-[9px] font-black text-white uppercase tracking-widest">{meta.time || '25m'}</Text>
              </View>
            </View>
            <Text className="text-3xl font-black text-white uppercase italic tracking-tight shadow-2xl leading-none">
              {recipe.title}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-5 pt-6 space-y-8">

          {/* Scientific Nutrition Telemetry */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase text-foreground tracking-widest">Efficiency Telemetry</Text>
            </View>
            
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.4)', 'rgba(15, 23, 42, 0.65)']}
              className="rounded-[20px] p-5 border relative overflow-hidden"
              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <View className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />
              
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-[10px] font-black uppercase text-slate-400">Omega-3 Concentration</Text>
                  <Text className="text-lg font-black text-white italic mt-0.5">High Density (94%)</Text>
                </View>
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                  <MaterialCommunityIcons name="water-percent" size={20} color="#00d4ff" />
                </View>
              </View>

              {/* Efficiency Progress Bar */}
              <View className="space-y-2">
                <View className="flex-row justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <Text>Bio-absorption Index</Text>
                  <Text>98% Optimal</Text>
                </View>
                <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <LinearGradient
                    colors={['#00d4ff', '#00ffaa']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full"
                    style={{ width: '98%' }}
                  />
                </View>
              </View>

              <View className="flex-row justify-between mt-5 pt-4 border-t border-white/5">
                <View className="items-center flex-1">
                  <Text className="text-[9px] font-black text-slate-500 uppercase">Protein</Text>
                  <Text className="text-sm font-black text-emerald-400 mt-0.5">34g</Text>
                </View>
                <View className="items-center flex-1 border-x border-white/5">
                  <Text className="text-[9px] font-black text-slate-500 uppercase">Calories</Text>
                  <Text className="text-sm font-black text-cyan-400 mt-0.5">320 kcal</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-[9px] font-black text-slate-500 uppercase">Prep Level</Text>
                  <Text className="text-sm font-black text-amber-400 mt-0.5">Medium</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          
          {/* Ingredients Section */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="sparkles" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase text-foreground tracking-widest">Required Elements</Text>
            </View>
            
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.4)', 'rgba(15, 23, 42, 0.65)']}
              className="rounded-[20px] p-5 border relative overflow-hidden space-y-3.5"
              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <View className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent" />
              
              {ingredients.map((ing, i) => (
                <View key={i} className="flex-row items-center gap-3.5">
                  {/* Premium fish bullet icon */}
                  <View 
                    className="w-7 h-7 rounded-lg items-center justify-center border"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <MaterialCommunityIcons name="fish" size={14} color="#10b981" />
                  </View>
                  <Text className="text-sm text-foreground/80 flex-1 leading-relaxed font-medium">{ing}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Execution Protocol */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="silverware-clean" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase text-foreground tracking-widest">Cooking Steps</Text>
            </View>
            
            <View className="space-y-4">
              {steps.map((step, i) => (
                <LinearGradient
                  key={i}
                  colors={['rgba(30, 41, 59, 0.3)', 'rgba(15, 23, 42, 0.5)']}
                  className="flex-row items-start gap-4 rounded-xl p-4 border relative overflow-hidden"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                >
                  {/* Left neon indicator border */}
                  <View className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: colors.primary }} />
                  
                  <View 
                    className="w-6 h-6 rounded-full items-center justify-center border" 
                    style={{ 
                      borderColor: colors.primary, 
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      shadowColor: colors.primary,
                      shadowOpacity: 0.15,
                      shadowRadius: 3
                    }}
                  >
                    <Text className="text-[10px] font-black" style={{ color: colors.primary }}>{i + 1}</Text>
                  </View>
                  <Text className="text-sm text-foreground/90 flex-1 leading-relaxed pt-0.5 font-medium">{step}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
