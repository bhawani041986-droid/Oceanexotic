import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-white/5 bg-background-card transition-all hover:translate-y-[-4px]">
      <CardHeader className="p-0 relative h-64 overflow-hidden">
        {/* Placeholder for Next/Image */}
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
          🐟
        </div>
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-success text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            FRESH CATCH
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors">
            ❤️
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-card to-transparent opacity-60" />
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-primary-aqua font-bold tracking-widest uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-warning">★</span>
              <span className="text-[10px] text-muted-foreground font-medium">4.8 (120)</span>
            </div>
          </div>
          <h3 className="text-lg font-bold group-hover:text-primary-aqua transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Price per kg</span>
            <span className="text-xl font-extrabold text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <Button size="sm" variant="glass" className="px-4 hover:bg-primary-purple hover:border-primary-purple transition-all">
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
