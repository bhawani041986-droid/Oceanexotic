"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Compass, 
  ArrowLeft, 
  Anchor, 
  Waves, 
  Search,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.05),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <Waves className="absolute top-1/4 left-1/4 w-96 h-96 text-primary animate-pulse" />
         <Waves className="absolute bottom-1/4 right-1/4 w-96 h-96 text-primary animate-pulse delay-700" />
      </div>

      <div className="max-w-xl w-full text-center space-y-12 relative z-10">
         <div className="relative inline-block">
            <div className="w-32 h-32 rounded-[32px] bg-[var(--foreground)]/5 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple animate-bounce duration-[3000ms]">
               <Compass className="w-16 h-16" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-bg-primary border-4 border-bg-primary flex items-center justify-center">
               <div className="w-4 h-4 rounded-full bg-danger shadow-glow-red animate-pulse" />
            </div>
         </div>

         <div className="space-y-4">
            <h1 className="text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none">404</h1>
            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">Node Not Found.</h2>
            <p className="text-sm text-text-secondary font-medium leading-relaxed italic max-w-md mx-auto">
               The maritime coordinate you are attempting to reach has drifted out of range or does not exist within the OceanExotic Global registry.
            </p>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="w-full sm:w-auto">
               <Button variant="primary" className="w-full h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3">
                  <ArrowLeft className="w-4 h-4" /> RETURN TO PORT
               </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto h-14 px-10 text-[11px] font-black tracking-widest uppercase border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 flex items-center gap-3">
               <Search className="w-4 h-4" /> SEARCH REGISTRY
            </Button>
         </div>

         <div className="pt-12 border-t border-[var(--foreground)]/5 flex items-center justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest">
               <Anchor className="w-3.5 h-3.5" /> SECURE HANDSHAKE ACTIVE
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest">
               <Globe className="w-3.5 h-3.5" /> GLOBAL NODE SYNCED
            </div>
         </div>
      </div>
    </div>
  );
}
