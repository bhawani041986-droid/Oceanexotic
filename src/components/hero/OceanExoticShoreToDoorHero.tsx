"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Waves, Scissors, Package, ThermometerSnowflake, Truck, Home,
  ArrowRight, Play, Pause, ShoppingCart, ChevronDown,
  Box, Fish
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
  heroVideos?: string[];
  heroPrice?: string;
  heroUnit?: string;
}

// ─── Videos ──────────────────────────────────────────────────────────────────
const HERO_VIDEOS = [
  "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/videos/7020525_Market_Iced_1280x720.mp4",
  "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/videos/7020535_Market_Iced_1280x720.mp4",
  "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/videos/6914536_Motion_Graphics_Motion_Graphic_1280x720.mp4",
];

// ─── Default 6-Stage Process Configuration ───────────────────────────────────
const DEFAULT_STAGE_DATA = [
  {
    id: "catch",
    step: "01",
    label: "SHORE CATCH",
    title: "SHORE CATCH",
    badge: "100% Ocean Wild Catch",
    statusText: "Pristine Island Dock Landing",
    imageUrl: "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_shore_catch.jpg",
    color: "#00f3ff",
    icon: <Waves className="w-3.5 h-3.5" />
  },
  {
    id: "slice",
    step: "02",
    label: "PRECISION SLICED",
    title: "PRECISION SLICED",
    badge: "3D Deconstructed Steaks & Fry Cuts",
    statusText: "Laser Sliced Fresh Cuts",
    imageUrl: "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_freshly_sliced.jpg",
    color: "#f59e0b",
    icon: <Scissors className="w-3.5 h-3.5" />
  },
  {
    id: "vacuum",
    step: "03",
    label: "VACUUM SEALED",
    title: "VACUUM SEALED",
    badge: "Hermetic Eco Pack",
    statusText: "Airtight Freshness Encapsulation",
    imageUrl: "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_vacuum_sealed.jpg",
    color: "#3b82f6",
    icon: <Package className="w-3.5 h-3.5" />
  },
  {
    id: "coldchain",
    step: "04",
    label: "COLD CHAIN",
    title: "COLD CHAIN MAINTAINED",
    badge: "0°C - 4°C Ice Lock",
    statusText: "Continuous Chilled Preservation",
    imageUrl: "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_cold_chain.jpg",
    color: "#10b981",
    icon: <ThermometerSnowflake className="w-3.5 h-3.5" />
  },
  {
    id: "delivery",
    step: "05",
    label: "EXPRESS DISPATCH",
    title: "EXPRESS DISPATCH",
    badge: "90 Min Delivery Route",
    statusText: "Cold Courier Velocity Tunnel",
    imageUrl: "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_express_delivery.jpg",
    color: "#a855f7",
    icon: <Truck className="w-3.5 h-3.5" />
  },
  {
    id: "door",
    step: "06",
    label: "DELIVERED TO DOOR",
    title: "DELIVERED TO YOUR DOOR",
    badge: "Shore to Door Complete",
    statusText: "Fresh Seafood Delivered Fresh",
    imageUrl: "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_delivered_door.jpg",
    color: "#00d1ff",
    icon: <Home className="w-3.5 h-3.5" />
  }
];

// ─── Floating stat cards ──────────────────────────────────────────────────────
const STATS = [
  { value: "500+",  label: "Species",    icon: "🐟" },
  { value: "90min", label: "Delivery",   icon: "⚡" },
  { value: "0°C",   label: "Cold Chain", icon: "❄️" },
];

