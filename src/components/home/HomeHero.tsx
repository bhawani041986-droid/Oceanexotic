// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function HomeHero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen flex items-center justify-center pt-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/60 to-bg-primary z-10" />
        <img 
          src="https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover scale-110 opacity-40 grayscale-[20%]" 
          alt="Hero" 
        />
      </div>

      <div className="container mx-auto px-6 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 text-center lg:text-left">
          <Badge variant="glass" className="px-6 py-2 text-[10px] font-black tracking-[0.4em] text-primary">GUARANTEED FRESH</Badge>
          <h2 className="text-6xl md:text-[100px] font-black text-[var(--foreground)] tracking-tighter uppercase italic leading-[0.85]">FRESHNESS <br /><span className="text-primary">REDEFINED.</span></h2>
          <p className="text-lg md:text-2xl text-text-secondary font-medium italic max-w-xl mx-auto lg:mx-0">Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
             <Button className="h-16 px-12 rounded-full text-[12px] font-black uppercase tracking-widest shadow-glow-purple" onClick={() => router.push('/customer/products')}>SHOP FRESH SEAFOOD</Button>
             <Button variant="outline" className="h-16 px-12 rounded-full text-[12px] font-black uppercase tracking-widest border-[var(--foreground)]/10" onClick={() => router.push('/customer/products')}>VIEW ALL SEAFOOD</Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:block relative">
           <div className="absolute -inset-20 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
           <Card className="p-10 bg-bg-card/40 backdrop-blur-3xl border-[var(--foreground)]/10 rounded-[64px] shadow-2xl space-y-8 relative z-10 hover:translate-y-[-10px] transition-transform duration-700">
              <div className="aspect-square rounded-[48px] bg-bg-primary/50 flex items-center justify-center text-[180px]">🍣</div>
              <div className="flex justify-between items-end"><h3 className="text-4xl font-black text-[var(--foreground)] uppercase italic">Sushi Grade</h3><p className="text-3xl font-black text-primary italic">₹2,450</p></div>
              <Button className="w-full h-16 rounded-3xl shadow-glow-purple text-[11px] font-black uppercase">ADD TO CART</Button>
           </Card>
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--foreground)]/5 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-3xl flex items-center justify-center text-5xl rotate-12 animate-float">🐟</div>
           <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[var(--foreground)]/5 backdrop-blur-xl border border-[var(--foreground)]/10 rounded-2xl flex items-center justify-center text-4xl -rotate-12 animate-float-delayed">🦐</div>
        </motion.div>
      </div>
    </section>
  );
}
