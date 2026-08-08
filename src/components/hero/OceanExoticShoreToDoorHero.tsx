"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Waves, 
  Scissors, 
  Package, 
  ThermometerSnowflake, 
  Truck, 
  Home, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Box,
  ShoppingCart,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Hero3DFishItem {
  id: string;
  name: string;
  price: string;
  unit?: string;
  badge?: string;
  badgeColor?: string;
  image?: string;
  desc?: string;
  productId?: string;
  icon?: string;
}

export interface Hero3DStageConfig {
  id: string;
  step: string;
  label: string;
  title: string;
  badge: string;
  statusText: string;
  imageUrl: string;
}

interface OceanExoticShoreToDoorHeroProps {
  heroItems?: Hero3DFishItem[];
  hero3dStages?: Hero3DStageConfig[];
}

// 🍔 ➔ 🐟 CRAV BURGERS NATIVE MOBILE APP 3D PROCESS STAGES
const DEFAULT_STAGES = [
  {
    id: "catch",
    step: "01",
    label: "SHORE CATCH",
    title: "SHORE CATCH",
    badge: "100% Ocean Wild Catch",
    statusText: "Pristine Island Dock Landing",
    accentColor: "#00f3ff",
    icon: <Waves className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400" />
  },
  {
    id: "slice",
    step: "02",
    label: "PRECISION SLICED",
    title: "PRECISION SLICED",
    badge: "3D Deconstructed Cuts",
    statusText: "Laser Sliced Fresh Cuts",
    accentColor: "#f59e0b",
    icon: <Scissors className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400" />
  },
  {
    id: "vacuum",
    step: "03",
    label: "VACUUM SEALED",
    title: "VACUUM SEALED",
    badge: "Hermetic Eco Pack",
    statusText: "Airtight Freshness Encapsulation",
    accentColor: "#3b82f6",
    icon: <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400" />
  },
  {
    id: "coldchain",
    step: "04",
    label: "COLD CHAIN (0-4°C)",
    title: "COLD CHAIN MAINTAINED",
    badge: "0°C - 4°C Ice Lock",
    statusText: "Continuous Chilled Preservation",
    accentColor: "#10b981",
    icon: <ThermometerSnowflake className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-400" />
  },
  {
    id: "delivery",
    step: "05",
    label: "EXPRESS DISPATCH",
    title: "EXPRESS DISPATCH",
    badge: "90 Min Route",
    statusText: "Cold Courier Velocity Tunnel",
    accentColor: "#a855f7",
    icon: <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-400" />
  },
  {
    id: "door",
    step: "06",
    label: "DELIVERED TO DOOR",
    title: "DELIVERED TO DOOR",
    badge: "Shore to Door Complete",
    statusText: "Fresh Seafood Delivered Fresh",
    accentColor: "#00d1ff",
    icon: <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400" />
  }
];

