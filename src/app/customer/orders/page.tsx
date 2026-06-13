"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Truck, Package, CheckCircle2, ChevronRight, Droplets, Loader2 } from "lucide-react";
import Link from "next/link";

import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/store/authStore";
import dynamic from 'next/dynamic';

const OceanReelsFeed = dynamic(
  () => import('@/components/video/OceanReelsFeed').then((mod) => mod.OceanReelsFeed),
  { ssr: false, loading: () => <div className="w-full h-[250px] bg-[var(--c-bg)] animate-pulse my-4 border-y border-[var(--foreground)]/5" /> }
);

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user, isHydrated } = useAuthStore();

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!isHydrated) return;
      
      try {
        // High-Fidelity Identity Resolution: Rely on authenticated citizen ID
        const userId = user?.id;
        
        if (!userId) {
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        const data = await orderService.getCustomerOrders(userId);
        
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Order Sync Failure:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id, isHydrated]);
  return (
    <div className="bg-bg-primary pt-24 md:pt-32 pb-10 md:pb-20">
        <div className="container mx-auto px-4 md:px-10 pb-10 md:pb-20">
          
          <div className="max-w-5xl mx-auto space-y-[10px] md:space-y-12">
            <div className="space-y-1 md:space-y-4">
              <h1 className="text-2xl md:text-[40px] font-black uppercase italic tracking-tighter text-[var(--foreground)] leading-tight">Order History</h1>
              <p className="text-[10px] md:text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">Tracking {orders.length} Active & Past Orders</p>
            </div>

            <div className="space-y-[10px] md:space-y-6">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">Loading Orders...</p>
                </div>
              ) : orders.length > 0 ? orders.map((order) => (
                <Card key={order.id} className="group hover:border-primary/30 transition-all overflow-hidden rounded-[20px] md:rounded-[28px]">
                  <div className="p-[10px] md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-[10px] md:gap-10">
                    
                    <div className="flex items-start gap-[10px] md:gap-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[18px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shrink-0">
                        {order.status === "IN TRANSIT" ? <Truck className="w-6 h-6 md:w-8 md:h-8" /> : <Package className="w-6 h-6 md:w-8 md:h-8" />}
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        <div className="flex items-center gap-3 md:gap-4">
                          <h3 className="text-base md:text-xl font-black uppercase italic text-[var(--foreground)] tracking-tight">{order.id}</h3>
                          {order.is_pre_order === 1 && (
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-wider border border-amber-500/30">PRE-ORDER</span>
                          )}
                          <Badge variant={order.status === "IN TRANSIT" ? "success" : "glass"} className="text-[8px] md:text-[10px] font-black uppercase">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-[8px] md:text-[11px] font-black text-text-secondary uppercase tracking-widest">
                          Placed on {order.date} • {order.items} items
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-[10px] md:gap-10">
                      <div className="space-y-0.5 md:space-y-1 lg:text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">Order Total</p>
                        <p className="text-xl md:text-2xl font-black text-[var(--foreground)] leading-none italic">₹{order.total.toLocaleString()}</p>
                      </div>
                      <div className="h-px lg:h-10 w-full lg:w-px bg-[var(--foreground)]/5" />
                      <div className="flex items-center gap-[4px] md:gap-4">
                        <Link href={`/customer/orders/${order.id}`} className="flex-1 lg:flex-none">
                          <Button variant="outline" className="w-full lg:w-auto h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase rounded-lg md:rounded-xl">
                            VIEW DETAILS
                          </Button>
                        </Link>
                        <Link href={`/customer/orders/${order.id}/tracking`} className="flex-1 lg:flex-none">
                          <Button className="w-full lg:w-auto h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple rounded-lg md:rounded-xl">
                            TRACK
                          </Button>
                        </Link>
                        {order.status === "DELIVERED" && (
                          <Link href={`/customer/orders/${order.id}`}>
                            <Button className="w-full lg:w-auto h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple rounded-lg md:rounded-xl">
                              LEAVE FEEDBACK
                            </Button>
                          </Link>
                        )}
                        <button className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[14px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-all shrink-0">
                          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--foreground)]" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Status Progress Bar - High Fidelity */}
                  <div className="bg-[var(--foreground)]/5 px-[10px] md:px-10 py-3 md:py-4 border-t border-[var(--foreground)]/5 flex items-center gap-[10px] md:gap-6">
                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                      <Droplets className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[var(--foreground)]">COLD: -20°C</span>
                    </div>
                    <div className="flex-1 h-1 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full bg-primary shadow-glow-purple transition-all duration-1000",
                        order.status === "IN TRANSIT" ? "w-[65%]" : "w-full"
                      )} />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest shrink-0">
                      {order.status === "IN TRANSIT" ? "ETA: 45m" : "Delivered"}
                    </span>
                  </div>
                </Card>
              )) : (
                <div className="py-20 text-center space-y-4 bg-[var(--foreground)]/5 rounded-3xl border border-dashed border-[var(--foreground)]/10">
                   <Package className="w-12 h-12 text-primary/20 mx-auto" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary italic">No orders found in history</p>
                </div>
              )}
            </div>

            {/* Empty State / Call to Action */}
            <div className="pt-20 text-center space-y-8 max-w-sm mx-auto">
              <div className="p-8 rounded-full bg-[var(--foreground)]/5 border border-dashed border-[var(--foreground)]/10 inline-block">
                <CheckCircle2 className="w-12 h-12 text-primary opacity-40" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Start Shopping</h2>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">Continue your discovery of the world's most premium sustainable seafood harvest.</p>
              </div>
              <Link href="/customer/products">
                <Button className="h-14 px-12 text-sm font-black tracking-[0.2em] shadow-glow-purple">
                  BROWSE MARKETPLACE
                </Button>
              </Link>
            </div>

        </div>
      </div>
      <OceanReelsFeed />
    </div>
  );
}
