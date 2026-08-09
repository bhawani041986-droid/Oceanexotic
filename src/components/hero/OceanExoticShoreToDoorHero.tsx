"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Waves, Scissors, Package, ThermometerSnowflake, Truck, Home,
  ArrowRight, Play, Pause, ShoppingCart, Zap, ChevronDown,
  Box, Star, Fish
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

// ─── Videos ──────────────────────────────────────────────────────────────────
const HERO_VIDEOS = [
  "/videos/7020525_Market_Iced_1280x720.mp4",
  "/videos/7020535_Market_Iced_1280x720.mp4",
  "/videos/6914536_Motion_Graphics_Motion_Graphic_1280x720.mp4",
];

// ─── Journey stages (bottom pill nav) ────────────────────────────────────────
const STAGES = [
  { id: "catch",     step: "01", label: "SHORE CATCH",     icon: <Waves            className="w-3 h-3" />, color: "#00f3ff" },
  { id: "slice",     step: "02", label: "PRECISION CUT",   icon: <Scissors         className="w-3 h-3" />, color: "#f59e0b" },
  { id: "vacuum",    step: "03", label: "VACUUM SEALED",   icon: <Package          className="w-3 h-3" />, color: "#3b82f6" },
  { id: "coldchain", step: "04", label: "COLD CHAIN",      icon: <ThermometerSnowflake className="w-3 h-3" />, color: "#10b981" },
  { id: "delivery",  step: "05", label: "EXPRESS DOOR",    icon: <Truck            className="w-3 h-3" />, color: "#a855f7" },
];

// ─── Floating stat cards ──────────────────────────────────────────────────────
const STATS = [
  { value: "500+",  label: "Species",    icon: "🐟" },
  { value: "90min", label: "Delivery",   icon: "⚡" },
  { value: "0°C",   label: "Cold Chain", icon: "❄️" },
];

