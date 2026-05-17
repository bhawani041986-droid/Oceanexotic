"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Edit3, 
  Trash2,
  ChevronRight,
  ShieldCheck,
  Ship,
  Loader2,
  Anchor,
  Clock
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function CustomerReviewsPage() {
  const { user } = useAuthStore(
  );
  const { toast } = useToast(
  );
  const [reviews, setReviews] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setIsLoading(false
  );
        return;
      }
      setIsLoading(true
  );
      try {
        const data = await reviewService.getUserReviews(user.id || "USR-123"
  );
        setReviews(data || []
  );
      } catch (err) {
        console.error("Ledger Sync Failure:", err
  );
      } finally {
        setIsLoading(false
  );
      }
    };

    fetchHistory(
  );
  }, [user]
  );

  if (isLoading) {
    return (

      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Synchronizing Audit Ledger...</p>
      </div>
    
  );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (

    <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12 py-6 lg:py-10 animate-fade-in px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/10 pb-8 lg:pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl lg:text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Audit Ledger</h2>
          <p className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] italic">Governing Your Global Maritime Feedback & Product Audits</p>
        </div>
        <div className="flex items-center gap-6 lg:gap-10 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 p-4 lg:p-6 rounded-[24px] px-8 lg:px-12 shadow-premium">
           <div className="text-center">
              <p className="text-[8px] lg:text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 italic">Total Audits</p>
              <p className="text-xl lg:text-2xl font-black text-[var(--foreground)] italic">{reviews.length}</p>
           </div>
           <div className="h-8 w-px bg-[var(--foreground)]/10" />
           <div className="text-center">
              <p className="text-[8px] lg:text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 italic">Avg. Sentiment</p>
              <div className="flex items-center gap-2 text-primary font-black italic text-lg lg:text-xl">
                 <Star className="w-4 h-4 fill-current shadow-glow-purple/20" /> {avgRating}
              </div>
           </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 lg:space-y-6">
        {reviews.length === 0 ? (
          <Card className="p-16 lg:p-24 bg-bg-secondary/20 border-[var(--foreground)]/5 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-6">
            <Clock className="w-16 h-16 text-[var(--foreground)]/5 animate-pulse" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-[var(--foreground)]/20 uppercase italic tracking-widest">No Audits Recorded</h3>
              <p className="text-[10px] font-bold text-[var(--foreground)]/10 uppercase tracking-[0.3em]">Your maritime feedback history is currently empty.</p>
            </div>
          </Card>
        ) : reviews.map((review) => (
          <Card key={review.id} className="p-5 lg:p-8 space-y-6 lg:space-y-8 group transition-all hover:border-primary/30 bg-bg-secondary/40 rounded-[32px] md:rounded-[48px] border-[var(--foreground)]/10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
               <div className="space-y-4 lg:space-y-5">
                  <div className="flex items-center gap-3 lg:gap-4">
                     <Badge variant="glass" className="bg-success/10 text-success border-success/20 uppercase text-[8px] tracking-[0.2em] px-3 py-1 italic font-black">
                        <ShieldCheck className="w-3 h-3 mr-2" /> {review.status || "VERIFIED AUDIT"}
                     </Badge>
                     <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                        {new Date(review.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  <h4 className="text-base lg:text-xl font-black text-[var(--foreground)] tracking-tight uppercase italic">{review.product_name || "Merchant Asset"}</h4>
                  <div className="flex text-primary shadow-glow-purple/10">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <Star key={i} className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${i < review.rating ? "fill-current" : "opacity-20"}`} />
                     ))}
                  </div>
                  <div className="bg-white/[0.03] rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 relative border border-[var(--foreground)]/5">
                    <p className="text-[11px] lg:text-sm text-text-secondary font-medium leading-relaxed italic">
                       "{review.comment}"
                    </p>
                  </div>

                  {/* Seller Response Thread */}
                  {review.seller_response && (
                    <div className="ml-6 md:ml-10 p-4 lg:p-5 rounded-[20px] bg-primary/5 border border-primary/10 relative">
                      <div className="absolute top-4 -left-3 md:-left-4">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-glow-purple">
                          <Anchor className="w-3 h-3 text-[var(--foreground)]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest italic">Merchant Response</p>
                        <p className="text-[10px] md:text-xs font-bold text-[var(--foreground)]/80 italic leading-relaxed">
                          "{review.seller_response}"
                        </p>
                      </div>
                    </div>
                  )}
               </div>
               <div className="flex gap-2">
                  <button className="p-2.5 rounded-full bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                     <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-full bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="pt-6 border-t border-[var(--foreground)]/5 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                     <ThumbsUp className="w-3.5 h-3.5 text-primary" /> {review.helpful_count || 0} SIGNALS
                  </div>
               </div>
               <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline italic">
                  VIEW PRODUCT <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reputation Notice */}
      <Card className="p-6 lg:p-10 bg-primary/5 border border-primary/20 flex items-center gap-6 lg:gap-8 rounded-[32px]">
         <div className="w-12 h-12 lg:w-16 lg:h-16 shrink-0 rounded-[18px] lg:rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple/10">
            <Ship className="w-6 h-6 lg:w-8 lg:h-8" />
         </div>
         <div className="space-y-1">
            <h4 className="text-xs lg:text-sm font-black text-[var(--foreground)] uppercase tracking-widest italic">Admiral's Reputation Shield</h4>
            <p className="text-[10px] lg:text-xs text-text-secondary font-medium leading-relaxed italic opacity-80">
               Verified audits contribute to your global Admiral Rank. Maintain a 4.5+ average sentiment to access elite tier commissions and cold-chain waivers.
            </p>
         </div>
      </Card>
    </div>
  
  );
}
