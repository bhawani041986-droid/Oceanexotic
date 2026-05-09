import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: number;
}

export default function InventoryCard({ item }: { item: InventoryItem }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-[16px] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[12px] bg-white/5 flex items-center justify-center text-2xl">
          🐟
        </div>
        <div>
          <h4 className="font-bold text-sm">{item.name}</h4>
          <p className="text-[10px] text-muted-foreground">${item.price}/kg</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Stock</p>
          <p className="text-sm font-bold">{item.stock} kg</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Status</p>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            item.status === 'In Stock' ? 'bg-success/10 text-success' : 
            item.status === 'Low Stock' ? 'bg-warning/10 text-warning' : 
            'bg-danger/10 text-danger'
          }`}>
            {item.status}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
          ⋮
        </Button>
      </div>
    </div>
  );
}
