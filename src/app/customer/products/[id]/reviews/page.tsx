"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  ChevronLeft, 
  Filter, 
  Image as ImageIcon, 
  Video, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquare,
  ArrowRight,
  Plus
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import MainLayout from "@/components/layouts/MainLayout";
import { MASTER_PRODUCT_REGISTRY } from "@/constants/products";
import { reviewService } from "@/services/reviewService";

export default function AllReviewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const productId = (Array.isArray(id) ? id[0] : id) || "";
      const p = MASTER_PRODUCT_REGISTRY.find(item => item.id === productId);
      
      // --- RESILIENT ASSET HYDRATION ---
      // If product is missing from registry, create a high-fidelity shadow placeholder
      if (!p) {
        setProduct({
          id: productId,
          name: "Unknown Seafood Product",
          tagline: "Loading details...",
          category: "Marketplace",
          rating: 0,
          reviews: 0,
          image: "📦",
          images: []
        });
      } else {
        setProduct(p);
      }

      try {
        const liveReviews = await reviewService.getProductReviews(productId);
        const combined = [...(liveReviews || []), ...(p?.customerReviews || [])];
        setReviews(combined);
      } catch (err) {
        setReviews(p?.customerReviews || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
  
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-[var(--c-primary)]/20 border-t-[var(--c-primary)] rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Syncing Reviews...</p>
          </div>
        </div>
  
    );
  }

  // Ensure we have at least a placeholder product before rendering
  if (!product) return null;

  const filteredReviews = filter ? reviews.filter(r => r.rating === filter) : reviews;
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) || 0;

  // Rating Distribution Calculation
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (

      <div className="container mx-auto px-4 md:px-10 py-10">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] hover:text-[var(--c-primary)] transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Product
        </button>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* LEFT: RATING SUMMARY (AMAZON STYLE) */}
          <div className="lg:col-span-4 space-y-8 sticky top-24 h-fit">
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Customer Feedback</h1>
              <p className="text-sm text-[var(--c-text-secondary)] italic">{product.name}</p>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-6xl font-black tracking-tighter italic">{averageRating.toFixed(1)}</span>
              <div className="pb-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5", i < Math.round(averageRating) ? "text-warning fill-warning" : "text-[var(--foreground)]/10")} />
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase text-[var(--c-text-secondary)]">{reviews.length} GLOBAL RATINGS</p>
              </div>
            </div>

            <div className="space-y-3">
              {distribution.map((item) => (
                <button 
                  key={item.star}
                  onClick={() => setFilter(filter === item.star ? null : item.star)}
                  className={cn(
                    "w-full flex items-center gap-4 group hover:bg-[var(--foreground)]/5 p-2 rounded-xl transition-all",
                    filter === item.star && "bg-[var(--foreground)]/5 ring-1 ring-[var(--c-primary)]/30"
                  )}
                >
                  <span className="text-[10px] font-black w-10 text-left">{item.star} STAR</span>
                  <div className="flex-1 h-3 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      className="h-full bg-warning" 
                    />
                  </div>
                  <span className="text-[10px] font-black w-10 text-right opacity-40">{Math.round(item.percent)}%</span>
                </button>
              ))}
            </div>

            <Card className="p-6 bg-[var(--c-primary)]/5 border-[var(--c-primary)]/10 space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest italic">Review this product</h4>
              <p className="text-xs text-[var(--c-text-secondary)] leading-relaxed">Share your experience with other customers.</p>
              <Button 
                onClick={() => router.push(`/customer/reviews/write?productId=${product.id}&productName=${encodeURIComponent(product.name)}&sellerId=${product.seller_id || product.sellerId || 'SEL-000'}`)}
                className="w-full h-12 text-[10px] font-black uppercase tracking-widest gap-2 shadow-glow-purple"
              >
                Write a Review <Plus className="w-4 h-4" />
              </Button>
            </Card>
          </div>

          {/* RIGHT: REVIEWS LIST */}
          <div className="lg:col-span-8 space-y-10">
            {/* Filter Header */}
            <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-4">
              <h3 className="text-lg font-black italic uppercase tracking-tight">
                {filter ? `${filter} Star Reviews` : "Top Customer Reviews"}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                <Filter className="w-3 h-3" /> Sort by: Newest
              </div>
            </div>

            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((review, i) => (
                  <ReviewCard key={i} review={review} />
                ))}
              </AnimatePresence>

              {filteredReviews.length === 0 && (
                <div className="py-20 text-center">
                  <MessageSquare className="w-12 h-12 text-[var(--foreground)]/5 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--c-text-secondary)]">No reviews matching this rating</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

  );
}

function ReviewCard({ review }: { review: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsExpansion = review.comment.length > 280;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-8 border-b border-[var(--foreground)]/5 last:border-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--c-primary)]/20 flex items-center justify-center text-[var(--c-primary)] font-black text-sm">
            {review?.name?.[0] || "?"}
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight italic">{review?.name || "Anonymous Member"}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-3 h-3", i < (review?.rating || 0) ? "text-warning fill-warning" : "text-[var(--foreground)]/10")} />
                ))}
              </div>
              <span className="w-1 h-1 bg-[var(--foreground)]/20 rounded-full" />
              <p className="text-[10px] font-black uppercase text-[var(--c-primary)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Customer
              </p>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">{review?.date || "Unknown Date"}</span>
      </div>

      <div className="space-y-4">
        <p className={cn(
          "text-sm text-[var(--c-text-secondary)] leading-relaxed italic transition-all duration-300",
          !isExpanded && needsExpansion && "line-clamp-3"
        )}>
          {review?.comment || "No comment provided for this review."}
        </p>
        
        {needsExpansion && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] hover:underline flex items-center gap-1"
          >
            {isExpanded ? "Collapse Review" : "Read Full Review"} <ArrowRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
          </button>
        )}

        {/* Media Gallery (Images/Videos) */}
        {(() => {
          const mediaAssets = review?.media || (review?.photos ? (typeof review.photos === 'string' ? JSON.parse(review.photos) : review.photos) : []);
          if (!mediaAssets || mediaAssets.length === 0) return null;
          
          return (
            <div className="flex gap-2 pt-2 overflow-x-auto no-scrollbar pb-2">
              {mediaAssets.map((asset: any, i: number) => {
                const url = typeof asset === 'string' ? asset : asset.url;
                const isVideo = asset.type === 'video' || url.includes('.mp4') || url.includes('video');
                
                return (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex-shrink-0 cursor-pointer hover:border-[var(--c-primary)] transition-all relative group">
                    {isVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <Video className="w-6 h-6 text-[var(--foreground)]/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center backdrop-blur-sm">
                            <Star className="w-3 h-3 fill-white text-[var(--foreground)]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={url} className="w-full h-full object-cover" alt="Review Media" />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div className="flex items-center gap-6 pt-2">
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] hover:text-[var(--foreground)] transition-colors">
          <ThumbsUp className="w-4 h-4" /> Helpful
        </button>
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] hover:text-[var(--foreground)] transition-colors">
          Report Abuse
        </button>
      </div>
    </motion.div>
  );
}

// Utility for CSS normalization
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
