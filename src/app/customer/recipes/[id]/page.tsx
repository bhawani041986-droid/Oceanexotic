"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChefHat, 
  ArrowLeft, 
  Clock, 
  Flame, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Share2,
  MessageSquare,
  Star,
  Send,
  Leaf,
  Dumbbell
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function CustomerRecipeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cmsContent, setCmsContent] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  
  // Interactive States
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch interactions from Supabase
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('recipe_interactions')
          .select('*')
          .eq('recipe_id', id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const fetchedComments = data.filter(d => d.interaction_type === 'COMMENT').map(c => ({
            id: c.id,
            user: c.user_name,
            avatar: c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name)}&background=random`,
            text: c.comment_text,
            time: new Date(c.created_at).toLocaleDateString(),
            rating: c.rating_value || 5
          }));
          
          setComments(fetchedComments);
          
          const likes = data.filter(d => d.interaction_type === 'LIKE').length;
          setLikesCount(likes);
        }
      } catch (e) {
        console.error("Failed to load interactions:", e);
      }
    };
    fetchInteractions();
  }, [id]);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/system/cms`);
        const data = await res.json();
        if (data.status === 'success') {
          setCmsContent(data.content || []);
        }
      } catch (e) {
        console.error("CMS load failed", e);
      }
    };
    fetchCms();
  }, []);

  const recipe = useMemo(() => {
    let found = cmsContent.find(c => String(c.id) === id);
    if (!found) {
      return {
        id: id || '1',
        title: 'Pan-Seared King Salmon',
        image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80',
        metadata: { difficulty: 'Medium', time: '25m' },
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
        gallery: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80'],
        fishType: "Salmon",
        prepType: "Grill",
        region: "Andaman Local"
      } as any;
    }

    const metaVal = found.metadata ? (typeof found.metadata === 'string' ? JSON.parse(found.metadata) : found.metadata) : {};
    return {
      id: String(found.id),
      title: found.title,
      image_url: found.image_url || ((metaVal.gallery && metaVal.gallery.length > 0) ? metaVal.gallery[0] : found.image),
      metadata: metaVal,
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
        ? [found.image_url, ...(metaVal.gallery || []).filter((img: string) => img !== found.image_url)]
        : (metaVal.gallery || []),
      fishType: found.sector || "General Catch",
      prepType: metaVal.prepType || "Curry",
      region: metaVal.region || "Andaman Local",
      isDynamic: true
    };
  }, [cmsContent, id]);

  const difficulty = recipe.metadata?.difficulty || "Medium";
  const time = recipe.metadata?.time || "25m";
  const gallery = recipe.gallery || [recipe.image_url];

  const calories = recipe.metadata?.calories || "420 kcal";
  const protein = recipe.metadata?.protein || "45g";
  const omega3 = recipe.metadata?.omega3 || "2.1g";
  const carbs = recipe.metadata?.carbs || "12g";
  const fats = recipe.metadata?.fats || "18g";
  const equipment = recipe.metadata?.equipment || ["Cast Iron Skillet", "Fish Spatula", "Meat Thermometer"];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this amazing ${recipe.title} recipe on OceanExotic!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share error', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Recipe link copied to clipboard!");
    }
  };

  const handleLike = async () => {
    if (isLiked) return; // Prevent spamming
    setIsLiked(true);
    setLikesCount(prev => prev + 1);
    
    try {
      await supabase.from('recipe_interactions').insert([{
        recipe_id: id,
        user_name: 'Guest User',
        interaction_type: 'LIKE'
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const tempId = Date.now().toString();
    const newEntry = {
      id: tempId,
      user: "Guest Chef",
      avatar: "https://ui-avatars.com/api/?name=Guest+Chef&background=random",
      text: newComment,
      time: "Just now",
      rating: rating || 5
    };
    
    // Optimistic UI update
    setComments([newEntry, ...comments]);
    setNewComment("");
    setRating(0);

    try {
      await supabase.from('recipe_interactions').insert([{
        recipe_id: id,
        user_name: 'Guest Chef',
        user_avatar: newEntry.avatar,
        interaction_type: 'COMMENT',
        rating_value: newEntry.rating,
        comment_text: newEntry.text
      }]);
    } catch (e) {
      console.error("Failed to post comment", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recipeSchema = useMemo(() => {
    if (!recipe || !recipe.title) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": recipe.title,
      "image": recipe.image_url,
      "description": `Delicious seafood recipe for cooking ${recipe.title} (${recipe.fishType}) Andaman style.`,
      "prepTime": "PT10M",
      "cookTime": "PT15M",
      "totalTime": "PT25M",
      "recipeYield": "2 servings",
      "recipeCategory": "Entree",
      "recipeCuisine": "Andaman Local",
      "recipeIngredient": recipe.ingredients || [],
      "recipeInstructions": (recipe.steps || []).map((step: string, idx: number) => ({
        "@type": "HowToStep",
        "text": step,
        "position": idx + 1
      }))
    };
  }, [recipe]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans relative pb-32 overflow-hidden">
      {recipeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
        />
      )}
      
      {/* Background ambiance */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[var(--c-primary)]/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[var(--c-primary)]/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* 1. STAND-ALONE BEVELED HERO IMAGE BANNER */}
      <div className="container mx-auto px-4 md:px-12 pt-8">
        <div 
          className="relative h-[40vh] md:h-[50vh] w-full bg-black overflow-hidden border border-[var(--border)] shadow-2xl"
          style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
        >
          <img 
            src={gallery[activeImg]} 
            alt={recipe.title} 
            className="w-full h-full object-cover opacity-100" 
          />
          {/* Back Button */}
          <button 
            onClick={() => router.push('/customer/recipes')} 
            className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--c-text-primary)] hover:text-white transition-all py-2 px-4 bg-[var(--c-card)]/80 backdrop-blur-md border border-[var(--border)] hover:border-[var(--c-primary)]/50 cursor-pointer"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            <ArrowLeft className="w-4 h-4" /> CHEF'S RECIPES
          </button>
          
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[var(--c-primary)]/30 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[var(--c-primary)]/30 pointer-events-none" />
        </div>

        {/* Gallery Thumbnails Strip */}
        {gallery.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
            {gallery.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={cn(
                  "relative w-20 h-14 md:w-24 md:h-16 shrink-0 overflow-hidden border transition-all cursor-pointer",
                  idx === activeImg 
                    ? "border-[var(--c-primary)] shadow-[0_0_10px_var(--c-primary)] scale-105" 
                    : "border-[var(--border)] hover:border-[var(--c-primary)]/40"
                )}
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>


      {/* 2. INTERACTIVE FLOATING ACTION BAR */}
      <div className="sticky top-[76px] z-40 bg-[var(--c-bg)]/95 backdrop-blur-3xl border-b border-[var(--border)] shadow-sm">
        <div className="container mx-auto px-4 md:px-12 py-1.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          
          {/* Scientific Tracking - Scrollable on mobile to prevent squishing */}
          <div className="flex items-center justify-between xl:justify-start gap-4 md:gap-12 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <Flame className={cn("w-4 h-4 md:w-5 md:h-5", 
                difficulty.toLowerCase() === 'easy' ? "text-emerald-400" :
                difficulty.toLowerCase() === 'expert' ? "text-rose-400" :
                "text-amber-400"
              )} />
              <div>
                <span className="text-[7px] md:text-[8px] font-black text-[var(--c-text-secondary)]/65 uppercase tracking-widest block leading-none">Difficulty</span>
                <span className={cn("text-xs md:text-sm font-black italic uppercase", 
                  difficulty.toLowerCase() === 'easy' ? "text-emerald-400" :
                  difficulty.toLowerCase() === 'expert' ? "text-rose-400" :
                  "text-amber-400"
                )}>{difficulty}</span>
              </div>
            </div>
            <div className="w-[1px] h-6 md:h-8 bg-[var(--border)] shrink-0" />
            <div className="flex items-center gap-2.5 shrink-0">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              <div>
                <span className="text-[7px] md:text-[8px] font-black text-[var(--c-text-secondary)]/65 uppercase tracking-widest block leading-none">Cook Time</span>
                <span className="text-xs md:text-sm text-cyan-400 font-black italic uppercase">{time}</span>
              </div>
            </div>
            <div className="w-[1px] h-6 md:h-8 bg-[var(--border)] shrink-0 hidden sm:block" />
            <div className="flex items-center gap-2.5 shrink-0">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              <div>
                <span className="text-[7px] md:text-[8px] font-black text-[var(--c-text-secondary)]/65 uppercase tracking-widest block leading-none">Omega-3</span>
                <span className="text-xs md:text-sm text-emerald-400 font-black italic uppercase">Optimal</span>
              </div>
            </div>
          </div>

          {/* Social Actions - Slimmer & theme synced */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 bg-transparent xl:bg-[var(--c-card)] p-0 xl:p-0.5 w-full xl:w-auto" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
            <button 
              onClick={handleLike}
              className={cn(
                "flex-1 xl:flex-none flex items-center justify-center gap-2 px-3 py-1.5 md:py-1 text-[10px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                isLiked ? "bg-rose-500/10 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]" : "bg-[var(--c-card)] xl:bg-transparent hover:bg-[var(--border)] text-[var(--c-text-secondary)] border border-[var(--border)] xl:border-transparent"
              )}
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            >
              <Heart className={cn("w-3.5 h-3.5 md:w-4 md:h-4 transition-transform", isLiked ? "fill-current scale-110" : "")} /> 
              <span className="whitespace-nowrap">{isLiked ? `${likesCount} Saved` : `Save (${likesCount})`}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-3 py-1.5 md:py-1 text-[10px] md:text-xs font-black uppercase tracking-wider text-[var(--c-text-secondary)] bg-[var(--c-card)] xl:bg-transparent hover:bg-[var(--border)] hover:text-[var(--c-text-primary)] transition-all border border-[var(--border)] xl:border-transparent cursor-pointer"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            >
              <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="whitespace-nowrap">Share</span>
            </button>
            <button 
              onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-3 py-1.5 md:py-1 text-[10px] md:text-xs font-black uppercase tracking-wider text-[var(--c-text-secondary)] bg-[var(--c-card)] xl:bg-transparent hover:bg-[var(--border)] hover:text-[var(--c-text-primary)] transition-all border border-[var(--border)] xl:border-transparent cursor-pointer"
              style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="whitespace-nowrap">{comments.length} <span className="hidden sm:inline">Comments</span></span>
            </button>
          </div>

        </div>
      </div>


      <div className="container mx-auto px-4 md:px-12 pt-12 relative z-10">
        
        {/* Title, Badges & Context Section */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="glass" className={cn("border text-[9px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-md", 
              difficulty.toLowerCase() === 'easy' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.15)]" :
              difficulty.toLowerCase() === 'expert' ? "bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.15)]" :
              "bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
            )}>
              {difficulty}
            </Badge>
            <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/25 text-[9px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-md flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              <Clock className="w-3.5 h-3.5" /> {time}
            </Badge>
            <Badge variant="glass" className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-md shadow-[0_0_8px_rgba(var(--c-primary-rgb),0.1)]">
              {recipe.region}
            </Badge>
            <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-md shadow-[0_0_8px_rgba(168,85,247,0.1)]">
              {recipe.prepType}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tight text-[var(--c-text-primary)] leading-tight drop-shadow-2xl max-w-4xl">
            {recipe.title}
          </h1>
          <div className="h-[2px] w-full max-w-[320px] bg-[var(--c-primary)] mt-2 rounded-full shadow-[0_0_12px_var(--c-primary),0_0_4px_var(--c-primary)]" />

          <p className="text-xs md:text-sm text-[var(--c-text-secondary)] font-bold uppercase tracking-widest pt-2 flex items-center gap-3">
            Target Seafood: <span className="text-[var(--c-primary)] font-black text-base">{recipe.fishType}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Recipe Steps & Ingredients */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Ingredients Board */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-widest text-[var(--c-text-primary)] flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-[var(--c-primary)]" /> Required Ingredients
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ing: string, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-5 bg-[var(--c-card)] border border-[var(--border)] rounded-2xl hover:border-[var(--c-primary)]/40 hover:bg-[var(--c-card)]/80 transition-colors cursor-default"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/30 flex items-center justify-center text-[var(--c-primary)] shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[var(--c-text-primary)] leading-relaxed flex-1 break-words">
                      {ing}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Steps */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-widest text-[var(--c-text-primary)] flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-[var(--c-primary)]" /> Cooking Sequence
              </h3>

              <div className="space-y-6">
                {recipe.steps.map((step: string, i: number) => (
                  <div 
                    key={i}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 p-5 md:p-8 bg-[var(--c-card)] border border-[var(--border)] rounded-3xl relative overflow-hidden group hover:border-[var(--c-primary)]/40 transition-all duration-500"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--border)] group-hover:bg-[var(--c-primary)] transition-colors" />
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/30 flex items-center justify-center text-[var(--c-primary)] font-black text-lg md:text-xl shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-[var(--c-primary)] group-hover:text-black transition-all duration-500">
                      {i + 1}
                    </div>
                    <p className="text-base md:text-lg font-medium text-[var(--c-text-secondary)] leading-relaxed pt-2">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion & Comments Section */}
            <div id="comments-section" className="space-y-8 pt-12 border-t border-[var(--border)]">
              <h3 className="text-2xl font-black uppercase italic tracking-widest text-[var(--c-text-primary)] flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-[var(--c-primary)]" /> Chef's Discussion ({comments.length})
              </h3>
              
              {/* Add Comment / Rate Component */}
              <Card className="p-6 md:p-8 bg-[var(--c-card)] border border-[var(--border)] rounded-[var(--c-radius-card)] shadow-2xl">
                <form onSubmit={handlePostComment} className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--c-text-secondary)]">Rate this recipe</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={cn(
                            "w-8 h-8 cursor-pointer transition-all",
                            (hoverRating || rating) >= star 
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] scale-110" 
                              : "text-slate-600 hover:text-slate-500"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience or modifications..."
                      className="w-full h-32 bg-[var(--c-bg-alt)]/65 border border-[var(--border)] rounded-2xl p-5 text-sm text-[var(--c-text-primary)] resize-none focus:outline-none focus:border-[var(--c-primary)] transition-colors placeholder:text-slate-600"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-[var(--c-primary)] text-black hover:bg-[var(--c-primary-light)] px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Posting..." : "Post Review"} <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Comments Feed */}
              <div className="space-y-6 mt-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 md:gap-6 p-6 bg-[var(--c-card)]/40 border border-[var(--border)] rounded-3xl backdrop-blur-sm">
                    <img src={comment.avatar} alt={comment.user} className="w-12 h-12 rounded-full border-2 border-[var(--border)]" />
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[var(--c-text-primary)]">{comment.user}</span>
                          <span className="text-[10px] uppercase tracking-widest text-[var(--c-text-secondary)]/70 font-bold">{comment.time}</span>
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                          {Array.from({ length: comment.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                      </div>
                      <p className="text-sm text-[var(--c-text-secondary)] leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Right Column: Nutrition & Context Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card 
              className="p-8 bg-[var(--c-card)] border border-[var(--c-primary)]/30 shadow-[0_0_40px_-10px_rgba(0,209,255,0.1)] relative overflow-hidden"
              style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-primary)]/10 blur-3xl rounded-full pointer-events-none" />
              
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--c-primary)] mb-6 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Nutritional Profile
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--c-text-secondary)]">Calories</span>
                  <span className="font-black text-[var(--c-text-primary)]">{calories}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--c-text-secondary)]">Protein</span>
                  <span className="font-black text-emerald-400">{protein}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--c-text-secondary)]">Omega-3</span>
                  <span className="font-black text-cyan-400">{omega3}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--c-text-secondary)]">Carbs</span>
                  <span className="font-black text-[var(--c-text-primary)]">{carbs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--c-text-secondary)]">Fats</span>
                  <span className="font-black text-[var(--c-text-primary)]">{fats}</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider leading-relaxed text-center">
                  This recipe is certified healthy by OceanExotic's culinary team.
                </p>
              </div>
            </Card>

            {/* Required Equipment */}
            <Card 
              className="p-8 bg-[var(--c-card)]/50 border border-[var(--border)]"
              style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
            >
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--c-text-secondary)] mb-6">
                Recommended Equipment
              </h4>
              <ul className="space-y-3">
                {equipment.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-[var(--c-text-secondary)]">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" /> {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
