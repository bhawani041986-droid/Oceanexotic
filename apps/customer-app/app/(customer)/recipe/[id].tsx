import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Dimensions, StyleSheet, Share, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHomeData } from '@/hooks/useHomeData';
import { ChamferedBox } from '@/components/ui/ChamferedBox';
import api from '@/services/api';

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
  const { cms } = useHomeData();
  const [activeImg, setActiveImg] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  // Interactions State
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipe = useMemo(() => {
    // Fallback to CMS dynamic recipes
    let found: any = cms?.data?.find((c: any) => c.id?.toString() === id);
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
        gallery: found.image_url 
          ? [found.image_url, ...(metaVal.gallery || []).filter((g: string) => g !== found.image_url)]
          : (metaVal.gallery || [])
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

  const difficultyColor = useMemo(() => {
    const d = (meta.difficulty || 'Medium').toLowerCase();
    if (d === 'easy') return '#10b981'; // Emerald
    if (d === 'expert') return '#f43f5e'; // Rose
    return '#f59e0b'; // Amber/Medium
  }, [meta.difficulty]);

  const ingredients = recipe.ingredients;
  const steps = recipe.steps;


  const calories = meta.calories || "420 kcal";
  const protein = meta.protein || "45g";
  const omega3 = meta.omega3 || "2.1g";
  const carbs = meta.carbs || "12g";
  const fats = meta.fats || "18g";
  const equipment = meta.equipment || ["Cast Iron Skillet", "Fish Spatula", "Meat Thermometer"];

  const fetchInteractions = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(`/customer/recipes/interactions?recipe_id=${id}`);
      if (response.data?.status === 'success') {
        setLikesCount(response.data.likesCount || 0);
        setComments(response.data.comments || []);
      }
    } catch (e) {
      console.error("Failed to load interactions:", e);
    }
  }, [id]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    setLikesCount(prev => prev + 1);
    try {
      await api.post(`/customer/recipes/interactions`, {
        recipe_id: id,
        interaction_type: 'LIKE'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing recipe for ${recipe.title} on OceanExotic!`,
        url: `https://oceanexotic.com/customer/recipes/${id}`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    const tempId = Date.now().toString();
    const newEntry = {
      id: tempId,
      user: "Guest Chef",
      avatar: `https://ui-avatars.com/api/?name=Guest+Chef&background=random`,
      text: newComment,
      time: "Just now",
      rating: rating
    };
    
    setComments(prev => [newEntry, ...prev]);
    setNewComment("");
    setRating(5);

    try {
      await api.post(`/customer/recipes/interactions`, {
        recipe_id: id,
        interaction_type: 'COMMENT',
        user_name: 'Guest Chef',
        comment_text: newEntry.text,
        rating_value: newEntry.rating
      });
      fetchInteractions();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Dynamic Telemetry Cyber Background */}
      <CyberFishGrid />

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1" 
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
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
                    className="w-1.5 h-1.5 rounded-none" 
                    style={{ backgroundColor: idx === activeImg ? colors.primary : 'rgba(255,255,255,0.4)' }}
                  />
                ))}
              </View>
            </View>
          ) : (
            <Image 
              source={{ uri: (recipe.gallery && recipe.gallery.length > 0) ? recipe.gallery[0] : (recipe.image_url || recipe.image) }} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          )}

          {/* Top Gradient Overlay for Status/Navigation Bar readability */}
          <LinearGradient 
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, zIndex: 10 }}
            className="pointer-events-none"
          />

          {/* Bottom Gradient Overlay for Title Text readability */}
          <LinearGradient 
            colors={['transparent', colors.bg]} 
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, zIndex: 10 }}
            className="pointer-events-none"
          />
          
          {/* Header Controls */}
          <View 
            className="absolute left-0 right-0 flex-row justify-between items-center px-4"
            style={{ top: Math.max(insets.top, 20) }}
          >
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-none items-center justify-center bg-black/50 border border-white/10 backdrop-blur-md"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
            </Pressable>
            <View className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-none backdrop-blur-md flex-row items-center gap-1.5">
              <MaterialCommunityIcons name="chef-hat" size={12} color={colors.primary} />
              <Text className="text-[9px] font-black text-white uppercase tracking-widest">Recipe Active</Text>
            </View>
          </View>

          {/* Title Area */}
          <View className="absolute bottom-6 left-5 right-5 space-y-3">
            <View className="flex-row items-center gap-2 flex-wrap">
              <View 
                className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-none border"
                style={{ 
                  backgroundColor: `${difficultyColor}15`, 
                  borderColor: `${difficultyColor}35`
                }}
              >
                <MaterialCommunityIcons name="fire" size={12} color={difficultyColor} />
                <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: difficultyColor }}>
                  {meta.difficulty || 'Medium'}
                </Text>
              </View>
              <View 
                className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-none border"
                style={{ 
                  backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                  borderColor: 'rgba(6, 182, 212, 0.3)'
                }}
              >
                <MaterialCommunityIcons name="clock-outline" size={12} color="#06b6d4" />
                <Text className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                  {meta.time || '25m'}
                </Text>
              </View>
            </View>
            <Text className="text-3xl font-black text-white uppercase italic tracking-tight shadow-2xl leading-none">
              {recipe.title}
            </Text>
            {/* Glowing Neon Underline */}
            <View 
              style={{
                height: 2,
                width: 160,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 3,
                marginTop: 4
              }}
            />
          </View>

        </View>

        {/* Content Section */}
        <View className="px-5 pt-6 space-y-8">

          {/* Interactive Save / Share / Comment Action Bar */}
          <ChamferedBox
            fillColor={colors.card}
            strokeColor={colors.border}
            bevelSize={10}
            className="w-full relative overflow-hidden"
            style={{ minHeight: 0 }}
          >
            <View className="flex-row justify-between items-center p-1 gap-1.5">

              <Pressable 
                onPress={handleLike}
                className="flex-1 flex-row items-center justify-center gap-1"
                style={{ 
                  backgroundColor: isLiked ? `${colors.primary}15` : colors.card,
                  borderColor: isLiked ? colors.primary : colors.border,
                  borderWidth: 1,
                  height: 26
                }}
              >
                <MaterialCommunityIcons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={12} 
                  color={isLiked ? "#ef4444" : "#94a3b8"} 
                />
                <Text className="text-[8.5px] font-black uppercase tracking-wider" style={{ color: isLiked ? "#ef4444" : "#94a3b8" }}>
                  {isLiked ? `${likesCount} Saved` : `Save (${likesCount})`}
                </Text>
              </Pressable>
              
              <Pressable 
                onPress={handleShare}
                className="flex-1 flex-row items-center justify-center gap-1"
                style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, height: 26 }}
              >
                <MaterialCommunityIcons name="share-variant" size={12} color="#94a3b8" />
                <Text className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Share</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                className="flex-1 flex-row items-center justify-center gap-1"
                style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, height: 26 }}
              >
                <MaterialCommunityIcons name="comment-text-outline" size={12} color="#94a3b8" />
                <Text className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                  {comments.length} Comments
                </Text>
              </Pressable>
            </View>

          </ChamferedBox>


          {/* Dynamic Nutritional Profile Card */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Nutritional Profile</Text>
            </View>

            <ChamferedBox
              fillColor="transparent"
              strokeColor={colors.border}
              bevelSize={16}
              className="relative overflow-hidden"
              style={{ minHeight: 180 }}
            >
              <LinearGradient
                colors={[`${colors.card}d5`, `${colors.bg}fa`]}
                className="p-5 w-full"
              >
                <View className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.primary }} />
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center pb-3 border-b" style={{ borderBottomColor: colors.border }}>
                    <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>Calories</Text>
                    <Text className="text-xs font-black" style={{ color: colors.text }}>{calories}</Text>
                  </View>
                  <View className="flex-row justify-between items-center pb-3 border-b" style={{ borderBottomColor: colors.border }}>
                    <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>Protein</Text>
                    <Text className="text-xs font-black text-emerald-400">{protein}</Text>
                  </View>
                  <View className="flex-row justify-between items-center pb-3 border-b" style={{ borderBottomColor: colors.border }}>
                    <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>Omega-3</Text>
                    <Text className="text-xs font-black text-cyan-400">{omega3}</Text>
                  </View>
                  <View className="flex-row justify-between items-center pb-3 border-b" style={{ borderBottomColor: colors.border }}>
                    <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>Carbs</Text>
                    <Text className="text-xs font-black" style={{ color: colors.text }}>{carbs}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>Fats</Text>
                    <Text className="text-xs font-black" style={{ color: colors.text }}>{fats}</Text>
                  </View>
                </View>

                <View className="mt-5 p-3 rounded-none border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                  <Text className="text-[9px] text-emerald-400 font-black uppercase tracking-wider text-center leading-relaxed">
                    This recipe is certified healthy by OceanExotic's culinary team.
                  </Text>
                </View>
              </LinearGradient>
            </ChamferedBox>

          </View>

          {/* Dynamic Recommended Equipment Card */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="tools" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Recommended Equipment</Text>
            </View>

            <ChamferedBox
              fillColor="transparent"
              strokeColor={colors.border}
              bevelSize={16}
              className="relative overflow-hidden"
            >
              <LinearGradient
                colors={[`${colors.card}d5`, `${colors.bg}fa`]}
                className="p-5 w-full"
              >
                <View className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.border }} />
                
                <View className="space-y-2.5">
                  {equipment.map((item: string, idx: number) => (
                    <View key={idx} className="flex-row items-center gap-3">
                      <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.textMuted }} />
                      <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>{item}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </ChamferedBox>

          </View>
          
          {/* Ingredients Section */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name={"sparkles" as any} size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Required Ingredients</Text>
            </View>

            
            <ChamferedBox
              fillColor="transparent"
              strokeColor={colors.border}
              bevelSize={16}
              className="relative overflow-hidden"
              style={{ minHeight: 0 }}
            >
              <LinearGradient
                colors={[`${colors.card}d5`, `${colors.bg}fa`]}
                className="p-5 w-full space-y-3.5"
              >
                <View className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent" />
                
                {(ingredients as string[]).map((ing: string, i: number) => (
                  <View key={i} className="flex-row items-center gap-3.5">
                    {/* Premium fish bullet icon */}
                    <View 
                      className="w-7 h-7 rounded-none items-center justify-center border"
                      style={{
                        backgroundColor: `${colors.primary}12`,
                        borderColor: `${colors.primary}40`,
                      }}
                    >
                      <MaterialCommunityIcons name="fish" size={14} color={colors.primary} />
                    </View>
                    <Text className="text-sm flex-1 leading-relaxed font-medium" style={{ color: colors.text }}>{ing}</Text>
                  </View>
                ))}
              </LinearGradient>
            </ChamferedBox>

          </View>

          {/* Execution Protocol */}
          <View className="space-y-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="silverware-clean" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Cooking Sequence</Text>
            </View>

            
            <View className="space-y-4">
              {(steps as string[]).map((step: string, i: number) => (
                <ChamferedBox
                  key={i}
                  fillColor="transparent"
                  strokeColor={colors.border}
                  bevelSize={10}
                  style={{ minHeight: 60 }}
                  className="relative overflow-hidden"
                >
                  <LinearGradient
                    colors={[`${colors.card}d5`, `${colors.bg}fa`]}
                    className="flex-row items-start gap-4 p-4 w-full"
                  >
                    {/* Left neon indicator border */}
                    <View className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: colors.primary }} />
                    
                    <View 
                      className="w-6 h-6 rounded-none items-center justify-center border" 
                      style={{ 
                        borderColor: colors.primary, 
                        backgroundColor: colors.card,
                        shadowColor: colors.primary,
                        shadowOpacity: 0.15,
                        shadowRadius: 3
                      }}
                    >
                      <Text className="text-[10px] font-black" style={{ color: colors.primary }}>{i + 1}</Text>
                    </View>
                    <Text className="text-sm flex-1 leading-relaxed pt-0.5 font-medium" style={{ color: colors.text }}>{step}</Text>
                  </LinearGradient>
                </ChamferedBox>

              ))}
            </View>
          </View>

          {/* Chef's Discussion Feed */}
          <View className="space-y-4 pt-4 border-t" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="forum" size={16} color={colors.primary} />
              <Text className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>
                Chef's Discussion ({comments.length})
              </Text>
            </View>


            {/* Post Review Form Card */}
            <ChamferedBox
              fillColor="transparent"
              strokeColor={colors.border}
              bevelSize={12}
              style={{ minHeight: 0 }}
            >
              <LinearGradient
                colors={[`${colors.card}d5`, `${colors.bg}fa`]}
                className="p-5 w-full space-y-4"
              >
                <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.textMuted }}>Rate this recipe</Text>
                
                {/* Star Ratings Input */}
                <View className="flex-row gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => setRating(star)}>
                      <MaterialCommunityIcons 
                        name={rating >= star ? "star" : "star-outline"} 
                        size={26} 
                        color={rating >= star ? "#eab308" : "#475569"} 
                      />
                    </Pressable>
                  ))}
                </View>

                {/* Comment Textarea Input */}
                <View 
                  className="border p-3 min-h-[80px]"
                  style={{ borderColor: colors.border, backgroundColor: colors.bg }}
                >
                  <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Share your experience or modifications..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    className="text-xs leading-relaxed font-medium text-left"
                    style={{ textAlignVertical: 'top', color: colors.text }}
                  />
                </View>

                {/* Submit button */}
                <Pressable
                  disabled={!newComment.trim() || isSubmitting}
                  onPress={handlePostComment}
                  className="py-2.5 items-center justify-center border"
                  style={{
                    backgroundColor: (!newComment.trim() || isSubmitting) ? 'rgba(255,255,255,0.02)' : colors.primary,
                    borderColor: (!newComment.trim() || isSubmitting) ? 'rgba(255,255,255,0.05)' : colors.primary,
                    opacity: (!newComment.trim() || isSubmitting) ? 0.4 : 1
                  }}
                >
                  <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: (!newComment.trim() || isSubmitting) ? '#64748b' : '#000000' }}>
                    {isSubmitting ? "Posting..." : "Post Review ➜"}
                  </Text>
                </Pressable>
              </LinearGradient>
            </ChamferedBox>

            {/* Comments Feed List */}
            <View className="space-y-4 mt-6">
              {comments.map((comment) => (
                <ChamferedBox
                  key={comment.id}
                  fillColor="transparent"
                  strokeColor="rgba(255,255,255,0.05)"
                  bevelSize={10}
                  style={{ minHeight: 0 }}
                  className="w-full relative overflow-hidden shadow-xl"
                >
                  <LinearGradient
                    colors={[`${colors.card}e6`, `${colors.bg}fa`]}
                    className="p-4 flex-row gap-4"
                  >
                    {/* Subtle left accent */}
                    <View className="absolute left-0 top-0 bottom-0 w-[2px] opacity-40" style={{ backgroundColor: colors.primary }} />

                    <Image 
                      source={{ uri: comment.avatar }} 
                      className="w-11 h-11 rounded-none border border-white/10" 
                      style={{ 
                        shadowColor: colors.primary,
                        shadowOpacity: 0.2,
                        shadowRadius: 5
                      }}
                    />
                    
                    <View className="flex-1 space-y-1.5 pt-0.5">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-xs font-black uppercase tracking-wider" style={{ color: colors.text }}>{comment.user}</Text>
                          <Text className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: colors.textMuted }}>{comment.time}</Text>
                        </View>
                        
                        {/* Star Rating Badge */}
                        <View className="flex-row gap-0.5 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <MaterialCommunityIcons 
                              key={idx} 
                              name="star" 
                              size={10} 
                              color={idx < comment.rating ? "#eab308" : "rgba(255,255,255,0.1)"} 
                            />
                          ))}
                        </View>
                      </View>
                      
                      <View className="pt-1">
                        <Text className="text-xs leading-[1.6] font-medium" style={{ color: colors.text, opacity: 0.85 }}>
                          "{comment.text}"
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </ChamferedBox>
              ))}
            </View>
          </View>


        </View>
      </ScrollView>
    </View>
  );
}
