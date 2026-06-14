"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  Home, 
  Truck, 
  MapPin,
  Calendar,
  Waves
} from "lucide-react";
import confetti from "canvas-confetti";
import MainLayout from "@/components/layouts/MainLayout";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));

    // Trigger confetti for the harvest celebration
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] flex items-center justify-center p-4 py-32">
        <div className="max-w-2xl w-full space-y-8 animate-fade-in">
          
          {/* Hero Success Card */}
          <Card className="p-10 md:p-16 bg-[var(--c-card)] border-[var(--border)] rounded-[48px] text-center space-y-8 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--c-primary)] to-transparent" />
             
             <div className="w-24 h-24 rounded-full bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 rounded-full animate-ping bg-[var(--c-primary)]/20" />
                <CheckCircle2 className="w-12 h-12 text-[var(--c-primary)]" />
             </div>

             <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-[var(--c-text-primary)]">Harvest Confirmed</h1>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[var(--c-primary)] italic">Order Synchronized with System Fleet</p>
             </div>

             <div className="grid grid-cols-2 gap-4 py-8 border-y border-[var(--border)]">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest italic flex items-center justify-center gap-2">
                      <ShoppingBag className="w-3 h-3" /> Trade ID
                   </p>
                   <p className="text-sm font-black italic">{orderId}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest italic flex items-center justify-center gap-2">
                      <Calendar className="w-3 h-3" /> Timestamp
                   </p>
                   <p className="text-sm font-black italic">{date}</p>
                </div>
             </div>

             <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 p-5 rounded-3xl bg-[var(--foreground)]/5 border border-[var(--border)] text-left">
                   <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                      <Truck className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest italic text-[var(--c-text-primary)]">Dispatch Status: PENDING</h4>
                      <p className="text-[8px] font-medium text-[var(--c-text-secondary)] uppercase leading-relaxed">Fleet is preparing for cold-chain synchronization</p>
                   </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-3xl bg-[var(--foreground)]/5 border border-[var(--border)] text-left">
                   <div className="w-10 h-10 rounded-xl bg-[var(--c-primary)]/10 flex items-center justify-center text-[var(--c-primary)]">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest italic text-[var(--c-text-primary)]">Delivery Hub</h4>
                      <p className="text-[8px] font-medium text-[var(--c-text-secondary)] uppercase leading-relaxed">Assigned to Port Blair Central Node</p>
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button onClick={() => router.push("/customer/products")} className="flex-1 h-14 border border-[var(--border)] hover:bg-[var(--foreground)]/5 text-[var(--c-text-primary)] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 italic bg-transparent">
                   <ShoppingBag className="w-5 h-5" /> NEW TRADE
                </Button>
                <Button onClick={() => router.push("/customer/orders")} className="flex-1 h-14 bg-[var(--c-primary)] text-[var(--foreground)] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-[var(--c-shadow-glow)] italic">
                   TRACK HARVEST <ArrowRight className="w-5 h-5" />
                </Button>
             </div>
          </Card>

          {/* Footer Info */}
           <div className="flex items-center justify-center gap-8 opacity-40">
              <div className="flex items-center gap-2">
                 <Waves className="w-4 h-4" />
                 <span className="text-[9px] font-black uppercase tracking-widest italic">OceanExotic Secure v2.4</span>
              </div>
              <div className="flex items-center gap-2">
                 <Home className="w-4 h-4" />
                 <span className="text-[9px] font-black uppercase tracking-widest italic">OceanExotic Checkout System</span>
              </div>
           </div>

        </div>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center">
        <Waves className="w-12 h-12 text-[var(--c-primary)] animate-pulse" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