export function OceanExoticShoreToDoorHero({ heroItems, hero3dStages }: OceanExoticShoreToDoorHeroProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [videoIdx,    setVideoIdx]    = useState(0);
  const [videoReady,  setVideoReady]  = useState(false);
  const [isPlaying,   setIsPlaying]   = useState(true);
  const [activeStage, setActiveStage] = useState(0);
  const [textPhase,   setTextPhase]   = useState(0); // cycles headline text

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const activeAdminFish = heroItems && heroItems.length > 0 ? heroItems[0] : null;

  // ── Headline text cycles ───────────────────────────────────────────────────
  const HEADLINES = [
    { top: "OCEAN",   bottom: "EXOTIC",   sub: "Shore-to-door premium seafood" },
    { top: "FRESH",   bottom: "DAILY",    sub: "Handpicked at sunrise, delivered by noon" },
    { top: "WILD",    bottom: "CAUGHT",   sub: "100% ocean wild. Zero compromise." },
    { top: "ICED &",  bottom: "ALIVE",    sub: "Maintained at 0–4°C, every single step" },
  ];

  // Cycle headline every 5s
  useEffect(() => {
    const t = setInterval(() => setTextPhase(p => (p + 1) % HEADLINES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Cycle stage indicator every 3s
  useEffect(() => {
    const t = setInterval(() => setActiveStage(s => (s + 1) % STAGES.length), 3000);
    return () => clearInterval(t);
  }, []);

  // ── Video cycling ─────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = HERO_VIDEOS[videoIdx];
    video.load();
    if (isPlaying) video.play().catch(() => {});
  }, [videoIdx]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => setVideoIdx(i => (i + 1) % HERO_VIDEOS.length);
    const onCanPlay = () => setVideoReady(true);
    video.addEventListener("ended", onEnd);
    video.addEventListener("canplay", onCanPlay);
    return () => {
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.play().catch(() => {}) : video.pause();
  }, [isPlaying]);

  // ── Mouse parallax ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2));
    mouseY.set((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2));
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0);
  }, [mouseX, mouseY]);

  // ── Canvas: bioluminescent particles over video ───────────────────────────
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const u1 = springX.on("change", v => { mouseRef.current.x = v; });
    const u2 = springY.on("change", v => { mouseRef.current.y = v; });
    return () => { u1(); u2(); };
  }, [springX, springY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 200 particles + 8 larger glowing orbs
    const particles = Array.from({ length: 200 }, (_, i) => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 2 + 0.5,
      speedX:  (Math.random() - 0.5) * 0.35,
      speedY:  -(Math.random() * 0.6 + 0.1),
      opacity: Math.random() * 0.7 + 0.15,
      cyan:    i % 3 !== 0,
      phase:   Math.random() * Math.PI * 2,
    }));

    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 80 + 40,
      ox: 0, oy: 0,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.5 ? 185 : 45,
    }));

    let t = 0;
    const draw = () => {
      t += 0.012;
      const { x: mx, y: my } = mouseRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Orbs (deep glow blobs that shift with mouse)
      orbs.forEach(o => {
        o.x += o.speedX + mx * 0.4;
        o.y += o.speedY + my * 0.4;
        if (o.x < -o.r) o.x = canvas.width + o.r;
        if (o.x > canvas.width + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = canvas.height + o.r;
        if (o.y > canvas.height + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0,   `hsla(${o.hue},100%,65%,0.06)`);
        g.addColorStop(0.5, `hsla(${o.hue},100%,55%,0.03)`);
        g.addColorStop(1,   `hsla(${o.hue},100%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Volumetric light rays
      for (let i = 0; i < 5; i++) {
        const bx = (canvas.width / 5) * i + Math.sin(t + i) * 30 + mx * 20;
        const gr = ctx.createLinearGradient(bx, 0, bx + 60, canvas.height);
        gr.addColorStop(0,   "rgba(0,243,255,0.055)");
        gr.addColorStop(0.5, "rgba(245,158,11,0.025)");
        gr.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(bx - 25, 0);
        ctx.lineTo(bx + 65, 0);
        ctx.lineTo(bx + 180, canvas.height);
        ctx.lineTo(bx - 90,  canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      // Bioluminescent particles
      particles.forEach(p => {
        p.x += p.speedX + Math.sin(t * 0.7 + p.phase) * 0.18 + mx * 0.45;
        p.y += p.speedY + my * 0.35;
        if (p.y < -8)  { p.y = canvas.height + 8; p.x = Math.random() * canvas.width; }
        if (p.x < -8)    p.x = canvas.width + 8;
        if (p.x > canvas.width + 8) p.x = -8;
        const pulse = p.opacity * (0.8 + 0.2 * Math.sin(t * 2 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? `rgba(0,243,255,${pulse})`
          : `rgba(245,158,11,${pulse})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const currentHeadline = HEADLINES[textPhase];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100svh", minHeight: "580px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* ── VIDEO BACKGROUND ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        loop={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: videoReady ? 1 : 0,
          transition: "opacity 1.2s ease",
          filter: "brightness(0.68) saturate(1.25) contrast(1.05)",
        }}
      />

      {/* ── GRADIENT OVERLAYS — lightened so video shines through ── */}
      {/* Bottom fade — only bottom 40% fades to near-black */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/20 to-transparent z-10 pointer-events-none" />
      {/* Left vignette — subtle */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/40 via-transparent to-[#030712]/25 z-10 pointer-events-none" />
      {/* Top fade — just enough for header legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent z-10 pointer-events-none" />
      {/* Centre tint — very light so center video is visible */}
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />

      {/* ── PARTICLE CANVAS (over video, under UI) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* ── MAIN UI LAYER ── */}
      <div className="absolute inset-0 z-30 flex flex-col">

        {/* ── TOP NAV BAR ── */}
        <div className="w-full flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-cyan-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-xl"
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"
            />
            <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-300 hidden sm:inline">
              OCEANEXOTIC — LIVE
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 sm:hidden">
              OCEANEXOTIC
            </span>
          </motion.div>

          {/* Stats pills */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="hidden md:flex items-center gap-3"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.06, y: -3 }}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full"
              >
                <span className="text-base">{s.icon}</span>
                <span className="text-sm font-black text-cyan-300">{s.value}</span>
                <span className="text-[10px] font-bold uppercase text-slate-400">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Play/Pause */}
          <motion.button
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={() => setIsPlaying(p => !p)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
          >
            {isPlaying
              ? <><Pause className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase hidden sm:inline">Pause</span></>
              : <><Play  className="w-3.5 h-3.5 fill-current" /><span className="text-[10px] font-black uppercase hidden sm:inline">Play</span></>
            }
          </motion.button>
        </div>

        {/* ── CENTERED HERO CONTENT ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 -mt-4 sm:-mt-10">

          {/* Journey stage micro-badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{   opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border backdrop-blur-md"
              style={{
                borderColor: `${STAGES[activeStage].color}70`,
                background:  `${STAGES[activeStage].color}25`,
                boxShadow:   `0 0 24px ${STAGES[activeStage].color}50`,
              }}
            >
              <span style={{ color: STAGES[activeStage].color }}>{STAGES[activeStage].icon}</span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white drop-shadow">
                STAGE {STAGES[activeStage].step} — {STAGES[activeStage].label}
              </span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: STAGES[activeStage].color }}
              />
            </motion.div>
          </AnimatePresence>

          {/* GIANT HEADLINE */}
          <AnimatePresence mode="wait">
            <motion.div
              key={textPhase}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1,  y: 0,  filter: "blur(0px)" }}
              exit={{   opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-0 sm:space-y-1"
            >
              {/* Top word */}
              <motion.h1
                className="font-black uppercase leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(4.5rem, 13vw, 10rem)",
                  background: "linear-gradient(135deg, #00f3ff 0%, #60efff 25%, #ffffff 52%, #f59e0b 78%, #ff6b35 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 4px 32px rgba(0,243,255,0.7)) drop-shadow(0 0 60px rgba(0,200,255,0.4))",
                  animation: "gradientShift 6s ease infinite",
                  textShadow: "none",
                  letterSpacing: "-0.03em",
                }}
              >
                {currentHeadline.top}
              </motion.h1>
              {/* Bottom word */}
              <motion.h1
                className="font-black uppercase leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(4.5rem, 13vw, 10rem)",
                  background: "linear-gradient(135deg, #fbbf24 0%, #ffffff 38%, #00f3ff 68%, #c084fc 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 4px 32px rgba(245,158,11,0.7)) drop-shadow(0 0 60px rgba(251,191,36,0.35))",
                  animation: "gradientShift 6s ease infinite reverse",
                  textShadow: "none",
                  letterSpacing: "-0.03em",
                }}
              >
                {currentHeadline.bottom}
              </motion.h1>
            </motion.div>
          </AnimatePresence>

          {/* Animated underline */}
          <motion.div
            className="w-0 h-0.5 rounded-full mt-2 sm:mt-3"
            style={{ background: "linear-gradient(90deg, #00f3ff, #f59e0b)" }}
            animate={{ width: ["0%", "60%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={textPhase + "_sub"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{   opacity: 0, y: -8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-lg sm:text-2xl lg:text-3xl font-semibold text-white/90 max-w-xl sm:max-w-2xl leading-relaxed drop-shadow-lg"
            >
              {currentHeadline.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap"
          >
            {/* Primary CTA */}
            <Link
              href={activeAdminFish?.productId ? `/customer/products/${activeAdminFish.productId}` : "/customer/products"}
              className="group relative flex items-center gap-2.5 px-7 py-3.5 sm:px-10 sm:py-4 rounded-full font-black text-sm sm:text-base lg:text-lg uppercase tracking-widest text-slate-950 overflow-hidden transition-all hover:scale-105 active:scale-95"
              style={{
                background:  "linear-gradient(135deg, #00f3ff, #00b4d8, #f59e0b)",
                boxShadow:   "0 0 30px rgba(0,243,255,0.5), 0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              {/* shimmer sweep */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              <span className="relative z-10">SHOP FRESH CATCH</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/customer/products"
              className="group flex items-center gap-2.5 px-7 py-3.5 sm:px-10 sm:py-4 rounded-full font-black text-sm sm:text-base lg:text-lg uppercase tracking-widest text-white border border-white/35 backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-400/70 hover:bg-white/12 active:scale-95"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
            >
              <Fish className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>EXPLORE MENU</span>
            </Link>
          </motion.div>

          {/* Price tag if admin set one */}
          {activeAdminFish?.price && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">From</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow-lg">{activeAdminFish.price}</span>
              {activeAdminFish.unit && <span className="text-xs text-slate-400 font-bold uppercase">/ {activeAdminFish.unit}</span>}
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">onwards</span>
            </motion.div>
          )}
        </div>

        {/* ── BOTTOM STAGE JOURNEY RIBBON ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="w-full px-4 sm:px-8 pb-5 sm:pb-7 space-y-3"
        >
          {/* Video progress dots */}
          <div className="flex items-center justify-center gap-2">
            {HERO_VIDEOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setVideoIdx(i)}
                className="transition-all"
              >
                <motion.div
                  className="rounded-full"
                  animate={{
                    width:   i === videoIdx ? 24 : 6,
                    height:  6,
                    background: i === videoIdx ? "#00f3ff" : "rgba(255,255,255,0.3)",
                    boxShadow: i === videoIdx ? "0 0 10px rgba(0,243,255,0.8)" : "none",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>

          {/* Stage pills */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STAGES.map((stage, idx) => (
              <motion.button
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all backdrop-blur-md shrink-0",
                  idx === activeStage
                    ? "bg-white/15 border-white/40 text-white shadow-lg"
                    : "bg-black/40 border-white/15 text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/10"
                )}
                style={idx === activeStage ? {
                  borderColor: `${stage.color}60`,
                  boxShadow:   `0 0 15px ${stage.color}30`,
                } : {}}
              >
                <span style={{ color: idx === activeStage ? stage.color : undefined }}>
                  {stage.icon}
                </span>
                <span className="hidden xs:inline">{stage.step}</span>
                <span>{stage.label}</span>
                {idx === activeStage && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: stage.color }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="flex flex-col items-center gap-1 pt-1 opacity-40"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* ── GRADIENT KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .hero-headline {
          font-family: 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}
