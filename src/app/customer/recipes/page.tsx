"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChefHat, 
  Search, 
  ArrowLeft, 
  Filter, 
  Clock, 
  Flame, 
  Globe, 
  ChevronRight,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RECIPES_DB } from "@/constants/recipes";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { cn } from "@/lib/utils";

const PREPS = ["ALL", "CURRY", "GRILL", "FRY"];
const REGIONS = ["ALL", "SOUTH INDIAN", "BENGALI", "TELUGU", "ANDAMAN LOCAL"];

export default function CustomerRecipesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedPrep, setSelectedPrep] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [cmsContent, setCmsContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedPrep, selectedRegion]);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/system/cms`);
        const data = await res.json();
        if (data.status === 'success') {
          setCmsContent(data.content || []);
        }
      } catch (e) {
        console.error("CMS load failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCms();
  }, []);

  // Merge CMS dynamic recipes with static database recipes
  const allRecipes = useMemo(() => {
    const dynamicRecipes = cmsContent
      .filter((c: any) => c.type === 'RECIPE' && c.status === 'PUBLISHED')
      .map((c: any) => {
        let metaVal = { difficulty: 'Medium', time: '25m', gallery: [] };
        if (c.metadata) {
          try {
            metaVal = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata;
          } catch (e) {}
        }
        return {
          id: String(c.id),
          title: c.title,
          fishType: c.sector || "General Catch",
          prepType: (metaVal as any).prepType || "Curry",
          region: (metaVal as any).region || "Andaman Local",
          difficulty: (metaVal as any).difficulty || "Medium",
          time: (metaVal as any).time || "25m",
          image: c.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
          isDynamic: true
        };
      });

    return [...dynamicRecipes, ...RECIPES_DB];
  }, [cmsContent]);

  // Filtered recipes list
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => {
      const matchesSearch = 
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.fishType.toLowerCase().includes(search.toLowerCase());

      const matchesPrep = selectedPrep === "ALL" || recipe.prepType.toUpperCase() === selectedPrep;
      const matchesRegion = selectedRegion === "ALL" || recipe.region.toUpperCase() === selectedRegion;

      return matchesSearch && matchesPrep && matchesRegion;
    });
  }, [allRecipes, search, selectedPrep, selectedRegion]);

  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);

  const paginatedRecipes = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecipes.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredRecipes, currentPage]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] font-sans relative pb-24">
      {/* Background ambience */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--c-primary)]/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[var(--c-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-10 pt-8 relative z-10">
        
        {/* Header navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/customer')} 
              className="p-3 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 hover:border-[var(--c-primary)]/30 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--c-text-secondary)]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[var(--c-primary)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--c-primary)]">OceanExotic Chef's Recipes</span>
              </div>
              <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tight italic mt-1 text-[var(--c-text-primary)]">
                Chef's Recipes
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[var(--c-primary)]/5 border border-[var(--c-primary)]/10 px-4 py-2.5 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--c-text-primary)]">
              {filteredRecipes.length} Active Recipes Found
            </span>
          </div>
        </div>

        {/* Filters and search panel */}
        <Card 
          className="p-6 md:p-8 bg-[var(--c-card)]/90 backdrop-blur-3xl border border-[var(--foreground)]/5 rounded-[var(--c-radius-card)] shadow-2xl mb-12"
          style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            {/* Search Input */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] ml-1">
                Search Recipe / Seafood
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH FISH TYPE, RECIPES..."
                  className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 focus:border-[var(--c-primary)] rounded-xl pl-12 pr-4 text-xs font-black uppercase text-[var(--c-text-primary)] transition-all outline-none" 
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--c-text-secondary)] group-focus-within:text-[var(--c-primary)] transition-colors" />
              </div>
            </div>

            {/* Preparation style filter */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] ml-1">
                Preparation Style
              </label>
              <div className="flex flex-wrap gap-2">
                {PREPS.map((p) => {
                  const active = selectedPrep === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPrep(p)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all"
                      style={{
                        backgroundColor: active ? 'rgba(var(--c-primary-rgb), 0.15)' : 'rgba(255,255,255,0.02)',
                        borderColor: active ? 'var(--c-primary)' : 'rgba(255,255,255,0.05)',
                        color: active ? 'var(--c-primary)' : 'var(--c-text-secondary)'
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region style filter */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] ml-1">
                Cuisine / Region
              </label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => {
                  const active = selectedRegion === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all"
                      style={{
                        backgroundColor: active ? 'rgba(var(--c-primary-rgb), 0.15)' : 'rgba(255,255,255,0.02)',
                        borderColor: active ? 'var(--c-primary)' : 'rgba(255,255,255,0.05)',
                        color: active ? 'var(--c-primary)' : 'var(--c-text-secondary)'
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </Card>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-60">
            <RefreshCw className="w-8 h-8 text-[var(--c-primary)] animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Synchronizing Chef's Recipes...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedRecipes.map((recipe) => (
                <Card 
                  key={recipe.id}
                  onClick={() => router.push(`/customer/recipes/${recipe.id}`)}
                  className="group relative h-36 md:h-40 overflow-hidden rounded-2xl border border-[var(--foreground)]/5 shadow-premium flex items-center p-0 cursor-pointer hover:border-[var(--c-primary)]/40 transition-all duration-500 bg-[var(--c-card)]/40 hover:bg-[var(--foreground)]/5"
                  style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}
                >
                  <div className="w-1/3 h-full relative overflow-hidden shrink-0">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[1200ms] ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[var(--c-card)]" />
                  </div>

                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-center h-full relative z-10">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                        {recipe.region}
                      </Badge>
                      <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                        {recipe.prepType}
                      </Badge>
                    </div>

                    <h3 className="text-sm md:text-lg font-black uppercase italic leading-tight text-[var(--c-text-primary)] group-hover:text-[var(--c-primary)] transition-colors duration-300 line-clamp-2">
                      {recipe.title}
                    </h3>

                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-[var(--foreground)]/5 w-full">
                      <p className="text-[9px] font-bold text-[var(--c-text-secondary)] uppercase tracking-wider truncate mr-2">
                        SEAFOOD: <span className="text-[var(--c-primary)] font-black">{recipe.fishType}</span>
                      </p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--c-primary)] flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300 shrink-0">
                        {recipe.time} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {recipe.isDynamic && (
                    <div className="absolute top-2 left-2 bg-[var(--c-primary)]/90 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider text-[var(--c-bg)]">
                      DYNAMIC
                    </div>
                  )}

                  {/* Cyber Corner Elements */}
                  <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[var(--foreground)]/20 pointer-events-none group-hover:border-[var(--c-primary)]/40 transition-colors" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[var(--foreground)]/20 pointer-events-none group-hover:border-[var(--c-primary)]/40 transition-colors" />
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/5 rounded-xl disabled:opacity-40 italic flex items-center gap-2 hover:bg-[var(--foreground)]/5"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isCurrent = page === currentPage;
                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={isCurrent ? "primary" : "outline"}
                      className={cn(
                        "h-10 w-10 text-[10px] font-black rounded-xl border-[var(--foreground)]/5",
                        isCurrent ? "shadow-glow-purple italic text-white bg-[var(--c-primary)]" : "hover:bg-[var(--foreground)]/5 text-[var(--c-text-secondary)]"
                      )}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/5 rounded-xl disabled:opacity-40 italic flex items-center gap-2 hover:bg-[var(--foreground)]/5"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-[var(--foreground)]/5 rounded-[var(--c-radius-card)]">
            <ChefHat className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">
              No matching recipes found
            </p>
            <p className="text-xs text-slate-500 italic mt-1">
              Try adjusting your search criteria or resetting filters
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
