"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Camera, 
  X, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingBag, 
  Info,
  Zap,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";

import { Suspense } from "react";

function WriteReviewContent() {
  const router = useRouter(
  );
  const searchParams = useSearchParams(
  );
  const { toast } = useToast(
  );
  const { user } = useAuthStore(
  );
  
  const productId = searchParams.get("productId") || "PRD-201";
  const productName = searchParams.get("productName") || "Andaman King Lobster";
  const sellerId = searchParams.get("sellerId") || "SEL-000";

  const [mounted, setMounted] = React.useState(false
  );
  const [rating, setRating] = React.useState(0
  );
  const [hoveredRating, setHoveredRating] = React.useState(0
  );
  const [comment, setComment] = React.useState(""
  );
  const [media, setMedia] = React.useState<{ url: string, type: 'image' | 'video' }[]>([]
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false
  );
  
  const fileInputRef = React.useRef<HTMLInputElement>(null
  );

  React.useEffect(() => {
    setMounted(true
  );
  }, []
  );

  if (!mounted) return null;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const type = (file.type.startsWith('video') ? 'video' : 'image') as 'image' | 'video';
        const reader = new FileReader();
        reader.onloadend = () => {
          setMedia(prev => [...prev, { url: reader.result as string, type }].slice(0, 5)
  );
        };
        reader.readAsDataURL(file
  );
      }
  );
      toast("Evidence Nodes Captured.", "success"
  );
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index)
  );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast("Identity Check Failed. Please authenticate.", "error"
  );
      return;
    }

    if (rating === 0) {
      toast("Please authorize a rating node.", "error"
  );
      return;
    }
    
    setIsSubmitting(true
  );
    try {
      const reviewPayload = {
        product_id: productId,
        product_name: productName,
        seller_id: sellerId,
        user_id: user.id,
        user_name: user.name,
        rating,
        comment,
        photos: JSON.stringify(media)
      };

      const result = await reviewService.submitReview(reviewPayload
  );
      
      if (result.success || result.status === "success") {
        toast("Review Registry Synchronized.", "success"
  );
        router.push(`/customer/products/${productId}`
  );
      } else {
        toast(result.message || "Registry Handshake Refused.", "error"
  );
      }
    } catch (err) {
      toast("Critical Registry Sync Failure.", "error"
  );
      console.error("Submission Error:", err
  );
    } finally {
      setIsSubmitting(false
  );
    }
  };

  return (

    <div className="bg-[#0B1120] min-h-screen text-white font-inter pb-20 selection:bg-primary/30">
      
      {/* 1. NAVIGATION HUB */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 bg-[#0B1120]/80 backdrop-blur-2xl border-b border-[var(--foreground)]/5 px-6">
        <div className="container mx-auto h-full flex items-center justify-between">
           <button 
             onClick={() => router.back()}
             className="flex items-center gap-3 text-text-secondary hover:text-[var(--foreground)] transition-colors group"
           >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest italic">Abort Submission</span>
           </button>
           <h1 className="text-xl font-black uppercase italic tracking-tighter hidden md:block">Registry Feedback</h1>
           <div className="w-10 md:w-40" />
        </div>
      </header>

      <main className="pt-32 container mx-auto px-6">
         <div className="max-w-3xl mx-auto space-y-12">
            
            {/* 2. PRODUCT CONTEXT HUB */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <Card className="p-8 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 rounded-[40px] flex items-center gap-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-24 h-24 bg-[#0B1120] rounded-2xl flex items-center justify-center text-5xl shadow-2xl relative z-10">🦞</div>
                  <div className="relative z-10 space-y-1">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">MARITIME HARVEST ID: {productId}</p>
                     <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">{productName}</h2>
                     <p className="text-xs text-text-secondary italic">Commissioned on Oct 24, 2024</p>
                  </div>
               </Card>
            </motion.div>

            {/* 3. FEEDBACK FORM REGISTRY */}
            <section className="space-y-12">
               
               {/* Rating Node */}
               <div className="space-y-6 text-center md:text-left">
                  <div className="space-y-1">
                     <h4 className="text-lg font-black uppercase italic">Authority Rating</h4>
                     <p className="text-xs text-text-secondary italic">Authorize a technical score for this harvest node.</p>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button 
                         key={star}
                         onMouseEnter={() => setHoveredRating(star)}
                         onMouseLeave={() => setHoveredRating(0)}
                         onClick={() => setRating(star)}
                         className="p-1 transition-transform active:scale-90"
                       >
                          <Star 
                            className={cn(
                              "w-10 h-10 md:w-12 md:h-12 transition-all duration-300",
                              (hoveredRating || rating) >= star ? "text-warning fill-warning scale-110 shadow-glow-yellow" : "text-[var(--foreground)]/10"
                            )}
                          />
                       </button>
                     ))}
                  </div>
               </div>

               {/* Evidence Node (Photo Upload) */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h4 className="text-lg font-black uppercase italic">Evidence Registry</h4>
                        <p className="text-xs text-text-secondary italic">Upload visual telemetry of the harvest (Max 5).</p>
                     </div>
                     <Button 
                       onClick={() => fileInputRef.current?.click()}
                       variant="outline" 
                       className="rounded-full border-primary/20 text-primary h-10 px-6 font-black uppercase text-[9px] gap-2 hover:bg-primary hover:text-white"
                     >
                        <Upload className="w-3 h-3" /> CAPTURE EVIDENCE
                     </Button>
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       onChange={handleMediaUpload} 
                       multiple 
                       accept="image/*,video/*" 
                       className="hidden" 
                     />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     <AnimatePresence>
                        {media.map((item, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[var(--foreground)]/10 group"
                          >
                             {item.type === 'video' ? (
                               <div className="w-full h-full bg-black flex items-center justify-center relative">
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center backdrop-blur-sm"><Zap className="w-4 h-4 fill-white text-[var(--foreground)]" /></div>
                                 </div>
                               </div>
                             ) : (
                               <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                             )}
                             <button 
                               onClick={() => removeMedia(i)}
                               className="absolute top-2 right-2 p-1.5 bg-danger rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <X className="w-3 h-3" />
                             </button>
                          </motion.div>
                        ))}
                     </AnimatePresence>
                     {media.length < 5 && (
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="aspect-square rounded-2xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2 text-text-secondary hover:border-primary/40 hover:bg-primary/5 transition-all group"
                       >
                          <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-black uppercase">ADD NODE</span>
                       </button>
                     )}
                  </div>
               </div>

               {/* Detailed Analysis Node */}
               <div className="space-y-6">
                  <div className="space-y-1">
                     <h4 className="text-lg font-black uppercase italic">Detailed Analysis</h4>
                     <p className="text-xs text-text-secondary italic">Provide a technical summary of the harvest experience.</p>
                  </div>
                  <div className="relative group">
                     <textarea 
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                       placeholder="e.g. The freshness protocol was exceeded. Lobster quality is Grade-A sovereign..."
                       className="w-full h-48 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-[32px] p-8 text-sm italic focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all group-hover:bg-[var(--foreground)]/10"
                     />
                     <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-secondary">
                        <Zap className="w-3 h-3 text-primary" />
                        CRYPTO-SECURED INPUT
                     </div>
                  </div>
               </div>

               {/* Submit Node */}
               <div className="pt-6">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-20 rounded-[32px] bg-primary text-white font-black uppercase text-sm tracking-[0.2em] shadow-glow-purple gap-4 relative overflow-hidden group"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     {isSubmitting ? (
                       <div className="w-6 h-6 border-4 border-[var(--foreground)]/20 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>
                         SYNCHRONIZE REGISTRY <CheckCircle2 className="w-5 h-5" />
                       </>
                     )}
                  </Button>
               </div>

            </section>

            {/* Support Disclaimer */}
            <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/10 flex items-start gap-6">
               <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
               <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase tracking-widest">Public Registry Protocol</h5>
                  <p className="text-xs text-text-secondary italic leading-relaxed">Your feedback will be published to the global maritime registry once analyzed by our authority nodes. Personal telemetry remains encrypted.</p>
               </div>
            </div>

         </div>
      </main>

    </div>
  
  );
}

export default function WriteReviewPage() {
  return (

    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Zap className="w-12 h-12 text-primary animate-pulse" />
      </div>
    }>
      <WriteReviewContent />
    </Suspense>
  
  );
}
