import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import { RECIPES_DB, Recipe } from '@/constants/recipes';

// Premium stylized outline fish SVG decorator
const FishDecoratorSVG = ({ style, color }: { style?: any; color: string }) => (
  <Svg width="100" height="70" viewBox="0 0 120 80" style={style} fill="none">
    <Path
      d="M10 40 C 30 20, 70 20, 90 40 C 95 45, 105 55, 110 50 L 115 65 L 100 55 C 95 50, 90 45, 85 43 C 65 30, 25 30, 10 40 Z"
      stroke={color}
      strokeWidth="1.2"
      strokeDasharray="4,4"
      opacity="0.15"
    />
    <Circle cx="25" cy="38" r="2" fill={color} opacity="0.2" />
  </Svg>
);

// High-fidelity background telemetry grid
const CyberFishGrid = () => {
  const colors = useThemeColors();
  return (
    <View style={StyleSheet.absoluteFillObject} className="pointer-events-none opacity-35">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Path d="M0,80 Q120,40 240,80 T480,80 T720,80" stroke={colors.primary} strokeWidth="1" opacity="0.08" fill="none" />
        <Path d="M0,320 Q100,280 200,320 T400,320 T600,320" stroke={colors.primary} strokeWidth="0.8" opacity="0.05" fill="none" />
        <Path d="M0,580 Q90,620 180,580 T360,580 T540,580" stroke={colors.primary} strokeWidth="1" opacity="0.06" fill="none" />
      </Svg>
      
      <FishDecoratorSVG style={{ position: 'absolute', top: 120, left: -25, transform: [{ rotate: '15deg' }, { scaleX: -1 }] }} color={colors.primary} />
      <FishDecoratorSVG style={{ position: 'absolute', top: 380, right: -20, transform: [{ rotate: '-10deg' }] }} color={colors.primary} />
      <FishDecoratorSVG style={{ position: 'absolute', top: 650, left: -10, transform: [{ rotate: '30deg' }] }} color={colors.primary} />
    </View>
  );
};

