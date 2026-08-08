"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Waves, 
  Anchor, 
  ShieldCheck, 
  Package, 
  Truck, 
  Home, 
  ChevronRight, 
  ArrowRight,
  Info,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ThermometerSnowflake,
  CheckCircle2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

// 🌊 6-STAGE SHORE TO DOOR STORYLINE STAGES (With REAL FISH Imagery & Auto-Play Engine)
const STAGES = [
  {
    id: "ocean",
    step: "01",
    label: "FROM THE OCEAN",
    sublabel: "Deep Oceanic Waters",
    title: "FROM THE OCEAN",
    highlight: "DEEP OCEANIC ORIGIN",
    description: "Immerse in pristine island marine waters. Sourced with sustainable fishing practices directly from pure ocean depths.",
    badge: "100% Wild Oceanic Catch",
    accentColor: "#00f3ff",
    fishImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85",
    icon: <Waves className="w-5 h-5 text-cyan-400" />
  },
  {
    id: "caught",
    step: "02",
    label: "FRESHLY CAUGHT",
    sublabel: "Port Blair Harbour Dock",
    title: "FRESHLY CAUGHT",
    highlight: "LANDED AT FIRST LIGHT",
    description: "Hand-picked by local master fishermen at dawn. Direct dock arrival with zero artificial chemical preservatives.",
    badge: "Port Blair Dock Landing",
    accentColor: "#f59e0b",
    fishImage: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=1200&q=85",
    icon: <Anchor className="w-5 h-5 text-amber-400" />
  },
  {
    id: "quality",
    step: "03",
    label: "CAREFULLY SELECTED",
    sublabel: "Cold-Chain Quality Inspection",
    title: "CAREFULLY SELECTED",
    highlight: "GRADE-A SEAFOOD VERIFIED",
    description: "Inspected for texture, aroma, and premium yield. Chilled on crystal ice at 0°C to 4°C to lock in original ocean flavor.",
    badge: "0°C - 4°C Chill Guaranteed",
    accentColor: "#10b981",
    fishImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=85",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
  },
  {
    id: "pack",
    step: "04",
    label: "SEALED FRESH",
    sublabel: "Vacuum-Sealed Packaging",
    title: "SEALED FRESH",
    highlight: "HERMETIC COLD-PACK SEAL",
    description: "Encapsulated in eco-insulated vacuum sealed packs to protect freshness, texture, and nutrition during transit.",
    badge: "Eco Vacuum Cold Pack",
    accentColor: "#3b82f6",
    fishImage: "https://images.unsplash.com/photo-1599084942896-675d72658aa0?auto=format&fit=crop&w=1200&q=85",
    icon: <Package className="w-5 h-5 text-blue-400" />
  },
  {
    id: "delivery",
    step: "05",
    label: "ON THE WAY",
    sublabel: "Express Cold Courier",
    title: "ON THE WAY",
    highlight: "EXPRESS DISPATCH EN ROUTE",
    description: "Tracked real-time from our local fulfillment harbor to your neighborhood with temperature-controlled delivery.",
    badge: "90 Min Express Dispatch",
    accentColor: "#a855f7",
    fishImage: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200&q=85",
    icon: <Truck className="w-5 h-5 text-purple-400" />
  },
  {
    id: "door",
    step: "06",
    label: "SHORE TO DOOR",
    sublabel: "Delivered to Your Table",
    title: "FROM SHORE TO DOOR",
    highlight: "FRESH SEAFOOD. DELIVERED FRESH.",
    description: "Discover fresh seafood from trusted sellers and have it delivered directly to your door.",
    badge: "Doorstep Fresh Delivery",
    accentColor: "#00d1ff",
    fishImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=85",
    icon: <Home className="w-5 h-5 text-cyan-400" />
  }
];

export function OceanExoticShoreToDoorHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stageProgress, setStageProgress] = useState(0);

  // ⏱️ AUTO-PLAY TIMER ENGINE (4.5 seconds per stage, continuous seamless loop)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) {
          setActiveStageIdx((current) => (current + 1) % STAGES.length);
          return 0;
        }
        return prev + 2.5; // Smooth incremental fill
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset stage progress when stage index manually changes
  const handleStageSelect = (idx: number) => {
    setActiveStageIdx(idx);
    setStageProgress(0);
  };

  // 🎨 WebGL/Canvas Atmospheric Water, Light Beams & Particles
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

    // Floating particles
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.6 - 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      isGold: Math.random() > 0.5
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Volumetric light beams from top
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

      // Bioluminescent underwater & gold dust particles
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
    <div className="relative w-full min-h-[580px] lg:min-h-[640px] bg-[#030712] text-white overflow-hidden select-none border-b border-cyan-500/20">
      {/* WebGL Canvas Background Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Deep Ocean Ambient Backdrop Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent z-10 pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto h-full min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-4 sm:p-6 lg:p-10">
        
        {/* TOP STATUS BAR — Auto-Play Controls & Live Brand Tag */}
        <header className="w-full flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-300">
              OCEANEXOTIC GLOBAL — SHORE TO DOOR
            </span>
          </div>

          {/* Auto-Play Toggle & Step Counters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 hover:border-cyan-400 text-xs font-black text-cyan-300 transition-all backdrop-blur-md"
              title={isPlaying ? "Pause Auto Story" : "Play Auto Story"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                {isPlaying ? "AUTO-PLAYING" : "PAUSED"}
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

        {/* MAIN DISPLAY GRID — Text Story (Left) + REAL FISH VISUAL ANCHOR (Right) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
          
          {/* LEFT COLUMN — Storyline Text & Dynamic CTAs */}
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 30, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Badge Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/15 bg-slate-900/90 backdrop-blur-md shadow-xl">
                  {currentStage.icon}
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-200">
                    {currentStage.badge}
                  </span>
                </div>

                {/* Stage Step + Title */}
                <div className="space-y-1">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
                    STAGE {currentStage.step} // {currentStage.sublabel}
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tight leading-none drop-shadow-2xl">
                    {currentStage.title.split(" ").map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className={cn(
                          "inline-block mr-2 md:mr-3",
                          wIdx === 0 ? "text-white" : "bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent"
                        )}
                      >
                        {word}
                      </span>
                    ))}
                  </h1>
                </div>

                {/* Highlight Headline */}
                <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-amber-300 italic">
                  {currentStage.highlight}
                </h2>

                {/* Description Body */}
                <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {currentStage.description}
                </p>

                {/* CTAs */}
                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/customer/products"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2 group"
                  >
                    EXPLORE FRESH CATCH
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="px-5 py-3.5 rounded-xl bg-slate-900/90 border border-white/20 hover:border-cyan-400/50 text-white font-black text-xs md:text-sm uppercase tracking-wider transition-all backdrop-blur-md flex items-center gap-2 hover:bg-slate-800"
                  >
                    HOW IT WORKS
                    <Info className="w-4 h-4 text-cyan-400" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN — REAL FISH PHOTOGRAPHY ANCHOR WITH CINEMATIC LIGHTING */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_50px_rgba(0,243,255,0.2)] group"
              >
                {/* Real Fish Image */}
                <img
                  src={currentStage.fishImage}
                  alt={currentStage.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Warm Golden + Deep Blue Dual Gradient Light Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-amber-500/10 pointer-events-none" />

                {/* Floating Telemetry Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                      {currentStage.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase text-white tracking-wider">{currentStage.label}</p>
                      <p className="text-[9px] font-bold text-amber-400">{currentStage.sublabel}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    REAL CATCH
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

        {/* BOTTOM TIMED PROGRESS BAR & STEP NAVIGATION RIBBON */}
        <footer className="w-full space-y-3 pt-2 border-t border-white/10">
          
          {/* Animated Auto-Play Progress Fill Line */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 transition-all duration-100 ease-linear shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${((activeStageIdx + stageProgress / 100) / STAGES.length) * 100}%` }}
            />
          </div>

          {/* Interactive Step Buttons */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {STAGES.map((stg, i) => (
              <button
                key={stg.id}
                onClick={() => handleStageSelect(i)}
                className={cn(
                  "flex-1 min-w-[110px] py-2 px-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5",
                  i === activeStageIdx
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.3)] scale-[1.02]"
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
