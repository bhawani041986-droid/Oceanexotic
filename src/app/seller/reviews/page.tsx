"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";
import { Loader2, TrendingUp, Filter, MoreVertical, ThumbsUp, MessageSquare, Star, Search, Send, Anchor } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";


// Registry cleanup: Mock data removed to reflect real-time DB state.

export default function SellerReviewsPage() {
  const { user } = useAuthStore(
  );
  const { toast } = useToast(
  );
  const [reviews, setReviews] = React.useState<any[]>([]
  );
  const [isLoading, setIsLoading] = React.useState(true
  );
  const [filterRating, setFilterRating] = React.useState<number | null>(null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false
  );
  const [selectedReview, setSelectedReview] = React.useState<any>(null
  );
  const [replyText, setReplyText] = React.useState(""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false
  );

  React.useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      setIsLoading(true
  );
      try {
        const data = await reviewService.getSellerReviews(user.id
  );
        setReviews(data || []
  );
      } catch (err) {
        console.error("Seller Registry Sync Failure:", err
  );
      } finally {
        setIsLoading(false
  );
      }
    };

    fetchReviews(
  );
  }, [user]
  );

  const handleHelpful = (id: string) => {
    toast("Contribution Registered", "success"
  );
    setReviews(prev => prev.map(r => r.id === id ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r)
  );
  };

  const handleInitiateResponse = (review: any) => {
    setSelectedReview(review
  );
    setReplyText(""
  );
    setIsModalOpen(true
  );
  };

  const handleSubmitResponse = async () => {
    if (!replyText.trim() || !selectedReview) return;
    setIsSubmitting(true
  );
    
    try {
      const result = await reviewService.respondToReview(selectedReview.id, replyText
  );
      if (result.status === "success") {
        toast("Response Broadcasted to Fleet Registry", "success"
  );
        setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, seller_response: replyText, responded_at: new Date().toISOString() } : r)
  );
        setIsModalOpen(false
  );
        setReplyText(""
  );
      } else {
        toast(result.message || "Failed to broadcast response", "error"
  );
      }
    } catch (err) {
      toast("Registry Synchronization Error", "error"
  );
    } finally {
      setIsSubmitting(false
  );
    }
  };

  if (isLoading) {
    return (

      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Synchronizing Reputation Ledger...</p>
      </div>
    
  );
  }

  const activeReviews = reviews;
  return (

    <div className="space-y-8 lg:space-y-12 animate-fade-in pb-32 lg:pb-0">
      
      {/* Reputation Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 border-b border-[var(--foreground)]/10 pb-8 lg:pb-12">
        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-2xl lg:text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/10">Fleet Reputation</h2>
          <p className="text-[10px] lg:text-[12px] font-black text-primary uppercase tracking-[0.2em] leading-relaxed italic">
            Analyzing {reviews.length} Global Commendations • Andaman Sector
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
          <Card className="w-full sm:w-auto flex items-center gap-8 bg-bg-secondary/30 border border-[var(--foreground)]/10 p-5 lg:p-6 rounded-[24px] px-10 lg:px-14 shadow-premium">
            <div className="text-center">
              <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 italic opacity-70">Fleet Rating</p>
              <div className="flex items-center gap-2.5">
                <span className="text-xl lg:text-3xl font-black text-[var(--foreground)] italic tracking-tighter">4.9</span>
                <div className="flex text-primary text-[10px] lg:text-[12px] shadow-glow-purple/20">★★★★★</div>
              </div>
            </div>
            <div className="h-10 w-px bg-[var(--foreground)]/10" />
            <div className="text-center">
              <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 italic opacity-70">Sentiment</p>
              <div className="flex items-center gap-2.5 text-success">
                <TrendingUp className="w-4 h-4 md:w-5 h-5 shadow-glow-purple/20" />
                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] italic">OPTIMAL</span>
              </div>
            </div>
          </Card>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={cn(
                    "h-10 lg:h-12 px-4 lg:px-6 rounded-lg border transition-all text-[9px] font-black italic tracking-widest",
                    filterRating === star 
                      ? "bg-primary border-primary text-white shadow-glow-purple" 
                      : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)]"
                  )}
                >
                  {star} ★
                </button>
              ))}
              <Button 
                variant="outline" 
                onClick={() => setFilterRating(null)}
                className="h-10 lg:h-12 px-8 text-[9px] lg:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 rounded-lg border-[var(--foreground)]/5 bg-[var(--foreground)]/5 italic"
              >
                <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> {filterRating ? "CLEAR FILTER" : "FILTER FEEDBACK"}
              </Button>
            </div>
        </div>
      </div>

      {/* Review Ledger */}
      <div className="space-y-6 lg:space-y-10">
        {activeReviews.length === 0 ? (
          <Card className="p-20 bg-bg-secondary/20 border-[var(--foreground)]/5 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-6">
            <Anchor className="w-16 h-16 text-[var(--foreground)]/5 animate-bounce-slow" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-[var(--foreground)]/20 uppercase italic tracking-widest">No Commendations Found</h3>
              <p className="text-[10px] font-bold text-[var(--foreground)]/10 uppercase tracking-[0.3em]">Reputation Ledger is currently empty.</p>
            </div>
          </Card>
        ) : activeReviews
          .filter(r => !filterRating || r.rating === filterRating)
          .map((review) => (
          <Card key={review.id} className="p-1 group overflow-hidden transition-all hover:border-primary/20 rounded-[32px] md:rounded-[48px] bg-bg-secondary/20 border-[var(--foreground)]/10">
            <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 lg:gap-6">
                <div className="flex items-start gap-3 lg:gap-5">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm lg:text-base shadow-glow-purple/10 italic">
                    {(review.user_name || review.author)?.[0] || "U"}
                  </div>
                  <div className="space-y-1 lg:space-y-1.5">
                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
                      <h4 className="text-sm lg:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">{review.user_name || review.author}</h4>
                      <div className="flex text-primary text-[10px] lg:text-[12px] shadow-glow-purple/20">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={cn(i < review.rating ? "opacity-100" : "opacity-20")}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] lg:text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] italic opacity-70">
                      Verified Harvest • {review.created_at ? new Date(review.created_at).toLocaleDateString() : review.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <Badge variant="glass" className="bg-primary/10 text-primary border-primary/30 text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic px-3 py-1">
                    {review.product_name || review.product || "Fleet Asset"}
                  </Badge>
                  <button className="sm:hidden p-2 text-[var(--foreground)] hover:text-primary transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-[24px] md:rounded-[32px] p-4 lg:p-6 relative border border-[var(--foreground)]/5">
                <div className="absolute -top-3 left-4 lg:left-6 text-2xl lg:text-3xl text-primary opacity-30 italic font-serif">"</div>
                <p className="text-[11px] lg:text-sm font-medium text-[var(--foreground)]/90 leading-relaxed max-w-3xl italic">
                  {review.comment}
                </p>
              </div>

              {/* Seller Response Thread */}
              {(review.seller_response || review.response) && (
                <div className="ml-6 md:ml-12 p-4 md:p-6 rounded-[24px] bg-primary/5 border border-primary/10 relative">
                  <div className="absolute top-4 -left-3 md:-left-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center shadow-glow-purple">
                      <Anchor className="w-3.5 md:w-4 h-3.5 md:h-4 text-[var(--foreground)]" />
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest italic">Official Merchant Dispatch</p>
                    <p className="text-[10px] md:text-xs font-bold text-[var(--foreground)]/80 italic leading-relaxed">
                      "{review.seller_response || review.response}"
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
                <div className="flex items-center gap-6 lg:gap-10">
                  <button 
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-2.5 text-[10px] lg:text-[11px] font-black text-text-secondary uppercase tracking-widest hover:text-[var(--foreground)] transition-colors italic opacity-70 hover:opacity-100"
                  >
                    <ThumbsUp className="w-4 h-4 text-primary" /> HELPFUL ({review.helpful_count || 0})
                  </button>
                  <button 
                    onClick={() => handleInitiateResponse(review)}
                    className="flex items-center gap-2.5 text-[10px] lg:text-[11px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors italic opacity-70 hover:opacity-100"
                  >
                    <MessageSquare className="w-4 h-4 text-primary" /> RESPONSE
                  </button>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" className="hidden sm:flex h-9 lg:h-10 text-[10px] lg:text-[11px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 italic border border-[var(--foreground)]/5">
                    FLAG INTERFERENCE
                  </Button>
                  <Button 
                    onClick={() => handleInitiateResponse(review)}
                    variant="primary" 
                    size="sm" 
                    className="sm:hidden w-full h-11 text-[10px] font-black tracking-widest uppercase rounded-xl shadow-glow-purple italic"
                  >
                    INITIATE RESPONSE
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Response Bar (Desktop Only) */}
            <div className="hidden lg:flex bg-bg-secondary/20 px-8 py-3.5 border-t border-[var(--foreground)]/5 items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Maintain fleet relations with a professional response</p>
              <Button 
                onClick={() => handleInitiateResponse(review)}
                size="sm" 
                className="h-8 px-6 text-[8px] font-black tracking-widest shadow-glow-purple rounded-lg italic"
              >
                INITIATE RESPONSE
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="DIRECT SIGNAL RESPONSE"
        description={`Replying to commendation from ${selectedReview?.user_name || selectedReview?.author}`}
        className="max-w-xl border-primary/20 bg-bg-secondary/95 backdrop-blur-xl shadow-glow-purple/10"
      >
        <div className="space-y-6 md:space-y-8">
          <div className="p-5 md:p-6 rounded-[24px] bg-white/[0.03] border border-[var(--foreground)]/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Star className="w-12 h-12 text-primary" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-3">Original Signal</p>
            <p className="text-xs md:text-sm font-black text-[var(--foreground)]/70 italic leading-relaxed">
              "{selectedReview?.comment}"
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Your Professional Response</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Enter your response to the fleet commendation..."
              className="w-full h-32 rounded-xl bg-bg-secondary border border-[var(--foreground)]/10 p-4 text-xs font-black italic text-[var(--foreground)] placeholder:opacity-30 focus:border-primary transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitResponse}
              disabled={isSubmitting || !replyText.trim()}
              className="flex-1 h-12 shadow-glow-purple flex items-center gap-3 italic"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? "BROADCASTING..." : "BROADCAST RESPONSE"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-12 px-6 border-[var(--foreground)]/10 italic"
            >
              ABORT
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10">
        <p className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest">
          Showing {activeReviews.filter(r => !filterRating || r.rating === filterRating).length} of {activeReviews.length} testimonials
        </p>
        <div className="flex items-center gap-2 p-1.5 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 shadow-premium">
          <Button variant="primary" size="sm" className="h-9 w-9 rounded-[12px] p-0 text-[10px] font-black shadow-glow-purple">1</Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 rounded-[12px] p-0 text-[10px] font-black opacity-40 hover:opacity-100">2</Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 rounded-[12px] p-0 text-[10px] font-black opacity-40 hover:opacity-100">3</Button>
        </div>
      </div>
    </div>
  
  );
}
