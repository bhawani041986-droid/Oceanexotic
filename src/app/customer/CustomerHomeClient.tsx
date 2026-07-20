"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Activity,
  Sparkles,
  Gift,
  PartyPopper,
  Crown,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";
import dynamic from 'next/dynamic';
import { AtmosphericGlow } from "@/components/ui/AtmosphericGlow";
const OceanReelsFeed = dynamic(
  () => import('@/components/video/OceanReelsFeed').then((mod) => mod.OceanReelsFeed),
  { ssr: false, loading: () => <div className="w-full h-[250px] bg-[var(--c-bg)] animate-pulse my-4 border-y border-[var(--foreground)]/5" /> }
);
import { FULL_API_URL as API_BASE_URL } from "@/config/api";
import { ServiceAreaChecker } from "@/components/customer/ServiceAreaChecker";
import { useCategories } from "@/hooks/useCategories";

// --- Components ---

const AndamanMaritimeMap = ({ territories, mapId = 'andaman-maritime-map' }: { territories: any[], mapId?: string }) => {
  const mapRef = React.useRef<any>(null);
  const [isLReady, setIsLReady] = React.useState(false);
  const [isMapInit, setIsMapInit] = React.useState(false);
  
  // 1. Script & CSS Delivery
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
    const container = document.getElementById(mapId);
    if (!container || (container as any)._leaflet_id) return;

    try {
      mapRef.current = L.map(mapId, {
        zoomControl: false, // Disable default
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([11.6667, 92.7500], 12);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
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

  // 3. Dynamic Marker & Route Catalog Sync
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
        id={mapId} 
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

// --- ALL 51 CUSTOM SVG CORAL & SEAWEED COMPONENTS ---
const Coral1 = ({ h = 48 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 80 100" className="drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">
    <path d="M40 100 C40 70 25 60 15 40 C5 20 10 15 15 5 C20 15 25 25 35 45 C35 30 25 15 35 5 C40 15 45 30 40 50 C45 35 55 20 65 5 C70 15 65 30 55 55 Z" fill="#86efac" />
    <path d="M15 40 C5 20 10 15 15 5 C20 15 25 25 35 45 Z" fill="#f472b6" />
    <path d="M55 55 C65 30 70 15 65 5 C55 20 45 35 40 50 Z" fill="#f472b6" />
  </svg>
);

const Coral2 = ({ h = 44 }) => (
  <svg width={h * 1.1} height={h} viewBox="0 0 90 80" className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
    <path d="M10 70 C10 40 30 30 45 20 C60 30 80 40 80 70 C70 75 20 75 10 70 Z" fill="#1e3a8a" />
    <path d="M15 60 C25 45 45 35 75 60 Z" fill="#2563eb" />
    <path d="M25 50 C35 38 55 38 65 50 Z" fill="#60a5fa" />
  </svg>
);

const Coral3 = ({ h = 56 }) => (
  <svg width={h * 0.45} height={h} viewBox="0 0 40 100" className="animate-sway-seaweed-left">
    <path d="M20 100 Q 0 75 20 50 Q 40 25 20 0 Q 30 25 10 50 Q 30 75 20 100 Z" fill="#6ee7b7" />
  </svg>
);

const Coral4 = ({ h = 58 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 100" className="animate-sway-seaweed-right">
    <path d="M25 100 Q 5 70 25 35 Q 40 15 25 0 Q 35 20 15 45 Q 35 70 25 100 Z" fill="#047857" />
  </svg>
);

const Coral5 = ({ h = 52 }) => (
  <svg width={h * 0.7} height={h} viewBox="0 0 70 100" className="animate-sway-seaweed-left">
    <path d="M20 100 Q 5 60 20 20 Q 30 40 10 70 Z" fill="#10b981" />
    <path d="M35 100 Q 20 50 35 10 Q 45 30 25 70 Z" fill="#eab308" />
    <path d="M50 100 Q 40 60 50 25 Q 60 45 45 75 Z" fill="#6ee7b7" />
  </svg>
);

const Coral6 = ({ h = 54 }) => (
  <svg width={h * 0.6} height={h} viewBox="0 0 60 100" className="animate-sway-seaweed-right">
    <path d="M30 100 Q 5 75 35 45 Q 55 20 30 0 Q 20 20 40 45 Q 10 75 30 100 Z" fill="#ec4899" />
    <path d="M25 90 Q 45 65 20 35 Q 40 15 25 5 Z" fill="#38bdf8" opacity="0.8" />
  </svg>
);

const Coral7 = ({ h = 42 }) => (
  <svg width={h * 1.2} height={h} viewBox="0 0 100 80" className="drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]">
    <path d="M10 60 C10 20 90 20 90 60 C80 75 20 75 10 60 Z" fill="#1d4ed8" />
    <path d="M20 50 Q 35 30 50 50 Q 65 30 80 50 Q 65 65 50 50 Q 35 65 20 50 Z" stroke="#93c5fd" strokeWidth="4" fill="none" />
  </svg>
);

const Coral8 = ({ h = 56 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 80 100" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]">
    <rect x="10" y="30" width="14" height="65" rx="7" fill="#10b981" />
    <rect x="28" y="10" width="16" height="85" rx="8" fill="#34d399" />
    <rect x="48" y="20" width="14" height="75" rx="7" fill="#059669" />
    <ellipse cx="17" cy="30" rx="6" ry="3" fill="#064e3b" />
    <ellipse cx="36" cy="10" rx="7" ry="3.5" fill="#064e3b" />
    <ellipse cx="55" cy="20" rx="6" ry="3" fill="#064e3b" />
    <line x1="30" y1="25" x2="42" y2="25" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
    <line x1="30" y1="45" x2="42" y2="45" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
  </svg>
);

const Coral9 = ({ h = 52 }) => (
  <svg width={h * 0.9} height={h} viewBox="0 0 90 100" className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
    <path d="M45 100 L45 70 M45 70 L20 40 M45 70 L70 40 M20 40 L10 20 M20 40 L30 20 M70 40 L60 20 M70 40 L80 20" stroke="#ef4444" strokeWidth="3" fill="none" />
    <path d="M10 20 Q 45 10 80 20 M15 30 Q 45 20 75 30 M25 50 Q 45 40 65 50 M30 65 Q 45 55 60 65" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.8" />
  </svg>
);

const Coral10 = ({ h = 48 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 85 100" className="drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
    <path d="M42 100 L42 50 L20 25 L10 5 L25 15 L35 35 L42 50 L50 35 L60 15 L75 5 L65 25 L42 50 Z" fill="#eab308" />
  </svg>
);

const Coral11 = ({ h = 46 }) => (
  <svg width={h * 1.1} height={h} viewBox="0 0 90 80" className="animate-pulse-coral-glow">
    <path d="M25 80 C25 45 65 45 65 80 Z" fill="#dc2626" />
    <circle cx="35" cy="65" r="2" fill="#ffffff" />
    <circle cx="50" cy="60" r="2" fill="#ffffff" />
    <path d="M30 45 Q 15 25 5 10 M35 45 Q 25 15 20 0 M45 45 L45 0 M55 45 Q 65 15 70 0 M60 45 Q 75 25 85 10" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Coral12 = ({ h = 40 }) => (
  <svg width={h * 1.1} height={h} viewBox="0 0 80 70" className="drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]">
    <path d="M10 50 C 10 20, 70 20, 70 50 C 60 65, 20 65, 10 50 Z" fill="#f43f5e" />
    <path d="M20 40 C 20 25, 60 25, 60 40 C 50 50, 30 50, 20 40 Z" fill="#9f1239" />
  </svg>
);

const Coral13 = ({ h = 44 }) => (
  <svg width={h * 0.9} height={h} viewBox="0 0 70 80">
    <path d="M10 70 L25 30 L5 10 L35 15 L45 70 Z" fill="#ca8a04" />
    <path d="M35 70 L50 25 L35 5 L65 10 L60 70 Z" fill="#eab308" />
    <ellipse cx="20" cy="12" rx="15" ry="5" fill="#854d0e" />
    <ellipse cx="50" cy="8" rx="15" ry="5" fill="#854d0e" />
  </svg>
);

const Coral14 = ({ h = 50 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 90" className="drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">
    <path d="M40 90 Q 10 50 10 25 Q 40 5 70 25 Q 70 50 40 90 Z" fill="#38bdf8" opacity="0.85" />
    <circle cx="30" cy="35" r="4" fill="#0284c7" />
    <circle cx="50" cy="35" r="4" fill="#0284c7" />
    <circle cx="40" cy="50" r="5" fill="#0284c7" />
  </svg>
);

const Coral15 = ({ h = 48 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90" className="drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
    <path d="M37 90 L37 60 L15 35 L5 15 M15 35 L25 15 M37 60 L60 35 L50 15 M60 35 L70 15" stroke="#f472b6" strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral16 = ({ h = 48 }) => (
  <svg width={h * 1.0} height={h} viewBox="0 0 90 80" className="animate-sway-seaweed-left">
    <path d="M10 70 Q 5 30 25 10 Q 40 30 35 70 Z" fill="#14b8a6" />
    <path d="M30 70 Q 25 20 50 5 Q 70 20 55 70 Z" fill="#0d9488" />
    <circle cx="22" cy="30" r="2" fill="#ffffff" />
    <circle cx="45" cy="25" r="2" fill="#ffffff" />
  </svg>
);

const Coral17 = ({ h = 50 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 95" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
    <path d="M37 95 L37 50 L15 30 L5 10 M37 50 L60 30 L70 10 M37 50 L37 15" stroke="#ef4444" strokeWidth="4" strokeDasharray="6 4" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral18 = ({ h = 46 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90">
    <path d="M37 90 L37 50 L15 30 L37 50 L60 30 M37 50 L37 20" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="15" cy="30" r="4" fill="#a855f7" />
    <circle cx="60" cy="30" r="4" fill="#a855f7" />
    <circle cx="37" cy="20" r="4" fill="#a855f7" />
  </svg>
);

const Coral19 = ({ h = 50 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 95" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
    <path d="M40 95 C40 65 15 50 10 25 C20 35 30 45 40 55 C40 35 25 20 35 5 C45 20 40 35 40 55 C50 45 60 35 70 25 C65 50 40 65 40 95 Z" fill="#9333ea" />
  </svg>
);

const Coral20 = ({ h = 44 }) => (
  <svg width={h * 0.9} height={h} viewBox="0 0 85 80" className="drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]">
    <path d="M42 80 Q 10 40 20 15 Q 42 35 42 80 Q 42 35 65 15 Q 75 40 42 80 Z" fill="#e11d48" />
  </svg>
);

const Coral21 = ({ h = 48 }) => (
  <svg width={h * 0.75} height={h} viewBox="0 0 70 90">
    <rect x="10" y="30" width="12" height="60" rx="6" fill="#34d399" />
    <rect x="26" y="10" width="14" height="80" rx="7" fill="#6ee7b7" />
    <rect x="44" y="20" width="12" height="70" rx="6" fill="#059669" />
    <ellipse cx="16" cy="30" rx="5" ry="2.5" fill="#064e3b" />
    <ellipse cx="33" cy="10" rx="6" ry="3" fill="#064e3b" />
    <ellipse cx="50" cy="20" rx="5" ry="2.5" fill="#064e3b" />
  </svg>
);

const Coral22 = ({ h = 46 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90">
    <path d="M37 90 L37 45 L15 25 M37 45 L60 25 M37 45 L37 15" stroke="#1e3a8a" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="15" cy="25" r="3.5" fill="#ec4899" />
    <circle cx="60" cy="25" r="3.5" fill="#ec4899" />
  </svg>
);

const Coral23 = ({ h = 42 }) => (
  <svg width={h * 1.0} height={h} viewBox="0 0 85 75" className="animate-pulse-coral-glow">
    <rect x="15" y="35" width="16" height="40" rx="8" fill="#f43f5e" />
    <rect x="35" y="20" width="18" height="55" rx="9" fill="#f472b6" />
    <path d="M18 35 Q 10 20 5 10 M38 20 Q 30 5 25 0 M50 20 Q 55 5 60 0" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Coral24 = ({ h = 54 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 100" className="drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">
    <path d="M40 100 L40 60 L15 35 L5 15 M15 35 L25 10 M40 60 L65 35 L55 10 L40 20 L50 5" stroke="#2563eb" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral25 = ({ h = 48 }) => (
  <svg width={h * 0.75} height={h} viewBox="0 0 70 90">
    <rect x="10" y="20" width="12" height="70" rx="6" fill="#ec4899" />
    <rect x="26" y="5" width="14" height="85" rx="7" fill="#f472b6" />
  </svg>
);

const Coral26 = ({ h = 50 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 95" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
    <path d="M15 95 Q 5 50 15 25 C20 15 30 25 25 45 Q 15 70 15 95 Z" fill="#10b981" />
    <path d="M35 95 Q 20 40 35 10 C42 0 50 10 45 35 Q 30 70 35 95 Z" fill="#34d399" />
  </svg>
);

const Coral27 = ({ h = 54 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 100" className="animate-sway-seaweed-right">
    <path d="M25 100 Q 5 75 35 45 Q 50 20 25 0 Q 15 20 35 45 Q 10 75 25 100 Z" fill="#1d4ed8" />
  </svg>
);

const Coral28 = ({ h = 42 }) => (
  <svg width={h * 1.1} height={h} viewBox="0 0 85 75" className="drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
    <path d="M20 65 Q 5 45 20 30 Q 35 15 50 30 Q 65 15 75 35 Q 85 55 65 65 Z" fill="#f472b6" />
  </svg>
);

const Coral29 = ({ h = 48 }) => (
  <svg width={h * 0.9} height={h} viewBox="0 0 80 90" className="animate-sway-seaweed-left">
    <path d="M40 90 L20 40 Q 5 20 25 10 Q 40 30 40 90 Z" fill="#2563eb" />
  </svg>
);

const Coral30 = ({ h = 60 }) => (
  <svg width={h * 0.45} height={h} viewBox="0 0 45 110" className="animate-sway-seaweed-right">
    <path d="M22 0 L22 110" stroke="#10b981" strokeWidth="2" fill="none" />
    <circle cx="14" cy="20" r="4" fill="#34d399" />
    <circle cx="30" cy="35" r="4" fill="#34d399" />
  </svg>
);

const Coral31 = ({ h = 48 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90" className="drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]">
    <path d="M37 90 L37 45 L15 20 L5 5 L20 20 L37 45 L60 20 L70 5 L55 20 L37 45 Z" fill="#2563eb" />
  </svg>
);

const Coral32 = ({ h = 52 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 100" className="animate-sway-seaweed-left">
    <path d="M25 100 Q 5 75 25 50 Q 45 25 25 0 Q 35 25 15 50 Q 35 75 25 100 Z" fill="#d946ef" />
  </svg>
);

const Coral33 = ({ h = 54 }) => (
  <svg width={h * 0.4} height={h} viewBox="0 0 40 100" className="animate-sway-seaweed-right">
    <line x1="20" y1="100" x2="20" y2="0" stroke="#059669" strokeWidth="2.5" />
    <circle cx="20" cy="30" r="5" fill="#34d399" />
    <circle cx="20" cy="60" r="5" fill="#34d399" />
  </svg>
);

const Coral34 = ({ h = 50 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 95" className="animate-sway-seaweed-left">
    <path d="M25 95 Q 5 65 25 35 Q 40 15 25 0 Q 30 20 15 40 Q 35 65 25 95 Z" fill="#0284c7" />
  </svg>
);

const Coral35 = ({ h = 52 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 100" className="animate-sway-seaweed-right">
    <line x1="25" y1="100" x2="25" y2="0" stroke="#ec4899" strokeWidth="2" />
    <path d="M25 80 Q 10 70 15 60 M25 60 Q 40 50 35 40 M25 40 Q 10 30 15 20" stroke="#f472b6" strokeWidth="3" fill="none" />
  </svg>
);

const Coral36 = ({ h = 46 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 85" className="drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
    <path d="M37 85 L37 55 L15 35 L5 15 M15 35 L25 15 M37 55 L60 35 L50 15" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral37 = ({ h = 48 }) => (
  <svg width={h * 0.6} height={h} viewBox="0 0 60 90" className="animate-sway-seaweed-left">
    <path d="M15 90 Q 5 50 15 10" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M30 90 Q 25 40 30 0" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral38 = ({ h = 48 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90" className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
    <path d="M37 90 L37 50 L15 30 L5 10 M37 50 L60 30 L70 10 M37 50 L37 15" stroke="#ec4899" strokeWidth="4.5" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral39 = ({ h = 54 }) => (
  <svg width={h * 0.6} height={h} viewBox="0 0 60 100" className="animate-sway-seaweed-right">
    <path d="M15 100 Q 0 65 15 30 Q 30 10 15 0" stroke="#059669" strokeWidth="3.5" fill="none" />
    <path d="M30 100 Q 45 65 30 30 Q 15 10 30 0" stroke="#10b981" strokeWidth="3.5" fill="none" />
  </svg>
);

const Coral40 = ({ h = 50 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 95" className="drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]">
    <path d="M37 95 L37 50 L15 25 L5 5 L20 20 L37 50 L60 25 L70 5 L55 20 Z" fill="#1d4ed8" />
  </svg>
);

const Coral41 = ({ h = 46 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 85" className="drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
    <path d="M40 85 Q 10 45 20 15 Q 40 35 40 85 Q 40 35 60 15 Q 70 45 40 85 Z" fill="#fb7185" />
  </svg>
);

const Coral42 = ({ h = 48 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90">
    <path d="M37 90 L37 45 L15 20 L5 5 M37 45 L60 20 L70 5 M37 45 L37 10" stroke="#84cc16" strokeWidth="4.5" strokeLinecap="round" fill="none" />
  </svg>
);

const Coral43 = ({ h = 50 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 90" className="drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">
    <path d="M40 90 Q 10 50 10 25 Q 40 5 70 25 Q 70 50 40 90 Z" fill="#7dd3fc" opacity="0.85" />
  </svg>
);

const Coral44 = ({ h = 52 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 100" className="animate-sway-seaweed-left">
    <path d="M25 100 Q 5 70 25 35 Q 40 15 25 0 Q 35 20 15 45 Q 35 70 25 100 Z" fill="#84cc16" />
  </svg>
);

const Coral45 = ({ h = 48 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 90" className="drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]">
    <path d="M37 90 C37 60 15 40 10 15 C25 25 35 35 37 50 C40 35 55 25 65 10 C60 35 37 60 37 90 Z" fill="#4f46e5" />
  </svg>
);

const Coral46 = ({ h = 46 }) => (
  <svg width={h * 0.9} height={h} viewBox="0 0 85 85" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
    <path d="M42 85 Q 10 45 20 15 Q 42 35 42 85 Q 42 35 65 15 Q 75 45 42 85 Z" fill="#ef4444" />
  </svg>
);

const Coral47 = ({ h = 44 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 75 80">
    <path d="M37 80 L37 45 L15 25 L5 10 M37 45 L60 25 L70 10 M37 45 L37 15" stroke="#dc2626" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral48 = ({ h = 54 }) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 50 100" className="animate-sway-seaweed-right">
    <path d="M25 100 Q 5 75 25 45 Q 45 20 25 0 Q 30 20 15 45 Q 35 75 25 100 Z" fill="#1e40af" />
  </svg>
);

const Coral49 = ({ h = 50 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 95" className="drop-shadow-[0_0_10px_rgba(185,28,28,0.8)]">
    <path d="M40 95 L40 55 L15 30 L5 10 M15 30 L25 10 M40 55 L65 30 L75 10 M65 30 L55 10 M40 55 L40 15" stroke="#b91c1c" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

const Coral50 = ({ h = 48 }) => (
  <svg width={h * 0.85} height={h} viewBox="0 0 80 90">
    <path d="M40 90 Q 10 50 10 25 Q 40 5 70 25 Q 70 50 40 90 Z" fill="#a7f3d0" opacity="0.85" />
  </svg>
);

const Coral51 = ({ h = 52 }) => (
  <svg width={h * 0.55} height={h} viewBox="0 0 55 100" className="animate-sway-seaweed-left">
    <path d="M27 100 Q 5 75 27 45 Q 45 20 27 0 Q 35 20 15 45 Q 35 75 27 100 Z" fill="#eab308" />
    <path d="M27 90 Q 40 65 20 35 Q 35 15 27 5 Z" fill="#ef4444" opacity="0.85" />
  </svg>
);

const ALL_51_CORALS = [
  Coral1, Coral2, Coral3, Coral4, Coral5, Coral6, Coral7, Coral8, Coral9, Coral10,
  Coral11, Coral12, Coral13, Coral14, Coral15, Coral16, Coral17, Coral18, Coral19, Coral20,
  Coral21, Coral22, Coral23, Coral24, Coral25, Coral26, Coral27, Coral28, Coral29, Coral30,
  Coral31, Coral32, Coral33, Coral34, Coral35, Coral36, Coral37, Coral38, Coral39, Coral40,
  Coral41, Coral42, Coral43, Coral44, Coral45, Coral46, Coral47, Coral48, Coral49, Coral50, Coral51
];

const MaritimeWaveDivider = () => {
  const [finFish, setFinFish] = React.useState<any[]>([
    { name: "Red Snapper", image: "/ICONS/Red-snapper.webp", swimRight: -1, swimLeft: 1 },
    { name: "Kingfish", image: "/ICONS/kingfish.webp", swimRight: -1, swimLeft: 1 },
    { name: "White Pomfret", image: "/ICONS/white-pomfret.webp", swimRight: -1, swimLeft: 1 },
    { name: "Grouper", image: "/ICONS/grouper.webp", swimRight: -1, swimLeft: 1 },
    { name: "Mackerel", image: "/ICONS/mackerel.webp", swimRight: -1, swimLeft: 1 }
  ]);
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  React.useEffect(() => {
    let active = true;
    fetch('/api/aquarium-fish')
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data)) {
          const normalized = data.map((f: any) => ({
            ...f,
            swimRight: -1,
            swimLeft: 1
          }));
          setFinFish(normalized);
        }
      })
      .catch(err => console.warn("Failed to load aquarium fish:", err));
    return () => {
      active = false;
    };
  }, []);

  const handleTankMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Math.random() > 0.4) {
      setRipples(prev => [...prev.slice(-6), { id: Date.now() + Math.random(), x, y }]);
    }
  };

  return (
    <div 
      onMouseMove={handleTankMouseMove}
      className="relative h-28 md:h-36 overflow-hidden bg-gradient-to-b from-[#020617] via-[#032b45] to-[#001427] border-y border-[var(--c-primary)]/50 shadow-[inset_0_0_35px_rgba(0,0,0,0.8)] group/tank my-2 cursor-pointer"
    >
      {/* 0. INTERACTIVE CURSOR RIPPLE RINGS */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="absolute w-12 h-12 rounded-full border border-cyan-300/80 shadow-[0_0_12px_#00f3ff] pointer-events-none animate-ripple-ring z-40"
          style={{ left: r.x - 24, top: r.y - 24 }}
        />
      ))}

      {/* 1. TOP WATER DIVIDER WAVE GRAPHIC */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none opacity-40">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-4 text-[#00F3FF]">
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,30 L1200,0 L0,0 Z" fill="currentColor" opacity="0.25" />
          <path d="M0,0 C200,30 400,10 600,50 C800,90 1000,20 1200,40 L1200,0 L0,0 Z" fill="currentColor" opacity="0.15" />
        </svg>
      </div>

      {/* 2. TANK CAUSTICS & LIGHTING BEAMS */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            animate={{ opacity: [0.15, 0.45, 0.15], x: ["-4%", "4%"] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-50%] w-32 h-[220%] bg-gradient-to-b from-cyan-300/30 via-teal-400/10 to-transparent rotate-[25deg]"
            style={{ left: (i * 15) + "%" }}
          />
        ))}
      </div>

      {/* 3. DENSE SEABED PEBBLES & GEMSTONES */}
      <div className="absolute bottom-0 left-0 right-0 h-3 flex items-end px-0 gap-0 opacity-90 z-10 overflow-hidden">
        {[...Array(45)].map((_, i) => {
          const isGem = i % 4 === 0;
          const gemColors = ['#ff007f', '#00f5d4', '#00bbf9', '#fee440', '#9333ea', '#ffffff'];
          const gemColor = gemColors[i % gemColors.length];
          return (
            <div 
              key={`pebble-${i}`} 
              className="w-[2.22%] min-w-[4px] rounded-t-full flex-shrink-0"
              style={{ 
                height: (isGem ? (4 + (i % 4)) : (5 + (i % 6))) + 'px',
                backgroundColor: isGem ? gemColor : ['#fecaca', '#bfdbfe', '#bbf7d0', '#fef08a', '#e9d5ff', '#cbd5e1'][i % 6],
                filter: isGem ? `brightness(1.8) drop-shadow(0 0 6px ${gemColor})` : 'brightness(0.9) contrast(1.2)',
                transform: isGem ? "rotate(45deg)" : "none",
              }}
            />
          );
        })}
      </div>

      {/* 4. ULTRA-DENSE OXYGEN BUBBLE CHIMNEYS */}
      {[2, 9, 16, 23, 31, 39, 47, 55, 63, 71, 79, 87, 94].map((x, streamIdx) => (
        <div key={`bubble-stream-${streamIdx}`} className="absolute bottom-0 h-full z-15 pointer-events-none" style={{ left: x + "%" }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={`bubble-${streamIdx}-${i}`}
              className="absolute bg-cyan-100/70 rounded-full border border-white/90 shadow-[0_0_8px_rgba(0,243,255,0.9)] animate-rise-bubble"
              style={{ 
                width: (i % 2 === 0 ? "6px" : "10px"),
                height: (i % 2 === 0 ? "6px" : "10px"),
                bottom: (i * 22) + "px", 
                left: (i % 2 === 0 ? "-6px" : "6px"),
                animationDelay: `${(streamIdx * 0.2) + (i * 0.5)}s`,
                animationDuration: `${2.6 + (i * 0.4)}s`
              }}
            />
          ))}
        </div>
      ))}

      {/* 5. HIGH-DEFINITION VECTOR SVG REEF FLORA & CORALS BED (ALL 51 CORALS & SEAWEEDS RENDERED) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-end justify-between px-0.5 pb-0.5 overflow-hidden">
        {ALL_51_CORALS.map((CoralComp, i) => {
          const leftPct = (i * 1.92).toFixed(2);
          const coralHeight = 38 + ((i % 5) * 4);
          return (
            <div 
              key={`coral-item-${i}`} 
              className="absolute bottom-0.5 transition-all origin-bottom"
              style={{ left: `${leftPct}%` }}
            >
              <CoralComp h={coralHeight} />
            </div>
          );
        })}
      </div>

      {/* 6. MARINE SNOW (Bioluminescent Floating Particles) */}
      <div className="absolute inset-0 z-5 opacity-35 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div
            key={`snow-${i}`}
            className="absolute w-1.5 h-1.5 bg-cyan-200 rounded-full animate-ping shadow-[0_0_8px_#00f3ff]"
            style={{ left: (i * 6.2) + "%", top: (10 + (i * 7) % 75) + "%", animationDuration: `${3 + (i % 3)}s` }}
          />
        ))}
      </div>

      {/* 7. REALISTIC FISH KINETICS (BURST-AND-GLIDE, PITCH BANKING & TAIL WIGGLE) */}
      {finFish.map((fish, i) => {
        const yBase = 15 + ((i * 16) % 50); 
        const cycleDuration = 140 + ((i * 20) % 60); // Very slow, majestic, peaceful aquatic speed
        const delay = i * 5;
        const depthScale = 0.82 + ((i * 0.14) % 0.48); 
        const zIndex = 35 + i;
        
        // Burst & glide waypoints
        const leftPath = ["-15%", "18%", "35%", "62%", "88%", "115%", "115%", "88%", "62%", "35%", "18%", "-15%", "-15%"];
        const leftTimes = [0, 0.08, 0.18, 0.28, 0.40, 0.48, 0.50, 0.58, 0.68, 0.78, 0.90, 0.98, 1];
        
        // Direction & pitch tilt paths
        const orientationPath = [
          fish.swimRight, fish.swimRight, fish.swimRight, fish.swimRight, fish.swimRight, fish.swimRight,
          fish.swimLeft, fish.swimLeft, fish.swimLeft, fish.swimLeft, fish.swimLeft, fish.swimLeft, fish.swimRight
        ];
        
        const pitchAngles = [0, -8, 10, -6, 8, 0, 0, -8, 10, -6, 8, 0, 0];

        return (
          <motion.div
            key={`swim-${i}`}
            initial={{ left: "-15%", top: yBase + "%" }}
            animate={{ 
              left: leftPath,
              top: [
                yBase + "%", 
                (yBase - 12) + "%", 
                (yBase + 14) + "%", 
                (yBase - 8) + "%", 
                (yBase + 10) + "%", 
                yBase + "%",
                yBase + "%",
                (yBase - 12) + "%", 
                (yBase + 14) + "%", 
                (yBase - 8) + "%", 
                (yBase + 10) + "%", 
                yBase + "%",
                yBase + "%"
              ]
            }}
            transition={{
              left: { duration: cycleDuration, repeat: Infinity, ease: "easeInOut", delay, times: leftTimes },
              top: { duration: cycleDuration, repeat: Infinity, ease: "easeInOut", delay, times: leftTimes }
            }}
            className="absolute pointer-events-none"
            style={{ zIndex }}
          >
            <motion.div
              animate={{ 
                scaleX: orientationPath,
                rotateZ: pitchAngles,
                skewY: [-2.5, 2.5, -2.5]
              }}
              transition={{
                scaleX: { duration: cycleDuration, repeat: Infinity, ease: "linear", delay, times: leftTimes },
                rotateZ: { duration: cycleDuration, repeat: Infinity, ease: "easeInOut", delay, times: leftTimes },
                skewY: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
              }}
              className="animate-caudal-wiggle"
              style={{ scale: depthScale }}
            >
              <img 
                src={fish.image} 
                alt={fish.name} 
                className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-[0_0_14px_rgba(0,243,255,0.5)] transition-transform"
                style={{ 
                  filter: `brightness(1.08) contrast(1.15)`,
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

const SectionTitle = ({ title, subtitle, centered = false }: { title: string, subtitle?: string, centered?: boolean }) => {
  const words = title.split(" ");
  const firstWord = words[0];
  const restWords = words.slice(1).join(" ");
  return (
    <div className={cn("mb-2 space-y-0.5 px-4 md:px-0", centered && "text-center")}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xl md:text-3xl font-black tracking-tight uppercase italic leading-tight"
      >
        <span style={{ color: 'var(--c-primary)' }}>{firstWord}</span>
        {restWords && <span className="text-[var(--c-text-primary)]"> {restWords}</span>}
      </motion.h2>
      {/* Gradient underline */}
      <div className="mt-1.5 mb-3.5 h-[2px] w-16 rounded-full overflow-hidden">
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(to right, var(--c-primary), var(--c-text-primary))'
          }}
        />
      </div>
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
};

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

const getBadgeStyle = (tag: string) => {
  if (tag.includes("HOT") || tag.includes("🔥")) {
    return {
      bg: "bg-gradient-to-r from-red-600 via-rose-500 to-amber-500",
      border: "border-amber-300/90",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.95)] animate-pulse",
      text: "text-white"
    };
  }
  if (tag.includes("CHILLED") || tag.includes("✨")) {
    return {
      bg: "bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400",
      border: "border-cyan-200/90",
      glow: "shadow-[0_0_12px_rgba(6,182,212,0.95)]",
      text: "text-slate-950 font-black"
    };
  }
  if (tag.includes("MEAT") || tag.includes("🥩")) {
    return {
      bg: "bg-gradient-to-r from-red-700 via-rose-600 to-red-500",
      border: "border-rose-300/90",
      glow: "shadow-[0_0_12px_rgba(225,29,72,0.9)]",
      text: "text-white"
    };
  }
  if (tag.includes("CHICKEN") || tag.includes("🍗")) {
    return {
      bg: "bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400",
      border: "border-amber-200/90",
      glow: "shadow-[0_0_12px_rgba(217,119,6,0.9)]",
      text: "text-slate-950 font-black"
    };
  }
  // Default FRESH (⚡)
  return {
    bg: "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400",
    border: "border-emerald-200/90",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.95)]",
    text: "text-slate-950 font-black"
  };
};

const CATEGORIES: {
  name: string;
  image: string;
  color: string;
  glowColor: string;
  slug: string;
  isTransparent?: boolean;
  badgeTag: string;
}[] = [
  { name: "Seawater Fish", image: "/images/categories/seawater.png", color: "from-blue-500/40 to-indigo-900/60", glowColor: "#0284c7", slug: "SEAWATER FISH", isTransparent: true, badgeTag: "⚡ FRESH" },
  { name: "Freshwater Fish", image: "/images/categories/freshwater.png", color: "from-cyan-500/40 to-teal-900/60", glowColor: "#0d9488", slug: "FRESHWATER FISH", isTransparent: true, badgeTag: "⚡ FRESH" },
  { name: "Prawns & Shrimps", image: "/images/categories/prawns.png", color: "from-orange-500/40 to-amber-900/60", glowColor: "#ea580c", slug: "PRAWNS & SHRIMPS", isTransparent: true, badgeTag: "🔥 HOT" },
  { name: "Crabs & Lobsters", image: "/images/categories/crabs.png", color: "from-emerald-800/40 to-teal-950/60", glowColor: "#059669", slug: "CRABS & LOBSTERS", isTransparent: true, badgeTag: "✨ CHILLED" },
  { name: "Steaks & Fillets", image: "/images/categories/steaks.png", color: "from-rose-600/40 to-red-900/60", glowColor: "#e11d48", slug: "STEAKS & FILLETS", isTransparent: true, badgeTag: "⚡ FRESH" },
  { name: "Exotic Catch", image: "/images/categories/exotic.png", color: "from-purple-500/40 to-indigo-900/60", glowColor: "#8b5cf6", slug: "EXOTIC CATCH", isTransparent: true, badgeTag: "🔥 HOT" },
  { name: "Ready To Cook", image: "/images/categories/ready_to_cook.png", color: "from-amber-500/40 to-amber-800/60", glowColor: "#d97706", slug: "READY TO COOK", isTransparent: true, badgeTag: "✨ CHILLED" },
  { name: "Dry Fish", image: "/images/categories/dry_fish.png", color: "from-yellow-600/40 to-amber-900/60", glowColor: "#ca8a04", slug: "DRY FISH", isTransparent: true, badgeTag: "⚡ FRESH" },
  { name: "Mutton", image: "/images/categories/mutton.png", color: "from-red-800/40 to-stone-900/60", glowColor: "#b91c1c", slug: "MUTTON", isTransparent: true, badgeTag: "🥩 FRESH" },
  { name: "Chicken", image: "/images/categories/chicken.png", color: "from-amber-600/40 to-stone-900/60", glowColor: "#d97706", slug: "CHICKEN", isTransparent: true, badgeTag: "🍗 FRESH" },
];

const FEATURED_PRODUCTS = [
  { id: "PRD-101", name: "Saku Grade Bluefin Tuna", price: 2450, rating: 4.9, delivery: "45 min", sellerId: "SEL-2001", sellerName: "Andaman Fish Co", image: "🍣" },
  { id: "PRD-102", name: "Andaman King Lobster", price: 3800, rating: 5.0, delivery: "60 min", sellerId: "SEL-002", sellerName: "Devansh Fish Hub", image: "🦞" },
  { id: "PRD-103", name: "Arctic Snow Crab Legs", price: 5200, rating: 4.8, delivery: "90 min", sellerId: "SEL-003", sellerName: "Deep Fishing", image: "🦀" },
  { id: "PRD-104", name: "Wild Tiger Prawns", price: 1250, rating: 4.7, delivery: "30 min", sellerId: "SEL-004", sellerName: "Rig Fishing", image: "🦐" },
];


// Static fallback — shown only if no approved reviews exist in DB yet
const FALLBACK_REVIEWS = [
  { id: "REV-1", user_name: "Vikram S.", comment: "The Bluefin Tuna was absolutely pristine. Delivered in 40 minutes.", rating: 5 },
  { id: "REV-2", user_name: "Ananya K.", comment: "Best lobster I've had in years. The cold-chain delivery is real.", rating: 5 },
  { id: "REV-3", user_name: "Rajesh M.", comment: "Professional service and verifiable freshness. OceanExotic Global is the future.", rating: 4.9 },
];

const RECIPES = [
  { id: "REC-1", title: "Pan-Seared King Salmon", time: "20 min", difficulty: "Easy", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80" },
  { id: "REC-2", title: "Spicy Garlic Tiger Prawns", time: "15 min", difficulty: "Medium", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80" },
];

export default function CustomerHomeClient({ initialAssets }: { initialAssets?: any }) {
  const settings = useSettingsStore();
  const cart = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { categories: fetchedCategories } = useCategories();

  const dynamicActiveCategories = React.useMemo(() => {
    if (!Array.isArray(fetchedCategories) || fetchedCategories.length === 0) return [];
    const activeRaw = fetchedCategories.filter((c: any) => (c.status || "ACTIVE").toUpperCase() !== "INACTIVE");
    return activeRaw.map((cat: any) => {
      const l = (cat.label || cat.id || "").toLowerCase();
      let image = cat.imageUrl;
      if (!image) {
        if (l.includes("freshwater")) image = "/images/categories/freshwater.png";
        else if (l.includes("prawn") || l.includes("shrimp")) image = "/images/categories/prawns.png";
        else if (l.includes("crab") || l.includes("lobster")) image = "/images/categories/crabs.png";
        else if (l.includes("steak") || l.includes("fillet")) image = "/images/categories/steaks.png";
        else if (l.includes("exotic")) image = "/images/categories/exotic.png";
        else if (l.includes("cook") || l.includes("ready")) image = "/images/categories/ready_to_cook.png";
        else if (l.includes("dry")) image = "/images/categories/dry_fish.png";
        else if (l.includes("mutton")) image = "/images/categories/mutton.png";
        else if (l.includes("chicken")) image = "/images/categories/chicken.png";
        else image = "/images/categories/seawater.png";
      }

      let badgeTag = cat.badgeTag || null;
      if (!badgeTag) {
        if (l.includes("surmai") || l.includes("prawn") || l.includes("shrimp")) badgeTag = "🔥 HOT";
        else if (l.includes("seawater") || l.includes("crab") || l.includes("freshwater")) badgeTag = "⚡ FRESH";
        else if (l.includes("steak") || l.includes("exotic")) badgeTag = "✨ CHILLED";
        else if (l.includes("cook") || l.includes("ready")) badgeTag = "✨ CHILLED";
        else badgeTag = "⚡ FRESH";
      }

      return {
        name: cat.label || cat.id,
        image,
        color: l.includes("prawn") ? "from-orange-500/40 to-amber-900/60" :
               l.includes("crab") ? "from-emerald-800/40 to-teal-950/60" :
               l.includes("steak") ? "from-rose-600/40 to-red-900/60" :
               l.includes("exotic") ? "from-purple-500/40 to-indigo-900/60" :
               l.includes("freshwater") ? "from-cyan-500/40 to-teal-900/60" : "from-blue-500/40 to-indigo-900/60",
        glowColor: l.includes("prawn") ? "#ea580c" :
                   l.includes("crab") ? "#059669" :
                   l.includes("steak") ? "#e11d48" :
                   l.includes("exotic") ? "#8b5cf6" :
                   l.includes("freshwater") ? "#0d9488" : "#0284c7",
        slug: cat.id || cat.label,
        badgeTag
      };
    });
  }, [fetchedCategories]);
  
  // Use server-provided assets for initial render to guarantee SEO indexing
  const assets = settings.customerAssets?.heroTitle1 ? settings.customerAssets : (initialAssets || settings.customerAssets);
  
  const [mounted, setMounted] = React.useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = React.useState(0);
  const [footerAccordion, setFooterAccordion] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState({ hrs: "00", min: "00", sec: "00" });
  const [timerStatus, setTimerStatus] = React.useState<'STARTS_IN' | 'ENDS_IN'>('ENDS_IN');
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
  const [activeReels, setActiveReels] = React.useState<any[]>([]);
  const [liveReviews, setLiveReviews] = React.useState<any[]>([]);
  const [isMapExpanded, setIsMapExpanded] = React.useState(false);

  // Flash Deals Banner ref and size for responsive diagonal paddle alignment
  const bannerRef = React.useRef<HTMLDivElement>(null);
  const [bannerSize, setBannerSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined' || !bannerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBannerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(bannerRef.current);
    return () => resizeObserver.disconnect();
  }, [mounted, settings.flashDealActive]);

  const w = bannerSize.width;
  const h = bannerSize.height || 500;
  const diagonalLength = Math.sqrt(h * h + w * w);
  const angle = Math.atan2(h, w) * 180 / Math.PI;
  const rotationAngle = `${90 - angle}deg`;

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
      } catch (err) { console.warn("Live Catch Fetch Failure (Silenced)"); }
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

    const fetchReels = async () => {
      try {
        const res = await fetch('/api/admin/videos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setActiveReels(data.filter((v: any) => v.is_active === 1 && v.video_url));
          }
        }
      } catch (err) {
        console.error("Reels Sync Failed", err);
      }
    };

    const fetchApprovedReviews = async () => {
      try {
        const res = await fetch('/api/reviews/all');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const approved = data
              .filter((r: any) => (r.status || '').toUpperCase() === 'APPROVED')
              .slice(0, 6);
            setLiveReviews(approved);
          }
        }
      } catch (err) {
        console.warn('Review Sync Failed (Silenced)');
      }
    };

    fetchCMS();
    fetchTerritories();
    fetchTodaysCatch();
    fetchFeatured();
    fetchReels();
    fetchApprovedReviews();

    if (!settings.flashDealActive) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startVal = settings.flashDealStart ? new Date(settings.flashDealStart).getTime() : 0;
      const endVal = settings.flashDealEnd ? new Date(settings.flashDealEnd).getTime() : 0;
      
      if (isNaN(startVal) || isNaN(endVal) || endVal === 0) {
         setTimeLeft({ hrs: "00", min: "00", sec: "00" });
         return;
      }

      let distance = 0;
      let status: 'STARTS_IN' | 'ENDS_IN' = 'ENDS_IN';

      if (now < startVal) {
         distance = startVal - now;
         status = 'STARTS_IN';
      } else {
         distance = endVal - now;
         status = 'ENDS_IN';
      }

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hrs: "00", min: "00", sec: "00" });
        return;
      }

      const hrs = Math.floor(distance / (1000 * 60 * 60));
      const min = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hrs: hrs.toString().padStart(2, '0'),
        min: min.toString().padStart(2, '0'),
        sec: sec.toString().padStart(2, '0')
      });
      setTimerStatus(status);
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.flashDealActive, settings.flashDealStart, settings.flashDealEnd]);
  // 2. Absolute Hydration Delivery & Settings Sync
  React.useEffect(() => {
    setMounted(true);
    settings.fetchSettings();
  }, []);

  const heroSlides = React.useMemo(() => {
    // Inject premium seafood fallbacks if the admin hasn't uploaded Hero2 and Hero3 yet
    const fallbackHero2 = "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80"; 
    const fallbackHero3 = "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80";

    return [
      assets.hero, 
      (assets as any).hero2 || fallbackHero2, 
      (assets as any).hero3 || fallbackHero3
    ].filter(Boolean) as string[];
  }, [assets]);

  React.useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

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
      toast("Failed to load options", "error");
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

  const splitPromo = cmsContent.find(c => c.type === 'SPLIT_PROMO');
  const showSplitPromo = splitPromo && splitPromo.status === 'PUBLISHED';

  let promoDataParsed = {
     panelA: {
        title: "SEAFOOD\nGRILL.",
        subtitle: "Grill Mode",
        tagline: "Volcanic products.",
        link: "/customer/products?search=grill",
        image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80"
     },
     panelB: {
        title: "FLAME-SEA\nCOLLECTIONS",
        subtitle: "Node: Flame",
        tagline: "Volcanic collections.",
        link: "/customer/products?search=fry",
        image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80"
     }
  };

  if (splitPromo) {
     try {
        const parsed = typeof splitPromo.metadata === 'string' ? JSON.parse(splitPromo.metadata) : splitPromo.metadata;
        if (parsed && parsed.panelA && parsed.panelB) {
           promoDataParsed = parsed;
        }
     } catch (e) {
        console.error("Failed to parse split promo metadata:", e);
     }
  }

  const renderSplitPromoTitle = (title: string, accentColorClass: string) => {
    const parts = title.split('\\n').flatMap(p => p.split('\n'));
    if (parts.length > 1) {
      return (
        <>
          {parts[0]} <br />
          <span className={accentColorClass}>{parts.slice(1).join(' ')}</span>
        </>
      );
    }
    const spaceParts = title.split(' ');
    if (spaceParts.length > 1) {
      return (
        <>
          {spaceParts[0]} <br />
          <span className={accentColorClass}>{spaceParts.slice(1).join(' ')}</span>
        </>
      );
    }
    return title;
  };

  return (
    <div className="w-full">
      {/* 3. HERO SECTION - THEME AWARE IMAGE & ATMOSPHERE */}
      <section className="relative min-h-[40vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden pt-8 pb-8 lg:py-0">
        <div className="absolute inset-0 z-0 bg-[#0b0e14]">
          <AnimatePresence mode="popLayout">
            {heroSlides.length > 0 && (
              <motion.div
                key={currentHeroIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 z-0"
              >
                {/* Desktop Background */}
                <Image 
                  src={heroSlides[currentHeroIndex]} 
                  priority
                  fill
                  className="hidden lg:block object-cover object-center" 
                  alt="OceanExotic Seafood Hero" 
                />

                {/* Mobile Blurred Background (Fallback for wide images) */}
                {!assets.mobileHero && (
                  <Image 
                    src={heroSlides[currentHeroIndex]} 
                    priority
                    fill
                    className="lg:hidden object-cover blur-2xl opacity-30 grayscale-[30%] object-center" 
                    alt="" 
                  />
                )}

                {/* Mobile Foreground */}
                {(assets.mobileHero || heroSlides[currentHeroIndex]) && (
                  <Image 
                    src={currentHeroIndex === 0 && assets.mobileHero ? assets.mobileHero : heroSlides[currentHeroIndex]} 
                    priority
                    fill
                    className={cn(
                       "lg:hidden object-center z-0",
                       (currentHeroIndex === 0 && assets.mobileHero) ? "object-cover" : "object-contain"
                    )} 
                    alt="OceanExotic Seafood Hero" 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-[var(--c-gradient-hero)] z-10" style={{ opacity: (settings.heroOverlayOpacity ?? 80) / 100 }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,var(--c-primary),transparent_50%)] opacity-10 hidden lg:block z-10" />
        </div>

        {/* Floating Dynamic Timing Card (Desktop Only - Bottom Right 50% width) */}
        <div className="hidden lg:block absolute bottom-8 right-8 z-30 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "p-3 rounded-[20px] bg-[#0b0e14]/90 backdrop-blur-xl border flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-premium max-w-[200px]",
              isStoreOpen && settings.ordersEnabled
                ? "border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                : "border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            )}
          >
            {/* Header / Subtitle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Clock className={cn("w-3 h-3 animate-pulse", 
                  isStoreOpen && settings.ordersEnabled ? "text-emerald-400" : "text-amber-400"
                )} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--c-text-secondary)] opacity-80">Delivery Status</span>
              </div>
              <span className={cn("w-1.5 h-1.5 rounded-full",
                isStoreOpen && settings.ordersEnabled ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"
              )} />
            </div>

            {/* Status Title */}
            <div className="space-y-0.5">
              {isStoreOpen && settings.ordersEnabled ? (
                <>
                  <p className="text-xs font-black text-emerald-400 uppercase italic tracking-tighter leading-none">● OPEN</p>
                  <p className="text-[8px] text-emerald-100/90 font-bold uppercase tracking-wider">Fastest cold-chain</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-black text-amber-400 uppercase italic tracking-tighter leading-none">● PRE-ORDERS</p>
                  <p className="text-[8px] text-amber-100/90 font-bold uppercase tracking-wider">Immediate closed</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Carousel Navigation Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 p-2 lg:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 hover:opacity-100 lg:group-hover:opacity-100 transition-opacity hidden lg:flex"
            >
              <ChevronDown className="w-6 h-6 rotate-90" />
            </button>
            <button 
              onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 p-2 lg:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 hover:opacity-100 lg:group-hover:opacity-100 transition-opacity hidden lg:flex"
            >
              <ChevronDown className="w-6 h-6 -rotate-90" />
            </button>
          </>
        )}

        <div className="container mx-auto px-4 lg:px-6 relative z-20 flex flex-col items-center justify-center lg:min-h-[70vh] pb-24 lg:pb-0">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 lg:space-y-6 text-center max-w-4xl mx-auto flex flex-col items-center w-full">
             <div className="space-y-1.5 lg:space-y-6 flex flex-col items-center">
                {assets?.heroBadge && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "whitespace-nowrap text-[9px] md:text-[12px] font-black tracking-[0.4em] px-3 md:px-6 py-1 md:py-2 uppercase shadow-[0_0_15px_rgba(var(--c-primary-rgb),0.1)]",
                      !(assets as any).heroBadgeColor && "bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20"
                    )}
                    style={(assets as any).heroBadgeColor ? { 
                      color: (assets as any).heroBadgeColor, 
                      borderColor: `${(assets as any).heroBadgeColor}40`, 
                      backgroundColor: `${(assets as any).heroBadgeColor}1A` 
                    } : undefined}
                  >
                     {assets.heroBadge}
                  </Badge>
                )}
                <h1 className={cn("text-3xl md:text-5xl lg:text-7xl font-black uppercase italic leading-[1] md:leading-[0.85] text-center drop-shadow-2xl", !(assets as any).heroTitle1Color && "text-[var(--c-text-primary)]")} style={(assets as any).heroTitle1Color ? { color: (assets as any).heroTitle1Color } : undefined}>
                   {assets?.heroTitle1 || 'Seafood'} <span className={(assets as any).heroTitle2Color ? "" : "text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-accent)]"} style={(assets as any).heroTitle2Color ? { color: (assets as any).heroTitle2Color } : undefined}>{assets?.heroTitle2 || 'Redefined.'}</span>
                </h1>
             </div>
             {assets?.heroSubtitle && (
               <p className={cn("text-[10px] md:text-2xl font-medium italic max-w-2xl mx-auto leading-relaxed px-1 md:px-4 drop-shadow-2xl text-shadow-glow", !(assets as any).heroSubtitleColor && "text-white")} style={(assets as any).heroSubtitleColor ? { color: (assets as any).heroSubtitleColor } : undefined}>
                  {assets.heroSubtitle}
               </p>
             )}
          </motion.div>
        </div>

        {/* Carousel Pagination Fish Icons */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-6 z-30 flex items-center gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroIndex(idx)}
                className="group transition-all duration-500"
              >
                <Fish 
                  className={cn(
                    "transition-all duration-500",
                    currentHeroIndex === idx 
                      ? "text-[var(--c-primary)] w-7 h-7 drop-shadow-[0_0_10px_var(--c-primary)] scale-110" 
                      : "text-white/60 w-5 h-5 group-hover:text-white group-hover:scale-105"
                  )} 
                />
              </button>
            ))}
          </div>
        )}

            {/* Embedded Timing Card (Mobile Only - Slim Banner at Bottom Right) */}
            <div className="block lg:hidden absolute bottom-4 right-4 z-40 w-auto max-w-[200px] pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "p-2.5 rounded-xl bg-[#0b0e14]/90 backdrop-blur-xl border flex flex-col gap-1.5 transition-all duration-300 w-full",
                  isStoreOpen && settings.ordersEnabled
                    ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                )}
              >
                {/* Top Row: Status and Hours */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full",
                      isStoreOpen && settings.ordersEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"
                    )} />
                    <p className={cn("text-[10px] font-black uppercase italic tracking-wider leading-none",
                      isStoreOpen && settings.ordersEnabled ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {isStoreOpen && settings.ordersEnabled ? "DELIVERY OPEN" : "PRE-ORDERS"}
                    </p>
                  </div>
                  <div className="text-[9px] font-bold text-white uppercase tracking-wider">
                    {formatTime12h(settings.ordersOpenTime || "09:00")} - {formatTime12h(settings.ordersCloseTime || "22:00")}
                  </div>
                </div>

                {/* Bottom Row: Details */}
                <div className="flex items-center justify-between w-full pt-1.5 border-t border-white/10">
                   {isStoreOpen && settings.ordersEnabled ? (
                      <span className="text-[8px] font-bold text-emerald-100/90 uppercase tracking-widest w-full text-center">
                        Fastest cold-chain delivery
                      </span>
                   ) : (
                      <div className="flex items-center justify-between w-full">
                         <span className="text-[8px] font-black text-amber-300/90 uppercase tracking-widest">Next Dispatch</span>
                         <span className="text-[8px] font-black text-white uppercase truncate">
                           {settings.ordersNextOpenText || "Tomorrow at 09:00 AM"}
                         </span>
                      </div>
                   )}
                </div>
              </motion.div>
            </div>
      </section>

      {/* MARITIME WAVE DIVIDER - MOBILE SPACED */}
      <div>
         <MaritimeWaveDivider />
      </div>



      {/* 4. CATEGORY VAULT (RIBBON TYPE) */}
      <section className="py-2 container mx-auto px-2 md:px-10 flex justify-center">
         <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 w-full max-w-7xl mx-auto border-y border-[var(--foreground)]/5 py-2">
            {(dynamicActiveCategories.length > 0 ? dynamicActiveCategories : CATEGORIES).map((cat, idx) => (
              <Link key={cat.name} href={`/customer/products?category=${cat.slug}`} className="w-[calc(20%-6px)] md:w-[calc(10%-8px)] min-w-[68px] max-w-[125px]">
                <div 
                   className="aspect-[1/1.5] md:aspect-square flex flex-col bg-[var(--c-bg-alt)]/20 relative overflow-hidden group hover:bg-[var(--c-bg-alt)]/40 transition-all border-r border-[var(--foreground)]/5 animate-underwater-float"
                   style={{ 
                     clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                     border: `0.5px solid ${cat.glowColor}40`,
                     boxShadow: `inset 0 0 20px ${cat.glowColor}20`,
                     animationDelay: `${(idx % 3) * 0.25}s`
                   }}
                >
                  {/* Floating Micro Telemetry Badge */}
                  {cat.badgeTag && (() => {
                    const bStyle = getBadgeStyle(cat.badgeTag);
                    return (
                      <div className={cn(
                        "absolute top-1 right-1 z-30 px-1.5 py-0.5 rounded-full border shadow-md flex items-center justify-center transition-all group-hover:scale-110",
                        bStyle.bg,
                        bStyle.border,
                        bStyle.glow
                      )}>
                        <span className={cn("text-[6.5px] md:text-[8.5px] font-black tracking-wider uppercase leading-none drop-shadow-sm", bStyle.text)}>
                          {cat.badgeTag}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Subtle Gradient Glow */}
                  <div className={cn("absolute inset-0 opacity-25 group-hover:opacity-45 transition-opacity bg-gradient-to-br", cat.color)} />
                  
                  {/* FIXED IMAGE/ICON AREA */}
                  <div className="flex-1 flex items-center justify-center relative z-10 pt-1">
                    <div 
                      className="w-12 h-12 md:w-24 md:h-24 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center overflow-hidden animate-breathing-zoom"
                      style={{ animationDelay: `${(idx % 3) * 0.25}s` }}
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,243,255,0.3)]" 
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
      <section className="py-2 container mx-auto px-4 md:px-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-1 mb-4">
            <SectionTitle 
              title="Today's Catch" 
              subtitle="Fresh from the Harbor" 
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
                  .map((catchItem, idx) => (
                  <React.Fragment key={catchItem.id}>
                     {(() => {
                        const matchingReel = activeReels.find(r => r.sort_order === idx + 1);
                        return matchingReel ? (
                           <OceanReelsFeed variant="grid-card" videoId={matchingReel.id} />
                        ) : null;
                     })()}
                     <motion.div 
                     key={catchItem.id} 
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
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14]/90 via-[#0b0e14]/30 to-transparent" />
                              
                              {/* Live Status Overlay */}
                              <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                 <Badge variant="glass" className="bg-emerald-500/90 text-[7px] font-black uppercase text-white border-none px-2 py-0.5 animate-pulse shadow-md">
                                    {catchItem.status}
                                 </Badge>
                                 <Badge variant="glass" className="bg-black/70 backdrop-blur-md text-[7px] font-black uppercase text-white border-white/10 px-2 py-0.5">
                                    {catchItem.batch_label} BATCH
                                 </Badge>
                              </div>

                              <div className="absolute top-2 right-2 z-20">
                                 <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-[var(--c-primary)] border border-white/10 shadow-lg">
                                    <Anchor className="w-4 h-4" />
                                 </div>
                              </div>

                              {/* Harbor Info */}
                              <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 shadow-lg">
                                    <MapPin className="w-2.5 h-2.5 text-[var(--c-primary)]" />
                                    <span className="text-[7px] font-black text-white uppercase truncate max-w-[80px]">{catchItem.harbor_node}</span>
                                 </div>
                              </div>
                              
                              {/* Stock Level */}
                              <div className="absolute bottom-2 right-2 z-20">
                                 <div className="flex flex-col items-end px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 shadow-lg">
                                    <p className="text-[7px] font-black text-white/70 uppercase">Stock</p>
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
                  </React.Fragment>
               ))}
            </div>
         ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[var(--foreground)]/5 rounded-3xl opacity-40">
               <Fish className="w-12 h-12 mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">No Fresh Catch in this sector</p>
            </div>
         )}
      </section>

      {/* 5. FEATURED PRODUCTS GRID */}
      <section className="py-1 container mx-auto px-[2px] md:px-10 mt-1">
         <div className="space-y-6">
            <SectionTitle title="Featured Seafood" subtitle="Highest Quality Grade" />
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
             {/* CHAMFERED CONTAINER WRAPPER FOR WEB */}
             <div 
                ref={bannerRef}
                className="relative min-h-[230px] md:min-h-[500px] bg-[var(--foreground)]/10 p-[1px] overflow-hidden shadow-2xl transition-all duration-300"
                style={{ clipPath: 'polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)' }}
             >
                <div 
                   className="w-full h-full min-h-[228px] md:min-h-[498px] bg-[var(--c-bg-alt)] relative overflow-hidden"
                   style={{ clipPath: 'polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)' }}
                >
                   {/* PANEL A (Top/Left Diagonal): Promo Title & Timer */}
                   <div 
                      className="absolute inset-0 z-20 p-4 md:p-16 flex flex-col justify-start items-start transition-all duration-500" 
                      style={{ 
                         clipPath: 'polygon(0px 0px, 100% 0px, 0px 100%)', 
                         background: 'linear-gradient(135deg, rgba(var(--c-bg-alt-rgb), 0.98) 0%, transparent 100%)' 
                      }}
                   >
                      {/* Festive Floating HUD Icons */}
                      <div className="absolute inset-0 pointer-events-none opacity-60">
                         {[
                            { Icon: PartyPopper, top: '2%', left: '75%', color: 'text-danger', delay: 0.2, size: 'w-6 h-6 md:w-16 md:h-16' },
                            { Icon: Gift, top: '20%', left: '55%', color: 'text-[var(--c-primary)]', delay: 0.5, size: 'w-6 h-6 md:w-12 md:h-12' },
                            { Icon: Crown, top: '40%', left: '35%', color: 'text-[var(--c-primary)]', delay: 1.0, size: 'w-10 h-10 md:w-20 md:h-20', rotate: -15 },
                            { Icon: Sparkles, top: '60%', left: '15%', color: 'text-[var(--foreground)]', delay: 1.5, size: 'w-4 h-4 md:w-10 md:h-10' },
                            { Icon: Timer, top: '10%', left: '45%', color: 'text-success', delay: 0.8, size: 'w-4 h-4 md:w-8 md:h-8' },
                            { Icon: Rocket, top: '35%', left: '70%', color: 'text-danger', delay: 1.2, size: 'w-5 h-5 md:w-10 md:h-10' },
                            { Icon: Star, top: '5%', left: '90%', color: 'text-warning', delay: 0.4, size: 'w-4 h-4 md:w-8 md:h-8' }
                         ].map((item, i) => (
                            <motion.div
                               key={i}
                               className={cn("absolute", item.color, item.size)}
                               style={{ top: item.top, left: item.left }}
                               initial={{ opacity: 0, y: 10, rotate: item.rotate || 0 }}
                               animate={{ 
                                  y: [0, -15, 0],
                                  rotate: [item.rotate || 0, (item.rotate || 0) + 10, item.rotate || 0],
                                  opacity: [0.4, 1, 0.4]
                               }}
                               transition={{ 
                                  y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                                  rotate: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                                  opacity: { duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                               }}
                            >
                               <item.Icon className="w-full h-full" />
                            </motion.div>
                         ))}
                      </div>

                      <div className="relative z-30 max-w-[85%] md:max-w-[70%]">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-1 text-[var(--c-primary)] mb-2 md:mb-4"
                        >
                          <Zap className="w-2.5 h-2.5 md:w-4 md:h-4 animate-pulse" />
                          <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em]">{settings.flashDealSector || 'Flash Product'} Live</span>
                        </motion.div>
                        
                        <div className="space-y-0.5 md:space-y-1 mb-4 md:mb-8">
                           <h3 className={cn("text-3xl md:text-5xl lg:text-7xl font-black text-[var(--c-text-primary)] uppercase leading-[0.85] tracking-tighter", settings.flashDealFont)}>
                              {settings.flashDealTitle || 'Flash Deals.'}
                           </h3>
                           <p className="text-[8px] md:text-xs text-[var(--c-text-secondary)] font-medium italic opacity-80 leading-tight tracking-[0.3em] mt-2">
                              {timerStatus === 'STARTS_IN' ? 'STARTS IN' : 'ENDS IN'}
                           </p>
                        </div>

                        <div className="flex gap-2 md:gap-4 justify-start">
                           {[timeLeft.hrs, timeLeft.min, timeLeft.sec].map((val, i) => (
                              <div key={i} className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-zinc-800 border border-[var(--c-primary)]/40 flex flex-col items-center justify-center text-center shrink-0 shadow-2xl">
                                 <p className="text-lg md:text-3xl font-black text-[var(--c-primary)] italic leading-none">{val}</p>
                                 <p className="text-[6px] md:text-[10px] font-black text-[var(--foreground)]/70 uppercase tracking-widest mt-1 leading-none">{i === 0 ? 'HRS' : i === 1 ? 'MIN' : 'SEC'}</p>
                              </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   {/* PANEL B (Bottom/Right Diagonal): Image Carousel & Cover */}
                   <div 
                      className="absolute inset-0 z-10 flex flex-col justify-end items-end p-4 md:p-16 transition-all duration-500 bg-[#020617] bg-contain bg-center bg-no-repeat"
                      style={{ 
                         clipPath: 'polygon(100% 0px, 100% 100%, 0px 100%)',
                         backgroundImage: settings.customerAssets?.promo 
                            ? `url("${settings.customerAssets.promo}")` 
                            : `url("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80")`,
                      }}
                   >
                      {/* Dark overlay to ensure carousel is visible over the cover image */}
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

                      <div className="relative z-30 w-full md:w-[80%] max-w-[600px] mt-auto">
                         <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 md:pb-4 hide-scrollbar justify-start md:justify-end pr-4 md:pr-0">
                            {settings.flashDealCarousel?.map((item, idx) => {
                               if (!item.image_url) return null;
                               return (
                                  <div key={idx} className="w-[160px] h-[100px] md:w-[320px] md:h-[220px] snap-center shrink-0 relative group/carousel ml-auto md:ml-0 flex-col flex items-center">
                                     
                                     {/* EXACT CUT CORNER BORDER WRAPPER */}
                                     <div 
                                        className="w-full h-full p-[1px] bg-[var(--c-primary)] shadow-[0_0_15px_var(--c-primary)] group-hover/carousel:bg-[var(--foreground)] transition-colors duration-500"
                                        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                                     >
                                         <div 
                                            className="w-full h-full bg-black relative overflow-hidden"
                                            style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                                         >
                                            <img src={item.image_url} className="w-full h-full object-contain group-hover/carousel:scale-105 transition-transform duration-700 opacity-90" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end justify-center pb-2 md:pb-4">
                                               <Link href={item.product_link || "#"}>
                                                  <Button 
                                                     className="h-6 md:h-10 px-4 md:px-8 bg-white text-[var(--c-primary)] text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                                                     style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                                                  >
                                                     View Details
                                                  </Button>
                                               </Link>
                                            </div>
                                         </div>
                                     </div>
                                  </div>
                               );
                            })}
                         </div>

                         {/* Fish Neon Glow Navigation Indicators */}
                         <div className="flex items-center justify-center md:justify-end gap-3 pt-2">
                             {settings.flashDealCarousel?.map((item, idx) => {
                                 if (!item.image_url) return null;
                                 return (
                                     <div key={`nav-${idx}`} className="text-[var(--c-primary)] opacity-80 hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_var(--c-primary)]">
                                         <Fish className="w-4 h-4 md:w-5 md:h-5" />
                                     </div>
                                 )
                             })}
                         </div>
                      </div>
                   </div>

                   {/* DYNAMIC PADDLE DIVIDER WITH FEATHER EFFECT */}
                   {bannerSize.width > 0 && (
                      <img 
                         src="/paddle.png" 
                         alt="Paddle Divider"
                         style={{
                           position: 'absolute',
                           width: '32px',
                           height: `${diagonalLength}px`,
                           left: '50%',
                           marginLeft: '-16px',
                           top: `${(h - diagonalLength) / 2}px`,
                           transform: `rotate(${rotationAngle})`,
                           transformOrigin: 'center center',
                           zIndex: 40,
                           pointerEvents: 'none',
                           objectFit: 'fill',
                           filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.55))',
                           opacity: 0.95
                         }}
                      />
                   )}
                </div>

                {/* Decorative Borders */}
                <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[var(--c-primary)] opacity-40"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[var(--c-primary)] opacity-40"></div>
             </div>
          </motion.section>
        )}
      </AnimatePresence>

      {(() => {
        const bannerReel = activeReels.find(r => r.description === 'banner');
        return bannerReel ? (
          <OceanReelsFeed variant="banner" videoId={bannerReel.id} />
        ) : null;
      })()}

      {/* 7. PREMIUM SELLERS - MAX-DENSITY MOBILE (2PX RULE) */}
      <section className="py-1 container mx-auto px-0 md:px-10 relative">
         <div className="mb-3 space-y-0.5 px-[2px] md:px-0">
            <h2 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Top Sellers</h2>
            <div className="h-[2px] w-16 bg-gradient-to-r from-[var(--c-text-primary)] to-[var(--c-primary)] mt-1.5 mb-3.5 rounded-full" />
            <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Verified Sellers</p>
         </div>
         
         <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible gap-[3px] md:gap-6 no-scrollbar pb-4 px-[2px] md:px-2 snap-x snap-mandatory scroll-pl-[2px] touch-pan-x">
            {(settings.topSellers || []).map((seller) => (
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
                  <h2 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Live Delivery Coverage</h2>
                  <div className="h-[2px] w-16 bg-gradient-to-r from-[var(--c-text-primary)] to-[var(--c-primary)] mt-1.5 mb-3.5 rounded-full" />
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

            <div className="relative group flex justify-center w-full mt-4">
               <div 
                  className="border text-text-primary transition-all hover:border-[var(--c-primary)]/30 w-full aspect-video md:aspect-[21/9] rounded-3xl border-2 border-[var(--c-primary)]/20 overflow-hidden shadow-2xl shadow-[var(--c-primary)]/10 relative"
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

                  {/* Enlarge Button */}
                  <button 
                    onClick={() => setIsMapExpanded(true)}
                    className="absolute bottom-6 right-6 z-40 bg-black/80 backdrop-blur-md border border-[var(--c-primary)]/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] hover:bg-[var(--c-primary)]/20 transition-all flex items-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    ENLARGE MAP
                  </button>
               </div>
            </div>

            {/* FULLSCREEN MAP OVERLAY */}
            <AnimatePresence>
               {isMapExpanded && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
                 >
                   <div className="w-full h-full max-h-[90vh] md:max-h-[85vh] relative rounded-3xl border-2 border-[var(--c-primary)]/40 overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                     <button 
                       onClick={() => setIsMapExpanded(false)}
                       className="absolute top-4 right-4 z-50 bg-black/80 backdrop-blur-md border border-red-500/40 p-3 rounded-full text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)]"
                     >
                       <X className="w-5 h-5" />
                     </button>
                     <AndamanMaritimeMap territories={territories} mapId="andaman-maritime-map-enlarged" />
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* 9. CUSTOMER REVIEWS - HARDENED HUD */}
      <section className="py-1 container mx-auto px-0 md:px-10">
         <div className="mb-4 space-y-0.5 px-[2px] md:px-0">
            <h2 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Customer Reviews</h2>
            <div className="h-[2px] w-16 bg-gradient-to-r from-[var(--c-text-primary)] to-[var(--c-primary)] mt-1.5 mb-3.5 rounded-full" />
            <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Verified Reviews</p>
         </div>
         
         <div className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible gap-1 md:gap-8 no-scrollbar pb-4 px-[2px] md:px-2 snap-x snap-mandatory scroll-pl-[2px] touch-pan-x">
            {(liveReviews.length > 0 ? liveReviews : FALLBACK_REVIEWS).map((rev: any) => {
               const displayName = rev.user_name || rev.user || 'Customer';
               const displayText = rev.comment || rev.text || '';
               const initials = displayName.split(' ').map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase();
               return (
               <div key={rev.id} className="relative flex-shrink-0 w-[240px] md:w-full group snap-start">
                  {/* Polygonal Background */}
                  <div 
                     className="absolute inset-0 bg-[var(--c-bg-alt)]/60 border border-[var(--foreground)]/5 transition-all group-hover:border-[var(--c-primary)]/40 group-hover:bg-[var(--c-bg-alt)]/80"
                     style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  />
                  <div className="relative z-10 p-4 space-y-3">
                     <div className="flex items-center gap-3">
                        <div 
                           className="w-10 h-10 border border-[var(--c-primary)]/20 overflow-hidden group-hover:border-[var(--c-primary)] transition-all flex-shrink-0"
                           style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                        >
                           {rev.image ? (
                             <img src={rev.image} className="w-full h-full object-cover" alt={displayName} />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--c-primary)]/30 to-[var(--c-primary)]/10">
                               <span className="text-[10px] font-black text-[var(--c-primary)]">{initials}</span>
                             </div>
                           )}
                        </div>
                        <div>
                           <p className="text-sm font-black text-[var(--c-text-primary)] italic leading-none">{displayName}</p>
                           <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-warning text-warning animate-pulse" />)}
                           </div>
                        </div>
                     </div>
                     <p className="text-xs text-[var(--c-text-secondary)] font-medium leading-relaxed italic opacity-80 line-clamp-3">"{displayText}"</p>
                  </div>
               </div>
               );
            })}
         </div>
      </section>

      {/* 10. CHEF'S RECIPES - HARDENED HUD TILES */}
      <section className="py-1 container mx-auto px-[2px] md:px-10">
         <div className="mb-4 flex justify-between items-end px-[2px] md:px-0">
            <div>
               <h2 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] tracking-tight uppercase italic">Chef's Recipes</h2>
               <div className="h-[2px] w-16 bg-gradient-to-r from-[var(--c-text-primary)] to-[var(--c-primary)] mt-1.5 mb-3.5 rounded-full" />
               <p className="text-[9px] md:text-[11px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.3em] italic opacity-60">Verified Recipes</p>
            </div>
            <button 
               onClick={() => router.push('/customer/recipes')}
               className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] border border-[var(--c-primary)]/20 rounded-xl bg-[var(--c-primary)]/5 hover:bg-[var(--c-primary)]/10 transition-all active:scale-95"
            >
               VIEW ALL ➜
            </button>
         </div>
         
         {/* Horizontal Scrolling Recipe Cards */}
         <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 md:gap-8 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {(cmsContent.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED').length > 0 
               ? cmsContent.filter(c => c.type === 'RECIPE' && c.status === 'PUBLISHED')
               : RECIPES).slice(0, 6).map((recipe: any) => {
               const meta = recipe.metadata ? (typeof recipe.metadata === 'string' ? JSON.parse(recipe.metadata) : recipe.metadata) : {};
               return (
               <div 
                  key={recipe.id} 
                  onClick={() => router.push(`/customer/recipes/${recipe.id}`)}
                  className="relative group cursor-pointer overflow-hidden shrink-0 snap-start w-[280px] h-[190px] md:w-[480px] md:h-[270px]"
                  style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
               >
                  <img src={recipe.image_url || ((meta.gallery && meta.gallery.length > 0) ? meta.gallery[0] : recipe.image)} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg)] via-[var(--c-bg)]/20 to-transparent" />
                  
                  {/* Decorative Scan Line */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--c-primary)] opacity-0 group-hover:opacity-40 transition-opacity animate-scan" />
                  
                  <div className="absolute bottom-3 left-3 right-3 space-y-1 md:bottom-10 md:left-10 md:right-10 md:space-y-4">
                     <div className="flex gap-1.5">
                        <Badge variant="glass" className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[7px] md:text-xs font-black uppercase px-2 py-0">{meta.difficulty || recipe.difficulty || 'Expert'}</Badge>
                        <Badge variant="glass" className="bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[7px] md:text-xs font-black uppercase px-2 py-0 text-[var(--foreground)]/60">{meta.time || recipe.time || '25 min'}</Badge>
                     </div>
                     <h4 className="text-xs md:text-4xl font-black text-[var(--foreground)] uppercase italic leading-tight">{recipe.title}</h4>
                     <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--c-primary)] opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                        VIEW RECIPE <ArrowRight className="w-3 h-3" />
                     </div>
                  </div>
               </div>
               );
            })}
         </div>
      </section>

      {/* 11. MOBILE APP PROMOTION - HARDENED SHELL */}
      <section className="py-1 container mx-auto px-[2px] md:px-10">
         <div 
            className="relative p-6 md:p-12 bg-gradient-to-br from-[var(--c-bg-alt)]/80 to-[var(--c-bg)] border border-[var(--foreground)]/5 shadow-premium overflow-hidden group"
            style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--c-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 items-center relative z-10">
               <div className="space-y-6">
                  <Badge variant="glass" className="text-[var(--c-primary)] text-[9px] font-black tracking-[0.3em] border-[var(--c-primary)]/30 bg-[var(--c-primary)]/10 px-4 py-1">OCEANFRESH MOBILE APP</Badge>
                  <h2 className="text-4xl md:text-8xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.85] tracking-tighter">The Market in <br /> Your Pocket.</h2>
                  <p className="text-xs md:text-lg text-[var(--c-text-secondary)] font-medium italic opacity-60 max-w-sm">Get our recipes and fresh catch updates right on your phone. Easy ordering, real-time order tracking.</p>
                  
                  <div className="flex flex-row gap-1 justify-center lg:justify-start">
                     <a 
                        href={settings.iosAppUrl || "#"}
                        target={settings.iosAppUrl ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="flex-1 h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 gap-3 flex items-center justify-center hover:bg-[var(--c-primary)]/20 transition-all group/btn"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                     >
                        <Smartphone className="w-5 h-5 text-[var(--c-primary)]" />
                        <div className="text-left">
                           <p className="text-[7px] font-black text-[var(--foreground)]/40 uppercase">Download</p>
                           <p className="text-[10px] font-black text-[var(--foreground)] italic">APP STORE</p>
                        </div>
                     </a>
                     <a 
                        href={settings.androidAppUrl || "https://expo.dev/artifacts/eas/V0UcN4l7sd_aNIkvVPpv-Px38kc6axrdHBsyeO0AsCc.apk"} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-14 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 gap-3 flex items-center justify-center hover:bg-[var(--c-primary)]/20 transition-all group/btn rounded-[--radius-button]"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                     >
                        <Play className="w-5 h-5 text-[var(--c-primary)]" />
                        <div className="text-left">
                           <p className="text-[7px] font-black text-[var(--foreground)]/40 uppercase">Download</p>
                           <p className="text-[10px] font-black text-[var(--foreground)] italic">GOOGLE PLAY</p>
                        </div>
                     </a>
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
      {showSplitPromo && (
         <section className="py-1 container mx-auto px-0 md:px-10 relative group">
            <div className="relative min-h-[230px] md:min-h-[500px] bg-[var(--c-bg-alt)] border border-[var(--foreground)]/5 overflow-hidden shadow-2xl">
               <div className="absolute inset-0">
                  {/* PANEL A: MARITIME GRILL MASTERS */}
                  <div 
                     className="absolute inset-0 z-25 p-4 md:p-16 flex flex-col justify-start items-start transition-all duration-500 overflow-hidden"
                     style={{ 
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                     }}
                  >
                     {/* Background Image */}
                     <div 
                        className="absolute inset-0 -z-20 bg-cover bg-center"
                        style={{ 
                           backgroundImage: `url(${promoDataParsed.panelA.image_url})`
                        }}
                     />
                     {/* Gradient Overlay */}
                     <div 
                        className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--c-bg-alt)]/90 via-[var(--c-bg-alt)]/40 to-transparent"
                     />

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
                              style={{ 
                                 top: item.top, 
                                 left: item.left,
                                 filter: "drop-shadow(0 0 10px currentColor)"
                              }}
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
                           <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em]">{promoDataParsed.panelA.subtitle}</span>
                        </motion.div>
                        <div className="space-y-0.5 md:space-y-1">
                           <h3 className="text-lg md:text-5xl font-black text-white uppercase italic leading-[0.85] tracking-tighter">
                              {renderSplitPromoTitle(promoDataParsed.panelA.title, "text-amber-400")}
                           </h3>
                           <p className="text-[8px] md:text-xs text-[var(--c-text-secondary)] font-medium italic opacity-80 leading-tight">
                              {promoDataParsed.panelA.tagline}
                           </p>
                        </div>
                        <Button 
                           onClick={() => router.push(promoDataParsed.panelA.link)}
                           className="h-6 md:h-10 px-3 md:px-6 mt-2 bg-white text-black hover:bg-white/90 text-[6px] md:text-[8px] font-black uppercase rounded-none"
                           style={{ clipPath: 'polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px)' }}
                        >
                           EXPLORE
                        </Button>
                     </div>
                  </div>

                  {/* PANEL B: FLAME-SEA COLLECTIONS */}
                  <div 
                     className="absolute inset-0 z-10 flex flex-col justify-end items-end p-4 md:p-16 transition-all duration-500 bg-[#020617] overflow-hidden"
                     style={{ 
                        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                     }}
                  >
                     {/* Background Image */}
                     <div 
                        className="absolute inset-0 -z-20 bg-cover bg-center"
                        style={{ 
                           backgroundImage: `url(${promoDataParsed.panelB.image_url})`
                        }}
                     />
                     {/* Gradient Overlay */}
                     <div 
                        className="absolute inset-0 -z-10 bg-gradient-to-tl from-[var(--c-bg-alt)]/95 via-[var(--c-bg-alt)]/50 to-transparent"
                     />

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
                              style={{ 
                                 bottom: item.bottom, 
                                 right: item.right,
                                 filter: "drop-shadow(0 0 10px currentColor)"
                              }}
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
                           className="text-[6px] md:text-[8px] font-black text-[#00d4ff] uppercase tracking-[0.3em]"
                        >
                           {promoDataParsed.panelB.subtitle}
                        </motion.p>
                        <h4 className="text-lg md:text-4xl font-black text-white uppercase italic leading-none drop-shadow-2xl">
                           {renderSplitPromoTitle(promoDataParsed.panelB.title, "text-[#00d4ff]")}
                        </h4>
                        <div className="h-0.5 w-8 md:w-20 bg-[var(--c-primary)] ml-auto shadow-[0_0_10px_var(--c-primary)] mb-2" />
                        <Button 
                           onClick={() => router.push(promoDataParsed.panelB.link)}
                           className="h-6 md:h-10 px-3 md:px-6 mt-2 border border-white/20 bg-black/40 hover:bg-black/60 text-white text-[6px] md:text-[8px] font-black uppercase rounded-none"
                           style={{ clipPath: 'polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px)' }}
                        >
                           EXPLORE
                        </Button>
                     </div>
                  </div>

                  {/* RGB Flash Diagonal Neon Divider */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <defs>
                        <linearGradient id="diagonalRgbDivider" x1="1" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#ff007f" />
                           <stop offset="50%" stopColor="#00f3ff" />
                           <stop offset="100%" stopColor="#ffaa00" />
                        </linearGradient>
                     </defs>
                     <line 
                        x1="100" 
                        y1="0" 
                        x2="0" 
                        y2="100" 
                        stroke="url(#diagonalRgbDivider)" 
                        strokeWidth="4" 
                        vectorEffect="non-scaling-stroke" 
                        style={{
                           filter: 'drop-shadow(0 0 3px #00f3ff) drop-shadow(0 0 8px #ff007f) drop-shadow(0 0 12px #ffaa00)'
                        }}
                     />
                  </svg>
                </div>

                {/* Corner Indicators */}
                <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[var(--c-primary)] opacity-40" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[var(--c-primary)] opacity-40" />
             </div>
          </section>
      )}

      {/* 12. TRUST & NEWSLETTER - VIBRANT & POLYGONAL */}
      <section className="py-1 container mx-auto px-[2px] md:px-10 space-y-4">
         <div className="grid grid-cols-4 gap-1 border-b border-[var(--foreground)]/5 pb-4">
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

      {(() => {
        const bannerReel = activeReels.find(r => r.description === 'banner-newsletter');
        return bannerReel ? (
          <OceanReelsFeed variant="banner" videoId={bannerReel.id} />
        ) : null;
      })()}

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
                    <p className="text-[10px] font-black text-[var(--c-primary)] uppercase tracking-widest animate-pulse">Loading Options...</p>
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
      <OceanReelsFeed variant="pip" />
    </div>
  );
}
