"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  ThumbsUp, 
  Flag, 
  Trash2, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  User,
  Activity,
  Zap,
  Globe,
  Edit3,
  Send,
  History,
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

import { reviewService } from "@/services/reviewService";
import { Loader2 } from "lucide-react";

// The local registry will now be hydrated dynamically from the System Spine.

export default function AdminModerationPage() {
  const { toast } = useToast(
  );
  const [reviews, setReviews] = useState<any[]>([]
  );
  const [isLoading, setIsLoading] = useState(true
  );
  const [filter, setFilter] = useState("ALL"
  );
  const [editingId, setEditingId] = useState<string | null>(null
  );
  const [editContent, setEditContent] = useState(""
  );
  const [viewingReview, setViewingReview] = useState<any | null>(null
  );
  const [isReplyingId, setIsReplyingId] = useState<string | null>(null
  );
  const [replyText, setReplyText] = useState(""
  );
  const [isSubmittingReply, setIsSubmittingReply] = useState(false
  );

  const handleSendReply = async () => {
    if (!replyText.trim() || !isReplyingId) return;
    setIsSubmittingReply(true
  );
    try {
      const result = await reviewService.respondToReview(isReplyingId, replyText
  );
      if (result.status === "success") {
        toast("Official Admin Dispatch Registered.", "success"
  );
        setReviews(prev => prev.map(r => r.id == isReplyingId ? { ...r, seller_response: replyText } : r)
  );
        setIsReplyingId(null
  );
        setReplyText(""
  );
      } else {
        toast(result.message || "Dispatch failure.", "error"
  );
      }
    } catch (err) {
      toast("Connection Failure.", "error"
  );
    } finally {
      setIsSubmittingReply(false
  );
    }
  };


  // --- LIVE MODERATION HYDRATION ---
  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true
  );
        const data = await reviewService.getModerationQueue(
  );
        // Harmonize API data with UI schema
        const mapped = (data || []).map((r: any) => ({
          id: r.id || `REV-${Math.floor(Math.random() * 9000) + 1000}`,
          citizen: r.user_name || "Unknown Citizen",
          harvest: r.product_name || "Unknown Asset",
          rating: parseInt(r.rating) || 0,
          content: r.comment || "No content found.",
          status: (r.status || "PENDING").toUpperCase(),
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent",
          sentiment: r.rating >= 4 ? "POSITIVE" : r.rating <= 2 ? "NEGATIVE" : "NEUTRAL",
          seller: r.seller_name || "Unknown Seller",
          sellerId: r.seller_id,
          sellerRating: r.seller_avg_rating || 0,
          sellerReviewCount: r.seller_total_reviews || 0,
          orderNumber: r.order_id || r.order_number,
          productId: r.product_id,
          photos: r.evidence_gallery || r.photos // Evidence Registry
        })
  );
        setReviews(mapped
  );
      } catch (err) {
        console.error("Moderation Registry Sync Failure:", err
  );
        toast("Failed to synchronize moderation ledger.", "error"
  );
      } finally {
        setIsLoading(false
  );
      }
    };
    fetchReviews(
  );
  }, []
  );

  const handleEdit = (id: string, content: string) => {
    setEditingId(id
  );
    setEditContent(content
  );
  };

  const handleSaveEdit = () => {
    toast(`Review ${editingId} content successfully corrected.`, "success"
  );
    setEditingId(null
  );
  };

  const handleModeration = async (id: string, action: string) => {
    // Map frontend action verbs to DB status values
    const statusMap: Record<string, string> = {
      approve: "APPROVED",
      reject: "REJECTED",
      flag: "FLAGGED",
      pending: "PENDING",
    };
    const dbStatus = statusMap[action.toLowerCase()] || action.toUpperCase(
  );
    try {
      const result = await reviewService.moderateReview(String(id), action
  );
      if (result.success || result.status === "success") {
        toast(`Review #${id} marked as ${dbStatus}.`, "success"
  );
        // Use loose equality (==) to handle numeric vs string IDs from DB
        setReviews(prev => prev.map(r => r.id == id ? { ...r, status: dbStatus } : r)
  );
        if (viewingReview?.id == id) setViewingReview(null
  );
      } else {
        toast(result.message || "Moderation action failed.", "error"
  );
      }
    } catch (err) {
      toast("Critical Governance Failure.", "error"
  );
      console.error("moderateReview error:", err
  );
    }
  };

  const handlePurge = async (id: string) => {
    if (confirm("PERMANENTLY DELETE this review? This cannot be undone.")) {
      try {
        const result = await reviewService.moderateReview(String(id), "delete"
  );
        if (result.success || result.status === "success") {
          setReviews(prev => prev.filter(r => r.id != id)
  );
          if (viewingReview?.id == id) setViewingReview(null
  );
        } else {
          toast(result.message || "Purge failed.", "error"
  );
        }
      } catch (err) {
        toast("Purge Protocol Failure.", "error"
  );
        console.error("purge error:", err
  );
      }
    }
  };

  const handleView = (review: any) => {
    setViewingReview(review
  );
  };


  const handleSendReport = (id: string) => {
    toast(`Moderation report for ${id} dispatched to the respective parties.`, "info"
  );
  };

  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic text-primary flex items-center justify-center md:justify-start gap-3 md:gap-4">
             <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 shadow-glow-purple" /> Moderation Control
          </h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Professional Management of Citizen Feedback and Content Integrity</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <div className="relative group w-full md:w-80">
            <Input 
              placeholder="SEARCH REVIEW ID..." 
              className="h-10 md:h-12 pl-10 md:pl-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 focus:border-primary/50 transition-all text-[8px] md:text-[9px] font-black tracking-widest uppercase italic rounded-lg md:rounded-xl" 
            />
            <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <Button variant="outline" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
             <Activity className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary shadow-glow-purple" /> AUDIT HISTORY
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 md:gap-2 border-b border-[var(--foreground)]/5 pb-0.5 overflow-x-auto no-scrollbar">
         {['ALL', 'PENDING', 'FLAGGED', 'APPROVED', 'REJECTED'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-4 md:px-8 py-3 md:py-4 text-[8px] md:text-[10px] font-black tracking-widest uppercase transition-all relative italic whitespace-nowrap",
                filter === tab ? "text-primary" : "text-text-secondary hover:text-[var(--foreground)]"
              )}
            >
               {tab}
               {filter === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 md:h-1 bg-primary rounded-full shadow-glow-purple" />}
            </button>
         ))}
      </div>

      {/* Moderation Registry */}
      <div className="space-y-[10px] md:space-y-6">
         {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synchronizing Moderation Registry...</p>
            </div>
         ) : reviews.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--foreground)]/5 rounded-[40px]">
               <ShieldCheck className="w-12 h-12 text-[var(--foreground)]/10" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Ledger Clean. No Pending Directives.</p>
            </div>
         ) : reviews
            .filter(r => filter === "ALL" || r.status === filter)
            .map((review) => (
            <Card key={review.id} className="p-[10px] md:p-8 bg-bg-secondary/20 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all duration-500 overflow-hidden relative rounded-[24px] md:rounded-[40px] shadow-premium">
               <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                  {/* Citizen Info */}
                  <div className="lg:w-64 space-y-4 md:space-y-5">
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[18px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple/10">
                           <User className="w-5 md:w-6 h-5 md:h-6" />
                        </div>
                        <div className="space-y-1 md:space-y-1.5">
                           <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">{review.citizen}</p>
                           <p className="text-[9px] md:text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] italic opacity-70">{review.id}</p>
                        </div>
                     </div>
                     <div className="space-y-2.5 pt-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic ml-1">HARVEST CONTEXT</p>
                        <div className="flex flex-col gap-1">
                           <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight italic">{review.harvest}</p>
                           <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest truncate">Seller: {review.seller}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1.5 text-warning">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} className={cn("w-4 h-4 fill-current", i >= review.rating && "opacity-20")} />
                        ))}
                     </div>
                  </div>

                  {/* Content Audit & Edit */}
                  <div className="flex-1 space-y-6 md:space-y-8 relative">
                     <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              {review.orderNumber && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-[8px] font-black text-success uppercase tracking-widest">
                                  <ShieldCheck className="w-3 h-3" /> VERIFIED HARVEST
                                </div>
                              )}
                              <Badge variant={
                                review.status === "FLAGGED" ? "danger" : 
                                review.status === "APPROVED" ? "success" : "warning"
                              } className="text-[9px] font-black tracking-widest px-3 py-1">
                                 {review.status}
                              </Badge>
                              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-70">{review.date}</span>
                           </div>
                           <div className="flex gap-2.5">
                              <button 
                                onClick={() => handleEdit(review.id, review.content)}
                                className="p-2.5 rounded-xl bg-[var(--foreground)]/5 text-[var(--foreground)] hover:text-primary hover:bg-primary/10 transition-all border border-[var(--foreground)]/5"
                              >
                                 <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleSendReport(review.id)}
                                className="p-2.5 rounded-xl bg-[var(--foreground)]/5 text-[var(--foreground)] hover:text-success hover:bg-success/10 transition-all border border-[var(--foreground)]/5"
                              >
                                 <Send className="w-4 h-4" />
                              </button>
                           </div>
                        </div>

                         {editingId === review.id ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                               <textarea 
                                 value={editContent}
                                 onChange={(e) => setEditContent(e.target.value)}
                                 className="w-full h-32 bg-bg-secondary border border-primary/40 rounded-[24px] p-6 text-sm font-medium text-[var(--foreground)] outline-none shadow-glow-purple focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                               />
                               <div className="flex gap-3 justify-end">
                                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest italic" onClick={() => setEditingId(null)}>CANCEL</Button>
                                  <Button variant="primary" size="sm" className="text-[10px] font-black uppercase tracking-widest px-6 italic" onClick={handleSaveEdit}>SAVE CORRECTION</Button>
                               </div>
                            </div>
                         ) : (
                            <p className="text-sm md:text-base font-medium text-[var(--foreground)]/90 leading-relaxed italic border-l-2 border-primary/20 pl-4 md:pl-6">
                               "{review.content}"
                            </p>
                         )}

                         {/* Inline Reply Interface */}
                         {isReplyingId === review.id && (
                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                               <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Construct Official Dispatch</p>
                                  <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Enter official administrative response..."
                                    className="w-full h-24 bg-bg-secondary border border-[var(--foreground)]/10 rounded-xl p-4 text-xs font-medium text-[var(--foreground)] outline-none focus:border-primary/40 transition-all resize-none"
                                  />
                                  <div className="flex gap-2 justify-end">
                                     <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase" onClick={() => setIsReplyingId(null)}>CANCEL</Button>
                                     <Button 
                                       variant="primary" 
                                       size="sm" 
                                       className="text-[9px] font-black uppercase px-6" 
                                       onClick={handleSendReply}
                                       disabled={isSubmittingReply}
                                     >
                                        {isSubmittingReply ? "SENDING..." : "SEND DISPATCH"}
                                     </Button>
                                  </div>
                               </div>
                            </div>
                         )}

                         {/* Seller Response Visibility in Audit */}
                         {(review.seller_response || review.response) && (
                           <div className="ml-4 md:ml-8 mt-4 p-4 md:p-6 rounded-[24px] bg-primary/5 border border-primary/10 relative">
                             <div className="absolute top-4 -left-3">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-glow-purple">
                                   <MessageSquare className="w-3 h-3 text-[var(--foreground)]" />
                                </div>
                             </div>
                             <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] italic mb-2">Official Dispatch</p>
                             <p className="text-[11px] md:text-xs font-bold text-[var(--foreground)]/70 italic leading-relaxed">"{review.seller_response || review.response}"</p>
                           </div>
                         )}
                      </div>

                     {/* Sentiment & Metadata */}
                     <div className="flex flex-wrap items-center gap-4 pt-4">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                           <div className={cn(
                             "w-2 h-2 rounded-full",
                             review.sentiment === "POSITIVE" ? "bg-success" : 
                             review.sentiment === "NEGATIVE" ? "bg-warning" : "bg-danger animate-pulse"
                           )} />
                           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">{review.sentiment} SENTIMENT</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5">
                           <History className="w-3 h-3 text-primary" />
                           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">LAST AUDIT: {review.date}</p>
                        </div>
                     </div>

                     {/* EVIDENCE REGISTRY (IMAGES/VIDEOS) */}
                     {(() => {
                        const mediaAssets = review.photos ? (typeof review.photos === 'string' ? JSON.parse(review.photos) : review.photos) : [];
                        if (!mediaAssets || mediaAssets.length === 0) return null;
                        
                        return (

                           <div className="pt-6 space-y-3">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Uploaded Evidence Nodes ({mediaAssets.length})</p>
                              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                 {mediaAssets.map((asset: any, i: number) => {
                                    const url = typeof asset === 'string' ? asset : asset.url;
                                    const isVideo = asset.type === 'video' || (typeof url === 'string' && (url.includes('.mp4') || url.includes('video'))
  );
                                    
                                    return (

                                       <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex-shrink-0 relative group cursor-zoom-in">
                                          {isVideo ? (
                                             <div className="w-full h-full flex items-center justify-center bg-black">
                                                <Activity className="w-8 h-8 text-[var(--foreground)]/20 animate-pulse" />
                                             </div>
                                          ) : (
                                             <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Evidence" />
                                          )}
                                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                             <Globe className="w-6 h-6 text-[var(--foreground)]" />
                                          </div>
                                       </div>
                                    
  );
                                 })}
                              </div>
                           </div>
                        
  );
                     })()}
                  </div>

                   {/* Ultra-Compact Governance Ribbon (Single-Line Polygonal) */}
                   <div className="w-full lg:w-fit flex flex-col justify-center gap-2">
                      <div className="relative p-1 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex flex-nowrap items-center" style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }}>
                         
                         {/* APPROVE NODE */}
                         <button 
                           onClick={() => handleModeration(review.id, "approve")}
                           disabled={review.status === "APPROVED"}
                           className={cn(
                             "group relative px-2 h-9 flex items-center gap-1.5 transition-all duration-300",
                             review.status === "APPROVED" ? "opacity-30 cursor-not-allowed" : "hover:bg-success/20"
                           )}
                         >
                            <CheckCircle2 className={cn("w-3.5 h-3.5 transition-transform duration-300 ease-out", review.status === "APPROVED" ? "text-success" : "text-success group-hover:scale-125 group-hover:rotate-12")} />
                            <span className="text-[8px] font-black uppercase tracking-wide text-success italic whitespace-nowrap">APPROVE</span>
                         </button>

                         <div className="w-px h-4 bg-[var(--foreground)]/10 shrink-0" />

                         {/* REJECT NODE */}
                         <button 
                           onClick={() => handleModeration(review.id, "reject")}
                           className="group relative px-2 h-9 flex items-center gap-1.5 transition-all duration-300 hover:bg-danger/20"
                         >
                            <XCircle className="w-3.5 h-3.5 text-danger transition-transform duration-300 ease-out group-hover:scale-125 group-hover:-rotate-12" />
                            <span className="text-[8px] font-black uppercase tracking-wide text-danger italic whitespace-nowrap">REJECT</span>
                         </button>

                         <div className="w-px h-4 bg-[var(--foreground)]/10 shrink-0" />

                         {/* VIEW NODE */}
                         <button 
                           onClick={() => handleView(review)}
                           className="group relative px-2 h-9 flex items-center gap-1.5 transition-all duration-300 hover:bg-primary/20"
                         >
                            <Globe className="w-3.5 h-3.5 text-primary transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-180" />
                            <span className="text-[8px] font-black uppercase tracking-wide text-primary italic whitespace-nowrap">VIEW</span>
                         </button>

                         <div className="w-px h-4 bg-[var(--foreground)]/10 shrink-0" />

                         {/* REPORT NODE */}
                         <button 
                           onClick={() => handleSendReport(review.id)}
                           className="group relative px-2 h-9 flex items-center gap-1.5 transition-all duration-300 hover:bg-warning/20"
                         >
                            <FileText className="w-3.5 h-3.5 text-warning transition-transform duration-300 ease-out group-hover:scale-125 group-hover:-rotate-6" />
                            <span className="text-[8px] font-black uppercase tracking-wide text-warning italic whitespace-nowrap">REPORT</span>
                         </button>

                         <div className="w-px h-4 bg-[var(--foreground)]/10 shrink-0" />

                         {/* REPLY NODE */}
                         <button 
                           onClick={() => {
                             setIsReplyingId(review.id
  );
                             setReplyText(review.seller_response || ""
  );
                           }}
                           className="group relative px-2 h-9 flex items-center gap-1.5 transition-all duration-300 hover:bg-primary/20"
                         >
                            <MessageSquare className="w-3.5 h-3.5 text-primary transition-transform duration-300 ease-out group-hover:scale-125" />
                            <span className="text-[8px] font-black uppercase tracking-wide text-primary italic whitespace-nowrap">REPLY</span>
                         </button>

                         <div className="w-px h-4 bg-[var(--foreground)]/10 shrink-0" />

                         {/* PURGE NODE */}
                         <button 
                           onClick={() => handlePurge(review.id)}
                           className="group relative px-2 h-9 flex items-center gap-1.5 transition-all duration-300 hover:bg-danger/10"
                         >
                            <Trash2 className="w-3.5 h-3.5 text-[var(--foreground)]/30 group-hover:text-danger transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-12" />
                            <span className="text-[8px] font-black uppercase tracking-wide text-[var(--foreground)]/30 group-hover:text-danger transition-colors duration-300 italic whitespace-nowrap">PURGE</span>
                         </button>
                      </div>
                   </div>
               </div>
            </Card>
         ))}
      </div>

      {/* ===== FULL REVIEW DETAIL MODAL ===== */}
      {viewingReview && (() => {
        const mediaAssets = viewingReview.photos
          ? (typeof viewingReview.photos === 'string' ? JSON.parse(viewingReview.photos) : viewingReview.photos)
          : [];

        return (

          <div
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setViewingReview(null)}
          >
            <div
              className="bg-[#0d1117] border border-[var(--foreground)]/10 rounded-[20px] md:rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setViewingReview(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center hover:bg-[var(--foreground)]/20 transition-all"
              >
                <X className="w-4 h-4 text-[var(--foreground)]" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base md:text-lg shrink-0">
                  {viewingReview.citizen?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-black uppercase italic tracking-tight text-[var(--foreground)]">{viewingReview.citizen || "Unknown"}</h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest">{viewingReview.harvest || "Unknown Asset"}</p>
                      <span className="text-[7px] text-[var(--foreground)]/20 font-mono tracking-tighter">ID:{viewingReview.productId}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[8px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Seller: {viewingReview.seller || "Unknown"}</p>
                        <span className="text-[7px] text-[var(--foreground)]/20 font-mono tracking-tighter">ID:{viewingReview.sellerId}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10">
                        <Star className="w-2 h-2 text-warning fill-warning" />
                        <span className="text-[7px] font-black text-primary uppercase tracking-tighter">{viewingReview.sellerRating} AVG</span>
                        <span className="text-[7px] text-[var(--foreground)]/20">/</span>
                        <span className="text-[7px] font-black text-[var(--foreground)]/40 uppercase tracking-tighter">{viewingReview.sellerReviewCount} REVIEWS</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-[var(--foreground)]/40 uppercase tracking-widest mt-1">{viewingReview.date}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  <Badge variant={viewingReview.status === "APPROVED" ? "success" : viewingReview.status === "FLAGGED" ? "danger" : "warning"} className="text-[8px] font-black">
                    {viewingReview.status}
                  </Badge>
                  {viewingReview.orderNumber && (
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1 text-success text-[7px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED PURCHASE
                      </div>
                      <span className="text-[7px] text-[var(--foreground)]/20 font-mono tracking-tighter">#{viewingReview.orderNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4 md:w-5 md:h-5", i < viewingReview.rating ? "text-warning fill-warning" : "text-[var(--foreground)]/10")} />
                  ))}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40">{viewingReview.rating} / 5</span>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                  viewingReview.sentiment === "POSITIVE" ? "bg-success/10 text-success" :
                  viewingReview.sentiment === "NEGATIVE" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", viewingReview.sentiment === "POSITIVE" ? "bg-success" : viewingReview.sentiment === "NEGATIVE" ? "bg-warning" : "bg-danger animate-pulse")} />
                  {viewingReview.sentiment}
                </div>
              </div>

              {/* Review Comment */}
              <div className="p-3 md:p-5 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">Review Comment</p>
                  {/* Context Tags */}
                  <div className="flex gap-2">
                    {(viewingReview.content?.toLowerCase()?.includes('seller') || viewingReview.content?.toLowerCase()?.includes('merchant')) && (
                      <span className="text-[7px] font-black px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">MERCHANT FEEDBACK</span>
                    )}
                    {(viewingReview.content?.toLowerCase()?.includes('shipping') || viewingReview.content?.toLowerCase()?.includes('delivery')) && (
                      <span className="text-[7px] font-black px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">LOGISTICS</span>
                    )}
                    {(viewingReview.content?.toLowerCase()?.includes('quality') || viewingReview.content?.toLowerCase()?.includes('fresh')) && (
                      <span className="text-[7px] font-black px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">PRODUCT QUALITY</span>
                    )}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-[var(--foreground)]/80 leading-relaxed italic">"{viewingReview.content || "No comment provided."}"</p>
              </div>

              {/* Image Gallery */}
              {mediaAssets.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">Evidence ({mediaAssets.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mediaAssets.map((asset: any, i: number) => {
                      const url = typeof asset === 'string' ? asset : asset?.url;
                      const isVideo = asset?.type === 'video' || (typeof url === 'string' && url.includes('.mp4')
  );
                      return (

                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[var(--foreground)]/5 border border-[var(--foreground)]/10">
                          {isVideo
                            ? <video src={url} className="w-full h-full object-cover" />
                            : <img src={url} className="w-full h-full object-cover" alt={`Evidence ${i + 1}`} />}
                        </div>
                      
  );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/10">
                  <Activity className="w-4 h-4 text-[var(--foreground)]/20" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/30">No images uploaded for this review.</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { handleModeration(viewingReview.id, "approve"
  ); setViewingReview(null
  ); }}
                  className="flex-1 h-10 rounded-xl bg-success/10 border border-success/20 text-success text-[9px] font-black uppercase tracking-widest hover:bg-success/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => { handleModeration(viewingReview.id, "reject"
  ); setViewingReview(null
  ); }}
                  className="flex-1 h-10 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[9px] font-black uppercase tracking-widest hover:bg-danger/20 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => { handlePurge(viewingReview.id
  ); setViewingReview(null
  ); }}
                  className="h-10 px-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[var(--foreground)]/30 hover:text-danger hover:border-danger/30 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge
                </button>
              </div>
            </div>
          </div>
        
  );
      })()}
    </div>
  
  );
}
