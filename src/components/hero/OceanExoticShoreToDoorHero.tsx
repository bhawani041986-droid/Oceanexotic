"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  Zap,
  Star,
  Fish,
  Snowflake,
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

// ─────────────────────────────────────────────────────────────────────────────
// STAGE DEFINITIONS — Each stage has layered images for depth stacking
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STAGES = [
  {
    id: "catch",
    step: "01",
    label: "SHORE CATCH",
    title: "SHORE CATCH",
    badge: "Wild Red Snapper — Ocean Fresh",
    statusText: "Pristine Island Dock Landing",
    accentColor: "#00f3ff",
    accentRgb: "0,243,255",
    bgGlow: "from-cyan-950/60 via-slate-950 to-slate-950",
    // Main hero image — basket of red fish
    mainImage: "/images/hero/red_fish_basket_transparent.png",
    // Secondary floating pieces
    floatPieces: [] as string[],
    particles: "bubbles",
    icon: <Waves className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400" />,
    copyline: "Straight from the sea. Every fish handpicked at the dock.",
  },
  {
    id: "slice",
    step: "02",
    label: "PRECISION SLICED",
    title: "PRECISION SLICED",
    badge: "Kingfish / Surmai — Expert Cuts",
    statusText: "Laser Precision Deconstruction",
    accentColor: "#f59e0b",
    accentRgb: "245,158,11",
    bgGlow: "from-amber-950/60 via-slate-950 to-slate-950",
    // Main = sliced steaks, secondary pieces fly around
    mainImage: "/images/hero/cut_sliced_steaks.png",
    floatPieces: [
      "/images/hero/cut_deboned_skeleton.png",
      "/images/hero/cut_fish_head.png",
      "/images/hero/cut_crosssection.png",
    ],
    particles: "sparks",
    icon: <Scissors className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400" />,
    copyline: "Precision cuts by expert fish mongers. Steaks, fillets, fry cuts.",
  },
  {
    id: "vacuum",
    step: "03",
    label: "VACUUM SEALED",
    title: "VACUUM SEALED",
    badge: "White Pomfret — Airtight Pack",
    statusText: "Hermetic Freshness Locked",
    accentColor: "#3b82f6",
    accentRgb: "59,130,246",
    bgGlow: "from-blue-950/60 via-slate-950 to-slate-950",
    mainImage: "/images/hero/pomfret_ice_transparent.png",
    floatPieces: [] as string[],
    particles: "frost",
    icon: <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400" />,
    copyline: "Vacuum sealed to lock freshness — extends shelf life by 5x.",
  },
  {
    id: "coldchain",
    step: "04",
    label: "COLD CHAIN 0–4°C",
    title: "COLD CHAIN LOCK",
    badge: "Tiger Prawns — Cryo Preserved",
    statusText: "Continuous Chilled Preservation",
    accentColor: "#10b981",
    accentRgb: "16,185,129",
    bgGlow: "from-emerald-950/60 via-slate-950 to-slate-950",
    // Main = 3-prawn cluster (premium cutout), plate as secondary
    mainImage: "/images/hero/prawns_3cluster_transparent.png",
    floatPieces: ["/images/hero/prawns_plate_transparent.png"],
    particles: "ice",
    icon: <ThermometerSnowflake className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-400" />,
    copyline: "Maintained at 0–4°C from catch to your kitchen door.",
  },
  {
    id: "delivery",
    step: "05",
    label: "EXPRESS DISPATCH",
    title: "EXPRESS DISPATCH",
    badge: "Fresh Mackerel — 90 Min Route",
    statusText: "Cold Courier Velocity Tunnel",
    accentColor: "#a855f7",
    accentRgb: "168,85,247",
    bgGlow: "from-purple-950/60 via-slate-950 to-slate-950",
    mainImage: "/images/hero/user_mackerel_transparent.png",
    floatPieces: [] as string[],
    particles: "speed",
    icon: <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-400" />,
    copyline: "Same-day express delivery. Fresh fish in under 90 minutes.",
  },
  {
    id: "door",
    step: "06",
    label: "DELIVERED TO DOOR",
    title: "AT YOUR DOOR",
    badge: "Gourmet Ready — Chef Quality",
    statusText: "Premium Home Delivery",
    accentColor: "#00d1ff",
    accentRgb: "0,209,255",
    bgGlow: "from-teal-950/60 via-slate-950 to-slate-950",
    mainImage: "/images/hero/pomfret_ice_transparent.png",
    floatPieces: ["/images/hero/prawns_3cluster_transparent.png"],
    particles: "stars",
    icon: <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400" />,
    copyline: "From ocean to your table — fresh seafood delivered today.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE CONFIGS per stage
// ─────────────────────────────────────────────────────────────────────────────
const STAGE_PARTICLES: Record<string, { emoji: string; count: number; color: string; floatRange: number }> = {
  bubbles: { emoji: "💧", count: 6, color: "rgba(0,243,255,0.4)", floatRange: 50 },
  sparks:  { emoji: "✨", count: 5, color: "rgba(245,158,11,0.6)", floatRange: 40 },
  frost:   { emoji: "❄️", count: 6, color: "rgba(59,130,246,0.5)", floatRange: 35 },
  ice:     { emoji: "🧊", count: 5, color: "rgba(16,185,129,0.4)", floatRange: 45 },
  speed:   { emoji: "⚡", count: 4, color: "rgba(168,85,247,0.5)", floatRange: 30 },
  stars:   { emoji: "⭐", count: 5, color: "rgba(0,209,255,0.4)", floatRange: 40 },
};

const PARTICLE_POSITIONS = [
  { left: "8%",  top: "15%" },
  { left: "85%", top: "20%" },
  { left: "12%", top: "72%" },
  { left: "78%", top: "68%" },
  { left: "50%", top: "8%"  },
  { left: "45%", top: "85%" },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function OceanExoticShoreToDoorHero({ heroItems, hero3dStages }: OceanExoticShoreToDoorHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // ── Mouse spring physics for 3D tilt ──────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  // Derived 3D rotations — layer-specific amplitudes for parallax depth
  const tiltMainX  = useTransform(springY, [-1, 1], [12, -12]);
  const tiltMainY  = useTransform(springX, [-1, 1], [-12, 12]);
  const tiltFar1X  = useTransform(springY, [-1, 1], [6, -6]);
  const tiltFar1Y  = useTransform(springX, [-1, 1], [-6, 6]);
  const tiltNear1X = useTransform(springY, [-1, 1], [20, -20]);
  const tiltNear1Y = useTransform(springX, [-1, 1], [-20, 20]);
  const tiltNear2X = useTransform(springY, [-1, 1], [28, -28]);
  const tiltNear2Y = useTransform(springX, [-1, 1], [-28, 28]);

  const activeAdminFish = heroItems && heroItems.length > 0 ? heroItems[0] : null;

  const STAGES = DEFAULT_STAGES.map((stg, i) => {
    const customStage = hero3dStages && hero3dStages[i];
    return {
      ...stg,
      title:      customStage?.title      || stg.title,
      badge:      customStage?.badge      || stg.badge,
      statusText: customStage?.statusText || stg.statusText,
      mainImage:  customStage?.imageUrl   || stg.mainImage,
    };
  });

  // ── Auto-play timeline ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStageIdx((cur) => (cur + 1) % STAGES.length);
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

  // ── Mouse tracking ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    mouseX.set((e.clientX - cx) / (rect.width  / 2));
    mouseY.set((e.clientY - cy) / (rect.height / 2));
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // ── Canvas: Volumetric rays + bioluminescent particles ───────────────────
  const mouseCanvasRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const unsub1 = springX.on("change", (v) => { mouseCanvasRef.current.x = v; });
    const unsub2 = springY.on("change", (v) => { mouseCanvasRef.current.y = v; });
    return () => { unsub1(); unsub2(); };
  }, [springX, springY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let w = (canvas.width  = canvas.parentElement?.clientWidth  || 800);
    let h = (canvas.height = canvas.parentElement?.clientHeight || 600);
    const handleResize = () => {
      if (!canvas?.parentElement) return;
      w = canvas.width  = canvas.parentElement.clientWidth;
      h = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 160 }, () => ({
      x:      Math.random() * w,
      y:      Math.random() * h,
      size:   Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -(Math.random() * 0.5 + 0.15),
      opacity: Math.random() * 0.6 + 0.2,
      cyan:   Math.random() > 0.35,
    }));

    let t = 0;
    const render = () => {
      t += 0.016;
      const mx = mouseCanvasRef.current.x;
      const my = mouseCanvasRef.current.y;
      ctx.clearRect(0, 0, w, h);

      // Volumetric light rays
      for (let i = 0; i < 6; i++) {
        const bx = (w / 6) * i + Math.sin(t + i * 1.2) * 40 + mx * 30;
        const grad = ctx.createLinearGradient(bx, 0, bx + 80, h);
        grad.addColorStop(0,   "rgba(0,243,255,0.07)");
        grad.addColorStop(0.4, "rgba(245,158,11,0.03)");
        grad.addColorStop(1,   "rgba(3,7,18,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bx - 30,  0);
        ctx.lineTo(bx + 80,  0);
        ctx.lineTo(bx + 200, h);
        ctx.lineTo(bx - 120, h);
        ctx.closePath();
        ctx.fill();
      }

      // Bioluminescent particles
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(t * 0.8 + p.y * 0.01) * 0.2 + mx * 0.5;
        p.y += p.speedY + my * 0.4;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? `rgba(0,243,255,${p.opacity})`
          : `rgba(245,158,11,${p.opacity})`;
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

  const currentStage  = STAGES[activeStageIdx];
  const particleCfg   = STAGE_PARTICLES[currentStage.particles] || STAGE_PARTICLES.bubbles;

  // ─── Float piece animation variants ───────────────────────────────────────
  const floatPieceVariants = (idx: number) => ({
    initial:  { opacity: 0, scale: 0.5, x: 0, y: 0 },
    animate:  {
      opacity: [0, 0.85, 0.85, 0],
      scale:   [0.5, 1, 1, 0.8],
      x:       [0, (idx % 2 === 0 ? -1 : 1) * (30 + idx * 10), (idx % 2 === 0 ? -1 : 1) * (50 + idx * 15)],
      y:       [0, -(20 + idx * 12), -(40 + idx * 20)],
      rotate:  [0, (idx % 2 === 0 ? -1 : 1) * 15, (idx % 2 === 0 ? -1 : 1) * 25],
    },
    transition: { duration: 4 + idx * 0.8, repeat: Infinity, ease: "easeInOut", delay: idx * 0.6 },
  });

  return (
    <div
      className="relative w-full bg-[#030712] text-white overflow-hidden select-none border-b border-cyan-500/20 py-3 sm:py-6 lg:py-8 min-h-[440px] sm:min-h-[540px] lg:min-h-[620px] flex flex-col justify-between"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── BACKGROUND CANVAS ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* ── STAGE-SPECIFIC AMBIENT GLOW ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage.id + "_glow"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={cn("absolute inset-0 pointer-events-none z-[11] bg-gradient-to-br", currentStage.bgGlow)}
        />
      </AnimatePresence>

      {/* ── VIGNETTE ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/60 to-transparent z-[12] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 via-transparent to-transparent z-[12] pointer-events-none" />

      {/* ─────────────────── CONTENT WRAPPER ─────────────────── */}
      <div className="relative z-20 max-w-7xl mx-auto w-full h-full flex flex-col justify-between px-3 sm:px-6 lg:px-10">

        {/* ── HEADER BAR ── */}
        <header className="w-full flex items-center justify-between gap-2 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg min-w-0 truncate">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"
            />
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1 truncate">
              <Box className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="inline sm:hidden">OCEANEXOTIC // 3D</span>
              <span className="hidden sm:inline">OCEANEXOTIC — SHORE TO DOOR 3D ENGINE</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/95 border border-white/20 hover:border-cyan-400 text-[9px] sm:text-xs font-black text-cyan-300 transition-all backdrop-blur-md"
            >
              {isPlaying
                ? <Pause className="w-3 h-3" />
                : <Play  className="w-3 h-3 fill-current" />
              }
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                {isPlaying ? "AUTO" : "PAUSED"}
              </span>
            </button>
            <button
              onClick={() => handleStageSelect(0)}
              className="p-1 sm:p-1.5 rounded-full bg-slate-900/95 border border-white/20 hover:border-cyan-400 text-slate-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ── MAIN STAGE ── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center my-auto py-1 sm:py-4">

          {/* LEFT — Text content */}
          <div className="lg:col-span-5 space-y-1.5 sm:space-y-4 text-center lg:text-left z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id + "_text"}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                exit={{   opacity: 0, y: -14, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-2 sm:space-y-4"
              >
                {/* Step badge */}
                <motion.div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border backdrop-blur-md shadow-lg"
                  style={{
                    borderColor: `rgba(${currentStage.accentRgb},0.4)`,
                    background:  `rgba(${currentStage.accentRgb},0.08)`,
                  }}
                >
                  {currentStage.icon}
                  <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-slate-200">
                    {currentStage.badge}
                  </span>
                </motion.div>

                {/* Stage headline */}
                <div className="space-y-0.5 sm:space-y-1">
                  <span
                    className="text-[9.5px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.25em]"
                    style={{ color: currentStage.accentColor }}
                  >
                    STAGE {currentStage.step} // {currentStage.statusText}
                  </span>
                  <h1 className="text-xl sm:text-4xl lg:text-6xl font-black uppercase italic tracking-tight leading-tight text-white drop-shadow-xl">
                    {currentStage.title}
                  </h1>
                  <p className="text-[10px] sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto lg:mx-0">
                    {currentStage.copyline}
                  </p>
                </div>

                {/* Price tag */}
                {activeAdminFish?.price && (
                  <div className="flex items-center justify-center lg:justify-start gap-1.5">
                    <span className="text-base sm:text-2xl font-black text-amber-400">{activeAdminFish.price}</span>
                    {activeAdminFish.unit && (
                      <span className="text-[9.5px] sm:text-xs text-slate-400 font-bold uppercase">/ {activeAdminFish.unit}</span>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="pt-1 sm:pt-2 flex items-center justify-center lg:justify-start">
                  <Link
                    href={activeAdminFish?.productId ? `/customer/products/${activeAdminFish.productId}` : "/customer/products"}
                    className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-slate-950 font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group shadow-2xl"
                    style={{
                      background:  `linear-gradient(135deg, ${currentStage.accentColor}, #f59e0b)`,
                      boxShadow:   `0 0 25px rgba(${currentStage.accentRgb},0.5)`,
                    }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    EXPLORE FRESH CATCH
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — 3D Parallax Viewport */}
          <div
            ref={viewportRef}
            className="lg:col-span-7 flex items-center justify-center relative z-20"
            style={{ perspective: "900px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id + "_card"}
                initial={{ opacity: 0, scale: 0.82, rotateY: -18, y: 24 }}
                animate={{ opacity: 1, scale: 1,    rotateY: 0,   y: 0  }}
                exit={{   opacity: 0, scale: 1.08,  rotateY: 18,  y: -24 }}
                transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-lg"
                style={{
                  aspectRatio: "16/10",
                  transformStyle: "preserve-3d",
                }}
              >

                {/* ── LAYER 0: Stage-coloured ambient sphere glow (background depth) ── */}
                <motion.div
                  animate={{
                    scale:   [0.85, 1.05, 0.85],
                    opacity: [0.25, 0.55, 0.25],
                  }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 55% 55%, rgba(${currentStage.accentRgb},0.25) 0%, transparent 70%)`,
                    transform: "translateZ(-60px)",
                  }}
                />

                {/* ── LAYER 1: Ground shadow ellipse (contact shadow) ── */}
                <motion.div
                  animate={{ scaleX: [0.85, 1.05, 0.85], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-6 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background: `rgba(${currentStage.accentRgb},0.5)`,
                    transform:  "translateX(-50%) translateZ(-30px)",
                  }}
                />

                {/* ── LAYER 2: Main product image — parallax depth layer ── */}
                <motion.div
                  style={{
                    rotateX:       tiltMainX,
                    rotateY:       tiltMainY,
                    transformStyle: "preserve-3d",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.img
                    key={currentStage.mainImage}
                    src={currentStage.mainImage}
                    alt={currentStage.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale:   [1, 1.025, 1],
                      y:       [-6, 6, -6],
                    }}
                    transition={{
                      opacity:  { duration: 0.4 },
                      scale:    { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                      y:        { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="max-w-[88%] max-h-[88%] w-auto h-auto object-contain pointer-events-none"
                    style={{
                      filter:    `drop-shadow(0 20px 50px rgba(${currentStage.accentRgb},0.5)) drop-shadow(0 5px 15px rgba(0,0,0,0.6))`,
                      transform: "translateZ(40px)",
                    }}
                  />
                </motion.div>

                {/* ── LAYER 3: Far floating piece (low parallax) ── */}
                {currentStage.floatPieces[0] && (
                  <motion.div
                    style={{
                      rotateX:        tiltFar1X,
                      rotateY:        tiltFar1Y,
                      transformStyle: "preserve-3d",
                    }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <motion.img
                      key={currentStage.floatPieces[0]}
                      src={currentStage.floatPieces[0]}
                      alt="float-1"
                      animate={{
                        x:       [0, 22, 0],
                        y:       [-18, -40, -18],
                        rotate:  [0, 12, 0],
                        opacity: [0.7, 0.95, 0.7],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-28 sm:w-40 h-auto object-contain"
                      style={{
                        filter:    `drop-shadow(0 12px_28px rgba(${currentStage.accentRgb},0.55))`,
                        transform: "translateZ(80px)",
                      }}
                    />
                  </motion.div>
                )}

                {/* ── LAYER 4: Near floating piece (high parallax) ── */}
                {currentStage.floatPieces[1] && (
                  <motion.div
                    style={{
                      rotateX:        tiltNear1X,
                      rotateY:        tiltNear1Y,
                      transformStyle: "preserve-3d",
                    }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <motion.img
                      key={currentStage.floatPieces[1]}
                      src={currentStage.floatPieces[1]}
                      alt="float-2"
                      animate={{
                        x:       [0, -20, 0],
                        y:       [10, 30, 10],
                        rotate:  [0, -15, 0],
                        opacity: [0.65, 0.9, 0.65],
                      }}
                      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-24 sm:w-36 h-auto object-contain"
                      style={{
                        filter:    `drop-shadow(0 12px 28px rgba(${currentStage.accentRgb},0.55))`,
                        transform: "translateZ(100px)",
                      }}
                    />
                  </motion.div>
                )}

                {/* ── LAYER 5: 3rd float piece (deepest parallax) ── */}
                {currentStage.floatPieces[2] && (
                  <motion.div
                    style={{
                      rotateX:        tiltNear2X,
                      rotateY:        tiltNear2Y,
                      transformStyle: "preserve-3d",
                    }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <motion.img
                      key={currentStage.floatPieces[2]}
                      src={currentStage.floatPieces[2]}
                      alt="float-3"
                      animate={{
                        x:       [8, -8, 8],
                        y:       [0, 18, 0],
                        rotate:  [5, -8, 5],
                        opacity: [0.6, 0.85, 0.6],
                      }}
                      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                      className="absolute top-1/2 -translate-y-1/2 -right-8 sm:-right-12 w-20 sm:w-32 h-auto object-contain"
                      style={{
                        filter:    `drop-shadow(0 8px 20px rgba(${currentStage.accentRgb},0.4))`,
                        transform: "translateZ(120px)",
                      }}
                    />
                  </motion.div>
                )}

                {/* ── LAYER 6: Stage-specific particle emojis ── */}
                <AnimatePresence>
                  {PARTICLE_POSITIONS.slice(0, particleCfg.count).map((pos, i) => (
                    <motion.div
                      key={currentStage.id + "_particle_" + i}
                      className="absolute text-base sm:text-2xl pointer-events-none z-30"
                      style={{ left: pos.left, top: pos.top, transform: "translateZ(60px)" }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 0.9, 0.9, 0],
                        scale:   [0.5, 1.1, 1, 0.8],
                        y:       [0, -(particleCfg.floatRange + i * 8), -(particleCfg.floatRange * 1.5 + i * 12)],
                        x:       [0, (i % 2 === 0 ? -1 : 1) * (i * 5 + 6), (i % 2 === 0 ? -1 : 1) * (i * 8 + 10)],
                        rotate:  [0, (i % 2 === 0 ? 1 : -1) * 20, (i % 2 === 0 ? 1 : -1) * 35],
                      }}
                      transition={{
                        duration:   3.2 + i * 0.4,
                        repeat:     Infinity,
                        ease:       "easeInOut",
                        delay:      i * 0.5,
                        repeatType: "loop",
                      }}
                    >
                      {particleCfg.emoji}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* ── STAGE-SPECIFIC FX OVERLAYS ── */}

                {/* Stage 2: Laser slice line */}
                {activeStageIdx === 1 && (
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1.5 pointer-events-none z-40"
                    style={{
                      background: "linear-gradient(to bottom, transparent, #f59e0b, transparent)",
                      boxShadow:  "0 0 30px #f59e0b, 0 0 60px rgba(245,158,11,0.4)",
                    }}
                    initial={{ x: "-5%", opacity: 0 }}
                    animate={{ x: ["0%", "120%", "120%", "0%"], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Stage 3: Glassmorphic vacuum shrink-wrap pulse */}
                {activeStageIdx === 2 && (
                  <motion.div
                    className="absolute inset-2 rounded-3xl border-2 border-blue-400/80 pointer-events-none z-35"
                    style={{ boxShadow: "0 0 40px rgba(59,130,246,0.5), inset 0 0 30px rgba(59,130,246,0.15)" }}
                    animate={{
                      opacity:  [0.4, 0.9, 0.4],
                      scale:    [1, 1.02, 1],
                      borderColor: ["rgba(59,130,246,0.5)", "rgba(59,130,246,1)", "rgba(59,130,246,0.5)"],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Stage 4: Cryo frost overlay */}
                {activeStageIdx === 3 && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none z-35"
                    style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Stage 5: Speed line tunnel */}
                {activeStageIdx === 4 && (
                  <>
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-35"
                      style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)" }}
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                    {[{ top: "25%", delay: 0 }, { top: "50%", delay: 0.28 }, { top: "72%", delay: 0.14 }].map((l, i) => (
                      <motion.div
                        key={i}
                        className="absolute left-0 right-0 h-[1.5px] pointer-events-none z-36"
                        style={{
                          top:        l.top,
                          background: "linear-gradient(to right, transparent, #a855f7, transparent)",
                          boxShadow:  "0 0 10px #a855f7",
                        }}
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "200%",  opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.1, delay: l.delay, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}
                  </>
                )}

                {/* ── TELEMETRY PILL (bottom) ── */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 bg-slate-950/90 border border-white/15 px-2.5 py-1.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between backdrop-blur-md shadow-2xl z-40">
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                    {currentStage.icon}
                    <span className="text-[9.5px] sm:text-xs font-black uppercase text-white tracking-wider truncate">
                      {currentStage.label}
                    </span>
                  </div>
                  <motion.span
                    animate={{ boxShadow: [`0 0 8px rgba(${currentStage.accentRgb},0.4)`, `0 0 18px rgba(${currentStage.accentRgb},0.9)`, `0 0 8px rgba(${currentStage.accentRgb},0.4)`] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[8px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1 shrink-0"
                    style={{
                      background:  `rgba(${currentStage.accentRgb},0.15)`,
                      color:       currentStage.accentColor,
                      border:      `1px solid rgba(${currentStage.accentRgb},0.5)`,
                    }}
                  >
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    3D LIVE
                  </motion.span>
                </div>

                {/* Stage 4 cryo badge */}
                {activeStageIdx === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 pointer-events-none z-40"
                  >
                    <div className="bg-slate-950/95 border border-emerald-400/80 px-2 py-1 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-1.5 backdrop-blur-md">
                      <ThermometerSnowflake className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-400 animate-bounce" />
                      <div className="text-left">
                        <p className="text-[8.5px] sm:text-xs font-black text-white uppercase tracking-wider">0°C – 4°C</p>
                        <p className="text-[7.5px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-widest hidden sm:block">CRYO LOCKED</p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ── FOOTER: Progress bar + stage ribbon ── */}
        <footer className="w-full space-y-1.5 sm:space-y-3 pt-1 sm:pt-2 border-t border-white/10">

          {/* Continuous progress bar */}
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div
              className="h-full rounded-full"
              style={{
                width:      `${progress}%`,
                background: `linear-gradient(to right, ${currentStage.accentColor}, #f59e0b)`,
                boxShadow:  `0 0 10px rgba(${currentStage.accentRgb},0.7)`,
              }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Stage pill ribbon */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {STAGES.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(idx)}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border transition-all whitespace-nowrap text-[8.5px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 backdrop-blur-md",
                  idx === activeStageIdx
                    ? "bg-white/10 border-white/40 text-white"
                    : "bg-slate-900/80 border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 transition-all",
                    idx === activeStageIdx ? "animate-pulse" : "opacity-50"
                  )}
                  style={{ background: idx === activeStageIdx ? stage.accentColor : "#475569" }}
                />
                <span className="hidden xs:inline">{stage.step}</span>
                <span>{stage.label}</span>
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
