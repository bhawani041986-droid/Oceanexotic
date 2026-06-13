"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabaseFrontend as supabase } from '@/lib/supabase-client';
import { Play, VolumeX, Volume2, ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';

export function OceanReelsFeed() {
  const [videos, setVideos] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
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
                        <ShoppingCart className="w-3 h-3 text-white" />
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