export function OceanExoticShoreToDoorHero({ heroItems, hero3dStages }: OceanExoticShoreToDoorHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const activeAdminFish = heroItems && heroItems.length > 0 ? heroItems[0] : null;

  const STAGES = DEFAULT_STAGES.map((stg, i) => {
    const customStage = hero3dStages && hero3dStages[i];
    return {
      ...stg,
      title: customStage?.title || stg.title,
      badge: customStage?.badge || stg.badge,
      statusText: customStage?.statusText || stg.statusText,
      imageUrl: customStage?.imageUrl || `/images/hero/hero_${stg.id === 'catch' ? 'shore_catch' : stg.id === 'slice' ? 'freshly_sliced' : stg.id === 'vacuum' ? 'vacuum_sealed' : stg.id === 'coldchain' ? 'cold_chain' : stg.id === 'delivery' ? 'express_delivery' : 'delivered_door'}.jpg`
    };
  });

  // ⏱️ Auto-Play Timeline Ticker
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStageIdx((current) => (current + 1) % STAGES.length);
          return 0;
        }
        return prev + 2.2;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStageSelect = (idx: number) => {
    setActiveStageIdx(idx);
    setProgress(0);
  };

  // 🖱️ Crav Burgers 3D Mouse Parallax Tilt Tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseRef.current.targetX = (e.clientX - halfW) / halfW;
      mouseRef.current.targetY = (e.clientY - halfH) / halfH;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 🎨 NATIVE MOBILE APP CANVAS BACKGROUND ENGINE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // 120 Bioluminescent 3D Particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.4 ? "#00f3ff" : "#f59e0b"
    }));

    let time = 0;

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      // Crav Burgers Mouse Parallax Lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // 1. Render Volumetric Light Beams (Tilted by Mouse Parallax)
      for (let i = 0; i < 5; i++) {
        const beamX = (width / 5) * i + Math.sin(time + i) * 35 + mouseRef.current.x * 20;
        const grad = ctx.createLinearGradient(beamX, 0, beamX + 90, height);
        grad.addColorStop(0, "rgba(0, 243, 255, 0.08)");
        grad.addColorStop(0.5, "rgba(245, 158, 11, 0.04)");
        grad.addColorStop(1, "rgba(3, 7, 18, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(beamX - 30, 0);
        ctx.lineTo(beamX + 80, 0);
        ctx.lineTo(beamX + 220, height);
        ctx.lineTo(beamX - 100, height);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Render 3D Floating Particles
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(time + p.y) * 0.2 + mouseRef.current.x * 0.5;
        p.y += p.speedY + mouseRef.current.y * 0.5;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color === "#00f3ff" 
          ? `rgba(0, 243, 255, ${p.opacity})` 
          : `rgba(245, 158, 11, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const currentStage = STAGES[activeStageIdx];

  return (
    <div className="relative w-full bg-[#030712] text-white overflow-hidden select-none border-b border-cyan-500/20 py-3 sm:py-6 lg:py-8 min-h-[440px] sm:min-h-[540px] lg:min-h-[620px] flex flex-col justify-between">
      
      {/* NATIVE APP CANVAS ENGINE */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Ambient Dark Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/75 to-transparent z-15 pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto w-full h-full flex flex-col justify-between px-3 sm:px-6 lg:px-10">
        
        {/* NATIVE MOBILE HEADER BAR — Compact Pill */}
        <header className="w-full flex items-center justify-between pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1">
              <Box className="w-3 h-3 text-amber-400" />
              OCEANEXOTIC — 3D PROCESS
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/95 border border-white/20 hover:border-cyan-400 text-[9px] sm:text-xs font-black text-cyan-300 transition-all backdrop-blur-md"
              title={isPlaying ? "Pause 3D Engine" : "Play 3D Engine"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                {isPlaying ? "3D AUTO" : "PAUSED"}
              </span>
            </button>

            <button
              onClick={() => handleStageSelect(0)}
              className="p-1 sm:p-1.5 rounded-full bg-slate-900/95 border border-white/20 hover:border-cyan-400 text-slate-300 transition-all"
              title="Restart 3D Journey"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* NATIVE MOBILE MAIN DISPLAY STAGE */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center my-auto py-1 sm:py-4">
          
          {/* LEFT COLUMN — Native Mobile Stage Headlines & Conversion CTAs */}
          <div className="lg:col-span-5 space-y-1.5 sm:space-y-4 text-center lg:text-left z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(3px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-1.5 sm:space-y-3"
              >
                {/* Native Mobile Step Micro-Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/15 bg-slate-900/95 backdrop-blur-md shadow-lg">
                  {currentStage.icon}
                  <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-slate-200">
                    {activeAdminFish ? `${activeAdminFish.name} // ${currentStage.badge}` : currentStage.badge}
                  </span>
                </div>

                {/* Native Mobile Stage Title */}
                <div className="space-y-0.5">
                  <span className="text-[9.5px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.25em] text-cyan-400">
                    STAGE {currentStage.step} // {currentStage.statusText}
                  </span>
                  <h1 className="text-xl sm:text-4xl lg:text-6xl font-black uppercase italic tracking-tight leading-tight text-white drop-shadow-xl">
                    {currentStage.title}
                  </h1>
                </div>

                {/* Native Mobile Price Tag */}
                {activeAdminFish?.price && (
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 pt-0.5">
                    <span className="text-base sm:text-2xl font-black text-amber-400">{activeAdminFish.price}</span>
                    {activeAdminFish.unit && (
                      <span className="text-[9.5px] sm:text-xs text-slate-400 font-bold uppercase">/ {activeAdminFish.unit}</span>
                    )}
                  </div>
                )}

                {/* Native Mobile Conversion CTA Button */}
                <div className="pt-1 sm:pt-2 flex items-center justify-center lg:justify-start">
                  <Link
                    href={activeAdminFish?.productId ? `/customer/products/${activeAdminFish.productId}` : "/customer/products"}
                    className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    EXPLORE FRESH CATCH
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN — NATIVE MOBILE BORDERLESS FLOATING 3D VIEWPORT */}
          <div className="lg:col-span-7 flex items-center justify-center relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, scale: 0.94, rotateY: -8, y: 8 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                exit={{ opacity: 0, scale: 1.04, rotateY: 8, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-lg aspect-[16/9] sm:aspect-[16/10] flex items-center justify-center group"
              >
                {/* 🌟 NATIVE MOBILE BORDERLESS FLOATING CONTAINER */}
                <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_12px_45px_rgba(0,243,255,0.22)] flex items-center justify-center">
                  
                  {/* High-Res Stage Photo */}
                  <img
                    src={currentStage.imageUrl}
                    alt={currentStage.title}
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl transition-transform duration-1000 group-hover:scale-105"
                  />

                  {/* 🌊 STAGE 1: 3D WATER RIPPLE OVERLAY */}
                  {activeStageIdx === 0 && (
                    <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay pointer-events-none animate-pulse" />
                  )}

                  {/* 🔪 STAGE 2: 3D DYNAMIC LASER SLICING VIDEO EFFECT */}
                  {activeStageIdx === 1 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ opacity: [0, 1, 1, 0], x: ["-100%", "40%", "80%", "120%"] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-y-0 w-2 sm:w-2.5 bg-gradient-to-b from-transparent via-amber-400 to-transparent shadow-[0_0_30px_#f59e0b] transform -rotate-12 pointer-events-none z-20"
                      />
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: [0, 0.9, 0], scaleX: [0, 1, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-x-0 h-0.5 sm:h-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] pointer-events-none z-20"
                      />
                    </>
                  )}

                  {/* 📦 STAGE 3: 3D GLASSMORPHIC VACUUM SHRINK-WRAP VIDEO EFFECT */}
                  {activeStageIdx === 2 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1.1, 0.98, 1.1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-1.5 sm:inset-2 border-2 border-blue-400/90 rounded-xl sm:rounded-2xl pointer-events-none z-20 shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                      />
                      <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] pointer-events-none z-10" />
                    </>
                  )}

                  {/* ❄️ STAGE 4: 3D CRYO FROST ICE CRYSTAL LOCK BADGE (TOP-RIGHT NATIVE MOBILE PLACEMENT) */}
                  {activeStageIdx === 3 && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-none z-30">
                      <div className="bg-slate-950/95 border border-emerald-400/80 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-1.5 backdrop-blur-md">
                        <ThermometerSnowflake className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-400 animate-bounce" />
                        <div className="text-left">
                          <p className="text-[8.5px] sm:text-xs font-black text-white uppercase tracking-wider">0°C TO 4°C CHILLED LOCK</p>
                          <p className="text-[7.5px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-widest hidden sm:block">CRYO VAULT LOCKED</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🚚 STAGE 5: 3D EXPRESS VELOCITY SPEED-LINE TUNNEL VIDEO EFFECT */}
                  {activeStageIdx === 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.7, 0.2] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none z-20"
                    />
                  )}

                  {/* 🍽️ STAGE 6: GOURMET DOORSTEP DINING SERVING GLAZE EFFECT */}
                  {activeStageIdx === 5 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-amber-500/10 pointer-events-none z-20" />
                  )}

                  {/* Ambient Top/Bottom Dark Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20 pointer-events-none rounded-2xl sm:rounded-3xl" />

                  {/* NATIVE MOBILE TELEMETRY FLOATING BAR */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-4 sm:left-4 sm:right-4 bg-slate-950/95 border border-white/20 px-2.5 py-1.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between backdrop-blur-md shadow-xl z-30">
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      {currentStage.icon}
                      <span className="text-[9.5px] sm:text-xs font-black uppercase text-white tracking-wider truncate">
                        {activeAdminFish ? activeAdminFish.name : currentStage.label}
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shrink-0">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                      3D PROCESS
                    </span>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

        {/* NATIVE MOBILE FOOTER — TIMED PROGRESS BAR & STEP RIBBON */}
        <footer className="w-full space-y-1.5 sm:space-y-3 pt-1 sm:pt-2 border-t border-white/10">
          
          {/* Continuous Timeline Progress Bar */}
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 via-amber-400 to-cyan-300 transition-all duration-100 ease-linear shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${((activeStageIdx + progress / 100) / STAGES.length) * 100}%` }}
            />
          </div>

          {/* Native Mobile Interactive Step Ribbon */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {STAGES.map((stg, i) => (
              <button
                key={stg.id}
                onClick={() => handleStageSelect(i)}
                className={cn(
                  "flex-1 min-w-[80px] sm:min-w-[110px] py-1 px-1 sm:py-2 sm:px-2 rounded-lg sm:rounded-xl text-[8.5px] sm:text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1 sm:gap-1.5",
                  i === activeStageIdx
                    ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.3)] scale-[1.02]"
                    : i < activeStageIdx
                    ? "bg-slate-900/80 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
                )}
              >
                <span>{stg.step}</span>
                <span className="truncate">{stg.label}</span>
              </button>
            ))}
          </div>

        </footer>

      </div>
    </div>
  );
}
