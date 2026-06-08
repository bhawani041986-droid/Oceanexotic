"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChefHat, 
  ArrowLeft, 
  Clock, 
  Flame, 
  Globe, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RECIPES_DB } from "@/constants/recipes";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function CustomerRecipeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cmsContent, setCmsContent] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState(0);

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
    // Find static local recipes database
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

    // Dynamic CMS recipes
    let found = cmsContent.find(c => String(c.id) === id);
    if (!found) {
      // Fallback
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

  const handleNextImg = () => {
    setActiveImg((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevImg = () => {
    setActiveImg((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans relative pb-32">
      {/* Background ambience */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[var(--c-primary)]/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-10 pt-8 relative z-10">
        
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/customer/recipes')} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--c-text-secondary)] hover:text-white transition-all py-2 px-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO CHEF'S RECIPES
          </button>
          
          <div className="bg-black/40 border border-[var(--foreground)]/10 px-4 py-2 rounded-xl flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[var(--c-primary)]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Recipe Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Visual assets / Gallery */}
          <div className="lg:col-span-6 space-y-6">
            <Card 
              className="relative aspect-video lg:aspect-[4/3] rounded-[var(--c-radius-card)] overflow-hidden border border-[var(--foreground)]/5 bg-black"
              style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
            >
              <img 
                src={gallery[activeImg]} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Gallery Controls */}
              {gallery.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImg}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/95 rounded-full border border-white/10 text-white transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNextImg}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/95 rounded-full border border-white/10 text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {gallery.map((_: any, idx: number) => (
                      <span 
                        key={idx}
                        onClick={() => setActiveImg(idx)}
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${idx === activeImg ? 'bg-[var(--c-primary)] scale-110 shadow-glow-purple' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Thumbnail grid */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {gallery.map((img: string, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all ${idx === activeImg ? 'border-[var(--c-primary)] scale-[1.03] shadow-lg' : 'border-[var(--foreground)]/10 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Recipe Information */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {recipe.region}
                </Badge>
                <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {recipe.prepType}
                </Badge>
                {recipe.isDynamic && (
                  <Badge variant="glass" className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    DYNAMIC SYNC
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none">
                {recipe.title}
              </h1>

              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Target Seafood: <span className="text-[var(--c-primary)] font-black">{recipe.fishType}</span>
              </p>
            </div>

            {/* Scientific Telemetry / Prep Specs */}
            <Card 
              className="p-6 bg-slate-900/40 border border-white/5 relative overflow-hidden"
              style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500 via-[var(--c-primary)] to-transparent" />
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">DIFFICULTY LEVEL</span>
                  <div className="flex items-center justify-center gap-1.5 text-white font-black italic uppercase text-sm md:text-base">
                    <Flame className="w-4 h-4 text-[var(--c-primary)]" />
                    {difficulty}
                  </div>
                </div>
                <div className="space-y-1 border-x border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">PREPARATION TIME</span>
                  <div className="flex items-center justify-center gap-1.5 text-white font-black italic uppercase text-sm md:text-base">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    {time}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">OMEGA-3 LEVEL</span>
                  <div className="flex items-center justify-center gap-1.5 text-white font-black italic uppercase text-sm md:text-base">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    OPTIMAL
                  </div>
                </div>
              </div>
            </Card>

            {/* Ingredients Board */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--c-primary)]" /> Required Ingredients
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ing: string, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-4 bg-[var(--c-card)] border border-[var(--foreground)]/5 rounded-xl"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed">
                      {ing}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps / Cooking Steps */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-black uppercase italic tracking-widest text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--c-primary)]" /> Cooking Steps
              </h3>

              <div className="space-y-4">
                {recipe.steps.map((step: string, i: number) => (
                  <div 
                    key={i}
                    className="flex items-start gap-4 p-5 bg-[var(--c-card)] border border-[var(--foreground)]/5 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--c-primary)]" />
                    <div className="w-7 h-7 rounded-full bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/30 flex items-center justify-center text-[var(--c-primary)] font-black text-xs shrink-0 shadow-md">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
