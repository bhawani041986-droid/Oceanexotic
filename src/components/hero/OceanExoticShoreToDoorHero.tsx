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
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// 🌊 6 STAGES OF THE SINGLE FISH JOURNEY (Minimal Text, Maximum Visual Animation)
const STAGES = [
  {
    id: "catch",
    step: "01",
    label: "SHORE CATCH",
    title: "SHORE CATCH",
    badge: "100% Ocean Fresh",
    statusText: "Landed at Port Blair Dock",
    accentColor: "#00f3ff",
    icon: <Waves className="w-5 h-5 text-cyan-400" />
  },
  {
    id: "slice",
    step: "02",
    label: "FRESHLY SLICED",
    title: "FRESHLY SLICED",
    badge: "Precision Clean Cut",
    statusText: "Master Filleted & Cut",
    accentColor: "#f59e0b",
    icon: <Scissors className="w-5 h-5 text-amber-400" />
  },
  {
    id: "vacuum",
    step: "03",
    label: "VACUUM SEALED",
    title: "VACUUM SEALED",
    badge: "Airtight Eco Pack",
    statusText: "Hermetic Fresh Lock",
    accentColor: "#3b82f6",
    icon: <Package className="w-5 h-5 text-blue-400" />
  },
  {
    id: "coldchain",
    step: "04",
    label: "COLD CHAIN",
    title: "COLD CHAIN (0-4°C)",
    badge: "Ice-Cold Temperature Lock",
    statusText: "Constant 0°C to 4°C Chilled",
    accentColor: "#10b981",
    icon: <ThermometerSnowflake className="w-5 h-5 text-emerald-400" />
  },
  {
    id: "delivery",
    step: "05",
    label: "EXPRESS DELIVERY",
    title: "EXPRESS DELIVERY",
    badge: "On The Way",
    statusText: "Express Cold Courier En Route",
    accentColor: "#a855f7",
    icon: <Truck className="w-5 h-5 text-purple-400" />
  },
  {
    id: "door",
    step: "06",
    label: "DELIVERED TO DOOR",
    title: "DELIVERED TO YOUR DOOR",
    badge: "Shore to Door Complete",
    statusText: "Fresh Seafood Delivered Fresh",
    accentColor: "#00d1ff",
    icon: <Home className="w-5 h-5 text-cyan-400" />
  }
];

export function OceanExoticShoreToDoorHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stageProgress, setStageProgress] = useState(0);

  // Single Real Fish Source Image URL (Whole fresh landed ocean fish)
  const singleFishImage = "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=1200&q=85";
  const slicedFishImage = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=85";

  // ⏱️ Auto-Play Animation Timer (4.5s per stage, continuous loop)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) {
          setActiveStageIdx((current) => (current + 1) % STAGES.length);
          return 0;
        }
        return prev + 2.5;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStageSelect = (idx: number) => {
    setActiveStageIdx(idx);
    setStageProgress(0);
  };

  // 🎨 WebGL/Canvas Particle & Caustics Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.5 - 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      isGold: Math.random() > 0.4
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Light Beams
      for (let i = 0; i < 4; i++) {
        const beamX = (width / 4) * i + Math.sin(time + i) * 30;
        const grad = ctx.createLinearGradient(beamX, 0, beamX + 80, height);
        grad.addColorStop(0, "rgba(0, 243, 255, 0.06)");
        grad.addColorStop(0.5, "rgba(245, 158, 11, 0.03)");
        grad.addColorStop(1, "rgba(3, 7, 18, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(beamX - 20, 0);
        ctx.lineTo(beamX + 60, 0);
        ctx.lineTo(beamX + 180, height);
        ctx.lineTo(beamX - 80, height);
        ctx.closePath();
        ctx.fill();
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(time + p.y) * 0.15;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isGold 
          ? `rgba(251, 191, 36, ${p.opacity})` 
          : `rgba(0, 243, 255, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const currentStage = STAGES[activeStageIdx];

  return (
    <div className="relative w-full min-h-[560px] lg:min-h-[620px] bg-[#030712] text-white overflow-hidden select-none border-b border-cyan-500/20">
      {/* Background Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712] z-10 pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto h-full min-h-[560px] lg:min-h-[620px] flex flex-col justify-between p-4 sm:p-6 lg:p-10">
        
        {/* HEADER BAR — Live Tag & Auto-Play Controls */}
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-300">
              OCEANEXOTIC — SHORE TO DOOR JOURNEY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 hover:border-cyan-400 text-xs font-black text-cyan-300 transition-all backdrop-blur-md"
              title={isPlaying ? "Pause Story" : "Play Story"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                {isPlaying ? "AUTO" : "PAUSED"}
              </span>
            </button>

            <button
              onClick={() => handleStageSelect(0)}
              className="p-1.5 rounded-full bg-slate-900/90 border border-white/20 hover:border-cyan-400 text-slate-300 transition-all"
              title="Restart Journey"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* MAIN VISUAL ANCHOR STAGE — Single Fish Animated Transformation */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
          
          {/* LEFT SIDE — Minimal Text & Bold Stage Title */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-3"
              >
                {/* Step Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-slate-900/90 backdrop-blur-md shadow-xl">
                  {currentStage.icon}
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-200">
                    {currentStage.badge}
                  </span>
                </div>

                {/* Stage Headline (Minimal Text) */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                    STAGE {currentStage.step} // {currentStage.statusText}
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tight leading-none text-white drop-shadow-2xl">
                    {currentStage.title}
                  </h1>
                </div>

                {/* Primary Conversion CTA Button */}
                <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/customer/products"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2 group"
                  >
                    EXPLORE FRESH CATCH
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE — ANIMATED SINGLE FISH STAGE TRANSFORMATION */}
          <div className="lg:col-span-7 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, scale: 0.92, rotate: -1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.05, rotate: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative w-full max-w-xl aspect-[16/10] rounded-3xl overflow-hidden border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_60px_rgba(0,243,255,0.25)] flex items-center justify-center p-4"
              >
                
                {/* 🌊 STAGE 1: SHORE CATCH — Whole Fresh Ocean Fish */}
                {activeStageIdx === 0 && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={singleFishImage}
                      alt="Whole Ocean Catch"
                      className="w-full h-full object-cover rounded-2xl animate-breathing-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-cyan-500/10 pointer-events-none" />
                    {/* Water Droplets Ripple Badge */}
                    <div className="absolute top-4 right-4 bg-slate-900/90 border border-cyan-400/50 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md">
                      <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">FRESH DOCK LANDING</span>
                    </div>
                  </div>
                )}

                {/* 🔪 STAGE 2: FRESHLY SLICED — Animated Cut/Slicing Laser Lines */}
                {activeStageIdx === 1 && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={slicedFishImage}
                      alt="Freshly Sliced Fillet"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    {/* Animated Slicing Guide Overlay Lines */}
                    <motion.div
                      initial={{ opacity: 0, x: "-100%" }}
                      animate={{ opacity: [0, 1, 0], x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-y-0 w-2 bg-gradient-to-b from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] transform -rotate-12 pointer-events-none"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-amber-400/50 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md">
                      <Scissors className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">PRECISION CLEAN FILLETED</span>
                    </div>
                  </div>
                )}

                {/* 📦 STAGE 3: VACUUM SEALED — Vacuum Pack Frame & Air Extract Animation */}
                {activeStageIdx === 2 && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden border-4 border-blue-500/40 rounded-2xl bg-blue-950/30">
                    <img
                      src={slicedFishImage}
                      alt="Vacuum Sealed Seafood"
                      className="w-full h-full object-cover rounded-xl scale-95 opacity-90"
                    />
                    {/* Vacuum Pack Plastic Grid & Air Extraction Wave Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400 animate-pulse pointer-events-none" />
                    
                    <div className="absolute top-4 left-4 bg-blue-950/90 border border-blue-400 px-3.5 py-1 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">AIRTIGHT VACUUM PACKED</span>
                    </div>
                  </div>
                )}

                {/* ❄️ STAGE 4: COLD CHAIN — Ice Crystals & 0°C to 4°C Temperature Halo */}
                {activeStageIdx === 3 && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden border-4 border-emerald-500/40 rounded-2xl bg-emerald-950/40">
                    <img
                      src={slicedFishImage}
                      alt="Cold Chain Chilled"
                      className="w-full h-full object-cover rounded-xl scale-95 filter brightness-110 contrast-105"
                    />
                    {/* Frost / Ice Mist Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-cyan-950/30 to-transparent pointer-events-none" />
                    
                    {/* 0°C to 4°C Temperature Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-slate-950/90 border-2 border-emerald-400 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-3">
                        <ThermometerSnowflake className="w-7 h-7 text-emerald-400 animate-pulse" />
                        <div className="text-left">
                          <p className="text-sm font-black text-white uppercase tracking-wider">0°C TO 4°C</p>
                          <p className="text-[9px] font-bold text-emerald-400 uppercase">COLD CHAIN LOCKED</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🚚 STAGE 5: EXPRESS DELIVERY — Velocity Trail & Express Delivery Courier */}
                {activeStageIdx === 4 && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden border-4 border-purple-500/40 rounded-2xl bg-purple-950/40">
                    <img
                      src={slicedFishImage}
                      alt="Express Delivery"
                      className="w-full h-full object-cover rounded-xl scale-95"
                    />
                    {/* Fast Velocity Lines Overlay */}
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-1 bg-purple-400 shadow-[0_0_15px_#a855f7] pointer-events-none"
                    />
                    <div className="absolute bottom-4 right-4 bg-purple-950/90 border border-purple-400 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md">
                      <Truck className="w-4 h-4 text-purple-400 animate-bounce" />
                      <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">90 MIN EXPRESS DISPATCH</span>
                    </div>
                  </div>
                )}

                {/* 🚪 STAGE 6: DELIVERED TO DOOR — Home Doorstep Presentation */}
                {activeStageIdx === 5 && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden border-4 border-cyan-400/50 rounded-2xl bg-cyan-950/40">
                    <img
                      src={singleFishImage}
                      alt="Delivered Seafood"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-cyan-400/60 p-3 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-2xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs font-black uppercase text-white tracking-wider">FRESH SEAFOOD AT YOUR DOOR</span>
                      </div>
                      <Link href="/customer/products" className="px-3 py-1 bg-cyan-400 text-slate-950 text-[10px] font-black uppercase rounded-lg">
                        ORDER NOW
                      </Link>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </main>

        {/* FOOTER — TIMED PROGRESS FILL BAR & STEP NAVIGATION TABS */}
        <footer className="w-full space-y-3 pt-2 border-t border-white/10">
          
          {/* Animated Auto-Play Fill Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 via-amber-400 to-cyan-300 transition-all duration-100 ease-linear shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${((activeStageIdx + stageProgress / 100) / STAGES.length) * 100}%` }}
            />
          </div>

          {/* Interactive Step Ribbon Buttons (Minimal Text) */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {STAGES.map((stg, i) => (
              <button
                key={stg.id}
                onClick={() => handleStageSelect(i)}
                className={cn(
                  "flex-1 min-w-[95px] sm:min-w-[110px] py-2 px-2 rounded-xl text-[9.5px] md:text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5",
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
