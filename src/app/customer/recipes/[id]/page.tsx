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
import { RECIPES_DB } from "@/constants/recipes";
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
    const foundLocal = RECIPES_DB.find(r => r.id === id);
    if (foundLocal) {
      return {
        id: foundLocal.id,
        title: foundLocal.title,
        image_url: foundLocal.image,
        metadata: { difficulty: foundLocal.difficulty, time: foundLocal.time },
        ingredients: foundLocal.ingredients,
        steps: foundLocal.steps,
        gallery: [foundLocal.image],
        fishType: foundLocal.fishType,
        prepType: foundLocal.prepType,
        region: foundLocal.region
      } as any;
    }

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
      image_url: found.image_url || found.image,
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
      gallery: metaVal.gallery || [found.image_url || found.image],
      fishType: found.sector || "General Catch",
      prepType: metaVal.prepType || "Curry",
      region: metaVal.region || "Andaman Local",
      isDynamic: true
    };
  }, [cmsContent, id]);

  const difficulty = recipe.metadata?.difficulty || "Medium";
  const time = recipe.metadata?.time || "25m";
  const gallery = recipe.gallery || [recipe.image_url];

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

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans relative pb-32">
      
      {/* 1. STUNNING HERO IMAGE HEADER */}
      <div className="relative h-[50vh] md:h-[65vh] w-full bg-black">
        <img 
          src={gallery[activeImg]} 
          alt={recipe.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg)] via-[var(--c-bg)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Back Button */}
        <button 
          onClick={() => router.push('/customer/recipes')} 
          className="absolute top-8 left-4 md:left-10 z-20 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80 hover:text-white transition-all py-2.5 px-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/30"
        >
          <ArrowLeft className="w-4 h-4" /> CHEF'S RECIPES
        </button>

        {/* Title & Badges Superimposed */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2.5 mb-6">
              <Badge variant="glass" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 backdrop-blur-md">
                {recipe.region}
              </Badge>
              <Badge variant="glass" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 backdrop-blur-md">
                {recipe.prepType}
              </Badge>
              <Badge variant="glass" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 backdrop-blur-md flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> High Protein
              </Badge>
              <Badge variant="glass" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 backdrop-blur-md flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Keto-Friendly
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black uppercase italic tracking-tight text-white leading-[1.1] drop-shadow-2xl max-w-4xl">
              {recipe.title}
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-bold uppercase tracking-widest mt-6 flex items-center gap-3">
              Target Seafood: <span className="text-[var(--c-primary)] font-black text-lg">{recipe.fishType}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE FLOATING ACTION BAR */}
      <div className="sticky top-[76px] z-40 bg-[var(--c-bg)]/90 backdrop-blur-3xl border-b border-[var(--foreground)]/5 shadow-sm">
        <div className="container mx-auto px-4 md:px-12 py-3 md:py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Scientific Telemetry - Scrollable on mobile to prevent squishing */}
          <div className="flex items-center justify-between xl:justify-start gap-4 md:gap-12 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-[var(--c-primary)]" />
              <div>
                <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest block leading-none">Difficulty</span>
                <span className="text-xs md:text-sm text-white font-black italic uppercase">{difficulty}</span>
              </div>
            </div>
            <div className="w-[1px] h-6 md:h-8 bg-white/10 shrink-0" />
            <div className="flex items-center gap-2.5 shrink-0">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
              <div>
                <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest block leading-none">Cook Time</span>
                <span className="text-xs md:text-sm text-white font-black italic uppercase">{time}</span>
              </div>
            </div>
            <div className="w-[1px] h-6 md:h-8 bg-white/10 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-2.5 shrink-0">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              <div>
                <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest block leading-none">Omega-3</span>
                <span className="text-xs md:text-sm text-white font-black italic uppercase">Optimal</span>
              </div>
            </div>
          </div>

          {/* Social Actions - Wrap on mobile if needed */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 bg-transparent xl:bg-[var(--c-card)] p-0 xl:p-1.5 rounded-full xl:border border-[var(--foreground)]/5 xl:shadow-inner w-full xl:w-auto">
            <button 
              onClick={handleLike}
              className={cn(
                "flex-1 xl:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all",
                isLiked ? "bg-red-500/10 text-red-500 shadow-glow-red" : "bg-[var(--c-card)] xl:bg-transparent hover:bg-white/5 text-slate-400 border border-[var(--foreground)]/5 xl:border-transparent"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5 md:w-4 md:h-4 transition-transform", isLiked ? "fill-current scale-110" : "")} /> 
              <span className="whitespace-nowrap">{isLiked ? `${likesCount} Saved` : `Save (${likesCount})`}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400 bg-[var(--c-card)] xl:bg-transparent hover:bg-white/5 hover:text-white transition-all border border-[var(--foreground)]/5 xl:border-transparent"
            >
              <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="whitespace-nowrap">Share</span>
            </button>
            <button 
              onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400 bg-[var(--c-card)] xl:bg-transparent hover:bg-white/5 hover:text-white transition-all border border-[var(--foreground)]/5 xl:border-transparent"
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="whitespace-nowrap">{comments.length} <span className="hidden sm:inline">Comments</span></span>
            </button>
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 pt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Recipe Steps & Ingredients */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Ingredients Board */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-widest text-white flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-[var(--c-primary)]" /> Required Ingredients
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ing: string, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-5 bg-[var(--c-card)] border border-[var(--foreground)]/5 rounded-2xl hover:border-[var(--c-primary)]/30 hover:bg-[var(--foreground)]/5 transition-colors cursor-default"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 flex items-center justify-center text-[var(--c-primary)] shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-200 leading-relaxed flex-1 break-words">
                      {ing}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Steps */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic tracking-widest text-white flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-[var(--c-primary)]" /> Cooking Sequence
              </h3>

              <div className="space-y-6">
                {recipe.steps.map((step: string, i: number) => (
                  <div 
                    key={i}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 p-5 md:p-8 bg-[var(--c-card)] border border-[var(--foreground)]/5 rounded-3xl relative overflow-hidden group hover:border-[var(--c-primary)]/30 transition-all duration-500"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--foreground)]/10 group-hover:bg-[var(--c-primary)] transition-colors" />
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 flex items-center justify-center text-[var(--c-primary)] font-black text-lg md:text-xl shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-[var(--c-primary)] group-hover:text-black transition-all duration-500">
                      {i + 1}
                    </div>
                    <p className="text-base md:text-lg font-medium text-slate-300 leading-relaxed pt-2">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion & Comments Section */}
            <div id="comments-section" className="space-y-8 pt-12 border-t border-white/5">
              <h3 className="text-2xl font-black uppercase italic tracking-widest text-white flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-[var(--c-primary)]" /> Chef's Discussion ({comments.length})
              </h3>
              
              {/* Add Comment / Rate Component */}
              <Card className="p-6 md:p-8 bg-[var(--c-card)] border border-white/5 rounded-[var(--c-radius-card)] shadow-2xl">
                <form onSubmit={handlePostComment} className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Rate this recipe</span>
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
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white resize-none focus:outline-none focus:border-[var(--c-primary)] transition-colors placeholder:text-slate-600"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-[var(--c-primary)] text-black hover:bg-[var(--c-primary-light)] px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? "Posting..." : "Post Review"} <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Comments Feed */}
              <div className="space-y-6 mt-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 md:gap-6 p-6 bg-[var(--c-card)]/40 border border-white/5 rounded-3xl backdrop-blur-sm">
                    <img src={comment.avatar} alt={comment.user} className="w-12 h-12 rounded-full border-2 border-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{comment.user}</span>
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{comment.time}</span>
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                          {Array.from({ length: comment.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Nutrition & Context Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 bg-[var(--c-card)] border border-[var(--c-primary)]/20 rounded-[var(--c-radius-card)] shadow-[0_0_40px_-10px_rgba(0,209,255,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-primary)]/10 blur-3xl rounded-full pointer-events-none" />
              
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--c-primary)] mb-6 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Nutritional Profile
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-sm text-slate-400">Calories</span>
                  <span className="font-black text-white">420 kcal</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-sm text-slate-400">Protein</span>
                  <span className="font-black text-emerald-400">45g</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-sm text-slate-400">Omega-3</span>
                  <span className="font-black text-cyan-400">2.1g</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-sm text-slate-400">Carbs</span>
                  <span className="font-black text-white">12g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Fats</span>
                  <span className="font-black text-white">18g</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider leading-relaxed text-center">
                  This recipe is certified healthy by OceanExotic's culinary team.
                </p>
              </div>
            </Card>

            {/* Required Equipment */}
            <Card className="p-8 bg-[var(--c-card)]/50 border border-white/5 rounded-[var(--c-radius-card)]">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                Recommended Equipment
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full" /> Cast Iron Skillet</li>
                <li className="flex items-center gap-3 text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full" /> Fish Spatula</li>
                <li className="flex items-center gap-3 text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full" /> Meat Thermometer</li>
              </ul>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
