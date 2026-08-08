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
  Film,
  Sparkles,
  CheckCircle2,
  ShoppingCart
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

interface OceanExoticShoreToDoorHeroProps {
  heroItems?: Hero3DFishItem[];
}

// 🎬 6 STAGES OF THE CONTINUOUS SINGLE-FRAME PROCESS VIDEO (Bloom/Apple Style)
const DEFAULT_STAGES = [
  {
    id: "catch",
    step: "01",
    label: "SHORE CATCH",
    title: "SHORE CATCH",
    badge: "100% Ocean Wild Catch",
    statusText: "Landed at Port Blair Harbour Dock",
    startTime: 0,
    endTime: 3,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-ocean-waves-42864-large.mp4",
    imageUrl: "/images/hero/hero_shore_catch.jpg",
    icon: <Waves className="w-5 h-5 text-cyan-400" />
  },
  {
    id: "slice",
    step: "02",
    label: "PRECISION SLICED",
    title: "PRECISION SLICED",
    badge: "Master Fillet & Fry Cuts",
    statusText: "Laser Sliced Fresh Steaks & Fry Cut",
    startTime: 3,
    endTime: 6,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cutting-fresh-fish-on-a-wooden-board-43187-large.mp4",
    imageUrl: "/images/hero/hero_freshly_sliced.jpg",
    icon: <Scissors className="w-5 h-5 text-amber-400" />
  },
  {
    id: "vacuum",
    step: "03",
    label: "VACUUM SEALED",
    title: "VACUUM SEALED",
    badge: "Airtight Eco Lock",
    statusText: "Hermetic Freshness Encapsulation",
    startTime: 6,
    endTime: 9,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-water-bubbles-in-a-blue-background-42907-large.mp4",
    imageUrl: "/images/hero/hero_vacuum_sealed.jpg",
    icon: <Package className="w-5 h-5 text-blue-400" />
  },
  {
    id: "coldchain",
    step: "04",
    label: "COLD CHAIN (0-4°C)",
    title: "COLD CHAIN MAINTAINED",
    badge: "0°C - 4°C Ice Lock",
    statusText: "Constant Chilled Preservation",
    startTime: 9,
    endTime: 12,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-ice-cubes-falling-into-water-42921-large.mp4",
    imageUrl: "/images/hero/hero_cold_chain.jpg",
    icon: <ThermometerSnowflake className="w-5 h-5 text-emerald-400" />
  },
  {
    id: "delivery",
    step: "05",
    label: "EXPRESS DISPATCH",
    title: "EXPRESS DISPATCH",
    badge: "90 Min Delivery Route",
    statusText: "Cold Courier Velocity En Route",
    startTime: 12,
    endTime: 15,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-driving-down-a-city-street-at-night-41544-large.mp4",
    imageUrl: "/images/hero/hero_express_delivery.jpg",
    icon: <Truck className="w-5 h-5 text-purple-400" />
  },
  {
    id: "door",
    step: "06",
    label: "DELIVERED TO DOOR",
    title: "DELIVERED TO YOUR DOOR",
    badge: "Shore to Door Complete",
    statusText: "Fresh Seafood Delivered Fresh",
    startTime: 15,
    endTime: 18,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-serving-a-plate-of-delicious-food-43285-large.mp4",
    imageUrl: "/images/hero/hero_delivered_door.jpg",
    icon: <Home className="w-5 h-5 text-cyan-400" />
  }
];

