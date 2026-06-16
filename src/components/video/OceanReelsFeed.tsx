"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabaseFrontend as supabase } from '@/lib/supabase-client';
import { Play, VolumeX, Volume2, ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';

interface OceanReelsFeedProps {
  variant?: "feed" | "pip" | "grid-card";
  videoId?: number;
}

export function OceanReelsFeed({ variant = "feed", videoId }: OceanReelsFeedProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPipOpen, setIsPipOpen] = useState(false);
  const cart = useCartStore();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data: vids } = await supabase
      .from('product_videos')
      .select('*')
      .eq('is_active', 1)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (vids && vids.length > 0) {
      setVideos(vids);
      
      const pIds = [...new Set(vids.map(v => v.product_id))];
      const res = await fetch('/api/seller/products');
      const allProds = await res.json();
      
      if (Array.isArray(allProds)) {
        const prodMap: Record<string, any> = {};
        allProds.forEach(p => {
          if (pIds.includes(p.id)) {
            prodMap[p.id] = p;
          }
        });
        setProducts(prodMap);
      }
    }
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sellerId: product.sellerId || "OCEAN"
    });
    toast(`${product.name} added from Ocean Reels!`, "success");
  };

  if (videos.length === 0) return null;

  // ── OPTION 1: INLINE GRID CARD (WEB) ───────────────────────────────────────
  if (variant === "grid-card") {
    const vid = videoId ? videos.find(v => v.id === videoId) : videos[0];
    if (!vid) return null;
    const product = products[vid.product_id];
    const isActive = activeVideoId === vid.id;

    return (
      <div className="group h-full">
        <div 
           onClick={() => setActiveVideoId(isActive ? null : vid.id)}
           className="relative overflow-hidden bg-[var(--c-card)] border border-[var(--foreground)]/5 hover:border-[var(--c-primary)]/30 transition-all duration-500 shadow-xl hover:shadow-[var(--c-shadow-glow)] cursor-pointer h-full flex flex-col justify-between"
           style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
        >
           <div className="relative aspect-[4/5] bg-black overflow-hidden flex-shrink-0">
             {isActive ? (
               <video 
                 src={vid.video_url} 
                 autoPlay 
                 loop 
                 muted={isMuted}
                 playsInline
                 className="absolute inset-0 w-full h-full object-cover" 
               />
             ) : (
               <img 
                 src={vid.thumbnail_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400"}
                 className="absolute inset-0 w-full h-full object-cover opacity-80" 
               />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14]/90 via-[#0b0e14]/30 to-transparent pointer-events-none" />
             
             <div className="absolute top-2 left-2 z-20">
                <span className="bg-red-500 text-[8px] font-black uppercase text-white px-2 py-0.5 shadow-md rounded">
                   PROMO REEL
                </span>
             </div>

             {/* Mute button on top right */}
             {isActive && (
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   setIsMuted(!isMuted);
                 }}
                 className="absolute top-2 right-2 z-20 p-1 bg-black/40 backdrop-blur-md rounded-full border-none cursor-pointer"
               >
                 {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
               </button>
             )}

             {!isActive && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                   <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
                 </div>
               </div>
             )}
           </div>

           <div className="p-4 flex flex-col justify-between flex-grow" style={{ minHeight: '100px' }}>
              <div>
                <h3 className="font-black text-[10px] md:text-xs leading-tight mb-1 truncate text-[var(--c-text-primary)]">{vid.title}</h3>
                <p className="text-[8px] text-[var(--c-text-secondary)] uppercase tracking-widest font-bold">
                  {product ? product.name : "Showcase"}
                </p>
              </div>
              {product && (
                <div className="flex items-center justify-between mt-2">
                   <span className="text-[var(--c-primary)] font-black text-sm">₹{product.price}</span>
                   <button
                     onClick={(e) => handleAddToCart(product, e)}
                     className="h-7 w-7 rounded-full bg-[var(--c-primary)] hover:bg-[var(--c-primary-light)] flex items-center justify-center shadow-glow-primary border-none cursor-pointer"
                   >
                     <ShoppingCart className="w-3.5 h-3.5 text-white" />
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // ── OPTION 2: FLOATING CORNER BUBBLE (WEB) ──────────────────────────────────
  if (variant === "pip") {
    const vid = videoId ? videos.find(v => v.id === videoId) : videos[0];
    if (!vid) return null;
    const product = products[vid.product_id];

    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isPipOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative w-[180px] h-[320px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mb-3"
            >
              <video 
                src={vid.video_url} 
                autoPlay 
                loop 
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              
              {/* Controls */}
              <button 
                onClick={() => setIsPipOpen(false)}
                className="absolute top-2 left-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white border-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white border-none cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-white font-bold text-xs leading-snug truncate mb-1">{vid.title}</h4>
                {product && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--c-primary)] font-black text-xs">₹{product.price}</span>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-[var(--c-primary)] text-white rounded-lg flex items-center justify-center cursor-pointer border-none"
                    >
                      Shop
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small pulsing story bubble trigger */}
        <button 
          onClick={() => setIsPipOpen(!isPipOpen)}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[var(--c-primary)] overflow-hidden shadow-glow-primary bg-black p-0.5 animate-bounce relative group cursor-pointer"
          style={{ animationDuration: '3s' }}
        >
          <div className="w-full h-full rounded-full overflow-hidden relative">
            <video 
              src={vid.video_url} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="w-6 h-6 bg-[var(--c-primary)]/80 rounded-full flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white ml-0.5 fill-white" />
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ── STANDARD LAYOUT: CAROUSEL FEED ──────────────────────────────────────────
  return (
    <div className="w-full bg-[var(--c-bg)] py-6 md:py-8 border-t border-b border-[var(--foreground)]/5 my-4">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-[var(--c-text-primary)] uppercase tracking-tighter italic">
              Ocean <span className="text-[var(--c-primary)]">Reels</span>
            </h2>
            <p className="text-[9px] text-[var(--c-text-secondary)] uppercase tracking-widest font-bold">
              Watch & Shop
            </p>
          </div>
        </div>

        {/* Horizontal Scroll Feed - Slim Display */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map((vid) => {
            const product = products[vid.product_id];
            const isActive = activeVideoId === vid.id;

            return (
              <div 
                key={vid.id}
                onClick={() => setActiveVideoId(isActive ? null : vid.id)}
                className="relative flex-none w-[110px] h-[190px] md:w-[150px] md:h-[260px] rounded-[16px] overflow-hidden snap-center cursor-pointer group bg-black shadow-md border border-white/10 transition-transform duration-300 hover:-translate-y-1"
              >
                <video 
                  src={vid.video_url} 
                  autoPlay={isActive}
                  loop 
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0.8 }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 pointer-events-none" />

                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 pointer-events-auto flex flex-col justify-end">
                  <h3 className="text-white font-black text-[10px] md:text-xs leading-tight mb-1 drop-shadow-md line-clamp-2">{vid.title}</h3>
                  {product && (
                    <div className="flex items-center justify-between mt-1 gap-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--c-primary)] font-black text-[10px] md:text-xs truncate">₹{product.price}</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="h-6 w-6 md:h-7 md:w-7 rounded-full p-0 shadow-glow-purple bg-[var(--c-primary)] hover:bg-[var(--c-primary-light)] flex-shrink-0"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </div>
                  )}
                </div>

                {isActive && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full pointer-events-auto"
                  >
                    {isMuted ? <VolumeX className="w-3 h-3 text-white" /> : <Volume2 className="w-3 h-3 text-white" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
