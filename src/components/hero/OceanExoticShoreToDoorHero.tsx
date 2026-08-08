"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { 
  Waves, 
  Anchor, 
  ShieldCheck, 
  Package, 
  Truck, 
  Home, 
  ChevronRight, 
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// 🌊 6-STAGE SHORE TO DOOR STORYLINE STAGES
const STAGES = [
  {
    id: "ocean",
    step: "01",
    label: "FROM THE OCEAN",
    sublabel: "Deep Oceanic Waters",
    title: "FROM THE OCEAN",
    highlight: "DEEP OCEANIC ORIGIN",
    description: "Immerse in pristine island marine waters. Sourced with sustainable fishing practices from pure ocean depths.",
    badge: "100% Wild Oceanic Catch",
    accentColor: "#00f3ff",
    bgGradient: "from-[#020617] via-[#030712] to-[#071927]",
    icon: <Waves className="w-5 h-5 text-cyan-400" />
  },
  {
    id: "caught",
    step: "02",
    label: "FRESHLY CAUGHT",
    sublabel: "Port Blair Harbour Dock",
    title: "FRESHLY CAUGHT",
    highlight: "LANDED AT FIRST LIGHT",
    description: "Hand-picked by local master fishermen at dawn. Direct dock arrival with zero artificial preservatives.",
    badge: "Port Blair Dock Landing",
    accentColor: "#f59e0b",
    bgGradient: "from-[#030712] via-[#0b172a] to-[#1e1b18]",
    icon: <Anchor className="w-5 h-5 text-amber-400" />
  },
  {
    id: "quality",
    step: "03",
    label: "CAREFULLY SELECTED",
    sublabel: "Cold-Chain Quality Inspection",
    title: "CAREFULLY SELECTED",
    highlight: "GRADE-A SEAFOOD VERIFIED",
    description: "Inspected for texture, aroma, and premium yield. Chilled on ice at 0°C to 4°C to lock in fresh ocean flavor.",
    badge: "0°C - 4°C Chill Guaranteed",
    accentColor: "#10b981",
    bgGradient: "from-[#030712] via-[#06201b] to-[#0b2922]",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
  },
  {
    id: "pack",
    step: "04",
    label: "SEALED FRESH",
    sublabel: "Vacuum-Sealed Packaging",
    title: "SEALED FRESH",
    highlight: "HERMETIC COLD-PACK SEAL",
    description: "Packaged in food-grade eco-insulated vacuum sealed packs to protect freshness during transit.",
    badge: "Eco Vacuum Cold Pack",
    accentColor: "#3b82f6",
    bgGradient: "from-[#030712] via-[#0c1938] to-[#122247]",
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
    bgGradient: "from-[#030712] via-[#1a0c2e] to-[#250d3a]",
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
    bgGradient: "from-[#030712] via-[#082f49] to-[#0284c7]",
    icon: <Home className="w-5 h-5 text-cyan-400" />
  }
];

export function OceanExoticShoreToDoorHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Scroll Progress Engine
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Mouse tilt parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 2,
        y: (e.clientY / innerHeight - 0.5) * 2
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update active stage based on scroll progress
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const stage = Math.min(
        STAGES.length - 1,
        Math.floor(latest * STAGES.length)
      );
      setActiveStageIdx(stage);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // 🎨 WebGL/Canvas 3D Ocean & Dual-World Fish Visual Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle system
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.8 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      gold: Math.random() > 0.5
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const progress = smoothProgress.get();
      const stageIdx = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length));

      // 1. Draw Volumetric Caustics / Light Beams from Above
      const numBeams = 5;
      for (let i = 0; i < numBeams; i++) {
        const beamX = (width / numBeams) * i + Math.sin(time + i) * 40;
        const gradient = ctx.createLinearGradient(beamX, 0, beamX + 100, height);
        
        const isWarmStage = stageIdx >= 1 && stageIdx <= 3;
        const beamColor1 = isWarmStage 
          ? "rgba(245, 158, 11, 0.08)" 
          : "rgba(0, 243, 255, 0.07)";
        const beamColor2 = "rgba(3, 7, 18, 0)";

        gradient.addColorStop(0, beamColor1);
        gradient.addColorStop(1, beamColor2);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(beamX - 30, 0);
        ctx.lineTo(beamX + 80, 0);
        ctx.lineTo(beamX + 220, height);
        ctx.lineTo(beamX - 100, height);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Render Floating Marine Bioluminescent & Gold Particles
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(time + p.y) * 0.2;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold 
          ? `rgba(251, 191, 36, ${p.opacity})` 
          : `rgba(0, 243, 255, ${p.opacity})`;
        ctx.shadowBlur = p.gold ? 10 : 8;
        ctx.shadowColor = p.gold ? "#f59e0b" : "#00f3ff";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Render 3D Dual-World Fish Anchor Object
      const cx = width / 2 + mousePos.x * 25;
      const cy = height / 2.2 + mousePos.y * 15 + Math.sin(time * 2) * 12;

      ctx.save();
      ctx.translate(cx, cy);

      // Stage transformation scaling & rotation
      const scaleMultiplier = 1 + progress * 0.25;
      const rotAngle = Math.sin(time * 1.2) * 0.08 + (progress - 0.5) * 0.3;
      ctx.rotate(rotAngle);
      ctx.scale(scaleMultiplier, scaleMultiplier);

      // Render Fish Body Outer Aura Glow
      const auraGradient = ctx.createRadialGradient(0, 0, 40, 0, 0, 180);
      auraGradient.addColorStop(0, stageIdx >= 3 ? "rgba(16, 185, 129, 0.25)" : "rgba(0, 243, 255, 0.2)");
      auraGradient.addColorStop(0.6, "rgba(245, 158, 11, 0.1)");
      auraGradient.addColorStop(1, "rgba(3, 7, 18, 0)");
      
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 200, 0, Math.PI * 2);
      ctx.fill();

      // Draw Stylized Fish Body (Dual-World: Golden Solar Top + Oceanic Deep Blue Bottom)
      ctx.beginPath();
      ctx.moveTo(140, 0); // Tail
      ctx.bezierCurveTo(90, -45, 20, -70, -60, -50); // Top Spine
      ctx.bezierCurveTo(-110, -35, -140, -10, -150, 0); // Head Front
      ctx.bezierCurveTo(-140, 10, -110, 35, -60, 50); // Lower Belly
      ctx.bezierCurveTo(20, 70, 90, 45, 140, 0); // Tail Back
      ctx.closePath();

      // Fish Body Dual Gradient Fill (Warm Gold Top -> Deep Oceanic Cyan Bottom)
      const bodyGrad = ctx.createLinearGradient(0, -60, 0, 60);
      bodyGrad.addColorStop(0, "#fbbf24"); // Solar Warm Amber
      bodyGrad.addColorStop(0.35, "#f59e0b"); // Golden Energy
      bodyGrad.addColorStop(0.65, "#0d9488"); // Teal Transition
      bodyGrad.addColorStop(1, "#0284c7"); // Deep Ocean Blue

      ctx.fillStyle = bodyGrad;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#00f3ff";
      ctx.fill();

      // Fish Scale Pattern & Micro Highlights
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      for (let i = -100; i < 100; i += 25) {
        ctx.beginPath();
        ctx.arc(i, Math.sin(time + i * 0.05) * 5, 18, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }

      // Fish Eye Glowing Node
      ctx.beginPath();
      ctx.arc(-115, -12, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ffffff";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-117, -12, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#030712";
      ctx.fill();

      // Stage 4 Package Morph Encapsulation Ring
      if (stageIdx >= 3) {
        ctx.strokeStyle = stageIdx === 3 ? "#3b82f6" : "#10b981";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, 160 + Math.sin(time * 3) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [smoothProgress, mousePos]);

  const currentStage = STAGES[activeStageIdx];

  return (
    <div ref={containerRef} className="relative w-full min-h-[360vh] bg-[#030712] text-white">
      {/* 🌊 STICKY HERO STAGE VIEWPORT (Full Screen Desktop & Responsive Mobile Web) */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between p-4 md:p-8 lg:p-12">
        {/* WebGL Canvas Background Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* TOP STATUS BAR — Stage Progress Dots & Live Tag */}
        <header className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 md:gap-3 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-300">
              OCEANEXOTIC GLOBAL — SHORE TO DOOR
            </span>
          </div>

          {/* Step Pill Indicators */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full">
            {STAGES.map((stg, i) => (
              <div
                key={stg.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === activeStageIdx
                    ? "w-6 bg-cyan-400 shadow-[0_0_10px_#00f3ff]"
                    : i < activeStageIdx
                    ? "bg-emerald-500 opacity-60"
                    : "bg-slate-700"
                )}
              />
            ))}
          </div>
        </header>

        {/* CENTER CONTENT OVERLAY — Dynamic Text & Telemetry Badges */}
        <main className="relative z-20 max-w-7xl mx-auto w-full my-auto flex flex-col items-center md:items-start text-center md:text-left pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-4 max-w-2xl"
            >
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-slate-900/90 backdrop-blur-md shadow-xl">
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
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tight leading-none drop-shadow-2xl">
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
              <h2 className="text-lg md:text-2xl font-black uppercase tracking-wider text-amber-300 italic">
                {currentStage.highlight}
              </h2>

              {/* Description Body */}
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                {currentStage.description}
              </p>

              {/* Interactive Stage Actions (Pointer Events Enabled) */}
              <div className="pt-2 pointer-events-auto flex flex-wrap items-center justify-center md:justify-start gap-3">
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
        </main>

        {/* BOTTOM STEP CONTROLS & SCROLL GUIDE */}
        <footer className="relative z-20 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between pb-2 gap-4 border-t border-white/10 pt-3">
          {/* Step Selector Ribbon */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 pointer-events-auto">
            {STAGES.map((stg, i) => (
              <button
                key={stg.id}
                onClick={() => {
                  if (containerRef.current) {
                    const stageHeight = containerRef.current.offsetHeight / STAGES.length;
                    window.scrollTo({ top: stageHeight * i, behavior: "smooth" });
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] md:text-[10.5px] font-black uppercase tracking-wider border transition-all shrink-0 flex items-center gap-1.5",
                  i === activeStageIdx
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.3)]"
                    : "bg-slate-900/80 border-white/10 text-slate-400 hover:text-white hover:border-white/30"
                )}
              >
                <span>{stg.step}</span>
                <span className="hidden sm:inline">{stg.label}</span>
              </button>
            ))}
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest animate-bounce">
            <span>SCROLL TO EXPERIENCE JOURNEY</span>
            <ChevronRight className="w-4 h-4 rotate-90 text-cyan-400" />
          </div>
        </footer>
      </div>
    </div>
  );
}