export function OceanExoticShoreToDoorHero({ heroItems }: OceanExoticShoreToDoorHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const TOTAL_DURATION = 18;

  // Active Fish item configured in Admin Theme 3D HERO STAGE CONTROL (Slot 1 / Slot 2 / Slot 3)
  const activeAdminFish = heroItems && heroItems.length > 0 ? heroItems[0] : null;

  // Video Timeupdate Event Listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime % TOTAL_DURATION;
    setCurrentTime(time);

    const newStageIdx = DEFAULT_STAGES.findIndex(
      (s) => time >= s.startTime && time < s.endTime
    );
    if (newStageIdx !== -1 && newStageIdx !== activeStageIdx) {
      setActiveStageIdx(newStageIdx);
    }
  };

  const handleStageSelect = (idx: number) => {
    setActiveStageIdx(idx);
    const video = videoRef.current;
    if (video) {
      video.currentTime = DEFAULT_STAGES[idx].startTime;
      setCurrentTime(DEFAULT_STAGES[idx].startTime);
    }
  };

  // Toggle Video Play / Pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // 🎨 WebGL/Canvas Particle & Caustics Overlay Renderer (60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 560);

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

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const currentStage = DEFAULT_STAGES[activeStageIdx];

  return (
    <div className="relative w-full min-h-[580px] lg:min-h-[640px] bg-[#030712] text-white overflow-hidden select-none border-b border-cyan-500/20">
      
      {/* 🎥 CONTINUOUS SINGLE-FRAME BACKGROUND VIDEO SCRUBBER STREAM */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          ref={videoRef}
          src={currentStage.videoUrl}
          className="w-full h-full object-cover opacity-50 scale-105 filter brightness-110 contrast-105"
          playsInline
          muted
          autoPlay
          loop
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* WebGL Canvas Particle & Lighting Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Ambient Dark Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/75 to-transparent z-15 pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto h-full min-h-[580px] lg:min-h-[640px] flex flex-col justify-between p-4 sm:p-6 lg:p-10">
        
        {/* HEADER BAR — Single-Frame Video Status & Auto Controls */}
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              OCEANEXOTIC — SINGLE-FRAME PROCESS VIDEO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 hover:border-cyan-400 text-xs font-black text-cyan-300 transition-all backdrop-blur-md"
              title={isPlaying ? "Pause Process Video" : "Play Process Video"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                {isPlaying ? "LIVE 60FPS VIDEO" : "PAUSED"}
              </span>
            </button>

            <button
              onClick={() => handleStageSelect(0)}
              className="p-1.5 rounded-full bg-slate-900/90 border border-white/20 hover:border-cyan-400 text-slate-300 transition-all"
              title="Restart Video Journey"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* MAIN DISPLAY STAGE — Minimal Stage Headlines (Left) + Single-Frame Process Video Anchor (Right) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
          
          {/* LEFT COLUMN — Stage Headlines & Conversion CTAs */}
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
                    {activeAdminFish ? `${activeAdminFish.name} // ${currentStage.badge}` : currentStage.badge}
                  </span>
                </div>

                {/* Stage Headline */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                    STAGE {currentStage.step} // {currentStage.statusText}
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tight leading-none text-white drop-shadow-2xl">
                    {currentStage.title}
                  </h1>
                </div>

                {/* Optional Admin Price Tag if configured */}
                {activeAdminFish?.price && (
                  <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
                    <span className="text-xl md:text-2xl font-black text-amber-400">{activeAdminFish.price}</span>
                    {activeAdminFish.unit && (
                      <span className="text-xs text-slate-400 font-bold uppercase">/ {activeAdminFish.unit}</span>
                    )}
                  </div>
                )}

                {/* Primary Conversion CTA */}
                <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
                  <Link
                    href={activeAdminFish?.productId ? `/customer/products/${activeAdminFish.productId}` : "/customer/products"}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2 group"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    EXPLORE FRESH CATCH
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN — SINGLE-FRAME 60FPS PROCESS VIDEO VIEWPORT */}
          <div className="lg:col-span-7 flex items-center justify-center relative z-20">
            <div className="relative w-full max-w-lg aspect-[16/10] rounded-3xl overflow-hidden border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_60px_rgba(0,243,255,0.25)] flex items-center justify-center p-2 group">
              
              {/* Single Frame Live Stage Process Video Stream */}
              <video
                src={currentStage.videoUrl}
                className="w-full h-full object-cover rounded-2xl"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Laser Slice Overlay on Stage 2 */}
              {activeStageIdx === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: "-100%" }}
                  animate={{ opacity: [0, 1, 0], x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-2 bg-gradient-to-b from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] transform -rotate-12 pointer-events-none"
                />
              )}

              {/* Telemetry Badge Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 border border-white/20 p-3 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-2">
                  {currentStage.icon}
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    {activeAdminFish ? activeAdminFish.name : currentStage.label}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  SINGLE-FRAME VIDEO
                </span>
              </div>
            </div>
          </div>

        </main>

        {/* FOOTER — TIMED VIDEO PROGRESS BAR & STAGE RIBBON BUTTONS */}
        <footer className="w-full space-y-3 pt-2 border-t border-white/10">
          
          {/* Continuous Video Timeline Progress Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 via-amber-400 to-cyan-300 transition-all duration-100 ease-linear shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
            />
          </div>

          {/* Interactive Step Ribbon Buttons */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            {DEFAULT_STAGES.map((stg, i) => (
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
