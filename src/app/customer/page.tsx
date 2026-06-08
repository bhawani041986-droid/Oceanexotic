"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Bell, 
  MapPin, 
  ChevronDown, 
  Star, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Truck, 
  Navigation, 
  Smartphone, 
  Mail, 
  Instagram, 
  Youtube, 
  MessageCircle,
  Menu,
  X,
  Plus,
  Play,
  Sun,
  Moon,
  Home as HomeIcon,
  Receipt,
  Mic,
  ChevronRight,
  LogOut,
  Settings,
  Flame,
  Utensils,
  Waves,
  Anchor,
  Ship,
  Compass,
  Fish,
  ChefHat,
  Thermometer,
  Shell,
  Gauge,
  Timer,
  Wind,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

// --- Components ---

const AndamanMaritimeMap = ({ territories }: { territories: any[] }) => {
  const mapRef = React.useRef<any>(null);
  const [isLReady, setIsLReady] = React.useState(false);
  const [isMapInit, setIsMapInit] = React.useState(false);
  
  // 1. Script & CSS Handshake
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) {
      setIsLReady(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setIsLReady(true);
    document.head.appendChild(script);
  }, []);

  // 2. Map Instance Initialization
  React.useEffect(() => {
    if (!isLReady || isMapInit || typeof window === 'undefined') return;
    const L = (window as any).L;
    const container = document.getElementById('andaman-maritime-map');
    if (!container || (container as any)._leaflet_id) return;

    try {
      mapRef.current = L.map('andaman-maritime-map', {
        zoomControl: false, // Disable default
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([11.6667, 92.7500], 12);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);

      setIsMapInit(true);
    } catch (err) {
      console.error("Map Initialization Error:", err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapInit(false);
      }
    };
  }, [isLReady]);

  // 3. Dynamic Marker & Route Registry Sync
  React.useEffect(() => {
    if (!isMapInit || !mapRef.current) return;
    const L = (window as any).L;

    try {
      mapRef.current.eachLayer((layer: any) => {
        if (layer && !layer._url && layer !== mapRef.current) {
          try {
            mapRef.current.removeLayer(layer);
          } catch (e) {}
        }
      });

      if (Array.isArray(territories)) {
        const activeNodes = territories
          .filter(t => t?.coordinates && t.status === 'ACTIVE')
          .slice(0, 12);
          
        const mainHub = activeNodes.find(t => t.name.toLowerCase().includes('port blair'));
        
        let hubPos: any = null;
        if (mainHub) {
          const hp = String(mainHub.coordinates).split(',').map(s => parseFloat(s.trim()));
          if (hp.length >= 2 && !isNaN(hp[0]) && !isNaN(hp[1])) {
            hubPos = L.latLng(hp[0], hp[1]);
          }
        }

        activeNodes.forEach((t, i) => {
          const raw = String(t.coordinates).split(',').map(s => parseFloat(s.trim()));
          if (raw.length >= 2 && !isNaN(raw[0]) && !isNaN(raw[1])) {
            const pos = L.latLng(raw[0], raw[1]);
            const colors = ['#00f3ff', '#00ffaa', '#ff00ee', '#f8ff00', '#ff8800', '#ffffff'];
            const color = colors[i % colors.length];
            
            if (hubPos && pos && !t.name.toLowerCase().includes('port blair')) {
                try {
                  L.polyline([hubPos, pos], {
                      color: color,
                      weight: 1,
                      dashArray: '4, 8',
                      opacity: 0.12
                  }).addTo(mapRef.current);
                } catch (e) {}
            }

            const verticalOffset = i * 26; 

            const icon = L.divIcon({
              className: 'maritime-cyber-pointer',
              html: `<div class="relative">
                    <div class="w-3 h-3 flex items-center justify-center">
                        <div class="absolute w-6 h-6 rounded-full border border-[var(--foreground)]/10 animate-ping" style="border-color: ${color}22"></div>
                        <div class="w-2.5 h-2.5 rounded-full border border-white shadow-[0_0_8px_${color}]" style="background-color: ${color}"></div>
                    </div>
                    <!-- UNIVERSAL VERTICAL PILLAR: ZERO-GAP STACK WITH PREMIUM SHARP ARROW -->
                    <div class="absolute bottom-[2px] left-1/2 -translate-x-1/2 animate-pulse">
                      <svg width="12" height="8" viewBox="0 0 24 16" fill="${color}" style="filter: drop-shadow(0 0 3px ${color}88)">
                        <path d="M0 0 L24 0 L12 16 Z" />
                      </svg>
                    </div>
                    <div class="absolute bottom-[10px] left-1/2 -translate-x-1/2 bg-black/90 border-b-2 backdrop-blur-3xl px-2 py-0.5 flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-fade-in whitespace-nowrap" 
                         style="border-bottom-color: ${color};">
                        <div class="flex items-center gap-1">
                          <span class="text-[5px] font-black text-white/40 uppercase tracking-tighter">NODE REG: 0${i+1}</span>
                          <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span class="text-[10px] font-black text-white uppercase tracking-wider">${t.name}</span>
                        <span class="text-[5px] font-mono text-[${color}] opacity-70">${t.coordinates}</span>
                    </div>
                </div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            L.marker(pos, { icon }).addTo(mapRef.current);
          }
        });
      }
    } catch (err) {
      console.error("Map Sync Failure:", err);
    }
  }, [territories, isMapInit]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-control-zoom { border: none !important; margin: 20px !important; }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out { 
            background-color: rgba(0,0,0,0.6) !important; 
            color: #00d4ff !important; 
            border: 1px solid rgba(0,212,255,0.1) !important; 
            backdrop-filter: blur(10px);
            font-size: 14px !important;
        }
        .leaflet-control-container { z-index: 1000 !important; }
      `}} />
      
      <div 
        id="andaman-maritime-map" 
        className="absolute inset-0 filter saturate-[1.1] brightness-[0.75] contrast-[1.1] hue-rotate-[210deg] opacity-100"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* HUD OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none z-10">
          {/* TOP RIGHT: Stable Connection */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 border border-primary/20 px-2 py-1 rounded-lg z-30 pointer-events-none">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[7px] font-black text-white uppercase tracking-widest">Stable Connection</span>
          </div>
 
          {/* TOP LEFT: Sector: Andaman */}
          <div className="absolute top-4 left-4 bg-black/60 border border-primary/20 px-2 py-1 rounded-lg z-30 pointer-events-none">
              <span className="text-[7px] font-black text-primary uppercase">Sector: Andaman</span>
          </div>
          
          {/* BOTTOM LEFT: Port Blair Node */}
          <div className="absolute bottom-4 left-4 bg-black/60 border border-primary/20 px-2 py-1 rounded-lg z-30 pointer-events-none">
              <span className="text-[7px] font-mono text-muted-foreground uppercase">Port Blair Node</span>
          </div>
 
          {/* BOTTOM RIGHT: LIVE TRACKING 042.8° NE */}
          <div className="absolute bottom-4 right-4 bg-black/60 border border-primary/20 px-2 py-1 rounded-lg z-30 pointer-events-none">
              <span className="text-[7px] font-mono text-white uppercase">LIVE TRACKING 042.8° NE</span>
          </div>
      </div>
 
      {/* Minimalist Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-10" style={{ backgroundImage: 'radial-gradient(circle_at_center, var(--c-primary) 0.5px, transparent 1px)', backgroundSize: '80px 80px' }} />
    </div>
  );
};


const PrawnSVG = () => (
  <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    {/* Curved Segmented Body - Stable Path */}
    <path d="M28 10c-2-4-8-6-14-4-6 2-10 8-10 12" strokeOpacity="0.2" />
    {/* Body Segments with Stable Rotation */}
    {[...Array(5)].map((_, i) => (
      <motion.path 
        key={i} 
        d="M2 0v6" 
        style={{ originY: "top" }}
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
        className="opacity-40"
        transform={`translate(${24-i*4} ${8+i})`}
      />
    ))}
    {/* Paddling Legs - Stable Rotation */}
    {[...Array(6)].map((_, i) => (
      <motion.path 
        key={`leg-${i}`} 
        d="M0 0l-2 3" 
        style={{ originX: "center", originY: "top" }}
        animate={{ rotate: [0, 45, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
        transform={`translate(${10+i*2} 18)`}
      />
    ))}
    {/* Long Antennae */}
    <motion.path 
      d="M28 10c4-2 8-2 10-1M28 10c4 0 8 2 10 3" 
      animate={{ opacity: [0.2, 0.4, 0.2] }} 
      transition={{ duration: 2, repeat: Infinity }}
      strokeOpacity="0.3"
    />
  </svg>
);

const CalamariSVG = () => (
  <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    {/* Mantle with Fins */}
    <path d="M2 12c4-6 12-6 16-2l2 2-2 2c-4 4-12 4-16-2z" fill="currentColor" fillOpacity="0.1" />
    <motion.path 
      d="M10 6c2-1 4-1 6 0M10 18c2 1 4 1 6 0" 
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    {/* Eye */}
    <circle cx="18" cy="12" r="1" fill="currentColor" />
    {/* Trailing Tentacles - Stable Rotation/Scale */}
    {[...Array(6)].map((_, i) => (
      <motion.path 
        key={i} 
        d="M0 0c2 1 4 2 6 0" 
        style={{ originX: "left" }}
        animate={{ rotate: [-10, 10, -10], scaleX: [1, 1.2, 1] }}
        transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
        transform={`translate(20 ${10+i})`}
      />
    ))}
  </svg>
);

const SakuSVG = () => (
  <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    {/* 3D Saku Block */}
    <rect x="4" y="6" width="20" height="12" rx="1" fill="currentColor" fillOpacity="0.05" />
    <path d="M4 6l4-2h20l-4 2M28 4v12l-4 2" strokeOpacity="0.3" />
    {/* Marbling Striations */}
    {[...Array(8)].map((_, i) => (
      <motion.path 
        key={i} 
        d={`M${6+i*2} 6l4 12`} 
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        stroke="white"
        strokeOpacity="0.3"
      />
    ))}
  </svg>
);

const MaritimeWaveDivider = () => {
  const finFish = CATEGORIES.slice(0, 5); 

  return (
    <div className="relative h-12 overflow-hidden bg-gradient-to-r from-[#002147] via-[#00509d] to-[#002147] border-y border-[var(--c-primary)]/50 shadow-[inset_0_0_25px_rgba(0,0,0,0.5)] group/tank">
      {/* 1. TANK DEPTH & LIGHTING */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[var(--foreground)]/20 z-50" />
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            animate={{ opacity: [0.1, 0.4, 0.1], x: ["-2%", "2%"] }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] w-24 h-[200%] bg-[var(--foreground)]/10 rotate-[30deg]"
            style={{ left: (i * 20) + "%" }}
          />
        ))}
      </div>

      {/* 2. RESPONSIVE SEABED COVERAGE (Mobile vs Desktop Density) */}
      {/* 2. OPTIMIZED SEABED (Reduced DOM count for performance) */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex items-end px-0 gap-0 opacity-80 z-10 overflow-hidden lg:hidden">
        {/* Mobile View: 80 Optimized Stones */}
        {[...Array(80)].map((_, i) => {
          const isGem = i % 10 === 0;
          const gemColors = ['#ff0055', '#00f5d4', '#00bbf9', '#fee440', '#ffffff'];
          const gemColor = gemColors[i % gemColors.length];
          return (
            <div 
              key={`pebble-mob-${i}`} 
              className="w-[1.25%] min-w-[3px] rounded-t-full flex-shrink-0"
              style={{ 
                height: (isGem ? (3 + (i % 3)) : (4 + (i % 5))) + 'px',
                backgroundColor: isGem ? gemColor : ['#fecaca', '#bfdbfe', '#bbf7d0', '#fef08a', '#e9d5ff', '#fed7aa', '#ffc9bb'][i % 7],
                filter: isGem ? `brightness(1.6) drop-shadow(0 0 5px ${gemColor})` : 'brightness(0.95) contrast(1.1)',
                transform: isGem ? "rotate(45deg)" : "none",
              }}
            />
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 flex items-end px-0 gap-0 opacity-80 z-10 overflow-hidden hidden lg:flex">
        {/* Desktop View: 200 Optimized Stones */}
        {[...Array(200)].map((_, i) => {
          const isGem = i % 20 === 0;
          const gemColors = ['#ff0055', '#00f5d4', '#00bbf9', '#fee440', '#ffffff'];
          const gemColor = gemColors[i % gemColors.length];
          return (
            <div 
              key={`pebble-desk-${i}`} 
              className="w-[0.5%] min-w-[2px] rounded-t-full flex-shrink-0"
              style={{ 
                height: (isGem ? (3 + (i % 3)) : (4 + (i % 5))) + 'px',
                backgroundColor: isGem ? gemColor : ['#fecaca', '#bfdbfe', '#bbf7d0', '#fef08a', '#e9d5ff', '#fed7aa', '#ffc9bb'][i % 7],
                filter: isGem ? `brightness(1.6) drop-shadow(0 0 5px ${gemColor})` : 'brightness(0.95) contrast(1.1)',
                transform: isGem ? "rotate(45deg)" : "none",
              }}
            />
          );
        })}
      </div>

      {/* 4. SHIMMER BUBBLES */}
      {[15, 25, 35, 45, 55, 65, 75, 85, 95].map((x, streamIdx) => (
        <div key={`bubble-stream-${streamIdx}`} className="absolute bottom-0 h-full z-15" style={{ left: x + "%" }}>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`bubble-${streamIdx}-${i}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: -10, opacity: [0, 0.7, 0], x: ["-3px", "3px", "-3px"] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "linear" }}
              className="absolute w-0.5 h-0.5 bg-[var(--foreground)]/40 rounded-full blur-[0.3px]"
            />
          ))}
        </div>
      ))}

      {/* 5. RESPONSIVE REEF COVERAGE (Seaweed, Corals, Shells, etc.) */}
      <div className="absolute inset-0 z-20 pointer-events-none lg:hidden">
        {/* Mobile View: 30 Items */}
        {[...Array(30)].map((_, i) => {
          const assets = ["🌺", "🌿", "🐚", "🌺", "🌿", "⭐", "🐙", "🐌", "🦀", "🌺", "🌿", "🐚"];
          const asset = assets[i % assets.length];
          const leftPct = (i * 3.3) + 0.5;
          let animation: any = { rotate: [-8, 8, -8], scale: [0.9, 1.1, 0.9] };
          if (asset === "🐙") animation = { y: [0, -6, 0], scale: [1, 1.15, 1] };
          else if (asset === "🐌") animation = { x: [0, 20, 0] };
          else if (asset === "🦀") animation = { x: [0, 8, -8, 0], rotate: [0, 10, -10, 0] };
          return (
            <motion.div
              key={`asset-mob-${i}`}
              animate={animation}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "easeInOut" }}
              className="absolute origin-bottom drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              style={{ fontSize: (10 + (i % 4)) + "px", left: leftPct + "%", bottom: "4px" }}
            >
              {asset}
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-0 z-20 pointer-events-none hidden lg:block">
        {/* Desktop View: 100 Items */}
        {[...Array(100)].map((_, i) => {
          const assets = ["🌺", "🌿", "🐚", "🌺", "🌿", "⭐", "🐙", "🐌", "🦀", "🌺", "🌿", "🐚"];
          const asset = assets[i % assets.length];
          const leftPct = (i * 1);
          let animation: any = { rotate: [-8, 8, -8], scale: [0.9, 1.1, 0.9] };
          if (asset === "🐙") animation = { y: [0, -6, 0], scale: [1, 1.15, 1] };
          else if (asset === "🐌") animation = { x: [0, 30, 0] };
          else if (asset === "🦀") animation = { x: [0, 12, -12, 0], rotate: [0, 10, -10, 0] };
          return (
            <motion.div
              key={`asset-desk-${i}`}
              animate={animation}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "easeInOut" }}
              className="absolute origin-bottom drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              style={{ fontSize: (10 + (i % 6)) + "px", left: leftPct + "%", bottom: "4px" }}
            >
              {asset}
            </motion.div>
          );
        })}
      </div>

      {/* 5. MARINE SNOW (Subtle Particles) */}
      <div className="absolute inset-0 z-5 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            animate={{ y: [0, 50], opacity: [0, 1, 0] }}
            transition={{ duration: 10 + i, repeat: Infinity, delay: i * 2, ease: "linear" }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ left: (i * 7) + "%", top: "-10%" }}
          />
        ))}
      </div>

      {/* 6. DYNAMIC FISH FLEET (LOCKED DIRECTIONAL LOGIC) */}
      {finFish.map((fish, i) => {
        const yBase = 5 + ((i * 15) % 45); 
        const cycleDuration = 120 + ((i * 20) % 60); // Dramatically slower for Zen-like speed
        const delay = i * 4;
        const depthScale = 0.75 + ((i * 0.1) % 0.55); 
        const zIndex = 30 + i;
        
        const leftPath = ["-15%", "115%", "115%", "-15%", "-15%"];
        const leftTimes = [0, 0.46, 0.5, 0.96, 1];
        const orientationPath = [fish.swimRight, fish.swimRight, fish.swimLeft, fish.swimLeft, fish.swimRight];
        
        return (
          <motion.div
            key={`swim-${i}`}
            initial={{ left: "-15%", top: yBase + "%" }}
            animate={{ 
              left: leftPath,
              top: [yBase + "%", (yBase - 6) + "%", yBase + "%", (yBase + 6) + "%", yBase + "%"]
            }}
            transition={{
              left: { duration: cycleDuration, repeat: Infinity, ease: "easeInOut", delay, times: leftTimes },
              top: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute pointer-events-none"
            style={{ zIndex }}
          >
            <motion.div
              animate={{ 
                scaleX: orientationPath,
                rotate: [-4, 4, -4],
                skewY: [-1.5, 1.5, -1.5]
              }}
              transition={{
                scaleX: { duration: cycleDuration, repeat: Infinity, ease: "linear", delay, times: leftTimes },
                rotate: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                skewY: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ scale: depthScale }}
            >
              <img 
                src={fish.image} 
                alt={fish.name} 
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
                style={{ 
                  filter: `brightness(1.0) contrast(1.1)`,
                  mixBlendMode: 'normal',
                  transform: 'translateY(-25%)'
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

const SectionTitle = ({ title, subtitle, centered = false }: { title: string, subtitle?: string, centered?: boolean }) => (
  <div className={cn("mb-2 space-y-0.5 px-4 md:px-0", centered && "text-center")}>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-2xl md:text-5xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

// --- Mock Data ---

// --- Realistic Animated Maritime Icons (High-Fidelity AI Style) ---

const RedSnapperSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="snap-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="60%" stopColor="#EE5253" />
        <stop offset="100%" stopColor="#2D3436" stopOpacity="0.3" />
      </linearGradient>
      <filter id="glow-red">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <motion.path 
      d="M6 24c4-12 24-14 34-2s4 14-10 14-20 0-24-12" 
      fill="url(#snap-body)" 
      filter="url(#glow-red)"
      animate={{ d: ["M6 24c4-12 24-14 34-2s4 14-10 14-20 0-24-12", "M6 24c4-10 24-12 34-2s4 16-10 16-20 0-24-14"] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path d="M38 22l8-6v16l-8-6" fill="#FF6B6B" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity }} />
    <circle cx="15" cy="20" r="1.5" fill="white" fillOpacity="0.8" />
  </svg>
);

const KingfishSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="king-body" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#74B9FF" />
        <stop offset="50%" stopColor="#0984E3" />
        <stop offset="100%" stopColor="#2D3436" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <motion.path 
      d="M4 24c10-8 32-8 40 0s2 8-12 8-22 0-28-8" 
      fill="url(#king-body)"
      animate={{ scaleY: [1, 1.08, 1], x: [-1, 1, -1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <path d="M42 24l4-8v16z" fill="#0984E3" />
    <rect x="10" y="22" width="20" height="1" fill="white" fillOpacity="0.2" rx="0.5" />
  </svg>
);

const PomfretSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <radialGradient id="pom-body" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#DFE6E9" />
        <stop offset="100%" stopColor="#B2BEC3" />
      </radialGradient>
    </defs>
    <motion.path 
      d="M12 24c2-14 22-14 24 0s-22 14-24 0" 
      fill="url(#pom-body)"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <path d="M34 24l8-10v20z" fill="#B2BEC3" />
    <circle cx="18" cy="20" r="1" fill="#2D3436" />
  </svg>
);

const TigerPrawnSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="prawn-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FAB1A0" />
        <stop offset="50%" stopColor="#E17055" />
        <stop offset="100%" stopColor="#D63031" />
      </linearGradient>
    </defs>
    <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
      {/* Segmented Prawn Body - Horizontal */}
      <path d="M4 24c4-6 24-8 34 0s4 6-10 6-20 0-24-6" fill="url(#prawn-grad-2)" />
      {[...Array(6)].map((_, i) => (
        <path key={i} d={`M${12 + i*4} 18v12`} stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
      ))}
      <circle cx="10" cy="22" r="1" fill="#2d3436" />
      {/* Antennae */}
      <motion.path 
        d="M8 22c-4-4-6-8-8-10M8 22c-4 4-6 8-8 10" 
        stroke="#FAB1A0" strokeWidth="0.5" 
        animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Legs - Paddling */}
      {[...Array(4)].map((_, i) => (
        <motion.path key={i} d={`M${15+i*4} 28l-2 4`} stroke="#E17055" strokeWidth="1" animate={{ rotate: [0, 20, 0] }} transition={{ duration: 0.4, delay: i*0.1, repeat: Infinity }} />
      ))}
    </motion.g>
  </svg>
);

const MudCrabSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="crab-3d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D3436" />
        <stop offset="50%" stopColor="#636E72" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>
    </defs>
    <motion.g animate={{ rotate: [-2, 2, -2], x: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
      {/* Front Claws - More 3D Diagonal */}
      <motion.path 
        d="M8 20c-4-4-6-10-2-12s8 4 6 8M40 20c4-4 6-10 2-12s-8 4-6 8" 
        fill="#2D3436" 
        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
      />
      {/* Main Carapace (Diamond/Hex Shape) */}
      <path d="M10 24l14-10 14 10-14 10z" fill="url(#crab-3d)" />
      <path d="M12 24l12-8 12 8-12 8z" fill="white" fillOpacity="0.05" />
      {/* Legs - Articulated scuttle */}
      {[...Array(4)].map((_, i) => (
        <React.Fragment key={i}>
          <motion.path d={`M12 ${18+i*4}l-8 2`} stroke="#2D3436" strokeWidth="2" strokeLinecap="round" animate={{ x: [0, -2, 0] }} transition={{ duration: 0.4, delay: i*0.1, repeat: Infinity }} />
          <motion.path d={`M36 ${18+i*4}l8 2`} stroke="#2D3436" strokeWidth="2" strokeLinecap="round" animate={{ x: [0, 2, 0] }} transition={{ duration: 0.4, delay: i*0.1, repeat: Infinity }} />
        </React.Fragment>
      ))}
      <circle cx="18" cy="20" r="1.5" fill="#FF7675" />
      <circle cx="30" cy="20" r="1.5" fill="#FF7675" />
    </motion.g>
  </svg>
);

const GrouperSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="group-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b4513" />
        <stop offset="60%" stopColor="#5d2e0a" />
        <stop offset="100%" stopColor="#2c3e50" />
      </linearGradient>
    </defs>
    <motion.g animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}>
      {/* Chunky Grouper Body */}
      <path d="M4 24c4-12 30-14 40-2s2 16-14 16-22-2-26-14" fill="url(#group-body)" />
      {/* Camouflage Mottled Pattern */}
      {[...Array(8)].map((_, i) => (
        <circle key={i} cx={15 + Math.cos(i)*10} cy={24 + Math.sin(i)*6} r={1.5 + Math.random()} fill="#f1c40f" fillOpacity="0.15" />
      ))}
      <path d="M40 24l6-8v16z" fill="#5d2e0a" />
      <circle cx="12" cy="22" r="2" fill="#2d3436" />
      <path d="M6 26c2 2 6 2 8 0" stroke="#2d3436" strokeWidth="1" fill="none" />
    </motion.g>
  </svg>
);

const MackerelSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="mack-body" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#dfe6e9" />
        <stop offset="50%" stopColor="#81ecec" />
        <stop offset="100%" stopColor="#00b894" />
      </linearGradient>
    </defs>
    <motion.path 
      d="M2 24c8-8 30-8 38 0s2 8-12 8-20 0-26-8" 
      fill="url(#mack-body)"
      animate={{ scaleY: [1, 1.05, 1], x: [-1, 1, -1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Mackerel Patterns */}
    {[...Array(12)].map((_, i) => (
      <path key={i} d={`M${10+i*2} 20c1 1 2 2 0 4`} stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
    ))}
    <path d="M40 24l6-6v12z" fill="#00b894" />
    <circle cx="10" cy="23" r="1" fill="#2d3436" />
  </svg>
);

const LobsterSVG = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="lob-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D63031" />
        <stop offset="50%" stopColor="#C0392B" />
        <stop offset="100%" stopColor="#4d0000" />
      </linearGradient>
    </defs>
    <motion.g animate={{ x: [1, -1, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
      {/* Segmented Lobster Body - Horizontal */}
      <path d="M4 24c4-8 28-8 36 0s-4 8-16 8-20 0-20-8" fill="url(#lob-grad-2)" />
      {[...Array(8)].map((_, i) => (
        <path key={i} d={`M${12 + i*3} 18v12`} stroke="black" strokeOpacity="0.2" strokeWidth="0.5" />
      ))}
      {/* Head details */}
      <circle cx="8" cy="22" r="1" fill="white" />
      {/* Long Antennae */}
      <motion.path 
        d="M6 22c-4-6-10-10-12-12M6 22c-4 6-10 10-12 12" 
        stroke="#D63031" strokeWidth="1" 
        animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Spiny Legs */}
      {[...Array(5)].map((_, i) => (
        <motion.path key={i} d={`M${10+i*5} 28l-3 5`} stroke="#C0392B" strokeWidth="1" animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.6, delay: i*0.1, repeat: Infinity }} />
      ))}
    </motion.g>
  </svg>
);

const CATEGORIES: {
  name: string;
  image: string;
  color: string;
  glowColor: string;
  slug: string;
  blendMode?: string;
  isFlipped?: boolean;
  swimRight: number;
  swimLeft: number;
  isTransparent?: boolean;
}[] = [
  // FIN FISH SECTOR
  { name: "Red Snapper", image: "/ICONS/Red-snapper.webp", color: "from-rose-600/40 to-red-900/60", glowColor: "#e11d48", slug: "snapper", blendMode: "screen", isFlipped: false, swimRight: -1, swimLeft: 1 },
  { name: "Kingfish", image: "/ICONS/kingfish.webp", color: "from-blue-500/40 to-indigo-900/60", glowColor: "#3b82f6", slug: "kingfish", isFlipped: true, swimRight: -1, swimLeft: 1 },
  { name: "White Pomfret", image: "/ICONS/white-pomfret.webp", color: "from-slate-300/40 to-slate-600/60", glowColor: "#cbd5e1", slug: "pomfret", isFlipped: true, swimRight: -1, swimLeft: 1 },
  { name: "Grouper", image: "/ICONS/grouper.webp", color: "from-amber-800/40 to-amber-950/60", glowColor: "#92400e", slug: "grouper", isFlipped: true, swimRight: -1, swimLeft: 1 },
  { name: "Mackerel", image: "/ICONS/mackerel.webp", color: "from-cyan-500/40 to-blue-800/60", glowColor: "#06b6d4", slug: "mackerel", isFlipped: true, swimRight: -1, swimLeft: 1 },
  
  // EXOTIC / SHELLFISH SECTOR
  { name: "Tiger Prawns", image: "/ICONS/tiger-prawns.webp", color: "from-orange-500/40 to-orange-800/60", glowColor: "#f97316", slug: "prawns", isFlipped: true, swimRight: -1, swimLeft: 1 },
  { name: "Mud Crab", image: "/ICONS/mud-cram.webp", color: "from-emerald-800/40 to-emerald-950/60", glowColor: "#065f46", slug: "crab", isFlipped: false, swimRight: 1, swimLeft: -1 },
  { name: "Spiny Lobster", image: "/ICONS/spiny-lobster.webp", color: "from-red-700/40 to-red-950/60", glowColor: "#b91c1c", slug: "lobster", isFlipped: true, swimRight: -1, swimLeft: 1 },
];

const FEATURED_PRODUCTS = [
  { id: "PRD-101", name: "Saku Grade Bluefin Tuna", price: 2450, rating: 4.9, delivery: "45 min", sellerId: "SEL-001", sellerName: "Marine Masters", image: "🍣" },
  { id: "PRD-102", name: "Andaman King Lobster", price: 3800, rating: 5.0, delivery: "60 min", sellerId: "SEL-002", sellerName: "Deep Sea Fleet", image: "🦞" },
  { id: "PRD-103", name: "Arctic Snow Crab Legs", price: 5200, rating: 4.8, delivery: "90 min", sellerId: "SEL-003", sellerName: "Arctic Harvest", image: "🦀" },
  { id: "PRD-104", name: "Wild Tiger Prawns", price: 1250, rating: 4.7, delivery: "30 min", sellerId: "SEL-004", sellerName: "Coastal Scout", image: "🦐" },
];

const PREMIUM_SELLERS = [
  { id: "SEL-001", name: "Marine Masters", rating: 4.9, speed: "30 min", image: "🚢", banner: "bg-blue-600/10", products: ["🍣", "🐟", "🦑"] },
  { id: "SEL-002", name: "Deep Sea Fleet", rating: 5.0, speed: "45 min", image: "⚓", banner: "bg-purple-600/10", products: ["🦞", "🦀", "🦐"] },
  { id: "SEL-003", name: "Arctic Harvest", rating: 4.8, speed: "60 min", image: "❄️", banner: "bg-cyan-600/10", products: ["🥩", "🐟", "🦀"] },
];

const REVIEWS = [
  { id: "REV-1", user: "Vikram S.", text: "The Bluefin Tuna was absolutely pristine. Delivered in 40 minutes.", rating: 5, image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" },
  { id: "REV-2", user: "Ananya K.", text: "Best lobster I've had in years. The cold-chain delivery is real.", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" },
  { id: "REV-3", user: "Rajesh M.", text: "Professional service and verifyable freshness. OceanExotic Global is the future.", rating: 4.9, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80" },
];

const RECIPES = [
  { id: "REC-1", title: "Pan-Seared King Salmon", time: "20 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80" },
  { id: "REC-2", title: "Spicy Garlic Tiger Prawns", time: "15 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80" },
];

export default function CustomerHomePage() {
  const settings = useSettingsStore();
  const cart = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mounted, setMounted] = React.useState(false);
  const [footerAccordion, setFooterAccordion] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState({ hrs: "00", min: "00", sec: "00" });
  const [cmsContent, setCmsContent] = React.useState<any[]>([]);
  const [territories, setTerritories] = React.useState<any[]>([]);
  const [todaysCatch, setTodaysCatch] = React.useState<any[]>([]);
  const [activeBatch, setActiveBatch] = React.useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [isLoadingCatch, setIsLoadingCatch] = React.useState(true);
  
  // Cut Selection Modal State
  const [selectedProductForCut, setSelectedProductForCut] = React.useState<any>(null);
  const [isCutModalOpen, setIsCutModalOpen] = React.useState(false);
  const [cutOptions, setCutOptions] = React.useState<any[]>([]);
  const [isLoadingCuts, setIsLoadingCuts] = React.useState(false);
  const [selectedCut, setSelectedCut] = React.useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);

  const formatTime12h = React.useCallback((timeStr: string) => {
    if (!timeStr) return "";
    const [hoursStr, minutesStr] = timeStr.split(":");
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutesStr} ${ampm}`;
  }, []);

  const isStoreOpen = React.useMemo(() => {
    if (!settings.ordersEnabled) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    const [openH, openM] = (settings.ordersOpenTime || "09:00").split(":").map(Number);
    const [closeH, closeM] = (settings.ordersCloseTime || "22:00").split(":").map(Number);

    const openTimeMinutes = openH * 60 + openM;
    const closeTimeMinutes = closeH * 60 + closeM;

    return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
  }, [settings.ordersEnabled, settings.ordersOpenTime, settings.ordersCloseTime]);

  // 1. Flash Deal Protocol Timer & CMS Sync
  React.useEffect(() => {
    const fetchCMS = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/system/cms`);
        const data = await res.json();
        if (data.status === 'success') {
          setCmsContent(data.content || []);
        }
      } catch (err) { console.error("CMS Sync Failed"); }
    };
    
    const fetchTerritories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/system/get_territories`);
        if (res.ok) {
          const data = await res.json();
          setTerritories(data);
        }
      } catch (err) { console.error("Territory Sync Failed"); }
    };

    const fetchTodaysCatch = async () => {
      try {
        setIsLoadingCatch(true);
        const res = await fetch(`${API_BASE_URL}/products/todays_catch`);
        const data = await res.json();
        if (data.status === 'success') {
          setTodaysCatch(data.items || []);
        }
      } catch (err) { console.warn("Live Registry Handshake Failure (Silenced)"); }
      finally { setIsLoadingCatch(false); }
    };

    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/list`);
        const data = await res.json();
        if (data.status === 'success') {
          setFeaturedProducts(data.products || []);
        }
      } catch (err) { console.warn("Featured Fetch Failed"); }
    };

    fetchCMS();
    fetchTerritories();
    fetchTodaysCatch();
    fetchFeatured();

    if (!settings.flashDealActive) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(settings.flashDealEnd).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hrs: "00", min: "00", sec: "00" });
        return;
      }

      const hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hrs: hrs.toString().padStart(2, '0'),
        min: min.toString().padStart(2, '0'),
        sec: sec.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.flashDealActive, settings.flashDealEnd]);
  // 2. Absolute Hydration Handshake
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[var(--c-bg)] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--c-primary)]/20 border-t-[var(--c-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  const handleOpenCutModal = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProductForCut(product);
    setIsCutModalOpen(true);
    setIsLoadingCuts(true);
    setSelectedCut(null);
    
    try {
      const prodId = product.product_id || product.id;
      const res = await fetch(`${API_BASE_URL}/products/cut_options?product_id=${prodId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCutOptions(data.cut_options || []);
        if (data.cut_options.length > 0) {
          setSelectedCut(data.cut_options.find((c: any) => c.is_available) || data.cut_options[0]);
        }
      }
    } catch (err) {
      toast("Cut Registry Handshake Failure", "error");
    } finally {
      setIsLoadingCuts(false);
    }
  };

  const handleConfirmCut = () => {
    if (!selectedCut) return;
    
    cart.addItem({
      id: `${selectedProductForCut.product_id || selectedProductForCut.id}-${selectedCut.cut_type}`,
      name: `${selectedProductForCut.name} (${selectedCut.label})`,
      price: selectedCut.final_price,
      quantity: 1,
      image: selectedProductForCut.catch_image_url || selectedProductForCut.image_url || selectedProductForCut.image,
      sellerName: selectedProductForCut.seller_name || selectedProductForCut.sellerName,
      sellerId: selectedProductForCut.seller_id || selectedProductForCut.sellerId || "SEL-000",
      metadata: {
        cut_type: selectedCut.cut_type,
        base_product_id: selectedProductForCut.product_id || selectedProductForCut.id
      }
    });
    
    toast(`${selectedProductForCut.name} [${selectedCut.label}] added to cart`, "success");
    setIsCutModalOpen(false);
  };

  const handleAddToCart = (product: any) => {
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sellerId: product.sellerId
    });
    toast(`${product.name} added to cart`, "success");
  };



  return (
    <div className="w-full">
      {/* 3. HERO SECTION - THEME AWARE IMAGE & ATMOSPHERE */}
      <section className="relative min-h-[40vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[var(--c-gradient-hero)] z-10" />
          <img 
            src={settings.customerAssets.hero} 
            fetchPriority="high"
            className="w-full h-full object-cover scale-110 opacity-40 grayscale-[20%]" 
            alt="OceanExotic Seafood Hero" 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,var(--c-primary),transparent_50%)] opacity-10 hidden lg:block" />
        </div>

        {/* Floating Dynamic Timing Card (Top Right Corner of Banner) */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-30 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "p-3.5 md:p-5 rounded-2xl md:rounded-[24px] bg-[#0b0e14]/85 backdrop-blur-xl border flex flex-col gap-2 md:gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-premium max-w-[200px] md:max-w-[280px]",
              isStoreOpen && settings.ordersEnabled
                ? "border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5"
                : "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/5"
            )}
          >
            {/* Header / Subtitle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className={cn("w-3.5 h-3.5 animate-pulse", 
                  isStoreOpen && settings.ordersEnabled ? "text-emerald-400" : "text-amber-400"
                )} />
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.25em] text-[var(--c-text-secondary)] opacity-60">Delivery Schedule</span>
              </div>
              <span className={cn("w-2 h-2 rounded-full",
                isStoreOpen && settings.ordersEnabled ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"
              )} />
            </div>

            {/* Status Title */}
            <div className="space-y-0.5">
              {isStoreOpen && settings.ordersEnabled ? (
                <>
                  <p className="text-[10px] md:text-sm font-black text-emerald-400 uppercase italic tracking-tighter leading-none">● DELIVERY OPEN</p>
                  <p className="text-[7px] md:text-[9px] text-[var(--c-text-secondary)]/60 font-bold uppercase tracking-wider">Fastest cold-chain delivery</p>
                </>
              ) : (
                <>
                  <p className="text-[10px] md:text-sm font-black text-amber-400 uppercase italic tracking-tighter leading-none">● PRE-ORDERS ACTIVE</p>
                  <p className="text-[7px] md:text-[9px] text-[var(--c-text-secondary)]/60 font-bold uppercase tracking-wider">Immediate delivery closed</p>
                </>
              )}
            </div>

            {/* Time slot registry details */}
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
              <div className="flex justify-between items-center text-[8px] md:text-[10px] font-bold text-[var(--c-text-secondary)] uppercase gap-4">
                <span>Hours</span>
                <span className="text-[var(--c-text-primary)] font-black text-right whitespace-nowrap">
                  {formatTime12h(settings.ordersOpenTime || "09:00")} - {formatTime12h(settings.ordersCloseTime || "22:00")}
                </span>
              </div>
              
              {!isStoreOpen || !settings.ordersEnabled ? (
                <div className="pt-1.5 border-t border-white/[0.04] flex flex-col gap-0.5">
                  <span className="text-[6px] md:text-[7px] font-black text-amber-500/60 uppercase tracking-widest leading-none">Next Dispatch</span>
                  <span className="text-[8px] md:text-[10px] font-black text-[var(--c-text-primary)] uppercase truncate">
                    {settings.ordersNextOpenText || "Tomorrow at 09:00 AM"}
                  </span>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-6 relative z-20 flex flex-col items-center justify-center min-h-[50vh]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center max-w-4xl mx-auto">
             <div className="space-y-6">
                <Badge variant="outline" className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] text-[10px] md:text-[12px] font-black tracking-[0.4em] px-6 py-2 border-[var(--c-primary)]/20 uppercase shadow-[0_0_15px_rgba(var(--c-primary-rgb),0.1)]">
                   {cmsContent.find(c => c.type === 'BANNER' && c.status === 'PUBLISHED')?.sector || 'Premium'} Seafood Market: Active
                </Badge>
                <h1 className="text-5xl md:text-8xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.9] md:leading-[0.85]">
                   {cmsContent.find(c => c.type === 'BANNER' && c.status === 'PUBLISHED')?.title?.split(':')[0] || 'Seafood'} <br /> 
                   <span className="text-[var(--c-primary)]">{cmsContent.find(c => c.type === 'BANNER' && c.status === 'PUBLISHED')?.title?.split(':')[1] || 'Redefined.'}</span>
                </h1>
             </div>
             <p className="text-base md:text-2xl text-[var(--c-text-secondary)] font-medium italic max-w-2xl mx-auto leading-relaxed">
                Delivered Fresh in Under 90 Minutes. Trusted by 50,000+ Customers.
             </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-6">
               <Button 
                  className="h-14 md:h-16 px-8 md:px-12 bg-[var(--c-primary)] hover:bg-[var(--c-primary-light)] text-[var(--foreground)] text-[10px] md:text-[12px] font-black uppercase tracking-widest shadow-[var(--c-shadow-glow)]"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  onClick={() => router.push('/customer/products')}
               >
                  SHOP FRESH SEAFOOD
               </Button>
               <Button 
                  variant="outline" 
                  className="h-14 md:h-16 px-8 md:px-12 text-[10px] md:text-[12px] font-black uppercase tracking-widest border-[var(--foreground)]/10 text-[var(--c-text-primary)] backdrop-blur-md"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  onClick={() => router.push('/customer/categories')}
               >
                  EXPLORE CATEGORIES
               </Button>
            </div>
          </motion.div>


        </div>
      </section>

      {/* MARITIME WAVE DIVIDER - MOBILE SPACED */}
      <div className="mt-[5px] md:mt-0">
         <MaritimeWaveDivider />
      </div>


      {/* 4. CATEGORY VAULT (RIBBON TYPE) */}
      <section className="py-2 container mx-auto px-0 md:px-10">
         <div className="grid grid-cols-8 gap-0 border-y border-[var(--foreground)]/5 overflow-hidden">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} href={`/customer/products?category=${cat.slug}`} className="w-full">
                <div 
                   className="aspect-[1/1.5] md:aspect-square flex flex-col bg-[var(--c-bg-alt)]/20 relative overflow-hidden group hover:bg-[var(--c-bg-alt)]/40 transition-all border-r border-[var(--foreground)]/5"
                   style={{ 
                     clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                     border: `0.5px solid ${cat.glowColor}40`,
                     boxShadow: `inset 0 0 20px ${cat.glowColor}20`
                   }}
                >
                  {/* Subtle Gradient Glow */}
                  <div className={cn("absolute inset-0 opacity-25 group-hover:opacity-45 transition-opacity bg-gradient-to-br", cat.color)} />
                  
                  {/* FIXED IMAGE/ICON AREA */}
                  <div className="flex-1 flex items-center justify-center relative z-10 pt-1">
                    <div 
                      className="text-xl md:text-6xl group-hover:scale-110 transition-transform duration-500 flex items-center justify-center overflow-hidden"
                      style={cat.blendMode === 'screen' ? { mixBlendMode: 'screen' } : cat.isTransparent ? {} : { filter: 'invert(1)', mixBlendMode: 'screen' }}
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-12 h-12 md:w-24 md:h-24 object-contain" 
                        style={{ 
                          filter: `${cat.blendMode === 'screen' ? '' : 'invert(1) '}brightness(1.2) contrast(1.1) drop-shadow(0 0 10px ${cat.glowColor}) drop-shadow(0 0 25px ${cat.glowColor}70)`,
                          transform: cat.isFlipped ? 'scaleX(-1)' : 'none'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* FIXED RIBBON BAR HEIGHT */}
                  <div 
                    className={cn("relative z-10 w-full h-[30px] md:h-12 flex items-center justify-center px-0.5 bg-gradient-to-r transition-all group-hover:brightness-125", cat.color)}
                    style={{ 
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                      borderTop: `1px solid ${cat.glowColor}80`,
                      boxShadow: `0 4px 15px ${cat.glowColor}40`
                    }}
                  >
                    <p className="text-[9px] md:text-xs font-black text-[var(--foreground)] uppercase tracking-tighter text-center leading-[0.85] whitespace-normal break-words">{cat.name}</p>
                  </div>
                </div>
              </Link>
            ))}
         </div>
      </section>

      {/* 4.5 TODAY'S CATCH - LIVE HARBOR INVENTORY */}
      <section className="py-12 container mx-auto px-4 md:px-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <SectionTitle 
              title="Today's Catch" 
              subtitle="Live Harbor Arrival • Freshness Guaranteed" 
            />
            
            <div className="flex bg-[var(--c-bg-alt)]/40 p-1 border border-[var(--foreground)]/5 rounded-2xl">
               {['ALL', 'MORNING', 'AFTERNOON', 'EVENING'].map((batch) => (
                  <button 
                     key={batch}
                     onClick={() => setActiveBatch(batch as any)}
                     className={cn(
                        "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl",
                        activeBatch === batch 
                           ? "bg-[var(--c-primary)] text-[var(--foreground)] shadow-glow-primary" 
                           : "text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"
                     )}
                  >
                     {batch}
                  </button>
               ))}
            </div>
         </div>

         {isLoadingCatch ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
               {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-[var(--c-bg-alt)]/40 rounded-3xl" />
               ))}
            </div>
         ) : todaysCatch.filter(c => activeBatch === 'ALL' || c.batch_label === activeBatch).length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
               {todaysCatch
                  .filter(c => activeBatch === 'ALL' || c.batch_label === activeBatch)
                  .map((catchItem) => (
                  <motion.div 
                     key={catchItem.catch_id} 
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     className="group"
                  >
                     <Link href={`/customer/products/${catchItem.product_id}`}>
                        <Card 
                           className="relative overflow-hidden bg-[var(--c-card)] border-[var(--foreground)]/5 group-hover:border-[var(--c-primary)]/30 transition-all duration-500 shadow-xl group-hover:shadow-[var(--c-shadow-glow)] cursor-pointer h-full"
                           style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                        >
                           <div className="relative aspect-[4/5] bg-black overflow-hidden">
                              <img 
                                 src={catchItem.catch_image_url || catchItem.image_url} 
                                 className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg-alt)] via-transparent to-transparent opacity-60" />
                              
                              {/* Live Status Overlay */}
                              <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                 <Badge variant="glass" className="bg-emerald-500/80 text-[7px] font-black uppercase text-white border-none px-2 py-0.5 animate-pulse">
                                    {catchItem.freshness_label}
                                 </Badge>
                                 <Badge variant="glass" className="bg-black/40 text-[7px] font-black uppercase text-[var(--foreground)] border-[var(--foreground)]/10 px-2 py-0.5">
                                    {catchItem.batch_label} BATCH
                                 </Badge>
                              </div>

                              <div className="absolute top-2 right-2 z-20">
                                 <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-[var(--c-primary)] border border-[var(--c-primary)]/20">
                                    <Anchor className="w-4 h-4" />
                                 </div>
                              </div>

                              {/* Harbor Info */}
                              <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xl border border-[var(--foreground)]/10">
                                    <MapPin className="w-2.5 h-2.5 text-[var(--c-primary)]" />
                                    <span className="text-[7px] font-black text-[var(--foreground)] uppercase truncate max-w-[80px]">{catchItem.harbor_node}</span>
                                 </div>
                              </div>
                              
                              {/* Stock Level */}
                              <div className="absolute bottom-2 right-2 z-20">
                                 <div className="flex flex-col items-end">
                                    <p className="text-[7px] font-black text-[var(--foreground)]/60 uppercase">Stock Remaining</p>
                                    <p className="text-[10px] font-black text-[var(--c-primary)]">{catchItem.remaining_kg}kg</p>
                                 </div>
                              </div>
                           </div>

                           <div className="p-3 md:p-4 space-y-2">
                              <div>
                                 <div className="flex items-center gap-1 mb-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Fresh Catch of the Day</p>
                                 </div>
                                 <h4 className="text-sm md:text-xl font-black text-[var(--c-text-primary)] uppercase italic leading-tight group-hover:text-[var(--c-primary)] transition-colors line-clamp-1">{catchItem.name}</h4>
                                 <p className="text-[8px] font-medium text-[var(--c-text-secondary)] uppercase italic opacity-60">Handled by {catchItem.seller_name}</p>
                              </div>
                              
                              <div className="flex items-center justify-between pt-1">
                                 <div className="space-y-0">
                                    <p className="text-xl md:text-2xl font-black text-[var(--c-text-primary)] italic">₹{catchItem.price_per_kg}<span className="text-[10px] opacity-40">/kg</span></p>
                                 </div>
                                 <button 
                                    onClick={(e) => handleOpenCutModal(e, catchItem)}
                                    className="h-10 px-4 rounded-xl bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)] text-[9px] font-black uppercase hover:scale-105 transition-all flex items-center gap-2"
                                 >
                                    <Plus className="w-4 h-4" /> SELECT CUT
                                 </button>
                              </div>
                           </div>
                        </Card>
                     </Link>
                  </motion.div>
               ))}
            </div>
         ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[var(--foreground)]/5 rounded-3xl opacity-40">
               <Fish className="w-12 h-12 mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">No Live Harbor Stock in this sector</p>
            </div>
         )}
      </section>

      {/* 5. FEATURED PRODUCTS GRID */}
      <section className="py-6 container mx-auto px-[2px] md:px-10 mt-6">
         <div className="space-y-6">
            <SectionTitle title="Featured Harvests" subtitle="Highest Quality Grade" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] md:gap-8">
               {(featuredProducts.length > 0 ? featuredProducts : FEATURED_PRODUCTS).slice(0, 4).map((prod) => (
                  <motion.div 
                    key={prod.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                     <Link href={`/customer/products/${prod.id}`}>
                        <Card 
                           className="relative overflow-hidden bg-[var(--c-card)] border-[var(--foreground)]/5 group-hover:border-[var(--c-primary)]/30 transition-all duration-500 shadow-xl group-hover:shadow-[var(--c-shadow-glow)] cursor-pointer"
                           style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                        >
                           <div className="relative aspect-[4/5] bg-[var(--c-bg-alt)]/60 overflow-hidden">
                              {typeof prod.image === 'string' && (prod.image.startsWith('http') || prod.image.startsWith('/') || prod.image.includes('.')) ? (
                                 <img 
                                    src={prod.image} 
                                    className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000" 
                                    alt={prod.name}
                                 />
                              ) : (
                                 <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl group-hover:scale-110 transition-transform duration-700 select-none">{prod.image}</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg-alt)] via-transparent to-transparent opacity-60" />
                              <div className="absolute top-2 left-2 z-20"><Badge variant="glass" className="bg-black/40 text-[7px] font-black uppercase text-[var(--foreground)] border-[var(--foreground)]/10 px-2 py-0.5">GRADE A</Badge></div>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/40 text-[var(--foreground)]/40 hover:text-danger flex items-center justify-center transition-all"><Heart className="w-4 h-4" /></button>
                              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--c-primary)]/20 backdrop-blur-xl border border-[var(--c-primary)]/20">
                                 <Clock className="w-2.5 h-2.5 text-[var(--c-primary)]" /><span className="text-[7px] font-black text-[var(--c-primary)] uppercase">{prod.delivery}</span>
                              </div>
                           </div>
                           <div className="p-2 md:p-3 space-y-1.5">
                              <div className="space-y-0">
                                 <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-tighter">{prod.sellerName}</p>
                                 <h4 className="text-[11px] md:text-lg font-black text-[var(--c-text-primary)] uppercase italic leading-[1.1] group-hover:text-[var(--c-primary)] transition-colors">{prod.name}</h4>
                              </div>
                              <div className="flex items-center justify-between pt-0.5">
                                 <p className="text-lg md:text-xl font-black text-[var(--c-text-primary)] italic">₹{prod.price.toLocaleString()}</p>
                                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(prod); }} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[var(--c-primary)] flex items-center justify-center shadow-[var(--c-shadow-glow)] hover:scale-105 transition-transform active:scale-95"><Plus className="w-5 h-5 text-[var(--foreground)]" /></button>
                              </div>
                           </div>
                        </Card>
                     </Link>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. FLASH DEALS BANNER - THEME AWARE GRADIENTS */}
      <AnimatePresence>
        {settings.flashDealActive && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="py-4 container mx-auto px-4 md:px-10"
          >
             <Card 
                className="p-6 md:p-12 bg-gradient-to-br from-[var(--c-primary)] via-[var(--c-accent)] to-[var(--c-bg)] overflow-hidden relative shadow-[var(--c-shadow-glow)] group text-center lg:text-left"
                style={{ clipPath: 'polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)' }}
             >
                <div 
                   className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)] md:bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" 
                   style={{ opacity: (settings.atmosphericGlow || 15) / 100 }}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
                   <div className="space-y-4 md:space-y-6">
                      <Badge className="bg-[var(--foreground)]/20 text-[8px] md:text-[10px] font-black tracking-[0.3em] px-4 md:px-6 py-2 border-[var(--foreground)]/20 uppercase">
                        {cmsContent.find(c => c.type === 'PROMO' && c.status === 'PUBLISHED')?.sector || 'Flash Harvest'} Live
                      </Badge>
                      <h2 className="text-4xl md:text-8xl font-black text-[var(--foreground)] uppercase italic leading-[0.9] md:leading-[0.85]">
                        {cmsContent.find(c => c.type === 'PROMO' && c.status === 'PUBLISHED')?.title || 'Flash Deals.'}
                      </h2>
                      <div className="flex gap-2 md:gap-4 justify-center lg:justify-start">
                         {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
                            <div key={i} className="p-3 md:p-6 rounded-xl md:rounded-2xl bg-[var(--foreground)]/10 backdrop-blur-md border border-[var(--foreground)]/20 text-center min-w-[60px] md:min-w-[90px]">
                               <p className="text-xl md:text-5xl font-black text-[var(--foreground)] italic">{val}</p>
                               <p className="text-[7px] md:text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest mt-1">{i === 0 ? 'HRS' : i === 1 ? 'MIN' : 'SEC'}</p>
                            </div>
                         ))}
                      </div>
                      <div className="pt-2 md:pt-4">
                         <Button className="h-14 md:h-16 px-8 md:px-12 bg-white text-[var(--c-primary)] text-[10px] md:text-[12px] font-black uppercase rounded-[var(--c-radius-btn)] w-full lg:w-auto hover:bg-[var(--foreground)]/90 shadow-xl">CLAIM ACCESS NOW</Button>
                      </div>
                   </div>
                   <div className="hidden lg:block relative">
                      {cmsContent.find(c => c.type === 'PROMO' && c.status === 'PUBLISHED')?.image_url ? (
                        <img src={cmsContent.find(c => c.type === 'PROMO' && c.status === 'PUBLISHED')?.image_url} className="w-full h-full object-cover rounded-3xl opacity-80" />
                      ) : (
                        <div className="text-[250px] animate-float opacity-40">🦞</div>
                      )}
                   </div>
                </div>
             </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 7. PREMIUM SELLERS - MAX-DENSITY MOBILE (2PX RULE) */}
      <section className="py-6 container mx-auto px-0 md:px-10 relative">
         <div className="mb-3 space-y-0.5 px-[2px] md:px-0">
            <h2 className="text-xl md:text-5xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Top Sellers</h2>
            <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Verified Sellers</p>
         </div>
         
         <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible gap-[3px] md:gap-6 no-scrollbar pb-4 px-[2px] md:px-2 snap-x snap-mandatory scroll-pl-[2px] touch-pan-x">
            {PREMIUM_SELLERS.map((seller) => (
               <Link 
                  key={seller.id} 
                  href={`/customer/products?sellerId=${seller.id}`}
                  className="relative flex-shrink-0 w-[220px] md:w-full group snap-start cursor-pointer block"
               >
                  {/* Polygonal Hull */}
                  <div 
                     className="absolute inset-0 bg-[var(--c-bg-alt)]/90 border border-[var(--foreground)]/5 transition-all duration-500 group-hover:border-[var(--c-primary)]/40 group-hover:bg-[var(--c-bg-alt)] shadow-xl"
                     style={{ clipPath: 'polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}
                  />
                  
                  <div className="relative z-10 p-3 space-y-3">
                     {/* Mini Header */}
                     <div className="flex justify-between items-center">
                        <span className="text-[6px] font-black text-[var(--c-primary)] uppercase tracking-widest">{seller.id}</span>
                        <div className="flex items-center gap-1">
                           <div className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
                           <span className="text-[6px] font-black text-[var(--foreground)]/40 uppercase">LIVE</span>
                        </div>
                     </div>

                     {/* Compact Info */}
                     <div className="flex items-center gap-3">
                        <div 
                           className="w-10 h-10 bg-[var(--c-bg)] border border-[var(--foreground)]/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform"
                           style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                        >
                           {seller.image}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-base font-black text-[var(--c-text-primary)] uppercase italic leading-none truncate group-hover:text-[var(--c-primary)] transition-colors">{seller.name}</h4>
                           <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-[8px] font-black text-warning">
                                 <Star className="w-2.5 h-2.5 fill-warning animate-pulse" /> 
                                 <span>{seller.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[8px] font-black text-[#00d4ff]">
                                 <Truck className="w-2.5 h-2.5 text-[#00d4ff]" /> 
                                 <span>{seller.speed}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Vibrant Action Area */}
                     <div className="flex items-center justify-between pt-2 border-t border-[var(--foreground)]/5">
                        <div className="flex -space-x-1">
                           {seller.products.map((p, i) => (
                              <div key={i} className="w-5 h-5 rounded-md bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-[10px] grayscale-[0.5] group-hover:grayscale-0 transition-all">{p}</div>
                           ))}
                        </div>
                        <div className="h-6 px-2 text-[7px] font-black uppercase tracking-widest text-[var(--c-primary)] hover:bg-[var(--c-primary)]/10 flex items-center justify-center transition-all">
                           STORE <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                        </div>
                     </div>
                  </div>

                  {/* Micro Corner Accent */}
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--c-primary)]/40 group-hover:border-[var(--c-primary)] transition-all pointer-events-none" />
               </Link>
            ))}
         </div>
      </section>

      {/* 8. LIVE TRACKING - POLYGONAL HARDENED */}
      <section className="py-2 bg-[var(--c-bg-alt)]/20 border-y border-[var(--foreground)]/5">
         <div className="container mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="space-y-12">
               <div className="mb-2 space-y-0.5 px-[2px] md:px-0">
                  <h2 className="text-xl md:text-5xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Live Delivery Coverage</h2>
                  <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Real-Time Delivery Hub Mapping</p>
               </div>
               <div className="flex flex-row gap-4">
                  <button 
                     className="flex-1 flex items-center gap-3 p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 group hover:bg-[var(--c-primary)]/10 transition-all text-left"
                     style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  >
                     <div className="w-10 h-10 bg-[var(--c-primary)]/10 flex items-center justify-center text-[var(--c-primary)] group-hover:scale-110 transition-transform" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)' }}><ShieldCheck className="w-4 h-4" /></div>
                     <div className="flex-1 space-y-0.5">
                        <p className="text-[7px] font-black text-[var(--c-primary)] uppercase tracking-[0.1em]">Done</p>
                        <h4 className="text-xs md:text-sm font-black text-[var(--c-text-primary)] uppercase italic">Order Confirmed</h4>
                     </div>
                  </button>
                  <button 
                     className="flex-1 flex items-center gap-3 p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 group hover:bg-[var(--c-primary)]/10 transition-all text-left"
                     style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  >
                     <div className="w-10 h-10 bg-[var(--c-primary)]/10 flex items-center justify-center text-[var(--c-primary)] group-hover:scale-110 transition-transform" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)' }}><Navigation className="w-4 h-4" /></div>
                     <div className="flex-1 space-y-0.5">
                        <p className="text-[7px] font-black text-[var(--c-primary)] uppercase tracking-[0.1em]">Active</p>
                        <h4 className="text-xs md:text-sm font-black text-[var(--c-text-primary)] uppercase italic">Delivery</h4>
                     </div>
                  </button>
               </div>
            </div>

            <div className="relative group flex justify-center w-full">
               <div 
                  className="border text-text-primary transition-all hover:border-[var(--c-primary)]/30 w-full aspect-[4/3] bg-[#0B1120] border-[var(--foreground)]/10 overflow-hidden shadow-2xl relative"
                  style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
               >
                  {/* ANDAMAN DELIVERY MAP */}
                  <AndamanMaritimeMap territories={territories} />
                  
                  {/* Digital HUD Lines Overlay */}
                  <svg 
                    width="100%" 
                    height="100%" 
                    className="absolute inset-0 pointer-events-none z-[9]"
                  >
                    {/* Tactical Digital Background Grid Lines */}
                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="0" y1="40%" x2="100%" y2="40%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="0" y1="60%" x2="100%" y2="60%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="20%" y1="0" x2="20%" y2="100%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="40%" y1="0" x2="40%" y2="100%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="60%" y1="0" x2="60%" y2="100%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                    <line x1="80%" y1="0" x2="80%" y2="100%" stroke="rgba(0, 243, 255, 0.04)" strokeWidth="1" />
                  </svg>
               </div>
            </div>
         </div>
      </section>

      {/* 9. CUSTOMER REVIEWS - HARDENED HUD */}
      <section className="py-6 container mx-auto px-0 md:px-10">
         <div className="mb-4 space-y-0.5 px-[2px] md:px-0">
            <h2 className="text-xl md:text-5xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Customer Reviews</h2>
            <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Verified Reviews</p>
         </div>
         
         <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible gap-[3px] md:gap-8 no-scrollbar pb-4 px-[2px] md:px-2 snap-x snap-mandatory scroll-pl-[2px] touch-pan-x">
            {REVIEWS.map((rev) => (
               <div key={rev.id} className="relative flex-shrink-0 w-[240px] md:w-full group snap-start">
                  {/* Polygonal Background */}
                  <div 
                     className="absolute inset-0 bg-[var(--c-bg-alt)]/60 border border-[var(--foreground)]/5 transition-all group-hover:border-[var(--c-primary)]/40 group-hover:bg-[var(--c-bg-alt)]/80"
                     style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  />
                  <div className="relative z-10 p-4 space-y-3">
                     <div className="flex items-center gap-3">
                        <div 
                           className="w-10 h-10 border border-[var(--c-primary)]/20 overflow-hidden group-hover:border-[var(--c-primary)] transition-all"
                           style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                        >
                           <img src={rev.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-[var(--c-text-primary)] italic leading-none">{rev.user}</p>
                           <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-warning text-warning animate-pulse" />)}
                           </div>
                        </div>
                     </div>
                     <p className="text-xs text-[var(--c-text-secondary)] font-medium leading-relaxed italic opacity-80 line-clamp-3">"{rev.text}"</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* 10. CHEF'S RECIPES - HARDENED HUD TILES */}
      <section className="py-6 container mx-auto px-[2px] md:px-10">
         <div className="mb-4 flex justify-between items-end px-[2px] md:px-0">
            <div>
               <h2 className="text-xl md:text-5xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Chef's Recipes</h2>
               <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Verified Recipes</p>
            </div>
            <button 
               onClick={() => router.push('/customer/recipes')}
               className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] border border-[var(--c-primary)]/20 rounded-xl bg-[var(--c-primary)]/5 hover:bg-[var(--c-primary)]/10 transition-all active:scale-95"
            >
               VIEW ALL ➜
            </button>
         </div>
         
         <div className="grid grid-cols-2 gap-[3px] md:gap-10">
            {(cmsContent.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED').length > 0 
               ? cmsContent.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED')
               : RECIPES).map((recipe: any) => {
               const meta = recipe.metadata ? (typeof recipe.metadata === 'string' ? JSON.parse(recipe.metadata) : recipe.metadata) : {};
               return (
               <div 
                  key={recipe.id} 
                  onClick={() => router.push(`/customer/recipes/${recipe.id}`)}
                  className="aspect-[16/11] md:aspect-video relative group cursor-pointer overflow-hidden"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
               >
                  <img src={recipe.image || recipe.image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg)] via-[var(--c-bg)]/20 to-transparent" />
                  
                  {/* Decorative Scan Line */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--c-primary)] opacity-0 group-hover:opacity-40 transition-opacity animate-scan" />
                  
                  <div className="absolute bottom-3 left-3 right-3 space-y-2 md:bottom-10 md:left-10 md:right-10 md:space-y-4">
                     <div className="flex gap-1.5">
                        <Badge variant="glass" className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[7px] md:text-xs font-black uppercase px-2 py-0">{meta.difficulty || recipe.difficulty || 'Expert'}</Badge>
                        <Badge variant="glass" className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[7px] md:text-xs font-black uppercase px-2 py-0 text-[var(--foreground)]/60">{meta.time || recipe.time || '25 min'}</Badge>
                     </div>
                     <h4 className="text-xs md:text-4xl font-black text-[var(--foreground)] uppercase italic leading-tight">{recipe.title}</h4>
                     <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--c-primary)] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        VIEW RECIPE <ArrowRight className="w-3 h-3" />
                     </div>
                  </div>
               </div>
               );
            })}
         </div>
      </section>

      {/* 11. MOBILE APP PROMOTION - HARDENED SHELL */}
      <section className="py-6 container mx-auto px-[2px] md:px-10">
         <div 
            className="relative p-6 md:p-12 bg-gradient-to-br from-[var(--c-bg-alt)]/80 to-[var(--c-bg)] border border-[var(--foreground)]/5 shadow-premium overflow-hidden group"
            style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--c-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
               <div className="space-y-6">
                  <Badge variant="glass" className="text-[var(--c-primary)] text-[9px] font-black tracking-[0.3em] border-[var(--c-primary)]/30 bg-[var(--c-primary)]/10 px-4 py-1">OCEANFRESH MOBILE APP</Badge>
                  <h2 className="text-4xl md:text-8xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.85] tracking-tighter">The Market in <br /> Your Pocket.</h2>
                  <p className="text-xs md:text-lg text-[var(--c-text-secondary)] font-medium italic opacity-60 max-w-sm">Get our recipes and fresh catch updates right on your phone. Easy ordering, real-time order tracking.</p>
                  
                  <div className="flex flex-row gap-[4px] justify-center lg:justify-start">
                     <Button 
                        className="flex-1 h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 gap-3 flex items-center justify-center hover:bg-[var(--c-primary)]/20 transition-all group/btn"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                     >
                        <Smartphone className="w-5 h-5 text-[var(--c-primary)]" />
                        <div className="text-left">
                           <p className="text-[7px] font-black text-[var(--foreground)]/40 uppercase">Download</p>
                           <p className="text-[10px] font-black text-[var(--foreground)] italic">APP STORE</p>
                        </div>
                     </Button>
                     <Button 
                        className="flex-1 h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 gap-3 flex items-center justify-center hover:bg-[var(--c-primary)]/20 transition-all group/btn"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                     >
                        <Play className="w-5 h-5 text-[var(--c-primary)]" />
                        <div className="text-left">
                           <p className="text-[7px] font-black text-[var(--foreground)]/40 uppercase">Registry</p>
                           <p className="text-[10px] font-black text-[var(--foreground)] italic">GOOGLE PLAY</p>
                        </div>
                     </Button>
                  </div>
               </div>
               
               <div className="relative flex justify-center group/phone">
                   <div className="w-64 md:w-72 h-[448px] md:h-[560px] bg-[var(--c-bg)] border-[8px] md:border-[10px] border-[var(--foreground)]/10 rounded-[36px] md:rounded-[48px] shadow-2xl relative overflow-hidden rotate-3 md:rotate-6 group-hover:rotate-0 transition-all duration-1000 flex flex-col">
                     <div className="h-10 md:h-14 bg-[var(--c-primary)]/10 border-b border-[var(--foreground)]/5 flex items-center justify-between px-6">
                        <div className="w-8 h-1.5 md:h-2 bg-[var(--c-primary)] rounded-full opacity-40" />
                        <div className="flex gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-success/40" />
                           <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                        </div>
                     </div>
                     
                     <div className="flex-1 relative bg-[#020617] overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                        <div className="absolute inset-0 origin-center animate-spin-slow opacity-30" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, var(--c-primary) 60deg, transparent 60deg, #ff0055 120deg, transparent 120deg, #00ff88 180deg, transparent 180deg)' }} />
                        
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--c-primary)]/20 blur-[60px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ff0055]/10 blur-[60px] rounded-full" />

                        <div className="absolute top-1/4 left-1/3 w-3 h-3 md:w-4 md:h-4 rounded-full bg-[var(--c-primary)] shadow-[0_0_15px_var(--c-primary)] animate-pulse" />
                        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-danger shadow-[0_0_10px_#ff0055] animate-ping" />
                        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#00ff88] animate-pulse" />
                        <div className="absolute top-2/3 right-1/3 w-3 h-3 rounded-full bg-warning shadow-[0_0_15px_#ffaa00] animate-pulse" style={{ animationDelay: '1s' }} />
                        
                        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--c-primary)] to-transparent shadow-[0_0_20px_var(--c-primary)] animate-scan z-20" />
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                           <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--c-primary)]">
                              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
                              <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.6 4.3 1.62 6" />
                              <path d="M12 12v1" /><path d="M12 7v2" /><path d="M12 3v2" />
                           </svg>
                        </div>
                        
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 space-y-2 md:space-y-4 z-30">
                           <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 backdrop-blur-xl space-y-2">
                              <div className="flex justify-between items-center">
                                 <p className="text-[7px] md:text-[8px] font-black text-[var(--c-primary)] uppercase tracking-widest">REAL-TIME SYNC</p>
                                 <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-success" />
                                    <p className="text-[7px] md:text-[8px] font-black text-success uppercase">ENCRYPTED</p>
                                 </div>
                              </div>
                              <div className="h-1 md:h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-[var(--c-primary)] to-[#00ff88] w-[85%] animate-pulse" />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="h-12 md:h-16 bg-[var(--foreground)]/5 border-t border-[var(--foreground)]/5 flex items-center justify-around px-4">
                        {[1, 2, 3, 4].map((i) => (
                           <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center border border-[var(--foreground)]/5 group/icon hover:bg-[var(--c-primary)]/10 transition-colors">
                              <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-[var(--c-primary)]' : 'bg-[var(--foreground)]/20'} group-hover/icon:scale-125 transition-transform`} />
                           </div>
                        ))}
                     </div>
                   </div>
                </div>
            </div>
         </div>      </section>

      {/* 11.5 SECONDARY PROMOTIONAL CAMPAIGN - VIBRANT ICONIC HUD */}
      <section className="py-1 container mx-auto px-0 md:px-10 relative group">
         <div className="relative min-h-[230px] md:min-h-[500px] bg-[var(--c-bg-alt)] border border-[var(--foreground)]/5 overflow-hidden shadow-2xl">
            {/* MOBILE: CORNER-TO-CORNER | DESKTOP: INTERLOCKING SIDE-SPLIT */}
            <div className="absolute inset-0">
               {/* PANEL A: MARITIME GRILL MASTERS */}
               <div 
                  className="absolute inset-0 z-20 p-4 md:p-16 flex flex-col justify-start items-start transition-all duration-500"
                  style={{ 
                     clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                     background: 'linear-gradient(135deg, rgba(var(--c-bg-alt-rgb), 0.98) 0%, transparent 100%)'
                  }}
               >
                  {/* Staggered Floating HUD Icons for A */}
                  <div className="absolute inset-0 pointer-events-none opacity-60">
                     {[
                        { Icon: Flame, top: '2%', left: '75%', color: 'text-danger', delay: 0, size: 'w-6 h-6 md:w-16 md:h-16' },
                        { Icon: ChefHat, top: '20%', left: '55%', color: 'text-[var(--c-primary)]', delay: 0.5, size: 'w-6 h-6 md:w-12 md:h-12' },
                        { Icon: Fish, top: '40%', left: '35%', color: 'text-[var(--c-primary)]', delay: 1, size: 'w-10 h-10 md:w-20 md:h-20', rotate: -45 },
                        { Icon: Utensils, top: '60%', left: '15%', color: 'text-[var(--foreground)]', delay: 1.5, size: 'w-4 h-4 md:w-10 md:h-10' },
                        { Icon: Timer, top: '10%', left: '45%', color: 'text-success', delay: 0.2, size: 'w-4 h-4 md:w-8 md:h-8' },
                        { Icon: Activity, top: '35%', left: '70%', color: 'text-danger', delay: 0.8, size: 'w-5 h-5 md:w-10 md:h-10' },
                        { Icon: Zap, top: '5%', left: '90%', color: 'text-warning', delay: 1.2, size: 'w-4 h-4 md:w-8 md:h-8' }
                     ].map((item, i) => (
                        <motion.div
                           key={i}
                           className={cn("absolute", item.color, item.size)}
                           style={{ top: item.top, left: item.left }}
                           initial={{ opacity: 0, y: 10, rotate: item.rotate || 0 }}
                           animate={{ 
                              opacity: 1, 
                              y: [0, -15, 0],
                              rotate: (item.rotate || 0) + (i % 2 === 0 ? 5 : -5)
                           }}
                           transition={{ 
                              y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                              rotate: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                              opacity: { duration: 1, delay: item.delay }
                           }}
                        >
                           <item.Icon className="w-full h-full" />
                        </motion.div>
                     ))}
                  </div>

                  <div className="relative z-30 max-w-[50%]">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-1 text-[var(--c-primary)]"
                    >
                      <Zap className="w-2.5 h-2.5 md:w-4 md:h-4 animate-pulse" />
                      <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em]">Grill Mode</span>
                    </motion.div>
                    <div className="space-y-0.5 md:space-y-1">
                       <h3 className="text-lg md:text-5xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.85] tracking-tighter">
                          SEAFOOD <br />
                          <span className="text-[var(--c-primary)]">GRILL.</span>
                       </h3>
                       <p className="text-[8px] md:text-xs text-[var(--c-text-secondary)] font-medium italic opacity-80 leading-tight">
                          Volcanic harvests.
                       </p>
                    </div>
                    <Button 
                       className="h-6 md:h-10 px-3 md:px-6 mt-2 bg-[var(--c-primary)] text-[var(--foreground)] text-[6px] md:text-[8px] font-black uppercase"
                       style={{ clipPath: 'polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px)' }}
                    >
                       EXPLORE
                    </Button>
                  </div>
               </div>

               {/* PANEL B: FLAME-SEA COLLECTIONS */}
               <div 
                  className="absolute inset-0 z-10 flex flex-col justify-end items-end p-4 md:p-16 transition-all duration-500 bg-[#020617]"
                  style={{ 
                     clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                  }}
               >
                  {/* Staggered Floating HUD Icons for B */}
                  <div className="absolute inset-0 pointer-events-none opacity-60">
                     {[
                        { Icon: Waves, bottom: '2%', right: '75%', color: 'text-[#00d4ff]', delay: 0.1, size: 'w-8 h-8 md:w-20 md:h-20' },
                        { Icon: Gauge, bottom: '20%', right: '55%', color: 'text-success', delay: 0.6, size: 'w-6 h-6 md:w-12 md:h-12' },
                        { Icon: Anchor, bottom: '40%', right: '35%', color: 'text-[var(--foreground)]', delay: 1.1, size: 'w-8 h-8 md:w-16 md:h-16', rotate: 12 },
                        { Icon: Ship, bottom: '60%', right: '15%', color: 'text-warning', delay: 1.6, size: 'w-6 h-6 md:w-12 md:h-12' },
                        { Icon: Compass, bottom: '10%', right: '45%', color: 'text-[var(--c-primary)]', delay: 0.3, size: 'w-5 h-5 md:w-10 md:h-10' },
                        { Icon: Wind, bottom: '35%', right: '70%', color: 'text-[#00d4ff]', delay: 0.9, size: 'w-5 h-5 md:w-10 md:h-10' },
                        { Icon: Navigation, bottom: '5%', right: '90%', color: 'text-success', delay: 1.3, size: 'w-4 h-4 md:w-8 md:h-8' },
                        { Icon: Shell, bottom: '15%', right: '85%', color: 'text-warning', delay: 0.5, size: 'w-6 h-6 md:w-12 md:h-12', rotate: 45 }
                     ].map((item, i) => (
                        <motion.div
                           key={i}
                           className={cn("absolute", item.color, item.size)}
                           style={{ bottom: item.bottom, right: item.right }}
                           initial={{ opacity: 0, y: -10, rotate: item.rotate || 0 }}
                           animate={{ 
                              opacity: 1, 
                              y: [0, 15, 0],
                              rotate: (item.rotate || 0) + (i % 2 === 0 ? -5 : 5)
                           }}
                           transition={{ 
                              y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                              rotate: { duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                              opacity: { duration: 1, delay: item.delay }
                           }}
                        >
                           <item.Icon className="w-full h-full" />
                        </motion.div>
                     ))}
                  </div>

                  <div className="relative z-30 text-right max-w-[50%] space-y-1">
                     <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="text-[6px] md:text-[8px] font-black text-[var(--foreground)]/80 uppercase tracking-[0.3em]"
                     >
                        Node: Flame
                     </motion.p>
                     <h4 className="text-lg md:text-4xl font-black text-[var(--foreground)] uppercase italic leading-none drop-shadow-2xl">FLAME-SEA <br /> COLLECTIONS</h4>
                     <div className="h-0.5 w-8 md:w-20 bg-[var(--c-primary)] ml-auto shadow-[0_0_10px_var(--c-primary)]" />
                  </div>
               </div>
            </div>

            {/* Corner Indicators */}
            <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[var(--c-primary)] opacity-40" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[var(--c-primary)] opacity-40" />
         </div>
      </section>

      {/* 12. TRUST & NEWSLETTER - VIBRANT & POLYGONAL */}
      <section className="py-8 container mx-auto px-[2px] md:px-10 space-y-4">
         <div className="grid grid-cols-4 gap-[2px] md:gap-12 border-b border-[var(--foreground)]/5 pb-4">
            {[ 
               { icon: <ShieldCheck className="w-full h-full" />, title: "Authorized", color: "text-[#00ff88] bg-[#00ff88]/5" }, 
               { icon: <Zap className="w-full h-full" />, title: "Instant", color: "text-warning bg-warning/5" }, 
               { icon: <Clock className="w-full h-full" />, title: "Cold-Chain", color: "text-[#00d4ff] bg-[#00d4ff]/5" }, 
               { icon: <MapPin className="w-full h-full" />, title: "Local", color: "text-danger bg-danger/5" } 
            ].map((item, i) => (
               <div key={i} className="text-center space-y-2 group">
                  <div 
                     className={`w-12 h-12 md:w-20 md:h-20 mx-auto flex items-center justify-center transition-all shadow-lg border border-[var(--foreground)]/5 ${item.color}`}
                     style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                  >
                     <div className="w-5 h-5 md:w-10 md:h-10">{item.icon}</div>
                  </div>
                  <h4 className="text-[7px] md:text-sm font-black text-[var(--c-text-primary)] uppercase italic tracking-widest">{item.title}</h4>
               </div>
            ))}
         </div>
         
         <div 
            className="relative p-6 md:p-12 bg-[var(--c-bg-alt)] border border-[var(--foreground)]/5 shadow-premium text-center space-y-6 overflow-hidden"
            style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
         >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--c-primary)] to-transparent opacity-20" />
            <div className="space-y-2">
               <p className="text-[8px] md:text-[10px] font-black text-[var(--c-primary)] uppercase tracking-[0.4em]">Newsletter Subscription</p>
               <h2 className="text-3xl md:text-7xl font-black text-[var(--c-text-primary)] uppercase italic leading-none">Join our Newsletter.</h2>
            </div>
            <div className="max-w-xl mx-auto relative z-10 flex flex-col md:flex-row gap-2">
               <Input 
                  placeholder="Your Email..." 
                  className="h-12 md:h-20 !rounded-none bg-black/40 border-[var(--foreground)]/10 text-center text-xs italic px-6 text-[var(--c-text-primary)]" 
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)', borderRadius: '0px' }}
               />
               <Button 
                  className="h-12 md:h-20 px-10 !rounded-none bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)] text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)', borderRadius: '0px' }}
               >
                  SUBSCRIBE
               </Button>
            </div>
         </div>
      </section>

      {/* CUT SELECTION MODAL - HARDENED HUD */}
      <AnimatePresence>
        {isCutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCutModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[var(--c-bg)] border border-[var(--foreground)]/10 shadow-2xl overflow-hidden"
              style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-[var(--c-bg-alt)]/60 border-b border-[var(--foreground)]/5 flex justify-between items-center">
                <div className="space-y-1">
                  <Badge variant="glass" className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[9px] font-black uppercase tracking-widest px-3">Order Customization</Badge>
                  <h3 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] uppercase italic leading-tight">
                    {selectedProductForCut?.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCutModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-[var(--foreground)] hover:text-[var(--c-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 space-y-6">
                {isLoadingCuts ? (
                  <div className="space-y-4 py-12 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[var(--c-primary)]/20 border-t-[var(--c-primary)] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-[var(--c-primary)] uppercase tracking-widest animate-pulse">Accessing Cut Registry...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em]">Select Cut Type</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cutOptions.map((cut) => (
                          <button
                            key={cut.id}
                            disabled={!cut.is_available}
                            onClick={() => setSelectedCut(cut)}
                            className={cn(
                              "p-4 border transition-all relative flex flex-col items-start gap-2 group/cut text-left",
                              !cut.is_available && "opacity-40 cursor-not-allowed grayscale",
                              selectedCut?.id === cut.id 
                                ? "bg-[var(--c-primary)]/10 border-[var(--c-primary)] shadow-glow-primary" 
                                : "bg-black/20 border-[var(--foreground)]/5 hover:border-[var(--foreground)]/20"
                            )}
                            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                          >
                            <div className="flex w-full justify-between items-center">
                              <span className="text-2xl">{cut.icon}</span>
                              {selectedCut?.id === cut.id && (
                                <div className="w-2 h-2 rounded-full bg-[var(--c-primary)] animate-pulse shadow-[0_0_8px_var(--c-primary)]" />
                              )}
                            </div>
                            <div>
                              <h4 className={cn(
                                "text-sm font-black uppercase italic",
                                selectedCut?.id === cut.id ? "text-[var(--c-primary)]" : "text-[var(--c-text-primary)]"
                              )}>{cut.label}</h4>
                              <p className="text-[8px] font-medium text-[var(--c-text-secondary)] uppercase opacity-60">{cut.desc}</p>
                            </div>
                            <div className="mt-2 w-full flex justify-between items-end">
                              <p className="text-lg font-black text-[var(--c-text-primary)] italic">₹{cut.final_price}</p>
                              <Badge className="bg-black/40 text-[7px] font-black">{cut.is_available ? 'AVAILABLE' : 'OUT OF STOCK'}</Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--foreground)]/5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1 text-center md:text-left">
                        <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">Item Total</p>
                        <p className="text-3xl font-black text-[var(--c-text-primary)] italic">₹{selectedCut?.final_price || 0}</p>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsCutModalOpen(false)}
                          className="flex-1 md:px-8 h-14 border border-[var(--foreground)]/5 text-[10px] font-black uppercase"
                        >
                          Abort
                        </Button>
                        <Button 
                          onClick={handleConfirmCut}
                          disabled={!selectedCut}
                          className="flex-[2] md:px-12 h-14 bg-[var(--c-primary)] text-[var(--foreground)] shadow-glow-primary text-[10px] font-black uppercase tracking-widest"
                          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
                        >
                          Confirm & Add
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
