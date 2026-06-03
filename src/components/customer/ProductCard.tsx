"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShoppingCart, Heart, Star } from "lucide-react";
import NextLink from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { useSettingsStore } from "@/store/settingsStore";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    sellerName: string;
    category: string;
    freshness: string;
    deliveryTime: string;
    image: string;
    rating?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const { currencySymbol } = useSettingsStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sellerId: "seller-1",
    });
    toast(`Added ${product.name} to your fleet.`, "success");
  };

  return (
    <Card className="group relative overflow-hidden bg-bg-card border-[var(--foreground)]/5 hover:border-primary/30 transition-all duration-500 hover:shadow-glow-purple flex flex-col h-full rounded-[28px]">
      <div className="relative w-full aspect-[4/3] bg-black/40 overflow-hidden shrink-0">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 z-10 rounded-none" />
        )}
        <Image
          src={product.image}
          alt={`Harvest: ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-contain transition-transform duration-700 group-hover:scale-105 ${
            imageLoaded ? "scale-100" : "scale-105"
          }`}
          onLoad={() => setImageLoaded(true)}
          priority={false}
        />
        
        <div className="absolute top-4 left-4 z-20 flex gap-2">
           <Badge variant="glass" className="bg-bg-primary/80 backdrop-blur-md text-tertiary border-tertiary/20 text-[8px] font-black tracking-widest uppercase px-2 py-1">
              {product.category || "AAA GRADE"}
           </Badge>
           <Badge className="bg-primary/20 backdrop-blur-md text-primary border-primary/20 text-[8px] font-black tracking-widest uppercase px-2 py-1">
              SUSTAINABLE
           </Badge>
        </div>

        <div className="absolute bottom-4 right-4 z-20 bg-bg-primary/80 backdrop-blur-md px-3 py-1.5 rounded-[12px] flex items-center gap-2 border border-white/5">
           <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
           <span className="text-[10px] font-black text-[var(--foreground)] tracking-widest">34°F STABLE</span>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
           <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                 <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                    <NextLink href={`/customer/products/${product.id}`}>{product.name}</NextLink>
                 </h3>
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] truncate">
                    Origin: Global • SKU: OF-{product.id}
                 </p>
              </div>
              <button 
                className="p-1 text-text-secondary hover:text-danger transition-colors group/heart shrink-0"
                aria-label="Add to Wishlist"
              >
                <Heart className="w-6 h-6 group-hover/heart:fill-danger" />
              </button>
           </div>

           <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-6">
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-[var(--foreground)] tracking-tighter">{currencySymbol}{product.price.toFixed(2)}</span>
                 <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">/ kg</span>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="w-12 h-12 rounded-[16px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-glow-purple active:scale-90"
              >
                 <ShoppingCart className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </Card>
  );
}