export default function RecipesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [search, setSearch] = useState('');
  const [selectedPrep, setSelectedPrep] = useState<'ALL' | 'CURRY' | 'GRILL' | 'FRY'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'SOUTH INDIAN' | 'BENGALI' | 'TELUGU' | 'ANDAMAN LOCAL'>('ALL');

  const preps = ['ALL', 'CURRY', 'GRILL', 'FRY'] as const;
  const regions = ['ALL', 'SOUTH INDIAN', 'BENGALI', 'TELUGU', 'ANDAMAN LOCAL'] as const;

  // Filtered recipes list
  const filteredRecipes = useMemo(() => {
    return RECIPES_DB.filter((recipe) => {
      const matchesSearch = 
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.fishType.toLowerCase().includes(search.toLowerCase()) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(search.toLowerCase()));

      const matchesPrep = selectedPrep === 'ALL' || recipe.prepType.toUpperCase() === selectedPrep;
      
      const matchesRegion = selectedRegion === 'ALL' || recipe.region.toUpperCase() === selectedRegion;

      return matchesSearch && matchesPrep && matchesRegion;
    });
  }, [search, selectedPrep, selectedRegion]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <CyberFishGrid />

      {/* Header Bar */}
      <View 
        className="px-5 pb-4 flex-row items-center gap-4 border-b" 
        style={{ 
          paddingTop: Math.max(insets.top, 20),
          backgroundColor: 'rgba(8,12,22,0.65)',
          borderBottomColor: colors.border
        }}
      >
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center bg-white/5 border"
          style={{ borderColor: colors.border }}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>
            OceanExotic Chef's Recipes
          </Text>
          <Text className="text-xl font-black text-white uppercase italic">
            Chef's Recipes
          </Text>
        </View>
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10 border border-primary/20">
          <MaterialCommunityIcons name="chef-hat" size={20} color={colors.primary} />
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Search & Filter Controls Panel */}
        <View className="p-5 space-y-5">
          {/* Glassmorphic Search Bar */}
          <View 
            className="flex-row items-center px-4 h-12 rounded-xl border bg-white/5"
            style={{ borderColor: colors.border }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} className="mr-2" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search fish, recipes or ingredients..."
              placeholderTextColor={colors.isDark ? '#5A6E85' : '#94A3B8'}
              className="flex-1 text-sm font-medium text-white"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Prep Type Filters */}
          <View className="space-y-2">
            <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preparation Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {preps.map((p) => {
                const active = selectedPrep === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setSelectedPrep(p)}
                    className="px-4 py-2 rounded-lg border transition-all"
                    style={{
                      backgroundColor: active ? `${colors.primary}15` : 'rgba(255,255,255,0.02)',
                      borderColor: active ? colors.primary : colors.border
                    }}
                  >
                    <Text 
                      className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: active ? colors.primary : colors.textMuted }}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Regional Style Filters */}
          <View className="space-y-2">
            <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cuisine / Region</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {regions.map((r) => {
                const active = selectedRegion === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setSelectedRegion(r)}
                    className="px-4 py-2 rounded-lg border transition-all"
                    style={{
                      backgroundColor: active ? `${colors.primary}15` : 'rgba(255,255,255,0.02)',
                      borderColor: active ? colors.primary : colors.border
                    }}
                  >
                    <Text 
                      className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: active ? colors.primary : colors.textMuted }}
                    >
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Recipes Grid/List */}
        <View className="px-5 space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Active Recipes ({filteredRecipes.length})
            </Text>
          </View>

          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })}
                className="relative h-48 overflow-hidden rounded-[20px] border shadow-xl justify-end"
                style={{ borderColor: colors.border }}
              >
                <Image
                  source={{ uri: recipe.image }}
                  className="absolute inset-0 h-full w-full opacity-60"
                  contentFit="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(8,13,25,0.98)']}
                  className="absolute inset-0"
                />

                <View className="relative z-10 p-5 gap-2">
                  <View className="flex-row gap-2 flex-wrap">
                    <View 
                      className="border px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        borderColor: 'rgba(16,185,129,0.3)'
                      }}
                    >
                      <Text className="text-[8px] font-black uppercase text-emerald-400">{recipe.region}</Text>
                    </View>
                    <View 
                      className="border px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'rgba(6,182,212,0.1)',
                        borderColor: 'rgba(6,182,212,0.3)'
                      }}
                    >
                      <Text className="text-[8px] font-black uppercase text-cyan-400">{recipe.prepType}</Text>
                    </View>
                    <View className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      <Text className="text-[8px] font-black uppercase text-slate-400">{recipe.time}</Text>
                    </View>
                  </View>

                  <Text className="text-lg font-black uppercase italic text-white leading-tight">
                    {recipe.title}
                  </Text>
                  
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-[9px] font-black text-slate-400 uppercase">
                      Seafood: <Text style={{ color: colors.primary }}>{recipe.fishType}</Text>
                    </Text>
                    <Text className="text-[9px] font-black uppercase tracking-widest text-primary">
                      VIEW RECIPE ➜
                    </Text>
                  </View>
                </View>

                {/* Cybernetic corners overlay */}
                <Svg width="16" height="16" style={{ position: "absolute", top: -1, left: -1, zIndex: 40 }}>
                  <Path d="M0,0 L16,0 L0,16 Z" fill={colors.bg} />
                  <Path d="M16,0 L0,16" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
                <Svg width="16" height="16" style={{ position: "absolute", bottom: -1, right: -1, zIndex: 40 }}>
                  <Path d="M16,16 L0,16 L16,0 Z" fill={colors.bg} />
                  <Path d="M0,16 L16,0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Svg>
              </Pressable>
            ))
          ) : (
            <View className="py-16 items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-50">
              <MaterialCommunityIcons name="fish-off" size={32} color={colors.textMuted} />
              <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-4">
                No Matching Recipes Found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