export function OceanExoticShoreToDoorHero({ heroItems, hero3dStages, heroVideos, heroPrice, heroUnit }: OceanExoticShoreToDoorHeroProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [videoIdx,    setVideoIdx]    = useState(0);
  const [videoReady,  setVideoReady]  = useState(false);
  const [isPlaying,   setIsPlaying]   = useState(true);
  const [activeStage, setActiveStage] = useState(0);
  const [textPhase,   setTextPhase]   = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const activeAdminFish = heroItems && heroItems.length > 0 ? heroItems[0] : null;

  const lastSrcRef = useRef("");

  // Resolve dynamic videos, price, and units
  const videoList = useMemo(() => {
    return heroVideos && heroVideos.filter(Boolean).length > 0
      ? heroVideos.filter(Boolean)
      : HERO_VIDEOS;
  }, [heroVideos]);

  const resolvedPrice = heroPrice || activeAdminFish?.price || "650";
  const resolvedUnit = heroUnit || activeAdminFish?.unit || "kg";
  const resolvedProductId = activeAdminFish?.productId;

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

  // Merge custom stage data from props (if any) with defaults
  const mergedStages = DEFAULT_STAGE_DATA.map((def, idx) => {
    const custom = hero3dStages?.find(s => s.step === def.step || s.id === def.id || (idx === 5 && s.step === "06"));
    return {
      ...def,
      title: custom?.title || def.title,
      badge: custom?.badge || def.badge,
      statusText: custom?.statusText || def.statusText,
      imageUrl: custom?.imageUrl || def.imageUrl,
    };
  });

  // Cycle stage indicator every 3s through all 6 stages
  useEffect(() => {
    const t = setInterval(() => setActiveStage(s => (s + 1) % mergedStages.length), 3000);
    return () => clearInterval(t);
  }, [mergedStages.length]);

  // ── Video cycling ─────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const targetSrc = videoList[videoIdx] || HERO_VIDEOS[0];
    
    if (lastSrcRef.current !== targetSrc) {
      lastSrcRef.current = targetSrc;
      video.src = targetSrc;
      video.load();
      // If the video is already ready to play, show it immediately
      if (video.readyState >= 2) {
        setVideoReady(true);
      } else {
        setVideoReady(false);
      }
    }
  }, [videoIdx, videoList]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => setVideoIdx(i => (i + 1) % videoList.length);
    const onCanPlay = () => setVideoReady(true);
    
    if (video.readyState >= 2) {
      setVideoReady(true);
    }
    
    video.addEventListener("ended", onEnd);
    video.addEventListener("canplay", onCanPlay);
    return () => {
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [videoList]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
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
    const un1 = springX.on("change", v => { mouseRef.current.x = v; });
    const un2 = springY.on("change", v => { mouseRef.current.y = v; });
    return () => { un1(); un2(); };
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

    const particles = Array.from({ length: 150 }, (_, i) => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 2 + 0.5,
      speedX:  (Math.random() - 0.5) * 0.35,
      speedY:  -(Math.random() * 0.5 + 0.1),
      opacity: Math.random() * 0.7 + 0.15,
      cyan:    i % 3 !== 0,
      phase:   Math.random() * Math.PI * 2,
    }));

    const orbs = Array.from({ length: 4 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 60 + 30,
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

      // Glow Orbs
      orbs.forEach(o => {
        o.x += o.speedX + mx * 0.3;
        o.y += o.speedY + my * 0.3;
        if (o.x < -o.r) o.x = canvas.width + o.r;
        if (o.x > canvas.width + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = canvas.height + o.r;
        if (o.y > canvas.height + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0,   `hsla(${o.hue},100%,65%,0.05)`);
        g.addColorStop(0.5, `hsla(${o.hue},100%,55%,0.02)`);
        g.addColorStop(1,   `hsla(${o.hue},100%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Light rays
      for (let i = 0; i < 4; i++) {
        const bx = (canvas.width / 4) * i + Math.sin(t + i) * 20 + mx * 15;
        const gr = ctx.createLinearGradient(bx, 0, bx + 50, canvas.height);
        gr.addColorStop(0,   "rgba(0,243,255,0.04)");
        gr.addColorStop(0.5, "rgba(245,158,11,0.015)");
        gr.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(bx - 20, 0);
        ctx.lineTo(bx + 50, 0);
        ctx.lineTo(bx + 140, canvas.height);
        ctx.lineTo(bx - 70,  canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      // Particles
      particles.forEach(p => {
        p.x += p.speedX + Math.sin(t * 0.7 + p.phase) * 0.15 + mx * 0.35;
        p.y += p.speedY + my * 0.25;
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
  const activeStageConfig = mergedStages[activeStage];

  // Map mouse coordinate values to 3D rotations for the floating card
  const rotateX = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  useEffect(() => {
    const un = springX.on("change", v => rotateY.set(v * 16));
    const un2 = springY.on("change", v => rotateX.set(-v * 16));
    return () => { un(); un2(); };
  }, [springX, springY, rotateX, rotateY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none h-[80svh] sm:h-[100svh] min-h-[460px] sm:min-h-[580px]"
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
          filter: "brightness(0.88) saturate(1.3) contrast(1.05)",
        }}
      />

      {/* ── GRADIENT OVERLAYS ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/15 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/35 via-transparent to-[#030712]/20 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />

      {/* ── PARTICLE CANVAS ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* ── MAIN UI LAYER ── */}
      <div className="absolute inset-0 z-30 flex flex-col">

        {/* ── TOP NAV BAR ── */}
        <div className="w-full flex items-center justify-between px-4 sm:px-8 pt-3 sm:pt-6">

          {/* Live badge (Hidden on mobile to free center area) */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex items-center gap-2 bg-black/45 backdrop-blur-xl border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-xl"
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
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
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.06, y: -2 }}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full"
              >
                <span className="text-sm">{s.icon}</span>
                <span className="text-sm font-black text-cyan-300">{s.value}</span>
                <span className="text-[9px] font-bold uppercase text-slate-400">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Play/Pause (Hidden on mobile to free center area) */}
          <motion.button
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={() => setIsPlaying(p => !p)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-1.5 bg-black/45 backdrop-blur-xl border border-white/15 px-3 py-1 rounded-full text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all text-[10px] font-bold uppercase"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </motion.button>
        </div>

        {/* ── SPLIT VIEW CONTENT (Left: Text, Right: Floating Custom Stage Photo) ── */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-start px-6 sm:px-16 pt-6 sm:pt-8 max-w-7xl mx-auto w-full h-full pb-16">
          
          {/* Left Column: Left-aligned compact typography (Top aligned) */}
          <div className="col-span-1 md:col-span-7 flex flex-col items-start justify-start text-left space-y-4 sm:space-y-5 max-w-xl pt-4 sm:pt-6">
            
            {/* Headline (Single line, reduced font size on mobile to 19px, keeps center free) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={textPhase}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1,  y: 0,  filter: "blur(0px)" }}
                exit={{   opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.h1
                  className="font-black uppercase leading-tight tracking-tighter text-[19px] sm:text-[36px] md:text-[48px] lg:text-[56px] hero-headline"
                  style={{
                    background: "linear-gradient(135deg, #00f3ff 0%, #60efff 30%, #ffffff 50%, #f59e0b 75%, #ff6b35 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 2px 8px rgba(0,243,255,0.5))",
                    animation: "gradientShift 6s ease infinite",
                  }}
                >
                  {currentHeadline.top} {currentHeadline.bottom}
                </motion.h1>
              </motion.div>
            </AnimatePresence>

            {/* Custom active stage status/badge callout */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeStage + "_badge"}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1,  x: 0 }}
                exit={{   opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="text-xs sm:text-sm font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10"
                style={{
                  color: activeStageConfig.color,
                  borderColor: `${activeStageConfig.color}35`,
                  background: `${activeStageConfig.color}08`
                }}
              >
                {activeStageConfig.badge}
              </motion.p>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={textPhase + "_sub"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1,  y: 0 }}
                exit={{   opacity: 0, y: -6 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-xs sm:text-lg font-semibold text-white/90 leading-relaxed drop-shadow-md"
              >
                {currentHeadline.sub} — <span className="opacity-70 font-normal">{activeStageConfig.statusText}</span>
              </motion.p>
            </AnimatePresence>

            {/* Centered micro-badge indicating active stage (desktop-only, centered below subtitle) */}
            <div className="w-full hidden md:flex justify-start pt-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1,  y: 0 }}
                  exit={{   opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md"
                  style={{
                    borderColor: `${activeStageConfig.color}60`,
                    background:  `${activeStageConfig.color}15`,
                    boxShadow:   `0 0 16px ${activeStageConfig.color}30`,
                  }}
                >
                  <span className="text-xs shrink-0" style={{ color: activeStageConfig.color }}>
                    {activeStageConfig.icon}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">
                    STAGE {activeStageConfig.step} — {activeStageConfig.title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Price Badge (Desktop specific, placed above Shop Fresh button) */}
            {resolvedPrice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 backdrop-blur-md shadow-md text-[11px] font-bold text-amber-300 uppercase tracking-wider"
              >
                <span className="text-[10px] text-amber-500 font-extrabold">PRICE RANGE</span>
                <span>
                  From {resolvedPrice.startsWith("Rs") || resolvedPrice.startsWith("₹") ? "" : "Rs. "}{resolvedPrice} per {resolvedUnit.replace(/^per\s+/i, "")} onwards
                </span>
              </motion.div>
            )}

            {/* CTA Buttons (Hidden on mobile, rendered below in bottom ribbon horizontally) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden md:flex items-center justify-start gap-2.5 pt-1 sm:pt-2 flex-wrap"
            >
              <Link
                href={activeAdminFish?.productId ? `/customer/products/${activeAdminFish.productId}` : "/customer/products"}
                className="group relative flex items-center gap-1.5 px-5 py-2.5 sm:px-7 sm:py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-950 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background:  "linear-gradient(135deg, #00f3ff, #00b4d8, #f59e0b)",
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">SHOP FRESH CATCH</span>
                <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/customer/products"
                className="group flex items-center gap-1.5 px-5 py-2.5 sm:px-7 sm:py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest text-white border border-white/35 backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-400/60 hover:bg-white/10 active:scale-95 shadow"
              >
                <Fish className="w-3.5 h-3.5" />
                <span>EXPLORE MENU</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating 3D Process stage photo preview card (Bottom-right aligned, smaller scale) */}
          <div className="col-span-1 md:col-span-5 hidden md:flex items-end justify-end h-full self-end pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                animate={{ opacity: 1,  scale: 1,   rotateY: 0 }}
                exit={{   opacity: 0, scale: 0.9, rotateY: -15 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  transformStyle: "preserve-3d",
                  rotateX,
                  rotateY,
                  perspective: 1000
                }}
                className="w-full max-w-[280px] aspect-[4/3] relative rounded-3xl p-1.5 border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden bg-slate-900/35"
              >
                {/* Custom Stage Photo */}
                <div className="w-full h-full relative rounded-2xl overflow-hidden group">
                  <img
                    src={activeStageConfig.imageUrl}
                    alt={activeStageConfig.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/images/hero/hero_shore_catch.jpg";
                    }}
                  />
                  {/* Photo Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Stage details tag inside photo (Shows Title + Subtitle, No duplicates) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                        {activeStageConfig.title}
                      </p>
                      <p className="text-[9.5px] font-semibold text-slate-300 uppercase mt-0.5 leading-none">
                        {activeStageConfig.statusText}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 text-[8.5px] font-bold uppercase rounded shrink-0 ml-2"
                      style={{
                        background: `${activeStageConfig.color}25`,
                        color: activeStageConfig.color,
                        border: `1px solid ${activeStageConfig.color}40`
                      }}
                    >
                      STAGE {activeStageConfig.step}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── BOTTOM STAGE JOURNEY RIBBON (Supports all 6 custom stages) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="w-full px-4 sm:px-8 pb-3 sm:pb-5 space-y-2.5"
        >
          {/* Price Range Badge (Mobile specific, placed above bottom Shop Fresh button) */}
          {resolvedPrice && (
            <div className="flex md:hidden items-center justify-center">
              <div className="px-3 py-1 rounded-lg border border-amber-500/25 bg-amber-500/10 backdrop-blur-md text-[9.5px] font-bold text-amber-300 uppercase tracking-wider">
                From {resolvedPrice.startsWith("Rs") || resolvedPrice.startsWith("₹") ? "" : "Rs. "}{resolvedPrice} per {resolvedUnit.replace(/^per\s+/i, "")} onwards
              </div>
            </div>
          )}

          {/* CTA Buttons - Mobile specific (just above dots, side-by-side horizontally, slick style) */}
          <div className="flex md:hidden items-center justify-center gap-2 max-w-sm mx-auto w-full px-2">
            <Link
              href={resolvedProductId ? `/customer/products/${resolvedProductId}` : "/customer/products"}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-950 shadow-md active:scale-95 transition-all bg-gradient-to-r from-cyan-400 to-amber-400 border border-white/20"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>SHOP FRESH</span>
            </Link>

            <Link
              href="/customer/products"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-white border border-white/35 backdrop-blur-md active:scale-95 transition-all bg-white/10 shadow-sm"
            >
              <Fish className="w-3.5 h-3.5" />
              <span>EXPLORE</span>
            </Link>
          </div>

          {/* Video indicator dots */}
          <div className="flex items-center justify-center gap-1.5">
            {videoList.map((_, i) => (
              <button
                key={i}
                onClick={() => setVideoIdx(i)}
                className="transition-all"
              >
                <motion.div
                  className="rounded-full"
                  animate={{
                    width:   i === videoIdx ? 20 : 5,
                    height:  5,
                    background: i === videoIdx ? "#00f3ff" : "rgba(255,255,255,0.35)",
                    boxShadow: i === videoIdx ? "0 0 8px rgba(0,243,255,0.8)" : "none",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>

          {/* Stage selection pills (Restored back to bottom ribbon) */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {mergedStages.map((stage, idx) => (
              <motion.button
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-[9px] sm:text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all backdrop-blur-md shrink-0",
                  idx === activeStage
                    ? "bg-white/15 border-white/40 text-white shadow-md"
                    : "bg-black/45 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                )}
                style={idx === activeStage ? {
                  borderColor: `${stage.color}60`,
                  boxShadow:   `0 0 12px ${stage.color}25`,
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
        </motion.div>
      </div>

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
